import type React from 'react';
import { style, type StyleVariants } from './badge.component.style';

export interface BadgeProps extends StyleVariants {
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, className, status }) => {
  return (
    <span className={style({ status, class: className })}>
      {children}
    </span>
  );
};
