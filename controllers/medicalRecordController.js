import MedicalRecord from "../models/medicalRecord.js";
import PDFDocument from "pdfkit";

// Create a new medical record
export const createMedicalRecord = async (req, res) => {
  try {
    console.log("Received request body:", JSON.stringify(req.body, null, 2));

    const {
      recordId,
      aadharNo,
      name,
      age,
      gender,
      weight,
      height,
      bloodPressure,
      sugarLevel,
      cholesterol,
      allergies,
      pastSurgeries,
      currentMedications,
      familyHistory,
      emergencyContact,
      vaccinationHistory,
      dietaryRestrictions,
      mentalHealth,
      sleepQuality,
      lifestyle,
    } = req.body;

    // Only check if recordId exists
    if (!recordId) {
      return res.status(400).json({
        success: false,
        message: "Record ID is required",
        receivedData: req.body,
      });
    }

    // Calculate BMI
    const heightInMeters = parseFloat(height) / 100; // Convert height from cm to meters
    const weightInKg = parseFloat(weight);
    const bmi = (weightInKg / (heightInMeters * heightInMeters)).toString();

    console.log("Creating new medical record with data:", {
      recordId,
      aadharNo,
      name,
      bmi,
    });

    const medicalRecordData = {
      recordId,
      aadharNo,
      name,
      age: age?.toString(),
      gender,
      weight: weight?.toString(),
      height: height?.toString(),
      bmi,
      bloodPressure: bloodPressure?.toString(),
      sugarLevel: sugarLevel?.toString(),
      cholesterol: cholesterol?.toString(),
      allergies: allergies?.toString(),
      pastSurgeries: pastSurgeries?.toString(),
      currentMedications: currentMedications?.toString(),
      familyHistory: familyHistory?.toString(),
      emergencyContact: emergencyContact
        ? {
            name: emergencyContact.name,
            relationship: emergencyContact.relationship,
            phone: emergencyContact.phone,
          }
        : undefined,
      vaccinationHistory: vaccinationHistory?.toString(),
      dietaryRestrictions: dietaryRestrictions?.toString(),
      mentalHealth: mentalHealth
        ? {
            stressLevel: mentalHealth.stressLevel?.toString(),
            anxiety: mentalHealth.anxiety || false,
            depression: mentalHealth.depression || false,
          }
        : undefined,
      sleepQuality: sleepQuality
        ? {
            hoursPerNight: sleepQuality.hoursPerNight?.toString(),
            quality: sleepQuality.quality?.toString(),
          }
        : undefined,
      lifestyle: lifestyle
        ? {
            smoking: lifestyle.smoking || false,
            alcohol: lifestyle.alcohol || false,
            exercise: lifestyle.exercise || false,
            sleep: lifestyle.sleep || false,
          }
        : undefined,
    };

    const medicalRecord = new MedicalRecord(medicalRecordData);

    console.log("Attempting to save medical record...");
    const savedRecord = await medicalRecord.save();
    console.log("Medical record saved successfully:", savedRecord._id);

    res.status(201).json({
      success: true,
      message: "Medical record created successfully",
      data: savedRecord,
    });
  } catch (error) {
    console.error("Create medical record error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
        receivedData: req.body,
      });
    }

    // Handle duplicate recordId error
    if (error.code === 11000 && error.keyPattern?.recordId) {
      return res.status(400).json({
        success: false,
        message: "Record ID already exists",
        receivedData: req.body,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create medical record",
      error: error.message,
    });
  }
};

// Helper to draw a section card
function drawSection(doc, title, lines, y, options = {}) {
  const {
    headerFont = 14,
    contentFont = 11,
    cardPadding = 12,
    cardWidth = 555,
    headerHeight = 28,
    lineSpacing = 18,
  } = options;

  const cardHeight =
    headerHeight + lines.length * lineSpacing + cardPadding * 2;
  const x = 20;

  // Card background
  doc.rect(x, y, cardWidth, cardHeight).fillColor("#f8fafc").fill();

  // Card border
  doc
    .rect(x, y, cardWidth, cardHeight)
    .strokeColor("#2563eb")
    .lineWidth(1)
    .stroke();

  // Header background
  doc.rect(x, y, cardWidth, headerHeight).fillColor("#2563eb").fill();

  // Header text
  doc
    .fontSize(headerFont)
    .fillColor("#fff")
    .text(title, x + cardPadding, y + 6);

  // Content
  doc.fontSize(contentFont).fillColor("#1e293b");
  let currentY = y + headerHeight + cardPadding;
  lines.forEach((line) => {
    doc.text(line, x + cardPadding, currentY);
    currentY += lineSpacing;
  });

  return y + cardHeight + 10;
}

