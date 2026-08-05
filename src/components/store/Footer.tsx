import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Droplets } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SiteSettings } from '@/types/database';

export default function Footer() {
  const [s, setS] = useState<Partial<SiteSettings>>({});

  useEffect(() => {
    supabase.from('site_settings').select('*').limit(1).maybeSingle()
      .then(({ data }) => setS(data || {}));
  }, []);

  return (
    <footer className="bg-[#0F172A] text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
            <Droplets className="w-5 h-5" /> АкваМаркет
          </div>
          <p className="text-sm leading-relaxed">
            Интернет-магазин сантехники в Жлобине. Доставка по городу и области.
          </p>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Покупателям</p>
          <div className="space-y-2 text-sm">
            <Link to="/catalog" className="block hover:text-white">Каталог</Link>
            <Link to="/categories" className="block hover:text-white">Категории</Link>
            <Link to="/deals" className="block hover:text-white">Суперцены</Link>
            <Link to="/favorites" className="block hover:text-white">Избранное</Link>
            <Link to="/cart" className="block hover:text-white">Корзина</Link>
            <Link to="/account" className="block hover:text-white">Личный кабинет</Link>
            <Link to="/testimonials" className="block hover:text-white">Отзывы</Link>
          </div>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Информация</p>
          <div className="space-y-2 text-sm">
            <Link to="/contact" className="block hover:text-white">Контакты</Link>
            <Link to="/delivery-payment" className="block hover:text-white">Доставка и оплата</Link>
            <Link to="/returns" className="block hover:text-white">Возврат</Link>
            <Link to="/offer" className="block hover:text-white">Оферта</Link>
            <Link to="/privacy" className="block hover:text-white">Конфиденциальность</Link>
          </div>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Контакты</p>
          <div className="space-y-2 text-sm">
            <p>{s.phone || '+375 (29) 602-01-10'}</p>
            <p>{s.email || 'info@aquamarket.by'}</p>
            <p>{s.address || 'ул. Барташова 1, Жлобин'}</p>
            <p className="text-slate-400">{s.hours || 'Пн–Пт: 9:00 — 20:00'}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} АкваМаркет. Все права защищены.
      </div>
    </footer>
  );
}
