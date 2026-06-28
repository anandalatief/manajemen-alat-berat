import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// Set up Axios interceptor to dynamically replace localhost:5000 with VITE_API_URL
axios.interceptors.request.use((config) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  if (config.url && config.url.startsWith('http://localhost:5000')) {
    config.url = config.url.replace('http://localhost:5000', apiUrl);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)