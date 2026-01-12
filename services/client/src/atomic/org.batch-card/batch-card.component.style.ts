import { tv, type VariantProps } from 'tailwind-variants';

export const style = tv({
  slots: {
    wrapper: [
      'group relative flex cursor-pointer border-2 bg-fixed-white p-0',
      'transition-all duration-200',
      'hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-geo',
    ],
    statusBar: 'w-2 shrink-0 border-border-strong border-r-2',
    content: 'flex flex-1 items-center justify-between gap-6 p-6',
    leftSection: 'flex items-center gap-4',
    iconBox: 'flex size-12 items-center justify-center border-2',
    infoBlock: 'flex flex-col',
    title: 'mb-1 flex items-center gap-3',
    meta: 'font-mono text-xs text-text-muted uppercase tracking-wide',
    rightSection: 'flex items-center gap-8',
    statBlock: 'flex flex-col items-end',
    statLabel: 'font-mono text-xs text-text-muted uppercase tracking-wide',
    statValue: 'font-bold text-xl',
    arrow: 'text-text-muted/50 transition-all group-hover:translate-x-1 group-hover:text-fixed-black',
  },
  variants: {
    status: {
      completed: {
        wrapper: 'border-border-strong',
        statusBar: 'bg-status-done',
        iconBox: 'border-border-strong bg-fixed-white',
        statValue: 'text-text-main',
      },
      processing: {
        wrapper: 'border-border-strong',
        statusBar: 'bg-primary',
        iconBox: 'border-border-strong bg-fixed-white',
        statValue: 'text-text-main',
      },
      failed: {
        wrapper: 'border-status-failed-border bg-status-failed-bg',
        statusBar: 'bg-status-failed border-status-failed-border',
        iconBox: 'border-status-failed-border bg-fixed-white',
        statValue: 'text-status-failed',
      },
      pending: {
        wrapper: 'border-dashed border-border-strong opacity-75 hover:opacity-100',
        statusBar: 'bg-status-queued',
        iconBox: 'border-dashed border-gray-400 bg-fixed-white',
        statValue: 'text-text-muted',
      },
    },
  },
  defaultVariants: {
    status: 'pending',
  },
});

export type StyleVariants = VariantProps<typeof style>;
