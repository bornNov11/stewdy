import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';

function Login({ setIsAuthenticated }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, formData, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setIsAuthenticated(true);
        navigate('/channels/@me');
      }
    } catch (error) {
      setError(error.response?.data?.error || '로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-discord-bg">
      <div className="bg-discord-secondary p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-white text-center mb-8">돌아오신 것을 환영합니다!</h2>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
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

          <div className="mb-6">
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

          <button
            type="submit"
            className="w-full bg-discord-primary text-white py-2 px-4 rounded hover:bg-opacity-90 transition-colors"
          >
            로그인
          </button>
        </form>

        <p className="mt-4 text-discord-text text-sm text-center">
          계정이 필요한가요?{' '}
          <Link to="/register" className="text-discord-primary hover:underline">
            가입하기
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;