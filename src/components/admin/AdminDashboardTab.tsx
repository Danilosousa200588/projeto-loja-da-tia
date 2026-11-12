import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, AlertTriangle, Layers, ShoppingBag, Eye, TrendingUp, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface StatsData {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalOrdersValue: number;
  pendingOrders: number;
  mostViewedProducts: Array<{ id: string; name: string; views: number; stock: number; price: number }>;
  recentOrders: Array<{ id: string; customerName: string; total: number; status: string; createdAt: string; items: Array<{ productName: string; quantity: number }> }>;
}

export const AdminDashboardTab: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { token } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center p-12 text-stone-500">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Carregando estatísticas da boutique...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Products KPI */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-xs hover:border-[var(--color-primary)] cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Produtos</span>
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">{stats.totalProducts}</span>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {stats.activeProducts} ativos
            </span>
          </div>
        </div>

        {/* Stock Alert KPI */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-xs hover:border-amber-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Estoque Baixo / Esgotado</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">
              {stats.outOfStockProducts + stats.lowStockProducts}
            </span>
            <span className="text-xs text-amber-700 font-medium">
              {stats.outOfStockProducts} zerados
            </span>
          </div>
        </div>

        {/* Orders / WhatsApp Intents KPI */}
        <div
          onClick={() => onNavigate('orders')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-xs hover:border-emerald-500 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Intenções WhatsApp</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">{stats.totalOrders}</span>
            <span className="text-xs text-emerald-600 font-medium">
              {stats.pendingOrders} pendentes
            </span>
          </div>
        </div>

        {/* Total Intent Value */}
        <div
          onClick={() => onNavigate('orders')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-xs hover:border-[var(--color-accent)] cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Valor em Intenções</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-[var(--color-primary)]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-bold text-stone-900 tabular-nums">
              {stats.totalOrdersValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Top Viewed Products & Recent WhatsApp Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Viewed Products */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[var(--color-primary)]" />
              <h3 className="font-semibold text-sm text-stone-900">Produtos Mais Visualizados</h3>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs text-[var(--color-primary)] font-medium hover:underline"
            >
              Ver todos
            </button>
          </div>

          <div className="space-y-3">
            {stats.mostViewedProducts.map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-stone-800 truncate">{p.name}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0 font-mono">
                  <span className="text-stone-500">{p.views} visualizações</span>
                  <span className="font-bold text-stone-900">
                    {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Purchase Intents (WhatsApp) */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <h3 className="font-semibold text-sm text-stone-900">Últimos Pedidos / Intenções</h3>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs text-[var(--color-primary)] font-medium hover:underline"
            >
              Gerenciar pedidos
            </button>
          </div>

          {stats.recentOrders.length === 0 ? (
            <p className="text-xs text-stone-400 italic py-6 text-center">
              Nenhuma intenção de compra registrada ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((ord) => (
                <div key={ord.id} className="p-2.5 rounded-lg bg-stone-50 border border-stone-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800">{ord.customerName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      ord.status === 'pendente'
                        ? 'bg-amber-100 text-amber-800'
                        : ord.status === 'em_atendimento'
                        ? 'bg-blue-100 text-blue-800'
                        : ord.status === 'concluido'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-200 text-stone-700'
                    }`}>
                      {ord.status === 'pendente' ? 'Pendente' : ord.status === 'em_atendimento' ? 'Em Atendimento' : 'Concluído'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-stone-500 text-[11px]">
                    <span className="truncate max-w-[200px]">
                      {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                    </span>
                    <span className="font-bold text-stone-900 tabular-nums">
                      {ord.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
