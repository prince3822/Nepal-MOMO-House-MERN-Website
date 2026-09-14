import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Order } from './models/Order.js';
import { Settings } from './models/Settings.js';
import { MenuItem } from './models/MenuItem.js';
import { Offer } from './models/Offer.js';

dotenv.config();

const app = express();

// Apply helmet security headers immediately after initializing express
app.use(helmet());

// Configure CORS to allow origin dynamically and allow credentials in production
app.use(cors({ origin: true, credentials: true }));

app.use(express.json());

// General API rate limiter (150 requests per 15 minutes per IP)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: {
    status: 429,
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict Auth & Order rate limiter (15 requests per 15 minutes per IP)
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    status: 429,
    success: false,
    error: 'Too many requests to protected auth/orders endpoints. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiters
app.use('/api/', generalLimiter);
app.use('/api/orders', strictLimiter);
app.use('/api/admin', strictLimiter);

// Helper: Input Sanitization (Trim and escape HTML/script characters)
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

const sanitizePhone = (phone) => {
  if (!phone) return '';
  return String(phone).trim().replace(/\D/g, '').slice(0, 10);
};

// In-memory fallback storage when MongoDB connection is unavailable
const inMemoryOrders = [];
let inMemorySettings = null;
const inMemoryMenu = [];
let inMemoryOffers = [
  {
    id: "offer-1",
    offerId: "offer-1",
    title: "Momo Special Combo",
    subtitle: "Steam Momo + Kurkure Momo + Cold Drink",
    description: "Steam Momo + Kurkure Momo + Cold Drink",
    discount: "Save ₹40",
    priceHighlight: "Save ₹40",
    code: "MOMO40",
    bgGradient: "from-amber-600 to-red-600",
    badge: "Popular Combo"
  },
  {
    id: "offer-2",
    offerId: "offer-2",
    title: "Chowmein & Momo Combo",
    subtitle: "1 Veg Chowmein + 1 Veg Steam Momo",
    description: "1 Veg Chowmein + 1 Veg Steam Momo",
    discount: "Only ₹170",
    priceHighlight: "Only ₹170",
    code: "COMBO170",
    bgGradient: "from-red-600 to-rose-700",
    badge: "Best Value"
  }
];

// Initialize Razorpay
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_TbGX3wdVxstTNb';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'InVkidkdWUy5hiXBSjTqGfab';
const adminPin = process.env.ADMIN_PIN || '1292';

const razorpayInstance = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret
});

// MongoDB Connection using process.env.MONGO_URI
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nepal_momo_house';
mongoose
  .connect(mongoUri)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => {
    console.error('⚠️ MongoDB Connection Notice (Using In-Memory Fallback):', err.message);
  });

// Helper: Generate unique 4-digit token prefixed with '#'
const generateUniqueToken = async () => {
  let isUnique = false;
  let token = '';

  while (!isUnique) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    token = `#${randomNum}`;

    try {
      if (mongoose.connection.readyState === 1) {
        const existing = await Order.findOne({ token });
        if (!existing) isUnique = true;
      } else {
        const existing = inMemoryOrders.find((o) => o.token === token);
        if (!existing) isUnique = true;
      }
    } catch (err) {
      isUnique = true;
    }
  }
  return token;
};

// 1. Lightweight Ping/Health Endpoint: GET /api/health
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    time: new Date(),
    dbConnected: mongoose.connection.readyState === 1,
    message: 'Nepal MOMO House Backend is Live!'
  });
});

// 2. POST /api/admin/send-otp (Send Mobile OTP)
app.post('/api/admin/send-otp', (req, res) => {
  const { phone } = req.body;
  console.log(`📲 Mock Admin OTP requested for ${phone || '+91 9523349571'}`);
  return res.json({
    success: true,
    message: 'OTP sent successfully',
    demoOtp: '123456',
    validForMins: 5
  });
});

