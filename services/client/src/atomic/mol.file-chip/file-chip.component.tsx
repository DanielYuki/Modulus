import type React from 'react';
import { style, type StyleVariants } from './file-chip.component.style';
import { Icon } from '../atm.icon';

export interface FileChipProps extends StyleVariants {
  filename: string;
  status?: string;
  onRemove?: () => void;
  className?: string;
}

export const FileChip: React.FC<FileChipProps> = ({
  filename,
  status = 'Ready',
  onRemove,
  className,
  fileType,
}) => {
  const isPdf = filename.toLowerCase().endsWith('.pdf');
  const isTex = filename.toLowerCase().endsWith('.tex');
  const effectiveType = fileType ?? (isTex ? 'tex' : 'pdf');
  const chipStyles = style({ fileType: effectiveType });

  return (
    <div className={chipStyles.wrapper({ class: className })}>
      <div className={chipStyles.icon()}>
        <Icon name={isPdf ? 'picture_as_pdf' : 'code'} />
      </div>
      <div className={chipStyles.content()}>
        <span className={chipStyles.filename()}>{filename}</span>
        <span className={chipStyles.status()}>{status}</span>
      </div>
      {onRemove && (
        <button type="button" onClick={onRemove} className={chipStyles.removeBtn()}>
          <Icon name="close" size="sm" />
        </button>
      )}
    </div>
  );
};
