import axios from "axios";

const getApiBase = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
};

const api = axios.create({
  baseURL: "http://placeholder", // 动态设置，见请求拦截器
  timeout: 30000,
});

// 请求拦截：动态拼接 baseURL + 自动附加 Bearer Token
api.interceptors.request.use((config) => {
  // 每次请求动态设置 baseURL（跟随前端页面的 host）
  const base = getApiBase();
  const baseUrl = `${base}/api/v1`;
  // 拼接完整 URL（兼容已有 service 中的 / 开头的路径）
  if (config.url && !config.url.startsWith("http")) {
    config.url = config.url.startsWith("/")
      ? `${baseUrl}${config.url}`
      : `${baseUrl}/${config.url}`;
  }
  // 附加 Token
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 响应拦截：统一错误处理
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.location.href = (process.env.NEXT_PUBLIC_BASE_PATH || '') + "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
