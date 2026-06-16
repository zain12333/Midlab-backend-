import express from "express";
import { predictSymptoms } from "../Controllers/predictController.js";

const router = express.Router({ mergeParams: true });

// POST /api/v1/symptoms  — symptom-based health prediction via OpenAI
router.post("/symptoms", predictSymptoms);

// POST /api/v1/health-predict — same endpoint, alternative path
router.post("/health-predict", predictSymptoms);

export default router;
