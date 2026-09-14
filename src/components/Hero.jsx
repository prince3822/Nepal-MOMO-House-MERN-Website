import React from 'react';
import { useShop } from '../context/ShopContext';
import { Utensils, Flame, ShieldCheck, Clock, MapPin, ArrowRight } from 'lucide-react';

export const Hero = () => {
  const { shopSettings } = useShop();

  return (
    <section id="hero" className="relative bg-stone-900 text-white overflow-hidden py-16 md:py-24">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/momo_hero.jpg"
          alt="Nepal MOMO House Fresh Hot Momos"
          className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 warm-hero-overlay"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Hero Text Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Location & Authenticity Badge */}
            <div className="inline-flex items-center gap-2 bg-red-600/90 backdrop-blur-xs text-white px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-md">
              <MapPin className="w-3.5 h-3.5" />
              <span>{shopSettings.name} • {shopSettings.city || 'Raxaul'}, {shopSettings.state || 'Bihar'}</span>
            </div>

            {/* Restaurant Title & Tagline */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-3 border-amber-400 shadow-xl bg-stone-800 shrink-0">
                  <img
                    src={shopSettings.logo || "/assets/logo.jpg"}
                    alt={shopSettings.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight leading-none">
                    {shopSettings.name}
                  </h1>
                  <p className="text-xl sm:text-2xl font-bold text-amber-400 font-heading italic tracking-wide mt-1">
                    {shopSettings.tagline || 'Fresh. Hot. Delicious.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-stone-300 text-base md:text-lg max-w-2xl leading-relaxed">
              Serving piping hot, authentic Nepalese Steamed, Fried, Jhol, and Kurkure Momos along with delicious Indo-Chinese noodles right here in {shopSettings.city || 'Raxaul'}.
            </p>

            {/* CTA Button: View Menu & Order */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#menu"
                className="flex items-center gap-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-base sm:text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-red-950/40 transition-all transform hover:-translate-y-0.5"
              >
                <Utensils className="w-5 h-5" />
                <span>View Menu & Order</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </a>
            </div>

            {/* Highlight Badges */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-stone-800 text-xs text-stone-300 font-medium">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-900/50 flex items-center justify-center text-red-400 shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <span>100% Authentic Nepalese Recipe</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-900/50 flex items-center justify-center text-amber-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Hygienic & Fresh Ingredients</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-900/50 flex items-center justify-center text-emerald-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <span>Quick 15-Min Pickup</span>
              </div>
            </div>
          </div>

          {/* Hero Feature Card Right */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="bg-stone-900/80 backdrop-blur-md p-6 rounded-2xl border border-stone-700/80 shadow-2xl text-stone-100 space-y-4">
              <div className="relative rounded-xl overflow-hidden aspect-4/3 shadow-inner">
                <img
                  src="/assets/jhol_momo.jpg"
                  alt="Famous Jhol Momo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                  🔥 Special Pick
                </div>
              </div>
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold font-heading text-white">Kathmandu Jhol Momos</h3>
                    <p className="text-xs text-stone-400">Authentic tangy roasted sesame & tomato gravy</p>
                  </div>
                  <span className="text-xl font-extrabold text-amber-400 font-heading">₹110</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <a
                    href="#menu"
                    className="w-full py-2.5 text-center bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Explore All Momos
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
