import { Body, BodySecondary, H1, H3, Icon, LinkButton } from '@atomic';
import { BatchCard, type BatchCardStatus } from '@atomic/org.batch-card';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { type BatchListItem, listBatches } from '@/app/data/batch.gateway';
import { BatchesRoutes } from './batches.routes';

const BatchesPage: React.FC = () => {
  const navigate = useNavigate();
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
                <BatchCard
                  key={batch.id}
                  batchId={batch.id}
                  onClick={() => navigate(BatchesRoutes.detailPath(batch.id))}
                  status={batch.status as BatchCardStatus}
                  createdAt={batch.created_at}
                  totalItems={batch.total_items}
                  completedItems={batch.completed_items}
                  failedItems={batch.failed_items}
                  totalSizeBytes={batch.total_size_bytes}
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
