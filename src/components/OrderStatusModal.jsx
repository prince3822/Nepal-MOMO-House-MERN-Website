import React from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  Clock,
  CheckCircle2,
  Phone,
  User,
  ShieldCheck,
  Sparkles,
  Receipt,
  Utensils
} from 'lucide-react';

export const OrderStatusModal = () => {
  const {
    latestOrder,
    orders,
    isOrderStatusOpen,
    setIsOrderStatusOpen,
    shopSettings,
    clearActiveOrder
  } = useShop();

  const targetOrder = latestOrder || (orders && orders[0]) || null;
  const [liveStatus, setLiveStatus] = React.useState(targetOrder?.status || 'Pending');

  React.useEffect(() => {
    if (!isOrderStatusOpen || !targetOrder) return;

    const orderId = targetOrder._id || targetOrder.id || targetOrder.token;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
        const data = await res.json();
        if (data.success && data.order && data.order.status) {
          setLiveStatus(data.order.status);
        }
      } catch (err) {}
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [isOrderStatusOpen, targetOrder]);

  if (!isOrderStatusOpen || !targetOrder) return null;

  const tokenNumber = targetOrder.token || `#${targetOrder.id?.slice(-4) || '7257'}`;

  const handleDone = () => {
    clearActiveOrder();
    // Scroll to menu section
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderStatusBadge = () => {
    const st = (liveStatus || 'Pending').trim();
    if (st === 'Ready to Pickup' || st === 'Ready') {
      return (
        <div className="bg-emerald-600 text-white font-black p-3.5 rounded-2xl text-center text-sm shadow-xl border border-emerald-400 flex items-center justify-center gap-2 animate-pulse">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>Ready for Pickup! Show Token at Counter</span>
        </div>
      );
    }
    if (st === 'Preparing') {
      return (
        <div className="bg-blue-600 text-white font-black p-3 rounded-2xl text-center text-xs shadow-md border border-blue-500 flex items-center justify-center gap-2">
          <Utensils className="w-4 h-4 text-blue-200 animate-bounce" />
          <span>Kitchen Status: 🍳 Preparing Your Hot Momos Now!</span>
        </div>
      );
    }
    if (st === 'Completed') {
      return (
        <div className="bg-stone-900 text-emerald-400 font-black p-3 rounded-2xl text-center text-xs shadow-md border border-stone-700 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Order Completed & Served ✅ Enjoy your meal!</span>
        </div>
      );
    }
    return (
      <div className="bg-amber-500 text-white font-black p-3 rounded-2xl text-center text-xs shadow-md border border-amber-400 flex items-center justify-center gap-2">
        <Clock className="w-4 h-4 animate-spin" />
        <span>Kitchen Status: ⏳ Order Received - Pending Preparation</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[94vh] border border-stone-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-stone-900 text-white flex justify-between items-center border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-white text-base sm:text-lg">
                Order Confirmed ✅
              </h2>
              <p className="text-xs text-stone-400 font-medium">
                {shopSettings.name} • Digital Pickup Slip
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOrderStatusOpen(false)}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Static Digital Pickup Slip */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto bg-stone-50 flex-1">
          
          {/* Live Kitchen Status Banner */}
          {renderStatusBadge()}

          {/* Big Bold Token Card */}
          <div className="bg-gradient-to-br from-red-600 via-red-700 to-amber-600 text-white p-5 rounded-2xl shadow-xl text-center space-y-2 relative overflow-hidden border border-red-500">
            <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
              <Utensils className="w-32 h-32 text-white" />
            </div>

            <span className="text-[11px] uppercase tracking-widest font-black text-amber-200 block">
              YOUR PICKUP TOKEN NUMBER
            </span>
            <div className="text-4xl sm:text-5xl font-black font-heading tracking-wider text-white py-1">
              {tokenNumber}
            </div>
            <p className="text-xs font-bold text-amber-100 bg-white/15 backdrop-blur-xs py-1.5 px-3 rounded-full inline-block border border-white/20">
              👉 Show this token at the counter
            </p>
          </div>

          {/* Customer & Pickup Window Details */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3 text-xs">
            <h3 className="font-extrabold text-stone-900 font-heading uppercase tracking-wider text-red-700 border-b pb-2 flex items-center gap-1.5 text-[11px]">
              <User className="w-3.5 h-3.5" /> Customer & Pickup Info
            </h3>

            <div className="grid grid-cols-2 gap-3 font-medium">
              <div>
                <span className="text-[10px] text-stone-400 font-bold block uppercase">Customer Name</span>
                <span className="font-extrabold text-stone-900 text-sm">{targetOrder.customerName}</span>
              </div>

              <div>
                <span className="text-[10px] text-stone-400 font-bold block uppercase">Mobile Phone</span>
                <span className="font-bold text-stone-800 font-mono text-sm">📞 {targetOrder.customerPhone}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-stone-800 font-bold">
                <Clock className="w-4 h-4 text-red-600 shrink-0" />
                <span>Estimated Pickup:</span>
              </div>
              <span className="bg-amber-100 text-amber-900 font-extrabold px-3 py-1 rounded-full text-xs border border-amber-300">
                Ready in {targetOrder.pickupTime || '15-20 mins'}
              </span>
            </div>
          </div>

          {/* Itemized Bill Summary & Total Paid */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-extrabold text-stone-900 font-heading flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-red-700">
                <Receipt className="w-3.5 h-3.5" /> Order Summary
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> PAID ONLINE
              </span>
            </div>

            <div className="space-y-2 text-stone-800">
              {targetOrder.items && targetOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between font-medium">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-bold font-heading">{shopSettings.currency}{item.price * item.quantity}</span>
                </div>
              ))}
              {targetOrder.notes && (
                <p className="text-[11px] text-amber-700 font-bold pt-1.5 border-t border-stone-100 mt-1">
                  📝 Note: {targetOrder.notes}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-between items-center">
              <span className="font-extrabold text-stone-900 text-sm">Total Paid</span>
              <span className="text-xl font-black text-red-700 font-heading">
                {shopSettings.currency}{targetOrder.totalAmount}
              </span>
            </div>
          </div>

        </div>

        {/* Single Action Button: Done / Order More */}
        <div className="p-4 bg-white border-t border-stone-200 text-xs shrink-0 space-y-2">
          <button
            onClick={handleDone}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-sm rounded-xl shadow-lg hover:shadow-red-950/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Utensils className="w-4 h-4 text-amber-300" />
            <span>Done / Order More</span>
          </button>

          <p className="text-[10px] text-center text-stone-400 font-medium flex items-center justify-center gap-1 pt-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Show your digital pickup slip token at the counter to receive your fresh momos!</span>
          </p>
        </div>

      </div>
    </div>
  );
};
