"use client";
import Link from "next/link";
import { Database, Layers, CheckCircle2, ArrowUpDown, RefreshCw, ChevronRight, TrendingUp, Tag } from "lucide-react";
import ReactECharts from "echarts-for-react";

const WEEKLY_DATA = [
  { date: "5/14", collection: 3200, cleaning: 2800, annotation: 240 },
  { date: "5/15", collection: 4100, cleaning: 3600, annotation: 310 },
  { date: "5/16", collection: 2800, cleaning: 2500, annotation: 420 },
  { date: "5/17", collection: 5200, cleaning: 4600, annotation: 580 },
  { date: "5/18", collection: 3800, cleaning: 3200, annotation: 650 },
  { date: "5/19", collection: 6000, cleaning: 5400, annotation: 720 },
  { date: "5/20", collection: 4500, cleaning: 4100, annotation: 800 },
];

const COLLECTION_TASKS = [
  { name: "交通视频流采集", done: 45, total: 60, status: "进行中", statusBg: "#dbeafe", statusColor: "#2563eb" },
  { name: "传感器数据采集", done: 30, total: 30, status: "已完成", statusBg: "#dcfce7", statusColor: "#16a34a" },
  { name: "日志数据采集", done: 80, total: 100, status: "进行中", statusBg: "#dbeafe", statusColor: "#2563eb" },
];

const CLEANING_TASKS = [
  { name: "图像数据清洗", done: 1200, total: 1500, status: "进行中", statusBg: "#dbeafe", statusColor: "#2563eb" },
  { name: "文本数据清洗", done: 500, total: 500, status: "已完成", statusBg: "#dcfce7", statusColor: "#16a34a" },
  { name: "音频数据清洗", done: 200, total: 400, status: "进行中", statusBg: "#dbeafe", statusColor: "#2563eb" },
];

const ANNOTATION_TASKS = [
  { name: "目标检测标注", done: 380, total: 500, status: "进行中", statusBg: "#dbeafe", statusColor: "#2563eb" },
  { name: "文本分类标注", done: 1200, total: 1200, status: "已完成", statusBg: "#dcfce7", statusColor: "#16a34a" },
  { name: "意图识别标注", done: 0, total: 300, status: "待执行", statusBg: "#f3f4f6", statusColor: "#6b7280" },
];

// Metric card data
const METRIC_CARDS = [
  { label: "数据集总量", value: 48, suffix: "K条", trend: "+12,400 本周", icon: Database, color: "#3b82f6", bg: "#eff6ff" },
  { label: "已清洗数据", value: 32.6, suffix: "K条", trend: "+8,200 本周", icon: Layers, color: "#10b981", bg: "#ecfdf5" },
  { label: "已标注样本", value: 1580, suffix: "条", trend: "+340 今日", icon: CheckCircle2, color: "#8b5cf6", bg: "#f5f3ff" },
  { label: "进行中任务", value: 8, suffix: "个", trend: "采集/清洗/标注", icon: ArrowUpDown, color: "#f59e0b", bg: "#fffbeb" },
];

const lineChartOption = {
  backgroundColor: "transparent",
  grid: { top: 10, right: 10, bottom: 28, left: 50 },
  legend: {
    data: ["数据采集", "数据清洗", "数据标注"],
    bottom: 0,
    textStyle: { color: "#64748b", fontSize: 11 },
  },
  xAxis: {
    type: "category",
    data: WEEKLY_DATA.map((d: { date: string }) => d.date),
    axisLine: { lineStyle: { color: "#e2e8f0" } },
    axisLabel: { color: "#64748b", fontSize: 11 },
    axisTick: { show: false },
  },
  yAxis: {
    type: "value",
    axisLine: { show: false },
    axisLabel: { color: "#64748b", fontSize: 11 },
    splitLine: { lineStyle: { color: "#f1f5f9" } },
  },
  tooltip: {
    trigger: "axis",
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    textStyle: { color: "#f8fafc", fontSize: 12 },
  },
  series: [
    {
      name: "数据采集",
      type: "bar",
      data: WEEKLY_DATA.map((d: { collection: number }) => d.collection),
      itemStyle: { color: "#3b82f6", borderRadius: [4, 4, 0, 0] },
      barWidth: "28%",
    },
    {
      name: "数据清洗",
      type: "bar",
      data: WEEKLY_DATA.map((d: { cleaning: number }) => d.cleaning),
      itemStyle: { color: "#6366f1", borderRadius: [4, 4, 0, 0] },
      barWidth: "28%",
    },
    {
      name: "数据标注",
      type: "line",
      yAxisIndex: 0,
      data: WEEKLY_DATA.map((d: { annotation: number }) => d.annotation),
      smooth: true,
      lineStyle: { color: "#10b981", width: 2 },
      itemStyle: { color: "#10b981" },
      symbol: "circle",
      symbolSize: 6,
    },
  ],
};

