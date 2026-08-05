import type { LucideIcon } from 'lucide-react';
import {
  Bath, Droplets, ShowerHead, Droplet, Toilet, Armchair, Flame, Heater, LayoutGrid, ShoppingBag,
} from 'lucide-react';

const BY_SLUG: Record<string, LucideIcon> = {
  vanny: Bath,
  rakoviny: Droplets,
  smesiteli: ShowerHead,
  dushevye: Droplet,
  unitazy: Toilet,
  mebel: Armchair,
  vodonagrevateli: Flame,
  polotentsesushiteli: Heater,
};

const BY_ICON: Record<string, LucideIcon> = {
  bath: Bath,
  droplets: Droplets,
  'shower-head': ShowerHead,
  shower: Droplet,
  droplet: Droplet,
  toilet: Toilet,
  cabinet: Armchair,
  flame: Flame,
  heater: Heater,
  grid: LayoutGrid,
};

export function categoryIcon(slug?: string | null, icon?: string | null): LucideIcon {
  if (slug && BY_SLUG[slug]) return BY_SLUG[slug];
  if (icon && BY_ICON[icon]) return BY_ICON[icon];
  return ShoppingBag;
}

export { LayoutGrid };
