// 스터디룸 참가
exports.joinRoom = async (req, res) => {
    try {
        const { password } = req.body;
        const room = await Room.findById(req.params.id).select('+password');

        if (!room) {
            return res.status(404).json({
                success: false,
                error: '해당 스터디룸을 찾을 수 없습니다'
            });
        }

        // 비밀번호 확인
        const isMatch = await room.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: '비밀번호가 일치하지 않습니다'
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
            error: error.message
        });
    }
};