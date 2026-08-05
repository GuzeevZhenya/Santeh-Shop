import { createClient } from '@supabase/supabase-js';

/**
 * Vite вшивает VITE_* только на этапе build.
 * На Vercel часто остаются плейсхолдеры / secret — поэтому URL и
 * publishable-ключ заданы явно (anon/publishable предназначен для браузера + RLS).
 */
const PROJECT_URL = 'https://jkogmgbxmcqtqdiwkbgh.supabase.co';
const PUBLISHABLE_KEY =
  'sb_publishable_s073TrV0jKjPptLr3Djk7A_duwLEbX_';

const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

const urlOk =
  !!envUrl &&
  !/your_project_ref|YOUR_PROJECT|placeholder\.supabase/i.test(envUrl);

const keyOk =
  !!envKey &&
  !envKey.startsWith('sb_secret_') &&
  !envKey.includes('service_role') &&
  !envKey.includes('your_anon') &&
  (envKey.startsWith('sb_publishable_') || envKey.startsWith('eyJ'));

if (!urlOk || !keyOk) {
  console.warn(
    '[AquaMarket] Vercel env некорректны — используется встроенный publishable-ключ проекта Sanhehnika.',
  );
}

export const supabase = createClient(
  urlOk ? envUrl! : PROJECT_URL,
  keyOk ? envKey! : PUBLISHABLE_KEY,
);
