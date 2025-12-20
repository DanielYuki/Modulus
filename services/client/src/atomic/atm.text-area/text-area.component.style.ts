import { tv, type VariantProps } from 'tailwind-variants';

export const textAreaStyle = tv({
  slots: {
    wrapper: 'flex flex-col gap-2',
    label: 'text-xs font-bold uppercase tracking-wide text-text-main',
    textarea: [
      'w-full px-4 py-4',
      'bg-fixed-white border-2 border-border-strong rounded-md',
      'text-base text-text-main placeholder:text-text-muted',
      'font-mono leading-relaxed',
      'transition-all duration-200',
      'focus:outline-none focus:border-primary-hover focus:bg-primary-light/20 focus:shadow-inner',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'resize-none',
    ],
  },
  variants: {
    error: {
      true: {
        textarea: 'border-status-failed focus:border-status-failed',
      },
    },
  },
});

export type TextAreaStyleProps = VariantProps<typeof textAreaStyle>;
