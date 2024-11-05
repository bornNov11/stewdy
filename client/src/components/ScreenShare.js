import React, { useState } from 'react';

function ScreenShare() {
  const [isSharing, setIsSharing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [stream, setStream] = useState(null);

  const startSharing = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      setIsSharing(true);
      setShowModal(true);
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const stopSharing = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsSharing(false);
    setShowModal(false);
  };

  const ShareModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-discord-secondary p-6 rounded-lg w-[80vw] max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl text-white font-bold">화면 공유</h3>
          <button
            onClick={stopSharing}
            className="text-discord-text hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="relative" style={{ paddingBottom: '56.25%' }}>
          <video
            className="absolute inset-0 w-full h-full rounded-lg"
            ref={video => {
              if (video && stream) {
                video.srcObject = stream;
                video.play();
              }
            }}
            autoPlay
            muted
          />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <button
        onClick={isSharing ? stopSharing : startSharing}
        className={`px-4 py-2 rounded ${
          isSharing 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-discord-primary hover:bg-discord-primary/90'
        } text-white transition-colors`}
      >
        {isSharing ? '화면 공유 중지' : '화면 공유 시작'}
      </button>
      {showModal && <ShareModal />}
    </div>
  );
}

export default ScreenShare;