const express = require('express');
const router = express.Router();
const { 
    createRoom, 
    getRooms, 
    getRoom, 
    joinRoom, 
    leaveRoom 
} = require('../controllers/roomController');
const { protect } = require('../middleware/auth');

router.route('/')
    .get(getRooms)
    .post(protect, createRoom);

router.route('/:id')
    .get(getRoom)
    .post(protect, joinRoom)
    .delete(protect, leaveRoom);

module.exports = router;