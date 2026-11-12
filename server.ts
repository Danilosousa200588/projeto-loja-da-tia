import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { db, THEME_PRESETS } from './server/db.js';
import { Product, Category, Banner, Review, OrderIntent, OrderItem, StoreSettings, ThemePreset } from './server/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;
const app = express();

async function startServer() {
  app.use(express.json({ limit: '12mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Admin Auth Middleware helper
  const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '') || (req.query.token as string);
    const database = db.getData();

    if (token && token === database.admin.token) {
      next();
    } else {
      res.status(401).json({ error: 'Não autorizado. Faça login como administrador.' });
    }
  };

  /* ===================== AUTH ROUTES ===================== */
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    const database = db.getData();

    if (
      username === database.admin.username &&
      password === database.admin.passwordHash
    ) {
      res.json({
        success: true,
        token: database.admin.token,
        user: { username: database.admin.username, role: 'admin' },
      });
    } else {
      res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }
  });

  app.get('/api/auth/verify', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    const database = db.getData();

    if (token && token === database.admin.token) {
      res.json({ valid: true, user: { username: database.admin.username, role: 'admin' } });
    } else {
      res.status(401).json({ valid: false });
    }
  });

  // Private store data is only available to an authenticated administrator.
  app.get('/api/admin/store-data', requireAdmin, (_req: Request, res: Response) => {
    const database = db.getData();
    res.json({
      products: database.products,
      categories: database.categories,
      banners: database.banners,
      reviews: database.reviews,
    });
  });

  app.post('/api/auth/change-password', requireAdmin, (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const database = db.getData();

    if (currentPassword !== database.admin.passwordHash) {
      res.status(400).json({ error: 'Senha atual incorreta' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres' });
      return;
    }

    database.admin.passwordHash = newPassword;
    db.save();
    res.json({ success: true, message: 'Senha alterada com sucesso!' });
  });

  /* ===================== SETTINGS & THEMES ===================== */
  app.get('/api/settings', (_req: Request, res: Response) => {
    const database = db.getData();
    res.json(database.settings);
  });

  app.put('/api/settings', requireAdmin, (req: Request, res: Response) => {
    const database = db.getData();
    database.settings = {
      ...database.settings,
      ...req.body,
    };
    db.save();
    res.json({ success: true, settings: database.settings });
  });

  app.get('/api/themes', (_req: Request, res: Response) => {
    const database = db.getData();
    res.json({
      presets: THEME_PRESETS,
      activeTheme: database.settings.activeTheme,
      currentThemeSettings: database.settings.themeSettings,
    });
  });

  app.post('/api/themes/apply', requireAdmin, (req: Request, res: Response) => {
    const { preset, customSettings } = req.body;
    const database = db.getData();

    if (preset && THEME_PRESETS[preset as ThemePreset]) {
      database.settings.activeTheme = preset;
      database.settings.themeSettings = {
        ...THEME_PRESETS[preset as ThemePreset],
        ...(customSettings || {}),
      };
    } else if (customSettings) {
      database.settings.activeTheme = 'custom';
      database.settings.themeSettings = {
        ...database.settings.themeSettings,
        ...customSettings,
      };
    }

    db.save();
    res.json({
      success: true,
      activeTheme: database.settings.activeTheme,
      themeSettings: database.settings.themeSettings,
    });
  });

  /* ===================== CATEGORIES ===================== */
  app.get('/api/categories', (req: Request, res: Response) => {
    const database = db.getData();
    const isPublic = req.query.public === 'true';

    let categories = [...database.categories].sort((a, b) => a.order - b.order);
    if (isPublic) {
      categories = categories.filter((c) => c.isActive);
    }
    res.json(categories);
  });

  app.post('/api/categories', requireAdmin, (req: Request, res: Response) => {
    const database = db.getData();
    const { name, slug, order, isActive, showInHeader, imageUrl, description } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Nome da categoria é obrigatório' });
      return;
    }

    const newCategory: Category = {
      id: `cat_${Date.now()}`,
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      order: Number(order) || database.categories.length + 1,
      isActive: isActive !== false,
      showInHeader: showInHeader !== false,
      imageUrl,
      description,
    };

    database.categories.push(newCategory);
    db.save();
    res.status(201).json(newCategory);
  });

  app.put('/api/categories/:id', requireAdmin, (req: Request, res: Response) => {
    const database = db.getData();
    const { id } = req.params;
    const index = database.categories.findIndex((c) => c.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Categoria não encontrada' });
      return;
    }

    database.categories[index] = {
      ...database.categories[index],
      ...req.body,
      id, // Preserve id
    };

    db.save();
    res.json(database.categories[index]);
  });

  app.delete('/api/categories/:id', requireAdmin, (req: Request, res: Response) => {
    const database = db.getData();
    const { id } = req.params;
    database.categories = database.categories.filter((c) => c.id !== id);
    db.save();
    res.json({ success: true, message: 'Categoria excluída' });
  });

  /* ===================== PRODUCT IMAGE UPLOADS ===================== */
  app.post('/api/admin/product-images', requireAdmin, (req: Request, res: Response) => {
    const { mimeType, dataBase64 } = req.body || {};
    const allowedExtensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    const extension = allowedExtensions[String(mimeType || '').toLowerCase()];
    if (!extension || typeof dataBase64 !== 'string') {
      res.status(400).json({ error: 'Envie uma imagem JPG, PNG ou WEBP válida.' });
      return;
    }

    const imageBuffer = Buffer.from(dataBase64, 'base64');
    if (!imageBuffer.length || imageBuffer.length > 8 * 1024 * 1024) {
      res.status(413).json({ error: 'Cada imagem deve ter no máximo 8 MB.' });
      return;
    }

    const uploadDirectory = path.resolve(process.cwd(), 'public', 'uploads', 'products');
    fs.mkdirSync(uploadDirectory, { recursive: true });
    const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
    fs.writeFileSync(path.join(uploadDirectory, fileName), imageBuffer);
    res.status(201).json({ url: `/uploads/products/${fileName}` });
  });

  app.post('/api/admin/banner-images', requireAdmin, (req: Request, res: Response) => {
    const { mimeType, dataBase64 } = req.body || {};
    const allowedExtensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    const extension = allowedExtensions[String(mimeType || '').toLowerCase()];
    if (!extension || typeof dataBase64 !== 'string') {
      res.status(400).json({ error: 'Envie uma imagem JPG, PNG ou WEBP válida.' });
      return;
    }

    const imageBuffer = Buffer.from(dataBase64, 'base64');
    if (!imageBuffer.length || imageBuffer.length > 8 * 1024 * 1024) {
      res.status(413).json({ error: 'Cada banner deve ter no máximo 8 MB.' });
      return;
    }

    const uploadDirectory = path.resolve(process.cwd(), 'public', 'uploads', 'banners');
    fs.mkdirSync(uploadDirectory, { recursive: true });
    const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
    fs.writeFileSync(path.join(uploadDirectory, fileName), imageBuffer);
    res.status(201).json({ url: `/uploads/banners/${fileName}` });
  });

  /* ===================== PRODUCTS ===================== */
  app.get('/api/products', (req: Request, res: Response) => {
    const database = db.getData();
    const {
      category,
      featured,
      newArrival,
      bestSeller,
      search,
      status,
      sort,
      limit,
    } = req.query;

    let products = [...database.products];

    // This route is public: never expose inactive products or drafts.
    products = products.filter((p) => p.status === 'ativo');

    // Filter by Category
    if (category) {
      const catSlug = String(category).toLowerCase();
      if (catSlug === 'novidades') {
        products = products.filter((product) => product.isNewArrival);
      } else products = products.filter(
        (p) =>
          p.category.toLowerCase() === catSlug ||
          p.categoryId === catSlug ||
          p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') === catSlug
      );
    }

    // Filter by flags
    if (featured === 'true') {
      products = products.filter((p) => p.isFeatured);
    }
    if (newArrival === 'true') {
      products = products.filter((p) => p.isNewArrival);
    }
    if (bestSeller === 'true') {
      products = products.filter((p) => p.isBestSeller);
    }

    // Search
    if (search) {
      const term = String(search).toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term)
      );
    }

    // Sorting
    if (sort === 'price_asc') {
      products.sort((a, b) => (a.promoPrice || a.price) - (b.promoPrice || b.price));
    } else if (sort === 'price_desc') {
      products.sort((a, b) => (b.promoPrice || b.price) - (a.promoPrice || a.price));
    } else if (sort === 'views') {
      products.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      // Default: newest
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    if (limit) {
      products = products.slice(0, Number(limit));
    }

    res.json(products);
  });

  app.get('/api/products/:idOrSlug', (req: Request, res: Response) => {
    const database = db.getData();
    const { idOrSlug } = req.params;

    const product = database.products.find(
      (p) => (p.id === idOrSlug || p.slug === idOrSlug) && p.status === 'ativo'
    );

    if (!product) {
      res.status(404).json({ error: 'Produto não encontrado' });
      return;
    }

    // Get related products from the same category
    const related = database.products
      .filter((p) => p.id !== product.id && p.categoryId === product.categoryId && p.status === 'ativo')
      .slice(0, 4);

    res.json({ product, related });
  });

  app.post('/api/products/:id/view', (req: Request, res: Response) => {
    const database = db.getData();
    const { id } = req.params;
    const product = database.products.find((p) => p.id === id);
    if (product) {
      product.views = (product.views || 0) + 1;
      db.save();
    }
    res.json({ success: true });
  });

  app.post('/api/products', requireAdmin, (req: Request, res: Response) => {
    const database = db.getData();
    const {
      name,
      slug,
      description,
      price,
      promoPrice,
      category,
      categoryId,
      images,
      sizes,
      colors,
      variants,
      sku,
      status,
      isFeatured,
      isNewArrival,
      isBestSeller,
    } = req.body;

    const numericPrice = Number(price);
    if (!String(name || '').trim() || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      res.status(400).json({ error: 'Informe o nome e um preço válido maior que zero.' });
      return;
    }
    if (promoPrice !== undefined && promoPrice !== null && promoPrice !== '') {
      const numericPromo = Number(promoPrice);
      if (!Number.isFinite(numericPromo) || numericPromo <= 0 || numericPromo >= numericPrice) {
        res.status(400).json({ error: 'O preço promocional deve ser maior que zero e menor que o preço normal.' });
        return;
      }
    }

    // Calculate total stock from variants or default
    const calculatedVariants = Array.isArray(variants) ? variants : [];
    const totalStock = calculatedVariants.length > 0
      ? calculatedVariants.reduce((sum: number, v: { stock: number }) => sum + (Number(v.stock) || 0), 0)
      : Math.max(0, Number(req.body.stock) || 0);

    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: description || '',
      price: Number(price),
      promoPrice: promoPrice ? Number(promoPrice) : undefined,
      category: category || 'Geral',
      categoryId: categoryId || 'cat_geral',
      images: Array.isArray(images) ? images.filter((image: unknown) => typeof image === 'string' && image.trim()) : [],
      sizes: Array.isArray(sizes) ? sizes : [],
      colors: Array.isArray(colors) ? colors : [],
      variants: calculatedVariants,
      stock: totalStock,
      stockTracked: req.body.stockTracked !== false,
      sku: sku || `BG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      status: status || 'rascunho',
      isFeatured: Boolean(isFeatured),
      isNewArrival: Boolean(isNewArrival),
      isBestSeller: Boolean(isBestSeller),
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    database.products.unshift(newProduct);
    db.save();
    res.status(201).json(newProduct);
  });

  app.put('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
    const database = db.getData();
    const { id } = req.params;
    const index = database.products.findIndex((p) => p.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Produto não encontrado' });
      return;
    }

    const current = database.products[index];
    const nextPrice = req.body.price !== undefined ? Number(req.body.price) : current.price;
    const nextPromoPrice = req.body.promoPrice !== undefined ? Number(req.body.promoPrice) : current.promoPrice;
    if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
      res.status(400).json({ error: 'O preço deve ser maior que zero.' });
      return;
    }
    if (req.body.promoPrice !== undefined && req.body.promoPrice !== '' &&
        (typeof nextPromoPrice !== 'number' || !Number.isFinite(nextPromoPrice) || nextPromoPrice <= 0 || nextPromoPrice >= nextPrice)) {
      res.status(400).json({ error: 'O preço promocional deve ser menor que o preço normal.' });
      return;
    }
    const updatedVariants = req.body.variants !== undefined ? req.body.variants : current.variants;
    const totalStock = Array.isArray(updatedVariants) && updatedVariants.length > 0
      ? updatedVariants.reduce((sum: number, v: { stock: number }) => sum + (Number(v.stock) || 0), 0)
      : (req.body.stock !== undefined ? Number(req.body.stock) : current.stock);

    database.products[index] = {
      ...current,
      ...req.body,
      variants: updatedVariants,
      stock: totalStock,
      stockTracked: req.body.stockTracked !== undefined ? Boolean(req.body.stockTracked) : (current.stockTracked !== false),
      price: req.body.price !== undefined ? Number(req.body.price) : current.price,
      promoPrice: req.body.promoPrice ? Number(req.body.promoPrice) : undefined,
      id,
      updatedAt: new Date().toISOString(),
    };

    db.save();
    res.json(database.products[index]);
  });

  app.delete('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
    const database = db.getData();
    const { id } = req.params;
    database.products = database.products.filter((p) => p.id !== id);
    db.save();
    res.json({ success: true, message: 'Produto excluído' });
  });

  /* ===================== BANNERS ===================== */
  app.get('/api/banners', (req: Request, res: Response) => {
    const database = db.getData();
    const isPublic = req.query.public === 'true';

    let banners = [...database.banners].sort((a, b) => a.order - b.order);
    if (isPublic) {
      banners = banners.filter((b) => b.isActive);
    }
    res.json(banners);
  });

  app.post('/api/banners', requireAdmin, (req: Request, res: Response) => {
    const database = db.getData();
    const { title, subtitle, badge, imageUrl, desktopImageUrl, mobileImageUrl, link, linkText, position, order, isActive } = req.body;
    const primaryImageUrl = String(desktopImageUrl || imageUrl || '').trim();
    if (!String(title || '').trim() || !primaryImageUrl) {
      res.status(400).json({ error: 'Informe um título e a URL da imagem do banner.' });
      return;
    }

    const newBanner: Banner = {
      id: `ban_${Date.now()}`,
      title: title || 'Novo Banner',
      subtitle: subtitle || '',
      badge,
      imageUrl: primaryImageUrl,
      desktopImageUrl: primaryImageUrl,
      ...(String(mobileImageUrl || '').trim() ? { mobileImageUrl: String(mobileImageUrl).trim() } : {}),
      link: link || '/',
      linkText: linkText || 'Ver Coleção',
      position: position || 'hero',
      order: Number(order) || database.banners.length + 1,
      isActive: isActive !== false,
    };

    database.banners.push(newBanner);
    db.save();
    res.status(201).json(newBanner);
  });

  app.put('/api/banners/:id', requireAdmin, (req: Request, res: Response) => {
    const database = db.getData();
    const { id } = req.params;
    const index = database.banners.findIndex((b) => b.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Banner não encontrado' });
      return;
    }

    database.banners[index] = {
      ...database.banners[index],
      ...req.body,
      id,
    };

    db.save();
    res.json(database.banners[index]);
  });

  app.delete('/api/banners/:id', requireAdmin, (req: Request, res: Response) => {
    const database = db.getData();
    const { id } = req.params;
    database.banners = database.banners.filter((b) => b.id !== id);
    db.save();
    res.json({ success: true, message: 'Banner excluído' });
  });

  /* ===================== REVIEWS ===================== */
  app.get('/api/reviews', (req: Request, res: Response) => {
    const database = db.getData();
    const { productId } = req.query;

    // Public route: return only reviews approved by the store administrator.
    let reviews = database.reviews.filter((r) => r.isApproved);
    if (productId) {
      reviews = reviews.filter((r) => r.productId === productId);
    }

    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(reviews);
  });

  app.post('/api/reviews', (req: Request, res: Response) => {
    const database = db.getData();
    const { productId, authorName, rating, comment } = req.body;

    const numericRating = Number(rating);
    if (!String(authorName || '').trim() || !String(comment || '').trim() ||
        !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      res.status(400).json({ error: 'Informe nome, comentário e uma nota de 1 a 5.' });
      return;
    }

    let prodName: string | undefined;
    if (productId) {
      const prod = database.products.find((p) => p.id === productId);
      if (prod) prodName = prod.name;
    }

    const newReview: Review = {
      id: `rev_${Date.now()}`,
      productId,
      productName: prodName,
      authorName,
      rating: numericRating,
      comment,
      isApproved: false, // Customer submissions must be approved by the store administrator
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    database.reviews.unshift(newReview);
    db.save();
    res.status(201).json(newReview);
  });

  app.put('/api/reviews/:id', requireAdmin, (req: Request, res: Response) => {
    const database = db.getData();
    const { id } = req.params;
    const index = database.reviews.findIndex((r) => r.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Avaliação não encontrada' });
      return;
    }

    database.reviews[index] = {
      ...database.reviews[index],
      ...req.body,
      id,
    };

    db.save();
    res.json(database.reviews[index]);
  });

  app.delete('/api/reviews/:id', requireAdmin, (req: Request, res: Response) => {
    const database = db.getData();
    const { id } = req.params;
    database.reviews = database.reviews.filter((r) => r.id !== id);
    db.save();
    res.json({ success: true, message: 'Avaliação excluída' });
  });

  /* ===================== ORDERS / PURCHASE INTENTS ===================== */
  app.get('/api/orders', requireAdmin, (_req: Request, res: Response) => {
    const database = db.getData();
    const orders = [...database.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json(orders);
  });

  app.post('/api/orders', (req: Request, res: Response) => {
    const database = db.getData();
    const { customerName, customerPhone, customerCity, items, notes } = req.body;

    if (!String(customerName || '').trim() || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Informe seu nome e adicione pelo menos um produto.' });
      return;
    }

    const validatedItems: OrderItem[] = [];
    for (const item of items) {
      const product = database.products.find((entry) => entry.id === item.productId && entry.status === 'ativo');
      const quantity = Number(item.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1) {
        res.status(400).json({ error: 'Um dos produtos não está mais disponível. Atualize a sacola e tente novamente.' });
        return;
      }
      const variant = product.variants?.find((entry) => entry.size === item.size && entry.color === item.color);
      if (product.stockTracked !== false && product.variants?.length && (!variant || variant.stock < quantity)) {
        res.status(409).json({ error: `Estoque insuficiente para ${product.name} (${item.size} / ${item.color}).` });
        return;
      }
      if (product.stockTracked !== false && !product.variants?.length && product.stock < quantity) {
        res.status(409).json({ error: `Estoque insuficiente para ${product.name}.` });
        return;
      }
      const unitPrice = product.promoPrice && product.promoPrice < product.price ? product.promoPrice : product.price;
      validatedItems.push({
        productId: product.id,
        productName: product.name,
        size: String(item.size || ''),
        color: String(item.color || ''),
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
        imageUrl: product.images?.[0] || '',
        productUrl: `/produto/${product.slug}`,
      });
    }

    const subtotal = validatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const shipping = 0; // Freight is agreed with the store through WhatsApp.
    const total = subtotal + shipping;
    const orderId = `PED-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: OrderIntent = {
      id: orderId,
      customerName: String(customerName).trim(),
      customerPhone: String(customerPhone || '').trim(),
      customerCity: String(customerCity || '').trim(),
      items: validatedItems,
      subtotal,
      shipping,
      total,
      status: 'pendente',
      notes: String(notes || '').trim(),
      createdAt: new Date().toISOString(),
    };

    // This endpoint registers an inquiry, not a confirmed sale. Stock remains unchanged.
    database.orders.unshift(newOrder);
    db.save();
    res.status(201).json({ success: true, order: newOrder, message: 'Intenção de compra registrada.' });
  });

  app.put('/api/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
    const database = db.getData();
    const { id } = req.params;
    const { status, notes } = req.body;

    const order = database.orders.find((o) => o.id === id);
    if (!order) {
      res.status(404).json({ error: 'Pedido não encontrado' });
      return;
    }

    if (status) order.status = status;
    if (notes !== undefined) order.notes = notes;

    db.save();
    res.json(order);
  });

  app.delete('/api/orders/:id', requireAdmin, (req: Request, res: Response) => {
    const database = db.getData();
    const { id } = req.params;
    database.orders = database.orders.filter((o) => o.id !== id);
    db.save();
    res.json({ success: true });
  });

  /* ===================== DASHBOARD STATS ===================== */
  app.get('/api/admin/stats', requireAdmin, (_req: Request, res: Response) => {
    const database = db.getData();
    const totalProducts = database.products.length;
    const activeProducts = database.products.filter((p) => p.status === 'ativo').length;
    const outOfStockProducts = database.products.filter((p) => p.stockTracked !== false && p.stock <= 0).length;
    const lowStockProducts = database.products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const totalCategories = database.categories.length;
    const totalOrders = database.orders.length;
    const totalOrdersValue = database.orders.reduce((acc, curr) => acc + curr.total, 0);

    const mostViewedProducts = [...database.products]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map((p) => ({ id: p.id, name: p.name, views: p.views || 0, stock: p.stock, price: p.promoPrice || p.price }));

    const pendingOrders = database.orders.filter((o) => o.status === 'pendente').length;

    res.json({
      totalProducts,
      activeProducts,
      outOfStockProducts,
      lowStockProducts,
      totalCategories,
      totalOrders,
      totalOrdersValue,
      pendingOrders,
      mostViewedProducts,
      recentOrders: database.orders.slice(0, 5),
    });
  });

  /* ===================== GOOGLE DRIVE SYNC ===================== */
  app.post('/api/admin/sync-drive', requireAdmin, async (req: Request, res: Response) => {
    const { folderId, apiKey } = req.body;
    if (!folderId) {
      res.status(400).json({ error: 'ID da pasta do Google Drive é obrigatório' });
      return;
    }

    const key = apiKey || process.env.GEMINI_API_KEY || '';
    let fetchedFiles: Array<{ id: string; name: string; webViewLink?: string }> = [];

    try {
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        `'${folderId}' in parents and mimeType contains 'image/'`
      )}&key=${key}&fields=files(id,name,mimeType,webViewLink)`;

      const driveRes = await fetch(url);
      if (driveRes.ok) {
        const data = await driveRes.json();
        if (data.files && Array.isArray(data.files)) {
          fetchedFiles = data.files;
        }
      }
    } catch (err) {
      console.warn('Drive API direct fetch warning, using robust fallback import:', err);
    }

    const database = db.getData();

    const filesToProcess = fetchedFiles;
    if (filesToProcess.length === 0) {
      res.status(422).json({ error: 'Nenhuma fotografia real foi encontrada na pasta informada. Nenhum produto de demonstração foi criado.' });
      return;
    }

    let productsCreated = 0;
    let bannersUpdated = 0;

    // Ensure Calçados category exists
    if (!database.categories.some(c => c.slug === 'calcados' || c.name === 'Calçados')) {
      database.categories.push({
        id: 'cat_calcados',
        name: 'Calçados',
        slug: 'calcados',
        order: 9,
        isActive: true,
        imageUrl: '/assets/aistudio/image_eb20ad27.png',
        description: 'Saltos, sandálias e calçados finos para mulheres elegantes',
      });
    }

    // Use Gemini AI to analyze and intelligently organize files
    let aiGroupedItems: Array<{ name: string; category: string; description: string; colors: string[]; images: string[] }> = [];
    try {
      const ai = new GoogleGenAI();
      const prompt = `You are an expert fashion AI curator for the women's boutique "Bem Garota".
Analyze the following Google Drive image filenames: ${JSON.stringify(filesToProcess.map(f => f.name))}.
Task:
1. Group variant photos of the same item (e.g. dress in different colors like rosé and black) into a single product with multiple colors.
2. Classify each item into the correct category: Vestidos, Conjuntos, Blusas, Calças, Saias, Camisetas, Calçados (for shoes, tacão, sandália, scarpin), or Acessórios.
3. Write a professional boutique description in Portuguese for each.
4. Return ONLY a valid JSON array of objects with keys: name (string), category (string), description (string), colors (array of strings). Do not include markdown code blocks.`;

      const aiRes = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const responseText = (aiRes.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(responseText);
      if (Array.isArray(parsed)) {
        aiGroupedItems = parsed;
      }
    } catch (aiErr) {
      console.warn('AI smart analysis fallback, using rule-based grouping:', aiErr);
    }

    // If AI grouping returned items, use them; otherwise process files directly with smart rules
    if (aiGroupedItems.length > 0) {
      aiGroupedItems.forEach((item, idx) => {
        const fileMatch = filesToProcess[idx % filesToProcess.length];
        const imageUrl = fileMatch?.webViewLink || `https://lh3.googleusercontent.com/d/${fileMatch?.id || 'drive_img_' + idx}`;

        let catId = 'cat_vestidos';
        let catName = item.category || 'Vestidos';
        const catLower = catName.toLowerCase();

        if (catLower.includes('conjunto')) { catId = 'cat_conjuntos'; catName = 'Conjuntos'; }
        else if (catLower.includes('blusa')) { catId = 'cat_blusas'; catName = 'Blusas'; }
        else if (catLower.includes('calça') || catLower.includes('calca')) { catId = 'cat_calcas'; catName = 'Calças'; }
        else if (catLower.includes('saia')) { catId = 'cat_saias'; catName = 'Saias'; }
        else if (catLower.includes('camiseta')) { catId = 'cat_camisetas'; catName = 'Camisetas'; }
        else if (catLower.includes('calçado') || catLower.includes('calcado') || catLower.includes('sapato') || catLower.includes('sandalia')) { catId = 'cat_calcados'; catName = 'Calçados'; }
        else if (catLower.includes('acessório') || catLower.includes('bolsa')) { catId = 'cat_acessorios'; catName = 'Acessórios'; }

        const newProduct = {
          id: `prod_ai_drive_${Date.now()}_${idx}`,
          name: item.name,
          slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          description: item.description || 'Peça exclusiva sincronizada via Google Drive com curadoria IA.',
          price: 0.00,
          promoPrice: undefined,
          category: catName,
          categoryId: catId,
          images: [imageUrl, '/assets/aistudio/image_eb20ad27.png'],
          sizes: ['P', 'M', 'G', 'GG'],
          colors: item.colors || ['Rosé', 'Nude', 'Off-White'],
          stock: 20,
          variants: [
            { size: 'P', color: item.colors?.[0] || 'Padrão', stock: 5 },
            { size: 'M', color: item.colors?.[0] || 'Padrão', stock: 5 },
            { size: 'G', color: item.colors?.[0] || 'Padrão', stock: 5 },
            { size: 'GG', color: item.colors?.[0] || 'Padrão', stock: 5 },
          ],
          sku: `AI-DRV-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'ativo' as const,
          isFeatured: true,
          isNewArrival: true,
          isBestSeller: false,
          views: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        database.products.unshift(newProduct);
        productsCreated++;
      });
    } else {
      // Fallback rule-based processing
      for (const file of filesToProcess) {
        const fileNameLower = file.name.toLowerCase();
        let catId = 'cat_vestidos';
        let catName = 'Vestidos';

        if (fileNameLower.includes('conjunto') || fileNameLower.includes('blazer')) {
          catId = 'cat_conjuntos'; catName = 'Conjuntos';
        } else if (fileNameLower.includes('sapato') || fileNameLower.includes('sandalia') || fileNameLower.includes('salto') || fileNameLower.includes('calcado')) {
          catId = 'cat_calcados'; catName = 'Calçados';
        } else if (fileNameLower.includes('blusa') || fileNameLower.includes('camisa')) {
          catId = 'cat_blusas'; catName = 'Blusas';
        } else if (fileNameLower.includes('calca')) {
          catId = 'cat_calcas'; catName = 'Calças';
        } else if (fileNameLower.includes('saia')) {
          catId = 'cat_saias'; catName = 'Saias';
        } else if (fileNameLower.includes('bolsa') || fileNameLower.includes('acessorio')) {
          catId = 'cat_acessorios'; catName = 'Acessórios';
        }

        const imageUrl = file.webViewLink || `https://lh3.googleusercontent.com/d/${file.id}`;
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-_]/g, ' ');

        const newProduct = {
          id: `prod_drive_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
          slug: cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          description: `Peça sincronizada da pasta Google Drive (${folderId}). Valor zerado para ajuste.`,
          price: 0.00,
          promoPrice: undefined,
          category: catName,
          categoryId: catId,
          images: [imageUrl, '/assets/aistudio/image_eb20ad27.png'],
          sizes: ['P', 'M', 'G', 'GG'],
          colors: ['Rosé', 'Nude', 'Off-White'],
          stock: 20,
          variants: [
            { size: 'P', color: 'Rosé', stock: 5 },
            { size: 'M', color: 'Rosé', stock: 5 },
          ],
          sku: `DRV-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'ativo' as const,
          isFeatured: true,
          isNewArrival: true,
          isBestSeller: false,
          views: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        database.products.unshift(newProduct);
        productsCreated++;
      }
    }

    if (filesToProcess.length > 0 && database.banners.length > 0) {
      database.banners[0].imageUrl = filesToProcess[0].webViewLink || `https://lh3.googleusercontent.com/d/${filesToProcess[0].id}`;
      bannersUpdated++;
    }

    db.save();

    res.json({
      success: true,
      message: `Sincronização com IA concluída! ${productsCreated} produtos analisados, categorizados (com Calçados automáticos) e zerados (R$ 0,00).`,
      stats: {
        filesCount: filesToProcess.length,
        productsCreated,
        bannersUpdated,
        folderId,
      },
    });
  });

  /* ===================== DEMO RESET / CLEAR ===================== */
  app.post('/api/admin/reset-demo', requireAdmin, (_req: Request, res: Response) => {
    const reset = db.resetToDefaults();
    res.json({ success: true, message: 'Configuração inicial restaurada. Os cadastros da loja foram limpos.', reset });
  });

  app.post('/api/admin/clear-store', requireAdmin, (_req: Request, res: Response) => {
    const cleared = db.clearStore();
    res.json({ success: true, message: 'Loja limpa com sucesso!', cleared });
  });

  /* ===================== STATIC & VITE MIDDLEWARE ===================== */
  // Uploaded product photos remain available after deployment and subsequent uploads.
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'public', 'uploads')));
  // Statically serve videos, products and general public assets with HTTP 206 Range support for video streaming
  app.use('/videos', express.static(path.resolve(process.cwd(), 'public', 'videos')));
  app.use('/products', express.static(path.resolve(process.cwd(), 'public', 'products')));
  app.use(express.static(path.resolve(process.cwd(), 'public')));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const buildDirectory = path.resolve(__dirname, 'dist');
    app.use(express.static(buildDirectory));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(buildDirectory, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🌸 Bem Garota Boutique Server rodando em http://localhost:${PORT}`);
    });
  }
}

startServer().catch((err) => {
  console.error('Falha ao iniciar o servidor:', err);
  process.exit(1);
});

export default app;
