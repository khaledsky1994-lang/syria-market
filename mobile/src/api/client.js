import axios from 'axios';

// IMPORTANT: change this to your backend's address.
// - iOS simulator: http://localhost:4000/api
// - Android emulator: http://10.0.2.2:4000/api
// - Physical phone: http://<YOUR_COMPUTER_LAN_IP>:4000/api
export const BASE_URL = 'http://10.0.2.2:4000/api';

const api = axios.create({ baseURL: BASE_URL });

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export default api;
