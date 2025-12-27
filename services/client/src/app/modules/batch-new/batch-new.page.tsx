import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import type React from 'react';
import {
  Button,
  TextArea,
  Select,
  Badge,
  HDisplay,
  H3,
  H4,
  Icon,
} from '@atomic';
import { FileDropzone } from '@atomic/mol.file-dropzone';
import { FileChip } from '@atomic/mol.file-chip';
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

  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    // Clear selected template if the removed file was the template
    if (selectedTemplate === id) {
      setSelectedTemplate('');
    }
  }, [selectedTemplate]);

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

      const result = await createBatch(
        pdfFiles,
        templateFile.file,
        subjectList,
        instructions || undefined
      );

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
      <header className="bg-fixed-white border-b-2 border-border-strong px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <HDisplay className="lg:text-5xl mb-3">
            Bulk Generation
          </HDisplay>
          <div className="text-base lg:text-lg text-text-secondary leading-relaxed font-medium">
            <span className="bg-primary px-2 py-1 text-fixed-black font-bold border-2 border-border-strong text-sm">1. Upload</span> source PDFs. <span className="bg-primary px-2 py-1 text-fixed-black font-bold border-2 border-border-strong text-sm">2. Add</span> .tex template. <span className="bg-primary px-2 py-1 text-fixed-black font-bold border-2 border-border-strong text-sm">3. Define</span> subjects.
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-8">
            {/* Source Files */}
            <div className="bg-surface-light p-6 border-2 border-border-strong shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <H4 className="mb-6 flex items-center gap-2">
                <Icon name="upload_file" /> Source Files
              </H4>

              <FileDropzone
                title="Drop PDFs and .tex template"
                subtitle="MAX 20MB PER FILE"
                onFilesChange={handleFilesChange}
              />

              {files.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-6">
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
            <div className="bg-surface-light p-6 border-2 border-border-strong shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-4">
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
            <div className="bg-surface-light p-6 border-2 border-border-strong shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6 sticky top-6">
              <H3 className="flex items-center gap-2 border-b-2 border-border-strong pb-4">
                <Icon name="tune" /> Configuration
              </H3>

              <Select
                label="Active Template"
                options={templateOptions}
                value={selectedTemplate}
                onChange={setSelectedTemplate}
                placeholder="Select a template..."
              />

              <div className="p-4 bg-primary-light border-2 border-border-strong flex justify-between items-center">
                <label className="font-bold text-text-main text-xs uppercase">Batch Size</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Subject Count:</span>
                  <span className="bg-fixed-black text-fixed-white font-mono font-bold text-sm px-2 py-1">
                    {subjectCount.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-text-main text-xs uppercase">
                  Instructions <span className="text-text-muted font-normal normal-case opacity-70">(Optional)</span>
                </label>
                <input
                  className="w-full px-3 py-3 bg-fixed-white border-2 border-border-strong text-sm text-text-main placeholder:text-text-muted font-medium focus:outline-none focus:border-primary-hover focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  placeholder="E.g., Maintain citation keys..."
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-status-failed-bg border-2 border-status-failed-border text-status-failed text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="pt-4 border-t-2 border-border-strong border-dashed">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleGenerateBatch}
                >
                  <Icon name="auto_awesome" size="lg" />
                  Generate Batch
                </Button>
                <p className="text-center text-xs font-mono text-text-secondary mt-3 border-b-2 border-primary inline-block mx-auto w-max px-2">
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
