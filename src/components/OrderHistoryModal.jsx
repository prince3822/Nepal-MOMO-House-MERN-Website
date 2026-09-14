import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { API_BASE_URL } from '../config/api';
import {
  X,
  Receipt,
  Search,
  Clock,
  CheckCircle2,
  ExternalLink,
  Phone,
  Ticket,
  AlertCircle,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

export const OrderHistoryModal = () => {
  const {
    orderHistory,
    isOrderHistoryOpen,
    setIsOrderHistoryOpen,
    shopSettings,
    viewOrderReceipt
  } = useShop();

  const [searchPhone, setSearchPhone] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [liveOrdersMap, setLiveOrdersMap] = useState({});

  useEffect(() => {
    if (!isOrderHistoryOpen) return;

    const refreshStatuses = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/live`);
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          const map = {};
          data.orders.forEach((o) => {
            const key = o._id || o.id || o.token;
            map[key] = o.status || 'Pending';
            if (o.token) map[o.token] = o.status || 'Pending';
          });
          setLiveOrdersMap(map);
        }
      } catch (err) {}
    };

    refreshStatuses();
    const interval = setInterval(refreshStatuses, 5000);
    return () => clearInterval(interval);
  }, [isOrderHistoryOpen]);

  if (!isOrderHistoryOpen) return null;

  // Handle phone number search fallback lookup
  const handlePhoneSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const cleanPhone = searchPhone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setSearchError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSearchError('');
    setIsSearching(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/lookup?phone=${cleanPhone}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setSearchResults(data.orders || []);
        if (!data.orders || data.orders.length === 0) {
          setSearchError('No past orders found for this mobile number.');
        }
      } else {
        setSearchError(data.error || 'Failed to search orders.');
      }
    } catch (err) {
      console.error('Error looking up orders:', err);
      setSearchError('Error connecting to server. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const displayOrders = searchResults !== null ? searchResults : orderHistory;

  const renderLiveStatusBadge = (st) => {
    const normalized = (st || 'Pending').trim();
    if (normalized === 'Ready to Pickup' || normalized === 'Ready') {
      return (
        <span className="bg-emerald-600 text-white font-extrabold px-2.5 py-1 rounded-full text-[11px] shadow-sm animate-pulse flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-amber-300" /> Ready for Pickup! Show Token at Counter
        </span>
      );
    }
    if (normalized === 'Preparing') {
      return (
        <span className="bg-blue-100 text-blue-900 font-extrabold px-2.5 py-0.5 rounded-full text-[11px] border border-blue-300 flex items-center gap-1 shrink-0">
          🍳 Kitchen Preparing...
        </span>
      );
    }
    if (normalized === 'Completed') {
      return (
        <span className="bg-stone-100 text-stone-700 font-bold px-2.5 py-0.5 rounded-full text-[11px] border border-stone-300 flex items-center gap-1 shrink-0">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
        </span>
      );
    }
    return (
      <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full text-[11px] border border-amber-300 flex items-center gap-1 shrink-0">
        <Clock className="w-3 h-3 text-amber-700" /> Order Pending
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] border border-stone-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-900 text-white flex justify-between items-center border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center shadow-md">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-white text-base sm:text-lg">
                My Orders & Digital Slips
              </h2>
              <p className="text-xs text-stone-400 font-medium">
                {shopSettings.name} • Recent Takeaway History
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSearchResults(null);
              setSearchError('');
              setIsOrderHistoryOpen(false);
            }}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar for Phone Lookup */}
        <div className="p-4 bg-stone-100 border-b border-stone-200 shrink-0 space-y-2">
          <form onSubmit={handlePhoneSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                maxLength={10}
                placeholder="Find My Orders by Phone (10 digits)"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-red-600"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isSearching ? 'Searching...' : 'Search'}</span>
            </button>
          </form>

          {searchResults !== null && (
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-bold text-stone-700">
                Found {searchResults.length} matching order(s) for <strong>{searchPhone}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchResults(null);
                  setSearchPhone('');
                  setSearchError('');
                }}
                className="text-red-600 font-extrabold hover:underline"
              >
                Clear Search
              </button>
            </div>
          )}

          {searchError && (
            <p className="text-xs text-red-600 font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{searchError}</span>
            </p>
          )}
        </div>

        {/* Orders List / History Container */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto bg-stone-50 flex-1">
          {displayOrders.length === 0 ? (
            <div className="text-center py-12 text-stone-500 space-y-3">
              <Ticket className="w-12 h-12 text-stone-300 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-extrabold text-stone-700">No orders found on this device.</p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  If you placed an order from another device or cleared your browser data, enter your 10-digit mobile number above to retrieve your pickup tokens.
                </p>
              </div>
            </div>
          ) : (
            displayOrders.map((ord, idx) => {
              const tokenStr = ord.token || ord.tokenNumber || `#${(ord._id || ord.id || '7257').slice(-4)}`;
              const orderDate = new Date(ord.placedAt || ord.timestamp || ord.createdAt || Date.now());
              const orderKey = ord._id || ord.id || ord.orderId || ord.token;
              const currentStatus = liveOrdersMap[orderKey] || liveOrdersMap[ord.token] || ord.status || 'Pending';

              return (
                <div
                  key={ord.orderId || ord._id || ord.id || idx}
                  className="bg-white rounded-2xl p-4 border border-stone-200 shadow-md space-y-3 hover:border-red-300 transition-all"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start border-b border-stone-100 pb-2.5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-heading font-black text-base text-red-700 bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-200">
                          {tokenStr}
                        </span>
                        {renderLiveStatusBadge(currentStatus)}
                      </div>
                      <p className="text-[11px] text-stone-500 font-medium mt-1.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {orderDate.toLocaleDateString()} at {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-stone-400 font-bold block">Total Paid</span>
                      <span className="text-base font-black text-stone-900 font-heading">
                        {shopSettings.currency}{ord.totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info & Items Summary */}
                  <div className="space-y-1 text-xs text-stone-700">
                    <p className="font-bold text-stone-900">
                      👤 {ord.customerName} <span className="font-mono text-stone-500 font-normal">({ord.customerPhone})</span>
                    </p>
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 space-y-1 text-[11px]">
                      {ord.items && ord.items.map((i, iIdx) => (
                        <div key={iIdx} className="flex justify-between font-semibold">
                          <span>{i.quantity}x {i.name}</span>
                          <span className="font-bold">{shopSettings.currency}{i.price * i.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* View Receipt / Token Slip Button */}
                  <button
                    onClick={() => viewOrderReceipt(ord)}
                    className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Receipt / Token Slip</span>
                    <ExternalLink className="w-3 h-3 text-stone-400 ml-0.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-white border-t border-stone-200 text-xs shrink-0 flex items-center justify-between">
          <span className="text-[11px] text-stone-400 font-medium">
            Saved on this device ({orderHistory.length}/10 max)
          </span>
          <button
            onClick={() => {
              setSearchResults(null);
              setSearchError('');
              setIsOrderHistoryOpen(false);
            }}
            className="text-xs font-bold text-stone-700 hover:text-stone-900"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
