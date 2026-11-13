import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSchema, ThemePreset, ThemeColors, Product } from './types.js';

// Use the directory of this file as the base, so it works in both
// local dev (process.cwd()) and Vercel serverless (where cwd changes).
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve data dir relative to the project root (one level up from server/)
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'store-db.json');

export const THEME_PRESETS: Record<ThemePreset, ThemeColors> = {
  'rose-boutique': {
    bg: '#FAF8F5',
    surface: '#FFFFFF',
    primary: '#B76E79',
    secondary: '#F3E5E6',
    accent: '#D4AF37',
    text: '#2D2522',
    textMuted: '#786C68',
    border: '#EFE7E1',
    buttonBg: '#B76E79',
    buttonText: '#FFFFFF',
    fontHeading: "'Cormorant Garamond', serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
    cardRadius: '0.75rem',
    buttonRadius: '0.5rem',
    cardStyle: 'soft',
  },
  'minimalista-elegante': {
    bg: '#F7F5F0',
    surface: '#FFFFFF',
    primary: '#7B624D',
    secondary: '#D9CEBE',
    accent: '#A38B74',
    text: '#252220',
    textMuted: '#6E6863',
    border: '#E5DFD5',
    buttonBg: '#252220',
    buttonText: '#FFFFFF',
    fontHeading: "'Playfair Display', serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
    cardRadius: '0.375rem',
    buttonRadius: '0.25rem',
    cardStyle: 'border',
  },
  'dark-fashion': {
    bg: '#121212',
    surface: '#1E1E1E',
    primary: '#D4AF37',
    secondary: '#2E2E2E',
    accent: '#F5D77F',
    text: '#F5F5F5',
    textMuted: '#A3A3A3',
    border: '#2A2A2A',
    buttonBg: '#D4AF37',
    buttonText: '#121212',
    fontHeading: "'Playfair Display', serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
    cardRadius: '0.5rem',
    buttonRadius: '0.5rem',
    cardStyle: 'border',
  },
  'pink-glamour': {
    bg: '#FFF5F7',
    surface: '#FFFFFF',
    primary: '#E60067',
    secondary: '#FFD1DF',
    accent: '#B8860B',
    text: '#291219',
    textMuted: '#805362',
    border: '#FCD6E2',
    buttonBg: '#E60067',
    buttonText: '#FFFFFF',
    fontHeading: "'Playfair Display', serif",
    fontBody: "'Montserrat', sans-serif",
    cardRadius: '1rem',
    buttonRadius: '9999px',
    cardStyle: 'shadow',
  },
  custom: {
    bg: '#FAF8F5',
    surface: '#FFFFFF',
    primary: '#B76E79',
    secondary: '#F3E5E6',
    accent: '#D4AF37',
    text: '#2D2522',
    textMuted: '#786C68',
    border: '#EFE7E1',
    buttonBg: '#B76E79',
    buttonText: '#FFFFFF',
    fontHeading: "'Cormorant Garamond', serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
    cardRadius: '0.75rem',
    buttonRadius: '0.5rem',
    cardStyle: 'soft',
  },
};

