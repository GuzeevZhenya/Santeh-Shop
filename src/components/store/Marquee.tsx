import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Marquee() {
  const [text, setText] = useState('');

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('announcement')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setText(data?.announcement || ''));
  }, []);

  if (!text) return null;

  return (
    <div className="bg-[#0F172A] text-white overflow-hidden py-2">
      <div className="animate-marquee whitespace-nowrap text-sm">
        <span className="mx-8">{text}</span>
        <span className="mx-8">{text}</span>
        <span className="mx-8">{text}</span>
      </div>
    </div>
  );
}
