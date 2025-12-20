import type React from 'react';
import { fileChipStyle, type FileChipStyleProps } from './file-chip.component.style';

export interface FileChipProps extends FileChipStyleProps {
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
  const styles = fileChipStyle({ fileType });
  const isPdf = filename.toLowerCase().endsWith('.pdf');
  const isTex = filename.toLowerCase().endsWith('.tex');
  const effectiveType = fileType ?? (isTex ? 'tex' : 'pdf');
  const chipStyles = fileChipStyle({ fileType: effectiveType });

  return (
    <div className={chipStyles.wrapper({ class: className })}>
      <div className={chipStyles.icon()}>
        <span className="material-symbols-outlined text-xl">
          {isPdf ? 'picture_as_pdf' : 'code'}
        </span>
      </div>
      <div className={chipStyles.content()}>
        <span className={chipStyles.filename()}>{filename}</span>
        <span className={chipStyles.status()}>{status}</span>
      </div>
      {onRemove && (
        <button type="button" onClick={onRemove} className={chipStyles.removeBtn()}>
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      )}
    </div>
  );
};