interface TaskItemProps {
  name: string;
  done: number;
  total: number;
  status: string;
  statusBg: string;
  statusColor: string;
  barColor: string;
}

function TaskItem({ name, done, total, status, statusBg, statusColor, barColor }: TaskItemProps) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div style={{ padding: "14px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: barColor + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Tag size={14} style={{ color: barColor }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", background: statusBg, color: statusColor, borderRadius: 20 }}>{status}</span>
      </div>
      <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ height: "100%", borderRadius: 3, background: barColor, width: `${pct}%`, transition: "width 0.8s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8" }}>
        <span>{done.toLocaleString()} / {total.toLocaleString()} 条</span>
        <span style={{ fontWeight: 600, color: barColor }}>{pct}%</span>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: number;
  suffix: string;
  trend: string;
  icon: React.ComponentType<{ size?: number | string; style?: React.CSSProperties }>;
  color: string;
  bg: string;
}

function MetricCard({ label, value, suffix, trend, icon: Icon, color, bg }: MetricCardProps) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        padding: 20,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={20} style={{ color }} />
        </div>
        <span style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
          <TrendingUp size={12} style={{ color: "#10b981" }} />
          {trend}
        </span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
        {typeof value === "number" && value >= 1000 ? value.toLocaleString() : value}
        <span style={{ fontSize: 12, fontWeight: 400, color: "#94a3b8", marginLeft: 2 }}>{suffix}</span>
      </div>
      <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
    </div>
  );
}

export default function DataProductionPage() {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: "#f8fafc" }}>
      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {METRIC_CARDS.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      {/* Weekly trend */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", margin: 0 }}>近7日生产趋势</h3>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0 0" }}>采集量 / 清洗量 / 标注量</p>
          </div>
          <button style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8" }}>
            <RefreshCw size={16} />
          </button>
        </div>
        <ReactECharts option={lineChartOption} style={{ height: 260 }} />
      </div>

      {/* Three-column task progress */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {/* Collection tasks */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#3b82f615", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Database size={16} style={{ color: "#3b82f6" }} />
              </div>
              <h3 style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", margin: 0 }}>采集任务进度</h3>
            </div>
            <Link href="/data-asset/data-access" style={{ fontSize: 11, color: "#2563eb", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              查看全部 <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {COLLECTION_TASKS.map((task, i) => (
              <TaskItem key={i} {...task} barColor="#3b82f6" />
            ))}
          </div>
        </div>

        {/* Cleaning tasks */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#10b98115", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Layers size={16} style={{ color: "#10b981" }} />
              </div>
              <h3 style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", margin: 0 }}>清洗任务进度</h3>
            </div>
            <Link href="/data-cleaning" style={{ fontSize: 11, color: "#059669", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              查看全部 <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {CLEANING_TASKS.map((task, i) => (
              <TaskItem key={i} {...task} barColor="#10b981" />
            ))}
          </div>
        </div>

        {/* Annotation tasks */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#8b5cf615", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={16} style={{ color: "#8b5cf6" }} />
              </div>
              <h3 style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", margin: 0 }}>标注任务进度</h3>
            </div>
            <Link href="/annotation" style={{ fontSize: 11, color: "#7c3aed", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              查看全部 <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ANNOTATION_TASKS.map((task, i) => (
              <TaskItem key={i} {...task} barColor="#8b5cf6" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
