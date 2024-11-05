const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, '사용자 이름은 필수입니다'],
        unique: true
    },
    email: {
        type: String,
        required: [true, '이메일은 필수입니다'],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, '유효한 이메일을 입력해주세요']
    },
    password: {
        type: String,
        required: [true, '비밀번호는 필수입니다'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['mentor', 'mentee'],
        default: 'mentee'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 비밀번호 암호화
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// 비밀번호 확인 메서드
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);