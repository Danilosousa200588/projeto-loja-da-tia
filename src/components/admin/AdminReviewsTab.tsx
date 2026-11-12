import React, { useState } from 'react';
import { Star, Check, X, Trash2, Eye, EyeOff, Info } from 'lucide-react';
import { Review } from '../../types/store';
import { useAuth } from '../../context/AuthContext';

interface AdminReviewsTabProps {
  reviews: Review[];
  onRefresh: () => void;
}

export const AdminReviewsTab: React.FC<AdminReviewsTabProps> = ({ reviews, onRefresh }) => {
  const { token } = useAuth();
  const [filter, setFilter] = useState<'all' | 'approved' | 'hidden'>('all');

  const handleToggleApproved = async (rev: Review) => {
    try {
      const res = await fetch(`/api/reviews/${rev.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isApproved: !rev.isApproved }),
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta avaliação?')) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = reviews.filter((r) => {
    if (filter === 'approved') return r.isApproved;
    if (filter === 'hidden') return !r.isApproved;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200">
        <div>
          <h3 className="font-semibold text-stone-900 text-sm">Moderação de Avaliações</h3>
          <p className="text-xs text-stone-500">
            Aprove, oculte ou exclua comentários enviados pelas clientes ou de demonstração.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Todas ({reviews.length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'approved' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Aprovadas
          </button>
          <button
            onClick={() => setFilter('hidden')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'hidden' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Ocultas
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((rev) => (
          <div
            key={rev.id}
            className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900">{rev.authorName}</span>
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-stone-300'}`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-stone-400 font-mono">
                  {new Date(rev.createdAt).toLocaleDateString('pt-BR')}
                </span>

                {rev.isDemo && (
                  <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                    <Info className="w-3 h-3 text-stone-400" />
                    Demonstração
                  </span>
                )}
              </div>

              <p className="text-stone-700 italic">"{rev.comment}"</p>

              {rev.productName && (
                <span className="text-[11px] text-[var(--color-primary)] font-medium block">
                  Produto vinculado: {rev.productName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => handleToggleApproved(rev)}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                  rev.isApproved
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                {rev.isApproved ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Aprovada na Loja</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Oculta</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleDelete(rev.id)}
                className="p-2 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded-lg transition-colors"
                title="Excluir Avaliação"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
