import React from 'react';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { Product } from '../types/store';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

interface ProductCardProps {
  product: Product;
  onOpenQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenQuickView }) => {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const isFavorited = isFavorite(product.id);
  const mainImage = product.images[0] || '/assets/aistudio/image_eb20ad27.png';
  const secondaryImage = product.images[1] || mainImage;

  const hasDiscount = product.promoPrice && product.promoPrice < product.price;
  const currentPrice = product.promoPrice || product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.promoPrice || 0)) / product.price) * 100)
    : 0;

  const isOutOfStock = product.stockTracked !== false && product.stock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const defaultSize = product.sizes[0] || 'A definir';
    const defaultColor = product.colors[0] || 'Padrão';
    addItem(product, defaultSize, defaultColor, 1);
  };

  return (
    <div
      onClick={() => onOpenQuickView(product)}
      className="group cursor-pointer flex flex-col bg-[var(--color-surface,#FFFFFF)] rounded-[var(--radius-card,0.75rem)] border border-[var(--color-border,#EFE7E1)] overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--color-bg,#FAF8F5)]">
        {/* Main Image */}
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/assets/aistudio/image_eb20ad27.png';
          }}
        />

        {/* Secondary Image Reveal on Hover (if available) */}
        {product.images.length > 1 && (
          <img
            src={secondaryImage}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover object-top opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            loading="lazy"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="bg-[var(--color-primary,#B76E79)] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-xs">
              -{discountPercent}% OFF
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-stone-900 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-xs">
              Novidade
            </span>
          )}
          {product.isBestSeller && !product.isNewArrival && (
            <span className="bg-[var(--color-accent,#D4AF37)] text-stone-900 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-xs">
              Mais Vendido
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-red-700 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-xs">
              Esgotado
            </span>
          )}
        </div>

        {/* Top Right Action: Favorite Heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product);
          }}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-xs ${
            isFavorited
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-white/80 hover:bg-white text-stone-600 hover:text-rose-600 shadow-xs'
          }`}
          aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Quick Action Toolbar */}
        <div className="absolute inset-x-3 bottom-3 z-10 flex gap-2 opacity-100 translate-y-0 md:opacity-0 md:translate-y-2 transition-all duration-300 md:group-hover:opacity-100 md:group-hover:translate-y-0">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className="flex-1 bg-[var(--color-surface,#FFFFFF)] hover:bg-[var(--color-primary,#B76E79)] hover:text-white text-[var(--color-text)] text-xs font-semibold py-2.5 px-3 rounded-[var(--radius-btn,0.5rem)] shadow-md flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Esgotado' : 'Adicionar'}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenQuickView(product);
            }}
            className="w-9 h-9 bg-[var(--color-surface,#FFFFFF)] hover:bg-stone-100 text-[var(--color-text)] rounded-[var(--radius-btn,0.5rem)] shadow-md flex items-center justify-center transition-colors"
            title="Espiar Detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Category kicker */}
          <span className="text-[11px] font-medium tracking-wider uppercase text-[var(--color-text-muted)] block">
            {product.category}
          </span>

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1 mt-0.5">
            {product.name}
          </h3>
        </div>

        {/* Available Sizes preview */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
            <span>Tamanhos:</span>
            <div className="flex items-center gap-1">
              {product.sizes.map((s) => (
                <span
                  key={s}
                  className="px-1.5 py-0.5 rounded-xs bg-[var(--color-bg,#FAF8F5)] border border-[var(--color-border,#EFE7E1)] font-mono"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Info */}
        <div className="pt-1 border-t border-[var(--color-border,#EFE7E1)] flex items-baseline justify-between">
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-[var(--color-text)] tabular-nums">
                {currentPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              {hasDiscount && (
                <span className="text-xs text-[var(--color-text-muted)] line-through tabular-nums">
                  {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)] block">
              Valor da peça
            </span>
          </div>

          {/* Color count indicator */}
          {product.colors && product.colors.length > 1 && (
            <span className="text-[10px] text-[var(--color-text-muted)]">
              +{product.colors.length} cores
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
