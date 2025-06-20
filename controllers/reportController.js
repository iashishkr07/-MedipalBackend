import multer from "multer";
import path from "path";
import fs from "fs";
import Report from "../models/report.js";

// 1. Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// 2. Accept only PDF and image files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
    "image/webp",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and image files are allowed."), false);
  }
};

// 3. Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// 4. Upload Report Controller
export const uploadReport = async (req, res) => {
  try {
    const { userId, reportType, doctorName, reportDate, notes, AadharNo } = req.body; // ✅ include AadharNo
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one PDF or image file",
      });
    }

    const report = new Report({
      userId,
      AadharNo, // ✅ now AadharNo is saved to MongoDB
      reportType,
      doctorName,
      reportDate: new Date(reportDate),
      notes,
      files: files.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        path: file.path,
        size: file.size,
      })),
    });

    await report.save();

    res.status(200).json({
      success: true,
      message: "Report uploaded successfully",
      data: report,
    });
  } catch (error) {
    console.error("Upload error:", error.stack);
    res.status(500).json({
      success: false,
      message: "Upload failed. " + error.message,
    });
  }
};

// 5. Get All User Reports
export const getUserReports = async (req, res) => {
  try {
    const AadharNo = req.params.aadharNo;
    const reports = await Report.find({ AadharNo }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Fetch reports error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
    });
  }
};

// 6. Get Single Report
export const getReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user._id;

    const report = await Report.findOne({ _id: reportId, userId });
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Get single report error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error retrieving report",
    });
  }
};

// 7. Delete Report
export const deleteReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user._id;

    const report = await Report.findOne({ _id: reportId, userId });
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Delete files from filesystem
    for (const file of report.files) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    await Report.deleteOne({ _id: reportId });

    res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Delete report error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete report",
    });
  }
};

// 8. Export multer middleware
export const uploadMiddleware = upload.array("files", 10); // accepts max 10 files

export default {
  uploadReport,
  getUserReports,
  getReport,
  deleteReport,
  uploadMiddleware,
};
