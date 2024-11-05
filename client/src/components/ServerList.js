import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import CreateRoom from './CreateRoom';

function ServerList({ onLogout }) {
  const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('http://stewdy.onrender.com/api/rooms');
        setRooms(response.data.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, []);

  const icons = {
    javascript: '🟡',
    python: '🔵',
    react: '⚛️',
    java: '☕',
    spring: '🌱',
    nodejs: '💚',
    etc: '📚'
  };

  return (
    <>
      <div className="w-[72px] h-screen bg-discord-tertiary flex flex-col items-center pt-3 space-y-2">
        {/* Home Button */}
        <Link
          to="/channels/@me"
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 
            ${location.pathname === '/channels/@me' 
              ? 'bg-discord-primary text-white' 
              : 'bg-discord-secondary text-discord-green hover:bg-discord-primary hover:text-white'} 
            transition-all duration-200`}
        >
          <span className="text-2xl">🏠</span>
        </Link>

        <div className="w-8 h-[2px] bg-discord-secondary rounded-full" />

        {/* Study Rooms */}
        <div className="flex-1 flex flex-col space-y-2 overflow-y-auto">
          {rooms.map(room => (
            <Link
              key={room._id}
              to={`/channels/${room._id}`}
              className={`w-12 h-12 rounded-full flex items-center justify-center 
                ${location.pathname.includes(room._id)
                  ? 'bg-discord-primary text-white rounded-2xl'
                  : 'bg-discord-secondary hover:bg-discord-primary hover:text-white hover:rounded-2xl'} 
                transition-all duration-200`}
            >
              <span className="text-2xl">{icons[room.category] || '📚'}</span>
            </Link>
          ))}
          
          {/* Add Room Button */}
          <button
            className="w-12 h-12 rounded-full bg-discord-secondary text-discord-green hover:bg-discord-green hover:text-white hover:rounded-2xl transition-all duration-200 flex items-center justify-center"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <span className="text-2xl">+</span>
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-12 h-12 mb-3 rounded-full bg-discord-secondary text-red-500 hover:bg-red-500 hover:text-white hover:rounded-2xl transition-all duration-200 flex items-center justify-center"
        >
          <span className="text-xl">⬅️</span>
        </button>
      </div>

      {/* Create Room Modal */}
      <CreateRoom 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </>
  );
}

export default ServerList;