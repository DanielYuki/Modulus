import * as React from 'react';
import { Icon } from '../atm.icon';
import { H3 } from '../atm.typography';
import { style } from './file-dropzone.component.style';

export interface FileDropzoneProps {
  accept?: string;
  multiple?: boolean;
  onFilesChange?: (files: File[]) => void;
  title?: string;
  className?: string;
}

// TODO: Review dropzone logic
export const FileDropzone: React.FC<FileDropzoneProps> = ({
  accept = '.pdf,.tex',
  multiple = true,
  onFilesChange,
  title = 'Drop PDFs and .tex template',
  className,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const styles = style({ isDragging });

  const handleFiles = React.useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;
      const fileArray = Array.from(newFiles);
      onFilesChange?.(fileArray);
    },
    [onFilesChange],
  );

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

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div className={styles.wrapper({ class: className })}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Dropzone div intentionally interactive for drag-and-drop */}
      <div className={styles.dropzone()} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={e => handleFiles(e.target.files)}
          className={styles.input()}
        />
        <div className={styles.content()}>
          <div className={styles.icon()}>
            <Icon name="cloud_upload" size="xl" color="black" />
          </div>
          <H3>{title}</H3>
        </div>
      </div>
    </div>
  );
};
