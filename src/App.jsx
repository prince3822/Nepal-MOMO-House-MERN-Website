import React, { useState, useEffect } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { SeoHeader } from './components/SeoHeader';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SpecialOffers } from './components/SpecialOffers';
import { MenuSection } from './components/MenuSection';
import { StorySection } from './components/StorySection';
import { LocationSection } from './components/LocationSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderStatusModal } from './components/OrderStatusModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { NetworkStatusBanner } from './components/NetworkStatusBanner';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';

function AppContent() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Dedicated Admin Login Route (/admin/login)
  if (currentPath === '/admin/login') {
    return (
      <AdminLogin
        onBackToSite={() => navigate('/')}
        onLoginSuccess={() => navigate('/admin')}
      />
    );
  }

  // Dedicated Protected Admin Route (/admin)
  if (currentPath === '/admin' || window.location.hash === '#admin') {
    return (
      <AdminProtectedRoute onBackToSite={() => navigate('/')}>
        <AdminPanel onLogout={() => navigate('/admin/login')} />
      </AdminProtectedRoute>
    );
  }

  // Customer-Facing Storefront (Clean UI - No Admin/Gear Icons)
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-red-500 selection:text-white max-w-full overflow-x-hidden">
      <NetworkStatusBanner />
      <SeoHeader />
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <SpecialOffers />
        <MenuSection />
        <StorySection />
        <LocationSection />
      </main>
      <Footer />

      {/* Global Customer Modals & Drawers */}
      <CartDrawer />
      <CheckoutModal />
      <OrderStatusModal />
      <OrderHistoryModal />
      <PwaInstallBanner />
    </div>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}
