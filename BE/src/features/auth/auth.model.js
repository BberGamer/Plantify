// auth.model.js - Mongoose schema cho User (đăng ký, đăng nhập)
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: 'Nhà riêng',
      trim: true,
    },
    receiverName: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    street: {
      type: String,
      required: [true, 'Địa chỉ chi tiết là bắt buộc'],
      trim: true,
    },
    provinceCode: {
      type: String,
      required: [true, 'Tỉnh/thành phố là bắt buộc'],
      trim: true,
    },
    provinceName: {
      type: String,
      required: [true, 'Tỉnh/thành phố là bắt buộc'],
      trim: true,
    },
    wardCode: {
      type: String,
      required: [true, 'Xã/phường là bắt buộc'],
      trim: true,
    },
    wardName: {
      type: String,
      required: [true, 'Xã/phường là bắt buộc'],
      trim: true,
    },
    fullAddress: {
      type: String,
      required: [true, 'Địa chỉ đầy đủ là bắt buộc'],
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Họ tên là bắt buộc'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc'],
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'business manager', 'content manager'],
      default: 'customer',
    },
    status: {
      type: Boolean,
      default: true,
    },
    resetPasswordOTP: {
      type: String,
      default: null,
    },
    resetPasswordOTPExpires: {
      type: Date,
      default: null,
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema, 'Users');
