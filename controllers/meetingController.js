
const mongoose = require("mongoose");
const Meeting = require('../models/Meetings');
const { meetingNotification } = require("../models/Notifications");
const { sendMeetingNotification } = require('../services/firebaseAdmin');
const User = require("../models/User"); // adjust path if needed
const Organization = require('../models/Organization');

const meetingSchedule = async (req, res) => {
  try {
    const {
      title,
      meetingId,
      meetingLink,
      scheduledDateTime,
      applicantId,
      organizationId,
    } = req.body;

    const meeting = new Meeting({
      title,
      meetingId,
      meetingLink,
      scheduledDateTime,
      applicantId,
      organizationId,
    });

    await meeting.save();
const sender=await Organization.findById(organizationId);
    const notification = new meetingNotification({
      title: 'Meeting Scheduled',
      body: `Your meeting with ${sender.name} has been scheduled for ${scheduledDateTime}.`,
      meetingId,
      applicantId,
      scheduledDateTime,
      organizationId,
      meetingLink,
    });

    await notification.save();

    const applicant = await User.findById(applicantId);
    const token = applicant?.fcmTokens;
console.log("Applicant FCM Token:", token);
    if (token && Array.isArray(token)) {
  for (const t of token) {
    await sendMeetingNotification(t, {
      title,
      scheduledDateTime,
      meetingId,
      meetingLink,
      organizationId,
      senderName: sender.name, 
    });
  }
} else {
      console.warn(`⚠️ No FCM token found for applicant ID: ${applicantId}`);
    }

    res.status(201).json({ message: 'Meeting scheduled and notification sent successfully' });

  } catch (error) {
    console.error("❌ Failed to schedule meeting:", error);
    res.status(500).json({ message: 'Failed to schedule meeting' });
  }
};
const organizationFetchMeeting = async (req, res) => {
    
    console.log("awwwwwad2");
    try {
    const meetings = await Meeting.find({ organizationId: req.params.orgId });
    res.status(200).json(meetings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching meetings' });
  }
}



 module.exports = {
   meetingSchedule,organizationFetchMeeting
    };