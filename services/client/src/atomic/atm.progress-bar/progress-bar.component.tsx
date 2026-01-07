import type React from 'react';
import { type StyleVariants, style } from './progress-bar.component.style';

export interface ProgressBarProps extends StyleVariants {
  value: number; // 0-100
  label?: string;
  showPercent?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, label, showPercent = true, className, status }) => {
  const styles = style({ status });
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={styles.wrapper({ class: className })}>
      {(label || showPercent) && (
        <div className={styles.label()}>
          {label && <span className={styles.labelText()}>{label}</span>}
          {showPercent && <span className={styles.labelPercent()}>{clampedValue}%</span>}
        </div>
      )}
      <div className={styles.track()}>
        <div className={styles.fill()} style={{ width: `${clampedValue}%` }} />
      </div>
    </div>
  );
};
