import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

function Chat() {
  const { serverId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const messageListRef = useRef(null);
  const socketRef = useRef();

  const scrollToBottom = () => {
    if (messageListRef.current) {
      const scrollHeight = messageListRef.current.scrollHeight;
      const height = messageListRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      messageListRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    const fetchRoom = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/rooms/${serverId}`);
        setRoom(response.data.data);
      } catch (error) {
        console.error('Error fetching room:', error);
      }
    };

    fetchUser();
    fetchRoom();

    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('joinRoom', serverId);

    socketRef.current.on('previousMessages', (previousMessages) => {
      console.log('Received previous messages:', previousMessages);
      setMessages(previousMessages);
      setTimeout(scrollToBottom, 100);
    });

    socketRef.current.on('message', (message) => {
      console.log('Received new message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
      setTimeout(scrollToBottom, 100);
    });

    socketRef.current.on('userActivity', (activity) => {
      console.log('User activity:', activity);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          type: 'activity',
          message: activity.message,
          timestamp: new Date()
        }
      ]);
      setTimeout(scrollToBottom, 100);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveRoom', serverId);
        socketRef.current.disconnect();
      }
    };
  }, [serverId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      const messageData = {
        roomId: serverId,
        message: newMessage,
        username: user.username
      };
      console.log('Sending message:', messageData);
      socketRef.current.emit('chatMessage', messageData);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col w-full h-screen bg-discord-bg">
      {/* 채팅방 헤더 */}
      <div className="flex-none h-12 px-4 flex items-center shadow-sm bg-discord-bg border-b border-gray-800">
        <span className="text-discord-text mr-2">#</span>
        <h2 className="text-white font-bold">{room?.name || 'Loading...'}</h2>
      </div>

      {/* 메시지 목록 컨테이너 */}
      <div className="flex-1 overflow-hidden"> 
        <div 
          ref={messageListRef}
          className="h-full overflow-y-auto px-4"
          style={{ paddingBottom: '1rem' }}
        >
          {messages.map((msg, index) => (
            <div 
              key={msg.id || index} 
              className="mt-4 first:mt-4 hover:bg-discord-secondary/50 p-2 rounded-lg"
            >
              {msg.type === 'activity' ? (
                <div className="text-center text-discord-text text-sm py-2 bg-discord-secondary/30 rounded-md">
                  {msg.message}
                </div>
              ) : (
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-discord-primary flex-shrink-0 flex items-center justify-center">
                    {msg.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-baseline">
                      <span className="font-medium text-white">
                        {msg.username || 'Anonymous'}
                      </span>
                      <span className="ml-2 text-xs text-discord-text">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-discord-text mt-1 break-words">
                      {msg.content || msg.message}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 메시지 입력 폼 */}
      <div className="flex-none p-4 bg-discord-bg">
        <form onSubmit={handleSubmit} className="flex items-center">
          <div className="flex-1 bg-discord-tertiary rounded-lg">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message #${room?.name || ''}`}
              className="w-full px-4 py-3 bg-transparent text-discord-text focus:outline-none rounded-lg"
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="ml-4 px-6 py-3 bg-discord-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;