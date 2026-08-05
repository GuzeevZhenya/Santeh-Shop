import { useState } from 'react';
import { Phone, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ConsentCheckbox from '@/components/store/ConsentCheckbox';
import { supabase } from '@/lib/supabase';
import { DEFAULT_POLICY_VERSION, logConsent } from '@/lib/siteSettings';

export default function CallbackModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+375 (');
  const [purpose, setPurpose] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.replace(/\D/g, '').length) {
      setError('Укажите телефон');
      return;
    }
    if (!consent) {
      setError('Нужно согласие на обработку данных');
      return;
    }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.from('callbacks').insert({
      name: name || null,
      phone,
      purpose: purpose || null,
      status: 'new',
      consent_at: new Date().toISOString(),
      policy_version: DEFAULT_POLICY_VERSION,
    });
    if (!err) {
      try {
        await logConsent({
          source: 'callback',
          phone,
          policy_version: DEFAULT_POLICY_VERSION,
          meta: { name, purpose },
        });
      } catch {
        /* non-blocking */
      }
    }
    setLoading(false);
    if (err) setError('Не удалось отправить заявку');
    else setDone(true);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setDone(false);
          setError('');
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#2563EB]" /> Перезвоните мне
          </DialogTitle>
        </DialogHeader>
        {done ? (
          <div className="text-center py-6">
            <Check className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-medium text-[#0F172A]">Заявка принята</p>
            <p className="text-sm text-slate-500 mt-1">Мы перезвоним в ближайшее время</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Input placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              placeholder="+375 (29) ___-__-__"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full h-11 rounded-lg border border-slate-200 px-3 text-sm"
            >
              <option value="">Цель звонка (необязательно)</option>
              <option value="Покупка товара">Покупка товара</option>
              <option value="Консультация">Консультация</option>
              <option value="Доставка">Доставка</option>
              <option value="Другое">Другое</option>
            </select>
            <ConsentCheckbox checked={consent} onChange={setConsent} />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Отправка...' : 'Заказать звонок'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
