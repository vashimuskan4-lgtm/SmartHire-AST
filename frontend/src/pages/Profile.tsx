import { FormEvent, useEffect, useState } from "react";
import { api } from "../api";
export default function Profile(){
 const [form,setForm]=useState({name:"",email:"",phone:"",company:"",password:""});const [msg,setMsg]=useState("");
 useEffect(()=>{api.get("/users/me").then(r=>setForm({...r.data,password:""}));},[]);
 const set=(k:string)=>(e:any)=>setForm({...form,[k]:e.target.value});
 const save=async(e:FormEvent)=>{e.preventDefault();const {data}=await api.put("/users/me",form);setForm({...data,password:""});localStorage.setItem("user",JSON.stringify(data));setMsg("Profile updated successfully.");};
 return <div className="page"><div className="page-title"><div><h1>Recruiter Profile</h1><p className="muted">Manage your account details.</p></div></div><div className="panel narrow"><form onSubmit={save}><label>Name<input value={form.name} onChange={set("name")} required/></label><label>Email<input value={form.email} disabled/></label><label>Phone<input value={form.phone} onChange={set("phone")}/></label><label>Company<input value={form.company} onChange={set("company")}/></label><label>New Password<input type="password" value={form.password} onChange={set("password")} placeholder="Leave empty to keep current"/></label>{msg&&<div className="alert success">{msg}</div>}<button className="primary">Save Changes</button></form></div></div>
}
