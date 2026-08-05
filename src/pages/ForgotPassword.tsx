import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/AuthLayout';
import { supabase } from '@/lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    setSent(true);
  };

  return (
    <AuthLayout
      icon={Mail}
      title="Восстановление пароля"
      subtitle="Мы отправим ссылку для сброса"
      footer={
        <Link to="/login" className="text-[#2563EB] font-medium hover:underline">
          <ArrowLeft className="w-3 h-3 inline mr-1" />
          Назад ко входу
        </Link>
      }
    >
      {sent ? (
        <p className="text-sm text-center text-slate-600">
          Если аккаунт существует, письмо со ссылкой отправлено на {email}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full h-12" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Отправить ссылку'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
