import React from 'react';
import { Instagram, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const InstagramFeed: React.FC = () => {
  const { settings } = useTheme();
  const instagramUrl = settings?.instagramUrl?.trim();

  if (!instagramUrl) return null;

  let profileName = 'Instagram';
  try {
    profileName = new URL(instagramUrl).pathname.replace(/^\/+|\/+$/g, '').split('/')[0] || 'Instagram';
    if (profileName && !profileName.startsWith('@')) profileName = `@${profileName}`;
  } catch {
    profileName = 'Instagram';
  }

  return (
    <section className="w-full py-12 sm:py-16 bg-[var(--color-surface,#FFFFFF)] border-t border-[var(--color-border,#EFE7E1)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary,#B76E79)]">
          <Instagram className="w-4 h-4" />
          <span>Acompanhe a loja</span>
        </div>
        <h2 className="font-boutique text-2xl sm:text-3xl font-semibold text-[var(--color-text)] mt-2">{profileName}</h2>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-2 max-w-lg mx-auto">
          Veja novidades, lançamentos e conteúdos publicados no perfil oficial da loja.
        </p>
        <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 mt-5 px-5 py-3 rounded-[var(--radius-btn,0.5rem)] bg-[var(--color-primary)] text-[var(--color-btn-text,#FFFFFF)] text-sm font-semibold hover:opacity-90 transition-opacity">
          <Instagram className="w-4 h-4" />
          <span>Visitar Instagram</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </section>
  );
};
