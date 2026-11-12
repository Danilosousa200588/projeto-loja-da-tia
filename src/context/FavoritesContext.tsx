import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/store';

interface FavoritesContextType {
  favorites: Product[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: Product) => void;
  removeFavorite: (productId: string) => void;
  favoritesCount: number;
  isOpen: boolean;
  openFavorites: () => void;
  closeFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = 'bemgarota_favorites';

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  }, [favorites]);

  const isFavorite = (productId: string) => {
    return favorites.some((p) => p.id === productId);
  };

  const toggleFavorite = (product: Product) => {
    setFavorites((prev) => {
      if (prev.some((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const removeFavorite = (productId: string) => {
    setFavorites((prev) => prev.filter((p) => p.id !== productId));
  };

  const openFavorites = () => setIsOpen(true);
  const closeFavorites = () => setIsOpen(false);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        favoritesCount: favorites.length,
        isOpen,
        openFavorites,
        closeFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
