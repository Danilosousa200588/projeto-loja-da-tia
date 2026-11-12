import React, { useState, useEffect } from 'react';
import { Palette, Check, Eye, Save, RotateCcw, Sparkles } from 'lucide-react';
import { useTheme, DEFAULT_THEMES } from '../../context/ThemeContext';
import { ThemePreset, ThemeColors } from '../../types/store';

export const AdminThemesTab: React.FC = () => {
  const {
    activeTheme,
    themeSettings,
    previewTheme,
    isPreviewing,
    applyTheme,
    setPreview,
    resetPreview,
  } = useTheme();

  // Local draft state for customization
  const [selectedPreset, setSelectedPreset] = useState<ThemePreset>(activeTheme);
  const [customColors, setCustomColors] = useState<ThemeColors>(themeSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    setSelectedPreset(activeTheme);
    setCustomColors(themeSettings);
  }, [activeTheme, themeSettings]);

  const presetDefinitions: Array<{
    id: ThemePreset;
    name: string;
    description: string;
    palette: string[];
  }> = [
    {
      id: 'rose-boutique',
      name: 'Rosé Boutique (Tema Inicial)',
      description: 'Rosa-claro, nude, off-white, rosa queimado e detalhes dourados. Visual elegante e feminino.',
      palette: ['#FAF8F5', '#B76E79', '#F3E5E6', '#D4AF37', '#2D2522'],
    },
    {
      id: 'minimalista-elegante',
      name: 'Minimalista Elegante',
      description: 'Branco, bege, areia e marrom refinado. Estilo atemporal e silencioso.',
      palette: ['#F7F5F0', '#7B624D', '#D9CEBE', '#A38B74', '#252220'],
    },
    {
      id: 'dark-fashion',
      name: 'Dark Fashion',
      description: 'Preto nobre, grafite, cinza profundo e detalhes dourados acetinados.',
      palette: ['#121212', '#D4AF37', '#2E2E2E', '#F5D77F', '#F5F5F5'],
    },
    {
      id: 'pink-glamour',
      name: 'Pink Glamour',
      description: 'Rosa vivo, rosa intenso marcante e branco. Vibrante e moderno.',
      palette: ['#FFF5F7', '#E60067', '#FFD1DF', '#B8860B', '#291219'],
    },
  ];

  const handleSelectPreset = (preset: ThemePreset) => {
    setSelectedPreset(preset);
    const presetData = DEFAULT_THEMES[preset];
    setCustomColors({ ...presetData });
  };

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setCustomColors((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePreview = () => {
    setPreview(customColors);
  };

  const handleApply = async () => {
    setIsApplying(true);
    const success = await applyTheme(selectedPreset, customColors);
    setIsApplying(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[var(--color-primary,#B76E79)]" />
            <h3 className="font-boutique text-2xl font-bold text-stone-900">
              Aparência & Sistema de Temas
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Altere as cores, tipografia e formato dos componentes em tempo real. Visualize na loja antes de aplicar ou salve para todos os visitantes.
          </p>
        </div>

        {/* Action Buttons: Visualizar Tema & Aplicar Tema */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto shrink-0">
          {isPreviewing ? (
            <button
              onClick={resetPreview}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Descartar Prévia</span>
            </button>
          ) : (
            <button
              onClick={handlePreview}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-stone-300 rounded-lg text-xs font-semibold text-stone-800 bg-white hover:bg-stone-50 shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Visualizar tema</span>
            </button>
          )}

          <button
            onClick={handleApply}
            disabled={isApplying}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[var(--color-primary,#B76E79)] text-white text-xs font-semibold rounded-lg hover:opacity-95 shadow-md disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isApplying ? 'Salvando...' : 'Aplicar tema'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Tema aplicado e salvo no banco de dados com sucesso! Todas as visitantes verão a nova paleta.</span>
        </div>
      )}

      {isPreviewing && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg flex items-center justify-between">
          <span className="flex items-center gap-2 font-medium">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Você está em modo de pré-visualização. Clique em "Aplicar tema" para persistir as alterações.
          </span>
          <button
            onClick={resetPreview}
            className="font-bold underline text-blue-700 hover:text-blue-900"
          >
            Fechar prévia
          </button>
        </div>
      )}

      {/* 1. Predefined Themes Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
          1. Temas Predefinidos da Boutique
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {presetDefinitions.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all bg-white relative ${
                  isSelected
                    ? 'border-[var(--color-primary,#B76E79)] ring-2 ring-[var(--color-primary,#B76E79)]/20 shadow-md'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[var(--color-primary,#B76E79)] text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                )}

                <h5 className="font-semibold text-sm text-stone-900 mb-1">{preset.name}</h5>
                <p className="text-[11px] text-stone-500 mb-3 leading-snug">{preset.description}</p>

                {/* Swatch palette */}
                <div className="flex items-center gap-1.5 pt-1">
                  {preset.palette.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 rounded-full border border-stone-200 shadow-2xs"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Manual Customization */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-6">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            2. Personalização Manual de Cores & Elementos
          </h4>
          <p className="text-xs text-stone-500 mt-0.5">
            Ajuste fino individual de cada token visual da sua loja.
          </p>
        </div>

        {/* Color Pickers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Cor Principal */}
          <div className="space-y-1.5 p-3 rounded-lg bg-stone-50 border border-stone-200">
            <label className="text-xs font-semibold text-stone-800 block">Cor Principal (Primária)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customColors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="w-10 h-10 rounded border border-stone-300 cursor-pointer p-0.5 bg-white"
              />
              <input
                type="text"
                value={customColors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="w-28 p-1.5 border border-stone-300 rounded text-xs font-mono uppercase bg-white"
              />
            </div>
            <span className="text-[10px] text-stone-500">Usada nos botões primários e links ativos</span>
          </div>

          {/* Cor Secundária */}
          <div className="space-y-1.5 p-3 rounded-lg bg-stone-50 border border-stone-200">
            <label className="text-xs font-semibold text-stone-800 block">Cor Secundária (Suave)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customColors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="w-10 h-10 rounded border border-stone-300 cursor-pointer p-0.5 bg-white"
              />
              <input
                type="text"
                value={customColors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="w-28 p-1.5 border border-stone-300 rounded text-xs font-mono uppercase bg-white"
              />
            </div>
            <span className="text-[10px] text-stone-500">Usada em fundos sutis e efeitos hover</span>
          </div>

          {/* Cor de Fundo */}
          <div className="space-y-1.5 p-3 rounded-lg bg-stone-50 border border-stone-200">
            <label className="text-xs font-semibold text-stone-800 block">Cor de Fundo da Loja (Canvas)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customColors.bg}
                onChange={(e) => handleColorChange('bg', e.target.value)}
                className="w-10 h-10 rounded border border-stone-300 cursor-pointer p-0.5 bg-white"
              />
              <input
                type="text"
                value={customColors.bg}
                onChange={(e) => handleColorChange('bg', e.target.value)}
                className="w-28 p-1.5 border border-stone-300 rounded text-xs font-mono uppercase bg-white"
              />
            </div>
            <span className="text-[10px] text-stone-500">Cor de fundo geral das páginas (ex: off-white)</span>
          </div>

          {/* Cor dos Textos */}
          <div className="space-y-1.5 p-3 rounded-lg bg-stone-50 border border-stone-200">
            <label className="text-xs font-semibold text-stone-800 block">Cor dos Textos</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customColors.text}
                onChange={(e) => handleColorChange('text', e.target.value)}
                className="w-10 h-10 rounded border border-stone-300 cursor-pointer p-0.5 bg-white"
              />
              <input
                type="text"
                value={customColors.text}
                onChange={(e) => handleColorChange('text', e.target.value)}
                className="w-28 p-1.5 border border-stone-300 rounded text-xs font-mono uppercase bg-white"
              />
            </div>
            <span className="text-[10px] text-stone-500">Tipografia principal da loja</span>
          </div>

          {/* Cor dos Botões */}
          <div className="space-y-1.5 p-3 rounded-lg bg-stone-50 border border-stone-200">
            <label className="text-xs font-semibold text-stone-800 block">Cor dos Botões</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customColors.buttonBg}
                onChange={(e) => handleColorChange('buttonBg', e.target.value)}
                className="w-10 h-10 rounded border border-stone-300 cursor-pointer p-0.5 bg-white"
              />
              <input
                type="text"
                value={customColors.buttonBg}
                onChange={(e) => handleColorChange('buttonBg', e.target.value)}
                className="w-28 p-1.5 border border-stone-300 rounded text-xs font-mono uppercase bg-white"
              />
            </div>
            <span className="text-[10px] text-stone-500">Fundo dos botões de compra e ação</span>
          </div>

          {/* Cor dos Destaques (Ouro / Accent) */}
          <div className="space-y-1.5 p-3 rounded-lg bg-stone-50 border border-stone-200">
            <label className="text-xs font-semibold text-stone-800 block">Cor dos Destaques (Dourado / Accent)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customColors.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="w-10 h-10 rounded border border-stone-300 cursor-pointer p-0.5 bg-white"
              />
              <input
                type="text"
                value={customColors.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="w-28 p-1.5 border border-stone-300 rounded text-xs font-mono uppercase bg-white"
              />
            </div>
            <span className="text-[10px] text-stone-500">Detalhes em ouro, badges e estrelas</span>
          </div>
        </div>

        {/* Typography & Shapes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-stone-100">
          {/* Tipografia */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-800 block">Tipografia dos Títulos</label>
            <select
              value={customColors.fontHeading}
              onChange={(e) => handleColorChange('fontHeading', e.target.value)}
              className="w-full p-2 border border-stone-300 rounded-lg text-xs bg-white"
            >
              <option value="'Cormorant Garamond', 'Playfair Display', serif">
                Cormorant Garamond (Boutique de Luxo)
              </option>
              <option value="'Playfair Display', serif">Playfair Display (Editorial Clássico)</option>
              <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Moderno Minimalista)</option>
              <option value="'Montserrat', sans-serif">Montserrat (Contemporâneo Marcante)</option>
            </select>
          </div>

          {/* Formato dos Botões */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-800 block">Formato dos Botões</label>
            <select
              value={customColors.buttonRadius}
              onChange={(e) => handleColorChange('buttonRadius', e.target.value)}
              className="w-full p-2 border border-stone-300 rounded-lg text-xs bg-white"
            >
              <option value="0.375rem">Reto Sofisticado (Raio 6px)</option>
              <option value="0.5rem">Arredondado Suave (Raio 8px)</option>
              <option value="0.75rem">Arredondado Marcante (Raio 12px)</option>
              <option value="9999px">Pílula Total (Arredondado Completo)</option>
            </select>
          </div>

          {/* Aparência dos Cards */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-800 block">Aparência dos Cards</label>
            <select
              value={customColors.cardRadius}
              onChange={(e) => handleColorChange('cardRadius', e.target.value)}
              className="w-full p-2 border border-stone-300 rounded-lg text-xs bg-white"
            >
              <option value="0.375rem">Cantos Retos com Borda Fina</option>
              <option value="0.75rem">Cantos Suaves Elegantes</option>
              <option value="1.25rem">Cantos Curvos Modernos</option>
            </select>
          </div>
        </div>

        {/* Live Preview Bar inside panel */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreview}
              className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-800 bg-stone-50 hover:bg-stone-100 flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Visualizar tema</span>
            </button>
            <span className="text-[11px] text-stone-500">
              A prévia altera os elementos da loja para teste sem salvar no banco.
            </span>
          </div>

          <button
            onClick={handleApply}
            disabled={isApplying}
            className="px-6 py-2.5 bg-[var(--color-primary,#B76E79)] text-white text-xs font-semibold rounded-lg hover:opacity-95 shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Aplicar tema (Salvar)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
