import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserC:medi\backendmodels\report.js",
    required: true,
  },
  AadharNo: { type: String, default: "" },
  reportType: {
    type: String,
    enum: ["bloodTest", "xray", "mri", "other"],
    required: true,
  },
  doctorName: {
    type: String,
    required: true,
  },
  reportDate: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
  },
  files: [
    {
      filename: String,
      originalName: String, // ✅ corrected from originalname
      mimetype: String,
      path: String,
      size: Number,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
reportSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Report = mongoose.model("Report", reportSchema);

export default Report;