// 3. POST /api/admin/verify-otp (Verify Mobile OTP)
app.post('/api/admin/verify-otp', (req, res) => {
  const { otp } = req.body;
  if (!otp) {
    return res.status(400).json({ success: false, error: 'OTP is required' });
  }

  if (String(otp).trim() === '123456') {
    const sessionToken = `admin_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    console.log('📲 Admin authenticated successfully via Mobile OTP');
    return res.json({
      success: true,
      token: sessionToken,
      message: 'OTP verified successfully'
    });
  }

  console.log('❌ Invalid Admin OTP attempt');
  return res.status(400).json({
    success: false,
    error: 'Invalid OTP, please enter 123456'
  });
});

// 4. POST /api/admin/verify-pin (Legacy PIN Backup)
app.post('/api/admin/verify-pin', (req, res) => {
  const { pin } = req.body;
  if (!pin) {
    return res.status(400).json({ success: false, error: 'PIN is required' });
  }

  if (String(pin).trim() === String(adminPin).trim() || String(pin).trim() === '123456') {
    const sessionToken = `admin_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    console.log('🔑 Admin authenticated successfully');
    return res.json({
      success: true,
      token: sessionToken,
      message: 'Authentication successful'
    });
  }

  console.log('❌ Invalid Admin attempt');
  return res.status(401).json({
    success: false,
    error: 'Incorrect credentials. Access Denied.'
  });
});

