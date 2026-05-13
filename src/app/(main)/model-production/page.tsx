"use client";

export default function ModelProductionPage() {
  const modules = [
    {
      title: "数据预处理",
      desc: "数据增强、训练/测试/验证集划分与均衡采样",
      href: "/data-augmentation",
      color: "#f59e0b",
      icon: "⚙️",
    },
    {
      title: "模型训练",
      desc: "分布式训练任务管理、超参数配置与训练日志监控",
      href: "/model-training",
      color: "#f59e0b",
      icon: "🧠",
    },
    {
      title: "模型评测",
      desc: "评测任务配置、指标管理、评测报告生成",
      href: "/eval",
      color: "#f59e0b",
      icon: "📏",
    },
    {
      title: "模型管理",
      desc: "模型仓库、版本管理、模型对比与服务发布",
      href: "/model-repo",
      color: "#f59e0b",
      icon: "📦",
    },
  ];

  return (
    <main style={{ minHeight: "100vh", background: "#f1f5f9", padding: "40px 24px" }}>
      {/* 标题区 */}
      <div style={{
        background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
        borderRadius: 16,
        padding: "48px 40px",
        color: "#fff",
        marginBottom: 32,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: -20, width: 200, height: 200,
          borderRadius: "50%", background: "rgba(255,255,255,0.08)",
        }} />
        <div style={{
          position: "absolute", bottom: -30, right: 80, width: 120, height: 120,
          borderRadius: "50%", background: "rgba(255,255,255,0.05)",
        }} />
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.5px" }}>
          模型生产中心
        </div>
        <div style={{ fontSize: 15, opacity: 0.85, lineHeight: 1.6 }}>
          覆盖数据预处理、模型训练、模型评测、模型管理全链路
        </div>
      </div>

      {/* 模块卡片 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 20,
        maxWidth: 1200,
      }}>
        {modules.map((m) => (
          <a
            key={m.href}
            href={m.href}
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: "28px 24px",
              textDecoration: "none",
              color: "inherit",
              border: "1px solid #e2e8f0",
              transition: "all 0.2s",
              display: "block",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(245,158,11,0.15)";
              e.currentTarget.style.borderColor = m.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${m.color}15`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, marginBottom: 16,
            }}>
              {m.icon}
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#1e293b", marginBottom: 8 }}>
              {m.title}
            </div>
            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
              {m.desc}
            </div>
            <div style={{
              marginTop: 12, fontSize: 12, color: m.color,
              fontWeight: 600, opacity: 0.8,
            }}>
              前往 →
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
