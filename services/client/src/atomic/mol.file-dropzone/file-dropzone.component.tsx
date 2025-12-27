import * as React from 'react';
import { style } from './file-dropzone.component.style';
import { Icon } from '../atm.icon';

export interface FileDropzoneProps {
  accept?: string;
  multiple?: boolean;
  onFilesChange?: (files: File[]) => void;
  title?: string;
  subtitle?: string;
  className?: string;
}

// TODO: Review dropzone logic
export const FileDropzone: React.FC<FileDropzoneProps> = ({
  accept = '.pdf,.tex',
  multiple = true,
  onFilesChange,
  title = 'Drop PDFs and .tex template',
  subtitle = 'MAX 20MB PER FILE',
  className,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const styles = style({ isDragging });

  const handleFiles = React.useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const fileArray = Array.from(newFiles);
    onFilesChange?.(fileArray);
  }, [onFilesChange]);

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div className={styles.wrapper({ class: className })}>
      <div
        className={styles.dropzone()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className={styles.input()}
        />
        <div className={styles.content()}>
          <div className={styles.icon()}>
            <Icon name="cloud_upload" size="xl" color="black" />
          </div>
          <div>
            <p className={styles.title()}>{title}</p>
            <p className={styles.subtitle()}>{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
