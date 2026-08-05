import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { SiteSettings } from '@/types/database';

export const DEFAULT_POLICY_VERSION = '2026-08-05';

export const defaultSiteSettings: Partial<SiteSettings> = {
  phone: '+375 (29) 602-01-10',
  email: 'info@aquamarket.by',
  address: 'ул. Барташова 1, Жлобин, Гомельская область',
  hours: 'Пн–Пт: 9:00 — 20:00 · Сб–Вс: 10:00 — 18:00',
  legal_name: 'АкваМаркет',
  unp: '',
  legal_address: 'ул. Барташова 1, Жлобин, Гомельская область',
  privacy_version: DEFAULT_POLICY_VERSION,
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setSettings(data as SiteSettings | null);
        setLoading(false);
      });
  }, []);

  return {
    settings: settings
      ? { ...defaultSiteSettings, ...settings }
      : (defaultSiteSettings as SiteSettings),
    loading,
    raw: settings,
  };
}

export async function logConsent(params: {
  source: 'checkout' | 'callback' | 'register' | 'review' | 'testimonial' | 'cookie';
  policy_version?: string;
  email?: string | null;
  phone?: string | null;
  meta?: Record<string, unknown>;
}) {
  await supabase.rpc('log_consent', {
    p_source: params.source,
    p_policy_version: params.policy_version || DEFAULT_POLICY_VERSION,
    p_email: params.email || null,
    p_phone: params.phone || null,
    p_meta: params.meta || {},
  });
}
