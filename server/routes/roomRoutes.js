const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getRooms,
  getRoom,
  createRoom,
  joinRoom,
  leaveRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');

router.route('/')
  .get(getRooms)  // 모든 스터디룸 조회는 인증 없이 가능
  .post(protect, createRoom);  // 스터디룸 생성은 인증 필요

router.route('/:id')
  .get(getRoom)  // 특정 스터디룸 조회는 인증 없이 가능
  .put(protect, updateRoom)  // 수정은 인증 필요
  .delete(protect, deleteRoom);  // 삭제는 인증 필요

router.route('/:id/join')
  .post(protect, joinRoom);  // 참가는 인증 필요

router.route('/:id/leave')
  .post(protect, leaveRoom);  // 나가기는 인증 필요

module.exports = router;