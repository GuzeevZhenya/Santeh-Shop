import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight, Sparkles, Star, Truck, Shield, Tag } from 'lucide-react';
import ProductCard from '@/components/store/ProductCard';
import CategoryGrid from '@/components/store/CategoryGrid';
import BrandStrip from '@/components/store/BrandStrip';
import ErrorState from '@/components/store/ErrorState';
import Recommendations from '@/components/store/Recommendations';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/database';

const MAX = 8;
const DEALS_MAX = 4;

export default function Home() {
  const [deals, setDeals] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('is_deal_of_day', true)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(DEALS_MAX)
      .then(async ({ data, error }) => {
        if (error) {
          setErrors((e) => ({ ...e, deals: true }));
          return;
        }
        let list = (data as Product[]) || [];
        // Добираем товары со скидкой, если акций дня мало
        if (list.length < DEALS_MAX) {
          const { data: discounted } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .not('old_price', 'is', null)
            .order('rating', { ascending: false })
            .limit(DEALS_MAX);
          const ids = new Set(list.map((p) => p.id));
          for (const p of (discounted as Product[]) || []) {
            if (list.length >= DEALS_MAX) break;
            if (!ids.has(p.id) && p.old_price && p.old_price > p.price) {
              list.push(p);
              ids.add(p.id);
            }
          }
        }
        setDeals(list.slice(0, DEALS_MAX));
      });

    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .limit(MAX)
      .then(({ data, error }) => {
        if (error) setErrors((e) => ({ ...e, best: true }));
        else setBestsellers((data as Product[]) || []);
      });

    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(MAX)
      .then(({ data, error }) => {
        if (error) setErrors((e) => ({ ...e, new: true }));
        else setNewArrivals((data as Product[]) || []);
      });
  }, []);

  return (
    <div>
      <BrandStrip />
      <HeroCarousel />
      <CategoryGrid showAllCard />

      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white rounded-xl px-6 py-4">
          <div className="flex items-center gap-3">
            <Tag className="w-6 h-6" />
            <p className="font-medium">
              Промокод <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">NEW5</span> — скидка 5% на первый заказ
            </p>
          </div>
          <Link
            to="/catalog"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium hover:gap-2.5 transition-all"
          >
            В каталог <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Section title="Акция дня" icon={<Flame className="w-6 h-6 text-[#2563EB]" />} link="/deals">
        {errors.deals ? (
          <ErrorState onRetry={() => window.location.reload()} />
        ) : deals.length === 0 ? (
          <p className="text-slate-400 text-sm">Скоро появятся акции дня</p>
        ) : (
          <Grid>
            {deals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Grid>
        )}
      </Section>

      <Section title="Бестселлеры" icon={<Star className="w-6 h-6 text-[#2563EB]" />} link="/catalog">
        {errors.best ? (
          <ErrorState />
        ) : (
          <Grid>
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Grid>
        )}
      </Section>

      <section className="bg-[#0F172A] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Truck,
              t: 'Доставка по Жлобину',
              d: 'Бесплатно от 150 руб., по району — по согласованию.',
            },
            {
              icon: Shield,
              t: 'Гарантия качества',
              d: 'Официальная гарантия на всю сантехнику от производителя.',
            },
            {
              icon: Sparkles,
              t: 'Скидки для клиентов',
              d: 'Персональная скидка за каждую покупку и промокоды.',
            },
          ].map((f, idx) => {
            const I = f.icon;
            return (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <I className="w-6 h-6 text-[#60A5FA]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{f.t}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.d}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Section title="Новинки" icon={<Sparkles className="w-6 h-6 text-[#2563EB]" />} link="/catalog">
        {errors.new ? (
          <ErrorState />
        ) : (
          <Grid>
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Grid>
        )}
      </Section>

      <Recommendations />
    </div>
  );
}

function Section({
  title,
  icon,
  link,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  link?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#2563EB]/10 p-2.5 rounded-lg">{icon}</div>
          <h2 className="text-2xl font-bold text-[#0F172A]">{title}</h2>
        </div>
        {link && (
          <Link
            to={link}
            className="flex items-center gap-1.5 text-[#2563EB] hover:gap-2.5 transition-all font-medium text-sm"
          >
            Смотреть все <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">{children}</div>;
}

function SkeletonGrid({ n }: { n: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {[...Array(n)].map((_, i) => (
        <div key={i} className="aspect-[4/5] rounded-xl bg-[#F8FAFC] animate-pulse" />
      ))}
    </div>
  );
}
