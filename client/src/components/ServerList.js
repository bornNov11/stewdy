import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CreateRoom from './CreateRoom';

function ServerList({ setIsAuthenticated }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <>
      <div className="w-[72px] h-screen bg-discord-tertiary flex flex-col items-center pt-3">
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

        <div className="w-8 h-[2px] bg-discord-secondary rounded-full mb-2" />

        {/* Create Room Button */}
        <button
          className="w-12 h-12 rounded-full bg-discord-secondary text-discord-green hover:bg-discord-green hover:text-white hover:rounded-2xl transition-all duration-200 flex items-center justify-center"
          onClick={() => setShowCreateModal(true)}
        >
          <span className="text-2xl">+</span>
        </button>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-12 h-12 mb-3 rounded-full bg-discord-secondary text-red-500 hover:bg-red-500 hover:text-white hover:rounded-2xl transition-all duration-200 flex items-center justify-center"
        >
          <span className="text-xl">⬅️</span>
        </button>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoom 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)} 
        />
      )}
    </>
  );
}

export default ServerList;