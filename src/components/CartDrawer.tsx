import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isOpen,
    closeCart,
    clearCart,
    removeItem,
    updateQuantity,
    subtotal,
    freeShippingProgress,
    checkoutViaWhatsApp,
  } = useCart();
  const { settings } = useTheme();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setCheckoutError('Por favor, informe seu nome para atendimento');
      return;
    }

    setIsSubmitting(true);
    setCheckoutError(null);

    const result = await checkoutViaWhatsApp({
      name: customerName.trim(),
      phone: customerPhone.trim(),
      city: customerCity.trim(),
      notes: customerNotes.trim(),
    });

    setIsSubmitting(false);

    if (result.success && result.whatsappUrl) {
      const whatsappWindow = window.open(result.whatsappUrl, '_blank');
      if (whatsappWindow) {
        whatsappWindow.opener = null;
        clearCart();
        closeCart();
        setShowCheckoutForm(false);
        setCustomerName('');
        setCustomerPhone('');
        setCustomerCity('');
        setCustomerNotes('');
      } else {
        setCheckoutError('O navegador bloqueou a abertura do WhatsApp. Permita pop-ups para concluir o envio; sua sacola continua salva.');
      }
    } else {
      setCheckoutError(result.error || 'Erro ao processar pedido');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--color-surface,#FFFFFF)] h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--color-border,#EFE7E1)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[var(--color-primary,#B76E79)]" />
            <h3 className="font-boutique text-xl font-bold text-[var(--color-text)]">
              Sua Sacola de Compras
            </h3>
            <span className="text-xs bg-[var(--color-bg,#FAF8F5)] border border-[var(--color-border,#EFE7E1)] px-2 py-0.5 rounded-full font-mono font-medium">
              {items.length} {items.length === 1 ? 'item' : 'itens'}
            </span>
          </div>

          <button
            onClick={closeCart}
            className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            aria-label="Fechar Sacola"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        {freeShippingProgress.threshold > 0 && <div className="bg-[var(--color-bg,#FAF8F5)] px-4 py-3 border-b border-[var(--color-border,#EFE7E1)]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 font-medium text-[var(--color-text)]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent,#D4AF37)]" />
              {freeShippingProgress.achieved
                ? 'Parabéns! Você ganhou Frete Grátis!'
                : `Falta ${freeShippingProgress.remaining.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })} para Frete Grátis`}
            </span>
            <span className="text-[11px] font-bold text-[var(--color-primary,#B76E79)]">
              {freeShippingProgress.percentage}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--color-primary,#B76E79)] to-[var(--color-accent,#D4AF37)] transition-all duration-500 rounded-full"
              style={{ width: `${freeShippingProgress.percentage}%` }}
            />
          </div>
        </div>}

        {/* Content Zone */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-stone-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-boutique text-lg font-bold text-[var(--color-text)]">
                  Sua sacola está vazia
                </h4>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-xs">
                  Adicione vestidos, blusas ou conjuntos para finalizar seu atendimento no WhatsApp.
                </p>
              </div>
              <button
                onClick={closeCart}
                className="px-5 py-2.5 rounded-[var(--radius-btn,0.5rem)] bg-[var(--color-primary,#B76E79)] text-white text-xs font-semibold hover:opacity-90 transition-all"
              >
                Continuar Comprando
              </button>
            </div>
          ) : showCheckoutForm ? (
            /* Checkout Customer Information Form */
            <form onSubmit={handleFinalize} className="space-y-4 py-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
                  Dados para o WhatsApp
                </span>
                <button
                  type="button"
                  onClick={() => setShowCheckoutForm(false)}
                  className="text-xs text-[var(--color-primary)] hover:underline"
                >
                  Voltar à lista
                </button>
              </div>

              {checkoutError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
                  {checkoutError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--color-text)]">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: Amanda Silveira"
                  className="w-full p-2.5 border border-stone-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--color-text)]">
                  Seu WhatsApp / Telefone
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full p-2.5 border border-stone-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--color-text)]">
                  Cidade / Estado de Entrega
                </label>
                <input
                  type="text"
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  placeholder="Ex: São Paulo - SP"
                  className="w-full p-2.5 border border-stone-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--color-text)]">
                  Observações ou Dúvidas
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Ex: Gostaria de confirmar se tem entrega rápida para amanhã."
                  className="w-full p-2.5 border border-stone-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div className="p-3 bg-[var(--color-bg)] rounded-md border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Como funciona a finalização?</span>
                </div>
                <p>
                  Ao continuar, sua lista de produtos e tamanhos será formatada e aberta no WhatsApp da loja. As formas de pagamento, o frete e o prazo serão combinados diretamente com a equipe.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-[var(--radius-btn,0.5rem)] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <MessageCircle className="w-5 h-5" />
                <span>
                  {isSubmitting ? 'Gerando mensagem...' : 'Enviar Pedido para o WhatsApp'}
                </span>
              </button>
            </form>
          ) : (
            /* Items list */
            <div className="space-y-3">
              {items.map((item) => {
                const itemPrice = item.product.promoPrice || item.product.price;
                const total = itemPrice * item.quantity;

                return (
                  <div
                    key={`${item.product.id}-${item.size}-${item.color}`}
                    className="flex gap-3 p-3 rounded-lg border border-[var(--color-border,#EFE7E1)] bg-white relative group"
                  >
                    <img
                      src={item.product.images[0] || '/assets/aistudio/image_eb20ad27.png'}
                      alt={item.product.name}
                      className="w-16 h-20 object-cover rounded-md bg-stone-100 shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-[var(--color-text)] truncate">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeItem(item.product.id, item.size, item.color)}
                            className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                            title="Remover item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)] mt-0.5">
                          <span>Tam: <strong>{item.size}</strong></span>
                          <span>·</span>
                          <span>Cor: <strong>{item.color}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-stone-200 rounded">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.color, -1)}
                            className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-black"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.color, 1)}
                            className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-black"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-[var(--color-text)] tabular-nums">
                          {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Subtotal & Action */}
        {items.length > 0 && !showCheckoutForm && (
          <div className="p-4 sm:p-5 border-t border-[var(--color-border,#EFE7E1)] bg-[var(--color-surface,#FFFFFF)] space-y-3">
            <div className="space-y-1.5 text-xs text-[var(--color-text-muted)]">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} itens):</span>
                <span className="font-semibold text-[var(--color-text)] tabular-nums">
                  {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Frete:</span>
                <span className="font-semibold text-emerald-700">
                  {freeShippingProgress.achieved ? 'Grátis' : 'A combinar via WhatsApp'}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[var(--color-text)] pt-2 border-t border-[var(--color-border,#EFE7E1)]">
                <span>Total Estimado:</span>
                <span className="tabular-nums text-lg text-[var(--color-primary,#B76E79)]">
                  {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowCheckoutForm(true)}
              className="w-full py-3.5 px-4 rounded-[var(--radius-btn,0.5rem)] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Avançar e Finalizar no WhatsApp</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={closeCart}
              className="w-full text-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] py-1 font-medium transition-colors"
            >
              Continuar navegando na boutique
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
