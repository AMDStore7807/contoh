// src/api.ts
import axios from "axios";

// 1. Targetkan API NBI di port 7557
const api = axios.create({
  baseURL: "http://localhost:7557",
});

// 2. Interceptor: Otomatis tambahkan token ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
