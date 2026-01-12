import { Body, Button, H1, Icon } from '@atomic';
import { type FilterStatus, StatusFilter, type StatusFilterOption } from '@atomic/mol.status-filter';
import { JobCard, type JobStatus } from '@atomic/org.job-card';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { type BatchItem, getBatchStatus, getDownloadAllUrl, getPdfUrl, getTexUrl } from '@/app/data/batch.gateway';
import { BatchesRoutes } from '../batches.routes';

// Format bytes to human-readable size
function formatBytes(bytes: number): string {
  if (bytes === 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

// Map API status to UI JobStatus
function mapStatus(apiStatus: BatchItem['status']): JobStatus {
  switch (apiStatus) {
    case 'done':
      return 'done';
    case 'error':
      return 'failed';
    case 'generating':
    case 'compiling':
      return 'active';
    case 'pending':
      return 'queued';
    default:
      return 'queued';
  }
}

function mapStatusLabel(item: BatchItem): string {
  switch (item.status) {
    case 'done':
      return 'READY';
    case 'error':
      return 'Error';
    case 'generating':
      return 'Generating content...';
    case 'compiling':
      return 'Compiling PDF...';
    case 'pending':
      return 'Waiting...';
    default:
      return 'Unknown';
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
    window.open(url, '_blank'); // Opens in new tab
  };

  // Handle download TEX or PDF
  const handleDownload = (index: number, type: 'tex' | 'pdf') => {
    if (!batchId) return;
    const url = type === 'tex' ? getTexUrl(batchId, index) : getPdfUrl(batchId, index, true);
    // Do not open in new tab, download instead
    const link = document.createElement('a');
    link.href = url;
    link.download = `${index}.pdf`;
    link.click();
  };

  // Filter options based on actual job data
  const filterOptions: StatusFilterOption[] = [
    { status: 'completed', label: 'Completed', count: jobs.filter(j => j.status === 'done').length },
    {
      status: 'processing',
      label: 'Processing',
      count: jobs.filter(j => j.status === 'generating' || j.status === 'compiling').length,
    },
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
      <header className="border-border-strong border-b-2 bg-fixed-white px-8 py-6">
        <div className="mx-auto flex max-w-[1600px] items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-medium text-sm text-text-muted uppercase tracking-wide">
              <button
                type="button"
                onClick={() => navigate(BatchesRoutes.List)}
                className="flex items-center gap-1 transition-colors hover:text-text-main">
                Batches
              </button>
              <Icon name="chevron_right" size="sm" />
              <span className="font-bold font-mono text-text-main">#{batchId.slice(0, 8)}...</span>
            </div>
            <H1>Batch #{batchId.slice(0, 8)}</H1>
            {error && <Body className="mt-1 text-status-failed">{error}</Body>}
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="primary"
              onClick={() => {
                if (!batchId) return;
                window.location.href = getDownloadAllUrl(batchId);
              }}>
              <Icon name="download" size="sm" />
              DOWNLOAD ALL
            </Button>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="mx-auto max-w-[1600px]">
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
                  onSelect={status => setActiveFilter(status === activeFilter ? undefined : status)}
                />
              </div>

              {/* Job Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredJobs.map(item => (
                  // TODO: Implement proper progress tracking
                  <JobCard
                    key={item.index}
                    filename={item.subject}
                    fileSize={item.pdf_available ? formatBytes(item.size_bytes) : ''}
                    status={mapStatus(item.status)}
                    statusLabel={mapStatusLabel(item)}
                    progress={item.status === 'generating' ? 33 : item.status === 'compiling' ? 66 : undefined}
                    progressLabel={
                      item.status === 'generating'
                        ? 'AI generating...'
                        : item.status === 'compiling'
                          ? 'Compiling...'
                          : undefined
                    }
                    error={item.error || undefined}
                    onView={item.pdf_available ? () => handleView(item.index) : undefined}
                    onRetry={() => { }}
                    onCancel={() => { }}
                    onDownload={
                      item.pdf_available || item.tex_available ? type => handleDownload(item.index, type) : undefined
                    }
                  />
                ))}
              </div>

              {/* Empty State */}
              {filteredJobs.length === 0 && (
                <div className="py-12 text-center text-text-muted">No items match the selected filter</div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BatchDetailPage;
