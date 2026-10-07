import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
api.interceptors.request.use((c) => { const t = localStorage.getItem('lh_token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
export const errMsg = (e) => e.response?.data?.message || 'Cannot reach the server. Please check that the backend is running.';
export default api;
