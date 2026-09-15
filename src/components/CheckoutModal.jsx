import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { API_BASE_URL } from '../config/api';
import {
  X,
  CreditCard,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Receipt,
  Smartphone
} from 'lucide-react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const sanitizePhoneNumber = (rawPhone) => {
  if (!rawPhone) return '';
  let str = String(rawPhone).trim();
  if (str.startsWith('+91')) {
    str = str.slice(3);
  } else if (str.startsWith('91') && str.replace(/\D/g, '').length > 10) {
    str = str.replace(/\D/g, '').slice(2);
  } else if (str.startsWith('0') && str.replace(/\D/g, '').length > 10) {
    str = str.replace(/\D/g, '').slice(1);
  }
  return str.replace(/\D/g, '').slice(0, 10);
};

export const CheckoutModal = () => {
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const {
    cart,
    menuItems,
    cartTotal,
    isCheckoutOpen,
    setIsCheckoutOpen,
    shopSettings,
    placePaidOrder,
    clearCart,
    setIsOrderStatusOpen
  } = useShop();

  const hasSoldOutItems = cart.some((item) => {
    const m = (menuItems || []).find((x) => x.id === item.id || x.itemId === item.id || x.id === item.itemId);
    return item.isAvailable === false || (m && m.isAvailable === false);
  });

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('15-20 mins');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isCheckoutOpen) return null;

  // Initiate Razorpay Payment Sheet Flow
  const handleProceedToPay = async (e, nameOverride, phoneOverride) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!navigator.onLine || isOffline) {
      setErrorMsg('⚠️ Network disconnected. Please check your internet before placing orders.');
      return;
    }

    const nameToUse = typeof nameOverride === 'string' ? nameOverride : customerName;
    const phoneToUse = typeof phoneOverride === 'string' ? phoneOverride : customerPhone;

    const finalName = nameToUse.trim();
    const cleanPhone = sanitizePhoneNumber(phoneToUse);

    if (!finalName) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    const formattedContact = `+91${cleanPhone}`;

    // Store customer details in localStorage for auto-fill on repeat visits
    try {
      localStorage.setItem('nmh_customer_name', finalName);
      localStorage.setItem('nmh_customer_phone', cleanPhone);
    } catch (err) {}

    setErrorMsg('');
    setIsProcessing(true);

    try {
      // 1. Call /api/payment/create-order to initialize order
      const createRes = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAmount: cartTotal,
          items: cart.map((i) => ({
            id: i.id || i.itemId,
            itemId: i.itemId || i.id,
            name: i.name,
            quantity: i.quantity,
            price: i.price
          }))
        })
      });

      const orderData = await createRes.json();

      if (!createRes.ok || !orderData.success) {
        setErrorMsg(orderData.error || 'Failed to initialize payment gateway.');
        setIsProcessing(false);
        return;
      }

      // 2. Load Razorpay Checkout SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setErrorMsg('Failed to load Razorpay Payment Gateway SDK.');
        setIsProcessing(false);
        return;
      }

      // 3. Configure Razorpay Payment Sheet options with prefill & read-only contact
      const options = {
        key: orderData.key || shopSettings.razorpayKeyId || 'rzp_test_TbGX3wdVxstTNb',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: shopSettings.name || 'Nepal MOMO House',
        description: `Prepaid Takeaway Order (${pickupTime})`,
        image: shopSettings.logo || '/assets/logo.jpg',
        order_id: orderData.orderId,
        prefill: {
          name: finalName,
          contact: formattedContact,
          readonly: {
            contact: true,
            name: true
          }
        },
        readonly: {
          contact: true,
          name: true
        },
        theme: {
          color: '#DC2626'
        },
        // Auto-triggered callback after successful payment in Payment Sheet
        handler: async function (response) {
          try {
            // Send payment signature & order details to /api/payment/verify
            const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customerName: finalName,
                customerPhone: cleanPhone,
                pickupTime,
                items: cart.map((i) => ({
                  name: i.name,
                  quantity: i.quantity,
                  price: i.price
                })),
                totalAmount: cartTotal,
                notes
              })
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              setErrorMsg(verifyData.error || 'Payment verification failed on server.');
              setIsProcessing(false);
              return;
            }

            const verifiedToken = verifyData.token; // e.g. "#4821"

            // Save order in local context for live kitchen status tracking
            placePaidOrder({
              customerName: finalName,
              customerPhone: cleanPhone,
              pickupTime,
              notes,
              paymentMethod: 'RAZORPAY_PAYMENT_SHEET',
              paymentRef: response.razorpay_payment_id || 'Verified',
              token: verifiedToken
            });

            // Clear cart & navigate directly to Order Status & Pickup Token screen
            clearCart();
            setIsProcessing(false);
            setIsCheckoutOpen(false);
            setIsOrderStatusOpen(true);
          } catch (vErr) {
            console.error('Verification error:', vErr);
            setErrorMsg('Error verifying payment on backend server.');
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setIsProcessing(false);
        setErrorMsg(`Payment Failed: ${response.error?.description || 'Transaction cancelled.'}`);
      });
      rzp.open();
    } catch (err) {
      console.error('Payment sheet error:', err);
      setErrorMsg(`Failed to connect to backend server at ${API_BASE_URL}.`);
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center font-bold shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-white text-base sm:text-lg">
                Pre-Paid Checkout & Pickup Window
              </h2>
              <p className="text-xs text-amber-400 font-medium">
                {shopSettings.name} • {shopSettings.city || 'Raxaul'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Checkout Form */}
        <form
          onSubmit={(e) => handleProceedToPay(e, customerName, customerPhone)}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-stone-50"
        >
          
          {errorMsg && (
            <div className="bg-red-50 text-red-700 text-xs font-bold p-3.5 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Customer & Pickup Window Details */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-extrabold text-stone-900 font-heading uppercase tracking-wider text-red-700 border-b pb-2 flex items-center gap-1.5">
              <User className="w-4 h-4" /> 1. Customer & Pickup Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Prince Anand"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 font-medium text-stone-900 text-sm focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  maxLength={13}
                  placeholder="e.g., 95233xxxxx or +91 95233xxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(sanitizePhoneNumber(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 font-medium text-stone-900 text-sm focus:outline-none focus:border-red-600"
                  required
                />
              </div>
            </div>

            {/* Pickup Time Window Options */}
            <div>
              <label className="block text-xs font-bold text-stone-900 mb-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-red-600" /> Select Estimated Pickup Window *
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: '15-20 mins', label: '15-20 Mins', badge: 'Fastest' },
                  { id: '30 mins', label: '30 Mins', badge: 'Popular' },
                  { id: '45 mins', label: '45 Mins', badge: '' },
                  { id: '1 hour', label: '1 Hour', badge: '' }
                ].map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setPickupTime(slot.id)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center relative flex flex-col items-center justify-center cursor-pointer ${
                      pickupTime === slot.id
                        ? 'bg-red-50 border-red-600 text-red-700 ring-2 ring-red-600/20 shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{slot.label}</span>
                    {slot.badge && (
                      <span className="text-[9px] font-extrabold bg-amber-400 text-stone-950 px-1.5 py-0.2 rounded-full mt-0.5">
                        {slot.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-bold text-xs mb-1">
                Special Kitchen Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Extra spicy red chutney, well fried..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          {/* Cart Summary Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
            <div className="flex justify-between items-center text-xs border-b pb-2">
              <span className="font-extrabold text-stone-900 font-heading flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-red-600" /> Order Summary ({cart.length} items)
              </span>
              <span className="font-extrabold font-heading text-red-700 text-base">
                Total Amount: ₹{cartTotal}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-stone-700 max-h-36 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="truncate">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-bold shrink-0 ml-2">
                    {shopSettings.currency}{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Razorpay Payment Sheet Action Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-extrabold text-stone-900 font-heading uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" /> 2. Pay via PhonePe / GPay / Paytm / UPI Sheet
              </h3>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                100% Pre-Paid
              </span>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-900">
                <Smartphone className="w-4 h-4 text-red-600" />
                <span>Instant Payment Gateway (UPI Apps & Cards)</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Click <strong>"Proceed to Pay"</strong> to launch the payment sheet with Google Pay, PhonePe, Paytm, BHIM, Cards, and Net Banking options. Payment is auto-verified with instant pickup token generation!
              </p>
            </div>

            {shopSettings.isAcceptingOrders === false ? (
              <div className="space-y-2">
                <div className="bg-red-50 border border-red-200 text-red-800 text-xs font-bold p-3.5 rounded-xl text-center">
                  We are currently closed for the day. See you tomorrow!
                </div>
                <button
                  type="button"
                  disabled
                  className="w-full py-4 bg-stone-300 text-stone-500 font-extrabold text-base rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5 text-stone-400" />
                  <span>Store Closed (Payment Disabled)</span>
                </button>
              </div>
            ) : hasSoldOutItems ? (
              <div className="space-y-2">
                <div className="bg-red-100 border border-red-300 text-red-900 text-xs font-bold p-3.5 rounded-xl text-center">
                  ⚠️ Some items in your cart are currently Sold Out. Please close this modal, remove the sold out items from your cart, and try again.
                </div>
                <button
                  type="button"
                  disabled
                  className="w-full py-4 bg-stone-300 text-stone-500 font-extrabold text-base rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5 text-stone-400" />
                  <span>Remove Sold Out Items to Pay</span>
                </button>
              </div>
            ) : isOffline || !navigator.onLine ? (
              <div className="space-y-2">
                <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold p-3.5 rounded-xl text-center">
                  ⚠️ Network disconnected. Please check your internet before placing orders.
                </div>
                <button
                  type="button"
                  disabled
                  className="w-full py-4 bg-stone-300 text-stone-500 font-extrabold text-base rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5 text-stone-400" />
                  <span>Offline (Payment Disabled)</span>
                </button>
              </div>
            ) : (
              <button
                type="submit"
                disabled={isProcessing}
                onClick={(e) => handleProceedToPay(e, customerName, customerPhone)}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-base rounded-xl shadow-lg hover:shadow-red-950/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-5 h-5" />
                <span>
                  {isProcessing ? 'Opening Payment Sheet...' : `Proceed to Pay ₹${cartTotal}`}
                </span>
              </button>
            )}
          </div>

        </form>

        {/* Modal Footer */}
        <div className="p-3.5 bg-stone-100 border-t border-stone-200 text-[11px] text-center text-stone-500 flex items-center justify-center gap-1.5 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Generates high-visibility pickup token & live kitchen status upon payment!</span>
        </div>

      </div>
    </div>
  );
};
