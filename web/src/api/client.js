import axios from 'axios';

export const BASE_URL = 'https://syria-market-backend.onrender.com/api';
export const SERVER_ORIGIN = 'https://syria-market-backend.onrender.com';

const api = axios.create({ baseURL: BASE_URL });

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export default api;