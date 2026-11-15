// frontend/src/services/api.js
import axios from 'axios';

// Configura la URL base de tu backend PHP local (ej: http://localhost/camping-manager/backend/)
const api = axios.create({
  baseURL: 'http://localhost:8080/camping-manager/backend',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;