import React, { useRef, useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { FileUp, FileText, CheckCircle2, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const UploadCard = ({ onUpload, uploading, currentFileAt }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // We let the hook handle rigorous validation, but set the UI state here
    setSelectedFile(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const triggerUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <Card className="border-border">
      <CardContent className="p-8">
        <div 
          className={cn(
            "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors text-center relative",
            dragActive ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/10" : "border-border bg-surface-hover",
            selectedFile ? "border-success-400 bg-success-50/20 dark:bg-success-900/10" : ""
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Hidden Accessibility Input */}
          <input 
            ref={inputRef}
            type="file" 
            className="hidden" 
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
            onChange={handleChange} 
            disabled={uploading}
            aria-label="Upload Resume File"
          />

          {!selectedFile ? (
            <>
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center mb-4">
                <FileUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Upload your Resume</h3>
              <p className="text-text-secondary text-sm mb-6 max-w-sm">
                Drag and drop your PDF or DOCX file here, or click the button below to browse your files.
              </p>
              <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
                Browse Files
              </Button>
              <p className="text-text-muted text-xs mt-4 uppercase tracking-wide font-medium">
                Max file size: 5MB
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 text-success-600 rounded-full flex items-center justify-center mb-4 relative">
                <FileText className="w-8 h-8" />
                <button 
                  onClick={clearFile}
                  disabled={uploading}
                  className="absolute -top-2 -right-2 bg-error-500 text-white rounded-full p-1 hover:bg-error-600 transition disabled:opacity-50"
                  aria-label="Remove selected file"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-1">{selectedFile.name}</h3>
              <p className="text-text-secondary text-sm mb-6">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
              </p>
              <Button variant="primary" onClick={triggerUpload} isLoading={uploading} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                {currentFileAt ? "Replace Resume & Analyze" : "Analyze Resume"}
              </Button>
            </>
          )}
        </div>

        {currentFileAt && !selectedFile && (
           <div className="mt-6 text-center text-sm text-text-secondary flex flex-col items-center gap-2">
             <p>You already have a resume on file.</p>
             <p className="text-xs text-text-muted">Last uploaded: {currentFileAt.toLocaleDateString()}</p>
           </div>
        )}
      </CardContent>
    </Card>
  );
};