// 4.5 GET /api/admin/daily-summary (Today's Sales & Revenue Mini-Analytics)
app.get('/api/admin/daily-summary', async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    let todayOrders = [];
    if (mongoose.connection.readyState === 1) {
      todayOrders = await Order.find({
        createdAt: { $gte: startOfToday, $lte: endOfToday }
      });
    } else {
      todayOrders = inMemoryOrders.filter((o) => {
        const d = new Date(o.createdAt || o.timestamp || o.placedAt || 0);
        return d >= startOfToday && d <= endOfToday;
      });
    }

    const todayOrdersCount = todayOrders.length;
    const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    // Aggregate top selling item today
    const itemQuantityMap = {};
    todayOrders.forEach((o) => {
      if (Array.isArray(o.items)) {
        o.items.forEach((it) => {
          const name = it.name || 'Unknown Item';
          itemQuantityMap[name] = (itemQuantityMap[name] || 0) + (Number(it.quantity) || 1);
        });
      }
    });

    let topSellingItem = 'N/A';
    let maxQty = 0;
    Object.entries(itemQuantityMap).forEach(([name, qty]) => {
      if (qty > maxQty) {
        maxQty = qty;
        topSellingItem = name;
      }
    });

    return res.json({
      success: true,
      todayRevenue,
      todayOrdersCount,
      topSellingItem
    });
  } catch (err) {
    console.error('Error calculating daily summary:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. GET /api/settings (Shop Settings)
app.get('/api/settings', async (req, res) => {
  try {
    const updatedMapsUrl = 'https://www.google.com/maps/search/?api=1&query=Nepal+MOMO+House+Laxmipur+Karbola+Rd+near+The+Chandrasheel+School+Raxaul+Bihar+845305';
    const updatedAddress = 'Laxmipur, Karbola Rd, near The Chandrasheel School, Raxaul, Bihar 845305';

    if (mongoose.connection.readyState === 1) {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings({
          fullAddress: updatedAddress,
          googleMapsUrl: updatedMapsUrl
        });
        await settings.save();
      } else if (settings.googleMapsUrl?.includes('embed') || !settings.fullAddress?.includes('Karbola')) {
        settings.fullAddress = updatedAddress;
        settings.googleMapsUrl = updatedMapsUrl;
        await settings.save();
      }
      return res.json({ success: true, settings });
    } else {
      if (!inMemorySettings) {
        inMemorySettings = {
          name: 'Nepal MOMO House',
          tagline: 'Authentic Himalayan Taste',
          logo: '/assets/logo.jpg',
          city: 'Raxaul',
          state: 'Bihar',
          country: 'India',
          currency: '₹',
          fullAddress: updatedAddress,
          phone: '+91 9523349571',
          whatsapp: '919523349571',
          adminMobile: '9523349571',
          upiVpa: '9523349571@ybl',
          razorpayKeyId,
          openingHours: 'Mon - Sun: 11:00 AM - 10:00 PM',
          googleMapsUrl: updatedMapsUrl,
          announcement: '🔥 Special Festival Offer: Flat 20% OFF on all Fried Momos! Order Online for Quick Takeaway.'
        };
      } else {
        inMemorySettings.fullAddress = updatedAddress;
        inMemorySettings.googleMapsUrl = updatedMapsUrl;
      }
      return res.json({ success: true, settings: inMemorySettings });
    }
  } catch (err) {
    console.error('Error fetching settings:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST /api/settings (Save Shop Settings)
app.post('/api/settings', async (req, res) => {
  try {
    const updatedData = req.body;
    if (mongoose.connection.readyState === 1) {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings(updatedData);
      } else {
        Object.assign(settings, updatedData, { updatedAt: new Date() });
      }
      await settings.save();
      console.log('⚙️ Shop Settings updated in MongoDB!');
      return res.json({ success: true, settings });
    } else {
      inMemorySettings = { ...inMemorySettings, ...updatedData };
      console.log('⚙️ Shop Settings updated in Memory!');
      return res.json({ success: true, settings: inMemorySettings });
    }
  } catch (err) {
    console.error('Error updating settings:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 5. GET /api/menu (Get Menu Items)
app.get('/api/menu', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const items = await MenuItem.find().sort({ createdAt: -1 });
      return res.json({ success: true, items });
    } else {
      return res.json({ success: true, items: inMemoryMenu });
    }
  } catch (err) {
    console.error('Error fetching menu items:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 6. POST /api/menu (Create Menu Item)
app.post('/api/menu', async (req, res) => {
  try {
    const itemData = req.body;
    const itemId = itemData.itemId || itemData.id || `momo-${Date.now()}`;
    const payload = { ...itemData, itemId, id: itemId };

    if (mongoose.connection.readyState === 1) {
      const newItem = new MenuItem(payload);
      await newItem.save();
      return res.status(201).json({ success: true, item: newItem });
    } else {
      inMemoryMenu.unshift(payload);
      return res.status(201).json({ success: true, item: payload });
    }
  } catch (err) {
    console.error('Error creating menu item:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 7. PUT /api/menu/:id (Update Menu Item)
app.put('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = req.body;

    if (mongoose.connection.readyState === 1) {
      const item = await MenuItem.findOneAndUpdate(
        { $or: [{ itemId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
        { $set: updatedFields },
        { new: true }
      );
      return res.json({ success: true, item });
    } else {
      const idx = inMemoryMenu.findIndex((i) => i.itemId === id || i.id === id);
      if (idx !== -1) {
        inMemoryMenu[idx] = { ...inMemoryMenu[idx], ...updatedFields };
        return res.json({ success: true, item: inMemoryMenu[idx] });
      }
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
  } catch (err) {
    console.error('Error updating menu item:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 8. DELETE /api/menu/:id (Delete Menu Item)
app.delete('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      await MenuItem.deleteOne({
        $or: [{ itemId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }]
      });
      return res.json({ success: true, message: 'Item deleted successfully' });
    } else {
      const idx = inMemoryMenu.findIndex((i) => i.itemId === id || i.id === id);
      if (idx !== -1) {
        inMemoryMenu.splice(idx, 1);
      }
      return res.json({ success: true, message: 'Item deleted successfully' });
    }
  } catch (err) {
    console.error('Error deleting menu item:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 9. PATCH /api/menu/:id/toggle & /api/menu/:id/toggle-availability (Toggle Availability)
app.patch(['/api/menu/:id/toggle', '/api/menu/:id/toggle-availability'], async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const item = await MenuItem.findOne({
        $or: [{ itemId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }]
      });
      if (item) {
        item.isAvailable = !item.isAvailable;
        await item.save();
        return res.json({ success: true, item });
      }
      return res.status(404).json({ success: false, error: 'Item not found' });
    } else {
      const idx = inMemoryMenu.findIndex((i) => i.itemId === id || i.id === id);
      if (idx !== -1) {
        inMemoryMenu[idx].isAvailable = !inMemoryMenu[idx].isAvailable;
        return res.json({ success: true, item: inMemoryMenu[idx] });
      }
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
  } catch (err) {
    console.error('Error toggling menu item:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 9.5 GET /api/offers (Fetch All Offers)
app.get('/api/offers', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let dbOffers = await Offer.find().sort({ createdAt: -1 });
      if (!dbOffers || dbOffers.length === 0) {
        // Seed default offers if collection is empty
        const seeded = await Offer.insertMany(inMemoryOffers);
        return res.json({ success: true, offers: seeded });
      }
      return res.json({ success: true, offers: dbOffers });
    } else {
      return res.json({ success: true, offers: inMemoryOffers });
    }
  } catch (err) {
    console.error('Error fetching offers:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 9.6 POST /api/offers (Create New Offer)
app.post('/api/offers', async (req, res) => {
  try {
    const offerData = req.body;
    const offerId = offerData.id || offerData.offerId || `offer-${Date.now()}`;
    const payload = {
      ...offerData,
      id: offerId,
      offerId,
      subtitle: offerData.description || offerData.subtitle || '',
      description: offerData.description || offerData.subtitle || '',
      discount: offerData.priceHighlight || offerData.discount || '',
      priceHighlight: offerData.priceHighlight || offerData.discount || ''
    };

    if (mongoose.connection.readyState === 1) {
      const newOffer = new Offer(payload);
      await newOffer.save();
      return res.status(201).json({ success: true, offer: newOffer });
    } else {
      inMemoryOffers.unshift(payload);
      return res.status(201).json({ success: true, offer: payload });
    }
  } catch (err) {
    console.error('Error creating offer:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 9.7 PUT /api/offers/:id (Update Offer)
app.put('/api/offers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = { ...req.body };
    if (updatedFields.description && !updatedFields.subtitle) {
      updatedFields.subtitle = updatedFields.description;
    }
    if (updatedFields.priceHighlight && !updatedFields.discount) {
      updatedFields.discount = updatedFields.priceHighlight;
    }

    if (mongoose.connection.readyState === 1) {
      const offer = await Offer.findOneAndUpdate(
        { $or: [{ offerId: id }, { id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
        { $set: updatedFields },
        { new: true }
      );
      return res.json({ success: true, offer });
    } else {
      const idx = inMemoryOffers.findIndex((o) => o.offerId === id || o.id === id || String(o._id) === id);
      if (idx !== -1) {
        inMemoryOffers[idx] = { ...inMemoryOffers[idx], ...updatedFields };
        return res.json({ success: true, offer: inMemoryOffers[idx] });
      }
      return res.status(404).json({ success: false, error: 'Offer not found' });
    }
  } catch (err) {
    console.error('Error updating offer:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 9.8 DELETE /api/offers/:id (Delete Offer)
app.delete('/api/offers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      await Offer.deleteOne({
        $or: [{ offerId: id }, { id }, { _id: mongoose.isValidObjectId(id) ? id : null }]
      });
      return res.json({ success: true, message: 'Offer deleted successfully' });
    } else {
      const idx = inMemoryOffers.findIndex((o) => o.offerId === id || o.id === id || String(o._id) === id);
      if (idx !== -1) {
        inMemoryOffers.splice(idx, 1);
      }
      return res.json({ success: true, message: 'Offer deleted successfully' });
    }
  } catch (err) {
    console.error('Error deleting offer:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 10. POST /api/payment/create-order
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { totalAmount } = req.body;
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid total amount' });
    }

    const options = {
      amount: Math.round(totalAmount * 100), // amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    try {
      const order = await razorpayInstance.orders.create(options);
      return res.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: razorpayKeyId
      });
    } catch (rzpErr) {
      console.log('Razorpay API notice (using fallback order id):', rzpErr.message);
      const dummyOrderId = `order_${Math.random().toString(36).substring(2, 14)}`;
      return res.json({
        success: true,
        orderId: dummyOrderId,
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        key: razorpayKeyId
      });
    }
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 11. POST /api/payment/verify
app.post('/api/payment/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerName,
      customerPhone,
      pickupTime,
      items,
      totalAmount,
      notes
    } = req.body;

    const cleanPhone = sanitizePhone(customerPhone);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        error: 'Valid 10-digit mobile number is required.'
      });
    }

    const nameToSave = sanitizeInput(customerName) || 'Guest';

    // Verify HMAC SHA256 signature if order & payment ID present
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const secret = process.env.RAZORPAY_KEY_SECRET || razorpayKeySecret;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        console.error('❌ Razorpay Signature Verification Failed!');
        return res.status(400).json({
          success: false,
          error: 'Invalid payment signature'
        });
      }
    }

    // Generate unique 4-digit token prefixed with '#'
    const token = await generateUniqueToken();

    const orderPayload = {
      token,
      customerName: nameToSave,
      customerPhone: cleanPhone,
      pickupTime: sanitizeInput(pickupTime) || '15-20 mins',
      items: items || [],
      totalAmount,
      paymentStatus: 'PAID',
      paymentMethod: 'RAZORPAY_PAYMENT_SHEET',
      transactionRef: sanitizeInput(razorpay_payment_id) || `pay_${Date.now()}`,
      notes: sanitizeInput(notes),
      createdAt: new Date()
    };

    let createdOrder = null;

    if (mongoose.connection.readyState === 1) {
      const newOrder = new Order(orderPayload);
      createdOrder = await newOrder.save();
    } else {
      createdOrder = { _id: `mem_${Date.now()}`, ...orderPayload };
      inMemoryOrders.unshift(createdOrder);
    }

    console.log(`🥟 Razorpay Prepaid Order Verified & Created! Token: ${token}, Ref: ${createdOrder.transactionRef}`);

    return res.status(201).json({
      success: true,
      token,
      orderId: createdOrder._id,
      order: createdOrder
    });
  } catch (err) {
    console.error('Error verifying payment:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 12. POST /api/orders/create (direct legacy endpoint)
app.post('/api/orders/create', async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      pickupTime,
      items,
      totalAmount,
      transactionRef,
      paymentMethod
    } = req.body;

    const cleanPhone = sanitizePhone(customerPhone);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        error: 'Valid 10-digit mobile number is required.'
      });
    }

    const nameToSave = sanitizeInput(customerName) || 'Guest';
    const token = await generateUniqueToken();

    const orderPayload = {
      token,
      customerName: nameToSave,
      customerPhone: cleanPhone,
      pickupTime: sanitizeInput(pickupTime) || '15-20 mins',
      items: items || [],
      totalAmount,
      paymentStatus: 'PAID',
      paymentMethod: sanitizeInput(paymentMethod) || 'UPI_INTENT',
      transactionRef: sanitizeInput(transactionRef) || 'UPI_INTENT',
      createdAt: new Date()
    };

    let createdOrder = null;

    if (mongoose.connection.readyState === 1) {
      const newOrder = new Order(orderPayload);
      createdOrder = await newOrder.save();
    } else {
      createdOrder = { _id: `mem_${Date.now()}`, ...orderPayload };
      inMemoryOrders.unshift(createdOrder);
    }

    console.log(`🥟 New Order Created! Token: ${token}, Amount: ₹${totalAmount}`);

    return res.status(201).json({
      success: true,
      token,
      orderId: createdOrder._id,
      order: createdOrder
    });
  } catch (err) {
    console.error('Error creating order:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Server error creating order'
    });
  }
});

// 13. GET /api/orders & /api/orders/live (FIFO Sorted: Oldest first createdAt: 1)
app.get(['/api/orders', '/api/orders/live'], async (req, res) => {
  try {
    let orders = [];
    if (mongoose.connection.readyState === 1) {
      // Sort ascending (createdAt: 1) so oldest active orders appear at top (FIFO)
      orders = await Order.find().sort({ createdAt: 1 });
    } else {
      orders = [...inMemoryOrders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    return res.json({
      success: true,
      orders
    });
  } catch (err) {
    console.error('Error fetching live orders:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch live orders'
    });
  }
});

// 13.4 GET /api/orders/lookup (Find past orders by customer phone number)
app.get('/api/orders/lookup', async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number parameter is required' });
    }

    const cleanPhone = sanitizePhone(phone);
    if (!cleanPhone) {
      return res.status(400).json({ success: false, error: 'Valid 10-digit phone number is required' });
    }
    let matchedOrders = [];

    if (mongoose.connection.readyState === 1) {
      matchedOrders = await Order.find({
        $or: [
          { customerPhone: cleanPhone },
          { customerPhone: phone.trim() },
          { customerPhone: new RegExp(cleanPhone.slice(-10) + '$') }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(10);
    } else {
      matchedOrders = inMemoryOrders
        .filter((o) => {
          const p = (o.customerPhone || '').replace(/\D/g, '');
          return p === cleanPhone || p.endsWith(cleanPhone.slice(-10));
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);
    }

    return res.json({
      success: true,
      orders: matchedOrders
    });
  } catch (err) {
    console.error('Error looking up orders by phone:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 13.5 GET /api/orders/:id (Fetch single order status by id or token)
app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let order = null;

    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (mongoose.isValidObjectId(id)) {
        query = { _id: id };
      } else {
        query = { $or: [{ token: id }, { token: `#${id}` }] };
      }
      order = await Order.findOne(query);
    } else {
      order = inMemoryOrders.find(
        (o) => String(o._id) === id || o.id === id || o.token === id || o.token === `#${id}`
      );
    }

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    return res.json({ success: true, order });
  } catch (err) {
    console.error('Error fetching order by ID:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 14. PATCH & PUT /api/orders/:id/status (Order Status Persistence)
app.use('/api/orders/:id/status', async (req, res, next) => {
  if (req.method === 'PATCH' || req.method === 'PUT' || req.method === 'POST') {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, error: 'Status is required' });
      }

      let normalizedStatus = status.trim();
      if (normalizedStatus === 'COMPLETED' || normalizedStatus === 'Completed') normalizedStatus = 'Completed';
      if (normalizedStatus === 'PREPARING' || normalizedStatus === 'Preparing') normalizedStatus = 'Preparing';
      if (normalizedStatus === 'RECEIVED' || normalizedStatus === 'PENDING' || normalizedStatus === 'Pending' || normalizedStatus === 'Received') normalizedStatus = 'Pending';
      if (normalizedStatus === 'READY' || normalizedStatus === 'READY_TO_PICKUP' || normalizedStatus === 'Ready to Pickup' || normalizedStatus === 'Ready') normalizedStatus = 'Ready to Pickup';

      let updatedOrder = null;

      if (mongoose.connection.readyState === 1) {
        let query = {};
        if (mongoose.isValidObjectId(id)) {
          query = { _id: id };
        } else {
          query = { $or: [{ token: id }, { token: `#${id}` }] };
        }

        updatedOrder = await Order.findOneAndUpdate(
          query,
          { $set: { status: normalizedStatus } },
          { new: true }
        );
      } else {
        const idx = inMemoryOrders.findIndex((o) => String(o._id) === id || o.id === id || o.token === id || o.token === `#${id}`);
        if (idx !== -1) {
          inMemoryOrders[idx].status = normalizedStatus;
          updatedOrder = inMemoryOrders[idx];
        }
      }

      if (!updatedOrder) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      console.log(`📌 Order ${updatedOrder.token || id} status updated to: ${normalizedStatus}`);
      return res.json({ success: true, order: updatedOrder, message: 'Status updated successfully' });
    } catch (err) {
      console.error('Error updating order status:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Nepal MOMO House Server running on http://localhost:${PORT}`);
});