import React from 'react';
import { useShop } from '../context/ShopContext';
import { Sparkles, Phone, MessageSquare, AlertCircle } from 'lucide-react';

export const AnnouncementBar = () => {
  const { shopSettings } = useShop();

  const isClosed = shopSettings.isAcceptingOrders === false;

  return (
    <>
      {isClosed && (
        <div className="bg-amber-600 text-white py-2.5 px-4 text-xs md:text-sm font-extrabold text-center border-b border-amber-700 flex items-center justify-center gap-2 shadow-sm animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-200" />
          <span>We are currently closed for the day. See you tomorrow!</span>
        </div>
      )}

      {shopSettings.announcement && (
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 text-white py-2 px-4 text-xs md:text-sm font-medium">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-300 animate-pulse" />
              <span>{shopSettings.announcement}</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 shrink-0 text-xs">
              <a
                href={`tel:${shopSettings.phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-1 hover:text-amber-200 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call: {shopSettings.phone}</span>
              </a>
              <a
                href={`https://wa.me/${shopSettings.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
