import type React from 'react';
import { textInputStyle, type TextInputStyleProps } from './text-input.component.style';

export interface TextInputProps extends TextInputStyleProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  disabled,
  className,
  id,
  error,
}) => {
  const styles = textInputStyle({ error });

  return (
    <div className={styles.wrapper({ class: className })}>
      {label && (
        <label htmlFor={id} className={styles.label()}>
          {label}
        </label>
      )}
      <input
        id={id}
        type="text"
        className={styles.input()}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
};
