import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultShopSettings, defaultMenuItems, defaultOffers } from '../data/defaultData';
import { API_BASE_URL } from '../config/api';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  // Shop Settings State
  const [shopSettings, setShopSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('nmh_shop_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          !parsed.fullAddress?.includes('Karbola') ||
          parsed.googleMapsUrl?.includes('embed') ||
          parsed.phone?.includes('9661109578')
        ) {
          return {
            ...parsed,
            fullAddress: "Laxmipur, Karbola Rd, near The Chandrasheel School, Raxaul, Bihar 845305",
            googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Nepal+MOMO+House+Laxmipur+Karbola+Rd+near+The+Chandrasheel+School+Raxaul+Bihar+845305",
            phone: "+91 9523349571",
            whatsapp: "919523349571",
            adminMobile: "9523349571",
            upiVpa: "9523349571@ybl"
          };
        }
        return parsed;
      }
      return defaultShopSettings;
    } catch (e) {
      return defaultShopSettings;
    }
  });

  // Menu Items State
  const [menuItems, setMenuItems] = useState(() => {
    try {
      const saved = localStorage.getItem('nmh_menu_items');
      return saved ? JSON.parse(saved) : defaultMenuItems;
    } catch (e) {
      return defaultMenuItems;
    }
  });

  // Offers State
  const [offers, setOffers] = useState(() => {
    try {
      const saved = localStorage.getItem('nmh_offers');
      return saved ? JSON.parse(saved) : defaultOffers;
    } catch (e) {
      return defaultOffers;
    }
  });

  // Cart State
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('nmh_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Orders State (single active order for digital slip)
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('nmh_orders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [latestOrder, setLatestOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('nmh_latest_order');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Local Device Guest Order History (Max 10 items)
  const [orderHistory, setOrderHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('guest_order_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);

  // Admin Auth state (strictly checked via session token)
  const [isAdminAuth, setIsAdminAuth] = useState(() => {
    try {
      const auth = localStorage.getItem('nmh_admin_auth');
      const token = localStorage.getItem('nmh_admin_token');
      return auth === 'true' && Boolean(token);
    } catch (e) {
      return false;
    }
  });

  // Fetch Settings & Menu from Backend API on Initial Load
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const settingsRes = await fetch(`${API_BASE_URL}/api/settings`);
        const settingsData = await settingsRes.json();
        if (settingsData.success && settingsData.settings) {
          setShopSettings((prev) => ({ ...prev, ...settingsData.settings }));
        }

        const menuRes = await fetch(`${API_BASE_URL}/api/menu`);
        const menuData = await menuRes.json();
        if (menuData.success && menuData.items && menuData.items.length > 0) {
          setMenuItems(menuData.items);
        }

        const offersRes = await fetch(`${API_BASE_URL}/api/offers`);
        const offersData = await offersRes.json();
        if (offersData.success && offersData.offers && offersData.offers.length > 0) {
          setOffers(offersData.offers);
        }
      } catch (err) {
        console.error('Notice: Could not fetch initial data from API, using cached data.', err);
      }
    };
    fetchBackendData();
  }, []);

  // Admin Modal state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  // Cart Drawer/Modal state
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Order Status Modal state
  const [isOrderStatusOpen, setIsOrderStatusOpen] = useState(false);

  const setAdminAuthSuccess = (token) => {
    setIsAdminAuth(true);
    try {
      localStorage.setItem('nmh_admin_auth', 'true');
      localStorage.setItem('nmh_admin_token', token || 'active_token');
    } catch (e) {}
  };

  const adminLogout = () => {
    setIsAdminAuth(false);
    try {
      localStorage.removeItem('nmh_admin_auth');
      localStorage.removeItem('nmh_admin_token');
    } catch (e) {}
  };

  // Sync shopSettings to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('nmh_shop_settings', JSON.stringify(shopSettings));
    } catch (e) {
      console.error(e);
    }
  }, [shopSettings]);

  // Sync menuItems to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('nmh_menu_items', JSON.stringify(menuItems));
    } catch (e) {
      console.error(e);
    }
  }, [menuItems]);

  // Sync offers to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('nmh_offers', JSON.stringify(offers));
    } catch (e) {
      console.error(e);
    }
  }, [offers]);

  // Sync cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('nmh_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Sync orders to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('nmh_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  // Actions: Shop Settings (Persist to backend API & state)
  const updateShopSettings = async (newSettings) => {
    setShopSettings((prev) => ({ ...prev, ...newSettings }));
    try {
      await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
    } catch (e) {
      console.error('Error saving settings to API:', e);
    }
  };

  const resetShopSettings = async () => {
    setShopSettings(defaultShopSettings);
    setMenuItems(defaultMenuItems);
    setOffers(defaultOffers);
    localStorage.removeItem('nmh_shop_settings');
    localStorage.removeItem('nmh_menu_items');
    localStorage.removeItem('nmh_offers');
    try {
      await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaultShopSettings)
      });
    } catch (e) {}
  };

  // Actions: Menu Items (Persist to backend API & state)
  const addMenuItem = async (newItem) => {
    const itemWithId = {
      ...newItem,
      id: `momo-${Date.now()}`,
      itemId: `momo-${Date.now()}`
    };
    setMenuItems((prev) => [itemWithId, ...prev]);

    try {
      await fetch(`${API_BASE_URL}/api/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemWithId)
      });
    } catch (e) {
      console.error('Error creating menu item on API:', e);
    }
  };

  const updateMenuItem = async (id, updatedFields) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id || item.itemId === id ? { ...item, ...updatedFields } : item))
    );

    try {
      await fetch(`${API_BASE_URL}/api/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
    } catch (e) {
      console.error('Error updating menu item on API:', e);
    }
  };

  const deleteMenuItem = async (id) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id && item.itemId !== id));

    try {
      await fetch(`${API_BASE_URL}/api/menu/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.error('Error deleting menu item on API:', e);
    }
  };

  const toggleItemAvailability = async (id) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        (item.id === id || item.itemId === id) ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );

    try {
      await fetch(`${API_BASE_URL}/api/menu/${id}/toggle`, {
        method: 'PATCH'
      });
    } catch (e) {
      console.error('Error toggling menu item on API:', e);
    }
  };

  // Actions: Offers (Persist to backend API & state)
  const addOffer = async (newOffer) => {
    const offerId = `offer-${Date.now()}`;
    const offerWithId = {
      ...newOffer,
      id: offerId,
      offerId,
      subtitle: newOffer.description || newOffer.subtitle || '',
      discount: newOffer.priceHighlight || newOffer.discount || ''
    };
    setOffers((prev) => [offerWithId, ...prev]);

    try {
      await fetch(`${API_BASE_URL}/api/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerWithId)
      });
    } catch (e) {
      console.error('Error creating offer on API:', e);
    }
  };

  const updateOffer = async (id, updatedFields) => {
    const fieldsToSave = {
      ...updatedFields,
      subtitle: updatedFields.description !== undefined ? updatedFields.description : updatedFields.subtitle,
      discount: updatedFields.priceHighlight !== undefined ? updatedFields.priceHighlight : updatedFields.discount
    };

    setOffers((prev) =>
      prev.map((off) =>
        off.id === id || off.offerId === id || off._id === id ? { ...off, ...fieldsToSave } : off
      )
    );

    try {
      await fetch(`${API_BASE_URL}/api/offers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fieldsToSave)
      });
    } catch (e) {
      console.error('Error updating offer on API:', e);
    }
  };

  const deleteOffer = async (id) => {
    setOffers((prev) => prev.filter((off) => off.id !== id && off.offerId !== id && off._id !== id));

    try {
      await fetch(`${API_BASE_URL}/api/offers/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.error('Error deleting offer on API:', e);
    }
  };

  // Actions: Cart Management
  const addToCart = (item, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.id === item.id);
      if (existing) {
        return prevCart.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + quantity } : c
        );
      }
      return [...prevCart, { ...item, quantity }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Checkout Modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Actions: Orders Management
  const placePaidOrder = (orderData) => {
    const tokenNumber = Math.floor(1000 + Math.random() * 9000);
    const token = orderData.token || `#${tokenNumber}`;
    const placedAtStr = new Date().toISOString();

    const newOrder = {
      orderId: orderData._id || orderData.id || `NMH-${Math.floor(10000 + Math.random() * 90000)}`,
      id: orderData._id || orderData.id || `NMH-${Math.floor(10000 + Math.random() * 90000)}`,
      _id: orderData._id || orderData.id,
      tokenNumber: token,
      token: token,
      timestamp: placedAtStr,
      placedAt: placedAtStr,
      items: [...cart],
      totalAmount: cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
      customerName: orderData.customerName || "Guest",
      customerPhone: orderData.customerPhone || "",
      pickupTime: orderData.pickupTime || "15-20 mins",
      notes: orderData.notes || "",
      paymentMethod: orderData.paymentMethod || "UPI",
      paymentRef: orderData.paymentRef || "N/A",
      paymentStatus: "PAID_IN_ADVANCE",
      status: "Received"
    };

    setOrders([newOrder]);
    setLatestOrder(newOrder);

    // Save to guest_order_history in localStorage (max 10 items)
    setOrderHistory((prevHistory) => {
      const filtered = [newOrder, ...prevHistory.filter((o) => (o.orderId || o.id) !== newOrder.id)].slice(0, 10);
      try {
        localStorage.setItem('guest_order_history', JSON.stringify(filtered));
        localStorage.setItem('nmh_latest_order', JSON.stringify(newOrder));
      } catch (e) {}
      return filtered;
    });

    clearCart();
    return newOrder;
  };

  const viewOrderReceipt = (order) => {
    setLatestOrder(order);
    setIsOrderHistoryOpen(false);
    setIsOrderStatusOpen(true);
  };

  const hasRecentActiveOrder = orderHistory.some((o) => {
    const placedTime = new Date(o.placedAt || o.timestamp || 0).getTime();
    return Date.now() - placedTime < 2 * 60 * 60 * 1000;
  });

  const clearActiveOrder = () => {
    setLatestOrder(null);
    setOrders([]);
    clearCart();
    try {
      localStorage.removeItem('nmh_latest_order');
      localStorage.removeItem('nmh_orders');
    } catch (e) {}
    setIsOrderStatusOpen(false);
  };

  const placeOrder = (customerDetails) => {
    return placePaidOrder(customerDetails);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId || o._id === orderId || o.token === orderId || o.token === `#${orderId}`
          ? { ...o, status: newStatus }
          : o
      )
    );
    setLatestOrder((prev) =>
      prev && (prev.id === orderId || prev._id === orderId || prev.token === orderId || prev.token === `#${orderId}`)
        ? { ...prev, status: newStatus }
        : prev
    );
    try {
      await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.error('Error updating order status on API:', e);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ShopContext.Provider
      value={{
        shopSettings,
        updateShopSettings,
        resetShopSettings,
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        offers,
        setOffers,
        addOffer,
        updateOffer,
        deleteOffer,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        itemCount,
        orders,
        latestOrder,
        orderHistory,
        setOrderHistory,
        isOrderHistoryOpen,
        setIsOrderHistoryOpen,
        hasRecentActiveOrder,
        viewOrderReceipt,
        clearActiveOrder,
        placeOrder,
        placePaidOrder,
        updateOrderStatus,
        isAdminOpen,
        setIsAdminOpen,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isOrderStatusOpen,
        setIsOrderStatusOpen,
        isAdminAuth,
        setAdminAuthSuccess,
        adminLogout
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