const INITIAL_CATALOG_PRODUCTS: Product[] = [
      {
        id: "bg_prod_01", name: "Conjunto vermelho com top e saia", slug: "conjuntos-1",
        description: "Conjunto feminino vermelho com duas peças. As fotografias da publicação estão reunidas na galeria.", price: 10, category: "Conjuntos", categoryId: "cat_conjuntos",
        images: ["/products/catalogo-bem-garota/01_13/foto_01.jpeg", "/products/catalogo-bem-garota/01_13/foto_02.jpeg"], sizes: [], colors: [], stock: 0, stockTracked: false, variants: [],
        sku: "BG-001", status: 'ativo', isFeatured: false, isNewArrival: true, isBestSeller: false,
        views: 0, createdAt: '2026-11-12T12:00:00.000Z', updatedAt: '2026-11-12T12:00:00.000Z'
      },
      {
        id: "bg_prod_02", name: "Saia curta amarela franzida", slug: "saias-2",
        description: "Saia feminina em tom amarelo. Confira as fotos adicionais para visualizar a peça por outros ângulos.", price: 10, category: "Saias", categoryId: "cat_saias",
        images: ["/products/catalogo-bem-garota/02_12/foto_01.jpeg", "/products/catalogo-bem-garota/02_12/foto_02.jpeg"], sizes: [], colors: [], stock: 0, stockTracked: false, variants: [],
        sku: "BG-002", status: 'ativo', isFeatured: false, isNewArrival: true, isBestSeller: false,
        views: 0, createdAt: '2026-11-12T12:00:00.000Z', updatedAt: '2026-11-12T12:00:00.000Z'
      },
      {
        id: "bg_prod_03", name: "Macaquinho roxo com cinto", slug: "macaquinhos-3",
        description: "Macaquinho feminino roxo. A galeria reúne as fotografias disponíveis desta publicação.", price: 10, category: "Macaquinhos", categoryId: "cat_macaquinhos",
        images: ["/products/catalogo-bem-garota/03_11/foto_01.jpeg", "/products/catalogo-bem-garota/03_11/foto_02.jpeg"], sizes: [], colors: [], stock: 0, stockTracked: false, variants: [],
        sku: "BG-003", status: 'ativo', isFeatured: false, isNewArrival: true, isBestSeller: false,
        views: 0, createdAt: '2026-11-12T12:00:00.000Z', updatedAt: '2026-11-12T12:00:00.000Z'
      },
      {
        id: "bg_prod_04", name: "Vestido branco curto", slug: "vestidos-4",
        description: "Vestido feminino branco. Confira a fotografia disponível para conhecer a peça.", price: 10, category: "Vestidos", categoryId: "cat_vestidos",
        images: ["/products/catalogo-bem-garota/04_1/foto_01.jpeg"], sizes: [], colors: [], stock: 0, stockTracked: false, variants: [],
        sku: "BG-004", status: 'ativo', isFeatured: false, isNewArrival: true, isBestSeller: false,
        views: 0, createdAt: '2026-11-12T12:00:00.000Z', updatedAt: '2026-11-12T12:00:00.000Z'
      },
      {
        id: "bg_prod_05", name: "Peça feminina franzida", slug: "moda-praia-5",
        description: "Peça feminina com detalhe franzido. A galeria reúne as fotos desta publicação e suas variações visuais.", price: 10, category: "Moda Praia", categoryId: "cat_moda_praia",
        images: ["/products/catalogo-bem-garota/05_5/foto_01.jpeg", "/products/catalogo-bem-garota/05_5/foto_02.jpeg", "/products/catalogo-bem-garota/05_5/foto_03.jpeg", "/products/catalogo-bem-garota/05_5/foto_04.jpeg", "/products/catalogo-bem-garota/05_5/foto_05.jpeg", "/products/catalogo-bem-garota/05_5/foto_06.jpeg"], sizes: [], colors: [], stock: 0, stockTracked: false, variants: [],
        sku: "BG-005", status: 'ativo', isFeatured: false, isNewArrival: true, isBestSeller: false,
        views: 0, createdAt: '2026-11-12T12:00:00.000Z', updatedAt: '2026-11-12T12:00:00.000Z'
      },
      {
        id: "bg_prod_06", name: "Short feminino com cinto", slug: "shorts-6",
        description: "Short feminino apresentado em diferentes cores e ângulos nas fotografias da galeria.", price: 10, category: "Shorts", categoryId: "cat_shorts",
        images: ["/products/catalogo-bem-garota/06_8/foto_01.jpeg", "/products/catalogo-bem-garota/06_8/foto_02.jpeg", "/products/catalogo-bem-garota/06_8/foto_03.jpeg", "/products/catalogo-bem-garota/06_8/foto_04.jpeg", "/products/catalogo-bem-garota/06_8/foto_05.jpeg"], sizes: [], colors: [], stock: 0, stockTracked: false, variants: [],
        sku: "BG-006", status: 'ativo', isFeatured: false, isNewArrival: true, isBestSeller: false,
        views: 0, createdAt: '2026-11-12T12:00:00.000Z', updatedAt: '2026-11-12T12:00:00.000Z'
      },
      {
        id: "bg_prod_07", name: "Vestido curto preto com babados", slug: "vestidos-7",
        description: "Vestido feminino preto com detalhe de babado. Veja as fotos adicionais na galeria.", price: 10, category: "Vestidos", categoryId: "cat_vestidos",
        images: ["/products/catalogo-bem-garota/07_6/foto_01.jpeg", "/products/catalogo-bem-garota/07_6/foto_02.jpeg"], sizes: [], colors: [], stock: 0, stockTracked: false, variants: [],
        sku: "BG-007", status: 'ativo', isFeatured: false, isNewArrival: true, isBestSeller: false,
        views: 0, createdAt: '2026-11-12T12:00:00.000Z', updatedAt: '2026-11-12T12:00:00.000Z'
      },
      {
        id: "bg_prod_08", name: "Vestido branco com faixa", slug: "vestidos-8",
        description: "Vestido feminino branco com faixa na cintura. Confira os diferentes ângulos na galeria.", price: 10, category: "Vestidos", categoryId: "cat_vestidos",
        images: ["/products/catalogo-bem-garota/08_2/foto_01.jpeg", "/products/catalogo-bem-garota/08_2/foto_02.jpeg"], sizes: [], colors: [], stock: 0, stockTracked: false, variants: [],
        sku: "BG-008", status: 'ativo', isFeatured: false, isNewArrival: true, isBestSeller: false,
        views: 0, createdAt: '2026-11-12T12:00:00.000Z', updatedAt: '2026-11-12T12:00:00.000Z'
      },
      {
        id: "bg_prod_09", name: "Calça feminina preta", slug: "calcas-9",
        description: "Calça feminina preta. A publicação inclui uma fotografia adicional para visualizar a peça.", price: 10, category: "Calças", categoryId: "cat_calcas",
        images: ["/products/catalogo-bem-garota/09_9/foto_01.jpeg", "/products/catalogo-bem-garota/09_9/foto_02.jpeg"], sizes: [], colors: [], stock: 0, stockTracked: false, variants: [],
        sku: "BG-009", status: 'ativo', isFeatured: false, isNewArrival: true, isBestSeller: false,
        views: 0, createdAt: '2026-11-12T12:00:00.000Z', updatedAt: '2026-11-12T12:00:00.000Z'
      },
      {
        id: "bg_prod_10", name: "Conjunto feminino com blusa e short", slug: "conjuntos-10",
        description: "Conjunto feminino apresentado em mais de uma opção visual. Confira as fotos da galeria.", price: 10, category: "Conjuntos", categoryId: "cat_conjuntos",
        images: ["/products/catalogo-bem-garota/10_10/foto_01.jpeg", "/products/catalogo-bem-garota/10_10/foto_02.jpeg"], sizes: [], colors: [], stock: 0, stockTracked: false, variants: [],
        sku: "BG-010", status: 'ativo', isFeatured: false, isNewArrival: true, isBestSeller: false,
        views: 0, createdAt: '2026-11-12T12:00:00.000Z', updatedAt: '2026-11-12T12:00:00.000Z'
      },
      {
        id: "bg_prod_11", name: "Vestido rosa com cintura marcada", slug: "vestidos-11",
        description: "Vestido feminino em tom rosa. Confira a fotografia disponível da publicação.", price: 10, category: "Vestidos", categoryId: "cat_vestidos",
        images: ["/products/catalogo-bem-garota/11_4/foto_01.jpeg"], sizes: [], colors: [], stock: 0, stockTracked: false, variants: [],
        sku: "BG-011", status: 'ativo', isFeatured: false, isNewArrival: true, isBestSeller: false,
        views: 0, createdAt: '2026-11-12T12:00:00.000Z', updatedAt: '2026-11-12T12:00:00.000Z'
      },
      {
        id: "bg_prod_12", name: "Vestido branco feminino", slug: "vestidos-12",
        description: "Vestido feminino branco. Confira a fotografia disponível da publicação.", price: 10, category: "Vestidos", categoryId: "cat_vestidos",
        images: ["/products/catalogo-bem-garota/12_pulicacao_1/foto_01.jpeg"], sizes: [], colors: [], stock: 0, stockTracked: false, variants: [],
        sku: "BG-012", status: 'ativo', isFeatured: false, isNewArrival: true, isBestSeller: false,
        views: 0, createdAt: '2026-11-12T12:00:00.000Z', updatedAt: '2026-11-12T12:00:00.000Z'
      },
      {
        id: "bg_prod_13", name: "Vestido amarelo feminino", slug: "vestidos-13",
        description: "Vestido feminino em tom amarelo. A galeria reúne as fotografias disponíveis desta publicação.", price: 10, category: "Vestidos", categoryId: "cat_vestidos",
        images: ["/products/catalogo-bem-garota/13_publicacao_3/foto_01.jpeg", "/products/catalogo-bem-garota/13_publicacao_3/foto_02.jpeg"], sizes: [], colors: [], stock: 0, stockTracked: false, variants: [],
        sku: "BG-013", status: 'ativo', isFeatured: false, isNewArrival: true, isBestSeller: false,
        views: 0, createdAt: '2026-11-12T12:00:00.000Z', updatedAt: '2026-11-12T12:00:00.000Z'
      }
];

