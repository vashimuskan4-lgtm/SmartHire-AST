import React, { useEffect, useRef, useState } from "react";
import { IconUpload, IconImage, IconFileText, IconTrash, IconEye, IconClose } from "./Icons";

interface ResumeDropzoneProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  helperText?: string;
}

export default function ResumeDropzone({
  file,
  onFileChange,
  helperText = "Supports image scans (PNG, JPG, WEBP) or PDF up to 10MB"
}: ResumeDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate object URL for image preview
  useEffect(() => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const validateAndSetFile = (selectedFile: File) => {
    setErrorMessage("");
    const isImage = selectedFile.type.startsWith("image/");
    const isPdf = selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isImage && !isPdf) {
      setErrorMessage("Please select a valid image (PNG, JPG, WEBP) or PDF resume.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage("File exceeds 10MB limit. Please upload a smaller file.");
      return;
    }

    onFileChange(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="resume-dropzone-container">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp,.pdf,.png,.jpg,.jpeg,.webp"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {!file ? (
        <div
          className={`dropzone-box ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <div className="dropzone-icon-wrapper">
            <IconUpload size={32} />
          </div>
          <div className="dropzone-text">
            <strong>Click to upload resume</strong> or drag & drop here
          </div>
          <div className="dropzone-subtext">{helperText}</div>
          <div className="dropzone-tags">
            <span className="file-chip image">🖼 Image Resume (PNG/JPG)</span>
            <span className="file-chip pdf">📄 PDF Resume</span>
          </div>
        </div>
      ) : (
        <div className="resume-preview-card">
          {previewUrl ? (
            <div className="preview-image-container" onClick={() => setIsModalOpen(true)}>
              <img src={previewUrl} alt="Resume Preview" className="resume-img-thumbnail" />
              <div className="preview-hover-overlay">
                <IconEye size={20} />
                <span>Click to expand</span>
              </div>
            </div>
          ) : (
            <div className="preview-pdf-icon">
              <IconFileText size={40} />
              <span className="pdf-tag">PDF</span>
            </div>
          )}

          <div className="resume-meta">
            <div className="resume-name-row">
              <span className="resume-file-name" title={file.name}>
                {file.name}
              </span>
              <span className={`file-badge ${file.type.startsWith("image/") ? "badge-image" : "badge-pdf"}`}>
                {file.type.startsWith("image/") ? "IMAGE" : "PDF"}
              </span>
            </div>
            <div className="resume-size-info">{formatSize(file.size)}</div>

            <div className="resume-actions-row">
              {previewUrl && (
                <button
                  type="button"
                  className="btn-action preview"
                  onClick={() => setIsModalOpen(true)}
                  title="View full preview"
                >
                  <IconEye size={16} /> Preview
                </button>
              )}
              <button
                type="button"
                className="btn-action change"
                onClick={() => inputRef.current?.click()}
                title="Change file"
              >
                Change
              </button>
              <button
                type="button"
                className="btn-action remove"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileChange(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                title="Remove file"
              >
                <IconTrash size={16} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && <div className="dropzone-error">{errorMessage}</div>}

      {/* Enlarged image preview modal */}
      {isModalOpen && previewUrl && (
        <div className="resume-lightbox-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="resume-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <div className="lightbox-title">
                <IconImage size={20} />
                <span>Resume Image Preview — {file?.name}</span>
              </div>
              <button
                type="button"
                className="lightbox-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <IconClose size={20} />
              </button>
            </div>
            <div className="lightbox-body">
              <img src={previewUrl} alt="Resume Preview Large" className="lightbox-image" />
            </div>
            <div className="lightbox-footer">
              <span>{file ? formatSize(file.size) : ""}</span>
              <button
                type="button"
                className="primary-btn sm"
                onClick={() => setIsModalOpen(false)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
