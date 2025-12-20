import { tv, type VariantProps } from 'tailwind-variants';

export const badgeStyle = tv({
  base: [
    'inline-flex items-center justify-center',
    'px-2 py-1',
    'text-[10px] font-bold uppercase tracking-widest',
    'border rounded-sm',
  ],
  variants: {
    status: {
      done: 'bg-status-done-bg text-status-done-border border-status-done-border',
      active: 'bg-status-active-bg text-status-active-border border-status-active-border',
      failed: 'bg-status-failed-bg text-status-failed-border border-status-failed-border',
      queued: 'bg-status-queued-bg text-status-queued border-status-queued',
      ready: 'bg-primary text-fixed-black border-border-strong',
    },
  },
  defaultVariants: {
    status: 'queued',
  },
});

export type BadgeStyleProps = VariantProps<typeof badgeStyle>;
