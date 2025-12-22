import type React from 'react';
import { useState } from 'react';
import { useNavigate, useMatch } from 'react-router';
import { Button, Select } from '@atomic';
import { BatchesRoutes } from './batches.routes';
import { BatchesRouter } from './detail/batches.router';

// Mock data for demonstration - replace with actual API call
const mockBatches = [
  {
    id: '2940',
    status: 'processing' as const,
    startedAt: 'Today, 10:42 AM',
    author: 'You',
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

// Review CSS here
// Using CSS variables from _constants.css
const statusConfig: Record<BatchStatus, { color: string; bgColor: string; borderColor: string; label: string }> = {
  processing: { color: 'text-fixed-black', bgColor: 'bg-primary', borderColor: 'border-fixed-black', label: 'Processing' },
  completed: { color: 'text-status-done', bgColor: 'bg-status-done-bg', borderColor: 'border-status-done', label: 'Completed' },
  needs_review: { color: 'text-status-failed', bgColor: 'bg-status-failed-bg', borderColor: 'border-status-failed', label: 'Needs Review' },
  archived: { color: 'text-status-queued', bgColor: 'bg-status-queued-bg', borderColor: 'border-status-queued', label: 'Archived' },
};

// Using CSS variable values for inline styles (to avoid Tailwind purging)
const statusBarStyle: Record<BatchStatus, React.CSSProperties> = {
  processing: { backgroundColor: 'var(--color-primary)' },
  completed: { backgroundColor: 'var(--color-status-done)' },
  needs_review: { backgroundColor: 'var(--color-status-failed)' },
  archived: { backgroundColor: 'var(--color-status-queued)' },
};

const sortOptions = [
  { value: 'date-desc', label: 'Date Created (Newest)' },
  { value: 'status', label: 'Status' },
  { value: 'count', label: 'Document Count' },
];

// TODO: Review this component -> it's a bit complex
const BatchCard: React.FC<BatchCardProps> = ({ batch, onClick }) => {
  const config = statusConfig[batch.status];
  const isProcessing = batch.status === 'processing';
  const isArchived = batch.status === 'archived';
  const isNeedsReview = batch.status === 'needs_review';
  const isCompleted = batch.status === 'completed';

  return (
    <div
      onClick={onClick}
      className={`
        group relative bg-fixed-white border-2 border-border-strong p-0 flex flex-col md:flex-row 
        hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-200 cursor-pointer
        ${isProcessing ? 'hover:shadow-[6px_6px_0px_0px_rgba(249,245,6,1)]' : ''}
        ${isCompleted ? 'hover:shadow-[6px_6px_0px_0px_rgba(34,197,94,0.5)]' : ''}
        ${isNeedsReview ? 'hover:shadow-[6px_6px_0px_0px_rgba(239,68,68,0.5)]' : ''}
        ${isArchived ? 'opacity-60 hover:opacity-100 bg-gray-50 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' : ''}
      `}
      style={isNeedsReview ? { borderColor: 'var(--color-status-failed)' } : undefined}
    >
      {/* Status bar */}
      <div
        className={`w-2 shrink-0 ${isNeedsReview ? '' : 'border-r-2 border-border-strong'}`}
        style={statusBarStyle[batch.status]}
      />

      <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center gap-6">
        {/* Icon and info */}
        <div className="flex items-center gap-4 flex-1">
          <div
            className={`
              size-12 flex items-center justify-center border-2 border-border-strong
              ${isProcessing ? 'bg-fixed-black text-primary' : ''}
              ${isNeedsReview ? 'bg-red-50 text-red-600 group-hover:bg-red-100' : ''}
              ${isArchived ? 'bg-fixed-white text-gray-400' : ''}
              ${isCompleted ? 'bg-green-50 text-green-600 group-hover:bg-green-100' : ''}
              transition-colors
            `}
          >
            <span className={`material-symbols-outlined ${isProcessing ? 'animate-spin' : ''}`}>
              {isProcessing ? 'progress_activity' : isNeedsReview ? 'warning' : isArchived ? 'inventory_2' : 'check_circle'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-bold text-xl ${isArchived ? 'text-gray-600' : 'text-text-main'}`}>
                Batch #{batch.id}
              </h3>
              <span
                className={`${config.bgColor} border ${config.borderColor} ${config.color} text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest`}
              >
                {config.label}
              </span>
            </div>
            <p className={`text-xs font-mono uppercase tracking-wide ${isArchived ? 'text-gray-400' : 'text-text-muted'}`}>
              {isProcessing
                ? `Started: ${batch.startedAt} • By ${batch.author}`
                : `${batch.date} • ${batch.documentCount} Documents`}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8 md:gap-12 md:justify-end flex-1">
          {isProcessing && 'progress' in batch ? (
            <div className="flex flex-col gap-1 w-full max-w-[200px]">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span>Progress</span>
                <span>{batch.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 border-2 border-border-strong">
                <div className="h-full bg-primary border-r-2 border-border-strong" style={{ width: `${batch.progress}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 font-medium mt-1">
                {batch.processedCount} of {batch.totalCount} files processed
              </p>
            </div>
          ) : (
            <>
              {'successRate' in batch && (
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Success Rate</span>
                  <span className={`font-bold text-lg ${batch.successRate === 100 ? (isArchived ? 'text-gray-600' : 'text-green-600') : 'text-red-600'}`}>
                    {batch.successRate}%
                  </span>
                </div>
              )}
              {'size' in batch && (
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Size</span>
                  <span className={`font-bold text-lg ${isArchived ? 'text-gray-600' : 'text-text-main'}`}>{batch.size}</span>
                </div>
              )}
            </>
          )}
          <span className="material-symbols-outlined text-gray-300 group-hover:text-fixed-black group-hover:translate-x-1 transition-all">
            arrow_forward
          </span>
        </div>
      </div>
    </div>
  );
};

const BatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  // Check if we're on a detail route
  const isDetailRoute = useMatch('/batches/:batchId');

  // TODO: review this logic
  // If on detail route, render the router
  if (isDetailRoute) {
    return <BatchesRouter />;
  }

  const filteredBatches = mockBatches.filter(
    (batch) => batch.id.includes(searchQuery) || searchQuery === ''
  );

  return (
    <>
      {/* Header */}
      <header className="bg-fixed-white border-b-2 border-border-strong px-8 py-6">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-text-main mt-2">Batch Selection</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Total Processed</span>
              <span className="font-mono font-bold text-lg text-text-main">12,405 Docs</span>
            </div>
            <Button variant="primary" onClick={() => navigate('/batch/new')}>
              <span className="material-symbols-outlined !text-[18px]">add</span>
              NEW BATCH
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Search and Filters */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-4 flex-1">
              {/* TODO: Create proper search input atomic design */}
              {/* Search Input - matching reference design with gray background */}
              <div className="relative flex-1 max-w-md">
                <span className="absolute inset-y-0 left-4 flex items-center text-text-muted">
                  <span className="material-symbols-outlined !text-[20px]">search</span>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-surface border-2 border-border-strong text-sm font-medium focus:outline-none focus:ring-0 placeholder-text-muted"
                  placeholder="Search batch ID or name..."
                />
              </div>
              {/* Filter Button */}
              {/* <button className="flex items-center gap-2 px-5 py-3 bg-fixed-white border-2 border-border-strong text-sm font-bold hover:bg-surface transition-colors">
                <span className="material-symbols-outlined !text-[18px]">tune</span>
                Filter
              </button> */}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest mr-2">Sort By:</span>
              <Select
                options={sortOptions}
                value={sortBy}
                onChange={setSortBy}
                inline
              />
            </div>
          </div>

          {/* Batch List */}
          <div className="flex flex-col gap-4">
            {filteredBatches.map((batch) => (
              <BatchCard
                key={batch.id}
                batch={batch}
                onClick={() => navigate(`${BatchesRoutes.List}/${batch.id}`)}
              />
            ))}
          </div>

          {/* TODO: Create proper pagination atomic design */}
          {/* Pagination */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <button className="size-10 flex items-center justify-center border-2 border-border-strong bg-fixed-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="size-10 flex items-center justify-center border-2 border-border-strong bg-fixed-black text-fixed-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              1
            </button>
            <button className="size-10 flex items-center justify-center border-2 border-border-strong bg-fixed-white hover:bg-primary hover:text-fixed-black font-bold transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]">
              2
            </button>
            <button className="size-10 flex items-center justify-center border-2 border-border-strong bg-fixed-white hover:bg-primary hover:text-fixed-black font-bold transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]">
              3
            </button>
            <span className="px-2 text-gray-400 font-bold">...</span>
            <button className="size-10 flex items-center justify-center border-2 border-border-strong bg-fixed-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BatchesPage;
