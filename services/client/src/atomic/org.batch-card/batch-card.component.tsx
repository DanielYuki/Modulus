import type React from 'react';
import { Badge } from '../atm.badge';
import { Icon } from '../atm.icon';
import { type StyleVariants, style } from './batch-card.component.style';

export type BatchCardStatus = 'completed' | 'processing' | 'failed' | 'pending';

const statusToBadge: Record<BatchCardStatus, 'done' | 'ready' | 'failed' | 'queued'> = {
  completed: 'done',
  processing: 'ready',
  failed: 'failed',
  pending: 'queued',
};

// Format bytes to human-readable size
function formatBytes(bytes: number): string {
  if (bytes === 0) return '—';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

// Calculate success rate percentage
function getSuccessRate(completed: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((completed / total) * 100)}%`;
}

export interface BatchCardProps extends StyleVariants {
  /** Batch ID */
  batchId: string;
  /** Click handler for navigation */
  onClick?: () => void;
  /** ISO date string */
  createdAt: string;
  /** Total number of items in batch */
  totalItems: number;
  /** Number of completed items */
  completedItems: number;
  /** Number of failed items */
  failedItems: number;
  /** Total size in bytes */
  totalSizeBytes: number;
  /** Optional className */
  className?: string;
}

export const BatchCard: React.FC<BatchCardProps> = ({
  batchId,
  onClick,
  status = 'pending',
  createdAt,
  totalItems,
  completedItems,
  totalSizeBytes,
  className,
}) => {
  const styles = style({ status });
  const badgeStatus = statusToBadge[status ?? 'pending'];
  const statusLabel = (status ?? 'pending').charAt(0).toUpperCase() + (status ?? 'pending').slice(1);
  const isProcessing = status === 'processing';

  // Format date for display
  const createdDate = new Date(createdAt);
  const dateStr = createdDate
    .toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    .toUpperCase();

  const successRate = getSuccessRate(completedItems, totalItems);
  const totalSize = formatBytes(totalSizeBytes);
  const hasFailures = status === 'failed' || completedItems < totalItems;

  return (
    <button type="button" onClick={onClick} className={styles.wrapper({ class: className })}>
      {/* Status bar */}
      <div className={styles.statusBar()} />

      <div className={styles.content()}>
        {/* Left: Icon + Info */}
        <div className={styles.leftSection()}>
          <div className={styles.iconBox()}>
            <Icon
              name={isProcessing ? 'progress_activity' : status === 'failed' ? 'warning' : 'folder_copy'}
              className={isProcessing ? 'animate-spin' : ''}
            />
          </div>
          <div className={styles.infoBlock()}>
            <div className={styles.title()}>
              <span className="font-bold text-lg text-text-main">Batch #{batchId.slice(0, 8)}</span>
              <Badge status={badgeStatus}>{statusLabel.toUpperCase()}</Badge>
            </div>
            <span className={styles.meta()}>
              {dateStr} • {totalItems} DOCUMENTS
            </span>
          </div>
        </div>

        {/* Right: Stats + Arrow */}
        <div className={styles.rightSection()}>
          <div className={styles.statBlock()}>
            <span className={styles.statLabel()}>Success Rate</span>
            <span
              className={styles.statValue({ class: hasFailures && status !== 'pending' ? 'text-status-failed' : '' })}>
              {successRate}
            </span>
          </div>
          <div className={styles.statBlock()}>
            <span className={styles.statLabel()}>Size</span>
            <span className={styles.statValue()}>{totalSize}</span>
          </div>
          <Icon name="arrow_forward" className={styles.arrow()} />
        </div>
      </div>
    </button>
  );
};
