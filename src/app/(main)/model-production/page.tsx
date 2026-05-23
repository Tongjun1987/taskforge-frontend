"use client";
import Link from "next/link";
import { Cpu, Brain, BarChart3, Database, TrendingUp, ChevronRight, RefreshCw, GitBranch, FlaskConical, Rocket, HardDrive } from "lucide-react";
import ReactECharts from "echarts-for-react";

// ── 指标卡片数据 ──
const METRIC_CARDS = [
  { label: "模型总数", value: 24, suffix: "个", trend: "+3 本月", icon: Brain, color: "#f59e0b", bg: "#fffbeb" },
  { label: "训练任务", value: 6, suffix: "个", trend: "2个运行中", icon: Cpu, color: "#3b82f6", bg: "#eff6ff" },
  { label: "评测通过率", value: 91.7, suffix: "%", trend: "+4.2 vs 上月", icon: BarChart3, color: "#10b981", bg: "#ecfdf5" },
  { label: "已发布模型", value: 12, suffix: "个", trend: "成功率 91.7%", icon: Rocket, color: "#8b5cf6", bg: "#f5f3ff" },
];

// ── 训练趋势数据 ──
const WEEKLY_DATA = [
  { date: "5/14", training: 3, eval: 2, loss: 0.42 },
  { date: "5/15", training: 4, eval: 3, loss: 0.38 },
  { date: "5/16", training: 2, eval: 1, loss: 0.35 },
  { date: "5/17", training: 5, eval: 4, loss: 0.31 },
  { date: "5/18", training: 3, eval: 2, loss: 0.28 },
  { date: "5/19", training: 6, eval: 5, loss: 0.25 },
  { date: "5/20", training: 4, eval: 3, loss: 0.22 },
];

const lineChartOption = {
  backgroundColor: "transparent",
  grid: { top: 10, right: 10, bottom: 28, left: 50 },
  legend: {
    data: ["训练任务", "评测任务"],
    bottom: 0, textStyle: { color: "#64748b", fontSize: 11 },
  },
  xAxis: {
    type: "category",
    data: WEEKLY_DATA.map((d: any) => d.date),
    axisLine: { lineStyle: { color: "#e2e8f0" } },
    axisLabel: { color: "#64748b", fontSize: 11 },
    axisTick: { show: false },
  },
  yAxis: [
    {
      type: "value",
      axisLine: { show: false },
      axisLabel: { color: "#64748b", fontSize: 11 },
      splitLine: { lineStyle: { color: "#f1f5f9" } },
    },
  ],
  tooltip: {
    trigger: "axis",
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    textStyle: { color: "#f8fafc", fontSize: 12 },
  },
  series: [
    {
      name: "训练任务", type: "bar",
      data: WEEKLY_DATA.map((d: any) => d.training),
      itemStyle: { color: "#f59e0b", borderRadius: [4, 4, 0, 0] },
      barWidth: "28%",
    },
    {
      name: "评测任务", type: "bar",
      data: WEEKLY_DATA.map((d: any) => d.eval),
      itemStyle: { color: "#10b981", borderRadius: [4, 4, 0, 0] },
      barWidth: "28%",
    },
  ],
};

// ── 训练任务进度 ──
const TRAINING_TASKS = [
  { name: "Qwen2.5-7B微调", done: 85, total: 100, status: "训练中", statusBg: "#fffbeb", statusColor: "#d97706" },
  { name: "YOLOv8目标检测", done: 100, total: 100, status: "已完成", statusBg: "#dcfce7", statusColor: "#16a34a" },
  { name: "BERT文本分类", done: 30, total: 100, status: "训练中", statusBg: "#fffbeb", statusColor: "#d97706" },
];

// ── 评测任务 ──
const EVAL_TASKS = [
  { name: "目标检测mAP评测", score: 87.3, threshold: 75, status: "通过", statusBg: "#dcfce7", statusColor: "#16a34a" },
  { name: "文本分类F1评测", score: 92.1, threshold: 85, status: "通过", statusBg: "#dcfce7", statusColor: "#16a34a" },
  { name: "多目标跟踪评测", score: 58.4, threshold: 60, status: "未通过", statusBg: "#fee2e2", statusColor: "#dc2626" },
];

