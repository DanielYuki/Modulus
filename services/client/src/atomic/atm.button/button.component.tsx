import type React from 'react';
import { style, type StyleVariants } from './button.component.style';

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
      {/* TODO: Create and Replace with proper ActivityIndicator */}
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
};
