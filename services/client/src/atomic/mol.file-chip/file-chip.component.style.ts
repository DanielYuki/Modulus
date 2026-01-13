import { tv, type VariantProps } from 'tailwind-variants';

export const style = tv({
  slots: {
    wrapper: [
      'flex items-center gap-0',
      'bg-background border-2 border-border-strong overflow-hidden',
      'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
    ],
    icon: ['size-10 flex items-center justify-center text-fixed-black', 'border-r-2 border-border-strong'],
    content: 'flex flex-col px-2 py-0',
    removeBtn: [
      'size-10 flex items-center justify-center',
      'border-l-2 border-border-strong',
      'hover:bg-status-failed hover:text-fixed-white',
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

export type StyleVariants = VariantProps<typeof style>;
