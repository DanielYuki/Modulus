import type React from 'react';
import { Badge } from '../atm.badge';
import { Button } from '../atm.button';
import { Icon } from '../atm.icon';
import { ProgressBar } from '../atm.progress-bar';
import { type StyleVariants, style } from './job-card.component.style';

export type JobStatus = 'done' | 'active' | 'failed' | 'queued';

export interface JobCardProps extends StyleVariants {
  filename: string;
  fileSize?: string;
  statusLabel: string;
  progress?: number;
  progressLabel?: string;
  error?: string;
  onView?: () => void;
  onRetry?: () => void;
  onCancel?: () => void;
  onDownload?: (type: 'pdf' | 'tex') => void;
  className?: string;
}

export const JobCard: React.FC<JobCardProps> = ({
  filename,
  fileSize,
  statusLabel,
  status,
  progress,
  progressLabel,
  error,
  onView,
  onRetry,
  onCancel,
  onDownload,
  className,
}) => {
  const styles = style({ status });
  const badgeStatus =
    status === 'done' ? 'done' : status === 'active' ? 'active' : status === 'failed' ? 'failed' : 'queued';

  return (
    <div className={styles.wrapper({ class: className })}>
      <div className={styles.header()}>
        <div className={styles.headerTop()}>
          <div className={styles.headerLeft()}>
            <div className={styles.icon()}>
              {status === 'active' ? (
                <Icon name="sync" className="animate-spin" />
              ) : status === 'queued' ? (
                <Icon name="hourglass_empty" />
              ) : (
                <Icon name="picture_as_pdf" />
              )}
            </div>
            <div className={styles.info()}>
              <h3 className={styles.filename()}>{filename}</h3>
              {status === 'active' ? (
                <p className="mt-1 inline-block animate-pulse bg-primary px-1 font-bold text-fixed-black text-xs uppercase tracking-wider">
                  {statusLabel}
                </p>
              ) : (
                <p className={styles.meta()}>
                  {fileSize ? `${fileSize} • ` : ''}
                  {statusLabel}
                </p>
              )}
            </div>
          </div>
          <Badge status={badgeStatus}>{status?.toUpperCase()}</Badge>
        </div>

        {status === 'active' && progress !== undefined && (
          <div className={styles.body()}>
            <ProgressBar value={progress} label={progressLabel} status="active" />
          </div>
        )}

        {status === 'failed' && error && (
          <div className={styles.body()}>
            <div className={styles.error()}>{error}</div>
          </div>
        )}

        {status === 'queued' && (
          <div className={styles.body()}>
            <div className="opacity-50">
              <ProgressBar value={0} label="Pending" status="active" />
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer()}>
        {status === 'done' && (
          <>
            <Button variant="dark" size="sm" className="flex-1" onClick={onView}>
              <Icon name="visibility" size="sm" color="white" /> View
            </Button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onDownload?.('pdf')}
                className="flex size-10 items-center justify-center border-2 border-border-strong bg-fixed-white text-text-secondary transition-colors hover:bg-primary">
                <span className="font-bold text-[8px]">PDF</span>
              </button>
              <button
                type="button"
                onClick={() => onDownload?.('tex')}
                className="flex size-10 items-center justify-center border-2 border-border-strong bg-fixed-white text-text-secondary transition-colors hover:bg-primary">
                <span className="font-bold text-[8px]">TEX</span>
              </button>
            </div>
          </>
        )}
        {status === 'failed' && (
          <>
            <Button variant="danger" size="sm" className="flex-1" onClick={onRetry} disabled>
              <Icon name="replay" size="sm" color="white" /> Retry
            </Button>
            <button
              type="button"
              onClick={() => onDownload?.('tex')}
              className="flex size-10 items-center justify-center border-2 border-status-failed-border bg-fixed-white text-status-failed transition-colors hover:bg-status-failed/20">
              <span className="font-bold text-[8px]">TEX</span>
            </button>
          </>
        )}
        {status === 'active' && (
          <Button variant="secondary" size="sm" fullWidth onClick={onCancel} disabled>
            Cancel
          </Button>
        )}
        {status === 'queued' && (
          <button
            type="button"
            className="flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 border-2 border-transparent font-bold text-sm text-text-muted uppercase tracking-wide">
            Waiting...
          </button>
        )}
      </div>
    </div>
  );
};
