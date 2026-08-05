import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types/database';

export default function AdminCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const load = () =>
    supabase
      .from('categories')
      .select('*')
      .order('sort_order')
      .then(({ data }) => setItems((data as Category[]) || []));

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!name || !slug) return;
    await supabase.from('categories').insert({
      name,
      slug,
      sort_order: items.length + 1,
    });
    setName('');
    setSlug('');
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Удалить категорию?')) return;
    await supabase.from('categories').delete().eq('id', id);
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        <Input placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} className="max-w-xs" />
        <Input placeholder="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="max-w-xs" />
        <Button onClick={add}>
          <Plus className="w-4 h-4" /> Добавить
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((c) => (
          <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-slate-400">{c.slug}</p>
            </div>
            <button type="button" onClick={() => remove(c.id)} className="text-slate-400 hover:text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
