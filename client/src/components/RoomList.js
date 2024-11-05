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
        console.log('Fetching rooms...'); // 디버깅용
        const response = await axios.get(`${API_URL}/api/rooms`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });
        console.log('Rooms data:', response.data); // 디버깅용
        setRooms(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching rooms:', error.response || error);
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
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
        <div className="text-white text-center">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-discord-bg p-4">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-discord-bg">
      <div className="p-4">
        <h2 className="text-2xl font-bold text-white mb-4">스터디룸 목록</h2>
        <div className="grid gap-4">
          {rooms && rooms.length > 0 ? (
            rooms.map((room) => (
              <div
                key={room._id}
                className="bg-discord-secondary p-4 rounded-lg hover:bg-discord-secondary/90 transition-colors cursor-pointer"
                onClick={() => handleJoinRoom(room._id)}
              >
                <h3 className="text-xl font-semibold text-white mb-2">
                  {room.name}
                </h3>
                <p className="text-discord-text mb-2">{room.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-discord-text">
                    멘토: {room.host?.username || 'Unknown'}
                  </span>
                  <span className="text-discord-text">
                    참가자: {room.participants?.length || 0} / {room.maxParticipants}
                  </span>
                </div>
                {room.category && (
                  <span className="inline-block mt-2 px-2 py-1 bg-discord-primary/20 text-discord-text rounded text-sm">
                    {room.category}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="text-discord-text text-center py-4">
              생성된 스터디룸이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomList;