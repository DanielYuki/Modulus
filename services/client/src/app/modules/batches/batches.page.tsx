import { Badge, Body, BodySecondary, H1, H3, Icon, LinkButton } from '@atomic';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { type BatchListItem, listBatches } from '@/app/data/batch.gateway';
import { BatchesRoutes } from './batches.routes';

// API status to UI status mapping
type UIStatus = 'processing' | 'completed' | 'failed' | 'pending';

const statusToBadge: Record<UIStatus, 'ready' | 'done' | 'failed' | 'queued'> = {
  processing: 'ready',
  completed: 'done',
  failed: 'failed',
  pending: 'queued',
};

const statusBarStyle: Record<UIStatus, React.CSSProperties> = {
  processing: { backgroundColor: 'var(--color-primary)' },
  completed: { backgroundColor: 'var(--color-status-done)' },
  failed: { backgroundColor: 'var(--color-status-failed)' },
  pending: { backgroundColor: 'var(--color-status-queued)' },
};

interface BatchCardProps {
  batch: BatchListItem;
  to: string;
}

const BatchCard: React.FC<BatchCardProps> = ({ batch, to }) => {
  const status = batch.status as UIStatus;
  const badgeStatus = statusToBadge[status];
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const isProcessing = status === 'processing';

  // Format date for display
  const createdDate = new Date(batch.created_at);
  const dateStr = createdDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link
      to={to}
      className={
        'group relative flex cursor-pointer flex-col border-2 border-border-strong bg-fixed-white p-0 transition-all duration-200 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-geo md:flex-row'
      }>
      {/* Status bar */}
      <div className="w-2 shrink-0 border-border-strong border-r-2" style={statusBarStyle[status]} />

      <div className="flex flex-1 flex-col gap-6 p-6 md:flex-row md:items-center">
        {/* Icon and info */}
        <div className="flex flex-1 items-center gap-4">
          <div className="flex size-12 items-center justify-center border-2 border-border-strong">
            <Icon
              name={isProcessing ? 'progress_activity' : status === 'failed' ? 'warning' : 'check_circle'}
              className={isProcessing ? 'animate-spin' : ''}
            />
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <H3>Batch #{batch.id.slice(0, 8)}</H3>
            </div>
            <BodySecondary className="font-mono uppercase tracking-wide">
              {dateStr} • {batch.total_items} items
              {batch.failed_items > 0 && ` • ${batch.failed_items} failed`}
            </BodySecondary>
          </div>
        </div>

        {/* Progress/Stats */}
        <div className="flex flex-1 items-center gap-4 md:justify-end">
          <Badge status={badgeStatus}>{statusLabel}</Badge>
          <Icon
            name="arrow_forward"
            className="text-text-muted/50 transition-all group-hover:translate-x-1 group-hover:text-fixed-black"
          />
        </div>
      </div>
    </Link>
  );
};

const BatchesPage: React.FC = () => {
  const [batches, setBatches] = useState<BatchListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch batches on mount
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const data = await listBatches();
        setBatches(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch batches:', err);
        setError('Failed to load batches');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, []);

  return (
    <>
      {/* Header */}
      <header className="border-border-strong border-b-2 bg-fixed-white px-8 py-6">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <div className="flex flex-col gap-1">
            <H1>Batch Selection</H1>
          </div>
          <LinkButton to="/batch/new" variant="primary">
            <Icon name="add" size="sm" />
            NEW BATCH
          </LinkButton>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        <div className="mx-auto max-w-[1200px]">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Icon name="progress_activity" size="xl" color="primary" className="animate-spin" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="border-2 border-status-failed-border bg-status-failed-bg p-4 text-center text-status-failed">
              <Body className="text-status-failed">{error}</Body>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && batches.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <Icon name="folder_open" size="xl" color="secondary" />
              <H3>No batches yet</H3>
              <BodySecondary>Create your first batch to get started</BodySecondary>
            </div>
          )}

          {/* Batch List */}
          {!isLoading && !error && batches.length > 0 && (
            <div className="flex flex-col gap-4">
              {batches.map(batch => (
                <BatchCard key={batch.id} batch={batch} to={BatchesRoutes.detailPath(batch.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BatchesPage;
