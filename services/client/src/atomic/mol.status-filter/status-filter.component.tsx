import type React from 'react';
import { style } from './status-filter.component.style';

export type FilterStatus = 'completed' | 'processing' | 'failed' | 'queued';

export interface StatusFilterOption {
  status: FilterStatus;
  label: string;
  count: number;
}

export interface StatusFilterProps {
  options: StatusFilterOption[];
  activeStatus?: FilterStatus;
  onSelect?: (status: FilterStatus) => void;
  className?: string;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  options,
  activeStatus,
  onSelect,
  className,
}) => {
  const styles = style();

  return (
    <div className={styles.wrapper({ class: className })}>
      {options.map((option) => {
        const isActive = option.status === activeStatus;
        const buttonStyles = style({ active: isActive, status: option.status });

        return (
          <button
            key={option.status}
            type="button"
            onClick={() => onSelect?.(option.status)}
            className={buttonStyles.button()}
          >
            <span className={buttonStyles.indicator()} />
            <span>{option.count}</span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
