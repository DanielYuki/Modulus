import { tv, type VariantProps } from 'tailwind-variants';

export const style = tv({
  base: ['material-symbols-outlined', 'select-none', 'inline-flex items-center justify-center'],
  variants: {
    // !important is used to override the default size of the icon
    size: {
      xs: '!text-base',
      sm: '!text-lg',
      md: '!text-xl',
      lg: '!text-2xl',
      xl: '!text-3xl',
    },
    color: {
      primary: 'text-primary',
      secondary: 'text-text-secondary',
      muted: 'text-text-muted',
      white: 'text-fixed-white',
      black: 'text-fixed-black',
      success: 'text-status-done',
      warning: 'text-primary',
      danger: 'text-status-failed',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'black',
  },
});

export type StyleVariants = VariantProps<typeof style>;
