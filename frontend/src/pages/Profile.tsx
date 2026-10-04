import React, { FormEvent, useEffect, useState } from "react";
import { api } from "../api";
import { IconUser, IconCheck } from "../components/Icons";

export default function Profile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    password: ""
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/users/me")
      .then((r) => setForm({ ...r.data, password: "" }))
      .catch((err) => setError(err.response?.data?.message || "Failed to load profile"));
  }, []);

  const handleChange = (field: string) => (e: any) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setError("");

    try {
      const { data } = await api.put("/users/me", form);
      setForm({ ...data, password: "" });
      localStorage.setItem("user", JSON.stringify(data));
      setMsg("Your recruiter profile has been updated successfully.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1>Recruiter Settings</h1>
          <p className="page-header-sub">
            Manage your personal recruiter profile and account security settings.
          </p>
        </div>
      </div>

      <div className="profile-layout-grid">
        <div className="content-card profile-card">
          <div className="profile-avatar-badge">
            <div className="avatar-circle">
              {form.name ? form.name.slice(0, 2).toUpperCase() : <IconUser size={32} />}
            </div>
            <div>
              <h3>{form.name || "Recruiter"}</h3>
              <p className="profile-company-role">
                Recruiter at {form.company || "SmartHire Organization"}
              </p>
            </div>
          </div>

          {msg && <div className="alert-banner success">{msg}</div>}
          {error && <div className="alert-banner error">{error}</div>}

          <form onSubmit={handleSave} className="profile-form">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                required
              />
            </div>

            <div className="form-group">
              <label>Work Email (Managed by Admin)</label>
              <input type="email" value={form.email} disabled className="input-disabled" />
              <small className="field-hint">Email address cannot be changed directly.</small>
            </div>

            <div className="form-row-two">
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={form.company || ""}
                  onChange={handleChange("company")}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone || ""}
                  onChange={handleChange("phone")}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Update Password</label>
              <input
                type="password"
                placeholder="Leave blank to retain current password"
                value={form.password}
                onChange={handleChange("password")}
                minLength={6}
              />
              <small className="field-hint">Must be at least 6 characters if changing.</small>
            </div>

            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? <span className="btn-spinner"></span> : "Save Profile Changes"}
            </button>
          </form>
        </div>

        <div className="content-card profile-sidebar-card">
          <h3>ATS System Info</h3>
          <div className="ats-info-list">
            <div className="ats-info-item">
              <span className="info-title">Platform</span>
              <span className="info-val">SmartHire ATS v1.0</span>
            </div>
            <div className="ats-info-item">
              <span className="info-title">Resume Formats</span>
              <span className="info-val">PNG, JPG, WEBP, PDF</span>
            </div>
            <div className="ats-info-item">
              <span className="info-title">Max Upload Size</span>
              <span className="info-val">10 MB</span>
            </div>
            <div className="ats-info-item">
              <span className="info-title">Storage Mode</span>
              <span className="info-val">Local Static Engine</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
