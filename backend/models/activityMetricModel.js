import mongoose from "mongoose";

const activityMetricSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            index: true,
        },
        metricDate: {
            type: String,
            required: true,
            index: true,
        },
        steps: {
            type: Number,
            min: 0,
            default: 0,
        },
        heartRateAvg: {
            type: Number,
            min: 0,
            default: 0,
        },
        activeMinutes: {
            type: Number,
            min: 0,
            default: 0,
        },
        caloriesBurned: {
            type: Number,
            min: 0,
            default: 0,
        },
        source: {
            type: String,
            enum: ["manual", "google_fit", "apple_health", "device"],
            default: "manual",
        },
    },
    { timestamps: true }
);

activityMetricSchema.index({ userId: 1, metricDate: 1 }, { unique: true });

const activityMetricModel =
    mongoose.models.activityMetric || mongoose.model("activityMetric", activityMetricSchema);

export default activityMetricModel;

