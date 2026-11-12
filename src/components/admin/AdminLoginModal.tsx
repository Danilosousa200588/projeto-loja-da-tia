import React, { useState } from 'react';
import { X, Lock, Mail, Key, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginModal: React.FC = () => {
  const { isAdminOpen, closeAdmin, login, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('admin@bemgarota.com.br');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAdminOpen || isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const res = await login(username.trim(), password);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Credenciais inválidas');
    }
  };

  const handleFillDemoCredentials = () => {
    setUsername('admin@bemgarota.com.br');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-stone-200 max-w-md w-full p-5 sm:p-8 shadow-2xl relative">
        <button
          onClick={closeAdmin}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-full bg-[var(--color-bg,#FAF8F5)] border border-[var(--color-border,#EFE7E1)] flex items-center justify-center text-[var(--color-primary,#B76E79)] mx-auto shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-boutique text-2xl font-bold text-stone-900">
            Painel Administrativo
          </h3>
          <p className="text-xs text-stone-500">
            Acesso exclusivo para gerenciamento da loja Bem Garota.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg mb-4 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-stone-400" />
              <span>E-mail do Administrador</span>
            </label>
            <input
              type="email"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-stone-400" />
              <span>Senha de Acesso</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>

          {/* Quick Demo Fill Helper */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between">
            <div className="text-[11px] text-stone-600">
              <span>Admin: <strong>admin@bemgarota.com.br</strong></span>
              <span className="block text-stone-400">Senha: admin123</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className="text-[11px] font-semibold text-[var(--color-primary)] hover:underline"
            >
              Preencher
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[var(--color-primary,#B76E79)] text-white font-semibold text-xs rounded-lg hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Verificando...' : 'Entrar no Painel'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
