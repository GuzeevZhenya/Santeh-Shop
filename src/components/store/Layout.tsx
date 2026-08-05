import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { X } from 'lucide-react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import CookieBanner from '@/components/store/CookieBanner';
import { FavoritesProvider } from '@/lib/favorites';
import { ViewHistoryProvider } from '@/lib/viewHistory';
import { CompareProvider } from '@/lib/compare';
import { supabase } from '@/lib/supabase';

function AnnouncementBar() {
  const [text, setText] = useState('');
  const [closed, setClosed] = useState(
    () => sessionStorage.getItem('aqua_ann_closed') === '1',
  );

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('announcement')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setText(data?.announcement || ''));
  }, []);

  if (!text || closed) return null;

  return (
    <div className="bg-[#2563EB] text-white text-sm px-4 py-2 flex items-center justify-center gap-3 relative">
      <span>{text}</span>
      <button
        type="button"
        className="absolute right-3"
        onClick={() => {
          sessionStorage.setItem('aqua_ann_closed', '1');
          setClosed(true);
        }}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function StoreLayout() {
  return (
    <FavoritesProvider>
      <ViewHistoryProvider>
        <CompareProvider>
          <div className="min-h-screen flex flex-col bg-white">
            <AnnouncementBar />
            <Navbar />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
            <CookieBanner />
          </div>
        </CompareProvider>
      </ViewHistoryProvider>
    </FavoritesProvider>
  );
}
