import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

//////////////////////////////////////////////////
// 📅 EXISTANT

export const getSchedule = () => api.get("schedule/");
export const getJobs = () => api.get("jobs/");

//////////////////////////////////////////////////
// 🔥 HELP DESK

export const getHelpRequests = () => api.get("help/");

export const createHelpRequest = (data) =>
  api.post("help/", data);

export const createHelpResponse = (helpId, data) =>
  api.post(`help/${helpId}/respond/`, data);

export const resolveHelpRequest = (helpId) =>
  api.post(`help/${helpId}/resolve/`);

export const acceptHelpResponse = (responseId) =>
  api.post(`responses/${responseId}/accept/`);

//////////////////////////////////////////////////

export default api;