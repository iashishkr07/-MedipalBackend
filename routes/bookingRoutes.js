import express from "express";
import {
  createBooking,
  getAllBookings,
  getUserBookings,
  getBookingsByDoctor,
  updateBooking,
  deleteBooking,
  getAadharNosByDoctorEmail,
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/book-appointment", createBooking);
router.get("/bookings", getAllBookings);
router.get("/bookings/:email", getUserBookings);
router.get("/bookings/doctor/:doctorName", getBookingsByDoctor);
router.put("/bookings/:id", updateBooking);
router.delete("/bookings/:id", deleteBooking);
router.get("/bookings/aadhars/:doctorEmail", getAadharNosByDoctorEmail);

export default router;
