import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // userId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "user",
    //   required: true,
    // },
    bookingId: {
      type: String,
      required: true,
    //   unique: true,
    },
    aadharNo: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{12}$/.test(v); // Validates 12-digit Aadhaar
        },
        message: (props) => `${props.value} is not a valid Aadhaar number!`,
      },
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    doctor: {
      type: String,
      required: true,
    },
    doctoremail: {
      type: String,
      required: true,
    },
    fees: {
      type: String,
      required: true,
    },
    timeslot: {
      type: String,
      required: true,
    },
    date: {
      type: String, // Or use Date type if desired
      required: true,
    },
    message: {
      type: String,
    },
    formType: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Optional: add indexes
bookingSchema.index({ bookingId: 1 }, { unique: true });
bookingSchema.index({ email: 1 });
bookingSchema.index({ doctor: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
