import { useState, useEffect } from 'react';
import type React from 'react';
import { useNavigate, useMatch } from 'react-router';
import { Button, H1, H3, BodySecondary, Badge, Body, Icon } from '@atomic';
import { BatchesRoutes } from './batches.routes';
import { BatchesRouter } from './detail/batches.router';
import { listBatches, type BatchListItem } from '@/app/data/batch.gateway';

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
  onClick: () => void;
}

const BatchCard: React.FC<BatchCardProps> = ({ batch, onClick }) => {
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
    <div
      onClick={onClick}
      className={`
        group relative bg-fixed-white border-2 border-border-strong p-0 flex flex-col md:flex-row 
        hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-200 cursor-pointer
        hover:shadow-geo
      `}
    >
      {/* Status bar */}
      <div
        className="w-2 shrink-0 border-r-2 border-border-strong"
        style={statusBarStyle[status]}
      />

      <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center gap-6">
        {/* Icon and info */}
        <div className="flex items-center gap-4 flex-1">
          <div className="size-12 flex items-center justify-center border-2 border-border-strong">
            <Icon
              name={isProcessing ? 'progress_activity' : status === 'failed' ? 'warning' : 'check_circle'}
              className={isProcessing ? 'animate-spin' : ''}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <H3>
                Batch #{batch.id.slice(0, 8)}
              </H3>
            </div>
            <BodySecondary className="font-mono uppercase tracking-wide">
              {dateStr} • {batch.total_items} items
              {batch.failed_items > 0 && ` • ${batch.failed_items} failed`}
            </BodySecondary>
          </div>
        </div>

        {/* Progress/Stats */}
        <div className="flex items-center gap-4 md:justify-end flex-1">
          <Badge status={badgeStatus}>{statusLabel}</Badge>
          <Icon name="arrow_forward" className="text-text-muted/50 group-hover:text-fixed-black group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
};

const BatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<BatchListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we're on a detail route
  const isDetailRoute = useMatch('/batches/:batchId');

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

  // If on detail route, render the router
  if (isDetailRoute) {
    return <BatchesRouter />;
  }

  return (
    <>
      {/* Header */}
      <header className="bg-fixed-white border-b-2 border-border-strong px-8 py-6">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <H1>Batch Selection</H1>
          </div>
          <Button variant="primary" onClick={() => navigate('/batch/new')}>
            <Icon name="add" size="sm" />
            NEW BATCH
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Icon name="progress_activity" size="xl" color="primary" className="animate-spin" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-status-failed-bg border-2 border-status-failed-border text-status-failed text-center">
              <Body className="text-status-failed">{error}</Body>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && batches.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Icon name="folder_open" size="xl" color="secondary" />
              <H3>No batches yet</H3>
              <BodySecondary>Create your first batch to get started</BodySecondary>
            </div>
          )}

          {/* Batch List */}
          {!isLoading && !error && batches.length > 0 && (
            <div className="flex flex-col gap-4">
              {batches.map((batch) => (
                <BatchCard
                  key={batch.id}
                  batch={batch}
                  onClick={() => navigate(`${BatchesRoutes.List}/${batch.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BatchesPage;
