import type React from 'react';
import { badgeStyle, type BadgeStyleProps } from './badge.component.style';

export interface BadgeProps extends BadgeStyleProps {
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, className, status }) => {
  return (
    <span className={badgeStyle({ status, class: className })}>
      {children}
    </span>
  );
};
