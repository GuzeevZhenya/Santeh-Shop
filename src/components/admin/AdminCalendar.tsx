import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import type { CalendarNote } from '@/types/database';

const WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function AdminCalendar() {
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [text, setText] = useState('');

  const load = () =>
    supabase
      .from('calendar_notes')
      .select('*')
      .order('note_date')
      .then(({ data }) => setNotes((data as CalendarNote[]) || []));

  useEffect(() => {
    load();
  }, []);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const days = useMemo(() => {
    const first = new Date(year, month, 1);
    const start = (first.getDay() + 6) % 7;
    const count = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = Array(start).fill(null);
    for (let d = 1; d <= count; d++) cells.push(d);
    return cells;
  }, [year, month]);

  const add = async () => {
    if (!text.trim()) return;
    await supabase.from('calendar_notes').insert({
      note_date: selected,
      note: text,
      remind_days: 1,
    });
    setText('');
    load();
  };

  const remove = async (id: string) => {
    await supabase.from('calendar_notes').delete().eq('id', id);
    load();
  };

  const title = cursor.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6">
      <div className="bg-white border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold capitalize">{title}</h3>
          <div className="flex gap-1">
            <button type="button" onClick={() => setCursor(new Date(year, month - 1, 1))} className="p-2">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setCursor(new Date(year, month + 1, 1))} className="p-2">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2">
          {WEEK.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            if (!d) return <div key={i} />;
            const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const active = iso === selected;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(iso)}
                className={`h-10 rounded-lg text-sm ${active ? 'border-2 border-[#2563EB] font-semibold' : 'hover:bg-slate-50'}`}
              >
                {d}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Заметка на выбранную дату" />
          <Button onClick={add}>Добавить</Button>
        </div>
      </div>
      <div className="bg-white border rounded-xl p-4">
        <h3 className="font-semibold mb-3">Все заметки</h3>
        <div className="space-y-2">
          {notes.map((n) => (
            <div key={n.id} className="bg-[#F8FAFC] rounded-lg p-3 text-sm flex gap-2">
              <div className="flex-1">
                {new Date(n.note_date).toLocaleDateString('ru-RU')} — {n.note}
              </div>
              <button type="button" onClick={() => remove(n.id)}>
                <Trash2 className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          ))}
          {!notes.length && <p className="text-slate-400 text-sm">Заметок нет</p>}
        </div>
      </div>
    </div>
  );
}
