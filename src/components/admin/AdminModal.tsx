import React, { useState } from 'react';
import {
  X,
  LayoutDashboard,
  Package,
  Layers,
  Image as ImageIcon,
  Star,
  ShoppingBag,
  Palette,
  LayoutGrid,
  Settings,
  LogOut,
  Store,
  ShieldCheck,
  FolderSync,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Product, Category, Banner, Review } from '../../types/store';
import { AdminDashboardTab } from './AdminDashboardTab';
import { AdminProductsTab } from './AdminProductsTab';
import { AdminCategoriesTab } from './AdminCategoriesTab';
import { AdminBannersTab } from './AdminBannersTab';
import { AdminReviewsTab } from './AdminReviewsTab';
import { AdminOrdersTab } from './AdminOrdersTab';
import { AdminThemesTab } from './AdminThemesTab';
import { AdminHomepageTab } from './AdminHomepageTab';
import { AdminSettingsTab } from './AdminSettingsTab';
import { AdminDriveSyncTab } from './AdminDriveSyncTab';

interface AdminModalProps {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  reviews: Review[];
  onRefreshAll: () => void;
}

export type TabType =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'banners'
  | 'reviews'
  | 'orders'
  | 'homepage'
  | 'themes'
  | 'settings'
  | 'drivesync';

export const AdminModal: React.FC<AdminModalProps> = ({
  products,
  categories,
  banners,
  reviews,
  onRefreshAll,
}) => {
  const { isAdminOpen, closeAdmin, isAuthenticated, logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  if (!isAdminOpen || !isAuthenticated) return null;

  const tabs: Array<{ id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Produtos', icon: Package, count: products.length },
    { id: 'categories', label: 'Categorias', icon: Layers, count: categories.length },
    { id: 'banners', label: 'Banners', icon: ImageIcon, count: banners.length },
    { id: 'drivesync', label: 'Sincronizar Drive', icon: FolderSync },
    { id: 'reviews', label: 'Avaliações', icon: Star, count: reviews.length },
    { id: 'orders', label: 'Pedidos WhatsApp', icon: ShoppingBag },
    { id: 'homepage', label: 'Página Inicial', icon: LayoutGrid },
    { id: 'themes', label: 'Aparência & Temas', icon: Palette },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 sm:backdrop-blur-xs flex sm:items-center sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200 overflow-hidden">
      <div className="bg-stone-50 w-full h-[100dvh] sm:h-[94dvh] sm:max-w-7xl sm:rounded-2xl border-0 sm:border border-stone-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header Bar - Optimized for Mobile & Desktop */}
        <div className="bg-white border-b border-stone-200 px-3 pb-[max(0.625rem,env(safe-area-inset-top))] pt-3 sm:px-6 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[var(--color-bg,#FAF8F5)] border border-[var(--color-border,#EFE7E1)] flex items-center justify-center text-[var(--color-primary,#B76E79)] shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-boutique text-base sm:text-xl font-bold text-stone-900 leading-none truncate">
                  Painel Admin
                </span>
                <span className="bg-[var(--color-secondary,#F3E5E6)] text-[var(--color-primary,#B76E79)] text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase shrink-0">
                  Bem Garota
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-stone-500 hidden sm:block truncate">
                Logado: <strong>{user?.username}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* View store button */}
            <button
              onClick={closeAdmin}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 transition-colors"
              title="Voltar para a Loja Virtual"
            >
              <Store className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span className="text-[11px] sm:text-xs">Ver Loja</span>
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Encerrar Sessão"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>

            {/* Close modal X button */}
            <button
              onClick={closeAdmin}
              className="p-1 sm:p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              aria-label="Fechar painel"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Scrollable Tab Bar (Only visible on screens < sm) */}
        <div className="sm:hidden flex overflow-x-auto gap-1.5 px-3 py-2 bg-white border-b border-stone-200 shrink-0 touch-pan-x [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-[var(--color-primary,#B76E79)] text-white font-semibold shadow-xs'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[9px] font-mono px-1 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body Layout: Sidebar + Main Content */}
        <div className="flex-1 flex overflow-hidden min-h-0 min-w-0">
          {/* Desktop Sidebar Navigation (Hidden on mobile) */}
          <aside className="hidden sm:flex w-56 sm:w-64 bg-white border-r border-stone-200 p-3 sm:p-4 flex-col justify-between shrink-0 overflow-y-auto">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-3 block mb-2">
                Menu de Gestão
              </span>
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[var(--color-primary,#B76E79)] text-white shadow-xs font-semibold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComponent className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>

                    {tab.count !== undefined && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Version & Help Info */}
            <div className="pt-4 border-t border-stone-100 px-3 text-[11px] text-stone-400 space-y-1">
              <span className="block font-medium text-stone-500">Boutique Store v2.4</span>
              <span>Totalmente otimizado para celulares e computadores.</span>
            </div>
          </aside>

          {/* Main Tab Content */}
          <main className="flex-1 min-w-0 overflow-y-auto overscroll-contain p-3 sm:p-6 lg:p-8 bg-stone-50/60 pb-16 sm:pb-8">
            {activeTab === 'dashboard' && (
              <AdminDashboardTab onNavigate={(t) => setActiveTab(t as TabType)} />
            )}

            {activeTab === 'products' && (
              <AdminProductsTab
                products={products}
                categories={categories}
                onRefresh={onRefreshAll}
              />
            )}

            {activeTab === 'categories' && (
              <AdminCategoriesTab
                categories={categories}
                onRefresh={onRefreshAll}
              />
            )}

            {activeTab === 'banners' && (
              <AdminBannersTab
                banners={banners}
                onRefresh={onRefreshAll}
              />
            )}

            {activeTab === 'drivesync' && (
              <AdminDriveSyncTab onRefresh={onRefreshAll} />
            )}

            {activeTab === 'reviews' && (
              <AdminReviewsTab
                reviews={reviews}
                onRefresh={onRefreshAll}
              />
            )}

            {activeTab === 'orders' && <AdminOrdersTab />}

            {activeTab === 'homepage' && <AdminHomepageTab />}

            {activeTab === 'themes' && <AdminThemesTab />}

            {activeTab === 'settings' && (
              <AdminSettingsTab onResetDemoSuccess={onRefreshAll} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
