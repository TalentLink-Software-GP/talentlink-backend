const express = require('express');
const router = express.Router();


const{
  saveMessage,
  messagebetweenUsers,
  getSearchUsers,
  getChatHistory,
  deleteMessage,
  getUnreadCount,
  markAsRead,
   
} = require("../controllers/messageController")

router.post('/messages',saveMessage);

router.get('/messages/:userId1/:userId2',messagebetweenUsers);

router.get('/users/search',getSearchUsers);

router.get('/chat-history/:userId',getChatHistory);

router.put('/delete-message/:userId1/:userId2',deleteMessage);

router.get('/messages/unread-count/:userId/:peerId',getUnreadCount);
  
router.post('/messages/mark-as-read',markAsRead);
 

module.exports = router;
