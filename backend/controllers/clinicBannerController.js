import { v2 as cloudinary } from "cloudinary";
import clinicBannerModel from "../models/clinicBannerModel.js";

const addClinicBanner = async (req, res) => {
    try {
        const imageFile = req.file;

        if (!imageFile) {
            return res.json({ success: false, message: "Image is required" });
        }

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });

        const banner = await clinicBannerModel.create({
            image: imageUpload.secure_url,
            isActive: true,
        });

        res.json({ success: true, message: "Clinic banner added", banner });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const getAdminClinicBanners = async (req, res) => {
    try {
        const banners = await clinicBannerModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, banners });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const getActiveClinicBanners = async (req, res) => {
    try {
        const banners = await clinicBannerModel.find({ isActive: true }).sort({ createdAt: -1 });
        res.json({ success: true, banners });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const toggleClinicBanner = async (req, res) => {
    try {
        const { bannerId } = req.body;

        const banner = await clinicBannerModel.findById(bannerId);
        if (!banner) {
            return res.json({ success: false, message: "Banner not found" });
        }

        banner.isActive = !banner.isActive;
        await banner.save();

        res.json({ success: true, message: "Banner updated", banner });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const replaceClinicBannerImage = async (req, res) => {
    try {
        const { bannerId } = req.body;
        const imageFile = req.file;

        if (!bannerId || !imageFile) {
            return res.json({ success: false, message: "Banner id and image are required" });
        }

        const banner = await clinicBannerModel.findById(bannerId);
        if (!banner) {
            return res.json({ success: false, message: "Banner not found" });
        }

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        banner.image = imageUpload.secure_url;
        await banner.save();

        res.json({ success: true, message: "Banner image replaced", banner });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    addClinicBanner,
    getAdminClinicBanners,
    getActiveClinicBanners,
    toggleClinicBanner,
    replaceClinicBannerImage,
};
