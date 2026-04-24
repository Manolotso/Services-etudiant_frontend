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

export const getSchedules = () => api.get("schedule/")

export const createSchedule = (data) =>
  api.post("schedule/", data)

export const updateSchedule = (id, data) =>
  api.put(`schedule/${id}/`, data)

export const deleteSchedule = (id) =>
  api.delete(`schedule/${id}/`)

export const getCourses = () => api.get("courses/")

export const getRooms = () => api.get("rooms/")

export const getUsers = () => api.get("users/")

export const createCourse = (data) =>
  api.post('/courses/', data)

export const createRoom = (data) =>
  api.post('/rooms/', data)

export const getAdminJobs = () =>
  api.get('/jobs/')

export const createJob = (data) =>
  api.post('/jobs/', data)

export const updateJob = (id, data) =>
  api.put(`/jobs/${id}/`, data)

export const deleteJob = (id) =>
  api.delete(`/jobs/${id}/`)

// =============================
// HELP REQUESTS (ADMIN)
// =============================

export const getAdminHelpRequests = () =>
  api.get('/help/')

export const updateHelpRequest = (id, data) =>
  api.put(`/help/${id}/`, data)

export const deleteHelpRequest = (id) =>
  api.delete(`/help/${id}/`)


// =============================
// HELP RESPONSES
// =============================

export const getHelpResponses = (helpRequestId) =>
  api.get(`/help/${helpRequestId}/`)

export const deleteHelpResponse = (id) =>
  api.delete(`/responses/${id}/`)

export default api;