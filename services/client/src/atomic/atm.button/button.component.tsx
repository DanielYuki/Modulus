import { ActivityIndicator } from '@atomic/atm.activity-indicator';
import type React from 'react';
import { type StyleVariants, style } from './button.component.style';

export interface ButtonProps extends StyleVariants {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  className,
  children,
  onClick,
  disabled,
  loading,
  type,
  ...rest
}: ButtonProps) => {
  return (
    <button
      className={style({ ...rest, class: className })}
      onClick={onClick}
      disabled={disabled || loading}
      type={type ?? 'button'}>
      {loading ? <ActivityIndicator type={'spinner'} /> : children}
    </button>
  );
};
