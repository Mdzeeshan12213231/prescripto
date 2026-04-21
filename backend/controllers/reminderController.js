import reminderModel from "../models/reminderModel.js";

const createReminder = async (req, res) => {
    try {
        const { userId, type, title, notes, time, daysOfWeek, enabled } = req.body;

        if (!type || !title || !time) {
            return res.json({ success: false, message: "type, title and time are required" });
        }

        const reminder = await reminderModel.create({
            userId,
            type,
            title,
            notes: notes || "",
            time,
            daysOfWeek: Array.isArray(daysOfWeek) ? daysOfWeek : [],
            enabled: enabled !== undefined ? Boolean(enabled) : true,
        });

        res.json({ success: true, reminder, message: "Reminder created" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const getUserReminders = async (req, res) => {
    try {
        const { userId } = req.body;
        const reminders = await reminderModel.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, reminders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const updateReminder = async (req, res) => {
    try {
        const { userId, reminderId, ...updateData } = req.body;

        if (!reminderId) {
            return res.json({ success: false, message: "reminderId is required" });
        }

        const reminder = await reminderModel.findOne({ _id: reminderId, userId });
        if (!reminder) {
            return res.json({ success: false, message: "Reminder not found" });
        }

        Object.assign(reminder, updateData);
        await reminder.save();

        res.json({ success: true, reminder, message: "Reminder updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const deleteReminder = async (req, res) => {
    try {
        const { userId, reminderId } = req.body;
        if (!reminderId) {
            return res.json({ success: false, message: "reminderId is required" });
        }

        const deleted = await reminderModel.findOneAndDelete({ _id: reminderId, userId });
        if (!deleted) {
            return res.json({ success: false, message: "Reminder not found" });
        }

        res.json({ success: true, message: "Reminder deleted" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { createReminder, getUserReminders, updateReminder, deleteReminder };

