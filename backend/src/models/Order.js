const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  farmerName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  lineTotal: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  consumer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: {
    type: [orderItemSchema],
    validate: {
      validator: (items) => Array.isArray(items) && items.length > 0,
      message: 'At least one order item is required'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'upi', 'card', 'net_banking', 'wallet'],
    default: 'cod'
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  grandTotal: {
    type: Number,
    required: true,
    min: 0
  },
  invoiceNumber: {
    type: String,
    index: true
  },
  invoiceDate: {
    type: Date
  },
  invoicePdfUrl: {
    type: String
  },
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  }
}, { timestamps: true });

orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
