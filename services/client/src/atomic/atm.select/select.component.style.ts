import { tv, type VariantProps } from 'tailwind-variants';

export const selectStyle = tv({
  slots: {
    wrapper: 'flex flex-col gap-2',
    label: 'text-xs font-bold uppercase tracking-wide text-text-main',
    select: [
      'w-full pl-3 pr-10 py-3',
      'bg-fixed-white border-2 border-border-strong rounded-md',
      'text-sm text-text-main font-medium',
      'transition-all duration-200',
      'focus:outline-none focus:ring-0 focus:border-primary-hover focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'appearance-none cursor-pointer',
      'bg-[url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%23000000%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")]',
      'bg-[length:1.5rem_1.5rem]',
      'bg-[right_0.5rem_center]',
      'bg-no-repeat',
    ],
  },
  variants: {
    error: {
      true: {
        select: 'border-status-failed focus:border-status-failed',
      },
    },
  },
});

export type SelectStyleProps = VariantProps<typeof selectStyle>;
