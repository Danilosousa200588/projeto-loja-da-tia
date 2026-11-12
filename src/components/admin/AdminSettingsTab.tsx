import React, { useState } from 'react';
import { Save, Check, RefreshCw, AlertCircle, Building2, MessageCircle, Instagram, Facebook } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export const AdminSettingsTab: React.FC<{ onResetDemoSuccess: () => void }> = ({ onResetDemoSuccess }) => {
  const { settings, updateSettings, refreshSettings } = useTheme();
  const { token } = useAuth();

  const [storeName, setStoreName] = useState(settings?.storeName || 'Bem Garota');
  const [tagline, setTagline] = useState(settings?.tagline || 'Moda Feminina');
  const [logoUrl, setLogoUrl] = useState(settings?.logoUrl || '/assets/aistudio/image_eb20ad27.png');
  const [whatsappNumber, setWhatsappNumber] = useState(settings?.whatsappNumber || '');
  const [instagramUrl, setInstagramUrl] = useState(settings?.instagramUrl || '');
  const [facebookUrl, setFacebookUrl] = useState(settings?.facebookUrl || '');
  const [tiktokUrl, setTiktokUrl] = useState(settings?.tiktokUrl || '');
  const [contactEmail, setContactEmail] = useState(settings?.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(settings?.contactPhone || '');
  const [address, setAddress] = useState(settings?.address || '');
  const [announcementBar, setAnnouncementBar] = useState(
    settings?.announcementBar || ''
  );
  const [announcementActive, setAnnouncementActive] = useState(settings?.announcementActive !== false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(settings?.freeShippingThreshold ?? 0);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const ok = await updateSettings({
      storeName,
      tagline,
      logoUrl,
      whatsappNumber,
      instagramUrl,
      facebookUrl,
      tiktokUrl,
      contactEmail,
      contactPhone,
      address,
      announcementBar,
      announcementActive,
      freeShippingThreshold: Math.max(0, Number(freeShippingThreshold) || 0),
    });

    setIsSaving(false);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Isso vai apagar todos os produtos, banners, avaliações e pedidos cadastrados e restaurar as categorias padrão. Deseja continuar?')) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch('/api/admin/reset-demo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await refreshSettings();
        onResetDemoSuccess();
        alert('Configuração inicial restaurada. Os cadastros da loja foram limpos.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-stone-900 text-sm">Configurações Gerais & Canais</h3>
          <p className="text-stone-500 mt-0.5">
            Gerencie os dados da loja, canais de atendimento, redes sociais e barra de avisos. Preencha apenas informações reais antes de publicar.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-5 py-2 bg-[var(--color-primary,#B76E79)] text-white font-semibold rounded-lg hover:opacity-90 shadow-xs disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Salvando...' : 'Salvar Configurações'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Configurações atualizadas com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand & Store Identity */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-4">
          <h4 className="font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[var(--color-primary)]" />
            <span>Identidade da Loja & Logotipo</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Nome da Loja *</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-lg bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Slogan / Subtítulo</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-lg bg-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-stone-700">URL do Logotipo</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg font-mono bg-white"
                />
                <img
                  src={logoUrl || '/assets/aistudio/image_eb20ad27.png'}
                  alt="Preview Logo"
                  className="w-12 h-12 object-contain rounded border border-stone-200 p-1 bg-stone-50 shrink-0"
                />
              </div>
              <span className="text-[10px] text-stone-400">
                Logotipo oficial da loja: /assets/aistudio/image_eb20ad27.png
              </span>
            </div>
          </div>
        </div>

        {/* WhatsApp & Social Networks */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-4">
          <h4 className="font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp Comercial & Redes Sociais</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Número do WhatsApp (com DDI e DDD) *</label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="Ex: 55 + DDD + número"
                className="w-full p-2.5 border border-stone-300 rounded-lg font-mono bg-white"
              />
              <span className="text-[10px] text-stone-400">
                Os pedidos do carrinho serão encaminhados automaticamente para este WhatsApp.
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Link do Instagram</label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/suamarca"
                className="w-full p-2.5 border border-stone-300 rounded-lg bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Link do Facebook</label>
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/suamarca"
                className="w-full p-2.5 border border-stone-300 rounded-lg bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Link do TikTok</label>
              <input
                type="url"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                placeholder="https://tiktok.com/@suamarca"
                className="w-full p-2.5 border border-stone-300 rounded-lg bg-white"
              />
            </div>
          </div>
        </div>

        {/* Contacts & Shipping */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-4">
          <h4 className="font-bold text-stone-800 uppercase tracking-wider">
            Contatos, Endereço & Política de Frete
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">E-mail de Atendimento</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-lg bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Telefone Fixo / SAC</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-lg bg-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-stone-700">Endereço da Boutique Física (opcional)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-lg bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Valor Mínimo para Frete Grátis (R$)</label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full p-2.5 border border-stone-300 rounded-lg font-mono bg-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-stone-700">Texto da Barra Superior de Avisos</label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementActive}
                    onChange={(e) => setAnnouncementActive(e.target.checked)}
                    className="rounded text-[var(--color-primary)]"
                  />
                  <span>Ativar Barra de Avisos</span>
                </label>
              </div>
              <input
                type="text"
                value={announcementBar}
                onChange={(e) => setAnnouncementBar(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-lg bg-white"
              />
            </div>
          </div>
        </div>

        {/* Demo Data Reset Box */}
        <div className="bg-rose-50/60 p-5 rounded-xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h5 className="font-bold text-rose-900 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Restaurar Conteúdo de Demonstração</span>
            </h5>
            <p className="text-stone-600 max-w-xl">
              Caso queira recarregar todas as categorias, produtos, fotos de alta qualidade e banners iniciais de fábrica da loja Bem Garota.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetDemo}
            disabled={isResetting}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Limpar cadastros da loja</span>
          </button>
        </div>
      </form>
    </div>
  );
};
