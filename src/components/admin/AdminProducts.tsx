import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, Upload } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { uploadProductImage } from '@/lib/uploadImage';
import { formatPrice } from '@/lib/utils';
import type { Category, Product } from '@/types/database';

const empty = {
  name: '',
  price: 0,
  old_price: null as number | null,
  brand: '',
  description: '',
  image_url: '',
  category_id: '',
  is_active: true,
  is_deal_of_day: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setProducts((data as Product[]) || []));
    supabase
      .from('categories')
      .select('*')
      .order('sort_order')
      .then(({ data }) => setCats((data as Category[]) || []));
  };
  useEffect(load, []);

  const onFile = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      setForm((f) => ({ ...f, image_url: url }));
    } catch {
      alert('Не удалось загрузить файл. Проверьте Storage bucket product-images и роль admin.');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    const payload = {
      ...form,
      price: Number(form.price),
      old_price: form.old_price ? Number(form.old_price) : null,
      category_id: form.category_id || null,
    };
    if (editId) await supabase.from('products').update(payload).eq('id', editId);
    else await supabase.from('products').insert(payload);
    setOpen(false);
    setEditId(null);
    setForm(empty);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Удалить товар?')) return;
    await supabase.from('products').delete().eq('id', id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-500">{products.length} товаров</p>
        <Button
          onClick={() => {
            setEditId(null);
            setForm(empty);
            setOpen(true);
          }}
        >
          <Plus className="w-4 h-4" /> Добавить товар
        </Button>
      </div>

      {open && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 space-y-3">
          <Input
            placeholder="Название"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              placeholder="Цена"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
            <Input
              type="number"
              placeholder="Старая цена"
              value={form.old_price ?? ''}
              onChange={(e) =>
                setForm({ ...form, old_price: e.target.value ? Number(e.target.value) : null })
              }
            />
          </div>
          <Input
            placeholder="Бренд"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
          />
          <Input
            placeholder="URL изображения"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Загрузка...' : 'Загрузить в Storage'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>
          <select
            className="w-full h-11 rounded-lg border border-slate-200 px-3 text-sm"
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          >
            <option value="">Без категории</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <textarea
            className="w-full rounded-lg border border-slate-200 p-3 text-sm"
            rows={3}
            placeholder="Описание"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_deal_of_day}
              onChange={(e) => setForm({ ...form, is_deal_of_day: e.target.checked })}
            />
            Акция дня
          </label>
          <div className="flex gap-2">
            <Button onClick={save}>Сохранить</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {products.map((p) => {
          const cat = cats.find((c) => c.id === p.category_id);
          return (
            <div
              key={p.id}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F8FAFC] shrink-0">
                <Image src={p.image_url} alt="" fittingType="fill" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-sm text-slate-500">
                  {cat?.name || '—'} · {formatPrice(p.price)}
                </p>
              </div>
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-[#2563EB]"
                onClick={() => {
                  setEditId(p.id);
                  setForm({
                    name: p.name,
                    price: p.price,
                    old_price: p.old_price,
                    brand: p.brand || '',
                    description: p.description || '',
                    image_url: p.image_url || '',
                    category_id: p.category_id || '',
                    is_active: p.is_active,
                    is_deal_of_day: p.is_deal_of_day,
                  });
                  setOpen(true);
                }}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-red-500"
                onClick={() => remove(p.id)}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
