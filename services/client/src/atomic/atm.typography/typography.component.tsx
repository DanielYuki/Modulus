import type React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Typography Variants using Tailwind Variants
 * Uses the design tokens from our CSS architecture
 */
export const typography = tv({
  slots: {
    base: 'font-primary text-base',
    display: 'text-4xl font-secondary font-bold tracking-tight text-text-main uppercase',
    h1: 'text-3xl font-secondary font-bold tracking-tight text-text-main',
    h2: 'text-xl font-primary font-medium text-text-main',
    h3: 'text-base font-primary font-medium text-text-main',
    h4: 'text-sm font-primary font-medium text-text-main uppercase tracking-wider',
    p: 'font-primary text-sm text-text-secondary',
    bodySecondary: 'text-xs text-text-muted font-primary',
  },
});

type Typography<T = object> = React.FC<
  {
    children: React.ReactNode;
    className?: string;
  } & T
>;

const { display, h1, h2, h3, h4, p, bodySecondary } = typography();

// Main typography components
export const HDisplay: Typography = ({ className, children }) => <p className={display({ className })}>{children}</p>;
export const H1: Typography = ({ className, children }) => <h1 className={h1({ className })}>{children}</h1>;
export const H2: Typography = ({ className, children }) => <h2 className={h2({ className })}>{children}</h2>;
export const H3: Typography = ({ className, children }) => <h3 className={h3({ className })}>{children}</h3>;
export const H4: Typography = ({ className, children }) => <h4 className={h4({ className })}>{children}</h4>;
export const Body: Typography = ({ className, children }) => <p className={p({ className })}>{children}</p>;
export const BodySecondary: Typography = ({ className, children }) => (
  <p className={bodySecondary({ className })}>{children}</p>
);

/**
 * Input-related typography variants
 */
export const input = tv({
  base: ['text-sm text-text-secondary'],
  variants: {
    hasError: { true: 'text-status-failed' },
    type: {
      dt: 'block font-medium text-text-main',
      label: 'block font-medium mb-xs',
      value: 'font-normal',
      caption: 'mt-xs block text-xs font-medium',
    },
    disabled: { true: 'text-text-muted opacity-100' },
  },
});

type InputVariants = VariantProps<typeof input> & { htmlFor?: string };

interface InputLabelProps extends InputVariants {
  isRequired?: boolean;
}

export const InputLabel: Typography<InputLabelProps> = ({ htmlFor, className, hasError, isRequired, children }) => (
  <label className={input({ type: 'label', hasError, className })} htmlFor={htmlFor}>
    {children}
    {!!isRequired && <span className="text-status-failed"> * </span>}
  </label>
);

export const InputLegend: Typography<InputLabelProps> = ({ className, hasError, isRequired, children }) => (
  <legend className={input({ type: 'label', hasError, className })}>
    {children}
    {!!isRequired && ' *'}
  </legend>
);

export const InputValue: Typography<InputVariants> = ({ htmlFor, className, hasError, children }) => (
  <label className={input({ type: 'value', hasError, className })} htmlFor={htmlFor}>
    {children}
  </label>
);

export const InputCaption: Typography<InputVariants> = ({ className, hasError, children }) => (
  <p className={input({ type: 'caption', hasError, className })}>{children}</p>
);

export const InputCaptionError: Typography = ({ children }) => <InputCaption hasError>{children}</InputCaption>;

export const ProductPrice: Typography = ({ className, children }) => (
  <p className={tv({ base: 'font-primary font-semibold text-sm' })(className)}>{children}</p>
);

/**
 * Description list components
 */
export const DT: Typography = ({ className, children }) => (
  <dt className={input({ type: 'dt', hasError: false, className })}>{children}</dt>
);

export const DD: Typography = ({ className, children }) => (
  <dd
    className={input({
      type: 'value',
      hasError: false,
      className: `inline ${className}`,
    })}>
    {children}
  </dd>
);

const dl = tv({
  base: 'my-sm flex gap-xs flex-row',
  variants: { vertical: { true: 'flex-col !gap-0 [&+&]:mt-md' } },
});
type DlVariants = VariantProps<typeof dl>;

export const DL: Typography<DlVariants> = ({ className, vertical, children }) => (
  <dl className={dl({ vertical, className })}>{children}</dl>
);

/**
 * Ellipsed text component
 */
const ellipsed = tv({
  base: 'max-w-full inline-block overflow-clip whitespace-nowrap text-ellipsis',
});

export const Ellipsed: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <span className={ellipsed({ className })}>{children}</span>
);
