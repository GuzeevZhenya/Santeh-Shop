import { useState } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  src?: string | null;
  alt?: string;
  className?: string;
  fittingType?: 'fill' | 'fit';
};

export function Image({ src, alt = '', className, fittingType = 'fill' }: Props) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return <div className={cn('bg-[#F1F5F9]', className)} aria-label={alt} />;
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErr(true)}
      className={cn(
        fittingType === 'fill' ? 'object-cover' : 'object-contain',
        'w-full h-full',
        className,
      )}
      loading="lazy"
    />
  );
}
