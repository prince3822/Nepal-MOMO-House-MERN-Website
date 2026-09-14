import React from 'react';
import { useShop } from '../context/ShopContext';
import { AdminLogin } from './AdminLogin';

export const AdminProtectedRoute = ({ children, onBackToSite }) => {
  const { isAdminAuth } = useShop();

  const storedToken =
    typeof window !== 'undefined'
      ? localStorage.getItem('admin_token') || localStorage.getItem('nmh_admin_token')
      : null;

  const isAuthenticated = isAdminAuth || Boolean(storedToken);

  if (!isAuthenticated) {
    return <AdminLogin onBackToSite={onBackToSite} />;
  }

  return children;
};
