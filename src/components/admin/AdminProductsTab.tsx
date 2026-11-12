import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Star, Eye, Tag, Check, X, Image as ImageIcon } from 'lucide-react';
import { Product, Category, ProductVariant } from '../../types/store';
import { useAuth } from '../../context/AuthContext';

interface AdminProductsTabProps {
  products: Product[];
  categories: Category[];
  onRefresh: () => void;
}

export const AdminProductsTab: React.FC<AdminProductsTabProps> = ({
  products,
  categories,
  onRefresh,
}) => {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [promoPrice, setPromoPrice] = useState<string>('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [imagesInput, setImagesInput] = useState('');
  const [sizesInput, setSizesInput] = useState('PP, P, M, G, GG');
  const [colorsInput, setColorsInput] = useState('Rosé, Nude, Off-White');
  const [stock, setStock] = useState<number>(10);
  const [sku, setSku] = useState('');
  const [status, setStatus] = useState<'ativo' | 'inativo' | 'rascunho'>('ativo');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const openNewModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice(0);
    setPromoPrice('');
    const defaultCat = categories.find((category) => category.id === 'cat_vestidos') || categories[0] || { id: 'cat_vestidos', name: 'Vestidos' };
    setCategoryId(defaultCat.id);
    setCategoryName(defaultCat.name);
    setImagesInput('');
    setSizesInput('');
    setColorsInput('');
    setStock(0);
    setSku(`BG-${Math.floor(100 + Math.random() * 900)}`);
    setStatus('rascunho');
    setIsFeatured(false);
    setIsNewArrival(false);
    setIsBestSeller(false);
    setVariants([]);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price);
    setPromoPrice(p.promoPrice ? String(p.promoPrice) : '');
    setCategoryId(p.categoryId);
    setCategoryName(p.category);
    setImagesInput(p.images.join('\n'));
    setSizesInput(p.sizes.join(', '));
    setColorsInput(p.colors.join(', '));
    setStock(p.stock);
    setSku(p.sku);
    setStatus(p.status);
    setIsFeatured(p.isFeatured);
    setIsNewArrival(p.isNewArrival);
    setIsBestSeller(p.isBestSeller);
    setVariants(p.variants || []);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'ativo' ? 'inativo' : 'ativo';
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setIsUploadingImages(true);

    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
          throw new Error('Use imagens JPG, PNG ou WEBP de até 8 MB cada.');
        }

        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => reject(new Error('Não foi possível ler uma das imagens.'));
          reader.readAsDataURL(file);
        });
        const dataBase64 = dataUrl.split(',')[1];
        const response = await fetch('/api/admin/product-images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ mimeType: file.type, dataBase64 }),
        });
        const result = await response.json();
        if (!response.ok || !result.url) throw new Error(result.error || 'Falha ao enviar uma imagem.');
        uploadedUrls.push(result.url);
      }

      setImagesInput((current) => [...current.split('\n').map((item) => item.trim()).filter(Boolean), ...uploadedUrls].join('\n'));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Não foi possível enviar as imagens.');
    } finally {
      setIsUploadingImages(false);
      event.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    setIsSubmitting(true);
    const parsedImages = imagesInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedSizes = sizesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedColors = colorsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Build or update variant stock list
    const generatedVariants: ProductVariant[] = [];
    if (parsedSizes.length > 0 && parsedColors.length > 0) {
      const perVariantStock = Math.max(1, Math.floor(stock / (parsedSizes.length * parsedColors.length)));
      parsedSizes.forEach((sz) => {
        parsedColors.forEach((cl) => {
          const existing = variants.find((v) => v.size === sz && v.color === cl);
          generatedVariants.push({
            size: sz,
            color: cl,
            stock: existing ? existing.stock : perVariantStock,
          });
        });
      });
    }

    const payload = {
      name,
      description,
      price: Number(price),
      promoPrice: promoPrice ? Number(promoPrice) : undefined,
      categoryId,
      category: categoryName,
      images: parsedImages,
      sizes: parsedSizes,
      colors: parsedColors,
      stock: Number(stock),
      stockTracked: Number(stock) > 0 || (editingProduct ? editingProduct.stockTracked !== false : true),
      variants: generatedVariants,
      sku,
      status,
      isFeatured,
      isNewArrival,
      isBestSeller,
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter ? p.categoryId === categoryFilter || p.category === categoryFilter : true;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-5">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200">
        <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-3 min-w-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, SKU..."
              className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-lg text-xs bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto border border-stone-200 rounded-lg text-xs py-2 px-3 bg-stone-50 text-stone-700 focus:outline-none"
          >
            <option value="">Todas Categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary,#B76E79)] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Produto</span>
        </button>
      </div>

      {/* Products Table (Desktop / Tablet) */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        {filtered.length === 0 && (
          <div className="p-8 sm:p-12 text-center">
            <ImageIcon className="w-9 h-9 mx-auto text-stone-300" />
            <h4 className="font-semibold text-stone-800 mt-3">Nenhum produto cadastrado</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">Cadastre sua primeira peça para ela aparecer na vitrine da loja.</p>
            <button onClick={openNewModal} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold"><Plus className="w-4 h-4" /> Cadastrar primeiro produto</button>
          </div>
        )}
        {filtered.length > 0 && <>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Peça</th>
                <th className="py-3 px-3">Categoria</th>
                <th className="py-3 px-3">Preço / Promo</th>
                <th className="py-3 px-3">Estoque</th>
                <th className="py-3 px-3">Destaques</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.images[0] || '/assets/aistudio/image_eb20ad27.png'}
                        alt={prod.name}
                        className="w-10 h-12 rounded object-cover bg-stone-100 border border-stone-200 shrink-0"
                      />
                      <div>
                        <span className="font-semibold text-stone-900 block truncate max-w-xs">{prod.name}</span>
                        <span className="text-[10px] text-stone-400 font-mono">REF: {prod.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-stone-600">{prod.category}</td>
                  <td className="py-3 px-3 font-mono font-medium">
                    {prod.promoPrice ? (
                      <div>
                        <span className="text-emerald-700 font-bold block tabular-nums">
                          {prod.promoPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <span className="text-[10px] text-stone-400 line-through tabular-nums">
                          {prod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-stone-900 tabular-nums">
                        {prod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        prod.stockTracked === false
                          ? 'bg-slate-100 text-slate-600'
                          : prod.stock <= 0
                          ? 'bg-red-100 text-red-700'
                          : prod.stock <= 5
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {prod.stockTracked === false ? 'Não informado' : `${prod.stock} un.`}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 text-[10px]">
                      {prod.isFeatured && (
                        <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                          Destaque
                        </span>
                      )}
                      {prod.isNewArrival && (
                        <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200">
                          Novo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleToggleStatus(prod)}
                      className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                        prod.status === 'ativo'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {prod.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-1.5 text-stone-600 hover:text-[var(--color-primary)] hover:bg-stone-100 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Product Cards (Smartphone optimized) */}
        <div className="md:hidden divide-y divide-stone-100 space-y-3">
          {filtered.map((prod) => (
            <div key={prod.id} className="p-3.5 flex flex-col gap-2.5 bg-white rounded-xl border border-stone-100 shadow-xs">
              <div className="flex items-start gap-3">
                <img
                  src={prod.images[0] || '/assets/aistudio/image_eb20ad27.png'}
                  alt={prod.name}
                  className="w-14 h-18 rounded-lg object-cover bg-stone-100 border border-stone-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-primary)]">
                    {prod.category}
                  </span>
                  <h4 className="font-semibold text-stone-900 text-xs truncate">
                    {prod.name}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-bold text-stone-900 text-sm tabular-nums">
                      {(prod.promoPrice || prod.price).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                    {prod.promoPrice && (
                      <span className="text-[10px] text-stone-400 line-through tabular-nums">
                        {prod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px]">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        prod.stockTracked === false
                          ? 'bg-slate-100 text-slate-600'
                          : prod.stock <= 0
                          ? 'bg-red-100 text-red-700'
                          : prod.stock <= 5
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      Estoque: {prod.stockTracked === false ? 'Não informado' : `${prod.stock} un.`}
                    </span>
                    <span className="text-stone-400 font-mono text-[10px]">
                      REF: {prod.sku}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Card Action Bar */}
              <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
                <button
                  onClick={() => handleToggleStatus(prod)}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold ${
                    prod.status === 'ativo'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {prod.status === 'ativo' ? 'Ativo na Loja' : 'Oculto'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(prod)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded text-xs font-medium"
                  >
                    <Edit className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(prod.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div></>}
      </div>

      {/* Product Edit / Create Modal - Responsive for Mobile & Desktop */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex sm:items-center sm:justify-center p-0 sm:p-4">
          <div className="bg-white w-full h-[100dvh] sm:h-auto sm:max-h-[90dvh] sm:max-w-2xl sm:rounded-xl border-0 sm:border border-stone-200 p-4 sm:p-6 shadow-2xl overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-boutique text-xl sm:text-2xl font-bold text-stone-900">
                {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-stone-700">Nome da Peça *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Vestido Midi Acetinado"
                    className="w-full p-2.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Categoria *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setCategoryId(id);
                      const cat = categories.find((c) => c.id === id);
                      if (cat) setCategoryName(cat.name);
                    }}
                    className="w-full p-2.5 border border-stone-300 rounded-lg text-xs bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Código / Referência (SKU)</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full min-w-0 p-2.5 border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Preço Normal (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Preço Promocional (R$ opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={promoPrice}
                    onChange={(e) => setPromoPrice(e.target.value)}
                    placeholder="Deixe em branco se sem desconto"
                    className="w-full p-2.5 border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Tamanhos Disponíveis (separados por vírgula)</label>
                  <input
                    type="text"
                    value={sizesInput}
                    onChange={(e) => setSizesInput(e.target.value)}
                    placeholder="PP, P, M, G, GG"
                    className="w-full p-2.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Cores Disponíveis (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={colorsInput}
                    onChange={(e) => setColorsInput(e.target.value)}
                    placeholder="Rosé, Nude, Off-White"
                    className="w-full p-2.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Estoque Total</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full p-2.5 border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'ativo' | 'inativo' | 'rascunho')}
                    className="w-full p-2.5 border border-stone-300 rounded-lg text-xs bg-white"
                  >
                    <option value="ativo">Ativo (visível na loja)</option>
                    <option value="inativo">Inativo (oculto)</option>
                    <option value="rascunho">Rascunho</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Descrição Completa da Peça</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes de tecido, corte, caimento, fendas..."
                  className="w-full p-2.5 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              {/* Images */}
              <div className="space-y-2">
                <label className="font-semibold text-stone-700 block">Adicionar fotos à galeria</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageUpload}
                  disabled={isUploadingImages}
                  className="w-full text-xs file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 disabled:opacity-50"
                />
                <p className="text-[10px] text-stone-500">{isUploadingImages ? 'Enviando imagens...' : 'JPG, PNG ou WEBP • até 8 MB por imagem. As fotos enviadas são adicionadas à galeria abaixo.'}</p>
                <label className="font-semibold text-stone-700 block">
                  Fotos da galeria (remova uma linha para retirar a foto)
                </label>
                <textarea
                  rows={3}
                  value={imagesInput}
                  onChange={(e) => setImagesInput(e.target.value)}
                  placeholder="/products/catalogo-bem-garota/01_13/foto_01.jpeg&#10;/products/catalogo-bem-garota/01_13/foto_02.jpeg"
                  className="w-full p-2.5 border border-stone-300 rounded-lg text-xs font-mono"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-[var(--color-primary)]"
                  />
                  <span>Destacar na Página Inicial</span>
                </label>

                <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="rounded text-[var(--color-primary)]"
                  />
                  <span>Lançamento / Novidade</span>
                </label>

                <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="rounded text-[var(--color-primary)]"
                  />
                  <span>Mais Vendido</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[var(--color-primary,#B76E79)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
