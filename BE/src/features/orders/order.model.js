// order.model.js - Mongoose schema cho Order
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const shippingInfoSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator(items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: 'Đơn hàng phải có ít nhất một sản phẩm',
      },
    },
    shippingInfo: {
      type: shippingInfoSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'BANK'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    status: {
      type: String,
      // pending: chờ xử lý | packing: đang đóng hàng | sented: đã gửi hàng
      // succeeded: nhận hàng thành công | returning: đang hoàn trả | cancelled: đã hủy
      enum: ['pending', 'packing', 'sented', 'succeeded', 'returning', 'cancelled'],
      default: 'pending',
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    // Lưu vết cổng thanh toán VNPay
    vnpayTransactionNo: {
      type: String,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    // Thời điểm đơn hàng bị hủy (BM hủy hoặc xác nhận hoàn trả)
    inventoryApplied: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'orders',
  }
);

module.exports = mongoose.model('Order', orderSchema);
