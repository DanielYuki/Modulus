import type React from 'react';
import { Icon } from '../atm.icon';
import { H4 } from '../atm.typography';
import { type StyleVariants, style } from './file-chip.component.style';

export interface FileChipProps extends StyleVariants {
  filename: string;
  onRemove?: () => void;
  className?: string;
}

export const FileChip: React.FC<FileChipProps> = ({ filename, onRemove, className, fileType }) => {
  const type = fileType ?? (filename.toLowerCase().endsWith('.tex') ? 'tex' : 'pdf');
  const chipStyles = style({ fileType: type });

  return (
    <div className={chipStyles.wrapper({ class: className })}>
      <div className={chipStyles.icon()}>
        <Icon name={type === 'pdf' ? 'picture_as_pdf' : 'code'} />
      </div>
      <div className={chipStyles.content()}>
        <H4>{filename}</H4>
      </div>
      {onRemove && (
        <button type="button" onClick={onRemove} className={chipStyles.removeBtn()}>
          <Icon name="close" />
        </button>
      )}
    </div>
  );
};
