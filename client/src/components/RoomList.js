import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [password, setPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
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

  const handleJoinRoom = async (room) => {
    setSelectedRoom(room);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/rooms/${selectedRoom._id}/join`,
        { password },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setShowPasswordModal(false);
      setPassword('');
      navigate(`/channels/${selectedRoom._id}`);
    } catch (error) {
      setError(error.response?.data?.error || '스터디룸 참가에 실패했습니다.');
    }
  };

  const PasswordModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-discord-secondary p-6 rounded-lg w-96">
        <h3 className="text-xl text-white font-bold mb-4">비밀번호 입력</h3>
        <form onSubmit={handlePasswordSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 bg-discord-tertiary text-white rounded focus:outline-none"
            placeholder="비밀번호를 입력하세요"
            required
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setShowPasswordModal(false);
                setPassword('');
              }}
              className="px-4 py-2 bg-discord-secondary text-white rounded hover:bg-opacity-80"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-discord-primary text-white rounded hover:bg-opacity-80"
            >
              참가
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading) return <div className="text-white p-4">로딩 중...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="p-4">
      {showPasswordModal && <PasswordModal />}
      <div className="grid gap-4">
        {rooms.map((room) => (
          <div
            key={room._id}
            className="bg-discord-secondary p-4 rounded-lg hover:bg-discord-secondary/90 transition-all cursor-pointer"
            onClick={() => handleJoinRoom(room)}
          >
            <h3 className="text-xl font-semibold text-white mb-2">{room.name}</h3>
            <p className="text-discord-text mb-2">{room.description}</p>
            <div className="flex justify-between text-discord-text text-sm">
              <span>참가자: {room.participants?.length || 0}/{room.maxParticipants}</span>
              <span>호스트: {room.host?.username || 'Unknown'}</span>
            </div>
            {room.category && (
              <span className="inline-block mt-2 px-2 py-1 bg-discord-primary/20 text-discord-text rounded text-sm">
                {room.category}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoomList;