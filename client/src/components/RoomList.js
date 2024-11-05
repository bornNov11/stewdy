import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';

function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/rooms`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRooms(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setError('스터디룸 목록을 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleJoinRoom = async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/rooms/${roomId}/join`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      navigate(`/channels/${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      setError('스터디룸 참가에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-discord-bg p-4">
        <div className="text-white">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-discord-bg p-4">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-discord-bg p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">스터디룸 목록</h2>
        <div className="grid gap-4">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-discord-secondary p-4 rounded-lg hover:bg-discord-secondary/90 transition-colors cursor-pointer"
              onClick={() => handleJoinRoom(room._id)}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {room.name}
                </h3>
                <span className="text-discord-text text-sm">
                  {room.category}
                </span>
              </div>
              <p className="text-discord-text mb-3">{room.description}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-discord-text">
                  참가자: {room.participants?.length || 0}/{room.maxParticipants}
                </span>
                <span className="text-discord-text">
                  호스트: {room.host?.username || 'Unknown'}
                </span>
              </div>
            </div>
          ))}
          {rooms.length === 0 && (
            <div className="text-center text-discord-text py-8">
              생성된 스터디룸이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomList;