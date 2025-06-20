import express from "express";
import {
  createUser,
  getUserAadharNo,
} from "../controllers/usersControllers.js";
import upload from "../middlewares/upload.js";
import verifyToken from "../middlewares/verifyToken.js";
import User from "../models/user.js";

const router = express.Router();

router.post(
  "/signup",
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "aadharImg", maxCount: 1 },
  ]),
  createUser
);

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-Password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/get-aadhar", getUserAadharNo);

export default router;
