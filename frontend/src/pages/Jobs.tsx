import { FormEvent, useEffect, useState } from "react";
import { api } from "../api";
import type { Job } from "../types";
import Modal from "../components/Modal";

const blank={title:"",department:"",location:"",type:"Full-time",description:"",requirements:"",salary:"",status:"Open"};
export default function Jobs(){
 const [jobs,setJobs]=useState<Job[]>([]); const [search,setSearch]=useState(""); const [page,setPage]=useState(1); const [pages,setPages]=useState(1);
 const [open,setOpen]=useState(false); const [editing,setEditing]=useState<Job|null>(null); const [form,setForm]=useState<any>(blank); const [error,setError]=useState("");
 const load=async()=>{try{const r=await api.get("/jobs",{params:{search,page,limit:6}});setJobs(r.data.jobs);setPages(r.data.pages);}catch(e:any){setError(e.response?.data?.message||"Could not load jobs");}};
 useEffect(()=>{const t=setTimeout(load,300);return()=>clearTimeout(t)},[search,page]);
 const change=(k:string)=>(e:any)=>setForm({...form,[k]:e.target.value});
 const save=async(e:FormEvent)=>{e.preventDefault();try{if(editing)await api.put(`/jobs/${editing._id}`,form);else await api.post("/jobs",form);setOpen(false);setEditing(null);setForm(blank);load();}catch(e:any){setError(e.response?.data?.message||"Save failed");}};
 const edit=(j:Job)=>{setEditing(j);setForm(j);setOpen(true)};
 const remove=async(id:string)=>{if(confirm("Delete this job and its applicants?")){await api.delete(`/jobs/${id}`);load();}};
 return <div className="page"><div className="page-title"><div><h1>Jobs</h1><p className="muted">Create and manage open positions.</p></div><button className="primary" onClick={()=>{setEditing(null);setForm(blank);setOpen(true)}}>+ Create Job</button></div>
 <div className="toolbar"><input placeholder="Search jobs..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}/></div>
 {error&&<div className="alert error">{error}</div>}
 <div className="cards-grid">{jobs.map(j=><div className="job-card" key={j._id}><div className="row"><span className={`badge ${j.status==="Open"?"green":"gray"}`}>{j.status}</span><span className="muted">{j.type}</span></div><h2>{j.title}</h2><p>{j.department} · {j.location}</p><p className="muted clamp">{j.description}</p><div className="card-actions"><button onClick={()=>edit(j)}>Edit</button><button className="danger-text" onClick={()=>remove(j._id)}>Delete</button></div></div>)}</div>
 {jobs.length===0&&<div className="empty">No jobs found.</div>}
 <Pagination page={page} pages={pages} setPage={setPage}/>
 {open&&<Modal title={editing?"Edit Job":"Create Job"} onClose={()=>setOpen(false)}><form onSubmit={save}>
  <div className="two"><label>Job Title<input value={form.title} onChange={change("title")} required/></label><label>Department<input value={form.department} onChange={change("department")} required/></label></div>
  <div className="two"><label>Location<input value={form.location} onChange={change("location")} required/></label><label>Type<select value={form.type} onChange={change("type")}><option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option></select></label></div>
  <div className="two"><label>Salary<input value={form.salary} onChange={change("salary")} placeholder="e.g. ₹6-10 LPA"/></label><label>Status<select value={form.status} onChange={change("status")}><option>Open</option><option>Closed</option></select></label></div>
  <label>Description<textarea value={form.description} onChange={change("description")} required/></label><label>Requirements<textarea value={form.requirements} onChange={change("requirements")}/></label>
  <button className="primary full">Save Job</button></form></Modal>}
 </div>
}
function Pagination({page,pages,setPage}:{page:number;pages:number;setPage:(n:number)=>void}){return pages>1?<div className="pagination"><button disabled={page===1} onClick={()=>setPage(page-1)}>←</button><span>Page {page} of {pages}</span><button disabled={page===pages} onClick={()=>setPage(page+1)}>→</button></div>:null}
