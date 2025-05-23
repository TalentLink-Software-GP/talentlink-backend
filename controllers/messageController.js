const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');
const Organization = require('../models/Organization');
const { sendNotification } = require('../services/firebaseAdmin');






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

const saveMessage=async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  try {
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newMessage = new Message({ senderId, receiverId, message });
    await newMessage.save();

    const [receiver, sender] = await Promise.all([
      User.findById(receiverId).lean(),
      User.findById(senderId).lean()
    ]);
    // const reciverToken=receiver.fcmTokens;

    if (!receiver) {
      console.error("❌ Error: Receiver not found");
      return res.status(201).json(newMessage); 
    }

    if (!sender) {
      console.error("❌ Warning: Sender not found, using default values");
    }

    const canSendNotification = 
      receiver.fcmTokens?.length > 0 && 
      receiver.notificationSettings?.chat !== false;

    if (canSendNotification) {
     console.log(`Sending notification from ${sender?.username || 'Unknown'} to ${receiver.username}`);
      
      try {
       await sendNotification(
  receiver.fcmTokens,
  'New Message',
  `${sender?.username || 'Someone'}: ${message}`,
  {
    type: 'chat',
    senderId,
    receiverId,
    messageId: newMessage._id.toString(),
    peerUserId: senderId,
    peerUsername: sender?.username || 'Unknown',
    currentUserId: receiverId,
    currentuserAvatarUrl: sender?.avatarUrl || '',
    //token: reciverToken, // Replace with actual token if available
    route: '/chat'
  }
);
      } catch (err) {
        console.error("❌ Error sending notification:", err);
      }
    } else {
      console.log(`Notification not sent to ${receiver.username}. Reasons:`);
      if (!receiver.fcmTokens?.length) console.log("- No FCM tokens");
      if (receiver.notificationSettings?.chat === false) console.log("- Chat notifications disabled");
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Failed to send message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};


const messagebetweenUsers = async (req, res) => {
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
};




const getSearchUsers= async (req, res) => {
  const { q } = req.query;

  try {
    const users = await User.find({
      username: { $regex: q, $options: 'i' }
      
    }).select('username email avatarUrl');//avatarUrl

    const org = await Organization.find({
      username: { $regex: q, $options: 'i' }
    }).select('username email avatarUrl');
    const result=users.concat(org);
console.log(org);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search users' });
  }
};


const getChatHistory= async (req, res) => {
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

      const key = otherUserId.toString();

      if (!userMap.has(key)) {
        userMap.set(key, {
          userId: otherUserId,
          lastMessageTimestamp: message.timestamp
        });
      }
    });

    const otherUserIds = Array.from(userMap.keys()).map(id => new ObjectId(id));

    const [users, orgs] = await Promise.all([
      User.find({ _id: { $in: otherUserIds } }),
      Organization.find({ _id: { $in: otherUserIds } })
    ]);

    const usersWithType = users.map(user => ({
      ...user._doc,
      type: 'user',
      lastMessageTimestamp: userMap.get(user._id.toString()).lastMessageTimestamp
    }));

    const orgsWithType = orgs.map(org => ({
      ...org._doc,
      type: 'organization',
      lastMessageTimestamp: userMap.get(org._id.toString()).lastMessageTimestamp
    }));

    const result = [...usersWithType, ...orgsWithType];

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in chat-history route:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

const deleteMessage= async (req, res) => {
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
  };



  const getUnreadCount=async (req, res) => {
    try {
      console.log("Received request to get unread count");
      
      const count = await Message.countDocuments({
        senderId: req.params.peerId,
        receiverId: req.params.userId,
        isRead: false
      });
      res.json({ count });
      console.log("Sent response with count:", count);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };


  const markAsRead= async (req, res) => {
  // console.log('Received POST request to /mark-as-read');
  // console.log('Request body:', req.body); // Add this line
  
  const { senderId, receiverId } = req.body;
  //console.log(`Params: senderId=${senderId}, receiverId=${receiverId}`); // Add this line

  try {
    const result = await Message.updateMany(
      { senderId, receiverId, isRead: false },
      { $set: { isRead: true } }
    );
    
    //console.log('Update result:', result); // Add this line
    res.status(200).json({ message: 'Messages marked as read', updatedCount: result.modifiedCount });
  } catch (error) {
    //console.error('Error in /mark-as-read:', error); // Enhanced error logging
    res.status(500).json({ error: 'Failed to update messages' });
  }
};
module.exports = {
    saveMessage,
    messagebetweenUsers,
    getSearchUsers,
    getChatHistory,
    deleteMessage,
    getUnreadCount,
    markAsRead,
 
    }