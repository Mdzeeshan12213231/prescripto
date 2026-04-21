import mongoose from "mongoose";

const wellnessCheckinSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            index: true,
        },
        mood: {
            type: String,
            enum: ["great", "good", "okay", "stressed", "low"],
            required: true,
        },
        stressLevel: {
            type: Number,
            min: 1,
            max: 10,
            required: true,
        },
        sleepHours: {
            type: Number,
            min: 0,
            max: 24,
            default: 0,
        },
        energyLevel: {
            type: Number,
            min: 1,
            max: 10,
            default: 5,
        },
        notes: {
            type: String,
            trim: true,
            default: "",
        },
        checkInDate: {
            type: String,
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);

const wellnessCheckinModel =
    mongoose.models.wellnessCheckin || mongoose.model("wellnessCheckin", wellnessCheckinSchema);

export default wellnessCheckinModel;

