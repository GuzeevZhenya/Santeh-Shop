export type LoyaltyTier = 'Старт' | 'Серебро' | 'Золото' | 'Платина';

const LEVELS: { tier: LoyaltyTier; from: number; percent: number }[] = [
  { tier: 'Платина', from: 5000, percent: 7 },
  { tier: 'Золото', from: 2000, percent: 5 },
  { tier: 'Серебро', from: 500, percent: 3 },
  { tier: 'Старт', from: 0, percent: 0 },
];

export function computeDiscount(totalSpent: number) {
  const spent = Math.max(0, totalSpent || 0);
  const current = LEVELS.find((l) => spent >= l.from)!;
  const nextLevel = [...LEVELS].reverse().find((l) => l.from > spent);
  return {
    percent: current.percent,
    tier: current.tier,
    next: nextLevel
      ? { diff: nextLevel.from - spent, tier: nextLevel.tier }
      : null,
  };
}

export function promoCode(tier: LoyaltyTier, percent: number) {
  const map: Record<LoyaltyTier, string> = {
    Старт: 'START',
    Серебро: 'SILVER',
    Золото: 'GOLD',
    Платина: 'PLATINUM',
  };
  return `AQUA${map[tier]}${percent}`;
}

export const STATUS: Record<
  string,
  { label: string; cls: string }
> = {
  new: { label: 'Новый', cls: 'bg-blue-50 text-blue-700' },
  processing: { label: 'В обработке', cls: 'bg-amber-50 text-amber-700' },
  completed: { label: 'Выполнен', cls: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Отменён', cls: 'bg-red-50 text-red-700' },
};
