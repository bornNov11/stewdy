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
  const [isVoiceChannel, setIsVoiceChannel] = useState(false);
  const messageListRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // 현재 채널이 보이스 채널인지 확인
    const checkChannelType = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/channels/${serverId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsVoiceChannel(response.data.data.type === 'voice');
      } catch (error) {
        console.error('Error checking channel type:', error);
      }
    };
    checkChannelType();
  }, [serverId]);

  // ... 기존의 다른 useEffect와 함수들 ...

  return (
    <div className="flex flex-col h-screen bg-discord-bg">
      {/* 채팅방 헤더 */}
      <div className="h-12 min-h-[48px] px-4 flex items-center shadow-sm bg-discord-bg border-b border-gray-800 flex-shrink-0">
        <span className="text-discord-text mr-2">
          {isVoiceChannel ? '🔊' : '#'}
        </span>
        <h2 className="text-white font-bold">{room?.name || 'Loading...'}</h2>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isVoiceChannel ? (
          // 보이스 채널 UI
          <div className="flex-1 p-4">
            <VoiceChat roomId={serverId} />
          </div>
        ) : (
          // 텍스트 채널 UI
          <>
            {/* 화면 공유 섹션 */}
            <div className="screen-share-section p-4 border-b border-gray-800">
              <ScreenShare />
            </div>

            {/* 메시지 목록 */}
            <div 
              ref={messageListRef}
              className="flex-1 overflow-y-auto px-4 py-2"
            >
              <div className="space-y-4">
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
          </>
        )}

        {/* 메시지 입력 폼 */}
        {!isVoiceChannel && (
          <div className="px-4 py-4 bg-discord-bg border-t border-gray-800 flex-shrink-0">
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
        )}
      </div>
    </div>
  );
}

export default Chat;