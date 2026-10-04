import React, { FormEvent, useEffect, useState } from "react";
import { api } from "../api";
import type { Job } from "../types";
import Modal from "../components/Modal";
import {
  IconBriefcase,
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconUsers
} from "../components/Icons";

const blankJob = {
  title: "",
  department: "",
  location: "",
  type: "Full-time",
  description: "",
  requirements: "",
  salary: "",
  status: "Open"
};

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [form, setForm] = useState<any>(blankJob);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/jobs", {
        params: {
          search,
          status: statusFilter || undefined,
          page,
          limit: 6
        }
      });
      setJobs(res.data.jobs || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadJobs, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, page]);

  const handleChange = (field: string) => (e: any) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingJob) {
        await api.put(`/jobs/${editingJob._id}`, form);
      } else {
        await api.post("/jobs", form);
      }
      setOpenModal(false);
      setEditingJob(null);
      setForm(blankJob);
      loadJobs();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save job");
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    setEditingJob(null);
    setForm(blankJob);
    setOpenModal(true);
  };

  const openEdit = (job: Job) => {
    setEditingJob(job);
    setForm(job);
    setOpenModal(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Delete "${title}" and all its applicants permanently?`)) {
      try {
        await api.delete(`/jobs/${id}`);
        loadJobs();
      } catch (err: any) {
        alert(err.response?.data?.message || "Failed to delete job");
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1>Job Openings</h1>
          <p className="page-header-sub">
            Publish positions, define compensation, and manage hiring requirements.
          </p>
        </div>

        <button type="button" className="primary-btn with-icon" onClick={openCreate}>
          <IconPlus size={18} />
          <span>Post New Job</span>
        </button>
      </div>

      <div className="filters-card">
        <div className="search-input-wrap">
          <IconSearch size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search jobs by title, department, or location..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="select-filters-group">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses ({total})</option>
            <option value="Open">Open Only</option>
            <option value="Closed">Closed Only</option>
          </select>
        </div>
      </div>

      {error && <div className="alert-banner error mb-4">{error}</div>}

      {jobs.length === 0 ? (
        <div className="content-card">
          <div className="empty-state-box">
            <IconBriefcase size={44} />
            <h3>No job postings found</h3>
            <p>Get started by creating your first job requisition.</p>
            <button type="button" className="primary-btn mt-3" onClick={openCreate}>
              + Create Job
            </button>
          </div>
        </div>
      ) : (
        <div className="jobs-cards-grid">
          {jobs.map((j) => (
            <div key={j._id} className="job-card-premium">
              <div className="job-card-header">
                <span className={`status-badge-pill ${j.status === "Open" ? "open" : "closed"}`}>
                  ● {j.status}
                </span>
                <span className="job-type-tag">{j.type}</span>
              </div>

              <h2 className="job-title-text">{j.title}</h2>
              <div className="job-location-row">
                <span>🏢 {j.department}</span>
                <span>📍 {j.location}</span>
              </div>

              {j.salary && <div className="job-salary-badge">💰 {j.salary}</div>}

              <p className="job-description-preview">{j.description}</p>

              {j.requirements && (
                <div className="job-reqs-preview">
                  <strong>Key Requirements:</strong>
                  <p>{j.requirements}</p>
                </div>
              )}

              <div className="job-card-footer">
                <div className="job-date-text">
                  Posted {new Date(j.createdAt).toLocaleDateString()}
                </div>

                <div className="job-card-actions">
                  <button
                    type="button"
                    className="btn-card-edit"
                    onClick={() => openEdit(j)}
                    title="Edit position"
                  >
                    <IconEdit size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="btn-card-delete-text"
                    onClick={() => handleDelete(j._id, j.title)}
                    title="Delete position"
                  >
                    <IconTrash size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="pagination-bar mt-4">
          <button
            type="button"
            className="page-nav-btn"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>
          <span className="pagination-info">
            Page {page} of {pages} ({total} jobs)
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

      {/* Create / Edit Job Modal */}
      {openModal && (
        <Modal
          title={editingJob ? "Edit Job Position" : "Create New Job Position"}
          onClose={() => setOpenModal(false)}
          maxWidth="680px"
        >
          <form onSubmit={handleSave} className="job-form">
            <div className="form-row-two">
              <div className="form-group">
                <label>Job Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={form.title}
                  onChange={handleChange("title")}
                  required
                />
              </div>
              <div className="form-group">
                <label>Department *</label>
                <input
                  type="text"
                  placeholder="e.g. Engineering, Product, Design"
                  value={form.department}
                  onChange={handleChange("department")}
                  required
                />
              </div>
            </div>

            <div className="form-row-two">
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  placeholder="e.g. Remote, New York, NY, Hybrid"
                  value={form.location}
                  onChange={handleChange("location")}
                  required
                />
              </div>
              <div className="form-group">
                <label>Employment Type *</label>
                <select value={form.type} onChange={handleChange("type")}>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="form-row-two">
              <div className="form-group">
                <label>Compensation / Salary Range</label>
                <input
                  type="text"
                  placeholder="e.g. $120k - $150k or ₹12-18 LPA"
                  value={form.salary}
                  onChange={handleChange("salary")}
                />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select value={form.status} onChange={handleChange("status")}>
                  <option value="Open">Open (Active recruitment)</option>
                  <option value="Closed">Closed (Paused/Filled)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Role Description *</label>
              <textarea
                placeholder="Describe role responsibilities, team structure, and day-to-day work..."
                rows={4}
                value={form.description}
                onChange={handleChange("description")}
                required
              />
            </div>

            <div className="form-group">
              <label>Role Requirements & Qualifications</label>
              <textarea
                placeholder="List required skills, experience level, educational background..."
                rows={3}
                value={form.requirements}
                onChange={handleChange("requirements")}
              />
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setOpenModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-btn"
                disabled={saving || !form.title || !form.department}
              >
                {saving ? <span className="btn-spinner"></span> : "Save Job Posting"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
