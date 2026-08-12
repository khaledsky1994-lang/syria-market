import axios from 'axios';

export const BASE_URL = 'http://localhost:4000/api';
export const SERVER_ORIGIN = 'http://localhost:4000';

const api = axios.create({ baseURL: BASE_URL });

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export default api;
