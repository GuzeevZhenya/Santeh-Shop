import { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Clock, Navigation, MessageSquare } from 'lucide-react';
import CallbackModal from '@/components/store/CallbackModal';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { SiteSettings } from '@/types/database';

export default function Contact() {
  const [s, setS] = useState<Partial<SiteSettings> | null>(null);
  const [cbOpen, setCbOpen] = useState(false);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setS(data || null));
  }, []);

  const phone = s?.phone || '+375 (29) 602-01-10';
  const email = s?.email || 'info@aquamarket.by';
  const address = s?.address || 'ул. Барташова 1, Жлобин, Гомельская область';
  const hours = s?.hours || 'Пн–Пт: 9:00 — 20:00 · Сб–Вс: 10:00 — 18:00';
  const mapsLink = `https://yandex.ru/maps/?text=${encodeURIComponent(address)}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Контакты</h1>
      <p className="text-slate-500 mb-10">Свяжитесь с нами — поможем с выбором сантехники.</p>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <Info icon={MapPin} label="Адрес магазина" value={address}>
            <a
              href={mapsLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#2563EB] hover:underline mt-1"
            >
              <Navigation className="w-4 h-4" /> Открыть на карте
            </a>
          </Info>
          <Info icon={Phone} label="Телефон" value={phone} />
          <Info icon={Mail} label="Email" value={email} />
          <Info icon={Clock} label="Режим работы" value={hours} />
          <Button onClick={() => setCbOpen(true)} className="w-full">
            <MessageSquare className="w-4 h-4" /> Заказать обратный звонок
          </Button>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-200 min-h-[320px]">
          <iframe
            title="Карта Жлобин"
            className="w-full h-full min-h-[320px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.openstreetmap.org/export/embed.html?bbox=30.01%2C52.68%2C30.06%2C52.71&layer=mapnik&marker=52.6964%2C30.0347"
          />
        </div>
      </div>

      <CallbackModal open={cbOpen} onOpenChange={setCbOpen} />
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-[#2563EB]" />
      </div>
      <div>
        <p className="text-sm text-slate-400 mb-1">{label}</p>
        <p className="text-[#0F172A] font-medium">{value}</p>
        {children}
      </div>
    </div>
  );
}
