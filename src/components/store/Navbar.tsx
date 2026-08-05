import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Droplets, Search, Phone, ShoppingBag, GitCompare, User, LogOut, Menu, X, Flame, LogIn,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/components/store/CartContext';
import { useCompare } from '@/lib/compare';
import { supabase } from '@/lib/supabase';
import CallbackModal from '@/components/store/CallbackModal';
import type { Category } from '@/types/database';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const { ids: compareIds } = useCompare();
  const [phone, setPhone] = useState('+375 (29) 602-01-10');
  const [cats, setCats] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [cb, setCb] = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('phone').limit(1).maybeSingle()
      .then(({ data }) => { if (data?.phone) setPhone(data.phone); });
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => setCats((data as Category[]) || []));
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0F172A] text-white">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
            <Droplets className="w-6 h-6" /> АкваМаркет
          </Link>

          <nav className="hidden lg:flex items-center gap-5 text-sm ml-4">
            <NavLink to="/catalog" className="hover:text-[#60A5FA]">Все товары</NavLink>
            <NavLink to="/deals" className="flex items-center gap-1 hover:text-[#60A5FA]">
              <Flame className="w-4 h-4 text-orange-400" /> Суперцены
            </NavLink>
            <div className="relative">
              <button type="button" onClick={() => setCatOpen((v) => !v)} className="hover:text-[#60A5FA]">
                Каталог ▾
              </button>
              {catOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white text-[#0F172A] rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                  {cats.map((c) => (
                    <Link key={c.id} to={`/catalog/${c.id}`} onClick={() => setCatOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-slate-50">{c.name}</Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="flex-1" />

          <div className="hidden md:flex items-center gap-3 text-sm">
            <Link to="/search" className="p-2 hover:text-[#60A5FA]"><Search className="w-5 h-5" /></Link>
            <a href={`tel:${phone.replace(/\D/g, '')}`} className="hidden xl:block">{phone}</a>
            <button type="button" onClick={() => setCb(true)}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] px-3 py-2 rounded-lg text-sm font-medium">
              Перезвони мне
            </button>
            {isAdmin && <Link to="/admin" className="hover:text-[#60A5FA]">Админ</Link>}
            {isAuthenticated ? (
              <>
                <Link to="/account" className="flex items-center gap-1 border border-white/30 px-3 py-1.5 rounded-lg">
                  <User className="w-4 h-4" /> Кабинет
                </Link>
                <button type="button" onClick={() => logout()} className="p-2 hover:text-[#60A5FA]" title="Выйти">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-1 hover:text-[#60A5FA]">
                <LogIn className="w-4 h-4" /> Войти
              </Link>
            )}
            <Link to="/compare" className="relative p-2 hover:text-[#60A5FA]">
              <GitCompare className="w-5 h-5" />
              {compareIds.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#2563EB] text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {compareIds.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative p-2 hover:text-[#60A5FA]">
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-white text-[#0F172A] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          </div>

          <button type="button" className="lg:hidden p-2" onClick={() => setOpen((v) => !v)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden border-t border-white/10 px-4 py-4 space-y-3 text-sm">
            <Link to="/catalog" onClick={() => setOpen(false)} className="block">Все товары</Link>
            <Link to="/deals" onClick={() => setOpen(false)} className="block">Суперцены</Link>
            <Link to="/search" onClick={() => setOpen(false)} className="block">Поиск</Link>
            <Link to="/cart" onClick={() => setOpen(false)} className="block">Корзина ({count})</Link>
            <Link to="/compare" onClick={() => setOpen(false)} className="block">Сравнение</Link>
            <Link to="/account" onClick={() => setOpen(false)} className="block">Кабинет</Link>
            {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="block">Админ</Link>}
            <button type="button" onClick={() => { setCb(true); setOpen(false); }} className="block text-[#60A5FA]">
              Перезвони мне
            </button>
            {!isAuthenticated && <Link to="/login" onClick={() => setOpen(false)} className="block">Войти</Link>}
            {user && <p className="text-slate-400 text-xs">{user.email}</p>}
          </div>
        )}
      </header>
      <CallbackModal open={cb} onOpenChange={setCb} />
    </>
  );
}
