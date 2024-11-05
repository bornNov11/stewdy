import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import API_URL from '../config';

function ScreenShare() {
  const { serverId } = useParams();
  const [isSharing, setIsSharing] = useState(false);
  const [viewers, setViewers] = useState([]);
  const localVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionsRef = useRef({});

  useEffect(() => {
    socketRef.current = io(API_URL, {
      withCredentials: true
    });

    // 시그널링 처리
    socketRef.current.on('userJoinedScreenShare', async (userId) => {
      const peerConnection = createPeerConnection(userId);
      peerConnectionsRef.current[userId] = peerConnection;

      if (isSharing) {
        const stream = localVideoRef.current.srcObject;
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });
      }
    });

    socketRef.current.on('ice-candidate', ({ userId, candidate }) => {
      const peerConnection = peerConnectionsRef.current[userId];
      if (peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socketRef.current.on('offer', async ({ userId, description }) => {
      const peerConnection = peerConnectionsRef.current[userId];
      await peerConnection.setRemoteDescription(new RTCSessionDescription(description));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socketRef.current.emit('answer', { userId, description: answer });
    });

    socketRef.current.on('answer', ({ userId, description }) => {
      const peerConnection = peerConnectionsRef.current[userId];
      if (peerConnection) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(description));
      }
    });

    return () => {
      stopSharing();
      socketRef.current.disconnect();
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    };
  }, [serverId]);

  const createPeerConnection = (userId) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', {
          userId,
          candidate: event.candidate
        });
      }
    };

    peerConnection.ontrack = (event) => {
      const [stream] = event.streams;
      setViewers(prev => [...prev, { userId, stream }]);
    };

    return peerConnection;
  };

  const startSharing = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      localVideoRef.current.srcObject = stream;
      setIsSharing(true);
      socketRef.current.emit('startScreenShare', { roomId: serverId });

      // 스트림 종료 처리
      stream.getVideoTracks()[0].onended = () => {
        stopSharing();
      };
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  };

  const stopSharing = () => {
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }
    setIsSharing(false);
    socketRef.current.emit('stopScreenShare', { roomId: serverId });
  };

  return (
    <div className="screen-share-container">
      <div className="controls mb-4">
        <button
          onClick={isSharing ? stopSharing : startSharing}
          className={`px-4 py-2 rounded ${
            isSharing 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-discord-primary hover:bg-opacity-90'
          } text-white transition-colors`}
        >
          {isSharing ? '화면 공유 중지' : '화면 공유 시작'}
        </button>
      </div>

      <div className="video-container">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`local-video ${isSharing ? 'block' : 'hidden'} w-full rounded-lg shadow-lg`}
        />
        
        {viewers.map(({ userId, stream }) => (
          <video
            key={userId}
            autoPlay
            playsInline
            className="remote-video w-full rounded-lg shadow-lg mt-4"
            ref={element => {
              if (element) element.srcObject = stream;
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default ScreenShare;