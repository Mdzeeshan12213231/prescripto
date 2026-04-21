import express from "express";
import authUser from "../middleware/authUser.js";
import { downloadWeeklyReportPdf, getWeeklyReport } from "../controllers/reportController.js";

const reportRouter = express.Router();

reportRouter.get("/weekly", authUser, getWeeklyReport);
reportRouter.get("/weekly/pdf", authUser, downloadWeeklyReportPdf);

export default reportRouter;

