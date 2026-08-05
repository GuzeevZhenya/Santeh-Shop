import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Droplets } from 'lucide-react';

type Props = {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }: Props) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4 py-10">
      <Link to="/" className="mb-8 flex items-center gap-2 text-[#0F172A] font-bold text-xl">
        <Droplets className="w-7 h-7 text-[#2563EB]" />
        АкваМаркет
      </Link>
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-6">
          {Icon && (
            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-[#2563EB]/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-[#2563EB]" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-[#0F172A]">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {children}
        {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
      </div>
    </div>
  );
}
