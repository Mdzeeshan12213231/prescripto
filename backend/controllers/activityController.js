import activityMetricModel from "../models/activityMetricModel.js";

const toISODateString = (value = new Date()) => {
    const date = new Date(value);
    return date.toISOString().split("T")[0];
};

const upsertActivityMetric = async (req, res) => {
    try {
        const {
            userId,
            metricDate,
            steps,
            heartRateAvg,
            activeMinutes,
            caloriesBurned,
            source,
        } = req.body;

        const dateValue = metricDate || toISODateString();

        const updatedMetric = await activityMetricModel.findOneAndUpdate(
            { userId, metricDate: dateValue },
            {
                userId,
                metricDate: dateValue,
                steps: Number(steps || 0),
                heartRateAvg: Number(heartRateAvg || 0),
                activeMinutes: Number(activeMinutes || 0),
                caloriesBurned: Number(caloriesBurned || 0),
                source: source || "manual",
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json({ success: true, metric: updatedMetric, message: "Activity synced" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const getActivityMetrics = async (req, res) => {
    try {
        const { userId } = req.body;
        const days = Number(req.query.days || 7);
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - (days - 1));

        const startDate = toISODateString(start);
        const endDate = toISODateString(end);

        const metrics = await activityMetricModel
            .find({
                userId,
                metricDate: { $gte: startDate, $lte: endDate },
            })
            .sort({ metricDate: 1 });

        const summary = metrics.reduce(
            (acc, current) => {
                acc.steps += current.steps || 0;
                acc.activeMinutes += current.activeMinutes || 0;
                acc.caloriesBurned += current.caloriesBurned || 0;
                acc.heartRateAvgTotal += current.heartRateAvg || 0;
                return acc;
            },
            { steps: 0, activeMinutes: 0, caloriesBurned: 0, heartRateAvgTotal: 0 }
        );

        const averageHeartRate =
            metrics.length > 0 ? Number((summary.heartRateAvgTotal / metrics.length).toFixed(1)) : 0;

        res.json({
            success: true,
            metrics,
            summary: {
                totalSteps: summary.steps,
                totalActiveMinutes: summary.activeMinutes,
                totalCaloriesBurned: summary.caloriesBurned,
                averageHeartRate,
            },
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { upsertActivityMetric, getActivityMetrics };

