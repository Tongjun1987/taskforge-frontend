"use client";
import Link from "next/link";
import { Brain, Database, Download, Heart, Star, ArrowRight, Search, Sparkles, TrendingUp } from "lucide-react";
import ReactECharts from "echarts-for-react";

const STATS = [
  { label: "模型总数", value: 128, unit: "个", icon: Brain, color: "#6366f1", bg: "#eef2ff" },
  { label: "数据集总数", value: 256, unit: "个", icon: Database, color: "#10b981", bg: "#ecfdf5" },
  { label: "本周下载", value: "12.4K", unit: "", icon: Download, color: "#f59e0b", bg: "#fffbeb" },
  { label: "用户收藏", value: "3.8K", unit: "", icon: Heart, color: "#ef4444", bg: "#fef2f2" },
];

const HOT_MODELS = [
  { name: "Qwen2.5-72B-Instruct", org: "Qwen", downloads: "18.6万", tag: "NLP" },
  { name: "YOLOv8-X", org: "Ultralytics", downloads: "31.2万", tag: "CV" },
  { name: "DeepSeek-R1-Distill", org: "DeepSeek", downloads: "9.2万", tag: "NLP" },
  { name: "InternVL3-78B", org: "OpenGVLab", downloads: "5.6万", tag: "多模态" },
  { name: "SAM2-Large", org: "Meta", downloads: "12.9万", tag: "CV" },
];

const HOT_DATASETS = [
  { name: "COCO-2024", org: "Microsoft", samples: "33万条", tag: "视觉" },
  { name: "Alpaca-GPT4中文", org: "Stanford", samples: "5.2万条", tag: "NLP" },
  { name: "COIG-CQIA中文指令", org: "COIG", samples: "6.8万条", tag: "NLP" },
  { name: "MMLU-Pro", org: "Hendrycks", samples: "1.4万条", tag: "评测" },
  { name: "AIShell-2语音", org: "AIShell", samples: "50万条", tag: "语音" },
];

const weeklyOption = {
  backgroundColor: "transparent",
  grid: { top: 30, right: 20, bottom: 30, left: 50 },
  legend: {
    data: ["模型下载", "数据集下载"],
    bottom: 0, textStyle: { color: "#64748b", fontSize: 11 },
  },
  xAxis: {
    type: "category",
    data: ["5/16", "5/17", "5/18", "5/19", "5/20", "5/21", "5/22"],
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
  series: [
    {
      name: "模型下载",
      type: "line",
      data: [3200, 4100, 3800, 5200, 4600, 5800, 6200],
      smooth: true,
      lineStyle: { color: "#6366f1", width: 2 },
      itemStyle: { color: "#6366f1" },
      areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(99,102,241,0.15)" }, { offset: 1, color: "rgba(99,102,241,0.01)" }] } },
    },
    {
      name: "数据集下载",
      type: "line",
      data: [2800, 3600, 3200, 4800, 4100, 5300, 5600],
      smooth: true,
      lineStyle: { color: "#10b981", width: 2 },
      itemStyle: { color: "#10b981" },
      areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(16,185,129,0.15)" }, { offset: 1, color: "rgba(16,185,129,0.01)" }] } },
    },
  ],
};

export default function ServiceCenterPage() {
  return (
    <div style={{ padding: 24, background: "#f8fafc", minHeight: "100vh" }}>
      {/* 页面头部 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Sparkles size={20} style={{ color: "#fff" }} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 }}>数模服务中心</h1>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
              发现和使用 AI 模型与高质量数据集
            </p>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {STATS.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={{
              background: "#fff", borderRadius: 12, padding: 18,
              border: "1px solid #e2e8f0",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: stat.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>{stat.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b" }}>
                  {stat.value}<span style={{ fontSize: 12, fontWeight: 400, color: "#94a3b8" }}>{stat.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 快速入口 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* 模型服务入口 */}
        <Link href="/service/models" style={{
          textDecoration: "none",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          borderRadius: 14, padding: 24, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(99,102,241,0.3)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <Brain size={22} />
              <span style={{ fontSize: 18, fontWeight: 700 }}>模型服务</span>
            </div>
            <p style={{ fontSize: 12, opacity: 0.8, margin: 0, lineHeight: 1.5 }}>
              发现和使用高质量 AI 模型<br />
              涵盖 NLP、CV、语音、多模态等任务类型
            </p>
          </div>
          <ArrowRight size={24} style={{ opacity: 0.6 }} />
        </Link>

        {/* 数据集服务入口 */}
        <Link href="/service/datasets" style={{
          textDecoration: "none",
          background: "linear-gradient(135deg, #10b981, #059669)",
          borderRadius: 14, padding: 24, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(16,185,129,0.3)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <Database size={22} />
              <span style={{ fontSize: 18, fontWeight: 700 }}>数据集服务</span>
            </div>
            <p style={{ fontSize: 12, opacity: 0.8, margin: 0, lineHeight: 1.5 }}>
              发现和使用高质量数据集<br />
              支持文本、图像、语音、多模态等多种数据格式
            </p>
          </div>
          <ArrowRight size={24} style={{ opacity: 0.6 }} />
        </Link>
      </div>

      {/* 下载趋势 + 热门排行 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* 下载趋势 */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={16} style={{ color: "#6366f1" }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>下载趋势</span>
            </div>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>最近7天</span>
          </div>
          <ReactECharts option={weeklyOption} style={{ height: 220 }} />
        </div>

        {/* 热门排行 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* 热门模型 */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Brain size={14} style={{ color: "#6366f1" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>热门模型</span>
            </div>
            {HOT_MODELS.map((m, i) => (
              <div key={m.name} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 0",
                borderBottom: i < HOT_MODELS.length - 1 ? "1px solid #f8fafc" : "none",
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 4,
                  background: i < 3 ? "linear-gradient(135deg, #f59e0b, #f97316)" : "#f1f5f9",
                  color: i < 3 ? "#fff" : "#64748b",
                  fontSize: 10, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1, fontSize: 12, color: "#334155", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {m.name}
                </span>
                <span style={{
                  padding: "1px 6px", borderRadius: 3,
                  background: "#eef2ff", color: "#6366f1",
                  fontSize: 9, fontWeight: 600, flexShrink: 0,
                }}>
                  {m.tag}
                </span>
                <span style={{ fontSize: 10, color: "#94a3b8", flexShrink: 0 }}>{m.downloads}</span>
              </div>
            ))}
          </div>

          {/* 热门数据集 */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Database size={14} style={{ color: "#10b981" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>热门数据集</span>
            </div>
            {HOT_DATASETS.map((d, i) => (
              <div key={d.name} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 0",
                borderBottom: i < HOT_DATASETS.length - 1 ? "1px solid #f8fafc" : "none",
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 4,
                  background: i < 3 ? "linear-gradient(135deg, #10b981, #059669)" : "#f1f5f9",
                  color: i < 3 ? "#fff" : "#64748b",
                  fontSize: 10, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1, fontSize: 12, color: "#334155", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {d.name}
                </span>
                <span style={{
                  padding: "1px 6px", borderRadius: 3,
                  background: "#ecfdf5", color: "#10b981",
                  fontSize: 9, fontWeight: 600, flexShrink: 0,
                }}>
                  {d.tag}
                </span>
                <span style={{ fontSize: 10, color: "#94a3b8", flexShrink: 0 }}>{d.samples}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
