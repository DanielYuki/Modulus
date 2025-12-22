import { tv, type VariantProps } from 'tailwind-variants';

export const style = tv({
  slots: {
    wrapper: 'flex flex-col gap-2',
    label: 'text-xs font-bold uppercase tracking-wide text-text-main',
    select: [
      'w-full pl-3 pr-10 py-3',
      'bg-fixed-white border-2 border-border-strong',
      'text-sm text-text-main font-medium',
      'transition-all duration-200',
      'focus:outline-none focus:ring-0 focus:border-primary-hover focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'appearance-none cursor-pointer',
    ],
  },
  variants: {
    error: {
      true: {
        select: 'border-status-failed focus:border-status-failed',
      },
    },
    inline: {
      true: {
        wrapper: 'flex-row items-center gap-2',
        select: 'w-auto py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
      },
    },
  },
});

export type StyleVariants = VariantProps<typeof style>;
