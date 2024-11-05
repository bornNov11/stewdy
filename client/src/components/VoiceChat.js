import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import API_URL from '../config';

function VoiceChat({ roomId }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState([]);
  const socketRef = useRef();
  const peerConnectionsRef = useRef({});
  const localStreamRef = useRef();

  useEffect(() => {
    socketRef.current = io(API_URL, {
      withCredentials: true,
      query: { roomId }
    });

    // 음성 채팅 시작
    const startVoiceChat = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        setIsConnected(true);

        // 새로운 참가자가 입장했을 때
        socketRef.current.on('userJoinedVoice', async (userId) => {
          const peerConnection = createPeerConnection(userId);
          peerConnectionsRef.current[userId] = peerConnection;

          // 로컬 스트림 추가
          localStreamRef.current.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStreamRef.current);
          });

          // Offer 생성 및 전송
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          socketRef.current.emit('voiceOffer', {
            target: userId,
            caller: socketRef.current.id,
            sdp: offer
          });
        });

        // Offer 수신
        socketRef.current.on('voiceOffer', async ({ caller, sdp }) => {
          const peerConnection = createPeerConnection(caller);
          peerConnectionsRef.current[caller] = peerConnection;

          // 로컬 스트림 추가
          localStreamRef.current.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStreamRef.current);
          });

          await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          socketRef.current.emit('voiceAnswer', {
            target: caller,
            caller: socketRef.current.id,
            sdp: answer
          });
        });

        // Answer 수신
        socketRef.current.on('voiceAnswer', async ({ caller, sdp }) => {
          const peerConnection = peerConnectionsRef.current[caller];
          await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        });

        // ICE candidate 수신
        socketRef.current.on('iceCandidate', async ({ candidate, from }) => {
          const peerConnection = peerConnectionsRef.current[from];
          if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });

        // 참가자 퇴장
        socketRef.current.on('userLeftVoice', (userId) => {
          if (peerConnectionsRef.current[userId]) {
            peerConnectionsRef.current[userId].close();
            delete peerConnectionsRef.current[userId];
          }
          setParticipants(prev => prev.filter(p => p.id !== userId));
        });

        // 방 참가 알림
        socketRef.current.emit('joinVoiceRoom', roomId);
      } catch (error) {
        console.error('Error starting voice chat:', error);
      }
    };

    startVoiceChat();

    return () => {
      // 정리
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
      socketRef.current?.disconnect();
      setIsConnected(false);
    };
  }, [roomId]);

  const createPeerConnection = (userId) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // ICE candidate 생성시
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('iceCandidate', {
          target: userId,
          candidate: event.candidate
        });
      }
    };

    // 스트림 수신시
    peerConnection.ontrack = (event) => {
      const [stream] = event.streams;
      setParticipants(prev => [...prev, { id: userId, stream }]);
    };

    return peerConnection;
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  return (
    <div className="voice-chat-container p-4">
      <div className="controls mb-4 flex items-center space-x-4">
        <button
          onClick={() => setIsConnected(prev => !prev)}
          className={`px-4 py-2 rounded ${
            isConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          } text-white transition-colors`}
        >
          {isConnected ? '연결 끊기' : '연결하기'}
        </button>
        {isConnected && (
          <button
            onClick={toggleMute}
            className={`px-4 py-2 rounded ${
              isMuted ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors`}
          >
            {isMuted ? '음소거 해제' : '음소거'}
          </button>
        )}
      </div>

      <div className="participants">
        <h3 className="text-white mb-2">참가자 ({participants.length + 1})</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* 로컬 참가자 */}
          <div className="participant p-3 bg-discord-secondary rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-discord-primary flex items-center justify-center text-white mr-2">
                나
              </div>
              <span className="text-white">(나) {isMuted ? '🔇' : '🔊'}</span>
            </div>
          </div>
          {/* 원격 참가자들 */}
          {participants.map(participant => (
            <div key={participant.id} className="participant p-3 bg-discord-secondary rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-discord-primary flex items-center justify-center text-white mr-2">
                  {participant.id.slice(0, 2)}
                </div>
                <span className="text-white">🔊</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VoiceChat;