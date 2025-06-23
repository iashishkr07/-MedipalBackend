import mongoose from "mongoose";
import Booking from "../models/booking.js";

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Booking creation failed", error: error.message });
  }
};

// Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: error.message });
  }
};

// Get bookings for a specific user by email
export const getUserBookings = async (req, res) => {
  try {
    const { email } = req.params;
    const bookings = await Booking.find({ email }).sort({ date: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user bookings", error: error.message });
  }
};

// Get bookings by doctor name (fuzzy match)
export const getBookingsByDoctor = async (req, res) => {
  try {
    const { doctorName } = req.params;
    const bookings = await Booking.find({
      doctor: { $regex: doctorName, $options: "i" },
    }).sort({ date: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching bookings by doctor",
      error: error.message,
    });
  }
};

// Get bookings for the logged-in doctor
export const getBookingsForLoggedInDoctor = async (req, res) => {
  try {
    const doctorEmail = req.doctor?.email;
    if (!doctorEmail) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Doctor data not found",
      });
    }

    const bookings = await Booking.find({ doctoremail: doctorEmail }).sort({
      date: -1,
    });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching doctor's bookings",
      error: error.message,
    });
  }
};

// Get bookings for the logged-in user
export const getBookingsForCurrentUser = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User data not found",
      });
    }

    const bookings = await Booking.find({ email: userEmail }).sort({
      date: -1,
    });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user's bookings",
      error: error.message,
    });
  }
};

// Update a booking
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate status
    const allowedStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (req.body.status && !allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(
          ", "
        )}`,
      });
    }

    // Check for required fields
    const requiredFields = [
      "name",
      "email",
      "phone",
      "doctor",
      "doctoremail",
      "fees",
      "timeslot",
      "date",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    let updatedBooking = await Booking.findOneAndUpdate(
      { bookingId: id },
      req.body,
      { new: true, runValidators: true }
    );

    // If not found by bookingId, try MongoDB _id
    if (!updatedBooking) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid booking ID format" });
      }

      updatedBooking = await Booking.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
    }

    if (!updatedBooking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating booking",
      error: error.message,
    });
  }
};

// Delete a booking
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
    }

    const deletedBooking = await Booking.findByIdAndDelete(id);
    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting booking", error: error.message });
  }
};

// Get all unique aadharNo for bookings by doctorEmail
export const getAadharNosByDoctorEmail = async (req, res) => {
  try {
    const { doctorEmail } = req.params;
    if (!doctorEmail) {
      return res
        .status(400)
        .json({ success: false, message: "doctorEmail parameter is required" });
    }
    // Find all bookings for the doctor and get unique aadharNo values
    const aadharNos = await Booking.distinct("aadharNo", {
      doctoremail: doctorEmail,
    });
    res.status(200).json({ success: true, aadharNos });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching aadharNos",
      error: error.message,
    });
  }
};