// Get medical record by Aadhar number
export const getMedicalRecordByAadhar = async (req, res) => {
  try {
    const { aadharNo } = req.params;
    if (!aadharNo) {
      return res
        .status(400)
        .json({ success: false, message: "Aadhar number is required" });
    }

    const medicalRecords = await MedicalRecord.find({ aadharNo });
    if (!medicalRecords || medicalRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No medical records found for the given Aadhar number",
      });
    }

    // Prepare personal details from the first record
    const patient = medicalRecords[0];
    const personalDetails = [
      `Name: ${patient.name || "N/A"}`,
      `Aadhar Number: ${patient.aadharNo || "N/A"}`,
      `Age: ${patient.age || "N/A"}`,
      `Gender: ${patient.gender || "N/A"}`,
    ];

    // PDF setup
    const doc = new PDFDocument({
      size: "A4",
      margin: 20,
      info: {
        Title: "Medical History Report",
        Author: "Medical Records System",
        Subject: "Patient Medical History",
      },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=medical-history.pdf"
    );
    doc.pipe(res);

    // --- PAGE 1: Personal Details + First Record ---
    doc
      .fontSize(22)
      .fillColor("#1e40af")
      .text("Medical History Report", { align: "center" });
    doc.moveDown(0.2);
    doc
      .fontSize(12)
      .fillColor("#64748b")
      .text(`Generated on: ${new Date().toLocaleDateString()}`, {
        align: "center",
      });
    doc.moveDown(0.5);

    let y = doc.y;
    y = drawSection(doc, "Personal Details", personalDetails, y, {
      headerFont: 16,
      contentFont: 13,
    });

    // Draw the first record (index 0)
    const record0 = medicalRecords[0];
    y = drawSection(
      doc,
      "Vital Signs",
      [
        `Weight: ${record0.weight} kg`,
        `Height: ${record0.height} cm`,
        `BMI: ${Number(record0.bmi).toFixed(2)}`,
        `Blood Pressure: ${record0.bloodPressure || "N/A"}`,
        `Sugar Level: ${record0.sugarLevel || "N/A"}`,
      ],
      y
    );

    y = drawSection(
      doc,
      "Medical History",
      [
        `Allergies: ${record0.allergies || "N/A"}`,
        `Past Surgeries: ${record0.pastSurgeries || "N/A"}`,
        `Current Medications: ${record0.currentMedications || "N/A"}`,
        `Family History: ${record0.familyHistory || "N/A"}`,
      ],
      y
    );

    const additionalInfo0 = [];
    if (record0.mentalHealth) {
      additionalInfo0.push(
        `Stress Level: ${record0.mentalHealth.stressLevel || "N/A"}`,
        `Anxiety: ${record0.mentalHealth.anxiety ? "Yes" : "No"}`,
        `Depression: ${record0.mentalHealth.depression ? "Yes" : "No"}`
      );
    }
    if (record0.sleepQuality) {
      additionalInfo0.push(
        `Sleep Hours: ${record0.sleepQuality.hoursPerNight || "N/A"}`,
        `Sleep Quality: ${record0.sleepQuality.quality || "N/A"}`
      );
    }
    if (record0.lifestyle) {
      additionalInfo0.push(
        `Smoking: ${record0.lifestyle.smoking ? "Yes" : "No"}`,
        `Alcohol: ${record0.lifestyle.alcohol ? "Yes" : "No"}`,
        `Exercise: ${record0.lifestyle.exercise ? "Yes" : "No"}`,
        `Sleep: ${record0.lifestyle.sleep ? "Yes" : "No"}`
      );
    }
    if (additionalInfo0.length > 0) {
      y = drawSection(doc, "Additional Information", additionalInfo0, y);
    }

    // Footer for page 1
    const footerY1 = doc.page.height - 30;
    doc
      .fontSize(10)
      .fillColor("#64748b")
      .text(`Page 1 of ${medicalRecords.length}`, 20, footerY1, {
        align: "center",
        width: doc.page.width - 40,
      });

    // --- SUBSEQUENT PAGES: Each record (index 1 and up) ---
    for (let idx = 1; idx < medicalRecords.length; idx++) {
      // Check if we need a new page based on content height
      const record = medicalRecords[idx];

      // Calculate required height for this record
      const sections = [
        { title: "Vital Signs", lines: 5 },
        { title: "Medical History", lines: 4 },
      ];

      // Add additional sections
      let additionalLines = 0;
      if (record.mentalHealth) additionalLines += 3;
      if (record.sleepQuality) additionalLines += 2;
      if (record.lifestyle) additionalLines += 4;
      if (additionalLines > 0) {
        sections.push({
          title: "Additional Information",
          lines: additionalLines,
        });
      }

      // Calculate required height
      let requiredHeight = 0;
      sections.forEach((section) => {
        requiredHeight += 28 + section.lines * 18 + 24;
      });

      // Add footer space
      requiredHeight += 30;

      // Add new page if needed
      if (y + requiredHeight > doc.page.height) {
        doc.addPage();
        y = 20;
      }

      // Draw record sections
      y = drawSection(
        doc,
        "Vital Signs",
        [
          `Weight: ${record.weight} kg`,
          `Height: ${record.height} cm`,
          `BMI: ${Number(record.bmi).toFixed(2)}`,
          `Blood Pressure: ${record.bloodPressure || "N/A"}`,
          `Sugar Level: ${record.sugarLevel || "N/A"}`,
        ],
        y
      );

      y = drawSection(
        doc,
        "Medical History",
        [
          `Allergies: ${record.allergies || "N/A"}`,
          `Past Surgeries: ${record.pastSurgeries || "N/A"}`,
          `Current Medications: ${record.currentMedications || "N/A"}`,
          `Family History: ${record.familyHistory || "N/A"}`,
        ],
        y
      );

      const additionalInfo = [];
      if (record.mentalHealth) {
        additionalInfo.push(
          `Stress Level: ${record.mentalHealth.stressLevel || "N/A"}`,
          `Anxiety: ${record.mentalHealth.anxiety ? "Yes" : "No"}`,
          `Depression: ${record.mentalHealth.depression ? "Yes" : "No"}`
        );
      }
      if (record.sleepQuality) {
        additionalInfo.push(
          `Sleep Hours: ${record.sleepQuality.hoursPerNight || "N/A"}`,
          `Sleep Quality: ${record.sleepQuality.quality || "N/A"}`
        );
      }
      if (record.lifestyle) {
        additionalInfo.push(
          `Smoking: ${record.lifestyle.smoking ? "Yes" : "No"}`,
          `Alcohol: ${record.lifestyle.alcohol ? "Yes" : "No"}`,
          `Exercise: ${record.lifestyle.exercise ? "Yes" : "No"}`,
          `Sleep: ${record.lifestyle.sleep ? "Yes" : "No"}`
        );
      }
      if (additionalInfo.length > 0) {
        y = drawSection(doc, "Additional Information", additionalInfo, y);
      }

      // Footer for each page
      const footerY = doc.page.height - 30;
      doc
        .fontSize(10)
        .fillColor("#64748b")
        .text(`Page ${idx + 1} of ${medicalRecords.length}`, 20, footerY, {
          align: "center",
          width: doc.page.width - 40,
        });
    }

    doc.end();
  } catch (error) {
    console.error("Get medical record error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch medical records",
      error: error.message,
    });
  }
};

