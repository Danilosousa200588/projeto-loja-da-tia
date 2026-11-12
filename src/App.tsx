import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BenefitsBar } from './components/BenefitsBar';
import { HeroCarousel } from './components/HeroCarousel';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { FavoritesModal } from './components/FavoritesModal';
import { ReviewsSection } from './components/ReviewsSection';
import { InstagramFeed } from './components/InstagramFeed';
import { StoreOpeningVideo } from './components/StoreOpeningVideo';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminModal } from './components/admin/AdminModal';
import { Product, Category, Banner, Review } from './types/store';
import { Sparkles, SlidersHorizontal, ArrowUpDown, Filter, X, ArrowRight } from 'lucide-react';

const StoreFront: React.FC = () => {
  const { settings, isPreviewing, resetPreview } = useTheme();
  const { isAuthenticated, token, openAdmin } = useAuth();

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Navigation
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [scrollToCatalogAfterFilter, setScrollToCatalogAfterFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'views'>('newest');

  // Modals
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!scrollToCatalogAfterFilter) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setScrollToCatalogAfterFilter(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedCategory, scrollToCatalogAfterFilter]);

  const fetchStoreData = useCallback(async () => {
    try {
      if (isAuthenticated && token) {
        const response = await fetch('/api/admin/store-data', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Não foi possível carregar os dados administrativos.');
        const data = await response.json();
        setProducts(Array.isArray(data.products) ? data.products : []);
        setCategories(Array.isArray(data.categories) ? data.categories : []);
        setBanners(Array.isArray(data.banners) ? data.banners : []);
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      } else {
        const [prodsRes, catsRes, bansRes, revsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories?public=true'),
          fetch('/api/banners?public=true'),
          fetch('/api/reviews'),
        ]);
        if (prodsRes.ok) setProducts(await prodsRes.json());
        if (catsRes.ok) setCategories(await catsRes.json());
        if (bansRes.ok) setBanners(await bansRes.json());
        if (revsRes.ok) setReviews(await revsRes.json());
      }
    } catch (err) {
      console.error('Error fetching store data:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  // Resolve shareable individual-product URLs such as /produto/vestidos-4.
  useEffect(() => {
    const match = window.location.pathname.match(/^\/produto\/([^/]+)\/?$/i);
    if (!match || products.length === 0) return;
    const slug = decodeURIComponent(match[1]);
    const product = products.find((item) => item.slug === slug);
    if (product) setQuickViewProduct(product);
  }, [products]);

  // Hidden admin access: URL (/admin, /painel, ?admin=true, #admin) or shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const checkAdminTrigger = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      if (
        path.includes('/admin') ||
        path.includes('/painel') ||
        hash === '#admin' ||
        hash === '#painel' ||
        search.includes('admin')
      ) {
        openAdmin();
      }
    };

    checkAdminTrigger();
    window.addEventListener('popstate', checkAdminTrigger);
    window.addEventListener('hashchange', checkAdminTrigger);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        openAdmin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', checkAdminTrigger);
      window.removeEventListener('hashchange', checkAdminTrigger);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openAdmin]);

  // Filtered & sorted products for main catalog view
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.status === 'ativo');

    if (selectedCategory === 'novidades') {
      result = result.filter((product) => product.isNewArrival);
    } else if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
      if (cat) {
        result = result.filter(
          (p) =>
            p.categoryId === cat.id ||
            p.category.toLowerCase() === cat.name.toLowerCase() ||
            p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cat.slug
        );
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'price_asc') {
        return (a.promoPrice || a.price) - (b.promoPrice || b.price);
      }
      if (sortBy === 'price_desc') {
        return (b.promoPrice || b.price) - (a.promoPrice || a.price);
      }
      if (sortBy === 'views') {
        return (b.views || 0) - (a.views || 0);
      }
      // Default: newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [products, categories, selectedCategory, searchQuery, sortBy]);

  // Featured lists
  const newArrivals = useMemo(() => {
    return products.filter((p) => p.status === 'ativo' && p.isNewArrival).slice(0, 4);
  }, [products]);

  const bestSellers = useMemo(() => {
    return products.filter((p) => p.status === 'ativo' && (p.isBestSeller || p.isFeatured)).slice(0, 4);
  }, [products]);

  const offers = useMemo(() => {
    return products.filter((p) => p.status === 'ativo' && p.promoPrice && p.promoPrice < p.price).slice(0, 4);
  }, [products]);

  const campaignBanner = useMemo(
    () => banners.find((banner) => banner.isActive && (banner.position === 'secondary' || banner.position === 'promo')) || null,
    [banners]
  );

  // Homepage sections enabled check
  const sectionEnabled = (id: string) => {
    if (!settings?.homepageSections) return true;
    const sec = settings.homepageSections.find((s) => s.id === id);
    return sec ? sec.enabled : true;
  };

  const getSectionTitle = (id: string, defaultTitle: string) => {
    const sec = settings?.homepageSections?.find((s) => s.id === id);
    return sec?.title || defaultTitle;
  };

  const currentCategoryObj = useMemo(() => {
    if (!selectedCategory) return null;
    return categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
  }, [categories, selectedCategory]);

  const headerCategories = useMemo(() => categories.filter((category) =>
    category.showInHeader !== false &&
    products.some((product) => product.status === 'ativo' && (
      product.categoryId === category.id ||
      product.category.toLocaleLowerCase('pt-BR') === category.name.toLocaleLowerCase('pt-BR')
    ))
  ), [categories, products]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg,#FAF8F5)] text-[var(--color-text,#292524)] transition-colors duration-300">
      {/* Live Preview Floating Alert Banner if previewing theme */}
      {isPreviewing && (
        <div className="sticky top-0 z-50 bg-blue-600 text-white text-xs py-2 px-4 flex items-center justify-between shadow-md">
          <span className="font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Você está visualizando uma prévia do tema. Os visitantes da loja ainda veem o tema atual salvo.
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={openAdmin}
              className="px-2.5 py-1 bg-white text-blue-900 rounded font-bold hover:bg-stone-100"
            >
              Aplicar no Painel
            </button>
            <button
              onClick={resetPreview}
              className="underline hover:text-stone-200"
            >
              Fechar Prévia
            </button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        categories={headerCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          if (slug) {
            document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim()) {
            document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onOpenQuickView={(id) => {
          const p = products.find((prod) => prod.id === id);
          if (p) setQuickViewProduct(p);
        }}
      />

      <main className="flex-1">
        {/* Only show homepage hero/banners when not actively searching or filtering a single category */}
        {!selectedCategory && !searchQuery.trim() && (
          <>
            <StoreOpeningVideo />

            {/* 1. Hero Banner Carousel */}
            {sectionEnabled('hero_banner') && (
              <HeroCarousel
                banners={banners}
                onSelectCategory={(slug) => setSelectedCategory(slug)}
                onExploreClick={() => {
                  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}

            {/* 2. Benefits Bar */}
            {sectionEnabled('benefits_bar') && <BenefitsBar />}

            {/* 3. Category Showcase Grid */}
            {sectionEnabled('featured_categories') && (
              <section className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
                  <span className="text-xs uppercase tracking-widest font-semibold text-[var(--color-primary,#B76E79)]">
                    Navegue por Estilo
                  </span>
                  <h2 className="font-boutique text-2xl sm:text-3xl font-semibold text-[var(--color-text)]">
                    {getSectionTitle('featured_categories', 'Categorias em Destaque')}
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                  {categories
                    .filter((cat) => cat.isActive)
                    .map((cat) => {
                      const categoryProduct = cat.slug === 'novidades'
                        ? products.find((product) => product.status === 'ativo' && product.isNewArrival && product.images?.[0])
                        : products.find((product) => product.status === 'ativo' && product.images?.[0] && (
                            product.categoryId === cat.id ||
                            product.category.toLocaleLowerCase('pt-BR') === cat.name.toLocaleLowerCase('pt-BR') ||
                            product.category.toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g, '-') === cat.slug
                          ));
                      const categoryImage = cat.imageUrl || categoryProduct?.images?.[0];
                      // Não exibe categorias vazias com fotos de peças que não correspondem a elas.
                      if (!categoryImage) return null;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.slug);
                            setScrollToCatalogAfterFilter(true);
                          }}
                          className="group relative aspect-[4/5] min-h-[150px] overflow-hidden rounded-xl sm:rounded-2xl bg-[var(--color-secondary,#F3E5E6)] text-left shadow-sm hover:shadow-lg transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                        >
                          <img
                            src={categoryImage}
                            alt={`Categoria ${cat.name}`}
                            className="absolute inset-0 h-full w-full object-contain object-center"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                          <span className="absolute inset-x-0 bottom-0 px-3 py-3 sm:px-4 sm:py-4 font-semibold text-sm sm:text-base tracking-wide text-white drop-shadow-md">
                            {cat.name}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </section>
            )}

            {/* 4. New Arrivals Showcase */}
            {sectionEnabled('new_arrivals') && newArrivals.length > 0 && (
              <section className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--color-border,#EFE7E1)]">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
                  <div>
                    <span className="text-xs uppercase tracking-widest font-semibold text-[var(--color-primary,#B76E79)]">
                      Lançamentos da Semana
                    </span>
                    <h2 className="font-boutique text-2xl sm:text-3xl font-semibold text-[var(--color-text)]">
                      {getSectionTitle('new_arrivals', 'Novidades da Coleção')}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory('novidades');
                      document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline self-start sm:self-auto"
                  >
                    <span>Ver todos os lançamentos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  {newArrivals.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onOpenQuickView={(p) => setQuickViewProduct(p)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 5. Secondary campaign banner (managed in the admin panel) */}
            {sectionEnabled('promo_banner') && campaignBanner && (
              <section className="w-full py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="relative rounded-[var(--radius-card,0.75rem)] overflow-hidden bg-stone-900 text-white min-h-[260px] sm:min-h-[340px] flex items-center p-6 sm:p-12 shadow-lg">
                  <picture className="absolute inset-0 w-full h-full">
                    {campaignBanner.mobileImageUrl && <source media="(max-width: 639px)" srcSet={campaignBanner.mobileImageUrl} />}
                    <img src={campaignBanner.desktopImageUrl || campaignBanner.imageUrl} alt={campaignBanner.title} className="absolute inset-0 w-full h-full object-cover opacity-60" loading="lazy" />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/50 to-transparent" />
                  <div className="relative z-10 max-w-lg space-y-4">
                    {campaignBanner.badge && <span className="inline-block text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-accent,#D4AF37)] border-b border-[var(--color-accent,#D4AF37)] pb-0.5">{campaignBanner.badge}</span>}
                    <h3 className="font-boutique text-3xl sm:text-4xl font-medium tracking-tight">{campaignBanner.title}</h3>
                    {campaignBanner.subtitle && <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-light">{campaignBanner.subtitle}</p>}
                    <button
                      onClick={() => {
                        const categorySlug = campaignBanner.link?.match(/categoria\/([^/?#]+)/)?.[1];
                        setSelectedCategory(categorySlug || null);
                        document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[var(--radius-btn,0.5rem)] bg-[var(--color-primary,#B76E79)] text-white text-xs font-semibold hover:opacity-95 shadow-md"
                    >
                      <span>{campaignBanner.linkText || 'Ver coleção'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* 6. Best Sellers */}
            {sectionEnabled('best_sellers') && bestSellers.length > 0 && (
              <section className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--color-border,#EFE7E1)]">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
                  <div>
                    <span className="text-xs uppercase tracking-widest font-semibold text-[var(--color-primary,#B76E79)]">
                      Preferidos das Clientes
                    </span>
                    <h2 className="font-boutique text-2xl sm:text-3xl font-semibold text-[var(--color-text)]">
                      {getSectionTitle('best_sellers', 'Peças Mais Vendidas')}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  {bestSellers.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onOpenQuickView={(p) => setQuickViewProduct(p)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* 7. Catalog Section (Integrated Store Grid) */}
        <section id="catalogo" className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-[var(--color-border,#EFE7E1)] gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-boutique text-2xl sm:text-3xl font-semibold text-[var(--color-text)]">
                  {currentCategoryObj ? currentCategoryObj.name : searchQuery ? `Resultados para "${searchQuery}"` : 'Todas as Peças da Boutique'}
                </h2>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline bg-rose-50 px-2 py-0.5 rounded-full"
                    title="Limpar filtro"
                  >
                    <span>Limpar</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Exibindo {filteredProducts.length} {filteredProducts.length === 1 ? 'peça encontrada' : 'peças encontradas'}
              </p>
            </div>

            {/* Sorting selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 font-medium">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Ordenar por:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[var(--color-surface,#FFFFFF)] border border-[var(--color-border,#EFE7E1)] rounded-lg text-xs py-1.5 px-3 text-[var(--color-text)] focus:outline-none"
              >
                <option value="newest">Mais Recentes</option>
                <option value="price_asc">Menor Preço</option>
                <option value="price_desc">Maior Preço</option>
                <option value="views">Mais Visualizados</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-[var(--color-surface,#FFFFFF)] rounded-[var(--radius-card,0.75rem)] border border-[var(--color-border,#EFE7E1)] p-8">
              <Sparkles className="w-8 h-8 text-[var(--color-primary)] mx-auto" />
              <h3 className="font-boutique text-xl font-bold text-[var(--color-text)]">
                Nenhuma peça encontrada
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
                Tente buscar com outro termo ou selecionar outra categoria no menu superior.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-[var(--color-primary,#B76E79)] text-white text-xs font-semibold rounded-lg hover:opacity-90"
              >
                Ver Todas as Peças
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onOpenQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </section>

        {/* 8. Customer Reviews Section */}
        {sectionEnabled('reviews') && reviews.length > 0 && (
          <ReviewsSection
            reviews={reviews}
            onReviewAdded={(newRev) => setReviews((prev) => [newRev, ...prev])}
          />
        )}

        {/* 9. Instagram Feed */}
        {sectionEnabled('instagram_feed') && <InstagramFeed />}
      </main>

      {/* Footer */}
      <Footer
        categories={categories}
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Modals & Overlays */}
      <ProductDetailModal
        product={quickViewProduct}
        onClose={() => { setQuickViewProduct(null); if (window.location.pathname.startsWith('/produto/')) window.history.replaceState({}, '', '/'); }}
        onSelectProduct={(p) => setQuickViewProduct(p)}
        relatedProducts={
          quickViewProduct
            ? products.filter((p) => p.id !== quickViewProduct.id && p.categoryId === quickViewProduct.categoryId)
            : []
        }
      />

      <CartDrawer />

      <FavoritesModal
        onOpenQuickView={(p) => setQuickViewProduct(p)}
      />

      <AdminLoginModal />

      <AdminModal
        products={products}
        categories={categories}
        banners={banners}
        reviews={reviews}
        onRefreshAll={fetchStoreData}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <StoreFront />
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
