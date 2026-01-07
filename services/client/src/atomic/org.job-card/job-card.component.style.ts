import { tv, type VariantProps } from 'tailwind-variants';

export const style = tv({
  slots: {
    wrapper: [
      'bg-fixed-white border-2 border-border-strong',
      'flex flex-col overflow-hidden',
      'transition-all duration-200',
    ],
    header: 'p-6 flex flex-col gap-4',
    headerTop: 'flex items-start justify-between',
    headerLeft: 'flex items-center gap-4',
    icon: 'size-12 border-2 border-border-strong flex items-center justify-center',
    info: 'flex flex-col',
    filename: 'font-bold text-text-main truncate max-w-[150px] text-lg',
    meta: 'text-xs text-text-muted font-mono mt-1',
    body: 'flex flex-col gap-2 mt-4',
    error: 'p-3 bg-fixed-white border-2 border-status-failed/20 text-xs text-status-failed font-mono leading-relaxed',
    footer: 'border-t-2 border-border-strong p-4 flex gap-3 mt-auto bg-gray-50',
    footerBtn: ['flex-1 h-10 font-bold text-sm flex items-center justify-center gap-2 uppercase tracking-wide'],
  },
  variants: {
    status: {
      done: {
        wrapper: 'hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
        icon: 'bg-primary text-fixed-black',
      },
      active: {
        wrapper: 'shadow-[4px_4px_0px_0px_rgba(249,245,6,1)]',
        icon: 'bg-fixed-white text-fixed-black',
      },
      failed: {
        wrapper:
          'bg-status-failed-bg border-status-failed-border hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(153,27,27,1)]',
        icon: 'bg-fixed-white border-status-failed-border text-status-failed',
        footer: 'border-status-failed-border bg-status-failed/10',
      },
      queued: {
        wrapper: 'bg-gray-50 border-dashed opacity-75 hover:opacity-100',
        icon: 'bg-fixed-white border-gray-400 border-dashed text-text-muted',
        footer: 'border-dashed',
      },
    },
  },
  defaultVariants: {
    status: 'queued',
  },
});

export type StyleVariants = VariantProps<typeof style>;
