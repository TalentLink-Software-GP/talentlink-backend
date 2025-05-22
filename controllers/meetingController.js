
const mongoose = require("mongoose");

const Meeting = require('../models/Meetings');
const { meetingNotification } = require("../models/Notifications");


const meetingSchedule = async (req, res) => {   
    console.log("awwad ");
    console.log(req.body);
try {
    const { title, meetingId, meetingLink, scheduledDateTime, applicantId, organizationId } = req.body;

    const meeting = new Meeting({
        title,
        meetingId,
        meetingLink,
        scheduledDateTime,
        applicantId,
        organizationId,
    });

    
        await meeting.save();

        const notification = new meetingNotification({
          title: 'Meeting Scheduled ',
            body: `Your meeting with ${title} has been scheduled for ${scheduledDateTime}.`,
            meetingId: meetingId,
            applicantId: applicantId,
            scheduledDateTime: scheduledDateTime,
            organizationId: organizationId,
            meetingLink: meetingLink,
           

        });
                        await notification.save();

        res.status(201).json({ message: 'Meeting scheduled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to schedule meeting' });
    }



}
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