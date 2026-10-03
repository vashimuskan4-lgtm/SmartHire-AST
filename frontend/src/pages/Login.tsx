import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import type { User } from "../types";

export default function Login({ onLogin }: { onLogin: (u: User, t: string) => void }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const nav = useNavigate();
  async function submit(e: FormEvent) {
    e.preventDefault(); setError("");
    try { const { data } = await api.post("/auth/login", { email, password }); onLogin(data.user, data.token); nav("/"); }
    catch (e: any) { setError(e.response?.data?.message || "Login failed"); }
  }
  return <AuthBox title="Welcome back" subtitle="Sign in to your recruiter account">
    <form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
    <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
    {error && <div className="alert error">{error}</div>}<button className="primary full">Login</button>
    <p className="center muted">No account? <Link to="/register">Create one</Link></p></form>
  </AuthBox>
}
function AuthBox({title,subtitle,children}:{title:string;subtitle:string;children:any}) {
 return <div className="auth-page"><div className="auth-card"><div className="brand big">Smart<span>Hire</span></div><h1>{title}</h1><p className="muted">{subtitle}</p>{children}</div></div>
}
