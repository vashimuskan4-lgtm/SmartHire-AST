export interface User {
  id?: string; _id?: string; name: string; email: string;
  role: "recruiter" | "admin"; phone?: string; company?: string;
}
export interface Job {
  _id: string; title: string; department: string; location: string;
  type: string; description: string; requirements: string; salary: string; status: "Open" | "Closed";
  createdAt: string;
}
export interface Applicant {
  _id: string; name: string; email: string; phone: string; skills: string;
  experience: number; status: "Applied" | "Screening" | "Interview" | "Selected" | "Rejected";
  resume: string; job: { _id: string; title: string };
  createdAt: string;
}
export interface Stats {
  jobs: number; openJobs: number; applicants: number; applied: number;
  screening: number; interview: number; selected: number; rejected: number;
}
