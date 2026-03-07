import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: tự động gắn Authorization nếu có token
axiosClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("auth");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.access_token) {
            config.headers.Authorization = `Bearer ${parsed.access_token}`;
          }
        } catch {
          // ignore parse error
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;
