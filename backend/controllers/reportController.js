import reminderModel from "../models/reminderModel.js";
import wellnessCheckinModel from "../models/wellnessCheckinModel.js";
import activityMetricModel from "../models/activityMetricModel.js";
import prescriptionModel from "../models/prescriptionModel.js";
import testResultModel from "../models/testResultModel.js";
import PDFDocument from "pdfkit";

const toISODateString = (value = new Date()) => {
    const date = new Date(value);
    return date.toISOString().split("T")[0];
};

const getDateRange = (days = 7) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    return {
        startDate: toISODateString(start),
        endDate: toISODateString(end),
    };
};

const buildWeeklyReportData = async (userId) => {
    const { startDate, endDate } = getDateRange(7);

    const [reminders, checkins, activity, prescriptions, testResults] = await Promise.all([
        reminderModel.find({ userId, enabled: true }),
        wellnessCheckinModel
            .find({ userId, checkInDate: { $gte: startDate, $lte: endDate } })
            .sort({ checkInDate: 1 }),
        activityMetricModel
            .find({ userId, metricDate: { $gte: startDate, $lte: endDate } })
            .sort({ metricDate: 1 }),
        prescriptionModel.countDocuments({
            patientId: userId,
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        }),
        testResultModel.countDocuments({
            patientId: userId,
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        }),
    ]);

    const totals = activity.reduce(
        (acc, item) => {
            acc.steps += item.steps || 0;
            acc.activeMinutes += item.activeMinutes || 0;
            acc.caloriesBurned += item.caloriesBurned || 0;
            acc.heartRateAvgTotal += item.heartRateAvg || 0;
            return acc;
        },
        { steps: 0, activeMinutes: 0, caloriesBurned: 0, heartRateAvgTotal: 0 }
    );

    const avgStress =
        checkins.length > 0
            ? Number((checkins.reduce((sum, item) => sum + item.stressLevel, 0) / checkins.length).toFixed(1))
            : 0;
    const avgSleep =
        checkins.length > 0
            ? Number((checkins.reduce((sum, item) => sum + (item.sleepHours || 0), 0) / checkins.length).toFixed(1))
            : 0;

    const moodCounts = checkins.reduce((acc, item) => {
        acc[item.mood] = (acc[item.mood] || 0) + 1;
        return acc;
    }, {});

    const dominantMood =
        Object.keys(moodCounts).sort((a, b) => (moodCounts[b] || 0) - (moodCounts[a] || 0))[0] || "n/a";

    return {
        period: { startDate, endDate },
        reminders: {
            totalActive: reminders.length,
            byType: reminders.reduce((acc, reminder) => {
                acc[reminder.type] = (acc[reminder.type] || 0) + 1;
                return acc;
            }, {}),
        },
        activity: {
            totalSteps: totals.steps,
            totalActiveMinutes: totals.activeMinutes,
            totalCaloriesBurned: totals.caloriesBurned,
            averageHeartRate: activity.length > 0 ? Number((totals.heartRateAvgTotal / activity.length).toFixed(1)) : 0,
            daily: activity,
        },
        mentalWellness: {
            checkinCount: checkins.length,
            averageStressLevel: avgStress,
            averageSleepHours: avgSleep,
            dominantMood,
            checkins,
        },
        clinical: {
            newPrescriptionsThisWeek: prescriptions,
            newTestResultsThisWeek: testResults,
        },
    };
};

const getWeeklyReport = async (req, res) => {
    try {
        const { userId } = req.body;
        const report = await buildWeeklyReportData(userId);
        res.json({ success: true, report });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const downloadWeeklyReportPdf = async (req, res) => {
    try {
        const { userId } = req.body;
        const report = await buildWeeklyReportData(userId);

        const doc = new PDFDocument({ margin: 40, size: "A4" });
        const fileName = `weekly-health-report-${report.period.endDate}.pdf`;

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);

        doc.pipe(res);

        doc.fontSize(20).text("Weekly Health Report", { align: "center" });
        doc.moveDown();
        doc.fontSize(11).text(`Period: ${report.period.startDate} to ${report.period.endDate}`);
        doc.moveDown();

        doc.fontSize(14).text("Activity Summary");
        doc.fontSize(11).text(`Total Steps: ${report.activity.totalSteps}`);
        doc.text(`Total Active Minutes: ${report.activity.totalActiveMinutes}`);
        doc.text(`Calories Burned: ${report.activity.totalCaloriesBurned}`);
        doc.text(`Average Heart Rate: ${report.activity.averageHeartRate}`);
        doc.moveDown();

        doc.fontSize(14).text("Mental Wellness");
        doc.fontSize(11).text(`Check-ins: ${report.mentalWellness.checkinCount}`);
        doc.text(`Average Stress Level: ${report.mentalWellness.averageStressLevel}`);
        doc.text(`Average Sleep Hours: ${report.mentalWellness.averageSleepHours}`);
        doc.text(`Dominant Mood: ${report.mentalWellness.dominantMood}`);
        doc.moveDown();

        doc.fontSize(14).text("Reminders");
        doc.fontSize(11).text(`Active Reminders: ${report.reminders.totalActive}`);
        Object.entries(report.reminders.byType).forEach(([type, count]) => {
            doc.text(`${type}: ${count}`);
        });
        doc.moveDown();

        doc.fontSize(14).text("Clinical Updates");
        doc.fontSize(11).text(`New Prescriptions: ${report.clinical.newPrescriptionsThisWeek}`);
        doc.text(`New Test Results: ${report.clinical.newTestResultsThisWeek}`);

        doc.end();
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { getWeeklyReport, downloadWeeklyReportPdf };

