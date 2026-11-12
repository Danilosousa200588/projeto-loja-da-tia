import React from 'react';
import { Instagram, MessageCircle, Facebook, MapPin, Mail, Phone, Store } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Category } from '../types/store';

interface FooterProps {
  categories: Category[];
  onSelectCategory: (categoryId: string | null) => void;
}

export const Footer: React.FC<FooterProps> = ({ categories, onSelectCategory }) => {
  const { settings } = useTheme();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[var(--color-surface,#FFFFFF)] border-t border-[var(--color-border,#EFE7E1)] text-[var(--color-text)] transition-colors duration-300">
      {/* Brand & Value Proposition Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={settings?.logoUrl || '/assets/aistudio/image_eb20ad27.png'}
                alt={settings?.storeName || 'Bem Garota'}
                className="h-14 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/aistudio/image_eb20ad27.png';
                }}
              />
              <div>
                <span className="font-boutique text-2xl font-bold tracking-tight block">
                  {settings?.storeName || 'Bem Garota'}
                </span>
                <span className="text-[11px] uppercase tracking-widest text-[var(--color-accent,#D4AF37)] font-medium">
                  {settings?.tagline || 'Moda Feminina'}
                </span>
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              Boutique feminina contemporânea. Peças com modelagem impecável, tecidos nobres e acabamento sofisticado para mulheres autênticas e elegantes.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {settings?.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings?.whatsappNumber && (
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-emerald-600 hover:border-emerald-500 transition-all"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              {settings?.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-blue-600 hover:border-blue-500 transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="font-boutique text-lg font-bold mb-4 tracking-wide text-[var(--color-text)]">
              Coleções & Categorias
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onSelectCategory(null)}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  Todas as Peças
                </button>
              </li>
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory(cat.slug || cat.id)}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Customer Care & Contacts */}
          <div>
            <h4 className="font-boutique text-lg font-bold mb-4 tracking-wide text-[var(--color-text)]">
              Atendimento & Contato
            </h4>
            <div className="space-y-3 text-sm text-[var(--color-text-muted)]">
              {settings?.whatsappNumber && (
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 hover:text-[var(--color-primary)] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>WhatsApp: {settings.whatsappNumber}</span>
                </a>
              )}
              {settings?.contactPhone && (
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
                  <span>{settings.contactPhone}</span>
                </div>
              )}
              {settings?.contactEmail && (
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="flex items-start gap-2.5 hover:text-[var(--color-primary)] transition-colors"
                >
                  <Mail className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
                  <span className="truncate">{settings.contactEmail}</span>
                </a>
              )}
              {settings?.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[var(--color-accent,#D4AF37)] shrink-0 mt-0.5" />
                  <span className="leading-snug">{settings.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Col 4: Purchase information without unconfigured promises */}
          <div>
            <h4 className="font-boutique text-lg font-bold mb-4 tracking-wide text-[var(--color-text)]">
              Informações da Loja
            </h4>
            <div className="space-y-3 text-xs text-[var(--color-text-muted)]">
              <div className="flex items-start gap-2.5">
                <Store className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
                <span>Consulte disponibilidade, formas de pagamento, frete e prazos diretamente com a loja.</span>
              </div>
              {settings?.whatsappNumber && (
                <a href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-emerald-700 font-semibold hover:underline">
                  <MessageCircle className="w-4 h-4" />
                  Falar com a loja
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Boutique Info */}
        <div className="mt-12 pt-8 border-t border-[var(--color-border,#EFE7E1)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
          <p>
            © {currentYear} {settings?.storeName || 'Bem Garota'}. Todos os direitos reservados. CNPJ sob consulta.
          </p>

          <div className="flex items-center gap-4">
            <span>Design de Alta Costura</span>
            <span aria-hidden="true">·</span>
            <span>Boutique Feminina Elegante</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
