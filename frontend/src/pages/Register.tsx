import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import type { User } from "../types";

export default function Register({ onLogin }: { onLogin: (u: User, t: string) => void }) {
  const [form, setForm] = useState({name:"",email:"",password:"",company:"",phone:""});
  const [error,setError]=useState(""); const nav=useNavigate();
  const set=(k:string)=>(e:any)=>setForm({...form,[k]:e.target.value});
  async function submit(e:FormEvent){e.preventDefault();setError("");try{const {data}=await api.post("/auth/register",form);onLogin(data.user,data.token);nav("/");}catch(e:any){setError(e.response?.data?.message||"Registration failed");}}
  return <div className="auth-page"><div className="auth-card"><div className="brand big">Smart<span>Hire</span></div><h1>Create recruiter account</h1><p className="muted">Start managing your hiring pipeline.</p>
    <form onSubmit={submit}><div className="two"><label>Name<input value={form.name} onChange={set("name")} required /></label><label>Phone<input value={form.phone} onChange={set("phone")} /></label></div>
    <label>Email<input type="email" value={form.email} onChange={set("email")} required /></label><label>Company<input value={form.company} onChange={set("company")} /></label><label>Password<input type="password" value={form.password} onChange={set("password")} minLength={6} required /></label>
    {error&&<div className="alert error">{error}</div>}<button className="primary full">Register</button><p className="center muted">Already registered? <Link to="/login">Login</Link></p></form>
  </div></div>
}
