import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function ServerList() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
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

      {/* Add Server Button */}
      <button
        className="w-12 h-12 rounded-full bg-discord-secondary text-discord-green hover:bg-discord-green hover:text-white hover:rounded-2xl transition-all duration-200 flex items-center justify-center"
        onClick={() => navigate('/create-room')}
      >
        <span className="text-2xl">+</span>
      </button>
    </div>
  );
}

export default ServerList;