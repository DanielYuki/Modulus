import { tv, type VariantProps } from 'tailwind-variants';

export const style = tv({
  slots: {
    wrapper: ['relative w-full group/upload'],
    dropzone: [
      'relative flex flex-col items-center justify-center w-full min-h-[220px]',
      'border-2 border-dashed border-border-strong',
      'bg-background',
      'transition-all duration-300',
      'cursor-pointer',
      'hover:bg-primary-light hover:border-solid',
    ],
    content: ['flex flex-col items-center gap-4 p-6 text-center pointer-events-none'],
    icon: [
      'size-16 bg-primary border-2 border-border-strong flex items-center justify-center',
      'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
      'group-hover/upload:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
      'transition-all duration-300',
    ],
    input: 'absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10',
  },
  variants: {
    isDragging: {
      true: {
        dropzone: 'border-solid bg-primary-light',
        icon: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
      },
    },
  },
});

export type StyleVariants = VariantProps<typeof style>;
