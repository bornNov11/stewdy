import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import API_URL from '../config';

function ChannelList() {
  const { serverId } = useParams();
  const [voiceUsers, setVoiceUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isInVoice, setIsInVoice] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const socketRef = useRef();

  useEffect(() => {
    // 현재 사용자 정보 가져오기
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(response.data.user);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    // 현재 방 정보 가져오기
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

    // 음성 채팅 참가자 목록 가져오기
    const fetchVoiceUsers = async () => {
      if (serverId && serverId !== '@me') {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API_URL}/api/rooms/${serverId}/voice/users`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setVoiceUsers(response.data.data);
          // 현재 사용자가 음성 채팅 참가자 목록에 있는지 확인
          setIsInVoice(response.data.data.some(user => user._id === currentUser?._id));
        } catch (error) {
          console.error('Error fetching voice users:', error);
        }
      }
    };

    fetchCurrentUser();
    fetchCurrentRoom();
    fetchVoiceUsers();

    // Socket.io 연결
    socketRef.current = io(API_URL);

    // Socket 이벤트 리스너 설정
    socketRef.current.on('user-joined-voice', (userData) => {
      console.log('User joined voice:', userData);
      setVoiceUsers(prev => [...prev, userData]);
    });

    socketRef.current.on('user-left-voice', (userId) => {
      console.log('User left voice:', userId);
      setVoiceUsers(prev => prev.filter(user => user._id !== userId));
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [serverId, currentUser]);

  const handleVoiceJoin = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/rooms/${serverId}/voice/join`, 
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setIsInVoice(true);
      
      // Socket 이벤트 발생
      socketRef.current.emit('join-voice', {
        roomId: serverId,
        userId: currentUser._id,
        username: currentUser.username
      });
    } catch (error) {
      console.error('Error joining voice channel:', error);
      setError('음성 채팅 참가에 실패했습니다.');
    }
  };

  const handleVoiceLeave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/rooms/${serverId}/voice/leave`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setIsInVoice(false);
      socketRef.current.emit('leave-voice', serverId);
    } catch (error) {
      console.error('Error leaving voice channel:', error);
      setError('음성 채팅 퇴장에 실패했습니다.');
    }
  };

  return (
    <div className="w-60 bg-discord-secondary flex-none flex flex-col">
      {/* 헤더 */}
      <div className="h-12 px-4 flex items-center shadow-sm bg-discord-bg border-b border-gray-800">
        <h2 className="text-white font-bold">
          {serverId === '@me' ? 'HOME' : currentRoom?.name || 'Loading...'}
        </h2>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="px-4 py-2 bg-red-500 text-white text-sm">
          {error}
        </div>
      )}

      {/* 채널 목록 */}
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
                onClick={isInVoice ? handleVoiceLeave : handleVoiceJoin}
              >
                <span className="mr-1">🔊</span>
                <span>스터디룸</span>
                {isInVoice && <span className="ml-2 text-green-500">●</span>}
              </div>
              {/* Voice participants */}
              {voiceUsers.length > 0 && (
                <div className="ml-6 space-y-1">
                  {voiceUsers.map(user => (
                    <div 
                      key={user._id}
                      className="flex items-center text-discord-text text-sm"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                      <span>{user.username}</span>
                      {user.isScreenSharing && (
                        <button
                          onClick={() => window.open(`/screen-share/${user._id}`, '_blank')}
                          className="ml-2 text-discord-text hover:text-white"
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