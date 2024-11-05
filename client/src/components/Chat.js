// import React, { useState, useEffect, useRef } from 'react';
// import { useParams } from 'react-router-dom';
// import io from 'socket.io-client';
// import axios from 'axios';
// import API_URL from '../config';
// import ScreenShare from './ScreenShare';
// import VoiceChat from './VoiceChat';

// function Chat() {
//   const { serverId } = useParams();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [room, setRoom] = useState(null);
//   const [user, setUser] = useState(null);
//   const [isVoiceActive, setIsVoiceActive] = useState(false);
//   const messageListRef = useRef(null);
//   const socketRef = useRef(null);

//   const scrollToBottom = () => {
//     if (messageListRef.current) {
//       const scrollHeight = messageListRef.current.scrollHeight;
//       const height = messageListRef.current.clientHeight;
//       const maxScrollTop = scrollHeight - height;
//       messageListRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
//     }
//   };

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await axios.get(`${API_URL}/api/auth/me`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setUser(response.data.user);
//       } catch (error) {
//         console.error('Error fetching user:', error);
//       }
//     };

//     const fetchRoom = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await axios.get(`${API_URL}/api/rooms/${serverId}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setRoom(response.data.data);
//       } catch (error) {
//         console.error('Error fetching room:', error);
//       }
//     };

//     fetchUser();
//     fetchRoom();

//     socketRef.current = io(API_URL, {
//       withCredentials: true
//     });
    
//     socketRef.current.emit('joinRoom', serverId);

//     socketRef.current.on('previousMessages', (previousMessages) => {
//       setMessages(previousMessages);
//       setTimeout(scrollToBottom, 100);
//     });

//     socketRef.current.on('message', (message) => {
//       setMessages((prevMessages) => [...prevMessages, message]);
//       setTimeout(scrollToBottom, 100);
//     });

//     socketRef.current.on('userActivity', (activity) => {
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         {
//           id: Date.now(),
//           type: 'activity',
//           message: activity.message,
//           timestamp: new Date()
//         }
//       ]);
//       setTimeout(scrollToBottom, 100);
//     });

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.emit('leaveRoom', serverId);
//         socketRef.current.disconnect();
//       }
//     };
//   }, [serverId]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (newMessage.trim() && user) {
//       const messageData = {
//         roomId: serverId,
//         message: newMessage,
//         username: user.username
//       };
//       socketRef.current.emit('chatMessage', messageData);
//       setNewMessage('');
//     }
//   };

//   const toggleVoiceChat = () => {
//     setIsVoiceActive(!isVoiceActive);
//   };

//   return (
//     <div className="flex flex-col h-full min-h-0 bg-discord-bg">
//       {/* 채팅방 헤더 */}
//       <div className="flex-shrink-0 h-12 px-4 flex items-center justify-between border-b border-gray-800">
//         <div className="flex items-center">
//           <span className="text-discord-text mr-2">#</span>
//           <h2 className="text-white font-bold">{room?.name || 'Loading...'}</h2>
//         </div>
//         <div className="flex items-center space-x-4">
//           <button
//             onClick={toggleVoiceChat}
//             className={`px-3 py-1 rounded ${
//               isVoiceActive ? 'bg-red-500' : 'bg-discord-primary'
//             } text-white hover:bg-opacity-90`}
//           >
//             {isVoiceActive ? '음성 채팅 종료' : '음성 채팅 시작'}
//           </button>
//           <ScreenShare />
//         </div>
//       </div>

//       {/* 메인 콘텐츠 영역 */}
//       <div className="flex-grow flex flex-col min-h-0">
//         {/* 음성 채팅 활성화 시 표시될 영역 */}
//         {isVoiceActive && (
//           <div className="h-20 bg-discord-secondary border-b border-gray-800 p-4">
//             <VoiceChat roomId={serverId} />
//           </div>
//         )}

//         {/* 메시지 목록 */}
//         <div 
//           ref={messageListRef}
//           className="flex-grow overflow-y-auto px-4 py-2 min-h-0"
//         >
//           {messages.map((msg, index) => (
//             <div 
//               key={msg.id || index} 
//               className="flex items-start group hover:bg-discord-secondary/50 p-2 rounded mb-2"
//             >
//               {msg.type === 'activity' ? (
//                 <div className="text-center w-full text-discord-text text-sm py-2 bg-discord-secondary/30 rounded">
//                   {msg.message}
//                 </div>
//               ) : (
//                 <>
//                   <div className="w-10 h-10 rounded-full bg-discord-primary mr-4 flex-shrink-0 flex items-center justify-center">
//                     {msg.username?.[0]?.toUpperCase() || '?'}
//                   </div>
//                   <div className="flex-grow min-w-0">
//                     <div className="flex items-baseline">
//                       <span className="font-medium text-white mr-2">
//                         {msg.username || 'Anonymous'}
//                       </span>
//                       <span className="text-xs text-discord-text">
//                         {new Date(msg.timestamp).toLocaleTimeString()}
//                       </span>
//                     </div>
//                     <p className="text-discord-text break-words">
//                       {msg.content || msg.message}
//                     </p>
//                   </div>
//                 </>
//               )}
//             </div>
//           ))}
//         </div>

//         {/* 메시지 입력 영역 */}
//         <div className="flex-shrink-0 p-4 border-t border-gray-800">
//           <form onSubmit={handleSubmit} className="flex items-center bg-discord-tertiary rounded-lg">
//             <input
//               type="text"
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               placeholder={`Message #${room?.name || ''}`}
//               className="flex-grow bg-transparent px-4 py-2 text-discord-text focus:outline-none"
//             />
//             <button
//               type="submit"
//               disabled={!newMessage.trim()}
//               className="px-4 py-2 bg-discord-primary text-white rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90"
//             >
//               Send
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Chat;
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import API_URL from '../config';
import ScreenShare from './ScreenShare';
import VoiceChat from './VoiceChat';

function Chat() {
  const { serverId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const messageListRef = useRef(null);
  const socketRef = useRef(null);

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
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/rooms/${serverId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRoom(response.data.data);
      } catch (error) {
        console.error('Error fetching room:', error);
      }
    };

    fetchUser();
    fetchRoom();

    socketRef.current = io(API_URL, {
      withCredentials: true
    });
    
    socketRef.current.emit('joinRoom', serverId);

    socketRef.current.on('previousMessages', (previousMessages) => {
      setMessages(previousMessages);
      setTimeout(scrollToBottom, 100);
    });

    socketRef.current.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      setTimeout(scrollToBottom, 100);
    });

    socketRef.current.on('userActivity', (activity) => {
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
      socketRef.current.emit('chatMessage', messageData);
      setNewMessage('');
    }
  };

  const toggleVoiceChat = () => {
    setIsVoiceActive(!isVoiceActive);
  };

  return (
    <div className="flex flex-col h-full bg-discord-bg">
      {/* 채팅방 헤더 */}
      <div className="flex-shrink-0 h-12 px-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center">
          <span className="text-discord-text mr-2">#</span>
          <h2 className="text-white font-bold">{room?.name || 'Loading...'}</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleVoiceChat}
            className={`px-3 py-1 rounded ${
              isVoiceActive ? 'bg-red-500' : 'bg-discord-primary'
            } text-white hover:bg-opacity-90`}
          >
            {isVoiceActive ? '음성 채팅 종료' : '음성 채팅 시작'}
          </button>
          <ScreenShare />
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-grow grid grid-cols-3 min-h-0">
        {/* 음성 채팅 활성화 시 표시될 영역 */}
        {isVoiceActive && (
          <div className="col-span-3 h-20 bg-discord-secondary border-b border-gray-800 p-4">
            <VoiceChat roomId={serverId} />
          </div>
        )}

        {/* 메시지 목록 */}
        <div
          ref={messageListRef}
          className="col-span-2 flex-grow overflow-y-auto px-4 py-2 min-h-0"
        >
          {/* 메시지 목록 내용 */}
        </div>

        {/* 메시지 입력 영역 */}
        <div className="col-span-3 flex-shrink-0 p-4 border-t border-gray-800">
          <form onSubmit={handleSubmit} className="flex items-center bg-discord-tertiary rounded-lg">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message #${room?.name || ''}`}
              className="flex-grow bg-transparent px-4 py-2 text-discord-text focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-discord-primary text-white rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;