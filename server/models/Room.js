const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '스터디룸 이름은 필수입니다'],
        trim: true,
        maxlength: [50, '스터디룸 이름은 50자를 초과할 수 없습니다']
    },
    description: {
        type: String,
        required: [true, '스터디룸 설명은 필수입니다'],
        maxlength: [500, '스터디룸 설명은 500자를 초과할 수 없습니다']
    },
    password: {
        type: String,
        required: [true, '비밀번호는 필수입니다'],
        minlength: [4, '비밀번호는 최소 4자 이상이어야 합니다']
    },
    host: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    // 음성 채팅 참가자 목록 추가
    voiceParticipants: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    maxParticipants: {
        type: Number,
        default: 10
    },
    category: {
        type: String,
        required: [true, '카테고리는 필수입니다'],
        enum: ['javascript', 'python', 'react', 'java', 'spring', 'nodejs', 'etc']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // 마지막 음성 채팅 활성화 시간
    lastVoiceActivity: {
        type: Date,
        default: null
    }
});

// 비밀번호 해싱
roomSchema.pre('save', async function(next) {
    // 비밀번호가 수정되었을 때만 해싱
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// 비밀번호 확인 메서드
roomSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// 음성 채팅 참가자 추가 메서드
roomSchema.methods.addVoiceParticipant = async function(userId) {
    if (!this.voiceParticipants.includes(userId)) {
        this.voiceParticipants.push(userId);
        this.lastVoiceActivity = new Date();
        await this.save();
    }
};

// 음성 채팅 참가자 제거 메서드
roomSchema.methods.removeVoiceParticipant = async function(userId) {
    this.voiceParticipants = this.voiceParticipants.filter(
        participantId => participantId.toString() !== userId.toString()
    );
    await this.save();
};

// 현재 음성 채팅 참가자 수 가져오기
roomSchema.virtual('voiceParticipantCount').get(function() {
    return this.voiceParticipants.length;
});

// virtuals 활성화
roomSchema.set('toJSON', { virtuals: true });
roomSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Room', roomSchema);