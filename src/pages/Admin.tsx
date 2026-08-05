import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList, Package, FolderTree, Image as ImageIcon, ShieldAlert, BarChart3,
  Users, Home as HomeIcon, Settings as SettingsIcon, Phone, BookOpen, Calendar, Star,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import AdminStats from '@/components/admin/AdminStats';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminCategories from '@/components/admin/AdminCategories';
import AdminBanners from '@/components/admin/AdminBanners';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminCallbacks from '@/components/admin/AdminCallbacks';
import AdminTestimonials from '@/components/admin/AdminTestimonials';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminCalendar from '@/components/admin/AdminCalendar';
import AdminManual from '@/components/admin/AdminManual';

const TABS = [
  { key: 'stats', label: 'Статистика', icon: BarChart3, comp: AdminStats },
  { key: 'orders', label: 'Заказы', icon: ClipboardList, comp: AdminOrders },
  { key: 'products', label: 'Товары', icon: Package, comp: AdminProducts },
  { key: 'categories', label: 'Категории', icon: FolderTree, comp: AdminCategories },
  { key: 'banners', label: 'Баннеры', icon: ImageIcon, comp: AdminBanners },
  { key: 'users', label: 'Пользователи', icon: Users, comp: AdminUsers },
  { key: 'callbacks', label: 'Перезвоны', icon: Phone, comp: AdminCallbacks },
  { key: 'testimonials', label: 'Отзывы', icon: Star, comp: AdminTestimonials },
  { key: 'settings', label: 'Настройки', icon: SettingsIcon, comp: AdminSettings },
  { key: 'calendar', label: 'Календарь', icon: Calendar, comp: AdminCalendar },
  { key: 'manual', label: 'Руководство', icon: BookOpen, comp: AdminManual },
] as const;

export default function Admin() {
  const { user, isAuthenticated, isLoadingAuth, navigateToLogin, isAdmin } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('stats');

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#2563EB] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <ShieldAlert className="w-10 h-10 text-[#2563EB] mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-3">Вход для администратора</h1>
        <button
          type="button"
          onClick={navigateToLogin}
          className="bg-[#2563EB] text-white px-7 py-3.5 rounded-lg"
        >
          Войти
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-3">Нет доступа</h1>
        <p className="text-slate-500">Только для администраторов. Текущий пользователь: {user?.email}</p>
      </div>
    );
  }

  const Active = TABS.find((t) => t.key === tab)!.comp;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#0F172A]">Панель управления</h1>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#2563EB]">
            <HomeIcon className="w-4 h-4" /> На главную
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 -mb-px ${tab === t.key ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500'}`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>
        <Active />
      </div>
    </div>
  );
}
