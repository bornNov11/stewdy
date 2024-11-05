import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
          headers: { Authorization: `Bearer ${token}` }
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
      // 스터디룸 참가 API 호출
      await axios.post(`${API_URL}/api/rooms/${roomId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // 성공하면 해당 룸으로 이동
      navigate(`/channels/${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      alert('스터디룸 참가에 실패했습니다.');
    }
  };

  if (loading) return <div className="flex-1 p-4 text-white">Loading...</div>;
  if (error) return <div className="flex-1 p-4 text-red-500">{error}</div>;

  return (
    <div className="flex-1 bg-discord-bg p-4">
      <h2 className="text-2xl font-bold text-white mb-4">스터디룸 목록</h2>
      <div className="grid gap-4">
        {rooms.map((room) => (
          <div
            key={room._id}
            className="bg-discord-secondary p-4 rounded-lg cursor-pointer hover:bg-discord-secondary/90"
            onClick={() => handleJoinRoom(room._id)}
          >
            <h3 className="text-xl font-semibold text-white mb-2">{room.name}</h3>
            <p className="text-discord-text mb-2">{room.description}</p>
            <div className="flex justify-between items-center text-sm text-discord-text">
              <span>참가자: {room.participants?.length || 0}/{room.maxParticipants}</span>
              <span className="bg-discord-primary/20 px-2 py-1 rounded">
                {room.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoomList;