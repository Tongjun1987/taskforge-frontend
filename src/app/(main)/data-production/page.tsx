"use client";
import { useEffect, useRef, useState } from "react";
import { getDashboardStats } from "@/lib/services";
import { Target, Database, Tag, Shield, BarChart3, Rocket, ArrowRight, TrendingUp, Activity, CheckCircle2, Clock, Zap, ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import ReactECharts from "echarts-for-react";


// 动画数字组件
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const observed = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || observed.current) return;
    observed.current = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const duration = 1200;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span className="stat-number">
      {display.toLocaleString()}{suffix}
    </span>
  );
}

const CENTER_LINKS = [
  { href: "/task-modeling", icon: Target, color: "#3b82f6", label: "① 任务建模", tag: "核心起点" },
  { href: "/data-asset", icon: Database, color: "#6366f1", label: "② 数据资产", tag: null },
  { href: "/annotation", icon: Tag, color: "#8b5cf6", label: "③ 样本生产", tag: null },
  { href: "/quality", icon: Shield, color: "#10b981", label: "④ 质量控制", tag: "QG-1~5" },
  { href: "/eval", icon: BarChart3, color: "#f59e0b", label: "⑤ AI 评测", tag: null },
  { href: "/publish", icon: Rocket, color: "#f43f5e", label: "⑥ 发布运营", tag: null },
];

const QUALITY_GATES = [
  { num: "QG-1", name: "数据导入校验", status: "passed" },
  { num: "QG-2", name: "数据分布检验", status: "passed" },
  { num: "QG-3", name: "标注质量检验", status: "passed" },
  { num: "QG-4", name: "发布前检验", status: "failed" },
  { num: "QG-5", name: "训练前检验", status: "pending" },
];

const WEEKLY_DATA = [
  { date: "4/2", annotations: 240, quality: 92 },
  { date: "4/3", annotations: 310, quality: 88 },
  { date: "4/4", annotations: 420, quality: 95 },
  { date: "4/5", annotations: 580, quality: 91 },
  { date: "4/6", annotations: 650, quality: 89 },
  { date: "4/7", annotations: 720, quality: 93 },
  { date: "4/8", annotations: 800, quality: 90 },
];

const ANNOTATION_DATA = [
  { name: "客服意图识别", done: 380, total: 500, kappa: 0.78 },
  { name: "产品分类标注", done: 1200, total: 1200, kappa: 0.82 },
  { name: "情感分析标注", done: 0, total: 300, kappa: null },
];

