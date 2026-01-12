import { tv, type VariantProps } from 'tailwind-variants';

export const style = tv({
  base: ['inline-flex items-center justify-center', 'px-2 py-1', 'font-bold uppercase tracking-widest', 'border'],
  variants: {
    status: {
      done: 'bg-status-done-bg text-status-done-border border-status-done-border',
      active: 'bg-status-active-bg text-status-active-border border-status-active-border',
      failed: 'bg-status-failed-bg text-status-failed-border border-status-failed-border',
      queued: 'bg-status-queued-bg text-status-queued border-status-queued',
      ready: 'bg-primary text-fixed-black border-border-strong',
      count: 'bg-fixed-black text-fixed-white border-fixed-black', // ? Count name is not clear enough, but i cannot think of a better name for this variant lmao
    },
    size: {
      sm: 'text-[8px]',
      md: 'text-[10px]',
      lg: 'text-[12px] border-2 border-border-strong',
    },
  },
  defaultVariants: {
    status: 'queued',
    size: 'sm',
  },
});

export type StyleVariants = VariantProps<typeof style>;
