import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Eye, EyeOff, Save, Check, LayoutGrid } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { HomepageSection } from '../../types/store';

export const AdminHomepageTab: React.FC = () => {
  const { settings, updateSettings } = useTheme();

  const [sections, setSections] = useState<HomepageSection[]>(() => {
    return settings?.homepageSections || [
      { id: 'hero_banner', name: 'Banner Principal em Destaque', enabled: true, order: 1 },
      { id: 'benefits_bar', name: 'Diferenciais & Benefícios da Loja', enabled: true, order: 2 },
      { id: 'featured_categories', name: 'Navegação por Categorias', enabled: true, order: 3 },
      { id: 'new_arrivals', name: 'Lançamentos & Novidades', enabled: true, order: 4 },
      { id: 'promo_banner', name: 'Banner de Coleção Especial', enabled: true, order: 5 },
      { id: 'best_sellers', name: 'Mais Vendidos da Boutique', enabled: true, order: 6 },
      { id: 'offers', name: 'Ofertas Selecionadas', enabled: true, order: 7 },
      { id: 'reviews', name: 'Depoimentos de Clientes', enabled: true, order: 8 },
      { id: 'instagram_feed', name: 'Feed do Instagram & Estilo', enabled: true, order: 9 },
    ];
  });

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleToggle = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= sections.length) return;

    const list = [...sections];
    const [moved] = list.splice(index, 1);
    list.splice(newIdx, 0, moved);

    // Update order numbering
    const updated = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    setSections(updated);
  };

  const handleTitleChange = (id: string, newTitle: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const ok = await updateSettings({ homepageSections: sections });
    setIsSaving(false);
    if (ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-[var(--color-primary)]" />
            <h3 className="font-semibold text-stone-900 text-sm">
              Gerenciamento da Página Inicial
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Ative, oculte, renomeie e reordene os blocos de conteúdo da vitrine principal.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primary,#B76E79)] text-white text-xs font-semibold rounded-lg hover:opacity-90 shadow-xs disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Estrutura da página inicial atualizada com sucesso!</span>
        </div>
      )}

      {/* Sections Table / Reordering list */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs divide-y divide-stone-100 text-xs">
        {sections.map((sec, idx) => (
          <div
            key={sec.id}
            className={`p-4 flex items-center justify-between gap-4 transition-colors ${
              sec.enabled ? 'bg-white' : 'bg-stone-50/80 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Order number and up/down buttons */}
              <div className="flex items-center gap-1 font-mono font-bold text-stone-700 shrink-0">
                <span className="w-6 text-center">#{idx + 1}</span>
                <button
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 hover:text-[var(--color-primary)] disabled:opacity-20"
                  title="Mover para cima"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === sections.length - 1}
                  className="p-1 hover:text-[var(--color-primary)] disabled:opacity-20"
                  title="Mover para baixo"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Section Details */}
              <div className="flex-1 min-w-0">
                <span className="font-bold text-stone-900 block truncate">{sec.name}</span>
                <input
                  type="text"
                  value={sec.title || ''}
                  onChange={(e) => handleTitleChange(sec.id, e.target.value)}
                  placeholder={`Título personalizado para ${sec.name} (opcional)`}
                  className="mt-1 w-full max-w-md p-1.5 border border-stone-200 rounded text-xs text-stone-700 bg-stone-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Toggle Status */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => handleToggle(sec.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 text-xs transition-colors ${
                  sec.enabled
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-stone-200 text-stone-600'
                }`}
              >
                {sec.enabled ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visível</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Oculta</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
