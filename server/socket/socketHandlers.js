const Message = require('../models/Message');

module.exports = (io) => {
  // 활성 사용자 저장
  const activeUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // 방 참가
    socket.on('joinRoom', async (roomId) => {
      socket.join(roomId);
      
      // 이전 메시지 불러오기
      try {
        const messages = await Message.find({ room: roomId })
          .sort('-createdAt')
          .limit(50)
          .populate('user', 'username');
        
        socket.emit('previousMessages', messages.reverse());
        
        io.to(roomId).emit('userJoined', {
          userId: socket.id,
          message: 'New user joined the room'
        });
      } catch (error) {
        console.error('Error loading previous messages:', error);
      }
    });

    // 메시지 처리
    socket.on('chatMessage', async (data) => {
      const { roomId, message, username } = data;
      
      try {
        // 메시지 저장
        const newMessage = {
          roomId,
          username,
          message,
          timestamp: new Date()
        };
        
        // MongoDB에 메시지 저장
        await Message.create({
          room: roomId,
          user: socket.user,
          content: message
        });

        // 모든 참가자에게 메시지 전송
        io.to(roomId).emit('message', newMessage);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    // 방 나가기
    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
      io.to(roomId).emit('userLeft', {
        userId: socket.id,
        message: 'User left the room'
      });
    });

    // 연결 해제
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};