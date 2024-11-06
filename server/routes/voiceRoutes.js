const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// 음성 채팅 참가자 목록 조회
router.get('/:roomId/voice/users', protect, async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId)
            .populate('voiceParticipants', 'username email');
        res.json({ success: true, data: room.voiceParticipants });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 음성 채팅 참가
router.post('/:roomId/voice/join', protect, async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId);
        if (!room) {
            return res.status(404).json({ success: false, error: '방을 찾을 수 없습니다.' });
        }
        
        if (!room.voiceParticipants.includes(req.user._id)) {
            room.voiceParticipants.push(req.user._id);
            await room.save();
        }
        
        res.json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 음성 채팅 나가기
router.delete('/:roomId/voice/leave', protect, async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId);
        if (!room) {
            return res.status(404).json({ success: false, error: '방을 찾을 수 없습니다.' });
        }
        
        room.voiceParticipants = room.voiceParticipants.filter(
            id => id.toString() !== req.user._id.toString()
        );
        await room.save();
        
        res.json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;