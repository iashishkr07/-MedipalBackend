import jwt from "jsonwebtoken";
import Doctor from "../models/doctors.js";

const authDoctor = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const doctor = await Doctor.findOne({ email: decoded.email });

    if (!doctor) return res.status(401).json({ message: "Doctor not found." });

    req.doctor = doctor;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token", error: error.message });
  }
};

export default authDoctor;
