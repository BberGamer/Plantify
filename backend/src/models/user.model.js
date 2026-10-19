// models/user.model.js - Mongoose Schema cho User (Plantify Capstone)
const mongoose = require("mongoose");

// Schema nguoi dung
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Họ tên là bắt buộc"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    password: {
      type: String,
      required: [
        function () {
          return !this.isGoogleAccount;
        },
        "Mật khẩu là bắt buộc",
      ],
    },
    role: {
      type: String,
      enum: ["customer", "admin", "manager"],
      default: "customer",
    },
    status: {
      type: Boolean,
      default: true,
    },
    // Phan biet tai khoan dang ky qua Google va tai khoan email thuong
    isGoogleAccount: {
      type: Boolean,
      default: false,
    },
    resetPasswordOTP: {
      type: String,
      default: null,
    },
    resetPasswordOTPExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual ho tro ca isAccountGoogle
userSchema.virtual("isAccountGoogle").get(function () {
  return this.isGoogleAccount;
});

module.exports = mongoose.model("User", userSchema, "Users");
