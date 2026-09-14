import React from 'react';
import { useShop } from '../context/ShopContext';
import { MapPin, Phone, MessageSquare, Clock, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  const { shopSettings, setIsAdminOpen } = useShop();

  const cleanWhatsApp = shopSettings.whatsapp.replace(/[^0-9]/g, '');
  const cleanPhone = shopSettings.phone.replace(/\s+/g, '');

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-md bg-stone-800 shrink-0">
                <img
                  src={shopSettings.logo || "/assets/logo.jpg"}
                  alt={shopSettings.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-white text-xl tracking-tight">
                  {shopSettings.name}
                </h3>
                <p className="text-xs text-amber-400 font-bold">
                  {shopSettings.city || 'Raxaul'}, {shopSettings.state || 'Bihar'}, {shopSettings.country || 'India'}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              Authentic Nepalese Momos and Fast Food in Raxaul. Fresh, hot, and prepared daily with traditional Himalayan spices.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-stone-400">
              {shopSettings.facebookUrl && (
                <a
                  href={shopSettings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-stone-900 hover:bg-red-600 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  Facebook
                </a>
              )}
              {shopSettings.instagramUrl && (
                <a
                  href={shopSettings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-stone-900 hover:bg-red-600 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  Instagram
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider text-amber-400">
              Quick Navigation
            </h4>
            <ul className="space-y-2">
              <li><a href="#hero" className="hover:text-red-400 transition-colors">Home</a></li>
              <li><a href="#menu" className="hover:text-red-400 transition-colors">Menu & Price List</a></li>
              <li><a href="#offers" className="hover:text-red-400 transition-colors">Combo Offers</a></li>
              <li><a href="#story" className="hover:text-red-400 transition-colors">About Nepal MOMO House</a></li>
              <li><a href="#location" className="hover:text-red-400 transition-colors">Location & Directions</a></li>
            </ul>
          </div>

          {/* Column 3: Contact & Pickup Details */}
          <div className="space-y-3 text-xs">
            <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider text-amber-400">
              Contact & Pickup
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{shopSettings.fullAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <a href={`tel:${cleanPhone}`} className="hover:text-white underline">
                  {shopSettings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                <a
                  href={`https://wa.me/${cleanWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline"
                >
                  WhatsApp: +{cleanWhatsApp}
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Hours & Directions */}
          <div className="space-y-3 text-xs">
            <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider text-amber-400">
              Hours & Directions
            </h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-stone-300">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{shopSettings.openingHours}</span>
              </div>
            </div>

            <div className="pt-3">
              <a
                href={
                  shopSettings.googleMapsUrl && !shopSettings.googleMapsUrl.includes('embed')
                    ? shopSettings.googleMapsUrl
                    : "https://www.google.com/maps/search/?api=1&query=Nepal+MOMO+House+Laxmipur+Karbola+Rd+near+The+Chandrasheel+School+Raxaul+Bihar+845305"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-stone-700 transition-colors"
              >
                <span>Google Maps Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()}</span>
            <span className="font-bold text-stone-300">{shopSettings.name}</span>
            <span>({shopSettings.city || 'Raxaul'}). All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <span>Fresh. Hot. Delicious.</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
