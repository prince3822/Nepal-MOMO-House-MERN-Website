import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  customerName: { type: String, trim: true, default: 'Guest' },
  customerPhone: { type: String, required: true, trim: true },
  pickupTime: { type: String, required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
  paymentMethod: { type: String, default: 'UPI_QR' },
  transactionRef: { type: String, default: 'UPI_INTENT' },
  status: { type: String, default: 'Received' },
  createdAt: { type: Date, default: Date.now }
});

export const Order = mongoose.model('Order', orderSchema);
