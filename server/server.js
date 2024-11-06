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

// 환경변수 설정
dotenv.config();

// CORS 허용 도메인 설정
const allowedOrigins = [
    'http://localhost:3000',
    'https://stewdy.onrender.com'
];

const app = express();
const server = http.createServer(app);

// Socket.IO 설정
const io = socketIO(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
        transports: ['websocket', 'polling']
    },
    allowEIO3: true
});

// mongoose 경고 해결
mongoose.set('strictQuery', false);

// CORS 미들웨어 설정
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected successfully'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// 기본 라우트
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Study Platform API is running',
    });
});

// API 라우트
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Socket.IO 연결된 사용자 관리
const connectedUsers = new Map();
const roomVoiceUsers = new Map();

// Socket.IO 이벤트 처리
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    socket.on('join-voice', async (data) => {
        try {
            const { roomId, userId, username } = data;
            console.log('User joining voice:', { roomId, userId, username });

            const userInfo = { socketId: socket.id, userId, username };
            
            // 음성 채팅방 참가자 관리
            if (!roomVoiceUsers.has(roomId)) {
                roomVoiceUsers.set(roomId, new Map());
            }
            roomVoiceUsers.get(roomId).set(userId, userInfo);

            // 소켓 룸 참가
            socket.join(`voice-${roomId}`);

            // 현재 참가자 목록 가져오기
            const participants = Array.from(roomVoiceUsers.get(roomId).values());

            // 새 참가자 정보를 다른 사용자들에게 전송
            socket.to(`voice-${roomId}`).emit('user-joined-voice', userInfo);
            
            // 새 참가자에게 현재 참가자 목록 전송
            socket.emit('voice-users-list', participants);

        } catch (error) {
            console.error('Error in join-voice:', error);
        }
    });

    socket.on('leave-voice', (data) => {
        const { roomId, userId } = data;
        console.log('User leaving voice:', { roomId, userId });

        if (roomVoiceUsers.has(roomId)) {
            roomVoiceUsers.get(roomId).delete(userId);
            socket.leave(`voice-${roomId}`);
            io.to(`voice-${roomId}`).emit('user-left-voice', userId);
        }
    });

    socket.on('joinRoom', async (roomId) => {
        try {
            if (roomId === '@me') {
                socket.join(roomId);
                socket.emit('previousMessages', []);
                return;
            }

            const messages = await Message.find({ room: roomId })
                .sort({ timestamp: -1 })
                .limit(50);
            
            socket.join(roomId);
            socket.emit('previousMessages', messages.reverse());
            io.to(roomId).emit('userActivity', {
                type: 'join',
                message: '새로운 사용자가 입장했습니다.',
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error in joinRoom:', error);
        }
    });

    socket.on('chatMessage', async (data) => {
        const { roomId, message, username } = data;
        if (roomId === '@me') return;

        try {
            const newMessage = new Message({
                room: roomId,
                content: message,
                username: username,
                timestamp: new Date()
            });
            await newMessage.save();

            io.to(roomId).emit('message', {
                id: newMessage._id,
                username: username,
                message: message,
                timestamp: newMessage.timestamp
            });
        } catch (error) {
            console.error('Error in chatMessage:', error);
        }
    });

    socket.on('leaveRoom', (roomId) => {
        socket.leave(roomId);
        io.to(roomId).emit('userActivity', {
            type: 'leave',
            message: '사용자가 퇴장했습니다.',
            timestamp: new Date()
        });
    });

    socket.on('disconnect', () => {
        // 연결이 끊긴 사용자가 참여중이던 음성 채팅방에서 제거
        roomVoiceUsers.forEach((users, roomId) => {
            users.forEach((user, userId) => {
                if (user.socketId === socket.id) {
                    users.delete(userId);
                    io.to(`voice-${roomId}`).emit('user-left-voice', userId);
                }
            });
        });

        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 10000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Server Error',
        message: err.message
    });
});

// 404 처리 미들웨어
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        requestedUrl: req.originalUrl,
        availableEndpoints: {
            auth: ['POST /api/auth/login', 'POST /api/auth/register', 'GET /api/auth/me'],
            rooms: ['GET /api/rooms', 'POST /api/rooms', 'GET /api/rooms/:id']
        }
    });
});