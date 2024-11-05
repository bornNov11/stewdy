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

// MongoDB URI 확인
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
}

const app = express();
const server = http.createServer(app);

// Socket.IO CORS 설정
const io = socketIO(server, {
    cors: {
        origin: ["https://stewdy.onrender.com", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// mongoose 경고 해결
mongoose.set('strictQuery', false);

// CORS 설정
app.use(cors({
    origin: ["https://stewdy.onrender.com", "http://localhost:3000"],
    credentials: true
}));

app.use(express.json());

// MongoDB 연결
console.log('Attempting to connect to MongoDB...');
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB Connected successfully');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// 기본 라우트
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                getMe: 'GET /api/auth/me'
            },
            rooms: {
                getAllRooms: 'GET /api/rooms',
                createRoom: 'POST /api/rooms',
                getRoom: 'GET /api/rooms/:id',
                joinRoom: 'POST /api/rooms/:id',
                leaveRoom: 'DELETE /api/rooms/:id'
            }
        }
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
        }
    });
    
    socket.on('chatMessage', async (data) => {
        const { roomId, message, username } = data;
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
                room: roomId,
                username: username,
                message: message,
                timestamp: newMessage.timestamp
            });
        } catch (error) {
            console.error('Error saving message:', error);
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
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 10000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!',
        message: err.message
    });
});

// 404 처리 미들웨어
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        availableEndpoints: {
            base: 'GET /',
            auth: 'POST /api/auth/login, POST /api/auth/register',
            rooms: 'GET /api/rooms, GET /api/rooms/:id'
        }
    });
});