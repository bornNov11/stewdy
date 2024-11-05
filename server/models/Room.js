const mongoose = require('mongoose');

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
    host: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    maxParticipants: {
        type: Number,
        default: 10
    },
    isActive: {
        type: Boolean,
        default: true
    },
    category: {
        type: String,
        required: [true, '스터디 카테고리는 필수입니다'],
        enum: ['javascript', 'python', 'react', 'java', 'spring', 'nodejs', 'etc']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Room', roomSchema);