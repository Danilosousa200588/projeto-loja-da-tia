import React, { useState } from 'react';
import { Star, MessageSquarePlus, CheckCircle, Info } from 'lucide-react';
import { Review } from '../types/store';

interface ReviewsSectionProps {
  reviews: Review[];
  onReviewAdded: (newReview: Review) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, onReviewAdded }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: authorName.trim(),
          rating,
          comment: comment.trim(),
        }),
      });

      if (res.ok) {
        const created: Review = await res.json();
        onReviewAdded(created);
        setSuccessMsg(true);
        setAuthorName('');
        setComment('');
        setTimeout(() => {
          setSuccessMsg(false);
          setModalOpen(false);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full py-16 bg-[var(--color-bg,#FAF8F5)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-[var(--color-primary,#B76E79)] block mb-1">
              Experiência Bem Garota
            </span>
            <h2 className="font-boutique text-3xl sm:text-4xl font-semibold text-[var(--color-text)]">
              O Que Nossas Clientes Dizem
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1 max-w-xl">
              Compartilhe sua experiência com os produtos e o atendimento da loja.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-btn,0.5rem)] bg-[var(--color-surface,#FFFFFF)] border border-[var(--color-border,#EFE7E1)] hover:border-[var(--color-primary)] text-xs font-semibold text-[var(--color-text)] shadow-xs hover:shadow-md transition-all self-start sm:self-auto"
          >
            <MessageSquarePlus className="w-4 h-4 text-[var(--color-primary,#B76E79)]" />
            <span>Deixar Meu Depoimento</span>
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.slice(0, 4).map((rev) => (
            <div
              key={rev.id}
              className="bg-[var(--color-surface,#FFFFFF)] p-6 rounded-[var(--radius-card,0.75rem)] border border-[var(--color-border,#EFE7E1)] shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-stone-300'}`}
                    />
                  ))}
                  <span className="text-xs font-bold text-stone-700 ml-1.5 tabular-nums">
                    {rev.rating}.0
                  </span>
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-[var(--color-text)] italic leading-relaxed line-clamp-4">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author & Verified marker */}
              <div className="pt-3 border-t border-[var(--color-border,#EFE7E1)] flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--color-text)] truncate">
                    {rev.authorName}
                  </span>
                </div>

                {rev.productName && (
                  <span className="text-[11px] text-[var(--color-text-muted)] truncate">
                    Peça: {rev.productName}
                  </span>
                )}

                {/* Required transparency indicator for demonstration reviews */}
                {rev.isDemo && (
                  <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-1">
                    <Info className="w-3 h-3" />
                    <span>Exemplo de demonstração</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Submission Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--color-surface,#FFFFFF)] rounded-[var(--radius-card,0.75rem)] border border-[var(--color-border,#EFE7E1)] max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-boutique text-2xl font-bold text-[var(--color-text)]">
              Conte sua experiência
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Sua opinião ajuda outras clientes a escolherem as melhores peças e modelagens.
            </p>

            {successMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-800">
                  Muito obrigada! Sua avaliação foi enviada e ficará visível após aprovação da loja.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--color-text)]">
                    Seu Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Ex: Maria Carolina"
                    className="w-full p-2.5 border border-stone-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--color-text)]">
                    Nota (1 a 5 estrelas)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating ? 'fill-amber-400 text-amber-500' : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-stone-700 ml-2">
                      {rating} estrelas
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--color-text)]">
                    Seu Comentário *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Fale sobre o tecido, caimento, prazo de envio e atendimento..."
                    className="w-full p-2.5 border border-stone-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-[var(--radius-btn,0.5rem)] bg-[var(--color-primary,#B76E79)] text-white text-xs font-semibold hover:opacity-95 shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? 'Enviando...' : 'Publicar Depoimento'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
