import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import type { User } from "../types";
import { IconEye, IconEyeOff, IconBriefcase, IconUsers, IconImage, IconCheck } from "../components/Icons";

export default function Login({ onLogin }: { onLogin: (u: User, t: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });
      onLogin(data.user, data.token);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const fillDemoCredentials = () => {
    setEmail("recruiter@smarthire.com");
    setPassword("password123");
  };

  return (
    <div className="auth-container">
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="brand-logo">
            Smart<span>Hire</span>
            <span className="brand-badge">ATS</span>
          </div>

          <h1>Modern Recruitment Pipeline for High-Growth Teams</h1>
          <p className="hero-desc">
            Source, track, and hire candidates with intuitive drag-and-drop pipeline,
            image & PDF resume previews, and recruiter intelligence.
          </p>

          <div className="hero-features">
            <div className="hero-feature-item">
              <div className="feature-icon-circle">
                <IconImage size={20} />
              </div>
              <div>
                <strong>Resume Image & PDF Uploads</strong>
                <p>Upload screenshots, scans, or PDF documents with instant preview.</p>
              </div>
            </div>

            <div className="hero-feature-item">
              <div className="feature-icon-circle">
                <IconUsers size={20} />
              </div>
              <div>
                <strong>Interactive Candidate Funnel</strong>
                <p>Move applicants seamlessly from Screening to Interview and Offer.</p>
              </div>
            </div>

            <div className="hero-feature-item">
              <div className="feature-icon-circle">
                <IconBriefcase size={20} />
              </div>
              <div>
                <strong>Job Requisition Management</strong>
                <p>Manage open positions, salary bands, and applicants in one hub.</p>
              </div>
            </div>
          </div>

          <div className="hero-testimonial">
            <div className="stars">★★★★★</div>
            <p>"SmartHire streamlined our hiring cycle from weeks down to days."</p>
            <span className="author">— Talent Acquisition Lead</span>
          </div>
        </div>
      </div>

      <div className="auth-form-wrapper">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Recruiter Sign In</h2>
            <p className="auth-subtitle">Access your applicant pipeline and open roles</p>
          </div>

          {error && <div className="alert-banner error">{error}</div>}

          <form onSubmit={submit} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-email">Work Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <div className="label-with-action">
                <label htmlFor="login-password">Password</label>
              </div>
              <div className="password-input-wrap">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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
              {loading ? <span className="btn-spinner"></span> : "Sign In to Dashboard"}
            </button>

            <button
              type="button"
              className="secondary-btn full-btn demo-btn"
              onClick={fillDemoCredentials}
            >
              Fill Demo Credentials
            </button>

            <div className="auth-footer-text">
              Don't have a recruiter account?{" "}
              <Link to="/register" className="auth-link">
                Register here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
