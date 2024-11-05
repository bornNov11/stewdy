import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
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

    // 소켓 연결
    const socket = io(API_URL);
    socket.on('voiceUsers', (users) => {
      setVoiceUsers(users);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinVoiceChannel = async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/rooms/${roomId}/voice/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // 음성 채팅 초기화 코드는 여기에...
    } catch (error) {
      console.error('Error joining voice channel:', error);
    }
  };

  return (
    <div className="w-60 h-screen bg-discord-secondary flex flex-col flex-none">
      <div className="h-12 px-4 flex items-center shadow-md border-b border-gray-800">
        <h1 className="text-white font-bold truncate">
          {currentRoom?.name || 'Study Server'}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-2">
        {/* 음성 채널 섹션 */}
        <div>
          <h2 className="text-discord-text uppercase text-xs font-semibold px-2 mb-1">
            Voice Channels
          </h2>
          <div 
            className="channel-group cursor-pointer"
            onClick={() => joinVoiceChannel(currentRoom?._id)}
          >
            <div className="flex items-center text-discord-text hover:bg-discord-bg rounded px-2 py-1">
              <span className="mr-1">🔊</span>
              <span>스터디룸</span>
            </div>
            {/* 음성 채널 참가자 */}
            <div className="ml-6 space-y-1">
              {voiceUsers.map(user => (
                <div 
                  key={user._id}
                  className="flex items-center text-discord-text text-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  <span className="truncate">{user.username}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 텍스트 채널 섹션 */}
        <div>
          <h2 className="text-discord-text uppercase text-xs font-semibold px-2 mb-1">
            Text Channels
          </h2>
          <div className="channel-group space-y-1">
            <div className="flex items-center text-discord-text hover:bg-discord-bg rounded px-2 py-1 cursor-pointer">
              <span className="mr-1">#</span>
              <span>일반</span>
            </div>
            <div className="flex items-center text-discord-text hover:bg-discord-bg rounded px-2 py-1 cursor-pointer">
              <span className="mr-1">#</span>
              <span>공지사항</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChannelList;