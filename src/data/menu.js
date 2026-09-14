import { defaultMenuItems, defaultCategories } from './defaultData';

export const categories = defaultCategories;
export const menuItems = defaultMenuItems;

export const getItemById = (id) => menuItems.find((item) => item.id === id);

export const getItemsByCategory = (category) => {
  if (category === 'all') return menuItems;
  return menuItems.filter((item) => item.category === category);
};
