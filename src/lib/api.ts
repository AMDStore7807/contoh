// src/api.ts
import axios from "axios";

// 1. Targetkan API NBI via proxy /api (menghindari CORS)
const api = axios.create({
  baseURL: "/api",
});

// 2. Interceptor: Otomatis tambahkan token ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Fungsi queryDevices: Query langsung ke NBI seperti TODO.md
export interface QueryDevicesParams {
  query?: Record<string, unknown>;
  projection?: string;
  sort?: Record<string, unknown>;
  limit?: number;
  skip?: number;
}

export async function queryDevices(params: QueryDevicesParams = {}) {
  const { query = {}, projection, sort, limit, skip } = params;

  // Build query params
  const queryParams: Record<string, string> = {};

  // query: JSON string, URL-encoded (GenieACS NBI uses 'query' for devices)
  if (Object.keys(query).length > 0) {
    queryParams.query = encodeURIComponent(JSON.stringify(query));
  } else {
    queryParams.query = encodeURIComponent(JSON.stringify({}));
  }

  // projection: string (e.g., "_id,_lastInform")
  if (projection) {
    queryParams.projection = projection;
  }

  // sort: JSON string, URL-encoded
  if (sort && Object.keys(sort).length > 0) {
    queryParams.sort = encodeURIComponent(JSON.stringify(sort));
  }

  // limit & skip: numbers
  if (limit !== undefined) {
    queryParams.limit = limit.toString();
  }
  if (skip !== undefined) {
    queryParams.skip = skip.toString();
  }

  // Make the request
  const response = await api.get("/devices", { params: queryParams });
  return response.data;
}

export default api;
