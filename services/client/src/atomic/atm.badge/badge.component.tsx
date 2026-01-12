import type React from 'react';
import { type StyleVariants, style } from './badge.component.style';

export interface BadgeProps extends StyleVariants {
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, className, status, size }) => {
  return <span className={style({ status, size, class: className })}>{children}</span>;
};
