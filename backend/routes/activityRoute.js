import express from "express";
import authUser from "../middleware/authUser.js";
import { getActivityMetrics, upsertActivityMetric } from "../controllers/activityController.js";

const activityRouter = express.Router();

activityRouter.post("/sync", authUser, upsertActivityMetric);
activityRouter.get("/metrics", authUser, getActivityMetrics);

export default activityRouter;

