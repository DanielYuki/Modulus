import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import type React from 'react';
import { Button, H1, Body, Icon } from '@atomic';
import { StatusFilter, type FilterStatus, type StatusFilterOption } from '@atomic/mol.status-filter';
import { JobCard, type JobStatus } from '@atomic/org.job-card';
import { getBatchStatus, getPdfUrl, getTexUrl, type BatchItem } from '@/app/data/batch.gateway';
import { BatchesRoutes } from '../batches.routes';

// Map API status to UI JobStatus
function mapStatus(apiStatus: BatchItem['status']): JobStatus {
  switch (apiStatus) {
    case 'done': return 'done';
    case 'error': return 'failed';
    case 'generating':
    case 'compiling': return 'active';
    case 'pending': return 'queued';
    default: return 'queued';
  }
}

function mapStatusLabel(item: BatchItem): string {
  switch (item.status) {
    case 'done': return 'READY';
    case 'error': return 'Error';
    case 'generating': return 'Generating content...';
    case 'compiling': return 'Compiling PDF...';
    case 'pending': return 'Waiting...';
    default: return 'Unknown';
  }
}

const BatchDetailPage: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<FilterStatus | undefined>();
  const [jobs, setJobs] = useState<BatchItem[]>([]);
  const [batchStatus, setBatchStatus] = useState<string>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch batch status
  const fetchStatus = useCallback(async () => {
    if (!batchId) return;

    try {
      const response = await getBatchStatus(batchId);
      setJobs(response.items);
      setBatchStatus(response.status);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch batch status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setIsLoading(false);
    }
  }, [batchId]);

  // Initial fetch and polling
  useEffect(() => {
    fetchStatus();

    // Poll every 3 seconds while processing
    const interval = setInterval(() => {
      if (batchStatus === 'pending' || batchStatus === 'processing') {
        fetchStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchStatus, batchStatus]);



  // Handle view PDF in new tab
  const handleView = (index: number) => {
    if (!batchId) return;
    const url = getPdfUrl(batchId, index);
    window.open(url, '_blank');
  };

  // Handle download TEX
  const handleDownload = (index: number, type: 'tex' | 'pdf') => {
    if (!batchId) return;
    const url = type === 'tex' ? getTexUrl(batchId, index) : getPdfUrl(batchId, index);
    window.open(url, '_blank');
  };

  // Filter options based on actual job data
  const filterOptions: StatusFilterOption[] = [
    { status: 'completed', label: 'Completed', count: jobs.filter(j => j.status === 'done').length },
    { status: 'processing', label: 'Processing', count: jobs.filter(j => j.status === 'generating' || j.status === 'compiling').length },
    { status: 'failed', label: 'Failed', count: jobs.filter(j => j.status === 'error').length },
    { status: 'queued', label: 'Queued', count: jobs.filter(j => j.status === 'pending').length },
  ];

  const filteredJobs = activeFilter
    ? jobs.filter(j => {
      if (activeFilter === 'completed') return j.status === 'done';
      if (activeFilter === 'processing') return j.status === 'generating' || j.status === 'compiling';
      if (activeFilter === 'failed') return j.status === 'error';
      if (activeFilter === 'queued') return j.status === 'pending';
      return true;
    })
    : jobs;

  if (!batchId) {
    return (
      <div className="p-8 text-center">
        <p className="text-text-muted">No batch ID provided</p>
        <Button variant="primary" onClick={() => navigate('/batch/new')}>
          Create New Batch
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-fixed-white border-b-2 border-border-strong px-8 py-6">
        <div className="max-w-[1600px] mx-auto flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-text-muted uppercase tracking-wide font-medium">
              <button
                onClick={() => navigate(BatchesRoutes.List)}
                className="hover:text-text-main transition-colors flex items-center gap-1"
              >
                <Icon name="arrow_back" size="sm" />
                All Batches
              </button>
              <Icon name="chevron_right" size="sm" />
              <span className="text-text-main font-bold font-mono">#{batchId.slice(0, 8)}...</span>
            </div>
            <H1>
              Batch #{batchId.slice(0, 8)}
            </H1>
            {error && (
              <Body className="text-status-failed mt-1">{error}</Body>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" onClick={() => navigate('/batch/new')}>
              <Icon name="add" size="sm" />
              NEW BATCH
            </Button>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Icon name="progress_activity" size="xl" color="primary" className="animate-spin" />
            </div>
          ) : (
            <>
              {/* Status Filter */}
              <div className="mb-8">
                <StatusFilter
                  options={filterOptions}
                  activeStatus={activeFilter}
                  onSelect={(status) => setActiveFilter(status === activeFilter ? undefined : status)}
                />
              </div>

              {/* Job Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredJobs.map((item) => (
                  <JobCard
                    key={item.index}
                    filename={item.subject}
                    fileSize={item.pdf_available ? 'PDF Ready' : ''}
                    status={mapStatus(item.status)}
                    statusLabel={mapStatusLabel(item)}
                    progress={item.status === 'generating' ? 33 : item.status === 'compiling' ? 66 : undefined}
                    progressLabel={item.status === 'generating' ? 'AI generating...' : item.status === 'compiling' ? 'Compiling...' : undefined}
                    error={item.error || undefined}
                    onView={item.pdf_available ? () => handleView(item.index) : undefined}
                    onRetry={() => console.log('Retry', item.index)}
                    onCancel={() => console.log('Cancel', item.index)}
                    onDownload={item.pdf_available || item.tex_available ? (type) => handleDownload(item.index, type) : undefined}
                  />
                ))}
              </div>

              {/* Empty State */}
              {filteredJobs.length === 0 && (
                <div className="text-center py-12 text-text-muted">
                  No items match the selected filter
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BatchDetailPage;
