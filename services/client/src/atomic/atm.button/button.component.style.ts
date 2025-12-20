import { tv, type VariantProps } from 'tailwind-variants';

export const buttonStyle = tv({
  base: [
    'inline-flex items-center justify-center gap-2',
    'font-bold text-sm uppercase tracking-wide',
    'border-2 border-border-strong',
    'transition-all duration-200',
    'focus:outline-none',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'cursor-pointer',
    'rounded-md',
  ],
  variants: {
    variant: {
      primary: [
        'bg-primary text-fixed-black',
        'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
        'hover:bg-primary-hover',
        'active:shadow-none active:translate-x-[2px] active:translate-y-[2px]',
      ],
      secondary: [
        'bg-fixed-white text-fixed-black',
        'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
        'hover:bg-surface',
        'active:shadow-none active:translate-x-[2px] active:translate-y-[2px]',
      ],
      dark: [
        'bg-fixed-black text-fixed-white',
        'shadow-[2px_2px_0px_0px_rgba(100,100,100,1)]',
        'hover:bg-gray-900',
        'active:shadow-none active:translate-x-[2px] active:translate-y-[2px]',
      ],
      ghost: [
        'bg-transparent border-transparent text-text-secondary',
        'hover:bg-surface hover:border-border-strong',
        'shadow-none',
      ],
      danger: [
        'bg-status-failed text-fixed-white border-status-failed-border',
        'shadow-[2px_2px_0px_0px_rgba(127,29,29,1)]',
        'hover:opacity-90',
        'active:shadow-none active:translate-x-[2px] active:translate-y-[2px]',
      ],
    },
    size: {
      sm: 'h-10 px-4 text-xs',
      md: 'h-10 px-6 text-sm',
      lg: 'h-12 px-8 text-base',
    },
    fullWidth: {
      true: 'w-full',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export type ButtonStyleProps = VariantProps<typeof buttonStyle>;
