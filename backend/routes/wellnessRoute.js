import express from "express";
import authUser from "../middleware/authUser.js";
import { getCheckinHistory, submitCheckin } from "../controllers/wellnessController.js";

const wellnessRouter = express.Router();

wellnessRouter.post("/checkin", authUser, submitCheckin);
wellnessRouter.get("/history", authUser, getCheckinHistory);

export default wellnessRouter;

