import { useEffect, useState } from 'react';
import { Shield, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types/database';

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const load = () => {
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setUsers((data as Profile[]) || []));
  };

  useEffect(load, []);

  const setRole = async (id: string, role: UserRole) => {
    if (id === user?.id && role !== 'admin') {
      setMsg('Нельзя снять с себя роль админа');
      return;
    }
    setBusy(id);
    setMsg('');
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    setBusy(null);
    if (error) setMsg(error.message);
    else load();
  };

  return (
    <div>
      <p className="text-slate-500 mb-4">Зарегистрировано пользователей: {users.length}</p>
      {msg && <p className="text-sm text-red-500 mb-3">{msg}</p>}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F8FAFC] text-slate-500">
            <tr>
              <th className="text-left p-3 font-medium">Пользователь</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Роль</th>
              <th className="text-left p-3 font-medium">Регистрация</th>
              <th className="text-left p-3 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                    {u.full_name || '—'}
                  </div>
                </td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      u.role === 'admin'
                        ? 'bg-blue-50 text-[#2563EB]'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {u.role === 'admin' ? (
                      <Shield className="w-3 h-3" />
                    ) : (
                      <User className="w-3 h-3" />
                    )}
                    {u.role === 'admin' ? 'Админ' : 'Клиент'}
                  </span>
                </td>
                <td className="p-3 text-slate-500">
                  {new Date(u.created_at).toLocaleDateString('ru-RU')}
                </td>
                <td className="p-3">
                  {busy === u.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  ) : u.role === 'admin' ? (
                    <button
                      type="button"
                      disabled={u.id === user?.id}
                      onClick={() => setRole(u.id, 'user')}
                      className="text-xs text-slate-500 hover:text-red-500 disabled:opacity-40"
                    >
                      Снять админа
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRole(u.id, 'admin')}
                      className="text-xs text-[#2563EB] hover:underline"
                    >
                      Сделать админом
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 mt-3">
        Первый админ: shyst.evgeny@mail.ru. Дальше назначайте роли здесь.
      </p>
    </div>
  );
}
