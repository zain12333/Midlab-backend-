import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { backendRoot } from "./utils/paths.js";
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

dotenv.config({ path: path.join(backendRoot, ".env") });

const app = express();
const port = process.env.PORT || 8000;

const corsOptions = {
  origin: [
    process.env.CLIENT_SITE_URL || "http://localhost:5173",
    "https://midlab-frontend.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173"
  ],
  credentials: true,
};

// Database connection variable
let mongoConnected = false;

//database connection
mongoose.set("strictQuery", false);
const connectDB = async () => {
  if (mongoConnected) {
    console.log("Database already connected");
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      //   useNewUrlParser: true,
      //   useUnifiedTopology: true,
    });
    mongoConnected = true;
    console.log("Mongoose connected");
  } catch (error) {
    console.error("Mongoose connection failed:", error.message);
    mongoConnected = false;
  }
};

// Connect to DB once on startup
connectDB();

app.get("/", (req, res) => {
  res.send("Api is working");
});

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use("/api/v1/auth", authRoute); //domain/api/v1/auth/register or any other request
app.use("/api/v1/users", userRoute);
app.use("/api/v1/doctors", doctorRoute);
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/bookings", bookingRoute);
app.use("/api/v1/", diseaseRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/", contactRoute);
app.use("/api/v1/", forgotPassRoute);
app.use("/api/v1/", healthRoute);

// Export app for Vercel serverless
export default app;

// Only use app.listen for local development
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log("Server is running on port " + port);
  });
}
