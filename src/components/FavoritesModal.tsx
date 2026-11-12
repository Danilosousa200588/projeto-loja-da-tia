import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types/store';

interface FavoritesModalProps {
  onOpenQuickView: (product: Product) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({ onOpenQuickView }) => {
  const { favorites, isOpen, closeFavorites, removeFavorite } = useFavorites();
  const { addItem } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[var(--color-surface,#FFFFFF)] rounded-[var(--radius-card,0.75rem)] shadow-2xl border border-[var(--color-border,#EFE7E1)] overflow-hidden my-auto max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--color-border,#EFE7E1)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-current" />
            <h3 className="font-boutique text-xl font-bold text-[var(--color-text)]">
              Meus Favoritos
            </h3>
            <span className="text-xs bg-[var(--color-bg,#FAF8F5)] border border-[var(--color-border,#EFE7E1)] px-2 py-0.5 rounded-full font-mono">
              {favorites.length}
            </span>
          </div>

          <button
            onClick={closeFavorites}
            className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {favorites.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-400 mx-auto flex items-center justify-center">
                <Heart className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                Você ainda não salvou nenhuma peça favorita
              </p>
              <p className="text-xs text-[var(--color-text-muted)] max-w-xs mx-auto">
                Clique no coração nos cards das roupas para guardar seus looks preferidos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favorites.map((product) => {
                const currentPrice = product.promoPrice || product.price;

                return (
                  <div
                    key={product.id}
                    className="flex gap-3 p-3 rounded-lg border border-[var(--color-border,#EFE7E1)] bg-[var(--color-bg,#FAF8F5)] relative group"
                  >
                    <img
                      src={product.images[0] || '/assets/aistudio/image_eb20ad27.png'}
                      alt={product.name}
                      className="w-16 h-20 object-cover rounded-md bg-white cursor-pointer"
                      onClick={() => {
                        closeFavorites();
                        onOpenQuickView(product);
                      }}
                    />

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4
                            onClick={() => {
                              closeFavorites();
                              onOpenQuickView(product);
                            }}
                            className="text-xs font-semibold text-[var(--color-text)] truncate hover:text-[var(--color-primary)] cursor-pointer"
                          >
                            {product.name}
                          </h4>
                          <button
                            onClick={() => removeFavorite(product.id)}
                            className="text-stone-400 hover:text-rose-600 transition-colors"
                            title="Remover dos favoritos"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider block mt-0.5">
                          {product.category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-bold text-[var(--color-text)] tabular-nums">
                          {currentPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>

                        <button
                          onClick={() => {
                            addItem(product, product.sizes[0] || 'M', product.colors[0] || 'Padrão', 1);
                            closeFavorites();
                          }}
                          className="px-2.5 py-1 bg-[var(--color-primary,#B76E79)] text-white text-[11px] font-semibold rounded hover:opacity-90 flex items-center gap-1"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Sacola</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
