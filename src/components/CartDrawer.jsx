import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Sparkles, Utensils } from 'lucide-react';

export const CartDrawer = () => {
  const {
    cart,
    menuItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    itemCount,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    shopSettings
  } = useShop();

  if (!isCartOpen) return null;

  const hasSoldOutItems = cart.some((item) => {
    const m = (menuItems || []).find((x) => x.id === item.id || x.itemId === item.id || x.id === item.itemId);
    return item.isAvailable === false || (m && m.isAvailable === false);
  });

  const handleProceedToCheckout = () => {
    if (hasSoldOutItems) return;
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/70 backdrop-blur-xs flex justify-end transition-opacity duration-300">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-white text-lg">Your Order Cart</h2>
                {itemCount > 0 && (
                  <span className="bg-amber-400 text-stone-950 font-black text-xs px-2 py-0.5 rounded-full">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 font-medium">{shopSettings.name} • {shopSettings.city}</p>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {cart.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto text-3xl shadow-inner">
                🥟
              </div>
              <h3 className="text-lg font-bold text-stone-800 font-heading">Your Cart is Empty</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                Browse our menu of hot Himalayan Steamed, Jhol, and Kurkure Momos and add your favorites!
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-3 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors shadow-xs"
              >
                <Utensils className="w-4 h-4" /> Explore Menu
              </button>
            </div>
          ) : (
            <>
              {/* Item list header */}
              <div className="flex justify-between items-center text-xs font-bold text-stone-500 uppercase tracking-wider">
                <span>Selected Items</span>
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:underline flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {cart.map((item) => {
                  const m = (menuItems || []).find((x) => x.id === item.id || x.itemId === item.id || x.id === item.itemId);
                  const isItemSoldOut = item.isAvailable === false || (m && m.isAvailable === false);

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between gap-3 p-3 rounded-2xl border shadow-2xs transition-colors ${
                        isItemSoldOut ? 'bg-red-50/60 border-red-300' : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-stone-200"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                              }`}
                            ></span>
                            <h4 className="text-xs font-bold text-stone-900 truncate leading-snug">
                              {item.name}
                            </h4>
                            {isItemSoldOut && (
                              <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded">
                                Sold Out
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-black text-red-700 font-heading mt-0.5">
                            {shopSettings.currency}{item.price} <span className="text-[10px] text-stone-400 font-normal">each</span>
                          </p>
                        </div>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-stone-300 shadow-2xs">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 text-stone-600 hover:text-red-600 rounded-lg hover:bg-stone-100 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-stone-900 w-5 text-center font-heading">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 text-stone-600 hover:text-red-600 rounded-lg hover:bg-stone-100 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-xs font-extrabold text-stone-900 font-heading">
                          {shopSettings.currency}{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Advance Payment Notice Card */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Takeaway Advance Payment Policy</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-snug">
                  To prevent food waste & uncollected orders, all takeaway orders require advance payment before kitchen preparation.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-stone-500">Cart Total ({itemCount} items)</span>
                <p className="text-[11px] text-emerald-700 font-medium">Pre-paid Order</p>
              </div>
              <span className="text-2xl font-black text-red-700 font-heading">
                {shopSettings.currency}{cartTotal}
              </span>
            </div>

            {!navigator.onLine ? (
              <div className="space-y-2">
                <div className="bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold p-3 rounded-xl text-center">
                  ⚠️ Network Disconnected. Please check your internet connection before checking out.
                </div>
                <button
                  disabled
                  className="w-full py-3.5 bg-stone-300 text-stone-500 font-extrabold rounded-xl cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  <span>Offline (Checkout Disabled)</span>
                </button>
              </div>
            ) : shopSettings.isAcceptingOrders === false ? (
              <div className="space-y-2">
                <div className="bg-red-50 border border-red-200 text-red-800 text-xs font-bold p-3 rounded-xl text-center">
                  We are currently closed for the day. See you tomorrow!
                </div>
                <button
                  disabled
                  className="w-full py-3.5 bg-stone-300 text-stone-500 font-extrabold rounded-xl cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  <span>Store Closed (Checkout Disabled)</span>
                </button>
              </div>
            ) : hasSoldOutItems ? (
              <div className="space-y-2">
                <div className="bg-red-100 border border-red-300 text-red-900 text-xs font-bold p-3 rounded-xl text-center">
                  ⚠️ Some items in your cart are currently Sold Out. Please remove them before proceeding to checkout.
                </div>
                <button
                  disabled
                  className="w-full py-3.5 bg-stone-300 text-stone-500 font-extrabold rounded-xl cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  <span>Remove Sold Out Items to Checkout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold rounded-xl shadow-lg hover:shadow-red-950/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
