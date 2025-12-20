import { tv, type VariantProps } from 'tailwind-variants';

export const fileChipStyle = tv({
  slots: {
    wrapper: [
      'flex items-center gap-0',
      'bg-background border-2 border-border-strong rounded-md overflow-hidden',
      'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
    ],
    icon: [
      'size-10 flex items-center justify-center text-fixed-black',
      'border-r-2 border-border-strong',
    ],
    content: 'flex flex-col px-3 py-1',
    filename: 'text-sm font-bold text-text-main',
    status: 'text-[10px] text-text-secondary font-mono uppercase font-bold tracking-tight',
    removeBtn: [
      'size-10 flex items-center justify-center',
      'text-text-secondary',
      'border-l-2 border-border-strong',
      'hover:bg-fixed-black hover:text-fixed-white',
      'transition-colors cursor-pointer',
    ],
  },
  variants: {
    fileType: {
      pdf: { icon: 'bg-primary' },
      tex: { icon: 'bg-fixed-white' },
    },
  },
  defaultVariants: {
    fileType: 'pdf',
  },
});

export type FileChipStyleProps = VariantProps<typeof fileChipStyle>;
