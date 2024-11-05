const Room = require('../models/Room');

// 모든 스터디룸 조회
exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find()
            .populate('host', 'username email')
            .populate('participants', 'username email');

        res.status(200).json({
            success: true,
            data: rooms
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// 특정 스터디룸 조회
exports.getRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id)
            .populate('host', 'username email')
            .populate('participants', 'username email');

        if (!room) {
            return res.status(404).json({
                success: false,
                error: '해당 스터디룸을 찾을 수 없습니다'
            });
        }

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// 현재 접속 중인 스터디룸 조회
exports.getCurrentRoom = async (req, res) => {
    try {
        const room = await Room.findOne({
            participants: req.user._id
        }).populate('host', 'username email')
          .populate('participants', 'username email');

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// 스터디룸 생성
exports.createRoom = async (req, res) => {
    try {
        req.body.host = req.user._id;
        const room = await Room.create(req.body);
        room.participants.push(req.user._id);
        await room.save();

        const populatedRoom = await Room.findById(room._id)
            .populate('host', 'username email')
            .populate('participants', 'username email');

        res.status(201).json({
            success: true,
            data: populatedRoom
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// 스터디룸 참가
exports.joinRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                error: '해당 스터디룸을 찾을 수 없습니다'
            });
        }

        if (room.participants.includes(req.user._id)) {
            return res.status(400).json({
                success: false,
                error: '이미 참가한 스터디룸입니다'
            });
        }

        if (room.participants.length >= room.maxParticipants) {
            return res.status(400).json({
                success: false,
                error: '스터디룸이 가득 찼습니다'
            });
        }

        room.participants.push(req.user._id);
        await room.save();

        const populatedRoom = await Room.findById(req.params.id)
            .populate('host', 'username email')
            .populate('participants', 'username email');

        res.status(200).json({
            success: true,
            data: populatedRoom
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// 스터디룸 나가기
exports.leaveRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                error: '해당 스터디룸을 찾을 수 없습니다'
            });
        }

        room.participants = room.participants.filter(
            participant => participant.toString() !== req.user._id.toString()
        );
        
        await room.save();

        const populatedRoom = await Room.findById(req.params.id)
            .populate('host', 'username email')
            .populate('participants', 'username email');

        res.status(200).json({
            success: true,
            data: populatedRoom
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// 음성 채팅 참가자 목록 조회
exports.getVoiceUsers = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id)
            .populate('voiceParticipants', 'username email');

        res.status(200).json({
            success: true,
            data: room.voiceParticipants || []
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// 음성 채팅 참가
exports.joinVoiceRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        
        if (!room) {
            return res.status(404).json({
                success: false,
                error: '해당 스터디룸을 찾을 수 없습니다'
            });
        }

        if (!room.voiceParticipants) {
            room.voiceParticipants = [];
        }

        if (!room.voiceParticipants.includes(req.user._id)) {
            room.voiceParticipants.push(req.user._id);
            await room.save();
        }

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// 음성 채팅 나가기
exports.leaveVoiceRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        
        if (room && room.voiceParticipants) {
            room.voiceParticipants = room.voiceParticipants.filter(
                id => id.toString() !== req.user._id.toString()
            );
            await room.save();
        }

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};