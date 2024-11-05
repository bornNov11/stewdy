import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register({ setIsAuthenticated }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'mentee'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      navigate('/channels/@me');
    } catch (error) {
      setError(error.response?.data?.error || '회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-discord-bg p-4">
      <div className="bg-discord-secondary p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-white text-center mb-8">계정 만들기</h2>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-discord-text text-sm font-medium mb-2">
              사용자명
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-2 bg-discord-tertiary text-discord-text rounded focus:outline-none focus:ring-2 focus:ring-discord-primary"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-discord-text text-sm font-medium mb-2">
              이메일
              <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full p-2 bg-discord-tertiary text-discord-text rounded focus:outline-none focus:ring-2 focus:ring-discord-primary"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-discord-text text-sm font-medium mb-2">
              비밀번호
              <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="w-full p-2 bg-discord-tertiary text-discord-text rounded focus:outline-none focus:ring-2 focus:ring-discord-primary"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-discord-text text-sm font-medium mb-2">
              비밀번호 확인
              <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="w-full p-2 bg-discord-tertiary text-discord-text rounded focus:outline-none focus:ring-2 focus:ring-discord-primary"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-discord-text text-sm font-medium mb-2">
              역할
            </label>
            <select
              className="w-full p-2 bg-discord-tertiary text-discord-text rounded focus:outline-none focus:ring-2 focus:ring-discord-primary"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="mentee">멘티</option>
              <option value="mentor">멘토</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-discord-primary text-white py-2 px-4 rounded hover:bg-opacity-90 transition-colors"
          >
            가입하기
          </button>
        </form>

        <p className="mt-4 text-discord-text text-sm text-center">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-discord-primary hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;