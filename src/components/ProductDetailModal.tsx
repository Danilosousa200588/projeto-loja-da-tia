import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  ShoppingBag,
  MessageCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Check,
  ChevronRight,
  ZoomIn,
} from 'lucide-react';
import { Product } from '../types/store';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  relatedProducts?: Product[];
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onSelectProduct,
  relatedProducts = [],
}) => {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { settings } = useTheme();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'measures' | 'care' | 'reviews'>('desc');
  const [isZoomed, setIsZoomed] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(false);
  const [reviewsList, setReviewsList] = useState<Array<{ id: string; authorName: string; rating: number; comment: string; createdAt: string; isDemo?: boolean }>>([]);

  // Increment product view counter on open
  useEffect(() => {
    if (product) {
      fetch(`/api/products/${product.id}/view`, { method: 'POST' }).catch(() => {});
      // Fetch product reviews
      fetch(`/api/reviews?productId=${product.id}&public=true`)
        .then((res) => res.json())
        .then((data) => setReviewsList(data))
        .catch(() => {});
    }
  }, [product]);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || 'A definir');
      setSelectedColor(product.colors[0] || 'Padrão');
      setQuantity(1);
      setSelectedImageIndex(0);
      setIsZoomed(false);
    }
  }, [product]);

  if (!product) return null;

  const isFavorited = isFavorite(product.id);
  const hasDiscount = product.promoPrice && product.promoPrice < product.price;
  const currentPrice = product.promoPrice || product.price;

  // Calculate stock for selected variant
  const selectedVariant = product.variants?.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );
  const availableStock = product.stockTracked === false ? Number.POSITIVE_INFINITY : (selectedVariant ? selectedVariant.stock : product.stock);
  const isOutOfStock = product.stockTracked !== false && availableStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, selectedSize, selectedColor, quantity);
  };

  const handleDirectWhatsApp = () => {
    const rawPhone = (settings?.whatsappNumber || '').replace(/\D/g, '');
    if (rawPhone.length < 12 || rawPhone.length > 13) {
      window.alert('O WhatsApp da loja ainda não foi configurado. Entre em contato por outro canal disponível.');
      return;
    }
    const priceFormatted = currentPrice.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    const totalFormatted = (currentPrice * quantity).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    const productUrl = `${window.location.origin}/produto/${product.slug}`;

    const text =
      `🌸 *PEDIDO RÁPIDO - ${settings?.storeName?.toUpperCase() || 'BEM GAROTA'}* 🌸\n` +
      `Olá! Tenho interesse em comprar a seguinte peça:\n\n` +
      `👗 *Produto:* ${product.name}\n` +
      `📏 *Tamanho:* ${selectedSize}\n` +
      `🎨 *Cor:* ${selectedColor}\n` +
      `🔢 *Quantidade:* ${quantity}\n` +
      `💵 *Preço:* ${quantity}x ${priceFormatted} = *${totalFormatted}*\n` +
      `🔗 *Link:* ${productUrl}\n\n` +
      `Poderia confirmar a disponibilidade e passar a chave PIX ou link de cartão? Muito obrigada!`;

    window.open(`https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor || !newReviewComment) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          authorName: newReviewAuthor,
          rating: newReviewRating,
          comment: newReviewComment,
        }),
      });

      if (res.ok) {
        setNewReviewAuthor('');
        setNewReviewComment('');
        setReviewSuccessMsg(true);
        setTimeout(() => setReviewSuccessMsg(false), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentImage = product.images[selectedImageIndex] || product.images[0] || '/assets/aistudio/image_eb20ad27.png';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-start sm:items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[var(--color-surface,#FFFFFF)] rounded-[var(--radius-card,0.75rem)] shadow-2xl border border-[var(--color-border,#EFE7E1)] overflow-hidden my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-black flex items-center justify-center shadow-md transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[calc(100dvh-1rem)] sm:max-h-[88dvh] overflow-y-auto">
          {/* Gallery Section */}
          <div className="p-4 sm:p-6 bg-[var(--color-bg,#FAF8F5)] flex flex-col justify-between">
            {/* Main Image with Zoom Trigger */}
            <div
              className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-white border border-[var(--color-border,#EFE7E1)] cursor-zoom-in"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <img
                src={currentImage}
                alt={product.name}
                className={`w-full h-full object-cover object-top transition-transform duration-500 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
              />

              <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-xs text-stone-700 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs pointer-events-none">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>{isZoomed ? 'Clique para normal' : 'Clique para zoom'}</span>
              </div>

              {hasDiscount && (
                <div className="absolute top-3 left-3 bg-[var(--color-primary,#B76E79)] text-white text-xs font-bold px-2.5 py-1 rounded-xs uppercase">
                  Oferta Especial
                </div>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImageIndex(idx);
                      setIsZoomed(false);
                    }}
                    className={`relative w-16 h-20 shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-[var(--color-primary,#B76E79)] ring-2 ring-[var(--color-primary,#B76E79)]/30'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Purchase Module */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                <span className="uppercase tracking-widest font-semibold text-[var(--color-primary,#B76E79)]">
                  {product.category}
                </span>
                <span className="font-mono">REF: {product.sku}</span>
              </div>

              {/* Title & Favorite */}
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-boutique text-2xl sm:text-3xl font-semibold text-[var(--color-text)] leading-tight">
                  {product.name}
                </h2>
                <button
                  onClick={() => toggleFavorite(product)}
                  className={`p-2.5 rounded-full transition-colors ${
                    isFavorited ? 'text-rose-600 bg-rose-50' : 'text-stone-400 hover:text-rose-600 bg-stone-100'
                  }`}
                  aria-label="Favoritar"
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Price & Installments */}
              <div className="py-2 border-y border-[var(--color-border,#EFE7E1)]">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-[var(--color-text)] tabular-nums">
                    {currentPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-[var(--color-text-muted)] line-through tabular-nums">
                      {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Consulte as formas de pagamento disponíveis diretamente com a loja.
                </p>
              </div>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--color-text)]">
                      Cor:{' '}
                      <span className="font-normal text-[var(--color-text-muted)]">{selectedColor}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                          selectedColor === color
                            ? 'border-[var(--color-primary,#B76E79)] bg-[var(--color-primary,#B76E79)] text-white font-medium shadow-xs'
                            : 'border-[var(--color-border,#EFE7E1)] bg-white text-[var(--color-text)] hover:border-stone-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--color-text)]">
                      Tamanho:{' '}
                      <span className="font-normal text-[var(--color-text-muted)]">{selectedSize}</span>
                    </span>
                    <button
                      onClick={() => setActiveTab('measures')}
                      className="text-[var(--color-primary,#B76E79)] hover:underline font-medium"
                    >
                      Tabela de Medidas
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-10 h-10 px-3 flex items-center justify-center rounded-md border font-mono text-xs transition-all ${
                          selectedSize === size
                            ? 'border-[var(--color-primary,#B76E79)] bg-[var(--color-primary,#B76E79)] text-white font-bold shadow-xs'
                            : 'border-[var(--color-border,#EFE7E1)] bg-white text-[var(--color-text)] hover:border-stone-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Availability */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center border border-[var(--color-border,#EFE7E1)] rounded-md bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-stone-600 hover:text-black font-semibold text-sm"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-semibold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(availableStock || 99, q + 1))}
                    disabled={quantity >= availableStock}
                    className="w-9 h-9 flex items-center justify-center text-stone-600 hover:text-black font-semibold text-sm disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                <div className="text-xs">
                  {product.stockTracked === false ? (
                    <span className="text-stone-500 font-medium">Disponibilidade a confirmar com a loja</span>
                  ) : availableStock > 0 ? (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      {availableStock <= 5 ? `Apenas ${availableStock} un. em estoque!` : 'Disponível em estoque'}
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">Produto esgotado</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="w-full py-3.5 px-6 rounded-[var(--radius-btn,0.5rem)] bg-[var(--color-btn-bg,#B76E79)] text-[var(--color-btn-text,#FFFFFF)] font-semibold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Esgotado nesta variação' : 'Adicionar à Sacola de Compras'}</span>
                </button>

                <button
                  onClick={handleDirectWhatsApp}
                  className="w-full py-3 px-6 rounded-[var(--radius-btn,0.5rem)] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Comprar Agora pelo WhatsApp</span>
                </button>
              </div>

              {/* Trust markers */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[var(--color-border,#EFE7E1)] text-[11px] text-[var(--color-text-muted)]">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>Frete a combinar</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Atendimento direto</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-[var(--color-accent,#D4AF37)]" />
                  <span>Política a consultar</span>
                </div>
              </div>
            </div>

            {/* Information Tabs */}
            <div className="pt-4 border-t border-[var(--color-border,#EFE7E1)]">
              <div className="flex border-b border-[var(--color-border,#EFE7E1)] gap-4 text-xs">
                <button
                  onClick={() => setActiveTab('desc')}
                  className={`pb-2 border-b-2 font-medium transition-colors ${
                    activeTab === 'desc'
                      ? 'border-[var(--color-primary,#B76E79)] text-[var(--color-primary,#B76E79)]'
                      : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  Descrição Detalhada
                </button>
                <button
                  onClick={() => setActiveTab('measures')}
                  className={`pb-2 border-b-2 font-medium transition-colors ${
                    activeTab === 'measures'
                      ? 'border-[var(--color-primary,#B76E79)] text-[var(--color-primary,#B76E79)]'
                      : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  Guia de Medidas
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2 border-b-2 font-medium transition-colors ${
                    activeTab === 'reviews'
                      ? 'border-[var(--color-primary,#B76E79)] text-[var(--color-primary,#B76E79)]'
                      : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  Avaliações ({reviewsList.length})
                </button>
              </div>

              <div className="pt-3 text-xs text-[var(--color-text-muted)] leading-relaxed min-h-24">
                {activeTab === 'desc' && <p>{product.description}</p>}

                {activeTab === 'measures' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-stone-200 text-stone-700">
                          <th className="py-1">Tamanho</th>
                          <th className="py-1">Busto (cm)</th>
                          <th className="py-1">Cintura (cm)</th>
                          <th className="py-1">Quadril (cm)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        <tr><td className="py-1 font-semibold">PP (34-36)</td><td>82 - 86</td><td>64 - 68</td><td>90 - 94</td></tr>
                        <tr><td className="py-1 font-semibold">P (38)</td><td>86 - 90</td><td>68 - 72</td><td>94 - 98</td></tr>
                        <tr><td className="py-1 font-semibold">M (40)</td><td>90 - 96</td><td>72 - 78</td><td>98 - 104</td></tr>
                        <tr><td className="py-1 font-semibold">G (42)</td><td>96 - 102</td><td>78 - 84</td><td>104 - 110</td></tr>
                        <tr><td className="py-1 font-semibold">GG (44)</td><td>102 - 108</td><td>84 - 90</td><td>110 - 116</td></tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {reviewsList.length > 0 ? (
                      <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
                        {reviewsList.map((rev) => (
                          <div key={rev.id} className="p-2.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)]">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-[var(--color-text)]">{rev.authorName}</span>
                              <div className="flex text-amber-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-stone-300'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-stone-600">{rev.comment}</p>
                            {rev.isDemo && (
                              <span className="text-[10px] text-stone-400 block mt-1">Exemplo de demonstração</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="italic">Nenhuma avaliação ainda. Seja a primeira a avaliar!</p>
                    )}

                    {/* New review form */}
                    <form onSubmit={handleReviewSubmit} className="pt-2 border-t border-[var(--color-border)] space-y-2">
                      <span className="font-semibold text-[var(--color-text)] block">Deixe sua avaliação:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Seu nome"
                          value={newReviewAuthor}
                          onChange={(e) => setNewReviewAuthor(e.target.value)}
                          className="flex-1 p-1.5 border border-stone-300 rounded text-xs bg-white"
                          required
                        />
                        <select
                          value={newReviewRating}
                          onChange={(e) => setNewReviewRating(Number(e.target.value))}
                          className="p-1.5 border border-stone-300 rounded text-xs bg-white"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5 estrelas)</option>
                          <option value={4}>⭐⭐⭐⭐ (4 estrelas)</option>
                          <option value={3}>⭐⭐⭐ (3 estrelas)</option>
                          <option value={2}>⭐⭐ (2 estrelas)</option>
                          <option value={1}>⭐ (1 estrela)</option>
                        </select>
                      </div>
                      <textarea
                        placeholder="O que você achou da peça, caimento e atendimento?"
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        rows={2}
                        className="w-full p-1.5 border border-stone-300 rounded text-xs bg-white"
                        required
                      />
                      <button
                        type="submit"
                        className="px-3 py-1 bg-[var(--color-primary,#B76E79)] text-white rounded text-xs font-semibold hover:opacity-90"
                      >
                        Publicar Avaliação
                      </button>
                      {reviewSuccessMsg && (
                        <span className="text-emerald-700 font-medium ml-2">Avaliação enviada com sucesso!</span>
                      )}
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Related Products Snippet */}
            {relatedProducts.length > 0 && (
              <div className="pt-4 border-t border-[var(--color-border,#EFE7E1)]">
                <span className="text-xs uppercase tracking-wider font-bold text-[var(--color-text)] block mb-3">
                  Combine Com:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {relatedProducts.slice(0, 3).map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onSelectProduct(rel)}
                      className="cursor-pointer group flex items-center gap-2 p-1.5 rounded-lg border border-[var(--color-border,#EFE7E1)] hover:bg-[var(--color-bg)] transition-colors"
                    >
                      <img
                        src={rel.images[0] || '/assets/aistudio/image_eb20ad27.png'}
                        alt={rel.name}
                        className="w-10 h-12 object-cover rounded shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-[var(--color-text)] truncate group-hover:text-[var(--color-primary)]">
                          {rel.name}
                        </p>
                        <p className="text-[10px] font-bold text-stone-900 tabular-nums">
                          {(rel.promoPrice || rel.price).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
