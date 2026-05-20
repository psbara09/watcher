import axios from 'axios';

const AUTH_SERVICE_URL = 'http://localhost:3001';
const INCIDENT_SERVICE_URL = 'http://localhost:3002';
const VERIFICATION_SERVICE_URL = 'http://localhost:3003';

function createClient(baseURL: string) {
  const client = axios.create({ baseURL });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('watcher_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('watcher_token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export const authClient = createClient(AUTH_SERVICE_URL);
export const incidentClient = createClient(INCIDENT_SERVICE_URL);
export const verificationClient = createClient(VERIFICATION_SERVICE_URL);
