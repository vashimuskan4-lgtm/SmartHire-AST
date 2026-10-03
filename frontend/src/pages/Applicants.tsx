import { FormEvent, useEffect, useState } from "react";
import { api, API_URL } from "../api";
import type { Applicant, Job } from "../types";
import Modal from "../components/Modal";

const statuses=["Applied","Screening","Interview","Selected","Rejected"];
export default function Applicants(){
 const [items,setItems]=useState<Applicant[]>([]);const [jobs,setJobs]=useState<Job[]>([]);
 const [search,setSearch]=useState("");const [status,setStatus]=useState("");const [job,setJob]=useState("");const [page,setPage]=useState(1);const [pages,setPages]=useState(1);
 const [open,setOpen]=useState(false);const [error,setError]=useState("");
 const [form,setForm]=useState({name:"",email:"",phone:"",skills:"",experience:"0",job:""});const [resume,setResume]=useState<File|null>(null);
 const load=async()=>{try{const r=await api.get("/applicants",{params:{search,status,job,page,limit:7}});setItems(r.data.applicants);setPages(r.data.pages);}catch(e:any){setError(e.response?.data?.message||"Could not load applicants")}};
 useEffect(()=>{api.get("/jobs",{params:{limit:100}}).then(r=>setJobs(r.data.jobs));},[]);
 useEffect(()=>{const t=setTimeout(load,250);return()=>clearTimeout(t)},[search,status,job,page]);
 const set=(k:string)=>(e:any)=>setForm({...form,[k]:e.target.value});
 const add=async(e:FormEvent)=>{e.preventDefault();try{const fd=new FormData();Object.entries(form).forEach(([k,v])=>fd.append(k,v));if(resume)fd.append("resume",resume);await api.post("/applicants",fd,{headers:{"Content-Type":"multipart/form-data"}});setOpen(false);setForm({name:"",email:"",phone:"",skills:"",experience:"0",job:""});setResume(null);load();}catch(e:any){setError(e.response?.data?.message||"Could not add applicant")}};
 const changeStatus=async(id:string,s:string)=>{await api.patch(`/applicants/${id}/status`,{status:s});load()};
 const remove=async(id:string)=>{if(confirm("Delete this applicant?")){await api.delete(`/applicants/${id}`);load()}};
 const exportCSV=()=>{const rows=[["Name","Email","Job","Status","Experience","Skills"],...items.map(a=>[a.name,a.email,a.job?.title||"",a.status,a.experience,a.skills])];const csv=rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");const url=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));const a=document.createElement("a");a.href=url;a.download="smarthire-applicants.csv";a.click();URL.revokeObjectURL(url)};
 return <div className="page"><div className="page-title"><div><h1>Applicants</h1><p className="muted">Track candidates through your hiring pipeline.</p></div><div className="actions"><button onClick={exportCSV}>Export CSV</button><button className="primary" onClick={()=>setOpen(true)}>+ Add Applicant</button></div></div>
 <div className="toolbar filters"><input placeholder="Search name, email, skills..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}/><select value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}><option value="">All statuses</option>{statuses.map(s=><option key={s}>{s}</option>)}</select><select value={job} onChange={e=>{setJob(e.target.value);setPage(1)}}><option value="">All jobs</option>{jobs.map(j=><option value={j._id} key={j._id}>{j.title}</option>)}</select></div>
 {error&&<div className="alert error">{error}</div>}
 <div className="table-wrap"><table><thead><tr><th>Applicant</th><th>Job</th><th>Experience</th><th>Status</th><th>Resume</th><th>Actions</th></tr></thead><tbody>{items.map(a=><tr key={a._id}><td><b>{a.name}</b><small>{a.email}</small></td><td>{a.job?.title}</td><td>{a.experience} yrs</td><td><select className="status-select" value={a.status} onChange={e=>changeStatus(a._id,e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></td><td>{a.resume?<a href={`${API_URL.replace("/api","")}${a.resume}`} target="_blank">PDF</a>:"—"}</td><td><button className="danger-text" onClick={()=>remove(a._id)}>Delete</button></td></tr>)}</tbody></table></div>
 {items.length===0&&<div className="empty">No applicants found.</div>}<Pagination page={page} pages={pages} setPage={setPage}/>
 {open&&<Modal title="Add Applicant" onClose={()=>setOpen(false)}><form onSubmit={add}><div className="two"><label>Name<input value={form.name} onChange={set("name")} required/></label><label>Email<input type="email" value={form.email} onChange={set("email")} required/></label></div><div className="two"><label>Phone<input value={form.phone} onChange={set("phone")}/></label><label>Experience (years)<input type="number" min="0" value={form.experience} onChange={set("experience")}/></label></div><label>Job<select value={form.job} onChange={set("job")} required><option value="">Select job</option>{jobs.map(j=><option value={j._id} key={j._id}>{j.title}</option>)}</select></label><label>Skills<input value={form.skills} onChange={set("skills")} placeholder="React, Node.js, MongoDB"/></label><label>Resume (PDF only)<input type="file" accept="application/pdf,.pdf" onChange={e=>setResume(e.target.files?.[0]||null)}/></label><button className="primary full">Add Applicant</button></form></Modal>}
 </div>
}
function Pagination({page,pages,setPage}:{page:number;pages:number;setPage:(n:number)=>void}){return pages>1?<div className="pagination"><button disabled={page===1} onClick={()=>setPage(page-1)}>←</button><span>Page {page} of {pages}</span><button disabled={page===pages} onClick={()=>setPage(page+1)}>→</button></div>:null}
