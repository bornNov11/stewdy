import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';

function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
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
      
      // 먼저 참가 여부 확인
      const checkResponse = await axios.get(`${API_URL}/api/rooms/${roomId}/check-participation`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (checkResponse.data.isParticipant) {
        // 이미 참가 중이면 바로 입장
        navigate(`/channels/${roomId}`);
      } else {
        // 참가 중이 아니면 비밀번호 모달 표시
        setSelectedRoom({id: roomId});
        setShowPasswordModal(true);
      }
    } catch (error) {
      console.error('Error checking room participation:', error);
      setError('스터디룸 참가 확인에 실패했습니다.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/rooms/${selectedRoom.id}/join`, 
        { password },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setShowPasswordModal(false);
      setPassword('');
      navigate(`/channels/${selectedRoom.id}`);
    } catch (error) {
      setError(error.response?.data?.error || '스터디룸 참가에 실패했습니다.');
    }
  };

  const PasswordModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-discord-secondary p-6 rounded-lg w-96">
        <h3 className="text-xl text-white font-bold mb-4">비밀번호 입력</h3>
        {error && (
          <div className="bg-red-500 text-white p-2 rounded mb-4">
            {error}
          </div>
        )}
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
                setError('');
              }}
              className="px-4 py-2 bg-discord-tertiary text-white rounded hover:bg-opacity-80"
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

  if (loading) {
    return (
      <div className="flex-1 bg-discord-bg p-4">
        <div className="text-white">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-discord-bg p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">스터디룸 목록</h2>
        {error && !showPasswordModal && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}
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
      {showPasswordModal && <PasswordModal />}
    </div>
  );
}

export default RoomList;