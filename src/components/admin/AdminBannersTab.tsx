import React, { useState } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon, Eye, X } from 'lucide-react';
import { Banner } from '../../types/store';
import { useAuth } from '../../context/AuthContext';

interface AdminBannersTabProps {
  banners: Banner[];
  onRefresh: () => void;
}

export const AdminBannersTab: React.FC<AdminBannersTabProps> = ({ banners, onRefresh }) => {
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [mobileImageUrl, setMobileImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [linkText, setLinkText] = useState('Ver Coleção');
  const [position, setPosition] = useState<'hero' | 'secondary' | 'promo'>('hero');
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<'desktop' | 'mobile' | null>(null);
  const [formError, setFormError] = useState('');

  const openNewModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setBadge('');
    setImageUrl('');
    setMobileImageUrl('');
    setFormError('');
    setLink('/');
    setLinkText('Ver coleção');
    setPosition('hero');
    setOrder(banners.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle);
    setBadge(b.badge || '');
    setImageUrl(b.desktopImageUrl || b.imageUrl);
    setMobileImageUrl(b.mobileImageUrl || '');
    setFormError('');
    setLink(b.link);
    setLinkText(b.linkText);
    setPosition(b.position);
    setOrder(b.order);
    setIsActive(b.isActive);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este banner?')) return;
    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (b: Banner) => {
    try {
      const res = await fetch(`/api/banners/${b.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !b.isActive }),
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl.trim()) {
      setFormError('Informe o título e envie a imagem para computador.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title,
      subtitle,
      badge,
      imageUrl: imageUrl.trim(),
      desktopImageUrl: imageUrl.trim(),
      mobileImageUrl: mobileImageUrl.trim() || undefined,
      link,
      linkText,
      position,
      order: Number(order),
      isActive,
    };

    try {
      const url = editingBanner ? `/api/banners/${editingBanner.id}` : '/api/banners';
      const method = editingBanner ? 'PUT' : 'POST';

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
      } else {
        const result = await res.json().catch(() => ({}));
        setFormError(result.error || 'Não foi possível salvar o banner.');
      }
    } catch (err) {
      console.error(err);
      setFormError('Falha de conexão ao salvar o banner.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBannerImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, target: 'desktop' | 'mobile') => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
      setFormError('Use uma imagem JPG, PNG ou WEBP de até 8 MB.');
      return;
    }

    setFormError('');
    setUploadingImage(target);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
        reader.readAsDataURL(file);
      });
      const response = await fetch('/api/admin/banner-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mimeType: file.type, dataBase64: dataUrl.split(',')[1] }),
      });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error || 'Não foi possível enviar a imagem.');
      if (target === 'desktop') setImageUrl(result.url);
      else setMobileImageUrl(result.url);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível enviar a imagem.');
    } finally {
      setUploadingImage(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200">
        <div>
          <h3 className="font-semibold text-stone-900 text-sm">Banners & Destaques Visuais</h3>
          <p className="text-xs text-stone-500">
            Gerencie o carrossel da tela inicial e os banners promocionais da loja.
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary,#B76E79)] text-white text-xs font-semibold rounded-lg hover:opacity-90 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Banner</span>
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-stone-300 p-8 sm:p-12 text-center">
          <ImageIcon className="w-9 h-9 mx-auto text-stone-300" />
          <h4 className="font-semibold text-stone-800 mt-3">Nenhum banner cadastrado</h4>
          <p className="text-xs text-stone-500 mt-1">Adicione um banner quando tiver uma campanha ou imagem pronta.</p>
        </div>
      ) : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {banners.map((ban) => (
          <div
            key={ban.id}
            className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between"
          >
            {/* Banner Thumbnail */}
            <div className="relative aspect-[16/9] w-full bg-stone-100 overflow-hidden">
              <img
                src={ban.desktopImageUrl || ban.imageUrl}
                alt={ban.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute top-2 left-2 flex gap-1">
                <span className="bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {ban.position}
                </span>
                <span className="bg-white/80 text-stone-800 text-[10px] font-mono px-2 py-0.5 rounded-full">
                  Ordem: #{ban.order}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between text-xs">
              <div>
                {ban.badge && (
                  <span className="text-[10px] uppercase font-bold text-[var(--color-primary)] block">
                    {ban.badge}
                  </span>
                )}
                <h4 className="font-semibold text-stone-900 text-sm">{ban.title}</h4>
                <p className="text-stone-500 mt-1 line-clamp-2">{ban.subtitle}</p>
                <span className="text-stone-400 text-[11px] block mt-1 font-mono">Link: {ban.link}</span>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggle(ban)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    ban.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {ban.isActive ? 'Ativo na Loja' : 'Oculto'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(ban)}
                    className="p-1.5 text-stone-600 hover:text-[var(--color-primary)] hover:bg-stone-50 rounded"
                    title="Editar"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(ban.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-50 rounded"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>}

      {/* Edit / New Modal - Responsive for Mobile & Desktop */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex sm:items-center sm:justify-center p-0 sm:p-4">
          <div className="bg-white w-full h-[100dvh] sm:h-auto sm:max-h-[90dvh] sm:max-w-lg sm:rounded-xl border-0 sm:border border-stone-200 p-4 sm:p-6 shadow-2xl overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-boutique text-xl font-bold text-stone-900">
                {editingBanner ? 'Editar Banner' : 'Novo Banner'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Título Principal *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Elegância que Transcende"
                  className="w-full p-2 border border-stone-300 rounded-md"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Subtítulo / Descrição</label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ex: Descubra a nova Coleção Rosé..."
                  className="w-full p-2 border border-stone-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Kicker / Selo do Topo</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Ex: EXCLUSIVIDADE"
                    className="w-full p-2 border border-stone-300 rounded-md uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Posição</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as any)}
                    className="w-full p-2 border border-stone-300 rounded-md bg-white"
                  >
                    <option value="hero">Carrossel Principal (Hero)</option>
                    <option value="secondary">Banner Secundário</option>
                    <option value="promo">Faixa Promocional</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1 rounded-lg border border-stone-200 p-3">
                  <label className="font-semibold text-stone-700">Imagem para computador *</label>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleBannerImageUpload(e, 'desktop')} className="block w-full text-[11px]" />
                  <p className="text-[10px] text-stone-500">JPG, PNG ou WEBP • até 8 MB</p>
                  {uploadingImage === 'desktop' && <p className="text-[11px] text-stone-500">Enviando imagem...</p>}
                  {imageUrl && <img src={imageUrl} alt="Prévia do banner para computador" className="w-full aspect-video object-cover rounded-md" />}
                </div>
                <div className="space-y-1 rounded-lg border border-stone-200 p-3">
                  <label className="font-semibold text-stone-700">Imagem para celular</label>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleBannerImageUpload(e, 'mobile')} className="block w-full text-[11px]" />
                  <p className="text-[10px] text-stone-500">Opcional; sem ela, usa a imagem de computador.</p>
                  {uploadingImage === 'mobile' && <p className="text-[11px] text-stone-500">Enviando imagem...</p>}
                  {mobileImageUrl && <img src={mobileImageUrl} alt="Prévia do banner para celular" className="w-full aspect-video object-cover rounded-md" />}
                </div>
              </div>
              {formError && <p role="alert" className="rounded-md bg-red-50 p-2 text-red-700">{formError}</p>}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Link de Destino</label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="/categoria/vestidos"
                    className="w-full p-2 border border-stone-300 rounded-md font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Texto do Botão</label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Ex: Conhecer Coleção"
                    className="w-full p-2 border border-stone-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="space-y-1 flex-1">
                  <label className="font-semibold text-stone-700">Ordem</label>
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
                    <span className="font-semibold text-stone-700">Banner Ativo</span>
                  </label>
                </div>
              </div>

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
                  disabled={isSubmitting || uploadingImage !== null}
                  className="px-4 py-1.5 bg-[var(--color-primary,#B76E79)] text-white font-semibold rounded-md hover:opacity-90 disabled:opacity-50"
                >
                  Salvar Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
