import bcrypt from "bcryptjs";
import validator from "validator";
import User from "../models/user.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

const createUser = async (req, res) => {
  try {
    const { FullName, Email, Phone, Password, AadharNo } = req.body;

    // Basic validations
    if (!FullName || !Email || !Phone || !Password || !AadharNo) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (!validator.isEmail(Email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    if (FullName.trim().length > 50) {
      return res
        .status(400)
        .json({ success: false, message: "Name is too long" });
    }

    if (Password.length < 6 || Password.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 6 and 50 characters",
      });
    }

    // Check for existing user
    const existing = await User.findOne({ Email: Email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(Password, 10);

    let profilePicUrl = "";
    let aadharImgUrl = "";

    // Handle file uploads
    if (!req.files?.profilePic?.[0]) {
      return res.status(400).json({
        success: false,
        message: "Profile picture is required",
      });
    }
    if (!req.files?.aadharImg?.[0]) {
      return res.status(400).json({
        success: false,
        message: "Aadhar image is required",
      });
    }

    try {
      const profileResult = await cloudinary.uploader.upload(
        req.files.profilePic[0].path,
        { folder: "users/profile" }
      );
      profilePicUrl = profileResult.secure_url;
      fs.unlinkSync(req.files.profilePic[0].path);
    } catch (err) {
      console.error("Profile Pic Upload Error:", err);
    }

    if (req.files?.aadharImg?.[0]) {
      try {
        const aadharResult = await cloudinary.uploader.upload(
          req.files.aadharImg[0].path,
          { folder: "users/aadhar" }
        );
        aadharImgUrl = aadharResult.secure_url;
        fs.unlinkSync(req.files.aadharImg[0].path);
      } catch (err) {
        console.error("Aadhar Upload Error:", err);
      }
    }

    // Create user
    const user = new User({
      FullName: FullName.trim(),
      Email: Email.trim().toLowerCase(),
      Phone,
      Password: hashedPassword,
      profilePic: profilePicUrl,
      aadharImg: aadharImgUrl,
      AadharNo,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User added successfully",
      user,
    });
  } catch (error) {
    console.error("Add User Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add user",
      error: error.message,
    });
  }
};

const getUserAadharNo = async (req, res) => {
  try {
    const { Email } = req.body;

    if (!Email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!validator.isEmail(Email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const user = await User.findOne({ Email: Email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      AadharNo: user.AadharNo,
    });
  } catch (error) {
    console.error("Get User Aadhar Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user Aadhar number",
      error: error.message,
    });
  }
};

export { createUser, getUserAadharNo };
