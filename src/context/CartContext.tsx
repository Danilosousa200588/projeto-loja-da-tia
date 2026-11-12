import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, OrderItem } from '../types/store';
import { useTheme } from './ThemeContext';

interface CustomerCheckoutData {
  name: string;
  phone: string;
  city?: string;
  notes?: string;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, size: string, color: string, quantity?: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, delta: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  freeShippingProgress: {
    threshold: number;
    remaining: number;
    achieved: boolean;
    percentage: number;
  };
  checkoutViaWhatsApp: (customerData: CustomerCheckoutData) => Promise<{ success: boolean; whatsappUrl?: string; error?: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'bemgarota_cart_items';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useTheme();

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (product: Product, size: string, color: string, quantity = 1) => {
    // Never add unavailable products or quantities beyond the selected variant stock.
    const safeQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
    if (product.status !== 'ativo') return;
    const selectedVariant = product.variants?.find((variant) => variant.size === size && variant.color === color);
    const availableStock = product.stockTracked === false ? Number.POSITIVE_INFINITY : (product.variants?.length ? (selectedVariant?.stock ?? 0) : product.stock);
    if (availableStock <= 0) return;

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.size === size && item.color === color
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: Math.min(availableStock, next[existingIndex].quantity + safeQuantity),
        };
        return next;
      }

      return [...prev, { product, size, color, quantity: Math.min(availableStock, safeQuantity) }];
    });
    setIsOpen(true);
  };

  const removeItem = (productId: string, size: string, color: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.size === size && item.color === color)
      )
    );
  };

  const updateQuantity = (productId: string, size: string, color: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.size === size && item.color === color) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((acc, item) => {
    const price = item.product.promoPrice || item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const threshold = Math.max(0, Number(settings?.freeShippingThreshold ?? 0) || 0);
  const achieved = threshold > 0 && subtotal >= threshold;
  const remaining = threshold > 0 ? Math.max(0, threshold - subtotal) : 0;
  const percentage = threshold > 0 ? Math.min(100, Math.round((subtotal / threshold) * 100)) : 0;

  const freeShippingProgress = {
    threshold,
    remaining,
    achieved,
    percentage,
  };

  const checkoutViaWhatsApp = async (
    customerData: CustomerCheckoutData
  ): Promise<{ success: boolean; whatsappUrl?: string; error?: string }> => {
    if (items.length === 0) {
      return { success: false, error: 'O carrinho está vazio' };
    }

    const rawPhone = (settings?.whatsappNumber || '').replace(/\D/g, '');
    if (rawPhone.length < 12 || rawPhone.length > 13) {
      return { success: false, error: 'O WhatsApp da loja ainda não foi configurado. Peça ao administrador para informar o número em Configurações.' };
    }
    const storeName = settings?.storeName || 'Bem Garota';
    const baseUrl = window.location.origin;

    const orderItems: OrderItem[] = items.map((item) => {
      const price = item.product.promoPrice || item.product.price;
      return {
        productId: item.product.id,
        productName: item.product.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice: price,
        totalPrice: price * item.quantity,
        imageUrl: item.product.images[0] || '',
        productUrl: `${baseUrl}/produto/${item.product.slug}`,
      };
    });

    const shipping = achieved ? 0 : 0; // Finalizado no WhatsApp para cálculo ou Frete Grátis
    const total = subtotal + shipping;

    try {
      // 1. Register order intent in persistent database
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerData.name,
          customerPhone: customerData.phone,
          customerCity: customerData.city,
          items: orderItems,
          subtotal,
          shipping,
          total,
          notes: customerData.notes,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success || !data.order?.id) {
        return { success: false, error: data.error || 'Não foi possível registrar seu pedido. Tente novamente.' };
      }
      const orderId = data.order.id;

      // 2. Build organized, elegant WhatsApp message
      const itemsText = items
        .map((item, index) => {
          const unitPrice = (item.product.promoPrice || item.product.price).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          });
          const itemTotal = ((item.product.promoPrice || item.product.price) * item.quantity).toLocaleString(
            'pt-BR',
            { style: 'currency', currency: 'BRL' }
          );
          const link = `${baseUrl}/produto/${item.product.slug}`;

          return `${index + 1}. *${item.product.name}*\n   • Tamanho: *${item.size}* | Cor: *${item.color}*\n   • Qtd: ${item.quantity}x ${unitPrice} = *${itemTotal}*\n   • Ver foto: ${link}`;
        })
        .join('\n\n');

      const formattedTotal = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const formattedSubtotal = subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const freteMsg = achieved ? 'Grátis (Benefício Exclusivo)' : 'A combinar com a loja';

      const message = `✨ *NOVO PEDIDO - ${storeName.toUpperCase()}* ✨\n` +
        `Olá! Gostaria de finalizar meu pedido realizado no site da boutique.\n\n` +
        `📋 *PEDIDO:* #${orderId}\n` +
        `👤 *CLIENTE:* ${customerData.name}\n` +
        (customerData.phone ? `📱 *TELEFONE:* ${customerData.phone}\n` : '') +
        (customerData.city ? `📍 *CIDADE/ESTADO:* ${customerData.city}\n` : '') +
        (customerData.notes ? `💬 *OBSERVAÇÃO:* ${customerData.notes}\n` : '') +
        `\n🛍️ *ITENS SELECIONADOS:*\n${itemsText}\n\n` +
        `💰 *RESUMO DO PEDIDO:*\n` +
        `• Subtotal: ${formattedSubtotal}\n` +
        `• Frete: ${freteMsg}\n` +
        `• *TOTAL: ${formattedTotal}*\n\n` +
        `Aguardo as orientações para confirmação de pagamento e envio. Muito obrigada!`;

      const whatsappUrl = `https://wa.me/${rawPhone}?text=${encodeURIComponent(message)}`;

      // Keep the cart until the browser successfully opens the WhatsApp conversation.

      // Return WhatsApp redirect url
      return { success: true, whatsappUrl };
    } catch (err) {
      console.error('Error creating order intent:', err);
      return { success: false, error: 'Falha ao registrar pedido. Tente novamente.' };
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        totalItems,
        freeShippingProgress,
        checkoutViaWhatsApp,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