// Update medical record by Aadhar number
export const updateMedicalRecord = async (req, res) => {
  try {
    const { aadharNo } = req.params;
    const updateData = req.body;

    if (!aadharNo) {
      return res.status(400).json({
        success: false,
        message: "Aadhar number is required",
      });
    }

    // Calculate BMI if height and weight are provided
    if (updateData.height && updateData.weight) {
      const heightInMeters = parseFloat(updateData.height) / 100;
      const weightInKg = parseFloat(updateData.weight);
      updateData.bmi = (
        weightInKg /
        (heightInMeters * heightInMeters)
      ).toString();
    }

    // Convert numeric fields to strings if they exist
    const numericFields = [
      "age",
      "weight",
      "height",
      "bloodPressure",
      "sugarLevel",
      "cholesterol",
    ];
    numericFields.forEach((field) => {
      if (updateData[field]) {
        updateData[field] = updateData[field].toString();
      }
    });

    // Handle nested objects
    if (updateData.mentalHealth) {
      updateData.mentalHealth = {
        stressLevel: updateData.mentalHealth.stressLevel?.toString(),
        anxiety: updateData.mentalHealth.anxiety || false,
        depression: updateData.mentalHealth.depression || false,
      };
    }

    if (updateData.sleepQuality) {
      updateData.sleepQuality = {
        hoursPerNight: updateData.sleepQuality.hoursPerNight?.toString(),
        quality: updateData.sleepQuality.quality?.toString(),
      };
    }

    if (updateData.lifestyle) {
      updateData.lifestyle = {
        smoking: updateData.lifestyle.smoking || false,
        alcohol: updateData.lifestyle.alcohol || false,
        exercise: updateData.lifestyle.exercise || false,
        sleep: updateData.lifestyle.sleep || false,
      };
    }

    const updatedRecord = await MedicalRecord.findOneAndUpdate(
      { aadharNo },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found for the given Aadhar number",
      });
    }

    res.status(200).json({
      success: true,
      message: "Medical record updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Update medical record error:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update medical record",
      error: error.message,
    });
  }
};

