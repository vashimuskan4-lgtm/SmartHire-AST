import React, { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, API_URL } from "../api";
import type { Applicant, Job, Stats, User } from "../types";
import StatCard from "../components/StatCard";
import ResumeDropzone from "../components/ResumeDropzone";
import ResumeViewerModal from "../components/ResumeViewerModal";
import Modal from "../components/Modal";
import {
  IconBriefcase,
  IconUsers,
  IconPlus,
  IconUpload,
  IconCheck,
  IconFileText,
  IconImage,
  IconEye,
  IconExternalLink
} from "../components/Icons";

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentApplicants, setRecentApplicants] = useState<Applicant[]>([]);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Quick Resume Upload Modal / Ingestion State
  const [quickUploadOpen, setQuickUploadOpen] = useState(false);
  const [quickForm, setQuickForm] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    experience: "1",
    job: ""
  });
  const [quickResume, setQuickResume] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState("");

  // Resume Viewer Lightbox State
  const [viewResume, setViewResume] = useState<{ url: string; name: string } | null>(null);

  const navigate = useNavigate();
  const currentUser: User = JSON.parse(localStorage.getItem("user") || "{}");

  const loadData = async () => {
    try {
      const [statsRes, appRes, jobsRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/applicants", { params: { limit: 5, sort: "-createdAt" } }),
        api.get("/jobs", { params: { limit: 4, status: "Open" } })
      ]);
      setStats(statsRes.data);
      setRecentApplicants(appRes.data.applicants || []);
      setActiveJobs(jobsRes.data.jobs || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickUploadSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUploadLoading(true);
    setUploadSuccess("");
    setError("");

    try {
      const formData = new FormData();
      Object.entries(quickForm).forEach(([key, val]) => formData.append(key, val));
      if (quickResume) formData.append("resume", quickResume);

      await api.post("/applicants", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setUploadSuccess(`Candidate ${quickForm.name} added successfully!`);
      setQuickForm({
        name: "",
        email: "",
        phone: "",
        skills: "",
        experience: "1",
        job: activeJobs[0]?._id || ""
      });
      setQuickResume(null);
      setQuickUploadOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload candidate and resume.");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleStatusChange = async (applicantId: string, newStatus: string) => {
    try {
      await api.patch(`/applicants/${applicantId}/status`, { status: newStatus });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="page-loading-wrapper">
        <div className="spinner-large"></div>
        <p>Loading SmartHire Dashboard...</p>
      </div>
    );
  }

  const pipelineStages = [
    { key: "Applied", label: "Applied", count: stats?.applied || 0, color: "var(--color-blue)" },
    { key: "Screening", label: "Screening", count: stats?.screening || 0, color: "var(--color-amber)" },
    { key: "Interview", label: "Interview", count: stats?.interview || 0, color: "var(--color-purple)" },
    { key: "Selected", label: "Selected / Hired", count: stats?.selected || 0, color: "var(--color-emerald)" },
    { key: "Rejected", label: "Archived / Rejected", count: stats?.rejected || 0, color: "var(--color-rose)" }
  ];

  const totalApplicants = stats?.applicants || 0;

  return (
    <div className="page-container dashboard-page">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <div className="welcome-greeting">
            <h1>Welcome back, {currentUser.name || "Recruiter"} 👋</h1>
            <span className="date-badge">
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <p className="welcome-subtitle">
            Here's what's happening with your recruitment pipeline and active job openings today.
          </p>
        </div>

        <div className="welcome-actions">
          <button
            type="button"
            className="secondary-btn with-icon"
            onClick={() => {
              if (activeJobs.length > 0 && !quickForm.job) {
                setQuickForm((prev) => ({ ...prev, job: activeJobs[0]._id }));
              }
              setQuickUploadOpen(true);
            }}
          >
            <IconUpload size={18} />
            <span>Upload Resume</span>
          </button>

          <button
            type="button"
            className="primary-btn with-icon"
            onClick={() => navigate("/jobs")}
          >
            <IconPlus size={18} />
            <span>Post New Job</span>
          </button>
        </div>
      </div>

      {error && <div className="alert-banner error mb-4">{error}</div>}
      {uploadSuccess && <div className="alert-banner success mb-4">{uploadSuccess}</div>}

      {/* Top Stat Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Job Postings"
          value={stats?.jobs || 0}
          icon={<IconBriefcase size={24} />}
          color="indigo"
          subtext={`${stats?.openJobs || 0} positions currently open`}
          onClick={() => navigate("/jobs")}
        />
        <StatCard
          label="Active Openings"
          value={stats?.openJobs || 0}
          icon={<IconPlus size={24} />}
          color="blue"
          subtext="Accepting candidates"
          onClick={() => navigate("/jobs")}
        />
        <StatCard
          label="Total Candidates"
          value={stats?.applicants || 0}
          icon={<IconUsers size={24} />}
          color="purple"
          subtext="Across all pipeline stages"
          onClick={() => navigate("/applicants")}
        />
        <StatCard
          label="In Interviews"
          value={stats?.interview || 0}
          icon={<IconEye size={24} />}
          color="amber"
          subtext="Active interview rounds"
          onClick={() => navigate("/applicants")}
        />
        <StatCard
          label="Hired / Selected"
          value={stats?.selected || 0}
          icon={<IconCheck size={24} />}
          color="emerald"
          subtext="Successful hires"
          onClick={() => navigate("/applicants")}
        />
      </div>

      {/* Pipeline Funnel Visualizer */}
      <div className="content-card mb-6">
        <div className="card-header-row">
          <div>
            <h2>Recruitment Pipeline Breakdown</h2>
            <p className="card-subtext">Candidate distribution across active hiring stages</p>
          </div>
          <Link to="/applicants" className="btn-link">
            Open Full Pipeline →
          </Link>
        </div>

        <div className="pipeline-funnel-grid">
          {pipelineStages.map((stage) => {
            const percentage = totalApplicants > 0 ? Math.round((stage.count / totalApplicants) * 100) : 0;
            return (
              <div
                key={stage.key}
                className="pipeline-stage-card"
                onClick={() => navigate("/applicants")}
                role="button"
                tabIndex={0}
              >
                <div className="stage-card-header">
                  <span className="stage-name">{stage.label}</span>
                  <span className="stage-count">{stage.count}</span>
                </div>
                <div className="stage-progress-bar-bg">
                  <div
                    className="stage-progress-bar-fill"
                    style={{ width: `${Math.max(percentage, stage.count > 0 ? 8 : 0)}%`, backgroundColor: stage.color }}
                  ></div>
                </div>
                <div className="stage-percentage">{percentage}% of candidates</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Quick Resume Uploader & Recent Applicants */}
      <div className="dashboard-columns-grid">
        {/* Left Column: Quick Candidate & Resume Upload Card */}
        <div className="content-card quick-upload-card">
          <div className="card-header-row">
            <div>
              <div className="card-tag">⚡ Fast Track Ingestion</div>
              <h2>Quick Candidate & Resume Upload</h2>
              <p className="card-subtext">
                Upload image scans (PNG/JPG) or PDF resumes directly to your database.
              </p>
            </div>
          </div>

          <form onSubmit={handleQuickUploadSubmit} className="quick-upload-form">
            <div className="form-row-two">
              <div className="form-group">
                <label>Candidate Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={quickForm.name}
                  onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  placeholder="alex.m@example.com"
                  value={quickForm.email}
                  onChange={(e) => setQuickForm({ ...quickForm, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row-two">
              <div className="form-group">
                <label>Target Job Opening *</label>
                <select
                  value={quickForm.job}
                  onChange={(e) => setQuickForm({ ...quickForm, job: e.target.value })}
                  required
                >
                  <option value="">Select a job position</option>
                  {activeJobs.map((j) => (
                    <option key={j._id} value={j._id}>
                      {j.title} ({j.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={quickForm.experience}
                  onChange={(e) => setQuickForm({ ...quickForm, experience: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Skills & Technologies</label>
              <input
                type="text"
                placeholder="React, Node.js, UI/UX, TypeScript"
                value={quickForm.skills}
                onChange={(e) => setQuickForm({ ...quickForm, skills: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Candidate Resume (Image or PDF) *</label>
              <ResumeDropzone
                file={quickResume}
                onFileChange={setQuickResume}
                helperText="Upload image resume scan (PNG, JPG) or PDF document"
              />
            </div>

            <button
              type="submit"
              className="primary-btn full-btn"
              disabled={uploadLoading || !quickForm.name || !quickForm.job}
            >
              {uploadLoading ? (
                <span className="btn-spinner"></span>
              ) : (
                <>
                  <IconUpload size={18} />
                  <span>Submit Candidate & Resume</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Recent Applicants & Quick View */}
        <div className="content-card">
          <div className="card-header-row">
            <div>
              <h2>Recent Candidates</h2>
              <p className="card-subtext">Latest applicants with live resume previews</p>
            </div>
            <Link to="/applicants" className="btn-link">
              View All ({totalApplicants})
            </Link>
          </div>

          {recentApplicants.length === 0 ? (
            <div className="empty-state-box">
              <IconUsers size={40} />
              <h3>No candidates yet</h3>
              <p>Upload a candidate resume or share your job postings.</p>
            </div>
          ) : (
            <div className="recent-applicants-list">
              {recentApplicants.map((app) => {
                const isImage = app.resume && /\.(png|jpe?g|webp|gif)($|\?)/i.test(app.resume);
                const isPdf = app.resume && /\.pdf($|\?)/i.test(app.resume);
                const baseUrl = API_URL.replace("/api", "");
                const fullResumeUrl = app.resume ? `${baseUrl}${app.resume}` : "";

                return (
                  <div key={app._id} className="applicant-item-card">
                    <div className="applicant-avatar">
                      {app.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="applicant-info">
                      <div className="applicant-name-row">
                        <h4>{app.name}</h4>
                        <span className={`status-pill ${app.status.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="applicant-sub">{app.email}</div>
                      <div className="applicant-job-tag">
                        💼 {app.job?.title || "Direct Applicant"} · {app.experience}y exp
                      </div>
                    </div>

                    <div className="applicant-resume-action">
                      {app.resume ? (
                        <button
                          type="button"
                          className="resume-preview-badge-btn"
                          onClick={() => setViewResume({ url: app.resume, name: app.name })}
                          title={`Preview ${app.name}'s resume`}
                        >
                          {isImage ? (
                            <>
                              <div className="mini-thumbnail-wrap">
                                <img
                                  src={fullResumeUrl}
                                  alt="Resume Thumbnail"
                                  className="mini-resume-thumb"
                                />
                              </div>
                              <span className="badge-text">
                                <IconImage size={14} /> Image
                              </span>
                            </>
                          ) : isPdf ? (
                            <>
                              <span className="badge-text pdf">
                                <IconFileText size={14} /> PDF
                              </span>
                            </>
                          ) : (
                            <span className="badge-text">View</span>
                          )}
                        </button>
                      ) : (
                        <span className="no-resume-text">No Resume</span>
                      )}

                      <select
                        className="quick-status-select"
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Screening">Screening</option>
                        <option value="Interview">Interview</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Active Job Openings Teaser */}
          <div className="active-jobs-preview-box">
            <div className="card-header-row mb-3">
              <h3>Active Job Openings</h3>
              <Link to="/jobs" className="btn-link">
                Manage Jobs →
              </Link>
            </div>
            <div className="jobs-mini-list">
              {activeJobs.map((j) => (
                <div key={j._id} className="job-mini-item">
                  <div>
                    <strong>{j.title}</strong>
                    <div className="job-mini-dept">{j.department} · {j.location}</div>
                  </div>
                  <span className="job-type-pill">{j.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Standalone Quick Upload Modal if triggered from top button */}
      {quickUploadOpen && (
        <Modal
          title="Upload Candidate Resume"
          onClose={() => setQuickUploadOpen(false)}
          maxWidth="680px"
        >
          <form onSubmit={handleQuickUploadSubmit} className="quick-upload-form">
            <div className="form-row-two">
              <div className="form-group">
                <label>Candidate Name *</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={quickForm.name}
                  onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={quickForm.email}
                  onChange={(e) => setQuickForm({ ...quickForm, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row-two">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={quickForm.phone}
                  onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  value={quickForm.experience}
                  onChange={(e) => setQuickForm({ ...quickForm, experience: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Target Job Opening *</label>
              <select
                value={quickForm.job}
                onChange={(e) => setQuickForm({ ...quickForm, job: e.target.value })}
                required
              >
                <option value="">Select a job position</option>
                {activeJobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} ({j.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Key Skills</label>
              <input
                type="text"
                placeholder="e.g. React, Node.js, Python, Figma"
                value={quickForm.skills}
                onChange={(e) => setQuickForm({ ...quickForm, skills: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Upload Resume Image / PDF *</label>
              <ResumeDropzone
                file={quickResume}
                onFileChange={setQuickResume}
                helperText="Upload image resume scan (PNG, JPG) or PDF document (Max 10MB)"
              />
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setQuickUploadOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-btn"
                disabled={uploadLoading || !quickForm.name || !quickForm.job}
              >
                {uploadLoading ? <span className="btn-spinner"></span> : "Save Candidate"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Lightbox Resume Viewer */}
      {viewResume && (
        <ResumeViewerModal
          resumeUrl={viewResume.url}
          applicantName={viewResume.name}
          onClose={() => setViewResume(null)}
        />
      )}
    </div>
  );
}
