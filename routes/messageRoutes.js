const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');

router.post('/messages', async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  try {
    const newMessage = new Message({ senderId, receiverId, message });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.get('/messages/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.get('/users/search', async (req, res) => {
  const { q } = req.query;

  try {
    const users = await User.find({
      username: { $regex: q, $options: 'i' }
    }).select('username email profilePhoto');

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search users' });
  }
});
router.get('/chat-history/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const messages = await Message.find({
        $or: [{ senderId: userId }, { receiverId: userId }],
      }).sort({ timestamp: -1 }); 
  
      console.log("Fetched Messages:", messages);
  
      const userMap = new Map(); 
      messages.forEach((message) => {
        const otherUserId =
          message.senderId.toString() === userId ? message.receiverId : message.senderId;
  
        if (!userMap.has(otherUserId.toString())) {
          userMap.set(otherUserId.toString(), {
            userId: otherUserId,
            lastMessageTimestamp: message.timestamp, 
          });
        }
      });
  
      console.log("User Map:", userMap);
  
      const userIds = Array.from(userMap.keys());
      const users = await User.find({ _id: { $in: userIds } });
  
      const result = users.map((user) => ({
        ...user._doc,
        lastMessageTimestamp: userMap.get(user._id.toString()).lastMessageTimestamp,
      }));
  
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in chat-history route:", error);
      res.status(500).json({ error: 'Failed to fetch chat history' });
    }
  });
  async function updateTimestamps() {
    try {
      const messages = await Message.find({ timestamp: { $exists: false } });
  
      for (let message of messages) {
        message.timestamp = new Date(); 
        await message.save();
      }
  
      console.log("Updated messages with missing timestamps.");
    } catch (error) {
      console.error("Error updating timestamps:", error);
    }
  }
  
  updateTimestamps();
  

module.exports = router;
