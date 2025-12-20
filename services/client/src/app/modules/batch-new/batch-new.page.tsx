import { useState } from 'react';
import type React from 'react';
import {
  Button,
  TextArea,
  Select,
  Badge,
} from '@atomic';
import { FileDropzone } from '@atomic/mol.file-dropzone';
import { FileChip } from '@atomic/mol.file-chip';

interface UploadedFile {
  id: string;
  name: string;
  type: 'pdf' | 'tex';
  status: 'ready' | 'uploading';
}

const BatchNewPage: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([
    { id: '1', name: 'Research_Paper_v1.pdf', type: 'pdf', status: 'ready' },
    { id: '2', name: 'Appendix_B.tex', type: 'tex', status: 'ready' },
  ]);
  const [subjects, setSubjects] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleFilesChange = (newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map((f, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: f.name,
      type: f.name.endsWith('.tex') ? 'tex' : 'pdf',
      status: 'ready',
    }));
    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const texFiles = files.filter(f => f.type === 'tex');
  const templateOptions = texFiles.map(f => ({ value: f.id, label: `${f.name} (Uploaded)` }));

  const subjectCount = subjects.split('\n').filter(s => s.trim()).length;

  return (
    <>
      {/* Header */}
      <header className="bg-fixed-white border-b-2 border-border-strong px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-text-main uppercase mb-3">
            Bulk Generation
          </h1>
          <div className="text-base lg:text-lg text-text-secondary leading-relaxed font-medium">
            <span className="bg-primary px-1.5 py-0.5 text-fixed-black font-bold border-2 border-border-strong text-sm">1. Upload</span> source PDFs. <span className="bg-primary px-1.5 py-0.5 text-fixed-black font-bold border-2 border-border-strong text-sm">2. Add</span> .tex template. <span className="bg-primary px-1.5 py-0.5 text-fixed-black font-bold border-2 border-border-strong text-sm">3. Define</span> subjects.
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-8">
            {/* Source Files */}
            <div className="bg-surface-light p-6 border-2 border-border-strong shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-main mb-6 flex items-center gap-2 border-b-2 border-border-strong pb-2 w-max">
                <span className="material-symbols-outlined text-xl">upload_file</span> Source Files
              </h3>

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
                <label className="font-bold text-text-main text-sm uppercase tracking-wide flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">list_alt</span>
                  Target Subjects
                </label>
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
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2 border-b-2 border-border-strong pb-4 uppercase">
                <span className="material-symbols-outlined">tune</span> Configuration
              </h3>

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
                />
              </div>

              <div className="pt-4 border-t-2 border-border-strong border-dashed">
                <Button variant="primary" size="lg" fullWidth>
                  <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">auto_awesome</span>
                  Generate Batch
                </Button>
                <p className="text-center text-xs font-mono text-text-secondary mt-3 border-b-2 border-primary inline-block mx-auto w-max px-2">
                  Est. time: ~2m 15s
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
