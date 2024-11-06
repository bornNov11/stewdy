const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getRooms,
    getRoom,
    createRoom,
    joinRoom,
    leaveRoom,
    getCurrentRoom,
    joinVoiceRoom,
    leaveVoiceRoom,
    getVoiceUsers
} = require('../controllers/roomController');

// 기본 라우트
router.route('/')
    .get(getRooms)
    .post(protect, createRoom);

// 현재 룸 조회
router.get('/current', protect, getCurrentRoom);

// 참가 여부 확인 라우트 추가
router.get('/:id/check-participation', protect, roomController.checkParticipation);

// 음성 채팅 관련 라우트
router.route('/:id/voice')
    .get(getVoiceUsers)
    .post(protect, joinVoiceRoom)
    .delete(protect, leaveVoiceRoom);

// 특정 룸 관련 라우트
router.route('/:id')
    .get(getRoom)
    .post(protect, joinRoom)
    .delete(protect, leaveRoom);

module.exports = router;