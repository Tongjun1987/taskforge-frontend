"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/services";
import toast from "react-hot-toast";

// 预定义合法账号
const VALID_ACCOUNTS = [
  { username: "admin", password: "Admin@123456", full_name: "管理员", role: "admin" },
];

// 检测后端是否可用（尝试 ping 健康检查端点）
async function checkBackendAvailable(): Promise<boolean> {
  try {
    const base = typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:8000`)
      : "http://localhost:8000";
    const res = await fetch(`${base}/api/v1/health`, { method: "GET", signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    setMounted(true);
    // 启动时检测后端可用性
    checkBackendAvailable().then(setBackendAvailable);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { toast.error("请输入用户名和密码"); return; }
    setLoading(true);
    try {
      // 后端可用 → 走真实 API
      if (backendAvailable) {
        const res = await login(username, password);
        const { access_token, ...user } = res.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("user", JSON.stringify(user));
        toast.success(`欢迎回来，${user.full_name || user.username}！`);
        router.push("/task-modeling");
      } else {
        // 后端不可用（GitHub Pages / 本地无后端）→ 前端模拟登录
        const account = VALID_ACCOUNTS.find(a => a.username === username && a.password === password);
        if (!account) {
          toast.error("用户名或密码错误");
          setLoading(false);
          return;
        }
        const mockToken = "mock_token_" + Date.now();
        localStorage.setItem("access_token", mockToken);
        localStorage.setItem("user", JSON.stringify({
          id: "1",
          username: account.username,
          full_name: account.full_name,
          role: account.role,
        }));
        toast.success(`欢迎回来，${account.full_name}！（离线演示模式）`);
        router.push("/task-modeling");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "登录失败，请检查用户名和密码");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, position: "relative", overflow: "hidden" }}>
      {/* 背景装饰 */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "25%", left: -80, width: 320, height: 320, background: "rgba(37, 99, 235, 0.1)", borderRadius: "50%", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "25%", right: -80, width: 384, height: 384, background: "rgba(99, 102, 241, 0.1)", borderRadius: "50%", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      {/* 主卡片 */}
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: 440,
        transition: "all 700ms ease",
        transform: mounted ? "translateY(0)" : "translateY(32px)",
        opacity: mounted ? 1 : 0,
      }}>
        {/* Logo区 */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Image src="/logo.png" alt="logo" width={64} height={64} style={{ borderRadius: 16, marginBottom: 16, boxShadow: "0 8px 32px rgba(37, 99, 235, 0.3)", objectFit: 'contain' }} />
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: -0.5, marginBottom: 6 }}>TaskForge</h1>
          <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 0 }}>任务驱动的行业 AI 数据·模型一体化平台</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 }}>
            <span style={{ display: "inline-block", width: 32, height: 1, background: "rgba(37, 99, 235, 0.6)", borderRadius: 2 }} />
            <span style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>v2.0</span>
            <span style={{ display: "inline-block", width: 32, height: 1, background: "rgba(37, 99, 235, 0.6)", borderRadius: 2 }} />
          </div>
        </div>

        {/* 登录表单卡片 */}
        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
          <div style={{ height: 3, background: "linear-gradient(90deg, #2563eb, #4f46e5, #7c3aed)" }} />
          <div style={{ padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 }}>登录工作区</h2>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>输入您的账号信息以访问平台</p>

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* 用户名 */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#cbd5e1", marginBottom: 6 }}>用户名</label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, display: "flex", alignItems: "center", pointerEvents: "none" }}>
                    <svg width={14} height={14} fill="none" stroke="#64748b" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 13, color: "#fff", outline: "none", transition: "border-color 200ms, box-shadow 200ms" }}
                    placeholder="admin" required autoComplete="username"
                    onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.15)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }} />
                </div>
              </div>

              {/* 密码 */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#cbd5e1", marginBottom: 6 }}>密码</label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, display: "flex", alignItems: "center", pointerEvents: "none" }}>
                    <svg width={14} height={14} fill="none" stroke="#64748b" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </div>
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    style={{ width: "100%", paddingLeft: 36, paddingRight: 36, paddingTop: 10, paddingBottom: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 13, color: "#fff", outline: "none", transition: "border-color 200ms, box-shadow 200ms" }}
                    placeholder="密码" required autoComplete="current-password"
                    onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.15)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 10, top: 0, bottom: 0, display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "#64748b", transition: "color 200ms" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#cbd5e1")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}>
                    {showPassword ? (
                      <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      </svg>
                    ) : (
                      <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* 登录按钮 */}
              <button type="submit" disabled={loading}
                style={{ width: "100%", background: "#2563eb", color: "#fff", fontWeight: 600, padding: "11px 16px", borderRadius: 10, fontSize: 13, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, boxShadow: "0 2px 12px rgba(37,99,235,0.25)", transition: "all 200ms", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(37,99,235,0.4)"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(37,99,235,0.25)"; }}
                onMouseDown={(e) => { if (!loading) e.currentTarget.style.transform = "scale(0.98)"; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}>
                {loading ? (
                  <>
                    <svg width={14} height={14} fill="none" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} style={{ opacity: 0.25 }} />
                      <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    登录中...
                  </>
                ) : (
                  <>
                    <span>登录</span>
                    <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* 演示账号 */}
            <div style={{ marginTop: 20, padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981" }} />
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>演示账号</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b" }}>
                  <span>用户名</span><span style={{ color: "#e2e8f0", fontFamily: "monospace" }}>admin</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b" }}>
                  <span>密码</span><span style={{ color: "#e2e8f0", fontFamily: "monospace" }}>Admin@123456</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p style={{ textAlign: "center", color: "#475569", fontSize: 11, marginTop: 20 }}>
          TaskForge v2.0 · 任务驱动 · 质量关口 · 业务价值转译
        </p>
      </div>
    </div>
  );
}
