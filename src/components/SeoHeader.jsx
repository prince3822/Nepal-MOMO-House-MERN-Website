import React, { useEffect } from 'react';
import { useShop } from '../context/ShopContext';

export const SeoHeader = () => {
  const { shopSettings } = useShop();

  useEffect(() => {
    // Update Document Title
    const title = `${shopSettings.name} | Momos & Fast Food in ${shopSettings.city || 'Raxaul'}`;
    document.title = title;

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        `Explore the menu, offers, location and pickup ordering options at ${shopSettings.name} in ${shopSettings.city || 'Raxaul'}, ${shopSettings.state || 'Bihar'}.`
      );
    }

    // Inject/Update JSON-LD LocalBusiness Structured Data
    const ldJsonId = 'nepal-momo-house-json-ld';
    let scriptTag = document.getElementById(ldJsonId);
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = ldJsonId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    // Update OG Image
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', shopSettings.logo || '/assets/logo.jpg');
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "FastFoodRestaurant",
      "name": shopSettings.name,
      "description": `${shopSettings.tagline} - Authentic Nepalese Momos and Fast Food in Raxaul.`,
      "image": shopSettings.logo || "/assets/logo.jpg",
      "logo": shopSettings.logo || "/assets/logo.jpg",
      "telephone": shopSettings.phone,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": shopSettings.fullAddress,
        "addressLocality": shopSettings.city || "Raxaul",
        "addressRegion": shopSettings.state || "Bihar",
        "postalCode": "845305",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 26.9777,
        "longitude": 84.8504
      },
      "url": window.location.origin,
      "openingHours": "Mo-Su 11:00-22:00",
      "servesCuisine": ["Nepalese", "Tibetan", "Chinese", "Momos", "Fast Food"],
      "priceRange": "₹",
      "hasMenu": `${window.location.origin}/#menu`
    };

    scriptTag.textContent = JSON.stringify(structuredData);
  }, [shopSettings]);

  return null;
};
