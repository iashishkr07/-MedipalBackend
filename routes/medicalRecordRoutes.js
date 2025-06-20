import express from "express";
import {
  createMedicalRecord,
  getMedicalRecordByAadhar,
  updateMedicalRecord,
  getOneMedicalRecordByAadhar,
  getAllMedicalRecordsWithFields,
  getAllMedicalRecordsByAadhar,
  getLatestMedicalRecordByAadhar,
} from "../controllers/medicalRecordController.js";
import MedicalRecord from "../models/medicalRecord.js";

const router = express.Router();

// Create a new medical record
router.post("/create", createMedicalRecord);

// Get all medical records with specific fields for a specific Aadhar number
router.get("/me/:aadharNo", getAllMedicalRecordsWithFields);

// Get all medical records by Aadhar number (JSON response)
router.get("/all/:aadharNo", getAllMedicalRecordsByAadhar);

// Get latest medical record by Aadhar number (JSON response)
router.get("/latest/:aadharNo", getLatestMedicalRecordByAadhar);

// Get one medical record with vital fields by Aadhar number (weight, height, bmi, bloodPressure, sugarLevel)
router.get("/vitals/:aadharNo", getOneMedicalRecordByAadhar);

// Get all medical records by Aadhar number (PDF response)
router.get("/:aadharNo", getMedicalRecordByAadhar);

// Update medical record by Aadhar number
router.put("/:aadharNo", updateMedicalRecord);

// Delete medical record by record ID
router.delete("/:recordId", async (req, res) => {
  try {
    const { recordId } = req.params;

    if (!recordId) {
      return res.status(400).json({
        success: false,
        message: "Record ID is required",
      });
    }

    const deletedRecord = await MedicalRecord.findOneAndDelete({ recordId });

    if (!deletedRecord) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Medical record deleted successfully",
      data: deletedRecord,
    });
  } catch (error) {
    console.error("Delete medical record error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete medical record",
      error: error.message,
    });
  }
});

// Search medical records by name
router.get("/search/name/:name", async (req, res) => {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const records = await MedicalRecord.find({
      name: { $regex: name, $options: "i" },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Medical records found",
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error("Search medical records error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search medical records",
      error: error.message,
    });
  }
});

// Get statistics for a specific Aadhar number
router.get("/stats/:aadharNo", async (req, res) => {
  try {
    const { aadharNo } = req.params;

    if (!aadharNo) {
      return res.status(400).json({
        success: false,
        message: "Aadhar number is required",
      });
    }

    const records = await MedicalRecord.find({ aadharNo }).sort({
      createdAt: -1,
    });

    if (!records || records.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No medical records found for the given Aadhar number",
      });
    }

    const latestRecord = records[0];
    const oldestRecord = records[records.length - 1];

    // Calculate average BMI if multiple records exist
    const avgBmi =
      records.length > 1
        ? (
            records.reduce(
              (sum, record) => sum + parseFloat(record.bmi || 0),
              0
            ) / records.length
          ).toFixed(2)
        : parseFloat(latestRecord.bmi || 0);

    const stats = {
      totalRecords: records.length,
      latestRecord: {
        date: latestRecord.createdAt,
        bmi: latestRecord.bmi,
        weight: latestRecord.weight,
        bloodPressure: latestRecord.bloodPressure,
        sugarLevel: latestRecord.sugarLevel,
      },
      oldestRecord: {
        date: oldestRecord.createdAt,
        bmi: oldestRecord.bmi,
        weight: oldestRecord.weight,
      },
      averageBMI: avgBmi,
      recordHistory: records.map((record) => ({
        date: record.createdAt,
        weight: record.weight,
        bmi: record.bmi,
      })),
    };

    res.status(200).json({
      success: true,
      message: "Statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Get statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get statistics",
      error: error.message,
    });
  }
});

export default router;
