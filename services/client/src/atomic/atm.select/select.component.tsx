import type React from 'react';
import { style, type StyleVariants } from './select.component.style';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends StyleVariants {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  disabled,
  className,
  id,
  placeholder,
  error,
}) => {
  const styles = style({ error });

  return (
    <div className={styles.wrapper({ class: className })}>
      {label && (
        <label htmlFor={id} className={styles.label()}>
          {label}
        </label>
      )}
      <select
        id={id}
        className={styles.select()}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
