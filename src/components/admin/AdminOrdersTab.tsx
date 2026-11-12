import React, { useState, useEffect } from 'react';
import { ShoppingBag, MessageCircle, Clock, CheckCircle2, XCircle, Search, RefreshCw, Calendar, Phone, MapPin } from 'lucide-react';
import { OrderIntent } from '../../types/store';
import { useAuth } from '../../context/AuthContext';

export const AdminOrdersTab: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<OrderIntent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customerPhone && o.customerPhone.includes(searchTerm));
    const matchesStatus = statusFilter ? o.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" />
            <span>Pendente (WhatsApp)</span>
          </span>
        );
      case 'em_atendimento':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            <MessageCircle className="w-3 h-3" />
            <span>Em Atendimento</span>
          </span>
        );
      case 'concluido':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>Concluído</span>
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600">
            <XCircle className="w-3 h-3" />
            <span>Cancelado</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Informational banner about purchase intents vs payment */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-stone-900 text-sm">
            Intenções de Compra & Atendimentos WhatsApp
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Pedidos iniciados por clientes na loja e encaminhados para seu WhatsApp. Confirme disponibilidade e pagamento diretamente na conversa.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 rounded-lg text-xs text-stone-700 bg-stone-50 hover:bg-stone-100 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Atualizar Lista</span>
        </button>
      </div>

      {/* Filter Strip */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, pedido, telefone..."
            className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-stone-200 rounded-lg text-xs py-2 px-3 bg-white text-stone-700 focus:outline-none w-full sm:w-auto"
        >
          <option value="">Todos os Status</option>
          <option value="pendente">Pendente</option>
          <option value="em_atendimento">Em Atendimento</option>
          <option value="concluido">Concluído</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-stone-500">
          Carregando registros de compras...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-stone-200 text-center space-y-2">
          <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="text-xs font-semibold text-stone-700">Nenhum pedido encontrado</p>
          <p className="text-[11px] text-stone-400">
            Quando as clientes finalizarem seus pedidos no site, as intenções aparecerão aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4 hover:border-stone-300 transition-colors"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-stone-900 bg-stone-100 px-2.5 py-1 rounded">
                    #{ord.id}
                  </span>
                  <span className="text-sm font-bold text-stone-800">{ord.customerName}</span>
                  {getStatusBadge(ord.status)}
                </div>

                <div className="flex items-center gap-4 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(ord.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Customer Contact & Delivery Info */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 bg-stone-50/70 p-3 rounded-lg border border-stone-100">
                {ord.customerPhone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>{ord.customerPhone}</span>
                  </div>
                )}
                {ord.customerCity && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{ord.customerCity}</span>
                  </div>
                )}
                {ord.notes && (
                  <div className="w-full text-stone-500 italic mt-1">
                    Obs: "{ord.notes}"
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="divide-y divide-stone-100 text-xs">
                {ord.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.imageUrl || '/assets/aistudio/image_eb20ad27.png'}
                        alt={item.productName}
                        className="w-10 h-12 object-cover rounded bg-stone-100 border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-stone-900 block truncate">
                          {item.productName}
                        </span>
                        <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                          <span>Tam: <strong>{item.size}</strong></span>
                          <span>·</span>
                          <span>Cor: <strong>{item.color}</strong></span>
                          <span>·</span>
                          <span>Qtd: <strong>{item.quantity}x</strong></span>
                        </div>
                      </div>
                    </div>

                    <span className="font-mono font-bold text-stone-900 tabular-nums shrink-0">
                      {item.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total and Status Modifier */}
              <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-stone-500">Valor Total da Intenção:</span>
                  <span className="text-base font-bold text-stone-900 tabular-nums">
                    {ord.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Direct WhatsApp Call */}
                  {ord.customerPhone && (
                    <a
                      href={`https://wa.me/${ord.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Olá ${ord.customerName}! Aqui é da boutique Bem Garota Moda Feminina sobre seu pedido #${ord.id}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Falar no WhatsApp</span>
                    </a>
                  )}

                  {/* Status Dropdown */}
                  <select
                    value={ord.status}
                    onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                    className="p-1.5 border border-stone-300 rounded-lg text-xs bg-white text-stone-700 font-medium"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_atendimento">Em Atendimento</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
