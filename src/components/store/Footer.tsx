import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SiteSettings } from '@/types/database';

export default function Footer() {
  const [s, setS] = useState<Partial<SiteSettings>>({});

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setS(data || {}));
  }, []);

  const phone = s.phone || '+375 (29) 602-01-10';
  const email = s.email || 'info@aquamarket.by';
  const address = s.address || 'ул. Барташова 1, Жлобин, Гомельская область';
  const hours = s.hours || 'Пн–Пт: 9:00 — 20:00 · Сб–Вс: 10:00 — 18:00';
  const legalName = s.legal_name || 'ИП Фамилия И. О.';
  const unp = s.unp?.trim() || '000000000';

  return (
    <footer className="bg-[#0F172A] text-slate-300 mt-0">
      <div className="max-w-7xl mx-auto px-4 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
            <Droplets className="w-5 h-5 text-[#60A5FA]" /> АкваМаркет
          </div>
          <p className="text-sm leading-relaxed mb-4">
            Премиальная сантехника для современных интерьеров. Магазин в Жлобине.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            {legalName}
            <br />
            УНП {unp}
            <br />
            г. Жлобин, Гомельская область
          </p>
        </div>

        <div>
          <p className="text-white font-semibold mb-3">Каталог</p>
          <div className="space-y-2 text-sm">
            <Link to="/catalog" className="block hover:text-white">Все товары</Link>
            <Link to="/deals" className="block hover:text-white">Суперцены</Link>
            <Link to="/search" className="block hover:text-white">Поиск товара</Link>
            <Link to="/favorites" className="block hover:text-white">Избранное</Link>
            <Link to="/cart" className="block hover:text-white">Корзина</Link>
            <Link to="/account" className="block hover:text-white">Личный кабинет</Link>
            <Link to="/testimonials" className="block hover:text-white">Отзывы</Link>
            <Link to="/contact" className="block hover:text-white">Контакты</Link>
            <Link to="/delivery-payment" className="block hover:text-white">Доставка и оплата</Link>
            <Link to="/returns" className="block hover:text-white">Возврат товара</Link>
          </div>
        </div>

        <div>
          <p className="text-white font-semibold mb-3">Контакты</p>
          <div className="space-y-3 text-sm">
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-start gap-2 hover:text-white">
              <Phone className="w-4 h-4 text-[#60A5FA] mt-0.5 shrink-0" />
              {phone}
            </a>
            <a href={`mailto:${email}`} className="flex items-start gap-2 hover:text-white">
              <Mail className="w-4 h-4 text-[#60A5FA] mt-0.5 shrink-0" />
              {email}
            </a>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#60A5FA] mt-0.5 shrink-0" />
              {address}
            </p>
          </div>
        </div>

        <div>
          <p className="text-white font-semibold mb-3">Режим работы</p>
          <div className="space-y-3 text-sm">
            <p className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-[#60A5FA] mt-0.5 shrink-0" />
              <span className="whitespace-pre-line">{hours.replace(' · ', '\n')}</span>
            </p>
            <p>Доставка по Жлобину и району</p>
            <p className="text-slate-500 text-xs leading-relaxed">
              Принимаем заявки онлайн — оплата при получении.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} АкваМаркет. Все права защищены.
        {' · '}
        <Link to="/offer" className="hover:text-slate-300">Оферта</Link>
        {' '}
        <Link to="/privacy" className="hover:text-slate-300">Политика данных</Link>
      </div>
    </footer>
  );
}
