import { tv, type VariantProps } from 'tailwind-variants';

export const progressBarStyle = tv({
  slots: {
    wrapper: 'w-full space-y-2',
    label: 'flex justify-between items-center',
    labelText: 'text-xs font-bold uppercase tracking-wider text-text-secondary',
    labelPercent: 'text-xs font-bold text-text-main',
    track: 'w-full h-3 bg-gray-200 border-2 border-border-strong overflow-hidden',
    fill: 'h-full border-r-2 border-border-strong transition-all duration-300 ease-out',
  },
  variants: {
    status: {
      active: { fill: 'bg-accent-yellow' },
      done: { fill: 'bg-status-done' },
      failed: { fill: 'bg-status-failed' },
    },
  },
  defaultVariants: {
    status: 'active',
  },
});

export type ProgressBarStyleProps = VariantProps<typeof progressBarStyle>;
