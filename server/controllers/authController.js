const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT 토큰 생성
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '30d'
    });
};

// 회원가입
exports.register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // 사용자 생성
        const user = await User.create({
            username,
            email,
            password,
            role
        });

        // 토큰 생성
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// 로그인
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 이메일과 비밀번호 체크
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: '이메일과 비밀번호를 입력해주세요'
            });
        }

        // 사용자 찾기
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: '유효하지 않은 이메일입니다'
            });
        }

        // 비밀번호 확인
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: '유효하지 않은 비밀번호입니다'
            });
        }

        // 토큰 생성
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// 현재 사용자 정보 조회
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};