function getInitialData(): DatabaseSchema {
  return {
    settings: {
      storeName: 'Bem Garota',
      tagline: 'Moda Feminina Elegante & Contemporânea',
      logoUrl: '/assets/aistudio/image_eb20ad27.png',
      whatsappNumber: '',
      instagramUrl: '',
      facebookUrl: '',
      tiktokUrl: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      announcementBar: '',
      announcementActive: false,
      freeShippingThreshold: 0,
      activeTheme: 'rose-boutique',
      themeSettings: { ...THEME_PRESETS['rose-boutique'] },
      homepageSections: [
        { id: 'hero_banner', name: 'Banner Principal em Destaque', enabled: true, order: 1 },
        { id: 'benefits_bar', name: 'Diferenciais & Benefícios da Loja', enabled: true, order: 2 },
        { id: 'featured_categories', name: 'Navegação por Categorias', enabled: true, order: 3 },
        { id: 'new_arrivals', name: 'Lançamentos & Novidades', enabled: true, order: 4 },
        { id: 'promo_banner', name: 'Banner de Coleção Especial', enabled: true, order: 5 },
        { id: 'best_sellers', name: 'Mais Vendidos da Boutique', enabled: true, order: 6 },
        { id: 'offers', name: 'Ofertas Selecionadas', enabled: true, order: 7 },
        { id: 'reviews', name: 'Depoimentos de Clientes', enabled: true, order: 8 },
        { id: 'instagram_feed', name: 'Feed do Instagram & Estilo', enabled: true, order: 9 },
      ],
      pixKey: '',
      bankInfo: '',
    },
    categories: [
      { id: 'cat_novidades', name: 'Novidades', slug: 'novidades', order: 1, isActive: true },
      { id: 'cat_vestidos', name: 'Vestidos', slug: 'vestidos', order: 2, isActive: true },
      { id: 'cat_conjuntos', name: 'Conjuntos', slug: 'conjuntos', order: 3, isActive: true },
      { id: 'cat_blusas', name: 'Blusas', slug: 'blusas', order: 4, isActive: true },
      { id: 'cat_calcas', name: 'Calças', slug: 'calcas', order: 5, isActive: true },
      { id: 'cat_saias', name: 'Saias', slug: 'saias', order: 6, isActive: true },
      { id: 'cat_camisetas', name: 'Camisetas', slug: 'camisetas', order: 7, isActive: true },
      { id: 'cat_acessorios', name: 'Acessórios', slug: 'acessorios', order: 8, isActive: true },
      { id: 'cat_macaquinhos', name: 'Macaquinhos', slug: 'macaquinhos', order: 9, isActive: true },
      { id: 'cat_shorts', name: 'Shorts', slug: 'shorts', order: 10, isActive: true },
      { id: 'cat_moda_praia', name: 'Moda Praia', slug: 'moda-praia', order: 11, isActive: true },
    ],
    banners: [],
    products: INITIAL_CATALOG_PRODUCTS.map((product) => ({ ...product, images: [...product.images], sizes: [...product.sizes], colors: [...product.colors], variants: [] })),
    reviews: [],
    orders: [],
    admin: {
      username: 'admin@bemgarota.com.br',
      passwordHash: 'admin123',
      token: 'bemgarota_admin_token_2026',
    },
  };
}

