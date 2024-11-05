const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const Message = require('./models/Message');

// 환경변수 설정
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// mongoose 경고 해결
mongoose.set('strictQuery', false);

// 미들웨어 설정
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
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

// 기본 라우트 (홈페이지)
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Study Platform API',
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

// API 라우트
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// 프로덕션 환경에서 정적 파일 제공
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}

// 소켓 이벤트 처리
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

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!',
        message: err.message
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});