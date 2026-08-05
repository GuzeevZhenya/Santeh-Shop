import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { uploadProductImage } from '@/lib/uploadImage';
import type { Banner } from '@/types/database';

export default function AdminBanners() {
  const [items, setItems] = useState<Banner[]>([]);
  const [form, setForm] = useState({ title: '', subtitle: '', image_url: '', badge: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () =>
    supabase
      .from('banners')
      .select('*')
      .order('sort_order')
      .then(({ data }) => setItems((data as Banner[]) || []));

  useEffect(() => {
    load();
  }, []);

  const onFile = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      setForm((f) => ({ ...f, image_url: url }));
    } catch {
      alert('Не удалось загрузить. Нужны миграция 002 (Storage) и роль admin.');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.title || !form.image_url) return;
    if (editId) await supabase.from('banners').update(form).eq('id', editId);
    else await supabase.from('banners').insert({ ...form, is_active: true, sort_order: items.length });
    setOpen(false);
    setEditId(null);
    setForm({ title: '', subtitle: '', image_url: '', badge: '' });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Удалить баннер?')) return;
    await supabase.from('banners').delete().eq('id', id);
    load();
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <p className="text-slate-500">{items.length} баннеров</p>
        <Button onClick={() => { setOpen(true); setEditId(null); }}>
          <Plus className="w-4 h-4" /> Добавить баннер
        </Button>
      </div>
      {open && (
        <div className="bg-white border rounded-xl p-4 mb-4 space-y-3">
          <Input placeholder="Заголовок" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input placeholder="Подзаголовок" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          <Input placeholder="URL изображения" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Загрузка...' : 'Загрузить в Storage'}</span>
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
          <Input placeholder="Бейдж" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
          <div className="flex gap-2">
            <Button onClick={save}>Сохранить</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {items.map((b) => (
          <div key={b.id} className="bg-white border rounded-xl p-4 flex gap-4 items-center">
            <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
              <Image src={b.image_url} alt="" fittingType="fill" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{b.title}</p>
              <p className="text-sm text-slate-500">{b.subtitle}</p>
            </div>
            <button type="button" onClick={() => { setEditId(b.id); setForm({ title: b.title, subtitle: b.subtitle || '', image_url: b.image_url, badge: b.badge || '' }); setOpen(true); }}>
              <Pencil className="w-4 h-4 text-slate-400" />
            </button>
            <button type="button" onClick={() => remove(b.id)}>
              <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
