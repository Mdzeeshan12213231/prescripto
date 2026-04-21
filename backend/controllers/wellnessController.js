import wellnessCheckinModel from "../models/wellnessCheckinModel.js";

const toISODateString = (value = new Date()) => {
    const date = new Date(value);
    return date.toISOString().split("T")[0];
};

const submitCheckin = async (req, res) => {
    try {
        const { userId, mood, stressLevel, sleepHours, energyLevel, notes, checkInDate } = req.body;

        if (!mood || stressLevel === undefined) {
            return res.json({ success: false, message: "mood and stressLevel are required" });
        }

        const dateValue = checkInDate || toISODateString();

        const existing = await wellnessCheckinModel.findOne({ userId, checkInDate: dateValue });
        if (existing) {
            existing.mood = mood;
            existing.stressLevel = Number(stressLevel);
            existing.sleepHours = Number(sleepHours || 0);
            existing.energyLevel = Number(energyLevel || 5);
            existing.notes = notes || "";
            await existing.save();
            return res.json({ success: true, checkin: existing, message: "Check-in updated" });
        }

        const checkin = await wellnessCheckinModel.create({
            userId,
            mood,
            stressLevel: Number(stressLevel),
            sleepHours: Number(sleepHours || 0),
            energyLevel: Number(energyLevel || 5),
            notes: notes || "",
            checkInDate: dateValue,
        });

        res.json({ success: true, checkin, message: "Check-in submitted" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const getCheckinHistory = async (req, res) => {
    try {
        const { userId } = req.body;
        const limit = Number(req.query.limit || 30);

        const checkins = await wellnessCheckinModel
            .find({ userId })
            .sort({ checkInDate: -1 })
            .limit(limit);

        res.json({ success: true, checkins });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { submitCheckin, getCheckinHistory };

