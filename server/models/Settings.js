import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  name: { type: String, default: 'Nepal MOMO House' },
  tagline: { type: String, default: 'Authentic Himalayan Taste' },
  logo: { type: String, default: '/assets/logo.jpg' },
  city: { type: String, default: 'Raxaul' },
  state: { type: String, default: 'Bihar' },
  country: { type: String, default: 'India' },
  currency: { type: String, default: '₹' },
  fullAddress: { type: String, default: 'Main Road, Near Railway Station, Raxaul, Bihar 845305' },
  phone: { type: String, default: '+91 9523349571' },
  whatsapp: { type: String, default: '919523349571' },
  adminMobile: { type: String, default: '9523349571' },
  upiVpa: { type: String, default: '9523349571@ybl' },
  razorpayKeyId: { type: String, default: 'rzp_test_TbGX3wdVxstTNb' },
  openingHours: { type: String, default: 'Mon - Sun: 11:00 AM - 10:00 PM' },
  googleMapsUrl: { type: String, default: 'https://maps.google.com/maps?q=26.9784,84.8504&hl=en&z=16&output=embed' },
  announcement: { type: String, default: '🔥 Special Festival Offer: Flat 20% OFF on all Fried Momos! Order Online for Quick Takeaway.' },
  isAcceptingOrders: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

export const Settings = mongoose.model('Settings', settingsSchema);
