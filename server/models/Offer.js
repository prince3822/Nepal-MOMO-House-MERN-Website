import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  offerId: { type: String, required: true, unique: true },
  id: { type: String, required: true },
  title: { type: String, required: true },
  badge: { type: String, default: '' },
  description: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  priceHighlight: { type: String, default: '' },
  discount: { type: String, default: '' },
  code: { type: String, default: '' },
  bgGradient: { type: String, default: 'from-amber-600 to-red-600' },
  createdAt: { type: Date, default: Date.now }
});

export const Offer = mongoose.model('Offer', offerSchema);
