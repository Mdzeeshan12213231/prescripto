import mongoose from "mongoose";

const clinicBannerSchema = new mongoose.Schema(
    {
        image: { type: String, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const clinicBannerModel = mongoose.models.clinicBanner || mongoose.model("clinicBanner", clinicBannerSchema);

export default clinicBannerModel;
