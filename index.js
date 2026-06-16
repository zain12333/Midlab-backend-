// ⚠️  env.js MUST be the first import — it loads .env before any module reads process.env
import "./utils/env.js";

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import authRoute from "./Routes/auth.js";
import userRoute from "./Routes/user.js";
import doctorRoute from "./Routes/doctor.js";
import reviewRoute from "./Routes/review.js";
import bookingRoute from "./Routes/booking.js";
import diseaseRoute from "./Routes/disease.js";
import adminRoute from "./Routes/admin.js";
import contactRoute from "./Routes/contact.js";
import forgotPassRoute from "./Routes/forgot-password.js";
import healthRoute from "./Routes/healthPredict.js";
import predictRoute from "./Routes/predict.js";

const app = express();
const port = process.env.PORT || 8000;

const corsOptions = {
  origin: [
    process.env.CLIENT_SITE_URL || "http://localhost:5173",
    "https://midlab-frontend.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
  ],
  credentials: true,
};

// ─── Database connection ─────────────────────────────────────────────────────
let mongoConnected = false;

mongoose.set("strictQuery", false);

const connectDB = async () => {
  if (mongoConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URL);
    mongoConnected = true;
    console.log("[db] MongoDB connected");
  } catch (error) {
    console.error("[db] MongoDB connection failed:", error.message);
  }
};

connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("API is working"));

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/doctors", doctorRoute);
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/bookings", bookingRoute);
app.use("/api/v1/", diseaseRoute);
app.use("/api/v1/", predictRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/", contactRoute);
app.use("/api/v1/", forgotPassRoute);
app.use("/api/v1/", healthRoute);

// ─── Vercel serverless export ─────────────────────────────────────────────────
export default app;

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`[server] Running on http://localhost:${port}`);
  });
}
