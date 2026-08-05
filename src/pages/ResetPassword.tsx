import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/AuthLayout';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) setError(err.message);
    else window.location.href = '/login';
  };

  const hash = window.location.hash;
  if (!hash.includes('type=recovery') && !window.location.search.includes('code=')) {
    // Still allow form if session was restored by Supabase client
  }

  return (
    <AuthLayout
      icon={Lock}
      title="Новый пароль"
      subtitle="Введите новый пароль для аккаунта"
      footer={
        <Link to="/login" className="text-[#2563EB] font-medium hover:underline">
          Ко входу
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Новый пароль</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label>Подтверждение</Label>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" /> {error}
          </p>
        )}
        <Button type="submit" className="w-full h-12" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Сохранить пароль'}
        </Button>
      </form>
    </AuthLayout>
  );
}
