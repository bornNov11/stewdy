import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import API_URL from '../config';

function ChannelList() {
  const [voiceUsers, setVoiceUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const { serverId } = useParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCurrentRoom = async () => {
      if (serverId && serverId !== '@me') {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API_URL}/api/rooms/${serverId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentRoom(response.data.data);
        } catch (error) {
          console.error('Error fetching room:', error);
          setError('스터디룸 정보를 불러오는데 실패했습니다.');
        }
      }
    };

    fetchCurrentRoom();

    // 소켓 연결 설정
    const socket = io(API_URL);
    
    socket.on('voiceUserJoined', (userData) => {
      setVoiceUsers(prev => [...prev, userData]);
    });

    socket.on('voiceUserLeft', (userId) => {
      setVoiceUsers(prev => prev.filter(user => user.id !== userId));
    });

    return () => socket.disconnect();
  }, [serverId]);

  const handleVoiceJoin = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/rooms/${serverId}/voice/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // 서버에서 성공 응답을 받으면 소켓 이벤트를 통해 voiceUsers가 업데이트됨
    } catch (error) {
      console.error('Error joining voice channel:', error);
      setError('음성 채널 참가에 실패했습니다.');
    }
  };

  const handleVoiceLeave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/rooms/${serverId}/voice/leave`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // 서버에서 성공 응답을 받으면 소켓 이벤트를 통해 voiceUsers가 업데이트됨
    } catch (error) {
      console.error('Error leaving voice channel:', error);
      setError('음성 채널 퇴장에 실패했습니다.');
    }
  };

  return (
    <div className="w-60 bg-discord-secondary flex-none flex flex-col">
      <div className="h-12 px-4 flex items-center shadow-sm bg-discord-bg border-b border-gray-800">
        <h2 className="text-white font-bold">
          {serverId === '@me' ? 'HOME' : currentRoom?.name || 'Loading...'}
        </h2>
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-500 text-white text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 p-2">
        {/* Voice Channels */}
        {serverId !== '@me' && (
          <div>
            <h3 className="text-discord-text uppercase text-xs font-semibold px-2 mb-1">
              Voice Channels
            </h3>
            <div className="channel-group">
              <div 
                className="flex items-center text-discord-text hover:bg-discord-bg rounded px-2 py-1 cursor-pointer"
                onClick={handleVoiceJoin}
              >
                <span className="mr-1">🔊</span>
                <span>스터디룸</span>
              </div>
              {/* Voice participants */}
              {voiceUsers.length > 0 && (
                <div className="ml-6 space-y-1">
                  {voiceUsers.map(user => (
                    <div 
                      key={user.id}
                      className="flex items-center text-discord-text text-sm group"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                      <span>{user.username}</span>
                      {user.isScreenSharing && (
                        <button
                          onClick={() => window.open(`/screen-share/${user.id}`, '_blank')}
                          className="ml-2 opacity-0 group-hover:opacity-100 text-discord-text hover:text-white"
                        >
                          📺
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Text Channels */}
        <div>
          <h3 className="text-discord-text uppercase text-xs font-semibold px-2 mb-1">
            Text Channels
          </h3>
          <div 
            className="flex items-center text-discord-text hover:bg-discord-bg rounded px-2 py-1 cursor-pointer"
          >
            <span className="mr-1">#</span>
            <span>일반</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChannelList;