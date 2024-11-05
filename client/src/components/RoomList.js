import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/rooms');
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

  if (loading) {
    return (
      <div className="flex-1 bg-discord-bg p-4">
        <div className="text-discord-text">로딩 중...</div>
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
    <div className="flex-1 bg-discord-bg p-4 overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-4">스터디룸 목록</h2>
      <div className="grid gap-4">
        {rooms.map((room) => (
          <div
            key={room._id}
            className="bg-discord-secondary rounded-lg p-4 hover:bg-discord-secondary/90 transition-colors"
          >
            <h3 className="text-xl font-semibold text-white mb-2">
              {room.name}
            </h3>
            <p className="text-discord-text mb-2">{room.description}</p>
            <div className="flex justify-between items-center text-sm text-discord-text">
              <span className="bg-discord-primary/20 px-2 py-1 rounded">
                {room.category}
              </span>
              <span>
                참가자: {room.participants.length} / {room.maxParticipants}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoomList;