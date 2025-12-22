import type React from 'react';
import { useNavigate, useMatch } from 'react-router';
import { Button, H1, H3, BodySecondary, Badge } from '@atomic';
import { BatchesRoutes } from './batches.routes';
import { BatchesRouter } from './detail/batches.router';

// Mock data for demonstration - replace with actual API call
const mockBatches = [
  {
    id: '2940',
    status: 'processing' as const,
    startedAt: 'Today, 10:42 AM',
    progress: 45,
    processedCount: 8,
    totalCount: 14,
  },
  {
    id: '2939',
    status: 'completed' as const,
    date: 'Oct 24, 2023',
    documentCount: 142,
    successRate: 100,
    size: '245 MB',
  },
  {
    id: '2938',
    status: 'completed' as const,
    date: 'Oct 23, 2023',
    documentCount: 56,
    successRate: 100,
    size: '89 MB',
  },
  {
    id: '2937',
    status: 'needs_review' as const,
    date: 'Oct 22, 2023',
    documentCount: 12,
    successRate: 83,
    size: '12 MB',
  },
  {
    id: '2936',
    status: 'archived' as const,
    date: 'Oct 20, 2023',
    documentCount: 205,
    successRate: 100,
    size: '310 MB',
  },
];

type BatchStatus = 'processing' | 'completed' | 'needs_review' | 'archived';

interface BatchCardProps {
  batch: (typeof mockBatches)[number];
  onClick: () => void;
}

// Badge status mapping
const badgeStatusMap: Record<BatchStatus, 'ready' | 'done' | 'failed' | 'queued'> = {
  processing: 'ready',
  completed: 'done',
  needs_review: 'failed',
  archived: 'queued',
};

// TODO: This is bad lmao
// Using CSS variable values for inline styles (to avoid Tailwind purging)
const statusBarStyle: Record<BatchStatus, React.CSSProperties> = {
  processing: { backgroundColor: 'var(--color-primary)' },
  completed: { backgroundColor: 'var(--color-status-done)' },
  needs_review: { backgroundColor: 'var(--color-status-failed)' },
  archived: { backgroundColor: 'var(--color-status-queued)' },
};

const BatchCard: React.FC<BatchCardProps> = ({ batch, onClick }) => {
  const badgeStatus = badgeStatusMap[batch.status];
  const statusLabel = batch.status === 'needs_review' ? 'Needs Review' : batch.status.charAt(0).toUpperCase() + batch.status.slice(1);
  const isProcessing = batch.status === 'processing';
  const isArchived = batch.status === 'archived';
  const isNeedsReview = batch.status === 'needs_review';

  return (
    <div
      onClick={onClick}
      className={`
        group relative bg-fixed-white border-2 border-border-strong p-0 flex flex-col md:flex-row 
        hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-200 cursor-pointer
        hover:shadow-geo
        ${isArchived ? 'opacity-60 hover:opacity-100 bg-surface' : ''}
      `}
    >
      {/* Status bar */}
      <div
        className={`w-2 shrink-0 border-r-2 border-border-strong`}
        style={statusBarStyle[batch.status]}
      />

      <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center gap-6">
        {/* Icon and info */}
        <div className="flex items-center gap-4 flex-1">
          <div className="size-12 flex items-center justify-center border-2 border-border-strong">
            <span className={`material-symbols-outlined ${isProcessing ? 'animate-spin' : ''}`}>
              {isProcessing ? 'progress_activity' : isNeedsReview ? 'warning' : isArchived ? 'inventory_2' : 'check_circle'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <H3 className={isArchived ? 'text-text-muted' : ''}>
                Batch #{batch.id}
              </H3>
            </div>
            <BodySecondary className={`font-mono uppercase tracking-wide ${isArchived ? 'opacity-60' : ''}`}>
              {isProcessing
                ? `Started: ${batch.startedAt}`
                : `${batch.date} • ${batch.documentCount} Documents`}
            </BodySecondary>
          </div>
        </div>

        {/* Progress/Stats */}
        <div className="flex items-center gap-4 md:justify-end flex-1">
          <Badge status={badgeStatus}>{statusLabel}</Badge>
          <span className="material-symbols-outlined text-text-muted/50 group-hover:text-fixed-black group-hover:translate-x-1 transition-all">
            arrow_forward
          </span>
        </div>
      </div>
    </div>
  );
};

const BatchesPage: React.FC = () => {
  const navigate = useNavigate();

  // Check if we're on a detail route
  const isDetailRoute = useMatch('/batches/:batchId');

  // TODO: review this logic
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
            <span className="material-symbols-outlined !text-[18px]">add</span>
            NEW BATCH
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Batch List */}
          <div className="flex flex-col gap-4">
            {mockBatches.map((batch) => (
              <BatchCard
                key={batch.id}
                batch={batch}
                onClick={() => navigate(`${BatchesRoutes.List}/${batch.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default BatchesPage;
