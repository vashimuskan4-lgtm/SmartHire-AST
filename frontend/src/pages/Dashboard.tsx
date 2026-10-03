import { useEffect, useState } from "react";
import { api } from "../api";
import type { Stats } from "../types";
import StatCard from "../components/StatCard";

export default function Dashboard() {
 const [stats,setStats]=useState<Stats|null>(null); const [error,setError]=useState("");
 useEffect(()=>{api.get("/dashboard/stats").then(r=>setStats(r.data)).catch(e=>setError(e.response?.data?.message||"Could not load dashboard"));},[]);
 if(error)return <div className="page"><div className="alert error">{error}</div></div>;
 if(!stats)return <div className="center">Loading dashboard...</div>;
 return <div className="page"><div className="page-title"><div><h1>Dashboard</h1><p className="muted">Recruitment overview at a glance.</p></div></div>
   <div className="stats"><StatCard label="Total Jobs" value={stats.jobs} icon="💼"/><StatCard label="Open Jobs" value={stats.openJobs} icon="📢"/><StatCard label="Applicants" value={stats.applicants} icon="👥"/><StatCard label="Selected" value={stats.selected} icon="✓"/></div>
   <div className="panel"><h2>Applicant Pipeline</h2><div className="pipeline">
    {[["Applied",stats.applied],["Screening",stats.screening],["Interview",stats.interview],["Selected",stats.selected],["Rejected",stats.rejected]].map(([x,n])=><div className="pipe" key={String(x)}><b>{x}</b><strong>{n}</strong></div>)}
   </div></div>
 </div>
}
