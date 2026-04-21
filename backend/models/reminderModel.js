import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["water", "walk", "sleep", "medication", "wellness"],
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
            default: "",
        },
        time: {
            type: String,
            required: true,
        },
        daysOfWeek: {
            type: [Number],
            default: [],
            validate: {
                validator: (days) => days.every((day) => day >= 0 && day <= 6),
                message: "daysOfWeek must contain values between 0 and 6",
            },
        },
        enabled: {
            type: Boolean,
            default: true,
        },
        lastCompletedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

const reminderModel = mongoose.models.reminder || mongoose.model("reminder", reminderSchema);
export default reminderModel;

