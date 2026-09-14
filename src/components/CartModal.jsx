import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Trash2, Plus, Minus, MessageSquare, ShoppingBag, Clock, Sparkles } from 'lucide-react';

export const CartModal = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    shopSettings,
    placeOrder,
    setIsOrderStatusOpen
  } = useShop();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pickupTime, setPickupTime] = useState("15 Mins");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  if (!isCartOpen) return null;

  const handleCheckoutWhatsApp = (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      setFormError("Please enter your name for pickup order.");
      return;
    }
    if (!customerPhone.trim()) {
      setFormError("Please enter your phone number.");
      return;
    }
    setFormError("");

    // Place order in local app state for tracking
    const orderObj = placeOrder({
      name: customerName,
      phone: customerPhone,
      pickupTime,
      notes
    });

    // Clean WhatsApp number
    const cleanNum = shopSettings.whatsapp.replace(/[^0-9]/g, '');

    // Format WhatsApp message
    let itemsText = cart
      .map((i) => `• ${i.quantity}x ${i.name} - ${shopSettings.currency}${i.price * i.quantity}`)
      .join('\n');

    let waText = `🥟 *NEW PICKUP ORDER - ${shopSettings.name.toUpperCase()}* 🥟\n`;
    waText += `*Order ID:* ${orderObj.id}\n`;
    waText += `----------------------------------------\n`;
    waText += `👤 *Customer Name:* ${customerName}\n`;
    waText += `📞 *Phone Number:* ${customerPhone}\n`;
    waText += `⏱️ *Requested Pickup:* ${pickupTime}\n`;
    waText += `📍 *Outlet:* ${shopSettings.name}, ${shopSettings.city || 'Raxaul'}\n\n`;
    waText += `📋 *ORDER DETAILS:*\n${itemsText}\n\n`;
    waText += `----------------------------------------\n`;
    waText += `💰 *TOTAL AMOUNT:* ${shopSettings.currency}${cartTotal}\n`;
    if (notes.trim()) {
      waText += `📝 *Notes:* ${notes}\n`;
    }
    waText += `----------------------------------------\n`;
    waText += `Please confirm my order preparation! Thank you.`;

    const waUrl = `https://wa.me/${cleanNum}?text=${encodeURIComponent(waText)}`;

    // Open WhatsApp URL
    window.open(waUrl, '_blank');

    // Close Cart & Open Live Order Tracking Modal
    setIsCartOpen(false);
    setIsOrderStatusOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/70 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl momo-red-gradient text-white flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-stone-900 text-lg">Your Order Cart</h2>
              <p className="text-xs text-stone-500">{shopSettings.name} • {shopSettings.city}</p>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto text-2xl">
                🥟
              </div>
              <h3 className="text-lg font-bold text-stone-800 font-heading">Your cart is empty</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Explore our authentic steamed, fried, and jhol momos and add them to your order!
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 inline-block bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors shadow-xs"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-stone-500 uppercase tracking-wider">
                  <span>Items Added</span>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Cart
                  </button>
                </div>

                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 truncate">{item.name}</h4>
                        <p className="text-xs text-red-700 font-extrabold font-heading">
                          {shopSettings.currency}{item.price * item.quantity}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-stone-300 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 text-stone-600 hover:text-red-600"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-stone-900 w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 text-stone-600 hover:text-red-600"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pickup Customer Form */}
              <div className="pt-4 border-t border-stone-200 space-y-4">
                <h3 className="text-sm font-extrabold text-stone-900 font-heading flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-red-600" />
                  Pickup Details (Raxaul Outlet)
                </h3>

                {formError && (
                  <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 font-medium">
                    {formError}
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Your Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Amit Kumar"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-red-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Mobile / WhatsApp No. *</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-red-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Preferred Pickup Time</label>
                    <select
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-red-600"
                    >
                      <option value="15 Mins">In 15 Minutes (Fastest)</option>
                      <option value="25 Mins">In 25 Minutes</option>
                      <option value="40 Mins">In 40 Minutes</option>
                      <option value="1 Hour">In 1 Hour</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Special Instructions (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Extra spicy chutney, well fried..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-stone-600">Total Payable Amount</span>
              <span className="text-2xl font-black text-red-700 font-heading">
                {shopSettings.currency}{cartTotal}
              </span>
            </div>

            <button
              onClick={handleCheckoutWhatsApp}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg hover:shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Send Order on WhatsApp</span>
            </button>

            <p className="text-[11px] text-center text-stone-500 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Direct pickup order to {shopSettings.phone}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
