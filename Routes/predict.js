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

router.post("/predict/diabetes", predictDiabetes);
router.post("/predict/heart", predictHeart);
router.post("/predict/kidney", predictKidney);
router.post("/predict/liver", predictLiver);
router.post("/predict/breast-cancer", predictBreastCancer);
router.post("/predict/malaria", predictMalaria);
router.post("/predict/pneumonia", predictPneumonia);

export default router;