// Get latest medical record by Aadhar number
export const getOneMedicalRecordByAadhar = async (req, res) => {
  try {
    const { aadharNo } = req.params;

    if (!aadharNo) {
      return res.status(400).json({
        success: false,
        message: "Aadhar number is required",
      });
    }

    const latestRecord = await MedicalRecord.findOne({ aadharNo })
      .select("weight height bmi bloodPressure sugarLevel")
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order to get the latest record
      .exec();

    if (!latestRecord) {
      return res.status(404).json({
        success: false,
        message: "No medical record found for the given Aadhar number",
      });
    }

    res.status(200).json({
      success: true,
      data: latestRecord,
    });
  } catch (error) {
    console.error("Get latest medical record error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch latest medical record",
      error: error.message,
    });
  }
};

// Get all medical records with specific fields for a specific Aadhar number
export const getAllMedicalRecordsWithFields = async (req, res) => {
  try {
    const { aadharNo } = req.params;

    if (!aadharNo) {
      return res.status(400).json({
        success: false,
        message: "Aadhar number is required",
      });
    }

    const records = await MedicalRecord.find({ aadharNo })
      .select("aadharNo createdAt bloodPressure weight")
      .sort({ createdAt: -1 }); // Sort by createdAt in descending order

    if (!records || records.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No medical records found for the given Aadhar number",
      });
    }

    // Return flat array of records
    const formattedRecords = records.map((record) => ({
      createdAt: record.createdAt,
      bloodPressure: record.bloodPressure,
      weight: record.weight,
    }));

    res.status(200).json({
      success: true,
      data: formattedRecords,
    });
  } catch (error) {
    console.error("Get all medical records error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch medical records",
      error: error.message,
    });
  }
};

// Get all medical records by Aadhar number (JSON response)
export const getAllMedicalRecordsByAadhar = async (req, res) => {
  try {
    const { aadharNo } = req.params;
    if (!aadharNo) {
      return res
        .status(400)
        .json({ success: false, message: "Aadhar number is required" });
    }

    const medicalRecords = await MedicalRecord.find({ aadharNo }).sort({
      createdAt: -1,
    }); // Sort by newest first

    if (!medicalRecords || medicalRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No medical records found for the given Aadhar number",
      });
    }

    res.status(200).json({
      success: true,
      message: "Medical records fetched successfully",
      count: medicalRecords.length,
      data: medicalRecords,
    });
  } catch (error) {
    console.error("Get all medical records error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch medical records",
      error: error.message,
    });
  }
};

// Get latest medical record by Aadhar number (JSON response)
export const getLatestMedicalRecordByAadhar = async (req, res) => {
  try {
    const { aadharNo } = req.params;

    if (!aadharNo) {
      return res.status(400).json({
        success: false,
        message: "Aadhar number is required",
      });
    }

    const latestRecord = await MedicalRecord.findOne({ aadharNo })
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order to get the latest record
      .exec();

    if (!latestRecord) {
      return res.status(404).json({
        success: false,
        message: "No medical record found for the given Aadhar number",
      });
    }

    res.status(200).json({
      success: true,
      message: "Latest medical record fetched successfully",
      data: latestRecord,
    });
  } catch (error) {
    console.error("Get latest medical record error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch latest medical record",
      error: error.message,
    });
  }
};

export default {
  createMedicalRecord,
  getMedicalRecordByAadhar,
  updateMedicalRecord,
  getOneMedicalRecordByAadhar,
  getAllMedicalRecordsWithFields,
  getAllMedicalRecordsByAadhar,
  getLatestMedicalRecordByAadhar,
};
