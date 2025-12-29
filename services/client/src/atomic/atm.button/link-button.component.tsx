import { ActivityIndicator } from '@atomic/atm.activity-indicator';
import React from 'react';
import { Link, type LinkProps } from 'react-router';
import { type StyleVariants, style } from './button.component.style';

export interface LinkButtonProps extends StyleVariants, LinkProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const CursorNotAllowedWrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="pointer-events-none cursor-not-allowed">{children}</div>
);

export const LinkButton: React.FC<LinkButtonProps> = ({
  children,
  className,
  loading,
  type,
  ...rest
}: LinkButtonProps) => {
  const Wrapper = rest.disabled ? CursorNotAllowedWrapper : React.Fragment;
  return (
    <Wrapper>
      <Link
        {...rest}
        aria-disabled={rest.disabled}
        className={style({ ...rest, class: className })}
        tabIndex={rest.disabled ? -1 : undefined}
        type={type}>
        {loading ? <ActivityIndicator type={'spinner'} /> : children}
      </Link>
    </Wrapper>
  );
};
