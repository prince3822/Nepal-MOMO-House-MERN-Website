import React from 'react';
import { useShop } from '../context/ShopContext';
import { MapPin, Phone, MessageSquare, Clock, Navigation, Compass, ExternalLink } from 'lucide-react';

export const LocationSection = () => {
  const { shopSettings } = useShop();

  const cleanWhatsApp = shopSettings.whatsapp.replace(/[^0-9]/g, '');
  const cleanPhone = shopSettings.phone.replace(/\s+/g, '');

  return (
    <section id="location" className="py-16 bg-stone-900 text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Location & Shop Info */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="inline-flex items-center gap-1.5 bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <Navigation className="w-3.5 h-3.5" />
              <span>Visit Nepal MOMO House</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
                {shopSettings.name}
              </h2>
              <p className="text-xl font-bold text-amber-400 font-heading">
                {shopSettings.city || 'Raxaul'}, {shopSettings.state || 'Bihar'}, {shopSettings.country || 'India'}
              </p>
            </div>

            <p className="text-stone-300 text-sm md:text-base leading-relaxed">
              Located conveniently in the heart of Raxaul. Drop by for hot steamed momos or place a pickup order directly via WhatsApp!
            </p>

            {/* Address & Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <MapPin className="w-4 h-4" /> Address
                </div>
                <p className="text-stone-300 leading-snug">
                  {shopSettings.fullAddress}
                </p>
              </div>

              <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Clock className="w-4 h-4" /> Opening Hours
                </div>
                <p className="text-stone-300 leading-snug">
                  {shopSettings.openingHours}
                </p>
              </div>

              <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Phone className="w-4 h-4" /> Phone Number
                </div>
                <a href={`tel:${cleanPhone}`} className="text-stone-300 hover:text-white underline">
                  {shopSettings.phone}
                </a>
              </div>

              <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <MessageSquare className="w-4 h-4" /> WhatsApp Pickup
                </div>
                <a
                  href={`https://wa.me/${cleanWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-300 hover:text-white underline"
                >
                  +{cleanWhatsApp}
                </a>
              </div>

            </div>

            {/* Google Maps "Get Directions" Button */}
            <div className="pt-2">
              <a
                href={
                  shopSettings.googleMapsUrl && !shopSettings.googleMapsUrl.includes('embed')
                    ? shopSettings.googleMapsUrl
                    : "https://www.google.com/maps/search/?api=1&query=Nepal+MOMO+House+Laxmipur+Karbola+Rd+near+The+Chandrasheel+School+Raxaul+Bihar+845305"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <Compass className="w-5 h-5" />
                <span>Get Directions on Google Maps</span>
                <ExternalLink className="w-4 h-4 opacity-75" />
              </a>
            </div>

          </div>

          {/* Right Column: Embedded Location Map / Visual Card */}
          <div className="lg:col-span-6">
            <div className="bg-stone-800 p-3 rounded-2xl border border-stone-700 shadow-2xl relative overflow-hidden">
              <div className="relative rounded-2xl overflow-hidden aspect-16/10 bg-stone-950">
                <iframe
                  title="Nepal MOMO House Location Map"
                  src="https://maps.google.com/maps?q=Nepal+MOMO+House+Laxmipur+Karbola+Rd+near+The+Chandrasheel+School+Raxaul+Bihar+845305&hl=en&z=16&output=embed"
                  className="w-full h-full border-0 filter grayscale-20 contrast-110 opacity-95"
                  loading="lazy"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
