import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true, default: 'steamed' },
  price: { type: Number, required: true },
  isVeg: { type: Boolean, default: true },
  spicyLevel: { type: Number, default: 1 },
  isBestseller: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  description: { type: String, default: '' },
  image: { type: String, default: '/assets/momo_hero.jpg' },
  createdAt: { type: Date, default: Date.now }
});

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);
