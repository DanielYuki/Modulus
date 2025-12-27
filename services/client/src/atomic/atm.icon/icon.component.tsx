import type React from 'react';
import { style, type StyleVariants } from './icon.component.style';

export interface IconProps extends StyleVariants {
  /**
   * The name of the Material Symbol icon
   * @see https://fonts.google.com/icons
   */
  name: string;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className, size, color }) => {
  return (
    <span
      className={style({ size, color, class: className })}
    >
      {name}
    </span>
  );
};
