import axios from "axios";
import type { AxiosResponse } from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

interface DeviceQueryArgs {
  query?: object;
  projection?: string;
  sort?: object;
  limit?: number;
  skip?: number;
}

/**
 * Fungsi untuk query NBI /devices endpoint
 * @param args Objek berisi parameter query NBI
 * @returns Promise<AxiosResponse>
 */

export function queryDevices({
  query = {},
  projection,
  sort,
  limit,
  skip,
}: DeviceQueryArgs = {}): Promise<AxiosResponse> {
  const axiosParams = {
    query: JSON.stringify(query),
    sort: sort ? JSON.stringify(sort) : undefined,

    // Parameter lain bisa langsung
    projection: projection,
    limit: limit,
    skip: skip,
  };

  Object.keys(axiosParams).forEach((key) => {
    const typedKey = key as keyof typeof axiosParams;
    if (axiosParams[typedKey] === undefined) {
      delete axiosParams[typedKey];
    }
  });

  // 2. Panggil API. Axios akan otomatis URL-encode nilainya.
  console.log("Mengirim request ke /api/devices dengan params:", axiosParams);
  return api
    .get("/devices", {
      params: axiosParams,
    })
    .then((response) => {
      // Extract total from headers if available
      const total = response.headers?.total
        ? parseInt(response.headers.total, 10)
        : undefined;
      if (total !== undefined) {
        response.data.total = total;
      }
      return response;
    });
}
