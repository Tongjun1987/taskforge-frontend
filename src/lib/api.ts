import axios from "axios";

const getApiBase = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
};

const api = axios.create({
  baseURL: "http://placeholder", // 动态设置，见请求拦截器
  timeout: 8000,
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

// 静默重新登录（用保存的凭据）
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function silentRelogin(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return false;
      const user = JSON.parse(userStr);
      // 使用默认管理员凭据重新登录
      const base = getApiBase();
      const formData = new URLSearchParams();
      formData.append("username", user.username || "admin");
      formData.append("password", "Admin@123456");
      const res = await axios.post(`${base}/api/v1/auth/login`, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 5000,
      });
      if (res.data?.access_token) {
        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("user", JSON.stringify({
          id: res.data.user_id,
          username: res.data.username,
          full_name: res.data.full_name,
          role: res.data.role,
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

// 响应拦截：统一错误处理
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retried) {
      originalRequest._retried = true;
      // 尝试静默重新登录
      const success = await silentRelogin();
      if (success) {
        // 用新 token 重试原请求
        const token = localStorage.getItem("access_token");
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }
      // 静默登录失败，跳转登录页
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
