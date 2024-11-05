const Room = require('../models/Room');

// 스터디룸 생성
exports.createRoom = async (req, res) => {
    try {
        const { name, description, category, maxParticipants } = req.body;
        
        // 스터디룸 생성
        const room = await Room.create({
            name,
            description,
            category,
            maxParticipants,
            host: req.user._id,
            participants: [req.user._id] // 생성자를 첫 참가자로 추가
        });

        // 생성된 룸 정보를 반환하기 전에 상세 정보를 포함하여 조회
        const populatedRoom = await Room.findById(room._id)
            .populate('host', 'username email')
            .populate('participants', 'username email');

        res.status(201).json({
            success: true,
            data: populatedRoom
        });
    } catch (error) {
        console.error('Room creation error:', error);
        res.status(400).json({
            success: false,
            error: error.message || '스터디룸 생성 중 오류가 발생했습니다.'
        });
    }
};

// 모든 스터디룸 조회
exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find()
            .populate('host', 'username email')
            .populate('participants', 'username email');

        res.status(200).json({
            success: true,
            count: rooms.length,
            data: rooms
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || '스터디룸 목록을 불러오는데 실패했습니다.'
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
            error: error.message || '스터디룸을 불러오는데 실패했습니다.'
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

        // 이미 참가한 사용자인지 확인
        if (room.participants.includes(req.user._id)) {
            return res.status(400).json({
                success: false,
                error: '이미 참가한 스터디룸입니다'
            });
        }

        // 최대 참가자 수 확인
        if (room.participants.length >= room.maxParticipants) {
            return res.status(400).json({
                success: false,
                error: '스터디룸이 가득 찼습니다'
            });
        }

        room.participants.push(req.user._id);
        await room.save();

        // 업데이트된 룸 정보 반환
        const updatedRoom = await Room.findById(req.params.id)
            .populate('host', 'username email')
            .populate('participants', 'username email');

        res.status(200).json({
            success: true,
            data: updatedRoom
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || '스터디룸 참가에 실패했습니다.'
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

        // 호스트는 방을 나갈 수 없음
        if (room.host.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                error: '호스트는 방을 나갈 수 없습니다'
            });
        }

        // 참가자 목록에서 제거
        room.participants = room.participants.filter(
            participant => participant.toString() !== req.user._id.toString()
        );
        
        await room.save();

        // 업데이트된 룸 정보 반환
        const updatedRoom = await Room.findById(req.params.id)
            .populate('host', 'username email')
            .populate('participants', 'username email');

        res.status(200).json({
            success: true,
            data: updatedRoom
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || '스터디룸 나가기에 실패했습니다.'
        });
    }
};

// 스터디룸 수정
exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                error: '해당 스터디룸을 찾을 수 없습니다'
            });
        }

        // 호스트만 수정 가능
        if (room.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: '스터디룸 수정 권한이 없습니다'
            });
        }

        const updatedRoom = await Room.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true, runValidators: true }
        ).populate('host', 'username email')
         .populate('participants', 'username email');

        res.status(200).json({
            success: true,
            data: updatedRoom
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || '스터디룸 수정에 실패했습니다.'
        });
    }
};

// 스터디룸 삭제
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                error: '해당 스터디룸을 찾을 수 없습니다'
            });
        }

        // 호스트만 삭제 가능
        if (room.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: '스터디룸 삭제 권한이 없습니다'
            });
        }

        await room.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || '스터디룸 삭제에 실패했습니다.'
        });
    }
};