import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_POLICY_VERSION, logConsent } from '@/lib/siteSettings';

const KEY = 'aqua_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => {
    try {
      return localStorage.getItem(KEY) !== '1';
    } catch {
      return true;
    }
  });

  if (!visible) return null;

  const accept = async () => {
    localStorage.setItem(KEY, '1');
    setVisible(false);
    try {
      await logConsent({
        source: 'cookie',
        policy_version: DEFAULT_POLICY_VERSION,
        meta: { storage: ['localStorage', 'cookies'] },
      });
    } catch {
      /* non-blocking */
    }
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 pointer-events-none">
      <div className="max-w-3xl mx-auto bg-[#0F172A] text-white rounded-xl p-4 shadow-lg pointer-events-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <p className="text-sm text-slate-200 flex-1 leading-relaxed">
          Мы используем cookies и localStorage (корзина, избранное, сравнение) для работы сайта.
          Продолжая, вы соглашаетесь с{' '}
          <Link to="/privacy" className="text-[#60A5FA] underline">
            политикой обработки персональных данных
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          Принимаю
        </button>
      </div>
    </div>
  );
}
