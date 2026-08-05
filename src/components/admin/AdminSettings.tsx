import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { DEFAULT_POLICY_VERSION } from '@/lib/siteSettings';
import type { ConsentLog, SiteSettings } from '@/types/database';

const emptyForm = {
  phone: '',
  email: '',
  address: '',
  hours: '',
  announcement: '',
  legal_name: '',
  unp: '',
  legal_address: '',
  privacy_version: DEFAULT_POLICY_VERSION,
};

export default function AdminSettings() {
  const [id, setId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(false);
  const [consents, setConsents] = useState<ConsentLog[]>([]);

  const loadConsents = () => {
    supabase
      .from('consent_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => setConsents((data as ConsentLog[]) || []));
  };

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const s = data as SiteSettings;
        setId(s.id);
        setForm({
          phone: s.phone || '',
          email: s.email || '',
          address: s.address || '',
          hours: s.hours || '',
          announcement: s.announcement || '',
          legal_name: s.legal_name || '',
          unp: s.unp || '',
          legal_address: s.legal_address || '',
          privacy_version: s.privacy_version || DEFAULT_POLICY_VERSION,
        });
      });
    loadConsents();
  }, []);

  const save = async () => {
    if (id) await supabase.from('site_settings').update(form).eq('id', id);
    else {
      const { data } = await supabase.from('site_settings').insert(form).select().single();
      setId(data?.id || null);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fields: [keyof typeof emptyForm, string, string?][] = [
    ['phone', 'Телефон'],
    ['email', 'Email'],
    ['address', 'Адрес магазина'],
    ['hours', 'Режим работы'],
    ['announcement', 'Объявление на сайте'],
    ['legal_name', 'Юр. наименование (ИП/ООО)'],
    ['unp', 'УНП', 'Обязательно перед публикацией'],
    ['legal_address', 'Юридический адрес'],
    ['privacy_version', 'Версия политики ПДн'],
  ];

  return (
    <div className="space-y-10">
      <div className="max-w-xl space-y-4">
        <p className="text-sm text-slate-500">
          Контакты — в шапке и футере. Юр. реквизиты — в оферте и политике ПДн.
        </p>
        {fields.map(([key, label, hint]) => (
          <div key={key}>
            <Label>{label}</Label>
            {hint && <p className="text-xs text-amber-600 mt-0.5">{hint}</p>}
            <Input
              className="mt-1"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={key === 'announcement' ? 'Например: магазин закрыт...' : undefined}
            />
          </div>
        ))}
        <Button onClick={save}>Сохранить</Button>
        {saved && <p className="text-sm text-emerald-600">Сохранено</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#0F172A]">Журнал согласий (ПДн)</h3>
          <button type="button" onClick={loadConsents} className="text-sm text-[#2563EB] hover:underline">
            Обновить
          </button>
        </div>
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left p-3">Дата</th>
                <th className="text-left p-3">Источник</th>
                <th className="text-left p-3">Версия</th>
                <th className="text-left p-3">Контакт</th>
              </tr>
            </thead>
            <tbody>
              {consents.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="p-3 whitespace-nowrap">
                    {new Date(c.created_at).toLocaleString('ru-RU')}
                  </td>
                  <td className="p-3">{c.source}</td>
                  <td className="p-3 font-mono text-xs">{c.policy_version}</td>
                  <td className="p-3 text-slate-600">{c.email || c.phone || '—'}</td>
                </tr>
              ))}
              {!consents.length && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400">
                    Записей пока нет (нужна миграция 002)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
