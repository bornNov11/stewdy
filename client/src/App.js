import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ServerList from './components/ServerList';
import ChannelList from './components/ChannelList';
import RoomList from './components/RoomList';
import Chat from './components/Chat';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={<Login setIsAuthenticated={setIsAuthenticated} />} 
          />
          <Route 
            path="/register" 
            element={<Register setIsAuthenticated={setIsAuthenticated} />} 
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex h-screen overflow-hidden">
        <ServerList setIsAuthenticated={setIsAuthenticated} />
        <ChannelList />
        <Routes>
          <Route path="/channels/@me" element={<RoomList />} />
          <Route path="/channels/:serverId" element={<Chat />} />
          <Route path="*" element={<Navigate to="/channels/@me" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;