import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ShoppingBag, Utensils, MapPin, Menu as MenuIcon, X, Phone, Clock, Receipt } from 'lucide-react';

export const Navbar = () => {
  const {
    shopSettings,
    itemCount,
    setIsCartOpen,
    setIsOrderHistoryOpen,
    hasRecentActiveOrder
  } = useShop();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 max-w-full overflow-hidden">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 gap-2">
          
          {/* Brand Logo & Name Container */}
          <a href="#" className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-amber-500 shadow-md group-hover:scale-105 transition-transform bg-stone-100 shrink-0">
              <img
                src={shopSettings.logo || "/assets/logo.jpg"}
                alt={shopSettings.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-heading font-extrabold text-sm sm:text-xl md:text-2xl text-stone-900 tracking-tight truncate leading-tight">
                  {shopSettings.name}
                </span>
                <span className="hidden sm:inline-flex items-center bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200 shrink-0">
                  {shopSettings.city || 'Raxaul'}
                </span>
              </div>
              <p className="hidden md:flex items-center gap-1 text-xs text-stone-500 font-medium mt-0.5">
                <MapPin className="w-3 h-3 text-red-600 inline shrink-0" />
                {shopSettings.city}, {shopSettings.state}
              </p>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-medium text-stone-700 text-sm">
            <a href="#hero" className="hover:text-red-600 transition-colors">Home</a>
            <a href="#menu" className="hover:text-red-600 transition-colors flex items-center gap-1 font-bold text-red-600">
              <Utensils className="w-4 h-4 text-red-600" />
              Menu & Order
            </a>
            <a href="#offers" className="hover:text-red-600 transition-colors">Offers</a>
            <a href="#story" className="hover:text-red-600 transition-colors">About Us</a>
            <a href="#location" className="hover:text-red-600 transition-colors">Location</a>
          </nav>

          {/* Actions Right Container */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-auto">
            
            {/* My Orders Button - Hidden on mobile (<768px), visible on md+ */}
            <button
              onClick={() => setIsOrderHistoryOpen(true)}
              className="hidden md:inline-flex relative items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs px-3.5 py-2 rounded-xl transition-all border border-stone-300 shrink-0 cursor-pointer"
              title="My Orders & Token Receipts"
            >
              <Receipt className="w-4 h-4 text-stone-700 shrink-0" />
              <span>My Orders</span>
              {hasRecentActiveOrder && (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping absolute -top-0.5 -right-0.5 ring-2 ring-white"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 absolute -top-0.5 -right-0.5 border border-white"></span>
                </>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 sm:gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all font-bold text-xs sm:text-sm shadow-md shrink-0 cursor-pointer"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
              <span>Cart</span>
              {itemCount > 0 && (
                <span className="bg-amber-400 text-stone-950 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Need Help / Contact Link */}
            <a
              href={`tel:${shopSettings.phone.replace(/\s+/g, '')}`}
              className="hidden lg:flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors border border-stone-200 shrink-0"
            >
              <Phone className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              <span>Need Help?</span>
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-stone-700 hover:text-red-600 focus:outline-hidden shrink-0 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 py-4 px-2 bg-white space-y-3 font-medium text-stone-700 text-sm">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-stone-50 text-stone-900"
            >
              Home
            </a>
            <a
              href="#menu"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-stone-50 text-red-600 font-extrabold"
            >
              View Menu & Order 🥟
            </a>
            <a
              href="#offers"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-stone-50"
            >
              Special Offers
            </a>
            <a
              href="#story"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-stone-50"
            >
              Our Story
            </a>
            <a
              href="#location"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-stone-50"
            >
              Location & Hours
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsOrderHistoryOpen(true);
              }}
              className="w-full text-left px-3 py-2 bg-stone-100 text-stone-900 rounded-lg flex items-center justify-between font-bold text-xs cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-stone-700" />
                My Orders & Receipts 🧾
              </span>
              {hasRecentActiveOrder && (
                <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">Active</span>
              )}
            </button>

            <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
              <a
                href={`tel:${shopSettings.phone.replace(/\s+/g, '')}`}
                className="w-full flex items-center justify-center gap-2 bg-stone-100 text-stone-800 py-2.5 rounded-xl text-xs font-semibold"
              >
                <Phone className="w-4 h-4 text-stone-600" />
                Call Outlet ({shopSettings.phone})
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
