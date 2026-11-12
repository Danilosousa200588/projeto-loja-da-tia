import React from 'react';
import { MessageCircle, Ruler, ShoppingBag, HeartHandshake } from 'lucide-react';

const benefits = [
  { icon: ShoppingBag, title: 'Escolha com calma', description: 'Confira fotos, tamanhos e cores de cada peça.' },
  { icon: Ruler, title: 'Detalhes do produto', description: 'Consulte as informações disponíveis no cadastro.' },
  { icon: MessageCircle, title: 'Atendimento direto', description: 'Tire dúvidas e combine seu pedido com a loja.' },
  { icon: HeartHandshake, title: 'Suporte da loja', description: 'Converse com a equipe antes de finalizar a compra.' },
];

export const BenefitsBar: React.FC = () => (
  <section className="w-full bg-[var(--color-surface,#FFFFFF)] border-y border-[var(--color-border,#EFE7E1)] py-5 sm:py-6 transition-colors duration-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {benefits.map((item) => {
          const IconComponent = item.icon;
          return (
            <div key={item.title} className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg,#FAF8F5)] border border-[var(--color-border,#EFE7E1)] flex items-center justify-center shrink-0 text-[var(--color-primary,#B76E79)]">
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">{item.title}</h4>
                <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)] mt-0.5 leading-snug">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
