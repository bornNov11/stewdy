import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

function JoinRoomModal({ isOpen, onClose, room }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/rooms/${room._id}/join`, 
        { password },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      onClose();
      navigate(`/channels/${room._id}`);
    } catch (error) {
      console.error('Error joining room:', error.response || error);
      setError(error.response?.data?.error || '참가 중 오류가 발생했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-discord-secondary rounded-lg w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-white mb-6">스터디룸 참가</h2>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-discord-text text-sm font-medium mb-2">
              비밀번호
              <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="w-full p-2 bg-discord-tertiary text-white rounded focus:outline-none focus:ring-2 focus:ring-discord-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-discord-text hover:text-white transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-discord-primary text-white rounded hover:bg-opacity-90 transition-colors"
            >
              참가하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JoinRoomModal;