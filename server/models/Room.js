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
        minlength: 4
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
    voiceParticipants: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    screenSharing: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        active: Boolean
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
    }
});

// 비밀번호 해싱
roomSchema.pre('save', async function(next) {
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

module.exports = mongoose.model('Room', roomSchema);