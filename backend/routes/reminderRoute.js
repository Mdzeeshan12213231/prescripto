import express from "express";
import authUser from "../middleware/authUser.js";
import {
    createReminder,
    deleteReminder,
    getUserReminders,
    updateReminder,
} from "../controllers/reminderController.js";

const reminderRouter = express.Router();

reminderRouter.post("/create", authUser, createReminder);
reminderRouter.get("/list", authUser, getUserReminders);
reminderRouter.post("/update", authUser, updateReminder);
reminderRouter.post("/delete", authUser, deleteReminder);

export default reminderRouter;

