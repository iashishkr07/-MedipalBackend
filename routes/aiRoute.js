import express from "express";
import {
  getAiInsight,
  translateText,
  generateHealthTips,
} from "../controllers/aiController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/generate-insight", auth, getAiInsight);
router.post("/generate-health-tips", auth, generateHealthTips);
router.post("/translate-text", auth, translateText);

export default router;
