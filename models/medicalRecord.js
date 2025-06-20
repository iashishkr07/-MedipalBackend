import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    recordId: {
      type: String,
      required: true,
      unique: true,
    },
    aadharNo: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    age: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    weight: {
      type: String,
      required: true,
    },
    height: {
      type: String,
      required: true,
    },
    bmi: {
      type: String,
      required: true,
    },
    bloodPressure: {
      type: String,
    },
    sugarLevel: {
      type: String,
    },
    cholesterol: {
      type: String,
    },
    allergies: {
      type: String,
    },
    pastSurgeries: {
      type: String,
    },
    currentMedications: {
      type: String,
    },
    familyHistory: {
      type: String,
    },
    vaccinationHistory: {
      type: String,
    },
    dietaryRestrictions: {
      type: String,
    },
    emergencyContact: {
      name: {
        type: String,
        required: true,
      },
      relationship: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    mentalHealth: {
      stressLevel: {
        type: String,
      },
      anxiety: {
        type: Boolean,
        default: false,
      },
      depression: {
        type: Boolean,
        default: false,
      },
    },
    sleepQuality: {
      hoursPerNight: {
        type: String,
      },
      quality: {
        type: String,
      },
    },
    lifestyle: {
      smoking: {
        type: Boolean,
        default: false,
      },
      alcohol: {
        type: Boolean,
        default: false,
      },
      exercise: {
        type: Boolean,
        default: false,
      },
      sleep: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);

export default MedicalRecord;
