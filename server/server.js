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

const app = express();
const server = http.createServer(app);

// CORS 허용 도메인 설정
const allowedOrigins = [
    'http://localhost:3000',
    'https://stewdy.onrender.com'
];

// Socket.IO 설정
const io = socketIO(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// mongoose 경고 해결
mongoose.set('strictQuery', false);

// CORS 미들웨어 설정
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
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

// API 문서화
app.get('/api-docs', (req, res) => {
    res.json({
        endpoints: {
            auth: {
                login: 'POST /api/auth/login',
                register: 'POST /api/auth/register',
                me: 'GET /api/auth/me'
            },
            rooms: {
                list: 'GET /api/rooms',
                create: 'POST /api/rooms',
                getOne: 'GET /api/rooms/:id',
                join: 'POST /api/rooms/:id/join',
                leave: 'DELETE /api/rooms/:id/leave',
                voice: {
                    join: 'POST /api/rooms/:id/voice/join',
                    leave: 'DELETE /api/rooms/:id/voice/leave',
                    participants: 'GET /api/rooms/:id/voice/participants'
                }
            }
        }
    });
});

// Socket.IO 이벤트 처리
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    socket.on('joinRoom', async (roomId) => {
        try {
            const messages = await Message.find({ room: roomId })
                .sort({ createdAt: -1 })
                .limit(50)
                .populate('user', 'username');
            
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
        try {
            const { roomId, message, username } = data;
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

    // 음성 채팅 이벤트
    socket.on('joinVoice', (roomId) => {
        socket.join(`voice-${roomId}`);
        io.to(`voice-${roomId}`).emit('voiceUserJoined', socket.id);
    });

    socket.on('leaveVoice', (roomId) => {
        socket.leave(`voice-${roomId}`);
        io.to(`voice-${roomId}`).emit('voiceUserLeft', socket.id);
    });

    socket.on('disconnect', () => {
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