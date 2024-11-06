import React, { useState } from 'react';

function ScreenShare() {
  const [isSharing, setIsSharing] = useState(false);
  const [stream, setStream] = useState(null);

  const startSharing = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      setIsSharing(true);

      // 새 창 열기
      const screenShareWindow = window.open('', '_blank', 'width=800,height=600');
      screenShareWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Screen Share</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                overflow: hidden;
                background: #36393f;
              }
              video {
                width: 100%;
                height: 100vh;
                object-fit: contain;
              }
              .control-bar {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.5);
                padding: 10px 20px;
                border-radius: 8px;
                display: flex;
                gap: 10px;
              }
              button {
                background: #5865F2;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
              }
              button:hover {
                background: #4752C4;
              }
              .stop {
                background: #ED4245;
              }
              .stop:hover {
                background: #C03537;
              }
            </style>
          </head>
          <body>
            <video autoplay playsinline></video>
            <div class="control-bar">
              <button onclick="window.close()" class="stop">화면 공유 종료</button>
            </div>
            <script>
              const video = document.querySelector('video');
              window.addEventListener('message', (event) => {
                if (event.data.type === 'stream') {
                  video.srcObject = event.data.stream;
                }
              });
              window.onunload = () => {
                if (video.srcObject) {
                  video.srcObject.getTracks().forEach(track => track.stop());
                }
              };
            </script>
          </body>
        </html>
      `);
      screenShareWindow.document.close();

      // 스트림 전달
      screenShareWindow.addEventListener('load', () => {
        screenShareWindow.postMessage({ type: 'stream', stream: mediaStream }, '*');
      });

      // 창이 닫힐 때 스트림 정리
      screenShareWindow.addEventListener('unload', () => {
        stopSharing();
      });

    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  };

  const stopSharing = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsSharing(false);
  };

  return (
    <button
      onClick={startSharing}
      className={`px-4 py-2 rounded ${
        isSharing 
          ? 'bg-red-500 hover:bg-red-600' 
          : 'bg-discord-primary hover:bg-discord-primary/90'
      } text-white transition-colors`}
    >
      {isSharing ? '화면 공유 중' : '화면 공유'}
    </button>
  );
}

export default ScreenShare;