class StoreDatabase {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        // Ensure all required fields exist
        const initial = getInitialData();
        const migrated: DatabaseSchema = {
          ...initial,
          ...parsed,
          settings: { ...initial.settings, ...(parsed.settings || {}) },
          themeSettings: { ...initial.settings.themeSettings, ...(parsed.settings?.themeSettings || {}) },
        };
        // Remove legacy demo content from databases created by older templates.
        // Real products and customer content are preserved.
        migrated.products = (migrated.products || []).filter((item: any) =>
          !item.isDemo &&
          !String(item.id || '').startsWith('demo_') &&
          !String(item.id || '').startsWith('prod_demo_') &&
          !String(item.id || '').startsWith('prod_ai_drive_') &&
          !String(item.id || '').startsWith('prod_drive_')
        );
        migrated.banners = (migrated.banners || []).filter((item: any) =>
          !item.isDemo && !String(item.id || '').startsWith('demo_') && !String(item.id || '').startsWith('banner_demo_')
        );
        migrated.reviews = (migrated.reviews || []).filter((item: any) => !item.isDemo);
        // Add the real Bem Garota catalogue once, without replacing existing store products.
        const existingProductIds = new Set(migrated.products.map((item: any) => item.id));
        migrated.products = [
          ...INITIAL_CATALOG_PRODUCTS.filter((item) => !existingProductIds.has(item.id)),
          ...migrated.products,
        ];
        const existingCategoryIds = new Set(migrated.categories.map((item: any) => item.id));
        migrated.categories = [
          ...initial.categories.filter((item) => !existingCategoryIds.has(item.id)),
          ...migrated.categories,
        ];
        return migrated;
      }
    } catch (err) {
      console.error('Error loading database. Restoring the clean initial store configuration:', err);
    }

    const defaultData = getInitialData();
    this.saveDataSync(defaultData);
    return defaultData;
  }

  private saveDataSync(dataToSave: DatabaseSchema) {
    try {
      this.ensureDirectory();
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Error saving database synchronously:', err);
    }
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveDataSync(this.data);
    }, 150);
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  public resetToDefaults(): DatabaseSchema {
    this.data = getInitialData();
    this.saveDataSync(this.data);
    return this.data;
  }

  public clearStore(): DatabaseSchema {
    this.data.products = [];
    this.data.orders = [];
    this.data.banners = [];
    this.data.reviews = [];
    this.data.categories = [];
    this.saveDataSync(this.data);
    return this.data;
  }
}

export const db = new StoreDatabase();
