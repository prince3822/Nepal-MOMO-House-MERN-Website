import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { defaultCategories } from '../data/defaultData';
import { API_BASE_URL } from '../config/api';
import {
  X,
  Settings,
  Utensils,
  Tag,
  Clock,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  MapPin,
  Phone,
  MessageSquare,
  Globe,
  AlertCircle,
  LogOut,
  KeyRound,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  ChevronDown,
  ChevronUp,
  ChefHat,
  Volume2,
  VolumeX,
  Power
} from 'lucide-react';

export const AdminPanel = ({ onLogout }) => {
  const {
    shopSettings,
    updateShopSettings,
    resetShopSettings,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
    offers,
    setOffers,
    addOffer,
    updateOffer,
    deleteOffer,
    updateOrderStatus,
    adminLogout
  } = useShop();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'settings', 'menu', 'offers'

  // Audio Alert state (Mute / Unmute) & New Order Tracker
  const [isSoundMuted, setIsSoundMuted] = useState(() => {
    try {
      return localStorage.getItem('nmh_sound_muted') === 'true';
    } catch (e) {
      return false;
    }
  });
  const knownOrderIdsRef = React.useRef(null);

  const toggleSoundMute = () => {
    setIsSoundMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('nmh_sound_muted', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Web Audio API Synthetic Chime Ding Notification
  const playNewOrderChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1318.51, ctx.currentTime);
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.4);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1760, ctx.currentTime + 0.15);
      gain2.gain.setValueAtTime(0.4, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.7);
    } catch (err) {
      console.error('Audio chime error:', err);
    }
  };

  // Live Orders API state (polling API_BASE_URL/api/orders/live every 15s)
  const [orders, setOrders] = useState([]);
  const [isPolling, setIsPolling] = useState(false);
  const [orderStatusMap, setOrderStatusMap] = useState({});
  const [showCompletedDrawer, setShowCompletedDrawer] = useState(false);

  const fetchLiveOrders = async () => {
    try {
      setIsPolling(true);
      const res = await fetch(`${API_BASE_URL}/api/orders/live`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
        
        // Build status map
        const sMap = {};
        data.orders.forEach((o) => {
          const key = o._id || o.id || o.token;
          sMap[key] = o.status || 'Pending';
        });
        setOrderStatusMap(sMap);

        // Detect new incoming orders & trigger sound chime alert if unmuted
        const currentIds = new Set(data.orders.map((o) => String(o._id || o.id || o.token)));
        if (knownOrderIdsRef.current !== null) {
          let hasNew = false;
          data.orders.forEach((o) => {
            const key = String(o._id || o.id || o.token);
            if (!knownOrderIdsRef.current.has(key)) {
              hasNew = true;
            }
          });
          if (hasNew && !isSoundMuted) {
            playNewOrderChime();
          }
        }
        knownOrderIdsRef.current = currentIds;
      }
    } catch (err) {
      console.error('Error fetching live orders from API:', err);
    } finally {
      setIsPolling(false);
    }
  };

  // Today's Sales Mini-Analytics state
  const [dailySummary, setDailySummary] = useState({
    todayRevenue: 0,
    todayOrdersCount: 0,
    topSellingItem: 'N/A'
  });
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  const fetchDailySummary = async () => {
    try {
      setIsSummaryLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/daily-summary`);
      const data = await res.json();
      if (data.success) {
        setDailySummary({
          todayRevenue: data.todayRevenue || 0,
          todayOrdersCount: data.todayOrdersCount || 0,
          topSellingItem: data.topSellingItem || 'N/A'
        });
      }
    } catch (err) {
      console.error('Error fetching daily summary:', err);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveOrders();
    fetchDailySummary();
    const interval = setInterval(() => {
      fetchLiveOrders();
      fetchDailySummary();
    }, 15000);
    return () => clearInterval(interval);
  }, [isSoundMuted]);

  // Handler: Change & Persist Order Status directly to MongoDB via PATCH /api/orders/:id/status
  const handleStatusChange = async (ord, newStatus) => {
    const orderId = ord._id || ord.id || ord.token;

    // Optimistically update local state immediately
    setOrders((prevOrders) =>
      prevOrders.map((o) =>
        (o._id === orderId || o.id === orderId || o.token === ord.token)
          ? { ...o, status: newStatus }
          : o
      )
    );

    setOrderStatusMap((prev) => ({
      ...prev,
      [orderId]: newStatus
    }));

    if (ord.id) {
      updateOrderStatus(ord.id, newStatus);
    }

    setSaveNotification(`Order ${ord.token || orderId} status set to "${newStatus}"!`);
    setTimeout(() => setSaveNotification(''), 3500);

    // Call Backend PATCH API endpoint
    try {
      await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error('Error persisting order status to backend API:', err);
    }
  };

  // Settings Local Form State
  const [settingsForm, setSettingsForm] = useState({
    name: shopSettings.name || 'Nepal MOMO House',
    tagline: shopSettings.tagline || 'Authentic Himalayan Taste',
    logo: shopSettings.logo || '/assets/logo.jpg',
    city: shopSettings.city || 'Raxaul',
    state: shopSettings.state || 'Bihar',
    country: shopSettings.country || 'India',
    fullAddress: shopSettings.fullAddress || 'Main Road, Near Railway Station, Raxaul, Bihar 845305',
    phone: shopSettings.phone || '+91 9523349571',
    whatsapp: shopSettings.whatsapp || '919523349571',
    upiVpa: shopSettings.upiVpa || '9523349571@ybl',
    razorpayKeyId: shopSettings.razorpayKeyId || 'rzp_test_TbGX3wdVxstTNb',
    openingHours: shopSettings.openingHours || 'Mon - Sun: 11:00 AM - 10:00 PM',
    googleMapsUrl: shopSettings.googleMapsUrl || 'https://maps.google.com/maps?q=26.9784,84.8504&hl=en&z=16&output=embed',
    announcement: shopSettings.announcement || '🔥 Special Festival Offer: Flat 20% OFF on all Fried Momos!'
  });

  // Menu Form State (for adding/editing)
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [itemForm, setItemForm] = useState({
    name: '',
    category: 'steamed',
    price: 100,
    isVeg: true,
    spicyLevel: 1,
    isBestseller: false,
    isAvailable: true,
    description: '',
    image: '/assets/momo_hero.jpg'
  });

  // Mobile Delete Confirmation Dialog State
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [deletingItemName, setDeletingItemName] = useState('');

  // Offer Form State (for adding/editing)
  const [editingOffer, setEditingOffer] = useState(null);
  const [isAddingOffer, setIsAddingOffer] = useState(false);
  const [offerForm, setOfferForm] = useState({
    title: '',
    badge: '',
    description: '',
    priceHighlight: ''
  });

  // Offer Delete Confirmation Dialog State
  const [deletingOfferId, setDeletingOfferId] = useState(null);
  const [deletingOfferTitle, setDeletingOfferTitle] = useState('');

  const [saveNotification, setSaveNotification] = useState('');

  // Save (Create or Update) Offer
  const handleSaveOffer = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!offerForm.title.trim()) return;

    const payload = {
      title: offerForm.title.trim(),
      badge: offerForm.badge.trim(),
      description: offerForm.description.trim(),
      priceHighlight: offerForm.priceHighlight.trim()
    };

    if (editingOffer) {
      const offerId = editingOffer.id || editingOffer.offerId || editingOffer._id;
      await updateOffer(offerId, payload);
      setSaveNotification(`Offer "${payload.title}" updated successfully!`);
    } else {
      await addOffer(payload);
      setSaveNotification(`New offer "${payload.title}" created successfully!`);
    }

    setIsAddingOffer(false);
    setEditingOffer(null);
    setTimeout(() => setSaveNotification(''), 4000);
  };

  // Confirm Delete Offer
  const confirmDeleteOffer = async () => {
    if (deletingOfferId) {
      await deleteOffer(deletingOfferId);
      setSaveNotification(`Offer "${deletingOfferTitle}" deleted successfully.`);
      setDeletingOfferId(null);
      setDeletingOfferTitle('');
      setTimeout(() => setSaveNotification(''), 4000);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('nmh_admin_token');
      localStorage.removeItem('nmh_admin_auth');
    } catch (e) {}
    adminLogout();
    if (onLogout) {
      onLogout();
    } else {
      window.history.pushState({}, '', '/admin/login');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  // Submit Shop Settings Form
  const handleSettingsSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    await updateShopSettings(settingsForm);
    setSaveNotification('Shop settings saved successfully to database!');
    setTimeout(() => setSaveNotification(''), 4000);
  };

  // Reset Factory Settings
  const handleReset = async () => {
    if (window.confirm('Reset all shop settings to factory defaults?')) {
      await resetShopSettings();
      setSettingsForm(shopSettings);
      setSaveNotification('Reset to factory defaults completed.');
      setTimeout(() => setSaveNotification(''), 4000);
    }
  };

  // Start Editing a Menu Item
  const startEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name || '',
      category: item.category || 'steamed',
      price: item.price || 100,
      isVeg: item.isVeg !== undefined ? item.isVeg : true,
      spicyLevel: item.spicyLevel || 1,
      isBestseller: item.isBestseller || false,
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      description: item.description || '',
      image: item.image || '/assets/momo_hero.jpg'
    });
    setIsAddingItem(true);
  };

  // Save (Create or Update) Menu Item
  const handleSaveItem = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!itemForm.name.trim()) return;

    if (editingItem) {
      await updateMenuItem(editingItem.id || editingItem.itemId, itemForm);
      setSaveNotification(`Menu item "${itemForm.name}" updated successfully!`);
    } else {
      await addMenuItem(itemForm);
      setSaveNotification(`New item "${itemForm.name}" added to menu!`);
    }

    setIsAddingItem(false);
    setEditingItem(null);
    setTimeout(() => setSaveNotification(''), 4000);
  };

  // Confirm Delete Menu Item
  const confirmDelete = async () => {
    if (deletingItemId) {
      await deleteMenuItem(deletingItemId);
      setSaveNotification(`Item "${deletingItemName}" deleted successfully.`);
      setDeletingItemId(null);
      setDeletingItemName('');
      setTimeout(() => setSaveNotification(''), 4000);
    }
  };

  // Filter Active vs Completed Queues
  // Active Kitchen Queue: Status !== 'Completed' (Strict FIFO: Oldest first)
  const activeQueue = (orders || [])
    .filter((o) => {
      const st = (orderStatusMap[o._id || o.id || o.token] || o.status || 'Received').trim();
      return st.toLowerCase() !== 'completed';
    })
    .sort((a, b) => new Date(a.createdAt || a.timestamp || 0) - new Date(b.createdAt || b.timestamp || 0));

  // Completed Orders Queue: Status === 'Completed' (Latest completed first)
  const completedQueue = (orders || [])
    .filter((o) => {
      const st = (orderStatusMap[o._id || o.id || o.token] || o.status || 'Received').trim();
      return st.toLowerCase() === 'completed';
    })
    .sort((a, b) => new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0));

  return (
    <div className="min-h-screen bg-stone-950 p-2 sm:p-6 text-stone-900 font-sans flex flex-col">
      <div className="bg-white w-full max-w-6xl mx-auto rounded-3xl shadow-2xl overflow-hidden flex flex-col flex-1 border border-stone-800">
        
        {/* Admin Header */}
        <div className="bg-stone-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-red-500 bg-stone-800 shrink-0">
              <img
                src={shopSettings.logo || "/assets/logo.jpg"}
                alt={shopSettings.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-white">
                  {shopSettings.name} Admin Dashboard
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> SECURE SESSION
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {shopSettings.city || 'Raxaul'} Outlet • Kitchen Display System (KDS)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Store Open / Closed Toggle Switch */}
            <button
              type="button"
              onClick={() => updateShopSettings({ isAcceptingOrders: !(shopSettings.isAcceptingOrders !== false) })}
              className={`flex items-center gap-1.5 font-extrabold text-xs px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                shopSettings.isAcceptingOrders !== false
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
              }`}
              title="Toggle store open/closed for receiving online orders"
            >
              <Power className="w-4 h-4 shrink-0" />
              <span>{shopSettings.isAcceptingOrders !== false ? 'Store: OPEN' : 'Store: CLOSED'}</span>
            </button>

            {/* Mute / Unmute Alerts Toggle Switch */}
            <button
              type="button"
              onClick={toggleSoundMute}
              className={`flex items-center gap-1.5 font-bold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer border ${
                isSoundMuted
                  ? 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              }`}
              title={isSoundMuted ? "Unmute Order Bell Alert" : "Mute Order Bell Alert"}
            >
              {isSoundMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              <span>{isSoundMuted ? 'Muted' : 'Alerts On'}</span>
            </button>

            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new Event('popstate'));
              }}
              className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs px-3 py-2 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Storefront
            </a>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Sleek Daily Sales & Revenue Mini-Analytics Bar */}
        <div className="bg-stone-900 text-white px-4 py-3 border-b border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs shrink-0">
          <div className="bg-stone-800/90 p-3 rounded-2xl border border-stone-700/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">💰 Today's Revenue</span>
              <span className="text-lg font-black font-heading text-emerald-400">
                {shopSettings.currency || '₹'}{dailySummary.todayRevenue.toLocaleString()}
              </span>
            </div>
            <span className="text-xl">💵</span>
          </div>

          <div className="bg-stone-800/90 p-3 rounded-2xl border border-stone-700/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">📦 Total Orders Today</span>
              <span className="text-lg font-black font-heading text-amber-300">
                {dailySummary.todayOrdersCount} orders
              </span>
            </div>
            <span className="text-xl">📊</span>
          </div>

          <div className="bg-stone-800/90 p-3 rounded-2xl border border-stone-700/80 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">🔥 Top Selling Item</span>
              <span className="text-sm font-extrabold text-white truncate block">
                {dailySummary.topSellingItem}
              </span>
            </div>
            <button
              type="button"
              onClick={fetchDailySummary}
              disabled={isSummaryLoading}
              className="p-2 rounded-xl bg-stone-700 hover:bg-stone-600 text-stone-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Refresh Daily Analytics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSummaryLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-stone-100 p-2 border-b border-stone-200 flex gap-2 overflow-x-auto text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all relative shrink-0 ${
              activeTab === 'orders'
                ? 'bg-white text-red-700 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            Active Kitchen Queue ({activeQueue.length})
            {activeQueue.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all shrink-0 ${
              activeTab === 'menu'
                ? 'bg-white text-red-700 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Menu Management ({menuItems.length})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all shrink-0 ${
              activeTab === 'settings'
                ? 'bg-white text-red-700 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            Shop Settings
          </button>

          <button
            onClick={() => setActiveTab('offers')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all shrink-0 ${
              activeTab === 'offers'
                ? 'bg-white text-red-700 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            Offers & Deals ({offers.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-stone-50">
          
          {saveNotification && (
            <div className="mb-4 bg-emerald-100 text-emerald-800 text-xs font-bold p-3.5 rounded-xl border border-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveNotification}</span>
            </div>
          )}

          {/* TAB 1: KITCHEN DISPLAY SYSTEM (KDS QUEUE) */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
                <div>
                  <h3 className="font-heading font-extrabold text-stone-900 text-base sm:text-lg flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-red-600" /> Active Kitchen Queue (FIFO Sequence - Oldest First)
                  </h3>
                  <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live KDS Sync • Auto-polling every 15s • Permanent MongoDB Status Persistence</span>
                  </p>
                </div>

                <button
                  onClick={fetchLiveOrders}
                  disabled={isPolling}
                  className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs px-3.5 py-2 rounded-xl border border-stone-300 transition-colors shrink-0 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-stone-600 ${isPolling ? 'animate-spin' : ''}`} />
                  <span>{isPolling ? 'Refreshing...' : 'Refresh Now'}</span>
                </button>
              </div>

              {/* SECTION A: ACTIVE KITCHEN QUEUE (STRICT FIFO: OLDEST FIRST AT TOP) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold font-heading text-stone-900 text-sm flex items-center gap-2 uppercase tracking-wider text-red-700">
                    <span>🔥 Orders Pending Preparation / Serving ({activeQueue.length})</span>
                  </h4>
                  <span className="text-[11px] font-bold text-stone-500">
                    Oldest orders at top (First-In, First-Out)
                  </span>
                </div>

                {activeQueue.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs font-medium space-y-2">
                    <div className="text-3xl">🥟</div>
                    <p className="font-bold text-stone-700">Active Kitchen Queue is empty!</p>
                    <p className="text-stone-400 max-w-sm mx-auto">
                      All takeaway orders have been prepared and served. New customer orders will automatically appear at the top in FIFO order.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeQueue.map((ord, idx) => {
                      const currentStatus = orderStatusMap[ord._id || ord.id || ord.token] || ord.status || 'Received';
                      const orderToken = ord.token || `#${(ord._id || ord.id || '0000').slice(-4)}`;

                      return (
                        <div
                          key={ord._id || ord.id || ord.token}
                          className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-red-200 shadow-md hover:border-red-400 transition-all space-y-4 relative"
                        >
                          {/* FIFO Position Badge */}
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-stone-100">
                            <div className="flex items-center gap-3">
                              
                              {/* Token Badge */}
                              <div className="bg-gradient-to-br from-red-600 to-amber-600 text-white font-heading font-black text-lg px-4 py-2 rounded-xl shadow-md tracking-wider">
                                {orderToken}
                              </div>

                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h5 className="font-extrabold text-stone-900 text-sm">
                                    {ord.customerName || 'Guest'}
                                  </h5>
                                  <a
                                    href={`tel:${(ord.customerPhone || '').replace(/\D/g, '')}`}
                                    className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-lg border border-emerald-300 transition-colors text-xs shrink-0"
                                    title="Click to call customer directly"
                                  >
                                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>{ord.customerPhone}</span>
                                  </a>
                                  <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300">
                                    #{idx + 1} IN QUEUE (FIFO)
                                  </span>
                                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                                    PAID ✅
                                  </span>
                                </div>

                                <p className="text-xs text-stone-600 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 font-medium">
                                  <span>⏱️ Pickup Window: <strong>{ord.pickupTime}</strong></span>
                                </p>
                              </div>
                            </div>

                            {/* Prominent Mark Completed Button + Status Toggle */}
                            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                              <div className="flex items-center gap-1 bg-stone-50 p-1.5 rounded-xl border border-stone-200 overflow-x-auto flex-1 md:flex-none">
                                {['Pending', 'Preparing', 'Ready to Pickup'].map((st) => {
                                  const isSelected = currentStatus === st || (st === 'Pending' && (currentStatus === 'Received' || currentStatus === 'Pending'));
                                  return (
                                    <button
                                      key={st}
                                      type="button"
                                      onClick={() => handleStatusChange(ord, st)}
                                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                                        isSelected
                                          ? st === 'Ready to Pickup'
                                            ? 'bg-emerald-600 text-white shadow-xs animate-pulse'
                                            : st === 'Preparing'
                                            ? 'bg-blue-600 text-white shadow-xs'
                                            : 'bg-amber-600 text-white shadow-xs'
                                          : 'text-stone-600 hover:bg-stone-200'
                                      }`}
                                    >
                                      {st}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Prominent Action Button: Mark Completed */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(ord, 'Completed')}
                                className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Mark Completed</span>
                              </button>
                            </div>
                          </div>

                          {/* Middle Row: Items List */}
                          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100 space-y-1.5 text-xs">
                            <span className="text-[10px] font-extrabold uppercase text-stone-400 tracking-wider block mb-1">
                              Items to Prepare in Kitchen
                            </span>
                            {ord.items && ord.items.map((it, iIdx) => (
                              <div key={iIdx} className="flex justify-between items-center text-stone-900 font-semibold">
                                <span className="text-sm font-bold">
                                  {it.quantity}x {it.name}
                                </span>
                                <span className="font-bold font-heading text-red-700">
                                  {shopSettings.currency}{it.price * it.quantity}
                                </span>
                              </div>
                            ))}
                            {ord.notes && (
                              <p className="text-xs text-amber-700 font-bold pt-1 border-t border-stone-200 mt-1">
                                📝 Kitchen Notes: {ord.notes}
                              </p>
                            )}
                          </div>

                          {/* Footer Row */}
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                            <span className="text-[11px] text-stone-500 font-medium">
                              Ref: {ord.transactionRef || ord.paymentRef || 'Verified'}
                            </span>
                            <div className="font-extrabold font-heading text-red-700 text-base">
                              Total Amount: {shopSettings.currency}{ord.totalAmount}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION B: COMPLETED ORDERS HISTORY (COLLAPSIBLE DRAWER) */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden pt-1">
                <button
                  type="button"
                  onClick={() => setShowCompletedDrawer(!showCompletedDrawer)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-extrabold font-heading text-stone-900 text-sm uppercase tracking-wider">
                      Completed Orders History ({completedQueue.length})
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
                    <span>{showCompletedDrawer ? 'Hide Drawer' : 'Show Drawer'}</span>
                    {showCompletedDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {showCompletedDrawer && (
                  <div className="p-4 border-t border-stone-200 bg-stone-50/50 space-y-3 max-h-[500px] overflow-y-auto">
                    {completedQueue.length === 0 ? (
                      <p className="text-xs text-stone-500 text-center py-4 font-medium">
                        No completed orders yet. Marked served orders will be stored here.
                      </p>
                    ) : (
                      completedQueue.map((ord) => {
                        const orderToken = ord.token || `#${(ord._id || ord.id || '0000').slice(-4)}`;
                        return (
                          <div
                            key={ord._id || ord.id || ord.token}
                            className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-2"
                          >
                            <div className="flex flex-wrap justify-between items-center text-xs gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-black font-heading text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg">
                                  {orderToken}
                                </span>
                                <span className="font-bold text-stone-800">{ord.customerName || 'Guest'}</span>
                                {ord.customerPhone && (
                                  <a
                                    href={`tel:${ord.customerPhone.replace(/\D/g, '')}`}
                                    className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md border border-emerald-300 transition-colors text-[11px]"
                                    title="Click to call customer directly"
                                  >
                                    <Phone className="w-3 h-3 text-emerald-600" />
                                    <span>{ord.customerPhone}</span>
                                  </a>
                                )}
                                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                                  SERVED ✅
                                </span>
                              </div>

                              <div className="font-bold text-red-700 font-heading">
                                {shopSettings.currency}{ord.totalAmount}
                              </div>
                            </div>

                            <div className="text-[11px] text-stone-600 space-y-0.5">
                              {ord.items && ord.items.map((i, iIdx) => (
                                <span key={iIdx} className="mr-3">
                                  • {i.quantity}x {i.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: MENU MANAGEMENT */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-heading font-extrabold text-stone-900 text-base sm:text-lg">
                  Restaurant Menu Items
                </h3>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setItemForm({
                      name: '',
                      category: 'steamed',
                      price: 100,
                      isVeg: true,
                      spicyLevel: 1,
                      isBestseller: false,
                      isAvailable: true,
                      description: '',
                      image: '/assets/momo_hero.jpg'
                    });
                    setIsAddingItem(true);
                  }}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add New Item
                </button>
              </div>

              {/* Mobile-Friendly Add / Edit Item Modal Overlay */}
              {isAddingItem && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
                  <form onSubmit={handleSaveItem} className="bg-white w-full max-w-xl rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
                    <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                      <h4 className="font-bold text-stone-900 text-base font-heading">
                        {editingItem ? `Edit Menu Item (${editingItem.name})` : 'Create New Menu Item'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsAddingItem(false)}
                        className="p-1 rounded-lg text-stone-400 hover:text-stone-900"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Item Name *</label>
                        <input
                          type="text"
                          value={itemForm.name}
                          onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 font-semibold text-stone-900 text-sm focus:outline-none focus:border-red-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Category</label>
                        <select
                          value={itemForm.category}
                          onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 font-semibold text-stone-900 text-sm focus:outline-none focus:border-red-600"
                        >
                          {defaultCategories.filter(c => c.id !== 'all').map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Price (₹) *</label>
                        <input
                          type="number"
                          value={itemForm.price}
                          onChange={(e) => setItemForm({ ...itemForm, price: Number(e.target.value) })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 font-semibold text-stone-900 text-sm focus:outline-none focus:border-red-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Spicy Level (0-3)</label>
                        <input
                          type="number"
                          min="0"
                          max="3"
                          value={itemForm.spicyLevel}
                          onChange={(e) => setItemForm({ ...itemForm, spicyLevel: Number(e.target.value) })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 font-semibold text-stone-900 text-sm focus:outline-none focus:border-red-600"
                        />
                      </div>
                    </div>

                    <div className="text-xs">
                      <label className="block font-bold text-stone-700 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={itemForm.description}
                        onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 font-semibold text-stone-900 text-sm focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-xs font-bold pt-2">
                      <label className="flex items-center gap-2 cursor-pointer p-1">
                        <input
                          type="checkbox"
                          checked={itemForm.isVeg}
                          onChange={(e) => setItemForm({ ...itemForm, isVeg: e.target.checked })}
                          className="w-4 h-4 rounded text-red-600"
                        />
                        <span>Pure Veg</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-1">
                        <input
                          type="checkbox"
                          checked={itemForm.isBestseller}
                          onChange={(e) => setItemForm({ ...itemForm, isBestseller: e.target.checked })}
                          className="w-4 h-4 rounded text-amber-600"
                        />
                        <span>Bestseller ★</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-1">
                        <input
                          type="checkbox"
                          checked={itemForm.isAvailable}
                          onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600"
                        />
                        <span>In Stock / Available</span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                      <button
                        type="button"
                        onClick={() => setIsAddingItem(false)}
                        className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-extrabold text-xs shadow-md"
                      >
                        {editingItem ? 'Save Changes' : 'Create Item'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Mobile Custom Delete Modal */}
              {deletingItemId && (
                <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 text-center border border-stone-200 shadow-2xl">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                      <Trash2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-stone-900 text-base font-heading">Delete Menu Item?</h4>
                    <p className="text-xs text-stone-600">
                      Are you sure you want to delete <strong>"{deletingItemName}"</strong>? This will remove it from the online store.
                    </p>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setDeletingItemId(null)}
                        className="flex-1 py-2.5 border border-stone-300 rounded-xl font-bold text-xs text-stone-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmDelete}
                        className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-extrabold text-xs shadow-md"
                      >
                        Delete Item
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Existing Items List (Responsive Cards for Mobile & Table for Desktop) */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                
                {/* Mobile Item Cards */}
                <div className="block sm:hidden divide-y divide-stone-200">
                  {menuItems.map((item) => (
                    <div key={item.id || item.itemId} className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || '/assets/momo_hero.jpg'}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-stone-900 text-sm truncate flex items-center gap-1.5">
                            {item.name}
                            {item.isBestseller && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-black">
                                ★ BESTSELLER
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-stone-500 uppercase font-bold mt-0.5">
                            {item.category} • {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                          </p>
                        </div>
                        <div className="font-extrabold font-heading text-red-700 text-base">
                          {shopSettings.currency}{item.price}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => toggleItemAvailability(item.id || item.itemId)}
                          className={`px-3 py-1 rounded-full text-xs font-black border transition-all cursor-pointer ${
                            item.isAvailable !== false
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                          }`}
                        >
                          {item.isAvailable !== false ? '🟢 In Stock' : '🔴 Sold Out'}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditItem(item)}
                            className="p-2 rounded-xl bg-stone-100 text-stone-700 font-bold text-xs flex items-center gap-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => {
                              setDeletingItemId(item.id || item.itemId);
                              setDeletingItemName(item.name);
                            }}
                            className="p-2 rounded-xl bg-red-50 text-red-700 font-bold text-xs flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <table className="hidden sm:table w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
                      <th className="p-3.5">Item</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Price</th>
                      <th className="p-3.5">Stock Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 font-medium">
                    {menuItems.map((item) => (
                      <tr key={item.id || item.itemId} className="hover:bg-stone-50 transition-colors">
                        <td className="p-3.5 flex items-center gap-3">
                          <img
                            src={item.image || '/assets/momo_hero.jpg'}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-bold text-stone-900 flex items-center gap-1.5">
                              {item.name}
                              {item.isBestseller && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-black">
                                  ★
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-stone-500">
                              {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5 uppercase font-bold text-stone-500 text-[11px]">
                          {item.category}
                        </td>

                        <td className="p-3.5 font-bold font-heading text-red-700 text-sm">
                          {shopSettings.currency}{item.price}
                        </td>

                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() => toggleItemAvailability(item.id || item.itemId)}
                            className={`px-3 py-1 rounded-full text-[11px] font-black border transition-all cursor-pointer ${
                              item.isAvailable !== false
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                : 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'
                            }`}
                          >
                            {item.isAvailable !== false ? '🟢 In Stock' : '🔴 Sold Out'}
                          </button>
                        </td>

                        <td className="p-3.5 text-right space-x-1">
                          <button
                            onClick={() => startEditItem(item)}
                            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingItemId(item.id || item.itemId);
                              setDeletingItemName(item.name);
                            }}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>
            </div>
          )}

          {/* TAB 3: SHOP SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSettingsSubmit} className="space-y-6 max-w-3xl">
              
              {/* Store Status Toggle Switch Card */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-stone-900 font-heading flex items-center gap-2">
                      <Power className="w-4 h-4 text-red-600" /> Kitchen Accepting Orders Status
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Toggle store open/closed. When closed, checkout button on storefront is disabled and closed banner is displayed.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => updateShopSettings({ isAcceptingOrders: !(shopSettings.isAcceptingOrders !== false) })}
                    className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
                      shopSettings.isAcceptingOrders !== false
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-red-600 text-white shadow-md'
                    }`}
                  >
                    <span>{shopSettings.isAcceptingOrders !== false ? '✅ ACCEPTING ORDERS (OPEN)' : '🚫 STORE CLOSED'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold text-stone-900 font-heading uppercase tracking-wider text-red-700 border-b border-stone-100 pb-2">
                  General Restaurant Branding
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Restaurant Name</label>
                    <input
                      type="text"
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900 focus:outline-none focus:border-red-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Logo Image URL</label>
                    <input
                      type="text"
                      value={settingsForm.logo || "/assets/logo.jpg"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logo: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Tagline</label>
                    <input
                      type="text"
                      value={settingsForm.tagline}
                      onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">City</label>
                    <input
                      type="text"
                      value={settingsForm.city}
                      onChange={(e) => setSettingsForm({ ...settingsForm, city: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900 focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>
              </div>

              {/* Contact & Map Settings */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold text-stone-900 font-heading uppercase tracking-wider text-red-700 border-b border-stone-100 pb-2">
                  Contact & Map Settings
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Full Store Address</label>
                    <input
                      type="text"
                      value={settingsForm.fullAddress}
                      onChange={(e) => setSettingsForm({ ...settingsForm, fullAddress: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900 focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-bold mb-1">WhatsApp Order Number</label>
                      <input
                        type="text"
                        value={settingsForm.whatsapp}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900 focus:outline-none focus:border-red-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">Shop UPI VPA Address</label>
                      <input
                        type="text"
                        placeholder="e.g. 9523349571@ybl"
                        value={settingsForm.upiVpa || '9523349571@ybl'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, upiVpa: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900 focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-bold mb-1">Razorpay Key ID</label>
                      <input
                        type="text"
                        value={settingsForm.razorpayKeyId || 'rzp_test_TbGX3wdVxstTNb'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, razorpayKeyId: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900 focus:outline-none focus:border-red-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Opening Hours</label>
                    <input
                      type="text"
                      value={settingsForm.openingHours}
                      onChange={(e) => setSettingsForm({ ...settingsForm, openingHours: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Google Maps URL</label>
                    <input
                      type="url"
                      value={settingsForm.googleMapsUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, googleMapsUrl: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Top Announcement Marquee</label>
                    <input
                      type="text"
                      value={settingsForm.announcement}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcement: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900 focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Reset Defaults
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Shop Settings
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: OFFERS */}
          {activeTab === 'offers' && (
            <div className="space-y-6">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <h3 className="font-heading font-extrabold text-stone-900 text-base sm:text-lg">
                  Promotional Offers & Banners
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setEditingOffer(null);
                    setOfferForm({
                      title: '',
                      badge: '',
                      description: '',
                      priceHighlight: ''
                    });
                    setIsAddingOffer(true);
                  }}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> + Add New Offer
                </button>
              </div>

              {/* Add / Edit Offer Modal Overlay */}
              {isAddingOffer && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
                  <form onSubmit={handleSaveOffer} className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
                    <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                      <h4 className="font-bold text-stone-900 text-base font-heading">
                        {editingOffer ? `Edit Offer (${editingOffer.title})` : 'Create New Promotional Offer'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsAddingOffer(false)}
                        className="p-1 rounded-lg text-stone-400 hover:text-stone-900 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Title *</label>
                        <input
                          type="text"
                          placeholder="e.g. Momo Special Combo"
                          value={offerForm.title}
                          onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 font-semibold text-stone-900 text-sm focus:outline-none focus:border-red-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Badge</label>
                        <input
                          type="text"
                          placeholder="e.g. Popular Combo"
                          value={offerForm.badge}
                          onChange={(e) => setOfferForm({ ...offerForm, badge: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 font-semibold text-stone-900 text-sm focus:outline-none focus:border-red-600"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Description</label>
                        <textarea
                          rows={3}
                          placeholder="e.g. Steam Momo + Kurkure Momo + Cold Drink"
                          value={offerForm.description}
                          onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 font-semibold text-stone-900 text-sm focus:outline-none focus:border-red-600"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Price Highlight</label>
                        <input
                          type="text"
                          placeholder="e.g. Save ₹40"
                          value={offerForm.priceHighlight}
                          onChange={(e) => setOfferForm({ ...offerForm, priceHighlight: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 font-semibold text-stone-900 text-sm focus:outline-none focus:border-red-600"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                      <button
                        type="button"
                        onClick={() => setIsAddingOffer(false)}
                        className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-extrabold text-xs shadow-md transition-colors cursor-pointer"
                      >
                        {editingOffer ? 'Save Changes' : 'Create Offer'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Delete Offer Confirmation Modal */}
              {deletingOfferId && (
                <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 text-center border border-stone-200 shadow-2xl animate-in zoom-in-95 duration-150">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                      <Trash2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-stone-900 text-base font-heading">Delete Offer?</h4>
                    <p className="text-xs text-stone-600">
                      Are you sure you want to delete <strong>"{deletingOfferTitle}"</strong>?
                    </p>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setDeletingOfferId(null)}
                        className="flex-1 py-2.5 border border-stone-300 rounded-xl font-bold text-xs text-stone-700 hover:bg-stone-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={confirmDeleteOffer}
                        className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-extrabold text-xs shadow-md transition-colors cursor-pointer"
                      >
                        Delete Offer
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Offer Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offers.map((off) => (
                  <div key={off.id || off.offerId || off._id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        {off.badge ? (
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                            {off.badge}
                          </span>
                        ) : <div />}
                        <div className="flex items-center gap-1.5 ml-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingOffer(off);
                              setOfferForm({
                                title: off.title || '',
                                badge: off.badge || '',
                                description: off.description || off.subtitle || '',
                                priceHighlight: off.priceHighlight || off.discount || ''
                              });
                              setIsAddingOffer(true);
                            }}
                            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 cursor-pointer transition-colors"
                            title="Edit Offer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingOfferId(off.id || off.offerId || off._id);
                              setDeletingOfferTitle(off.title);
                            }}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                            title="Delete Offer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-extrabold font-heading text-stone-900 text-base">{off.title}</h4>
                      {(off.description || off.subtitle) && (
                        <p className="text-xs text-stone-600">{off.description || off.subtitle}</p>
                      )}
                    </div>

                    {(off.priceHighlight || off.discount) && (
                      <div className="text-lg font-black text-amber-600 font-heading pt-1 border-t border-stone-100">
                        {off.priceHighlight || off.discount}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
