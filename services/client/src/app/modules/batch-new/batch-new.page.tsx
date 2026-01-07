import { Badge, Button, H3, H4, HDisplay, Icon, Select, TextArea } from '@atomic';
import { FileChip } from '@atomic/mol.file-chip';
import { FileDropzone } from '@atomic/mol.file-dropzone';
import type React from 'react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { createBatch } from '@/app/data/batch.gateway';

interface UploadedFile {
  id: string;
  name: string;
  type: 'pdf' | 'tex';
  status: 'ready' | 'uploading';
  file: File; // Store actual File object
}

const BatchNewPage: React.FC = () => {
  const navigate = useNavigate();

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [subjects, setSubjects] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFilesChange = useCallback((newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map((f, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: f.name,
      type: f.name.endsWith('.tex') ? 'tex' : 'pdf',
      status: 'ready',
      file: f,
    }));
    setFiles(prev => [...prev, ...uploadedFiles]);
  }, []);

  const handleRemoveFile = useCallback(
    (id: string) => {
      setFiles(prev => prev.filter(f => f.id !== id));
      // Clear selected template if the removed file was the template
      if (selectedTemplate === id) {
        setSelectedTemplate('');
      }
    },
    [selectedTemplate],
  );

  const handleGenerateBatch = async () => {
    setError(null);

    // Validation
    const subjectList = subjects.split('\n').filter(s => s.trim());
    if (subjectList.length === 0) {
      setError('Please enter at least one subject');
      return;
    }

    const templateFile = files.find(f => f.id === selectedTemplate);
    if (!templateFile) {
      setError('Please select a template');
      return;
    }

    try {
      const pdfFiles = files.filter(f => f.type === 'pdf').map(f => f.file);

      const result = await createBatch(pdfFiles, templateFile.file, subjectList, instructions || undefined);

      // Navigate to output page with the job ID
      navigate(`/batch/output/${result.job_id}`);
    } catch (err) {
      console.error('Batch creation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to create batch');
    }
  };

  const texFiles = files.filter(f => f.type === 'tex');
  const templateOptions = texFiles.map(f => ({ value: f.id, label: `${f.name} (Uploaded)` }));
  const subjectCount = subjects.split('\n').filter(s => s.trim()).length;

  return (
    <>
      {/* Header */}
      <header className="border-border-strong border-b-2 bg-fixed-white px-8 py-6">
        <div className="mx-auto max-w-6xl">
          <HDisplay className="mb-3 lg:text-5xl">Bulk Generation</HDisplay>
          <div className="font-medium text-base text-text-secondary leading-relaxed lg:text-lg">
            <span className="border-2 border-border-strong bg-primary px-2 py-1 font-bold text-fixed-black text-sm">
              1. Upload
            </span>{' '}
            source PDFs.{' '}
            <span className="border-2 border-border-strong bg-primary px-2 py-1 font-bold text-fixed-black text-sm">
              2. Add
            </span>{' '}
            .tex template.{' '}
            <span className="border-2 border-border-strong bg-primary px-2 py-1 font-bold text-fixed-black text-sm">
              3. Define
            </span>{' '}
            subjects.
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 xl:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-8 xl:col-span-2">
            {/* Source Files */}
            <div className="border-2 border-border-strong bg-surface-light p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <H4 className="mb-6 flex items-center gap-2">
                <Icon name="upload_file" /> Source Files
              </H4>

              <FileDropzone
                title="Drop PDFs and .tex template"
                subtitle="MAX 20MB PER FILE"
                onFilesChange={handleFilesChange}
              />

              {files.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-4">
                  {files.map(file => (
                    <FileChip
                      key={file.id}
                      filename={file.name}
                      status={file.type === 'tex' ? 'Template' : 'Ready'}
                      fileType={file.type}
                      onRemove={() => handleRemoveFile(file.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Target Subjects */}
            <div className="border-2 border-border-strong bg-surface-light p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-4 flex items-center justify-between">
                <H4 className="flex items-center gap-2">
                  <Icon name="list_alt" />
                  Target Subjects
                </H4>
                <Badge status="ready">One per line</Badge>
              </div>

              <TextArea
                placeholder="1. Executive Summary Optimization
2. Statistical Analysis of Section 4
3. Literature Review Expansion
4. Methodology Simplification"
                value={subjects}
                onChange={setSubjects}
                rows={8}
              />
            </div>
          </div>

          {/* Right Column (Config) */}
          <div className="xl:col-span-1">
            <div className="sticky top-6 flex flex-col gap-6 border-2 border-border-strong bg-surface-light p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <H3 className="flex items-center gap-2 border-border-strong border-b-2 pb-4">
                <Icon name="tune" /> Configuration
              </H3>

              <Select
                label="Active Template"
                options={templateOptions}
                value={selectedTemplate}
                onChange={setSelectedTemplate}
                placeholder="Select a template..."
              />

              <div className="flex items-center justify-between border-2 border-border-strong bg-primary-light p-4">
                <span className="font-bold text-text-main text-xs uppercase">Batch Size</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text-secondary text-xs uppercase tracking-wider">
                    Subject Count:
                  </span>
                  <span className="bg-fixed-black px-2 py-1 font-bold font-mono text-fixed-white text-sm">
                    {subjectCount.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="instructions-input" className="font-bold text-text-main text-xs uppercase">
                  Instructions <span className="font-normal text-text-muted normal-case opacity-70">(Optional)</span>
                </label>
                <input
                  id="instructions-input"
                  className="w-full border-2 border-border-strong bg-fixed-white px-3 py-3 font-medium text-sm text-text-main transition-all placeholder:text-text-muted focus:border-primary-hover focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                  placeholder="E.g., Maintain citation keys..."
                  type="text"
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="border-2 border-status-failed-border bg-status-failed-bg p-3 font-medium text-sm text-status-failed">
                  {error}
                </div>
              )}

              <div className="border-border-strong border-t-2 border-dashed pt-4">
                <Button variant="primary" size="lg" fullWidth onClick={handleGenerateBatch}>
                  <Icon name="auto_awesome" size="lg" />
                  Generate Batch
                </Button>
                <p className="mx-auto mt-3 inline-block w-max border-primary border-b-2 px-2 text-center font-mono text-text-secondary text-xs">
                  Est. time: ~{Math.max(1, subjectCount * 0.5).toFixed(0)}m per subject
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BatchNewPage;
