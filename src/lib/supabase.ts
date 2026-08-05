import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  console.warn(
    '[AquaMarket] Укажите VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env',
  );
}

if (anonKey && (anonKey.includes('service_role') || anonKey.startsWith('sb_secret_'))) {
  console.error(
    '[AquaMarket] В .env попал SECRET-ключ. Нужен anon/publishable (eyJ... или sb_publishable_...). Secret в браузере запрещён.',
  );
}

export const supabase = createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder');
