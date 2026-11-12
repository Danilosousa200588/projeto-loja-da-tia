import React, { useState } from 'react';
import { ShoppingBag, Heart, Search, Menu, X, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Category } from '../types/store';

interface HeaderProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenQuickView?: (productId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => {
  const { totalItems, subtotal, openCart } = useCart();
  const { favoritesCount, openFavorites } = useFavorites();
  const { openAdmin } = useAuth();
  const { settings } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const activeCategories = categories.filter((c) => c.isActive);

  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelectCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setLogoClicks((prev) => {
      const next = prev + 1;
      if (next >= 4) {
        openAdmin();
        return 0;
      }
      return next;
    });
    setTimeout(() => setLogoClicks(0), 3000);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--color-surface,#FFFFFF)] border-b border-[var(--color-border,#EFE7E1)] transition-colors duration-300">
      {/* Top Announcement Bar */}
      {settings?.announcementActive !== false && settings?.announcementBar && (
        <div className="w-full bg-[var(--color-primary,#B76E79)] text-[var(--color-btn-text,#FFFFFF)] text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-3">
          <span className="truncate max-w-4xl">{settings.announcementBar}</span>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors focus:outline-none"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo & Title */}
          <div className="flex items-center">
            <a
              href="/"
              onClick={handleLogoClick}
              className="flex items-center gap-3 group"
            >
              <img
                src={settings?.logoUrl || '/assets/aistudio/image_eb20ad27.png'}
                alt={settings?.storeName || 'Bem Garota'}
                className="h-10 sm:h-12 w-auto max-w-[5rem] sm:max-w-none object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  // Fallback if image fails
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/aistudio/image_eb20ad27.png';
                }}
              />
              <div className="hidden sm:block text-left">
                <span className="block font-boutique text-2xl font-semibold tracking-tight text-[var(--color-text)] leading-none">
                  {settings?.storeName || 'Bem Garota'}
                </span>
                <span className="block text-[10px] tracking-widest uppercase text-[var(--color-accent,#D4AF37)] font-medium mt-1">
                  {settings?.tagline || 'Moda Feminina'}
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Category Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <button
              onClick={() => onSelectCategory(null)}
              className={`text-sm font-medium tracking-wide transition-all whitespace-nowrap py-1 border-b-2 ${
                selectedCategory === null
                  ? 'text-[var(--color-primary)] border-[var(--color-primary)] font-semibold'
                  : 'text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
              }`}
            >
              Todos os Produtos
            </button>
            {activeCategories.slice(0, 7).map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug || cat.id)}
                className={`text-sm font-medium tracking-wide transition-all whitespace-nowrap py-1 border-b-2 ${
                  selectedCategory === cat.slug || selectedCategory === cat.id
                    ? 'text-[var(--color-primary)] border-[var(--color-primary)] font-semibold'
                    : 'text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </nav>

          {/* Action Icons Zone */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Input / Toggle */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center bg-[var(--color-bg,#FAF8F5)] rounded-full border border-[var(--color-border,#EFE7E1)] px-3 py-1.5 shadow-sm">
                  <Search className="w-4 h-4 text-[var(--color-text-muted)] mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Buscar vestido, blusa..."
                    className="bg-transparent border-none text-xs text-[var(--color-text)] focus:outline-none w-[min(34vw,9rem)] sm:w-48"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      onSearchChange('');
                      setSearchOpen(false);
                    }}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors rounded-full hover:bg-[var(--color-secondary)]/30"
                  aria-label="Buscar produtos"
                  title="Buscar"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* WhatsApp Quick Chat */}
            {settings?.whatsappNumber && (
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                  'Olá! Gostaria de tirar uma dúvida sobre a loja Bem Garota.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition-colors border border-emerald-200"
                title="Atendimento no WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Atendimento VIP</span>
              </a>
            )}

            {/* Favorites Icon */}
            <button
              onClick={openFavorites}
              className="relative p-2 text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors rounded-full hover:bg-[var(--color-secondary)]/30"
              aria-label="Meus Favoritos"
              title="Favoritos"
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[var(--color-primary,#B76E79)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Shopping Bag / Cart */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 p-2 sm:px-3 text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors rounded-full hover:bg-[var(--color-secondary)]/30"
              aria-label="Minha Sacola"
              title="Sacola de Compras"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--color-accent,#D4AF37)] text-stone-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden md:inline-block text-xs font-semibold tabular-nums">
                {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[var(--color-surface,#FFFFFF)] border-t border-[var(--color-border,#EFE7E1)] px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar roupas, acessórios..."
              className="w-full bg-[var(--color-bg,#FAF8F5)] border border-[var(--color-border,#EFE7E1)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onSelectCategory(null);
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-md text-sm font-medium ${
                selectedCategory === null
                  ? 'bg-[var(--color-primary)] text-white font-semibold'
                  : 'text-[var(--color-text)] hover:bg-[var(--color-secondary)]/40'
              }`}
            >
              ✨ Todos os Produtos
            </button>
            {activeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.slug || cat.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-md text-sm font-medium truncate ${
                  selectedCategory === cat.slug || selectedCategory === cat.id
                    ? 'bg-[var(--color-primary)] text-white font-semibold'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-secondary)]/40'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {settings?.whatsappNumber && (
            <div className="pt-3 border-t border-[var(--color-border,#EFE7E1)] flex items-center justify-center">
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-2.5 rounded-lg border border-emerald-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Atendimento VIP no WhatsApp</span>
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
