import React, { useState, useEffect } from 'react';

interface FileUploadProps {
  onUploadSuccess?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>('cv');
  const [isDragging, setIsDragging] = useState(false);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');

  useEffect(() => {
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          setTextContent(e.target.result.split('\n').slice(0, 5).join('\n')); // Show first 5 lines
        }
      };
      reader.readAsText(file);
    } else {
      setTextContent(null);
    }
  }, [file]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    // Reset the file input so the same file can be re-selected
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    setUploadStatus('uploading');
    setUploadMessage('Processing document...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    try {
      const response = await fetch('http://localhost:5001/upload-document', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus('success');
        setUploadMessage(data.message);
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        setUploadStatus('error');
        setUploadMessage(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
      setUploadMessage('An error occurred. Is the backend server running?');
    }
  };

  return (
    <div className={`file-upload-container ${file ? 'has-file' : ''}`}>
      <h2>Upload a Document</h2>
      <p>Select a document category and upload it to start asking questions.</p>

      <div className="file-upload-content-wrapper">
        <div
          className={`drop-zone ${isDragging ? 'dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragEvents}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt"
          />
          <label htmlFor="file-upload" className="file-input-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <span>
              {file ? file.name : (
                <>
                  Drag & drop a file here
                  <span className="file-input-subtitle">or click to browse</span>
                </>
              )}
            </span>
          </label>
        </div>

        <div className="file-preview-container">
          {file && (
            <>
              {file.type === 'text/plain' && textContent ? (
                <div className="text-preview-wrapper">
                  <pre>{textContent}</pre>
                </div>
              ) : (
                <div className="file-preview-icon generic">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
              )}
              <div className="file-preview-details">
                <span className="file-preview-name">{file.name}</span>
                {/* Removed PDF-specific pages display */}
                <span className="file-preview-size">{(file.size / 1024).toFixed(2)} KB</span>
              </div>
              <button onClick={handleRemoveFile} className="file-remove-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="upload-controls">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="category-select">
          <option value="cv">CV / Resume</option>
          <option value="research">Research Paper</option>
          <option value="legal">Legal Document</option>
          <option value="general">General Document</option>
        </select>

        <button onClick={handleUpload} className="upload-button" disabled={!file || uploadStatus === 'uploading'}>
          {uploadStatus === 'uploading' ? 'Processing...' : 'Process Document'}
        </button>
      </div>

      {uploadMessage && (
        <div className={`upload-status-message ${uploadStatus}`}>
          <p>{uploadMessage}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;