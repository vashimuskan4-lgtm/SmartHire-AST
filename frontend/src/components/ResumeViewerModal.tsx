import React, { useState } from "react";
import { API_URL } from "../api";
import {
  IconClose,
  IconDownload,
  IconExternalLink,
  IconImage,
  IconFileText,
  IconZoomIn,
  IconZoomOut,
  IconRotate
} from "./Icons";

interface ResumeViewerModalProps {
  resumeUrl: string;
  applicantName: string;
  onClose: () => void;
}

export default function ResumeViewerModal({
  resumeUrl,
  applicantName,
  onClose
}: ResumeViewerModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!resumeUrl) return null;

  // Construct full URL
  const baseUrl = API_URL.replace("/api", "");
  const fullUrl = resumeUrl.startsWith("http") ? resumeUrl : `${baseUrl}${resumeUrl}`;

  const isImage = /\.(png|jpe?g|webp|gif|bmp|svg)($|\?)/i.test(resumeUrl);
  const isPdf = /\.pdf($|\?)/i.test(resumeUrl);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const filename = resumeUrl.split("/").pop() || "resume";

  return (
    <div className="resume-viewer-overlay" onClick={onClose}>
      <div className="resume-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="resume-viewer-header">
          <div className="resume-viewer-info">
            <span className="file-type-icon">
              {isImage ? <IconImage size={22} /> : <IconFileText size={22} />}
            </span>
            <div>
              <h3>{applicantName}'s Resume</h3>
              <p className="resume-filename">{filename}</p>
            </div>
          </div>

          <div className="resume-viewer-controls">
            {isImage && (
              <div className="zoom-controls">
                <button type="button" onClick={handleZoomOut} title="Zoom Out">
                  <IconZoomOut size={18} />
                </button>
                <span className="zoom-percentage">{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={handleZoomIn} title="Zoom In">
                  <IconZoomIn size={18} />
                </button>
                <button type="button" onClick={handleRotate} title="Rotate 90°">
                  <IconRotate size={18} />
                </button>
                <button type="button" className="btn-text-sm" onClick={handleReset} title="Reset view">
                  Reset
                </button>
              </div>
            )}

            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="viewer-action-btn"
              title="Open original in new tab"
            >
              <IconExternalLink size={18} />
              <span>Open</span>
            </a>

            <a
              href={fullUrl}
              download={filename}
              className="viewer-action-btn"
              title="Download resume"
            >
              <IconDownload size={18} />
              <span>Download</span>
            </a>

            <button type="button" className="viewer-close-btn" onClick={onClose} title="Close viewer">
              <IconClose size={20} />
            </button>
          </div>
        </div>

        <div className="resume-viewer-body">
          {isImage ? (
            <div className="image-viewport">
              <img
                src={fullUrl}
                alt={`${applicantName} Resume`}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: "transform 0.2s ease"
                }}
                className="viewer-main-image"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={fullUrl}
              title={`${applicantName} Resume PDF`}
              className="viewer-pdf-frame"
            />
          ) : (
            <div className="unsupported-viewer">
              <p>Resume preview is not directly supported for this file type.</p>
              <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="primary-btn">
                Download / View File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
