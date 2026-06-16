import express from "express";
import {
  predictDiabetes,
  predictHeart,
  predictKidney,
  predictLiver,
  predictBreastCancer,
  predictMalaria,
  predictPneumonia,
} from "../Controllers/predictController.js";

const router = express.Router();

// Legacy route paths kept for backward compatibility with existing frontend API calls.
// All now powered by OpenAI GPT-4o-mini — no Python required.

router.post("/diabetes", predictDiabetes);
router.post("/heart", predictHeart);
router.post("/kidney", predictKidney);
router.post("/liver", predictLiver);
router.post("/breast-cancer", predictBreastCancer);

// Malaria and pneumonia previously accepted image uploads.
// They now accept symptom/clinical data as JSON.
router.post("/predict-malaria", predictMalaria);
router.post("/predict-pneumonia", predictPneumonia);

export default router;
