import express from "express";
import {
  uploadReport,
  getUserReports,
  getReport,
  deleteReport,
  uploadMiddleware,
} from "../controllers/reportController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

// Upload a new report
router.post("/upload", auth, uploadMiddleware, uploadReport);

// Get all reports for the authenticated user
router.get("/all-report/:aadharNo", auth, getUserReports);
router.get("/all-reports/:aadharNo", getUserReports);

// Get a single report by ID
router.get("/report/:id", auth, getReport);

// Delete a report by ID
router.delete("/report/:id", auth, deleteReport);

export default router;