export default function DataProductionPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeGate, setActiveGate] = useState<number | null>(null);

  const fetchStats = async (spinner = false) => {
    if (spinner) setRefreshing(true);
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch {
      setStats({
        centers: {
          task_modeling: { label: "任务建模", scene_count: 8, task_count: 24 },
          data_asset: { label: "数据资产", dataset_count: 20, item_count: 48000 },
          annotation: { label: "样本生产", job_count: 12, labeled_count: 1580 },
          quality: { label: "质量控制", pass_rate: 90, passed_count: 16 },
          eval: { label: "AI 评测", eval_count: 6, avg_score: 87.3 },
          publish: { label: "发布运营", release_count: 12, success_rate: 91.7 },
        }
      });
    } finally {
      setLoading(false);
      if (spinner) setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const lineChartOption = {
    backgroundColor: 'transparent',
    grid: { top: 10, right: 10, bottom: 28, left: 44 },
    xAxis: {
      type: 'category',
      data: WEEKLY_DATA.map(d => d.date),
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#64748b', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#64748b', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc', fontSize: 12 },
    },
    series: [
      {
        name: '标注数', type: 'bar',
        data: WEEKLY_DATA.map(d => d.annotations),
        itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
        barWidth: '50%',
      },
      {
        name: '质量合格率', type: 'line', yAxisIndex: 0,
        data: WEEKLY_DATA.map(d => d.quality),
        smooth: true,
        lineStyle: { color: '#10b981', width: 2 },
        itemStyle: { color: '#10b981' },
        symbol: 'circle', symbolSize: 6,
      },
    ],
  };

  const radarOption = {
    backgroundColor: 'transparent',
    radar: {
      indicator: [
        { name: '准确率', max: 100 }, { name: '召回率', max: 100 },
        { name: 'F1分数', max: 100 }, { name: '一致性', max: 100 },
        { name: '覆盖率', max: 100 }, { name: '效率', max: 100 },
      ],
      shape: 'polygon', splitNumber: 4,
      axisName: { color: '#64748b', fontSize: 11 },
      splitLine: { lineStyle: { color: '#e2e8f0' } },
      splitArea: { areaStyle: { color: ['#f8fafc', '#f1f5f9'] } },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
    },
    series: [{
      type: 'radar',
      data: [
        { value: [87, 84, 85, 78, 92, 88], name: '当前版本 v1.2',
          areaStyle: { color: 'rgba(59,130,246,0.15)' },
          lineStyle: { color: '#3b82f6', width: 2 },
          itemStyle: { color: '#3b82f6' }, symbol: 'circle', symbolSize: 5 },
        { value: [82, 79, 80, 75, 88, 85], name: '基线版本',
          areaStyle: { color: 'rgba(148,163,184,0.1)' },
          lineStyle: { color: '#94a3b8', width: 2, type: 'dashed' },
          itemStyle: { color: '#94a3b8' }, symbol: 'circle', symbolSize: 5 },
      ],
    }],
    legend: {
      data: ['当前版本 v1.2', '基线版本'],
      bottom: 0, textStyle: { color: '#64748b', fontSize: 11 },
    },
  };

  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: "#f8fafc", minHeight: "100vh" }}>

        {/* 流程引导条 */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "10px 16px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", minHeight: 36, gap: 0 }}>
            {/* 标题区 */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 12, marginRight: 8, borderRight: "1px solid #f1f5f9", flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #3b82f6, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap size={14} color="#fff" />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap" }}>TaskForge 流水线</span>
            </div>
            {/* 流程节点 */}
            <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0, overflowX: "auto", gap: 0 }}>
              {CENTER_LINKS.map((c, i) => {
                const Icon = c.icon;
                return (
                  <div key={c.href} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                    <Link href={c.href}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 8, textDecoration: "none", cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{ width: 20, height: 20, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: c.color + "20" }}>
                        <Icon size={12} color={c.color} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#475569", whiteSpace: "nowrap" }}>{c.label}</span>
                    </Link>
                    {i < CENTER_LINKS.length - 1 && (
                      <ArrowRight size={14} color="#cbd5e1" style={{ flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
          {[
            { label: "业务场景", value: 8, suffix: "个", icon: Target, color: "#3b82f6", bg: "#eff6ff", trend: "+2 本月" },
            { label: "数据集总量", value: 48000, suffix: "条", icon: Database, color: "#6366f1", bg: "#eef2ff", trend: "+12,400 本周" },
            { label: "已标注样本", value: 1580, suffix: "条", icon: CheckCircle2, color: "#10b981", bg: "#ecfdf5", trend: "+340 今日" },
            { label: "模型评测分", value: 87.3, suffix: "%", icon: TrendingUp, color: "#f59e0b", bg: "#fffbeb", trend: "+2.1 vs 基线" },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={card.label} style={{
                background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
                padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                transition: "box-shadow 0.2s, transform 0.2s",
                animation: `fadeInUp 0.5s ease ${i * 80}ms both`,
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={20} color={card.color} />
                  </div>
                  <span style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
                    <TrendingUp size={12} color="#10b981" />{card.trend}
                  </span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                  {loading ? (
                    <div style={{ width: 80, height: 28, background: "#f1f5f9", borderRadius: 6 }} />
                  ) : (
                    <AnimatedNumber value={card.value} suffix={card.suffix} />
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{card.label}</div>
              </div>
            );
          })}
        </div>

        {/* 图表 + 标注进度 */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 20 }}>
          <div style={{
            background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
            padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", margin: 0 }}>近7日生产趋势</h3>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0 0" }}>标注数量 & 质量合格率</p>
              </div>
              <button onClick={() => fetchStats(true)} disabled={refreshing}
                style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8" }}>
                <RefreshCw size={16} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
              </button>
            </div>
            <ReactECharts option={lineChartOption} style={{ height: 220 }} />
          </div>

          <div style={{
            background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
            padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", margin: 0 }}>标注任务进度</h3>
              <Link href="/annotation" style={{ fontSize: 12, color: "#2563eb", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                查看全部 <ChevronRight size={12} />
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {ANNOTATION_DATA.map((item, i) => {
                const pct = item.total > 0 ? Math.round((item.done / item.total) * 100) : 0;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#475569", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {item.kappa !== null && (
                          <span style={{ fontSize: 12, fontWeight: 500, color: item.kappa >= 0.7 ? "#059669" : "#dc2626" }}>
                            κ={item.kappa.toFixed(2)}
                          </span>
                        )}
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 4, background: "#3b82f6", width: `${pct}%`, transition: "width 1s" }} />
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{item.done}/{item.total} 条</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 六大中心 + 质量关口 */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 20 }}>
          <div style={{
            background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
            padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", margin: 0 }}>六大协同中心</h3>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Task-Driven Pipeline</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {CENTER_LINKS.map((c, i) => {
                const Icon = c.icon;
                return (
                  <Link key={c.href} href={c.href}
                    style={{
                      display: "block", padding: 16, borderRadius: 12,
                      border: "1px solid #e2e8f0", textDecoration: "none",
                      transition: "all 0.2s", position: "relative", overflow: "hidden",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = "#93c5fd";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1), 0 4px 12px rgba(0,0,0,0.1)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, transition: "transform 0.2s", background: c.color + "18" }}>
                      <Icon size={20} color={c.color} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4 }}>{c.label}</div>
                    {c.tag && (
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 20, background: c.color + "18", color: c.color }}>
                        {c.tag}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div style={{
            background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
            padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", margin: 0 }}>五大质量关口</h3>
              <Link href="/quality" style={{ fontSize: 12, color: "#2563eb", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                详情 <ChevronRight size={12} />
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {QUALITY_GATES.map((gate, i) => (
                <div key={gate.num}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 12,
                    border: activeGate === i ? "1px solid #93c5fd" : "1px solid #f1f5f9",
                    background: activeGate === i ? "#eff6ff" : "transparent",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                  onClick={() => setActiveGate(activeGate === i ? null : i)}
                  onMouseEnter={() => setActiveGate(i)}
                  onMouseLeave={() => setActiveGate(null)}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
                    background: gate.status === 'passed' ? '#10b981' : gate.status === 'failed' ? '#ef4444' : '#f59e0b',
                    boxShadow: gate.status === 'passed' ? '0 2px 8px rgba(16,185,129,0.3)' : '0 2px 8px rgba(245,158,11,0.3)',
                  }}>
                    {gate.status === 'passed' ? '✓' : gate.status === 'failed' ? '✗' : '…'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>{gate.num}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{gate.name}</span>
                    </div>
                    <div style={{ fontSize: 11, marginTop: 2, color: gate.status === 'passed' ? '#059669' : gate.status === 'failed' ? '#dc2626' : '#d97706' }}>
                      {gate.status === 'passed' ? '已通过' : gate.status === 'failed' ? '未通过' : '待执行'}
                    </div>
                  </div>
                  {gate.status === 'passed' ? (
                    <CheckCircle2 size={20} color="#10b981" />
                  ) : gate.status === 'failed' ? (
                    <div style={{ width: 20, height: 20, borderRadius: 10, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#dc2626", fontSize: 11, fontWeight: 700 }}>!</span>
                    </div>
                  ) : (
                    <Clock size={20} color="#fbbf24" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 能力雷达图 */}
        <div style={{
          background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
          padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", margin: 0 }}>模型能力评估</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0 0" }}>客服意图识别 v1.2 vs 基线</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "#64748b" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: 2, background: "#3b82f6", display: "inline-block" }} /> 当前版本
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: 2, borderTop: "2px dashed #94a3b8", display: "inline-block" }} /> 基线
              </span>
            </div>
          </div>
          <ReactECharts option={radarOption} style={{ height: 260 }} />
        </div>

        {/* 最近活动时间线 */}
        <div style={{
          background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
          padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}>
          <h3 style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
            <Activity size={16} color="#3b82f6" />
            最近活动
          </h3>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { time: "10:32", action: "标注任务完成", desc: "客服意图识别 v1.2 标注完成，Kappa=0.78", type: "success", icon: CheckCircle2 },
              { time: "10:15", action: "质量关口通过", desc: "QG-3 标注质量检验通过 (Kappa ≥ 0.7)", type: "success", icon: Shield },
              { time: "09:48", action: "数据集上传", desc: "新增评论数据集 v2，共 300 条", type: "info", icon: Database },
              { time: "09:30", action: "评测任务创建", desc: "客服意图识别 v1.2.0 评测已启动", type: "info", icon: BarChart3 },
              { time: "09:12", action: "模型发布", desc: "客服意图识别 v1.1 成功发布至测试环境", type: "success", icon: Rocket },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0",
                  borderBottom: i < 4 ? "1px solid #f8fafc" : "none",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 2, background: item.type === 'success' ? '#ecfdf5' : '#eff6ff',
                  }}>
                    <Icon size={14} color={item.type === 'success' ? '#10b981' : '#3b82f6'} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#475569" }}>{item.action}</span>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>{item.time}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0 0" }}>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
  );
}
