import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import type { User } from "../types";
import { IconEye, IconEyeOff, IconBriefcase, IconUsers, IconImage, IconCheck } from "../components/Icons";

export default function Register({ onLogin }: { onLogin: (u: User, t: string) => void }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    phone: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/auth/register", form);
      onLogin(data.user, data.token);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="brand-logo">
            Smart<span>Hire</span>
            <span className="brand-badge">ATS</span>
          </div>

          <h1>Start Hiring Better with SmartHire ATS</h1>
          <p className="hero-desc">
            Empower your HR team with applicant screening, resume image and PDF viewers,
            and real-time hiring metrics.
          </p>

          <div className="hero-checklist">
            <div className="checklist-item">
              <span className="check-bullet"><IconCheck size={16} /></span>
              <span>Fast recruiter onboarding & team collaboration</span>
            </div>
            <div className="checklist-item">
              <span className="check-bullet"><IconCheck size={16} /></span>
              <span>Resume scans & image upload support (PNG, JPG, WEBP)</span>
            </div>
            <div className="checklist-item">
              <span className="check-bullet"><IconCheck size={16} /></span>
              <span>Interactive Kanban pipeline & candidate scoring</span>
            </div>
            <div className="checklist-item">
              <span className="check-bullet"><IconCheck size={16} /></span>
              <span>CSV candidate export & one-click email notifications</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-wrapper">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Create Recruiter Account</h2>
            <p className="auth-subtitle">Set up your workspace to post jobs and review candidates</p>
          </div>

          {error && <div className="alert-banner error">{error}</div>}

          <form onSubmit={submit} className="auth-form">
            <div className="form-row-two">
              <div className="form-group">
                <label htmlFor="reg-name">Full Name *</label>
                <input
                  id="reg-name"
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={form.name}
                  onChange={handleChange("name")}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-company">Company / Organization</label>
                <input
                  id="reg-company"
                  type="text"
                  placeholder="e.g. Acme Inc."
                  value={form.company}
                  onChange={handleChange("company")}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Work Email *</label>
              <input
                id="reg-email"
                type="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={handleChange("email")}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-phone">Phone Number</label>
              <input
                id="reg-phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={handleChange("phone")}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Password (min 6 characters) *</label>
              <div className="password-input-wrap">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  value={form.password}
                  onChange={handleChange("password")}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="primary-btn full-btn" disabled={loading}>
              {loading ? <span className="btn-spinner"></span> : "Create Account & Get Started"}
            </button>

            <div className="auth-footer-text">
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
