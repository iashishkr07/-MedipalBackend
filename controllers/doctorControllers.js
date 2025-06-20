import Doctor from "../models/doctors.js";
import jwt from "jsonwebtoken";

export const getDoctorByName = async (req, res) => {
  const { name } = req.params;
  try {
    const doctor = await Doctor.findOne({
      name: { $regex: name, $options: "i" },
    });
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === email && password === password) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      res.json({ success: true, token });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Invalid doctor credentials" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    if (!req.doctor) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    // Optionally, you can filter out sensitive fields like password
    const { password, ...doctorData } = req.doctor.toObject();
    res.status(200).json({ success: true, data: doctorData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
