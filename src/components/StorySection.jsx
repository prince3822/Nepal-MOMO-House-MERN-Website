import React from 'react';
import { useShop } from '../context/ShopContext';
import { Heart, Sparkles, ChefHat, Users } from 'lucide-react';

export const StorySection = () => {
  const { shopSettings } = useShop();

  return (
    <section id="story" className="py-16 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-4/3">
              <img
                src="/assets/momo_hero.jpg"
                alt="Nepalese Momos Craft"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="absolute -bottom-6 -right-6 hidden sm:block bg-stone-900 text-white p-5 rounded-2xl border border-stone-800 shadow-xl max-w-xs">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-lg font-heading">
                <ChefHat className="w-5 h-5" /> Fresh Every Day
              </div>
              <p className="text-xs text-stone-300 mt-1">
                Handfolded daily by experienced momo chefs using genuine spices imported from Nepal.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 text-red-600" />
              <span>Authentic Local Taste</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-heading leading-tight">
              About {shopSettings.name}, {shopSettings.city || 'Raxaul'}
            </h2>

            <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
              At <strong>{shopSettings.name}</strong> in {shopSettings.city || 'Raxaul'}, we take immense pride in crafting authentic Nepalese momos with thin, soft skins and juicy, spiced fillings. From our signature <em>Steamed Chicken & Veg Himalayan Momos</em> to our spicy <em>Kathmandu Jhol Momos</em> and extra crunchy <em>Kurkure Momos</em>, every plate is prepared fresh for you.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs font-medium text-stone-800">
              <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Homemade Spicy Chutneys</h4>
                  <p className="text-stone-500 mt-0.5">Fiery roasted red tomato garlic chutney & creamy yellow sesame dip.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Hygienic & Fast Service</h4>
                  <p className="text-stone-500 mt-0.5">Clean open kitchen, quick pickup orders, and friendly local service.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
