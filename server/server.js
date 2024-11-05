const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const Message = require('./models/Message');
const connectDB = require('./config/database');

// 환경변수 설정
dotenv.config();

// Express 앱 설정
const app = express();
const server = http.createServer(app);

// CORS 설정 - render.com 배포 환경 고려
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-frontend-domain.com'] // 프론트엔드 도메인으로 변경
        : '*',
    methods: ['GET', 'POST'],
    credentials: true
};

// Socket.IO 설정
const io = socketIO(server, {
    cors: corsOptions
});

// 미들웨어 설정
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB 연결
connectDB();

// 연결 상태 모니터링
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected! Attempting to reconnect...');
    connectDB();
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// 상태 확인 엔드포인트
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Server is running',
        mongoConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// 기본 라우트
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API is running'
    });
});

// 소켓 연결 처리
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    socket.on('joinRoom', async (roomId) => {
        try {
            const messages = await Message.find({ room: roomId })
                .sort({ timestamp: -1 })
                .limit(50);
            
            socket.emit('previousMessages', messages.reverse());
            socket.join(roomId);
            
            io.to(roomId).emit('userActivity', {
                type: 'join',
                message: '새로운 사용자가 입장했습니다.',
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error loading messages:', error);
            socket.emit('error', { message: 'Failed to load messages' });
        }
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
    
    // ... 나머지 소켓 이벤트 핸들러는 그대로 유지
});

// 포트 설정
const PORT = process.env.PORT || 10000;

// 서버 시작
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});

// 전역 에러 핸들링
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 예기치 않은 에러 처리
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});