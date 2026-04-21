import express from "express"
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import adminRouter from "./routes/adminRoute.js"
import prescriptionRouter from "./routes/prescriptionRoute.js"
import reminderRouter from "./routes/reminderRoute.js"
import wellnessRouter from "./routes/wellnessRoute.js"
import activityRouter from "./routes/activityRoute.js"
import reportRouter from "./routes/reportRoute.js"

// app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/doctor", doctorRouter)
app.use("/api/prescription", prescriptionRouter)
app.use("/api/reminder", reminderRouter)
app.use("/api/wellness", wellnessRouter)
app.use("/api/activity", activityRouter)
app.use("/api/report", reportRouter)

app.get("/", (req, res) => {
  res.send("API Working")
});

app.listen(port, () => console.log(`Server started on PORT:${port}`))