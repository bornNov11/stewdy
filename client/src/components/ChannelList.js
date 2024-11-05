import React from 'react';
import { Link, useParams } from 'react-router-dom';

function ChannelList({ isDM = false }) {
  const { serverId } = useParams();
  
  // 임시 채널 목록 (나중에 API로 대체)
  const channels = isDM ? [
    { id: '1', name: '일반', type: 'text' },
    { id: '2', name: '스터디-일정', type: 'text' },
  ] : [
    { id: '1', name: '공지사항', type: 'text' },
    { id: '2', name: '일반', type: 'text' },
    { id: '3', name: '질문-답변', type: 'text' },
    { id: '4', name: '스터디룸', type: 'voice' },
  ];

  return (
    <div className="w-60 h-screen bg-discord-secondary flex flex-col">
      {/* Header */}
      <div className="h-12 px-4 flex items-center shadow-md">
        <h1 className="text-white font-bold">
          {isDM ? 'Direct Messages' : 'Study Server'}
        </h1>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Text Channels */}
        <div className="mb-4">
          <div className="flex items-center text-xs font-semibold text-discord-text uppercase px-2 mb-1">
            <span>Text Channels</span>
            <button className="ml-auto text-discord-text hover:text-discord-header">+</button>
          </div>
          {channels.filter(ch => ch.type === 'text').map(channel => (
            <Link
              key={channel.id}
              to={`/channels/${serverId}/${channel.id}`}
              className="flex items-center px-2 py-1 rounded text-discord-text hover:bg-discord-bg group"
            >
              <span className="text-discord-muted group-hover:text-discord-text mr-1">#</span>
              {channel.name}
            </Link>
          ))}
        </div>

        {/* Voice Channels */}
        {!isDM && (
          <div>
            <div className="flex items-center text-xs font-semibold text-discord-text uppercase px-2 mb-1">
              <span>Voice Channels</span>
              <button className="ml-auto text-discord-text hover:text-discord-header">+</button>
            </div>
            {channels.filter(ch => ch.type === 'voice').map(channel => (
              <div
                key={channel.id}
                className="flex items-center px-2 py-1 rounded text-discord-text hover:bg-discord-bg cursor-pointer"
              >
                <span className="text-discord-muted mr-1">🔊</span>
                {channel.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Panel */}
      <div className="h-13 px-2 flex items-center bg-discord-tertiary">
        <div className="w-8 h-8 rounded-full bg-discord-primary mr-2"></div>
        <div>
          <div className="text-sm font-medium text-white">Username</div>
          <div className="text-xs text-discord-text">#0000</div>
        </div>
      </div>
    </div>
  );
}

export default ChannelList;