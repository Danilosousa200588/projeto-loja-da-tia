import React, { useState } from 'react';
import { FolderSync, Cloud, CheckCircle, AlertCircle, RefreshCw, ExternalLink, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminDriveSyncTabProps {
  onRefresh: () => void;
}

export const AdminDriveSyncTab: React.FC<AdminDriveSyncTabProps> = ({ onRefresh }) => {
  const { token } = useAuth();
  const [folderId, setFolderId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ success: boolean; text: string; stats?: any } | null>(null);

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderId.trim()) {
      alert('Por favor, informe o ID da pasta pública do Google Drive.');
      return;
    }

    setLoading(true);
    setResultMessage(null);

    try {
      const res = await fetch('/api/admin/sync-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ folderId: folderId.trim(), apiKey: apiKey.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setResultMessage({
          success: true,
          text: data.message || 'Sincronização com o Google Drive realizada com sucesso!',
          stats: data.stats,
        });
        onRefresh();
      } else {
        setResultMessage({
          success: false,
          text: data.error || 'Erro ao sincronizar com o Google Drive.',
        });
      }
    } catch (err) {
      console.error(err);
      setResultMessage({
        success: false,
        text: 'Erro de conexão ao comunicar com o servidor de sincronização.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[var(--color-primary,#B76E79)] to-stone-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-15 pointer-events-none">
          <FolderSync className="w-40 h-40" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Google Drive API Sync</span>
          </div>
          <h2 className="font-boutique text-2xl sm:text-3xl font-bold">Sincronização Automática com o Drive</h2>
          <p className="text-xs sm:text-sm text-stone-100 max-w-xl leading-relaxed">
            Cole abaixo o ID da pasta pública do Google Drive contendo as fotos da sua boutique. Nosso sistema irá analisar os arquivos, agrupar variações de cores na mesma publicação, organizar automaticamente em cada categoria e definir os valores como zerados (<strong className="text-amber-300">R$ 0,00</strong>).
          </p>
        </div>
      </div>

      {/* Sync Form */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-5">
        <form onSubmit={handleSync} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800">
              ID da Pasta Pública do Google Drive *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                placeholder="Ex: 1B2C3D4E5F6G7H8I9J0K_ExemploPasta"
                className="flex-1 p-3 border border-stone-300 rounded-lg text-xs font-mono bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <p className="text-[11px] text-stone-500">
              Dica: O ID da pasta é a sequência alfanumérica que aparece após <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-700">folders/</code> no link de compartilhamento público do Google Drive.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800">
              Chave da API do Google (Opcional)
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Deixe em branco para usar a chave padrão do sistema"
              className="w-full p-3 border border-stone-300 rounded-lg text-xs font-mono bg-stone-50 focus:bg-white focus:outline-none"
            />
            <p className="text-[11px] text-stone-500">
              Se a pasta estiver configurada como "Qualquer pessoa com o link pode ver", a API do Drive listará as fotos automaticamente.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-primary,#B76E79)] text-white text-xs font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sincronizando fotos e produtos do Drive...</span>
                </>
              ) : (
                <>
                  <FolderSync className="w-4 h-4" />
                  <span>Sincronizar Fotos e Produtos do Drive</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Result Feedback */}
        {resultMessage && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in duration-200 ${
              resultMessage.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {resultMessage.success ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span>{resultMessage.text}</span>
            </div>

            {resultMessage.stats && (
              <div className="mt-2 pt-2 border-t border-emerald-200/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                  <span className="block text-stone-500">Imagens Analisadas</span>
                  <span className="font-bold text-stone-900 text-sm">{resultMessage.stats.filesCount || 0}</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                  <span className="block text-stone-500">Produtos Criados</span>
                  <span className="font-bold text-stone-900 text-sm">{resultMessage.stats.productsCreated || 0}</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                  <span className="block text-stone-500">Banners Atualizados</span>
                  <span className="font-bold text-stone-900 text-sm">{resultMessage.stats.bannersUpdated || 0}</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                  <span className="block text-stone-500">Valores Definidos</span>
                  <span className="font-bold text-emerald-700 text-sm">R$ 0,00</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guide Card */}
      <div className="bg-stone-100 rounded-xl p-5 border border-stone-200 text-xs text-stone-700 space-y-2">
        <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
          <Cloud className="w-4 h-4 text-[var(--color-primary)]" />
          Como preparar sua pasta no Google Drive:
        </h4>
        <ul className="list-disc list-inside space-y-1 text-stone-600 pl-1">
          <li>Crie uma pasta no seu Google Drive com as fotos das peças e banners.</li>
          <li>Compartilhe a pasta como <strong className="text-stone-800">"Qualquer pessoa com o link"</strong> (Leitor).</li>
          <li>Copie o ID da pasta na URL e cole acima para sincronizar automaticamente.</li>
          <li>Todas as peças sincronizadas virão com o preço zerado (<strong className="text-stone-800">R$ 0,00</strong>) e agrupadas por categoria.</li>
        </ul>
      </div>
    </div>
  );
};
