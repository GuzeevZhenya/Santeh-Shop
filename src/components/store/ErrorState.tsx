import { Button } from '@/components/ui/button';

export default function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="text-center py-12">
      <p className="text-slate-500 mb-4">Не удалось загрузить данные</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Повторить
        </Button>
      )}
    </div>
  );
}