// ── 功能模块 ──
const MODULES = [
  { title: "模型仓库", desc: "模型版本管理、对比与发布", href: "/model-repo", icon: HardDrive, color: "#3b82f6", bg: "#eff6ff" },
  { title: "模型训练", desc: "训练任务管理、超参配置与监控", href: "/model-training", icon: Cpu, color: "#f59e0b", bg: "#fffbeb" },
  { title: "模型评测", desc: "评测任务配置、指标与报告", href: "/model-eval", icon: BarChart3, color: "#10b981", bg: "#ecfdf5" },
  { title: "模型测试", desc: "A/B测试、回归测试与验证", href: "/model-testing", icon: FlaskConical, color: "#8b5cf6", bg: "#f5f3ff" },
];

function MetricCard({ label, value, suffix, trend, icon: Icon, color, bg }: {
  label: string; value: number; suffix: string; trend: string;
  icon: React.ComponentType<any>; color: string; bg: string;
}) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
      padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      transition: "box-shadow 0.2s, transform 0.2s",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={20} style={{ color }} />
        </div>
        <span style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
          <TrendingUp size={12} style={{ color: "#10b981" }} />{trend}
        </span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
        {typeof value === 'number' && value >= 1000 ? value.toLocaleString() : value}<span style={{ fontSize: 12, fontWeight: 400, color: "#94a3b8", marginLeft: 2 }}>{suffix}</span>
      </div>
      <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
    </div>
  );
}

export default function ModelProductionPage() {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: "#f8fafc" }}>
      {/* 统计卡片 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {METRIC_CARDS.map(card => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      {/* 近7日趋势 */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", margin: 0 }}>近7日训练/评测趋势</h3>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0 0" }}>训练任务数 / 评测任务数</p>
          </div>
          <button style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8" }}>
            <RefreshCw size={16} />
          </button>
        </div>
        <ReactECharts option={lineChartOption} style={{ height: 260 }} />
      </div>

      {/* 训练任务 + 评测任务 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* 训练任务进度 */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f59e0b15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Cpu size={16} style={{ color: "#f59e0b" }} />
              </div>
              <h3 style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", margin: 0 }}>训练任务进度</h3>
            </div>
            <Link href="/model-training" style={{ fontSize: 11, color: "#d97706", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              查看全部 <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {TRAINING_TASKS.map((task) => {
              const pct = task.total > 0 ? Math.round((task.done / task.total) * 100) : 0;
              return (
                <div key={task.name} style={{ padding: "12px 14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{task.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", background: task.statusBg, color: task.statusColor, borderRadius: 20 }}>{task.status}</span>
                  </div>
                  <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                    <div style={{ height: "100%", borderRadius: 3, background: "#f59e0b", width: `${pct}%`, transition: "width 0.8s ease" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8" }}>
                    <span>Epoch {task.done}/{task.total}</span>
                    <span style={{ fontWeight: 600, color: "#f59e0b" }}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 评测任务结果 */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#10b98115", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BarChart3 size={16} style={{ color: "#10b981" }} />
              </div>
              <h3 style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", margin: 0 }}>评测任务结果</h3>
            </div>
            <Link href="/model-eval" style={{ fontSize: 11, color: "#059669", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              查看全部 <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {EVAL_TASKS.map((task) => (
              <div key={task.name} style={{ padding: "12px 14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{task.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", background: task.statusBg, color: task.statusColor, borderRadius: 20 }}>{task.status}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 3, background: task.score >= task.threshold ? "#10b981" : "#ef4444", width: `${task.score}%`, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: task.score >= task.threshold ? "#10b981" : "#ef4444" }}>{task.score}</span>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>阈值 {task.threshold}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 功能模块入口 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {MODULES.map((m) => {
          const MIcon = m.icon;
          return (
            <Link key={m.href} href={m.href} style={{
              background: "#fff", borderRadius: 12, padding: 20,
              textDecoration: "none", color: "inherit", border: "1px solid #e2e8f0",
              transition: "all 0.2s", display: "block",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 8px 24px ${m.color}25`;
                (e.currentTarget as HTMLAnchorElement).style.borderColor = m.color;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#e2e8f0";
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <MIcon size={20} style={{ color: m.color }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", marginBottom: 6 }}>{m.title}</div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{m.desc}</div>
              <div style={{ marginTop: 10, fontSize: 11, color: m.color, fontWeight: 600 }}>前往 →</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
