// src/api/api.ts
import axios from "axios";

//const API_URL = "https://white-carrot-app.onrender.com/api"; 
const API_URL = "https://white-carrot-app.onrender.com"; 

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// COMPANY APIs
export const getCompany = (slug: string) => api.get(`/companies/${slug}`);

export const updateCompany = (slug: string, formData: any) =>
  api.put(`/companies/${slug}`, {
    name: formData.name,
    settings: {
      brandColor: formData.brandColor,
      logo: formData.logo,
      banner: formData.banner,
      cultureVideo: formData.cultureVideo,
      sections: formData.sections,
    },
  });

export const publishCompany = (slug: string) =>
  api.post(`/companies/${slug}/publish`);

export const loginCompany = (email: string, password: string, name: string) =>
  api.post(`companies/auth/login`, { email, password, name });


// JOB APIs
export const getJobs = (params: any) => api.get(`/jobs`, { params });
export const getJobFilters = (slug: string) => api.get(`/jobs/filters/${slug}`);
export const addJob = (slug: string, newJob: any) =>
  api.post(`/jobs/seed`, { companySlug: slug, jobs: [newJob] });

export const deleteJob = (id: string) => api.delete(`/jobs/${id}`);

export default api;
