import { useState } from 'react';
import type React from 'react';
import { AppLayout } from '@app/components';
import { Button } from '@atomic';
import { StatusFilter, type FilterStatus, type StatusFilterOption } from '@atomic/mol.status-filter';
import { JobCard, type JobStatus } from '@atomic/org.job-card';

interface Job {
  id: string;
  filename: string;
  fileSize: string;
  status: JobStatus;
  statusLabel: string;
  progress?: number;
  progressLabel?: string;
  error?: string;
}

const mockJobs: Job[] = [
  { id: '1', filename: 'financial_q3.pdf', fileSize: '2.4 MB', status: 'done', statusLabel: 'READY' },
  { id: '2', filename: 'marketing.pdf', fileSize: '1.8 MB', status: 'done', statusLabel: 'READY' },
  { id: '3', filename: 'comp_analysis.pdf', fileSize: '', status: 'active', statusLabel: 'Generating PDF...', progress: 78, progressLabel: 'Formatting tables' },
  { id: '4', filename: 'dataset_v2.pdf', fileSize: '', status: 'failed', statusLabel: 'Compiler Error (Line 42)', error: '! Undefined control sequence. \\alpha -> \\beta ...' },
  { id: '5', filename: 'appendix_A.pdf', fileSize: '', status: 'queued', statusLabel: 'Waiting for resources...' },
];

const BatchProgressPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterStatus | undefined>();
  const [jobs] = useState<Job[]>(mockJobs);
  const [paused, setPaused] = useState(false);

  const filterOptions: StatusFilterOption[] = [
    { status: 'completed', label: 'Completed', count: jobs.filter(j => j.status === 'done').length },
    { status: 'processing', label: 'Processing', count: jobs.filter(j => j.status === 'active').length },
    { status: 'failed', label: 'Failed', count: jobs.filter(j => j.status === 'failed').length },
    { status: 'queued', label: 'Queued', count: jobs.filter(j => j.status === 'queued').length },
  ];

  const filteredJobs = activeFilter
    ? jobs.filter(j => {
      if (activeFilter === 'completed') return j.status === 'done';
      if (activeFilter === 'processing') return j.status === 'active';
      if (activeFilter === 'failed') return j.status === 'failed';
      if (activeFilter === 'queued') return j.status === 'queued';
      return true;
    })
    : jobs;

  return (
    <AppLayout>
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="flex items-start justify-between mb-8 pb-6 border-b-2 border-border-strong">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-text-muted uppercase tracking-wide font-medium">
              <span>Projects</span>
              <span className="material-symbols-outlined !text-sm">chevron_right</span>
              <span>Q3 Reports</span>
              <span className="material-symbols-outlined !text-sm">chevron_right</span>
              <span className="text-text-main font-bold">Batch #2940</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-text-main mt-2">
              Bulk Generation Progress
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Time Elapsed</span>
              <span className="font-mono font-bold text-lg text-text-main">{paused ? "PAUSED" : "00:45"}</span>
            </div>
            <Button
              variant={paused ? 'primary' : 'secondary'}
              onClick={() => setPaused(!paused)}
            >
              <span className="material-symbols-outlined !text-[18px]">{paused ? 'play_arrow' : 'pause'}</span>
              {paused ? 'RESUME' : 'PAUSE'}
            </Button>
            <Button variant="dark">
              <span className="material-symbols-outlined !text-[18px]">download</span>
              DOWNLOAD ALL
            </Button>
          </div>
        </header>

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
          {filteredJobs.map(job => (
            <JobCard
              key={job.id}
              filename={job.filename}
              fileSize={job.fileSize}
              status={job.status}
              statusLabel={job.statusLabel}
              progress={job.progress}
              progressLabel={job.progressLabel}
              error={job.error}
              onView={() => console.log('View', job.id)}
              onRetry={() => console.log('Retry', job.id)}
              onCancel={() => console.log('Cancel', job.id)}
              onDownload={(type) => console.log('Download', type, job.id)}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default BatchProgressPage;
