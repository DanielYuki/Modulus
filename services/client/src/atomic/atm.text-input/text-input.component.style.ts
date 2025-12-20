import { tv, type VariantProps } from 'tailwind-variants';

export const textInputStyle = tv({
  slots: {
    wrapper: 'flex flex-col gap-2',
    label: 'text-xs font-bold uppercase tracking-wide text-text-main',
    input: [
      'w-full px-3 py-3',
      'bg-fixed-white border-2 border-border-strong',
      'text-sm text-text-main placeholder:text-text-muted',
      'font-medium',
      'transition-all duration-200',
      'focus:outline-none focus:border-primary-hover focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ],
  },
  variants: {
    error: {
      true: {
        input: 'border-status-failed focus:border-status-failed',
      },
    },
  },
});

export type TextInputStyleProps = VariantProps<typeof textInputStyle>;
