import { Link } from 'react-router-dom';

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  includeOffer?: boolean;
  className?: string;
};

export default function ConsentCheckbox({
  checked,
  onChange,
  includeOffer = false,
  className = '',
}: Props) {
  return (
    <label className={`flex items-start gap-3 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] shrink-0"
      />
      <span className="text-xs text-slate-500 leading-relaxed">
        Я соглашаюсь с{' '}
        {includeOffer && (
          <>
            <Link to="/offer" target="_blank" className="text-[#2563EB] hover:underline">
              публичной офертой
            </Link>{' '}
            и{' '}
          </>
        )}
        <Link to="/privacy" target="_blank" className="text-[#2563EB] hover:underline">
          политикой обработки персональных данных
        </Link>
        .
      </span>
    </label>
  );
}
