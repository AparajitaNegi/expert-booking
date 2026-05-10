import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject({ ...err, message });
  }
);

export const expertAPI = {
  getAll: (params) => API.get('/experts', { params }),
  getById: (id) => API.get(`/experts/${id}`),
};

export const bookingAPI = {
  create: (data) => API.post('/bookings', data),
  getByEmail: (email) => API.get('/bookings', { params: { email } }),
  updateStatus: (id, status) => API.patch(`/bookings/${id}/status`, { status }),
};

export default API;
