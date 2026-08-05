import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const PROJECT_URL = 'https://jkogmgbxmcqtqdiwkbgh.supabase.co';

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

const urlIsPlaceholder =
  !url || /your_project_ref|YOUR_PROJECT|placeholder\.supabase/i.test(url);

const keyIsSecret =
  !!anonKey &&
  (anonKey.startsWith('sb_secret_') || anonKey.includes('service_role'));

const keyIsMissing =
  !anonKey ||
  anonKey === 'placeholder' ||
  anonKey.includes('your_anon');

const keyOk =
  !!anonKey &&
  !keyIsSecret &&
  !keyIsMissing &&
  (anonKey.startsWith('sb_publishable_') || anonKey.startsWith('eyJ'));

if (urlIsPlaceholder || keyIsSecret || keyIsMissing || !keyOk) {
  console.error(
    '[AquaMarket] Неверные VITE_SUPABASE_* в этой сборке.\n' +
      `  URL: ${url || '(пусто)'}\n` +
      `  KEY: ${
        keyIsSecret
          ? 'SECRET — в браузере запрещён'
          : keyIsMissing
            ? '(пусто / заглушка)'
            : anonKey?.startsWith('sb_publishable_')
              ? 'publishable'
              : anonKey?.startsWith('eyJ')
                ? 'jwt anon'
                : 'неизвестный формат'
      }\n` +
      'Vercel → Settings → Environment Variables (Production):\n' +
      `  VITE_SUPABASE_URL=${PROJECT_URL}\n` +
      '  VITE_SUPABASE_ANON_KEY=sb_publishable_... (как в локальном .env)\n' +
      'Затем Deployments → ⋮ → Redeploy (без кэша).',
  );
}

export const supabase = createClient<Database>(
  urlIsPlaceholder ? PROJECT_URL : url!,
  keyOk ? anonKey! : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid',
);
