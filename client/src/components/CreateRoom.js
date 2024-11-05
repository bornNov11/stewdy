import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateRoom({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'javascript',
    maxParticipants: 10
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/rooms',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Room created:', response.data);
      onClose();
      navigate(`/channels/${response.data.data._id}`);
    } catch (error) {
      setError(error.response?.data?.error || '스터디룸 생성 중 오류가 발생했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-discord-secondary rounded-lg w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-white mb-6">새로운 스터디룸 만들기</h2>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-discord-text text-sm font-medium mb-2">
              스터디룸 이름
            </label>
            <input
              type="text"
              className="w-full p-2 bg-discord-tertiary text-white rounded focus:outline-none focus:ring-2 focus:ring-discord-primary"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-discord-text text-sm font-medium mb-2">
              설명
            </label>
            <textarea
              className="w-full p-2 bg-discord-tertiary text-white rounded focus:outline-none focus:ring-2 focus:ring-discord-primary h-24"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-discord-text text-sm font-medium mb-2">
              카테고리
            </label>
            <select
              className="w-full p-2 bg-discord-tertiary text-white rounded focus:outline-none focus:ring-2 focus:ring-discord-primary"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="react">React</option>
              <option value="java">Java</option>
              <option value="spring">Spring</option>
              <option value="nodejs">Node.js</option>
              <option value="etc">기타</option>
            </select>
          </div>

          <div>
            <label className="block text-discord-text text-sm font-medium mb-2">
              최대 참가자 수
            </label>
            <input
              type="number"
              className="w-full p-2 bg-discord-tertiary text-white rounded focus:outline-none focus:ring-2 focus:ring-discord-primary"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
              min="2"
              max="50"
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
              만들기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRoom;