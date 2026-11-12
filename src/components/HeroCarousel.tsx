import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Banner } from '../types/store';

interface HeroCarouselProps {
  banners: Banner[];
  onSelectCategory: (categoryId: string | null) => void;
  onExploreClick: () => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  banners,
  onSelectCategory,
  onExploreClick,
}) => {
  const displayBanners = banners.filter((b) => b.isActive && (b.position === 'hero' || !b.position));
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (displayBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [displayBanners.length]);

  if (displayBanners.length === 0) return null;

  const currentBanner = displayBanners[currentIndex] || displayBanners[0];

  const handleBannerAction = (banner: Banner) => {
    if (banner.link && banner.link.includes('categoria/')) {
      const slug = banner.link.split('categoria/')[1];
      onSelectCategory(slug || null);
    } else {
      onExploreClick();
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-[var(--color-bg,#FAF8F5)]">
      <div className="relative w-full h-[420px] sm:h-[560px] lg:h-[640px] flex items-center">
        {/* Background Image with Cinematic Scrim */}
        <div className="absolute inset-0">
          <picture>
            {currentBanner.mobileImageUrl && <source media="(max-width: 639px)" srcSet={currentBanner.mobileImageUrl} />}
            <img
              src={currentBanner.desktopImageUrl || currentBanner.imageUrl}
              alt={currentBanner.title}
              className="w-full h-full object-cover object-center transition-all duration-1000 ease-out transform scale-100"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </picture>
          {/* Gradients ensuring high legibility and boutique elegance */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/75 via-stone-900/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="max-w-xl text-white space-y-5">
            {currentBanner.badge && (
              <span className="inline-block text-xs uppercase tracking-[0.25em] font-semibold text-[var(--color-accent,#D4AF37)] border-b border-[var(--color-accent,#D4AF37)] pb-1">
                {currentBanner.badge}
              </span>
            )}

            <h1 className="font-boutique text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1] text-white">
              {currentBanner.title}
            </h1>

            <p className="text-sm sm:text-base text-stone-200 font-light leading-relaxed max-w-md">
              {currentBanner.subtitle}
            </p>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => handleBannerAction(currentBanner)}
                className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold tracking-wide rounded-[var(--radius-btn,0.5rem)] bg-[var(--color-primary,#B76E79)] text-white hover:opacity-95 shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <span>{currentBanner.linkText || 'Explorar Coleção'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreClick}
                className="hidden sm:inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-wide rounded-[var(--radius-btn,0.5rem)] bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs border border-white/30 transition-all"
              >
                Ver Lançamentos
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Slide Navigation Controls */}
        {displayBanners.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev - 1 + displayBanners.length) % displayBanners.length)
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-all focus:outline-none"
              aria-label="Slide anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % displayBanners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-all focus:outline-none"
              aria-label="Próximo slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Slide Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
              {displayBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === i ? 'w-8 bg-[var(--color-accent,#D4AF37)]' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Ir para banner ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
