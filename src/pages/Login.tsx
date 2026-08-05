import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/AuthLayout';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) setError(err.message || 'Неверный email или пароль');
    else window.location.href = '/';
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="С возвращением"
      subtitle="Войдите в личный кабинет"
      footer={
        <>
          Нет аккаунта?{' '}
          <Link to="/register" className="text-[#2563EB] font-medium hover:underline">
            Зарегистрироваться
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="password">Пароль</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-[#2563EB] hover:underline">
            Забыли пароль?
          </Link>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full h-12" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Войти'}
        </Button>
      </form>
    </AuthLayout>
  );
}
