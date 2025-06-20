import express from "express";
import Doctor from "../models/doctors.js";
import {
  getDoctorByName,
  loginDoctor,
  getMe,
} from "../controllers/doctorControllers.js";

import { getBookingsForLoggedInDoctor } from "../controllers/bookingController.js";
import authDoctor from "../middlewares/authDoctor.js"; // ✅ JWT middleware for doctor

const router = express.Router();

// Fetch all doctors (public)
router.get("/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors" });
  }
});

router.get("/doctors/name/:name", getDoctorByName);

router.post("/doctor/login", loginDoctor);

router.get("/doctor/me", authDoctor, getMe);

router.get("/doctor/bookings", authDoctor, getBookingsForLoggedInDoctor);

export default router;
