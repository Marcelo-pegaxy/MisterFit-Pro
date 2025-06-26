const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

router.get('/conversations', protect, chatController.getConversations);
router.get('/messages', protect, chatController.getMessages);
router.post('/messages', protect, chatController.sendMessage);
router.patch('/messages/read', protect, chatController.markAsRead);
router.get('/unread-count', protect, chatController.getUnreadCount);

module.exports = router; 