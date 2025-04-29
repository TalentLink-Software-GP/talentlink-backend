const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

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

router.get('/messages/:userId1/:userId2', async (req, res) => {
  const { userId1, userId2 } = req.params;
  const ObjectId = mongoose.Types.ObjectId;

  try {
    const userObjectId1 = new ObjectId(userId1);
    const userObjectId2 = new ObjectId(userId2);

    const messages = await Message.find({
      $or: [
        { senderId: userObjectId1, receiverId: userObjectId2 },
        { senderId: userObjectId2, receiverId: userObjectId1 }
      ],
      deletedBy: { $ne: userObjectId1 } 
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
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
  const ObjectId = mongoose.Types.ObjectId;

  try {
    const userObjectId = new ObjectId(userId);

    const messages = await Message.find({
      $or: [
        { senderId: userObjectId },
        { receiverId: userObjectId }
      ],
      deletedBy: { $ne: userObjectId } 
    }).sort({ timestamp: -1 });

    const userMap = new Map();

    messages.forEach((message) => {
      const otherUserId =
        message.senderId.toString() === userId
          ? message.receiverId
          : message.senderId;

      if (!userMap.has(otherUserId.toString())) {
        userMap.set(otherUserId.toString(), {
          userId: otherUserId,
          lastMessageTimestamp: message.timestamp
        });
      }
    });

    const userIds = Array.from(userMap.keys());
    const users = await User.find({ _id: { $in: userIds } });

    const result = users.map((user) => ({
      ...user._doc,
      lastMessageTimestamp: userMap.get(user._id.toString()).lastMessageTimestamp
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in chat-history route:', error);
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

  router.put('/delete-message/:userId1/:userId2', async (req, res) => {
    const { userId1, userId2 } = req.params;
    const ObjectId = mongoose.Types.ObjectId;
  
    try {
      const userObjectId1 = new ObjectId(userId1);
      const userObjectId2 = new ObjectId(userId2);
  
      const result = await Message.updateMany(
        {
          $or: [
            { senderId: userObjectId1, receiverId: userObjectId2 },
            { senderId: userObjectId2, receiverId: userObjectId1 }
          ],
          deletedBy: { $ne: userObjectId1 }
        },
        {
          $push: { deletedBy: userObjectId1 }
        }
      );
  
      res.status(200).json({
        message: 'Chat hidden for this user.',
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      console.error('Error hiding messages:', error);
      res.status(500).json({ error: 'Failed to hide messages' });
    }
  });
  
  
  

   // to get unread message 
   router.get('/unread-count/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const count = await Message.countDocuments({
        receiverId: userId,
        isRead: false,
      });
  
      res.status(200).json({ unreadCount: count });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch unread message count' });
    }
  });
// to make chat read when open 
router.post('/mark-as-read', async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    await Message.updateMany(
      { senderId, receiverId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update messages' });
  }
});
  
  

module.exports = router;
