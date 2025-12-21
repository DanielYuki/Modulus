import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import type React from 'react';
import { Button } from '@atomic';
import { StatusFilter, type FilterStatus, type StatusFilterOption } from '@atomic/mol.status-filter';
import { JobCard, type JobStatus } from '@atomic/org.job-card';
import { getBatchStatus, getPdfUrl, getTexUrl, type BatchItem } from '@/app/data/batch.gateway';

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

const BatchOutputPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<FilterStatus | undefined>();
  const [jobs, setJobs] = useState<BatchItem[]>([]);
  const [batchStatus, setBatchStatus] = useState<string>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Fetch batch status
  const fetchStatus = useCallback(async () => {
    if (!jobId) return;

    try {
      const response = await getBatchStatus(jobId);
      setJobs(response.items);
      setBatchStatus(response.status);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch batch status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

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

  // Elapsed time counter
  useEffect(() => {
    const timer = setInterval(() => {
      if (batchStatus === 'pending' || batchStatus === 'processing') {
        setElapsedTime(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [batchStatus]);

  // Format elapsed time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle view PDF in new tab
  const handleView = (index: number) => {
    if (!jobId) return;
    const url = getPdfUrl(jobId, index);
    window.open(url, '_blank');
  };

  // Handle download TEX
  const handleDownload = (index: number, type: 'tex' | 'pdf') => {
    if (!jobId) return;
    const url = type === 'tex' ? getTexUrl(jobId, index) : getPdfUrl(jobId, index);
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

  if (!jobId) {
    return (
      <div className="p-8 text-center">
        <p className="text-text-muted">No job ID provided</p>
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
              <span>Batch</span>
              <span className="material-symbols-outlined !text-sm">chevron_right</span>
              <span className="text-text-main font-bold font-mono">{jobId.slice(0, 8)}...</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-text-main mt-2">
              Bulk Generation Progress
            </h1>
            {error && (
              <p className="text-red-600 text-sm mt-1">{error}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Time Elapsed</span>
              <span className="font-mono font-bold text-lg text-text-main">
                {batchStatus === 'completed' || batchStatus === 'failed' ? 'DONE' : formatTime(elapsedTime)}
              </span>
            </div>
            <Button variant="secondary" onClick={() => navigate('/batch/new')}>
              <span className="material-symbols-outlined !text-[18px]">add</span>
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
              <span className="material-symbols-outlined text-4xl animate-spin text-primary">progress_activity</span>
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

export default BatchOutputPage;
