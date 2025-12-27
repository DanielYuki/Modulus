import type React from 'react';
import { style, type StyleVariants } from './button.component.style';
import { ActivityIndicator } from '../atm.activity-indicator'; // ATOMIC DESIGN EXCEPTION

export interface ButtonProps extends StyleVariants {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  disabled,
  loading,
  onClick,
  type = 'button',
  variant,
  size,
  fullWidth,
}) => {
  return (
    <button
      className={style({ variant, size, fullWidth, class: className })}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
    >
      {loading ? (
        <ActivityIndicator type="spinner" size="sm" />
      ) : (
        children
      )}
    </button>
  );
};
