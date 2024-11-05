const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: '이 라우트에 접근하기 위해서는 로그인이 필요합니다'
            });
        }

        try {
            // 토큰 검증
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

            // 사용자 정보 가져오기
            req.user = await User.findById(decoded.id);
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                error: '유효하지 않은 토큰입니다'
            });
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};