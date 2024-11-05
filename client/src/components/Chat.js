import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import API_URL from '../config';

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
        const response = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    const fetchRoom = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/rooms/${serverId}`);
        setRoom(response.data.data);
      } catch (error) {
        console.error('Error fetching room:', error);
      }
    };

    fetchUser();
    fetchRoom();

    socketRef.current = io(API_URL);
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
    <div className="flex flex-col h-full bg-discord-bg">
      {/* 채팅방 헤더 */}
      <div className="h-12 min-h-[48px] px-4 flex items-center shadow-sm bg-discord-bg border-b border-gray-800">
        <span className="text-discord-text mr-2">#</span>
        <h2 className="text-white font-bold">{room?.name || 'Loading...'}</h2>
      </div>

      {/* 메시지 목록 - 스크롤 영역 */}
      <div 
        ref={messageListRef}
        className="flex-1 overflow-y-auto px-4 py-2"
        style={{ 
          height: 'calc(100vh - 120px)',
          overflowY: 'auto',
          scrollBehavior: 'smooth'
        }}
      >
        <div className="space-y-4 mb-4">
          {messages.map((msg, index) => (
            <div 
              key={msg.id || index} 
              className="flex items-start group hover:bg-discord-secondary/50 p-2 rounded"
            >
              {msg.type === 'activity' ? (
                <div className="text-center w-full text-discord-text text-sm py-2 bg-discord-secondary/30 rounded">
                  {msg.message}
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-discord-primary mr-4 flex-shrink-0 flex items-center justify-center">
                    {msg.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline">
                      <span className="font-medium text-white mr-2">
                        {msg.username || 'Anonymous'}
                      </span>
                      <span className="text-xs text-discord-text">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-discord-text break-words">
                      {msg.content || msg.message}
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 메시지 입력 폼 - 하단에 고정 */}
      <div className="px-4 py-4 bg-discord-bg border-t border-gray-800">
        <form onSubmit={handleSubmit} className="flex items-center bg-discord-tertiary rounded-lg">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message #${room?.name || ''}`}
            className="flex-1 bg-transparent px-4 py-3 text-discord-text focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-discord-primary text-white rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 mx-1"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;