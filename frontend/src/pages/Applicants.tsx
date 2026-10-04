import React, { FormEvent, useEffect, useState } from "react";
import { api, API_URL } from "../api";
import type { Applicant, Job } from "../types";
import Modal from "../components/Modal";
import ResumeDropzone from "../components/ResumeDropzone";
import ResumeViewerModal from "../components/ResumeViewerModal";
import {
  IconSearch,
  IconPlus,
  IconDownload,
  IconTable,
  IconKanban,
  IconImage,
  IconFileText,
  IconTrash,
  IconEye,
  IconCheck,
  IconUsers
} from "../components/Icons";

const STATUSES = ["Applied", "Screening", "Interview", "Selected", "Rejected"] as const;

export default function Applicants() {
  const [items, setItems] = useState<Applicant[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [job, setJob] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [viewResume, setViewResume] = useState<{ url: string; name: string } | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    experience: "0",
    job: ""
  });
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadApplicants = async () => {
    try {
      setLoading(true);
      const res = await api.get("/applicants", {
        params: {
          search,
          status,
          job,
          page,
          limit: viewMode === "kanban" ? 50 : 8,
          sort: "-createdAt"
        }
      });
      setItems(res.data.applicants || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get("/jobs", { params: { limit: 100 } }).then((r) => setJobs(r.data.jobs || []));
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadApplicants, 250);
    return () => clearTimeout(timer);
  }, [search, status, job, page, viewMode]);

  const handleInputChange = (field: string) => (e: any) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleAddApplicant = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (resume) fd.append("resume", resume);

      await api.post("/applicants", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setAddModalOpen(false);
      setForm({ name: "", email: "", phone: "", skills: "", experience: "0", job: "" });
      setResume(null);
      loadApplicants();
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not add candidate");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/applicants/${id}/status`, { status: newStatus });
      setItems((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status: newStatus as any } : app))
      );
      if (selectedApplicant && selectedApplicant._id === id) {
        setSelectedApplicant({ ...selectedApplicant, status: newStatus as any });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update candidate status");
    }
  };

  const handleDeleteApplicant = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this candidate record?")) {
      try {
        await api.delete(`/applicants/${id}`);
        if (selectedApplicant?._id === id) setSelectedApplicant(null);
        loadApplicants();
      } catch (err: any) {
        alert(err.response?.data?.message || "Failed to delete candidate");
      }
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Name", "Email", "Phone", "Job Title", "Status", "Experience (Years)", "Skills", "Resume URL"],
      ...items.map((a) => [
        a.name,
        a.email,
        a.phone || "",
        a.job?.title || "",
        a.status,
        a.experience,
        a.skills || "",
        a.resume ? `${API_URL.replace("/api", "")}${a.resume}` : ""
      ])
    ];

    const csvContent = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `smarthire-candidates-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const baseUrl = API_URL.replace("/api", "");

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1>Candidate Pipeline</h1>
          <p className="page-header-sub">
            Track applicants, inspect resume images & documents, and advance hiring stages.
          </p>
        </div>

        <div className="page-header-actions">
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`toggle-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <IconTable size={18} />
              <span>Table</span>
            </button>
            <button
              type="button"
              className={`toggle-btn ${viewMode === "kanban" ? "active" : ""}`}
              onClick={() => setViewMode("kanban")}
              title="Pipeline Kanban View"
            >
              <IconKanban size={18} />
              <span>Kanban</span>
            </button>
          </div>

          <button type="button" className="secondary-btn with-icon" onClick={exportCSV}>
            <IconDownload size={18} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="primary-btn with-icon"
            onClick={() => setAddModalOpen(true)}
          >
            <IconPlus size={18} />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="filters-card">
        <div className="search-input-wrap">
          <IconSearch size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search candidates by name, email, or skills..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="select-filters-group">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses ({total})</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={job}
            onChange={(e) => {
              setJob(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Jobs ({jobs.length})</option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert-banner error mb-4">{error}</div>}

      {/* View Rendering */}
      {viewMode === "table" ? (
        <div className="content-card no-padding">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Target Position</th>
                  <th>Experience</th>
                  <th>Key Skills</th>
                  <th>Pipeline Status</th>
                  <th>Resume Preview</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-empty-cell">
                      <div className="empty-state-box">
                        <IconUsers size={40} />
                        <h3>No candidates found</h3>
                        <p>Try adjusting your search filters or add a new candidate.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((app) => {
                    const isImage = app.resume && /\.(png|jpe?g|webp|gif)($|\?)/i.test(app.resume);
                    const isPdf = app.resume && /\.pdf($|\?)/i.test(app.resume);
                    const fullResumeUrl = app.resume ? `${baseUrl}${app.resume}` : "";

                    return (
                      <tr key={app._id}>
                        <td>
                          <div
                            className="candidate-cell"
                            onClick={() => setSelectedApplicant(app)}
                            role="button"
                            tabIndex={0}
                          >
                            <div className="candidate-avatar">
                              {app.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="candidate-name">{app.name}</div>
                              <div className="candidate-email">{app.email}</div>
                              {app.phone && <div className="candidate-phone">{app.phone}</div>}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="job-badge">{app.job?.title || "Not Assigned"}</span>
                        </td>

                        <td>
                          <span className="exp-pill">{app.experience} years</span>
                        </td>

                        <td>
                          <div className="skills-tags-wrap">
                            {app.skills ? (
                              app.skills
                                .split(",")
                                .slice(0, 3)
                                .map((s, i) => (
                                  <span key={i} className="skill-pill">
                                    {s.trim()}
                                  </span>
                                ))
                            ) : (
                              <span className="muted-text">—</span>
                            )}
                          </div>
                        </td>

                        <td>
                          <select
                            className={`status-dropdown-select ${app.status.toLowerCase()}`}
                            value={app.status}
                            onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td>
                          {app.resume ? (
                            <button
                              type="button"
                              className="resume-table-btn"
                              onClick={() => setViewResume({ url: app.resume, name: app.name })}
                              title={`Preview ${app.name}'s resume`}
                            >
                              {isImage ? (
                                <div className="resume-table-thumb-wrap">
                                  <img
                                    src={fullResumeUrl}
                                    alt="Resume thumbnail"
                                    className="resume-table-thumb"
                                  />
                                  <span className="resume-badge-text image">
                                    <IconImage size={14} /> Image
                                  </span>
                                </div>
                              ) : isPdf ? (
                                <span className="resume-badge-text pdf">
                                  <IconFileText size={14} /> PDF
                                </span>
                              ) : (
                                <span className="resume-badge-text">View</span>
                              )}
                            </button>
                          ) : (
                            <span className="muted-text">None</span>
                          )}
                        </td>

                        <td style={{ textAlign: "right" }}>
                          <div className="table-actions-group">
                            <button
                              type="button"
                              className="btn-icon-action"
                              onClick={() => setSelectedApplicant(app)}
                              title="View details"
                            >
                              <IconEye size={17} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon-action delete"
                              onClick={() => handleDeleteApplicant(app._id)}
                              title="Delete candidate"
                            >
                              <IconTrash size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="pagination-bar">
              <button
                type="button"
                className="page-nav-btn"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {page} of {pages} ({total} candidates)
              </span>
              <button
                type="button"
                className="page-nav-btn"
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Kanban Pipeline View */
        <div className="kanban-board-container">
          {STATUSES.map((colStatus) => {
            const columnCandidates = items.filter((a) => a.status === colStatus);

            return (
              <div key={colStatus} className="kanban-column">
                <div className={`kanban-column-header ${colStatus.toLowerCase()}`}>
                  <div className="col-title-row">
                    <h3>{colStatus}</h3>
                    <span className="col-count-pill">{columnCandidates.length}</span>
                  </div>
                </div>

                <div className="kanban-cards-wrapper">
                  {columnCandidates.length === 0 ? (
                    <div className="kanban-empty-col">No candidates</div>
                  ) : (
                    columnCandidates.map((c) => {
                      const isImage = c.resume && /\.(png|jpe?g|webp|gif)($|\?)/i.test(c.resume);
                      const isPdf = c.resume && /\.pdf($|\?)/i.test(c.resume);
                      const fullResumeUrl = c.resume ? `${baseUrl}${c.resume}` : "";

                      return (
                        <div key={c._id} className="kanban-candidate-card">
                          <div className="kanban-card-top">
                            <span className="kanban-job-name">{c.job?.title || "Open Candidate"}</span>
                            <button
                              type="button"
                              className="btn-card-delete"
                              onClick={() => handleDeleteApplicant(c._id)}
                              title="Delete"
                            >
                              <IconTrash size={15} />
                            </button>
                          </div>

                          <div
                            className="kanban-candidate-name"
                            onClick={() => setSelectedApplicant(c)}
                          >
                            {c.name}
                          </div>
                          <div className="kanban-candidate-email">{c.email}</div>

                          <div className="kanban-details-row">
                            <span>⏱ {c.experience}y exp</span>
                          </div>

                          {/* Resume image thumbnail preview in Kanban card! */}
                          {c.resume && (
                            <div
                              className="kanban-resume-preview-bar"
                              onClick={() => setViewResume({ url: c.resume, name: c.name })}
                            >
                              {isImage ? (
                                <div className="kanban-thumb-wrap">
                                  <img
                                    src={fullResumeUrl}
                                    alt="Resume preview"
                                    className="kanban-resume-thumb"
                                  />
                                  <span>
                                    <IconImage size={13} /> View Resume Image
                                  </span>
                                </div>
                              ) : isPdf ? (
                                <div className="kanban-pdf-wrap">
                                  <IconFileText size={15} />
                                  <span>View Resume PDF</span>
                                </div>
                              ) : null}
                            </div>
                          )}

                          {/* Move to another stage selector */}
                          <div className="kanban-stage-selector">
                            <select
                              value={c.status}
                              onChange={(e) => handleStatusChange(c._id, e.target.value)}
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  Move to: {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Applicant Modal */}
      {addModalOpen && (
        <Modal
          title="Add New Candidate"
          onClose={() => setAddModalOpen(false)}
          maxWidth="700px"
        >
          <form onSubmit={handleAddApplicant} className="add-applicant-form">
            <div className="form-row-two">
              <div className="form-group">
                <label>Candidate Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rachel Adams"
                  value={form.name}
                  onChange={handleInputChange("name")}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  placeholder="rachel@example.com"
                  value={form.email}
                  onChange={handleInputChange("email")}
                  required
                />
              </div>
            </div>

            <div className="form-row-two">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 987-6543"
                  value={form.phone}
                  onChange={handleInputChange("phone")}
                />
              </div>
              <div className="form-group">
                <label>Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={form.experience}
                  onChange={handleInputChange("experience")}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Target Job Position *</label>
              <select
                value={form.job}
                onChange={handleInputChange("job")}
                required
              >
                <option value="">Select an open position</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} ({j.department} - {j.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Candidate Skills & Competencies</label>
              <input
                type="text"
                placeholder="React, TypeScript, CSS, Node.js, GraphQL"
                value={form.skills}
                onChange={handleInputChange("skills")}
              />
            </div>

            <div className="form-group">
              <label>Upload Candidate Resume (Image Scan or PDF)</label>
              <ResumeDropzone
                file={resume}
                onFileChange={setResume}
                helperText="Upload image resume scan (PNG, JPG, WEBP) or PDF document (Max 10MB)"
              />
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-btn"
                disabled={submitting || !form.name || !form.job}
              >
                {submitting ? <span className="btn-spinner"></span> : "Save Candidate"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Candidate Details Drawer / Modal */}
      {selectedApplicant && (
        <Modal
          title={`Candidate Profile — ${selectedApplicant.name}`}
          onClose={() => setSelectedApplicant(null)}
          maxWidth="750px"
        >
          <div className="candidate-details-modal">
            <div className="candidate-profile-header">
              <div className="profile-avatar-large">
                {selectedApplicant.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="profile-headline">
                <h2>{selectedApplicant.name}</h2>
                <p>{selectedApplicant.job?.title || "No Job Assigned"}</p>
                <div className="profile-contact-line">
                  <span>📧 {selectedApplicant.email}</span>
                  {selectedApplicant.phone && <span>📞 {selectedApplicant.phone}</span>}
                  <span>⏱ {selectedApplicant.experience} yrs exp</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Pipeline Status</h4>
              <div className="status-selection-bar">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`status-chip-btn ${selectedApplicant.status === s ? "active " + s.toLowerCase() : ""}`}
                    onClick={() => handleStatusChange(selectedApplicant._id, s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="detail-section">
              <h4>Skills & Keywords</h4>
              <div className="skills-tags-wrap large">
                {selectedApplicant.skills ? (
                  selectedApplicant.skills.split(",").map((s, idx) => (
                    <span key={idx} className="skill-pill-large">
                      {s.trim()}
                    </span>
                  ))
                ) : (
                  <p className="muted-text">No skills recorded.</p>
                )}
              </div>
            </div>

            {/* Embedded Resume Preview in Details */}
            <div className="detail-section">
              <div className="section-header-flex">
                <h4>Candidate Resume</h4>
                {selectedApplicant.resume && (
                  <button
                    type="button"
                    className="btn-text-sm"
                    onClick={() =>
                      setViewResume({
                        url: selectedApplicant.resume,
                        name: selectedApplicant.name
                      })
                    }
                  >
                    Open in Fullscreen Viewer →
                  </button>
                )}
              </div>

              {selectedApplicant.resume ? (
                /\.(png|jpe?g|webp|gif)($|\?)/i.test(selectedApplicant.resume) ? (
                  <div
                    className="candidate-resume-image-preview"
                    onClick={() =>
                      setViewResume({
                        url: selectedApplicant.resume,
                        name: selectedApplicant.name
                      })
                    }
                  >
                    <img
                      src={`${baseUrl}${selectedApplicant.resume}`}
                      alt="Resume Preview"
                      className="full-detail-resume-img"
                    />
                    <div className="resume-img-overlay-bar">
                      <span>Click to enlarge and inspect</span>
                    </div>
                  </div>
                ) : (
                  <div className="candidate-pdf-card">
                    <IconFileText size={32} />
                    <div>
                      <strong>PDF Document Attached</strong>
                      <p>View complete document in new tab or viewer modal</p>
                    </div>
                    <button
                      type="button"
                      className="secondary-btn sm"
                      onClick={() =>
                        setViewResume({
                          url: selectedApplicant.resume,
                          name: selectedApplicant.name
                        })
                      }
                    >
                      Open PDF
                    </button>
                  </div>
                )
              ) : (
                <div className="empty-state-box">
                  <p>No resume uploaded for this candidate.</p>
                </div>
              )}
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="danger-btn"
                onClick={() => handleDeleteApplicant(selectedApplicant._id)}
              >
                Delete Candidate
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setSelectedApplicant(null)}
              >
                Close
              </button>
            </div>
          </div>
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
