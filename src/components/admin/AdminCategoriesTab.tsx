import React, { useState } from 'react';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Check, X } from 'lucide-react';
import { Category } from '../../types/store';
import { useAuth } from '../../context/AuthContext';

interface AdminCategoriesTabProps {
  categories: Category[];
  onRefresh: () => void;
}

export const AdminCategoriesTab: React.FC<AdminCategoriesTabProps> = ({
  categories,
  onRefresh,
}) => {
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [showInHeader, setShowInHeader] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openNewModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setOrder(categories.length + 1);
    setIsActive(true);
    setShowInHeader(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.imageUrl || '');
    setOrder(cat.order);
    setIsActive(cat.isActive);
    setShowInHeader(cat.showInHeader !== false);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleHeader = async (cat: Category) => {
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ showInHeader: cat.showInHeader === false }),
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveOrder = async (cat: Category, delta: number) => {
    const newOrder = Math.max(1, cat.order + delta);
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order: newOrder }),
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      order: Number(order),
      isActive,
      showInHeader,
    };

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

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

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200">
        <div>
          <h3 className="font-semibold text-stone-900 text-sm">Categorias da Loja</h3>
          <p className="text-xs text-stone-500">
            Organize os departamentos e menus visíveis para as clientes.
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary,#B76E79)] text-white text-xs font-semibold rounded-lg hover:opacity-90 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ordem</th>
                <th className="py-3 px-4">Nome da Categoria</th>
                <th className="py-3 px-4">Slug / Link</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Aba no cabeçalho</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sortedCategories.map((cat, idx) => (
                <tr key={cat.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 font-mono font-bold text-stone-700">
                      <span>#{cat.order}</span>
                      <button
                        onClick={() => handleMoveOrder(cat, -1)}
                        disabled={idx === 0}
                        className="p-1 hover:text-[var(--color-primary)] disabled:opacity-20"
                        title="Mover para cima"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(cat, 1)}
                        disabled={idx === sortedCategories.length - 1}
                        className="p-1 hover:text-[var(--color-primary)] disabled:opacity-20"
                        title="Mover para baixo"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-stone-900">{cat.name}</td>
                  <td className="py-3 px-4 font-mono text-stone-500">/categoria/{cat.slug}</td>
                  <td className="py-3 px-4 text-stone-600 truncate max-w-xs">{cat.description || '-'}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleActive(cat)}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${
                        cat.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                    >
                      {cat.isActive ? 'Ativa' : 'Oculta'}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleHeader(cat)}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${
                        cat.showInHeader !== false
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                    >
                      {cat.showInHeader !== false ? 'Exibida' : 'Oculta'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 text-stone-600 hover:text-[var(--color-primary)] hover:bg-stone-100 rounded"
                        title="Editar"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded"
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

        {/* Mobile Categories Cards */}
        <div className="md:hidden divide-y divide-stone-100">
          {sortedCategories.map((cat, idx) => (
            <div key={cat.id} className="p-3.5 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-bold">
                      #{cat.order}
                    </span>
                    <h4 className="font-semibold text-stone-900 text-xs">{cat.name}</h4>
                  </div>
                  <span className="text-[11px] font-mono text-stone-400 mt-0.5 block">
                    /categoria/{cat.slug}
                  </span>
                  {cat.description && (
                    <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{cat.description}</p>
                  )}
                </div>

                <button
                  onClick={() => handleToggleActive(cat)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                    cat.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {cat.isActive ? 'Ativa' : 'Oculta'}
                </button>
              </div>

              {/* Order buttons & Edit/Delete on Mobile */}
              <div className="flex items-center justify-between pt-1 border-t border-stone-50 text-xs">
                <div className="flex items-center gap-1 text-[11px] text-stone-600">
                  <span>Reordenar:</span>
                  <button
                    onClick={() => handleMoveOrder(cat, -1)}
                    disabled={idx === 0}
                    className="p-1 text-stone-700 hover:text-[var(--color-primary)] disabled:opacity-20"
                    title="Subir"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(cat, 1)}
                    disabled={idx === sortedCategories.length - 1}
                    className="p-1 text-stone-700 hover:text-[var(--color-primary)] disabled:opacity-20"
                    title="Descer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleToggleHeader(cat)}
                  className={`px-2 py-1 rounded text-[10px] font-semibold ${
                    cat.showInHeader !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {cat.showInHeader !== false ? 'Aba visível' : 'Aba oculta'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-stone-700 bg-stone-100 rounded text-xs font-medium"
                  >
                    <Edit className="w-3 h-3 text-[var(--color-primary)]" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1 text-stone-400 hover:text-red-600 rounded"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal - Responsive for Mobile & Desktop */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex sm:items-center sm:justify-center p-0 sm:p-4">
          <div className="bg-white w-full h-full sm:h-auto sm:max-w-md sm:rounded-xl border-0 sm:border border-stone-200 p-4 sm:p-6 shadow-2xl space-y-4 text-xs overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-boutique text-xl font-bold text-stone-900">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Nome da Categoria *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="Ex: Alfaiataria & Blazers"
                  className="w-full p-2 border border-stone-300 rounded-md"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Slug da URL</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ex: alfaiataria"
                  className="w-full p-2 border border-stone-300 rounded-md font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">URL da Foto da Categoria (para exibição na vitrine)</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/assets/images/foto.jpg"
                  className="w-full p-2 border border-stone-300 rounded-md font-mono"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="space-y-1 flex-1">
                  <label className="font-semibold text-stone-700">Ordem de Exibição</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full p-2 border border-stone-300 rounded-md"
                  />
                </div>

                <div className="space-y-1 flex-1 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-[var(--color-primary)]"
                    />
                    <span className="font-semibold text-stone-700">Categoria Ativa</span>
                  </label>
                </div>
              </div>

              <label className="flex items-start gap-2 rounded-md border border-stone-200 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInHeader}
                  onChange={(e) => setShowInHeader(e.target.checked)}
                  className="mt-0.5 rounded text-[var(--color-primary)]"
                />
                <span>
                  <span className="font-semibold text-stone-700 block">Mostrar aba no cabeçalho</span>
                  <span className="text-[10px] text-stone-500">A aba aparece na loja quando houver produtos ativos nesta categoria.</span>
                </span>
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-stone-200 rounded-md text-stone-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-[var(--color-primary,#B76E79)] text-white font-semibold rounded-md hover:opacity-90 disabled:opacity-50"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
