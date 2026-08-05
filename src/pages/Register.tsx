import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/AuthLayout';
import ConsentCheckbox from '@/components/store/ConsentCheckbox';
import { supabase } from '@/lib/supabase';
import { DEFAULT_POLICY_VERSION, logConsent } from '@/lib/siteSettings';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!consent) {
      setError('Необходимо согласие с политикой обработки данных');
      return;
    }
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 6) {
      setError('Пароль не менее 6 символов');
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (!err) {
      try {
        await logConsent({
          source: 'register',
          email,
          policy_version: DEFAULT_POLICY_VERSION,
          meta: { full_name: fullName },
        });
      } catch {
        /* non-blocking */
      }
    }
    setLoading(false);
    if (err) setError(err.message);
    else setDone(true);
  };

  if (done) {
    return (
      <AuthLayout icon={UserPlus} title="Проверьте почту" subtitle="Подтвердите регистрацию по ссылке">
        <Link to="/login" className="block text-center text-[#2563EB] font-medium hover:underline">
          Перейти ко входу
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Регистрация"
      subtitle="Создайте личный кабинет"
      footer={
        <>
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-[#2563EB] font-medium hover:underline">
            Войти
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Имя</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" />
        </div>
        <div>
          <Label>Пароль</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1" />
        </div>
        <div>
          <Label>Подтверждение пароля</Label>
          <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="mt-1" />
        </div>
        <ConsentCheckbox checked={consent} onChange={setConsent} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full h-12" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Зарегистрироваться'}
        </Button>
      </form>
    </AuthLayout>
  );
}
