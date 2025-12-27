import { tv, type VariantProps } from 'tailwind-variants';

export const style = tv({
  slots: {
    wrapper: 'flex flex-wrap gap-4',
    button: [
      'bg-fixed-white px-5 py-3 border-2 border-border-strong',
      'flex items-center gap-3',
      'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',

      'cursor-pointer',
      'transition-all duration-200',
      'hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
    ],
    indicator: 'size-2',
    label: 'text-sm font-bold uppercase tracking-wide text-text-main',
  },
  variants: {
    active: {
      true: {
        button: 'bg-primary',
      },
    },
    status: {
      completed: { indicator: 'bg-status-done' },
      processing: { indicator: 'bg-primary animate-pulse' },
      failed: { indicator: 'bg-status-failed' },
      queued: { indicator: 'bg-gray-300' },
    },
  },
  defaultVariants: {
    active: false,
    status: 'queued',
  },
});

export type StyleVariants = VariantProps<typeof style>;
