import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { defaultCategories } from '../data/defaultData';
import { Search, Flame, Plus, Check, MessageSquare, Filter, ShieldAlert } from 'lucide-react';

export const MenuSection = () => {
  const { menuItems, shopSettings, addToCart, cart } = useShop();

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dietFilter, setDietFilter] = useState("all"); // "all", "veg", "non-veg"
  const [addedAnimationId, setAddedAnimationId] = useState(null);

  // Filter menu items based on category, diet, search query
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category Filter
      if (activeCategory !== "all" && item.category !== activeCategory) {
        return false;
      }
      // Diet Filter
      if (dietFilter === "veg" && !item.isVeg) return false;
      if (dietFilter === "non-veg" && item.isVeg) return false;

      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    });
  }, [menuItems, activeCategory, dietFilter, searchQuery]);

  const handleAddToCart = (item) => {
    addToCart(item, 1);
    setAddedAnimationId(item.id);
    setTimeout(() => setAddedAnimationId(null), 1200);
  };

  const getCartQuantity = (itemId) => {
    const existing = cart.find((c) => c.id === itemId);
    return existing ? existing.quantity : 0;
  };

  const cleanWhatsApp = shopSettings.whatsapp.replace(/[^0-9]/g, '');

  return (
    <section id="menu" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <span>Authentic Menu</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-heading">
            {shopSettings.name} Menu
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            Prepared fresh to order using traditional Nepalese spices & secret family recipes.
          </p>
        </div>

        {/* Search & Diet Filters Bar */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search momos, chowmein..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-stone-900 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-stone-300 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
            />
          </div>

          {/* Veg / Non-Veg Diet Filter Toggle Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-center">
            <span className="text-xs font-semibold text-stone-500 mr-1 hidden sm:inline flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <button
              onClick={() => setDietFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dietFilter === "all"
                  ? "bg-stone-900 text-white shadow-xs"
                  : "bg-white text-stone-700 border border-stone-300 hover:bg-stone-100"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDietFilter("veg")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dietFilter === "veg"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Pure Veg
            </button>
            <button
              onClick={() => setDietFilter("non-veg")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dietFilter === "non-veg"
                  ? "bg-red-700 text-white shadow-xs"
                  : "bg-white text-red-800 border border-red-300 hover:bg-red-50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              Non-Veg
            </button>
          </div>
        </div>

        {/* Category Scrollable Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth">
          {defaultCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 ${
                activeCategory === cat.id
                  ? "bg-red-600 text-white shadow-md shadow-red-900/10"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200">
            <ShieldAlert className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800 font-heading">No items found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
              Try adjusting your search terms or filter selection.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
                setDietFilter("all");
              }}
              className="mt-4 text-xs font-bold text-red-600 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const qtyInCart = getCartQuantity(item.id);
              const isJustAdded = addedAnimationId === item.id;

              return (
                <div key={item.id} className="food-card flex flex-col justify-between overflow-hidden">
                  <div>
                    {/* Item Image Container */}
                    <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                        {/* Veg / Non-Veg Icon */}
                        <div
                          className={`flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
                            item.isVeg ? "badge-veg" : "badge-nonveg"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.isVeg ? "badge-veg-dot" : "badge-nonveg-dot"
                            }`}
                          ></span>
                          <span>{item.isVeg ? "VEG" : "NON-VEG"}</span>
                        </div>

                        {item.isBestseller && (
                          <span className="bg-amber-500 text-stone-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-md shadow-xs">
                            ★ Bestseller
                          </span>
                        )}

                        {item.isAvailable === false && (
                          <span className="bg-red-600 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-md shadow-md">
                            Sold Out
                          </span>
                        )}
                      </div>

                      {/* Spicy Rating Indicator */}
                      {item.spicyLevel > 0 && (
                        <div className="absolute top-3 right-3 bg-stone-900/80 text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 z-10">
                          {Array.from({ length: item.spicyLevel }).map((_, i) => (
                            <span key={i}>🌶️</span>
                          ))}
                        </div>
                      )}

                      {item.isAvailable === false && (
                        <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center text-white font-black text-sm uppercase tracking-wider z-0">
                          Sold Out Today
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading font-extrabold text-stone-900 text-lg leading-snug">
                          {item.name}
                        </h3>
                        <span className="font-heading font-black text-xl text-red-700 shrink-0">
                          {shopSettings.currency || "₹"}{item.price}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-5 pt-0 flex items-center gap-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.isAvailable === false}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                        item.isAvailable === false
                          ? "bg-stone-300 text-stone-600 opacity-50 cursor-not-allowed"
                          : isJustAdded
                          ? "bg-emerald-600 text-white"
                          : "bg-red-600 hover:bg-red-700 text-white shadow-xs hover:shadow-md cursor-pointer"
                      }`}
                    >
                      {item.isAvailable === false ? (
                        <span>Sold Out</span>
                      ) : isJustAdded ? (
                        <>
                          <Check className="w-4 h-4" /> Added to Cart!
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          {qtyInCart > 0 ? `Add More (${qtyInCart})` : "Add to Order"}
                        </>
                      )}
                    </button>

                    {/* Direct WhatsApp Quick Order */}
                    <a
                      href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                        `Hi Nepal MOMO House, I would like to order: 1x ${item.name} (${shopSettings.currency}${item.price}) for pickup in Raxaul.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                      title="Quick Order on WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
