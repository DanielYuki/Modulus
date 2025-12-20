import type React from 'react';
import { textAreaStyle, type TextAreaStyleProps } from './text-area.component.style';

export interface TextAreaProps extends TextAreaStyleProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  rows?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  placeholder,
  value,
  onChange,
  disabled,
  className,
  id,
  error,
  rows = 4,
}) => {
  const styles = textAreaStyle({ error });

  return (
    <div className={styles.wrapper({ class: className })}>
      {label && (
        <label htmlFor={id} className={styles.label()}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={styles.textarea()}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        rows={rows}
      />
    </div>
  );
};
