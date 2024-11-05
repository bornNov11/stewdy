import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';

function ChannelList() {
  const [voiceUsers, setVoiceUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentRoom = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/rooms/current`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentRoom(response.data.data);
      } catch (error) {
        console.error('Error fetching current room:', error);
      }
    };
    fetchCurrentRoom();
  }, []);

  // 실시간 음성 채팅 참가자 업데이트 수신
  useEffect(() => {
    const socket = io(API_URL);
    socket.on('voiceUsers', (users) => {
      setVoiceUsers(users);
    });
    return () => socket.disconnect();
  }, []);

  const joinVoiceChannel = async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/rooms/${roomId}/voice/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/channels/${roomId}`);
    } catch (error) {
      console.error('Error joining voice channel:', error);
    }
  };

  return (
    <div className="w-60 h-screen bg-discord-secondary flex flex-col">
      {/* 채널 리스트 헤더 */}
      <div className="h-12 px-4 flex items-center shadow-md">
        <h1 className="text-white font-bold">
          {currentRoom?.name || 'Study Server'}
        </h1>
      </div>

      {/* 채널 목록 */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* 음성 채널 섹션 */}
        <div className="px-2 mb-4">
          <h2 className="text-discord-text text-xs font-semibold px-2 mb-2 uppercase">
            Voice Channels
          </h2>
          <div 
            className="cursor-pointer group px-2 py-1 rounded hover:bg-discord-bg"
            onClick={() => joinVoiceChannel(currentRoom?._id)}
          >
            <div className="flex items-center text-discord-text">
              <span className="mr-2">🔊</span>
              스터디룸
            </div>
            {/* 음성 채널 참가자 목록 */}
            <div className="ml-6 mt-1">
              {voiceUsers.map(user => (
                <div 
                  key={user._id} 
                  className="flex items-center text-discord-text text-sm py-1"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  {user.username}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 텍스트 채널 섹션 */}
        <div className="px-2">
          <h2 className="text-discord-text text-xs font-semibold px-2 mb-2 uppercase">
            Text Channels
          </h2>
          {/* 기존 텍스트 채널 코드 유지 */}
        </div>
      </div>
    </div>
  );
}

export default ChannelList;