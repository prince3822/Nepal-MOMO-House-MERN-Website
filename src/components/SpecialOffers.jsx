import React from 'react';
import { useShop } from '../context/ShopContext';
import { Tag, Sparkles, ShoppingBag } from 'lucide-react';

export const SpecialOffers = () => {
  const { offers, addToCart, menuItems, setIsCartOpen } = useShop();

  if (!offers || offers.length === 0) return null;

  const handleQuickAddCombo = (offer) => {
    // Quick add a representative combo item to cart
    const comboItem = {
      id: `combo-${offer.id}`,
      name: offer.title,
      price: 180, // discounted combo price
      category: "combo",
      isVeg: true,
      description: offer.subtitle,
      image: "/assets/momo_hero.jpg"
    };
    addToCart(comboItem, 1);
    setIsCartOpen(true);
  };

  return (
    <section id="offers" className="py-12 bg-stone-100/70 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Tag className="w-4 h-4" />
              <span>Exclusive Restaurant Deals</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-stone-900 font-heading">
              Special Combos & Offers
            </h2>
          </div>
          <a href="#menu" className="hidden sm:inline-block text-xs font-bold text-red-700 hover:text-red-800 underline">
            Browse Full Menu &rarr;
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-red-950 text-white p-6 shadow-md border border-stone-800 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="bg-amber-400 text-stone-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {offer.badge || 'Limited Time'}
                </span>
                <span className="text-xs font-mono text-amber-300 bg-white/10 px-2.5 py-1 rounded-md border border-white/10">
                  CODE: {offer.code}
                </span>
              </div>

              <div className="space-y-1 mb-6">
                <h3 className="text-xl md:text-2xl font-bold font-heading text-white">
                  {offer.title}
                </h3>
                <p className="text-stone-300 text-xs md:text-sm">
                  {offer.subtitle}
                </p>
                <div className="text-2xl font-extrabold text-amber-400 font-heading pt-2">
                  {offer.discount}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs text-stone-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Available for Pickup in Raxaul
                </span>
                <button
                  onClick={() => handleQuickAddCombo(offer)}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Order Combo
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
