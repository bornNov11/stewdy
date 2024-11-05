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
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// mongoose 경고 해결
mongoose.set('strictQuery', false);

// 미들웨어 설정
app.use(cors());
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
        }
    });
    
    // ... 나머지 소켓 이벤트 핸들러는 그대로 유지
});

const PORT = process.env.PORT || 10000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

// 에러 핸들링
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});