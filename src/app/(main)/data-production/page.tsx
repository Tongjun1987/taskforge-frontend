"use client";
import { useEffect, useRef, useState } from "react";
import { getDashboardStats } from "@/lib/services";
import { Database, CheckCircle2, RefreshCw, Upload, Layers, Tag, ChevronRight } from "lucide-react";
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

// Mock 数据
const WEEKLY_DATA = [
  { date: "5/12", collect: 1200, clean: 980, annotate: 240 },
  { date: "5/13", collect: 1500, clean: 1200, annotate: 310 },
  { date: "5/14", collect: 1800, clean: 1450, annotate: 420 },
  { date: "5/15", collect: 2100, clean: 1680, annotate: 580 },
  { date: "5/16", collect: 1600, clean: 1350, annotate: 650 },
  { date: "5/17", collect: 2400, clean: 1920, annotate: 720 },
  { date: "5/18", collect: 2800, clean: 2100, annotate: 800 },
];

// 任务进度类型
interface TaskProgress {
  id: string;
  name: string;
  type: "collect" | "clean" | "annotate";
  done: number;
  total: number;
  status: "running" | "completed" | "pending";
}

const TASK_PROGRESS: TaskProgress[] = [
  // 采集任务
  { id: "c1", name: "交通视频流采集", type: "collect", done: 45, total: 60, status: "running" },
  { id: "c2", name: "传感器数据采集", type: "collect", done: 30, total: 30, status: "completed" },
  { id: "c3", name: "日志数据采集", type: "collect", done: 80, total: 100, status: "running" },
  // 清洗任务
  { id: "cl1", name: "图像数据清洗", type: "clean", done: 1200, total: 1500, status: "running" },
  { id: "cl2", name: "文本数据清洗", type: "clean", done: 500, total: 500, status: "completed" },
  { id: "cl3", name: "音频数据清洗", type: "clean", done: 200, total: 400, status: "running" },
  // 标注任务
  { id: "a1", name: "目标检测标注", type: "annotate", done: 380, total: 500, status: "running" },
  { id: "a2", name: "文本分类标注", type: "annotate", done: 1200, total: 1200, status: "completed" },
  { id: "a3", name: "意图识别标注", type: "annotate", done: 0, total: 300, status: "pending" },
];

export default function DataProductionPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // 近7日生产趋势图表配置
  const lineChartOption = {
    backgroundColor: 'transparent',
    grid: { top: 15, right: 50, bottom: 28, left: 50 },
    legend: {
      data: ['采集量', '清洗量', '标注量'],
      bottom: 0,
      textStyle: { color: '#64748b', fontSize: 11 },
    },
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
        name: '采集量', type: 'line',
        data: WEEKLY_DATA.map(d => d.collect),
        smooth: true,
        lineStyle: { color: '#3b82f6', width: 2 },
        itemStyle: { color: '#3b82f6' },
        symbol: 'circle', symbolSize: 5,
        areaStyle: { color: 'rgba(59,130,246,0.1)' },
      },
      {
        name: '清洗量', type: 'line',
        data: WEEKLY_DATA.map(d => d.clean),
        smooth: true,
        lineStyle: { color: '#10b981', width: 2 },
        itemStyle: { color: '#10b981' },
        symbol: 'circle', symbolSize: 5,
        areaStyle: { color: 'rgba(16,185,129,0.1)' },
      },
      {
        name: '标注量', type: 'bar',
        data: WEEKLY_DATA.map(d => d.annotate),
        itemStyle: { color: '#8b5cf6', borderRadius: [4, 4, 0, 0] },
        barWidth: '35%',
      },
    ],
  };

  // 任务进度卡片
  const TaskProgressCard = ({ task, color, icon: Icon }: { task: TaskProgress; color: string; icon: any }) => {
    const pct = task.total > 0 ? Math.round((task.done / task.total) * 100) : 0;
    const statusColors = {
      running: { bg: '#dbeafe', color: '#2563eb', text: '进行中' },
      completed: { bg: '#dcfce7', color: '#16a34a', text: '已完成' },
      pending: { bg: '#f3f4f6', color: '#6b7280', text: '待执行' },
    };
    const sc = statusColors[task.status];

    return (
      <div style={{
        padding: "14px 16px",
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: `${color}15`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={14} style={{ color }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {task.name}
            </span>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600,
            padding: "3px 8px",
            background: sc.bg, color: sc.color,
            borderRadius: 20,
          }}>
            {sc.text}
          </span>
        </div>
        <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
          <div style={{
            height: "100%", borderRadius: 3,
            background: color,
            width: `${pct}%`,
            transition: "width 0.8s ease",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8" }}>
          <span>{task.done.toLocaleString()} / {task.total.toLocaleString()} 条</span>
          <span style={{ fontWeight: 600, color: color }}>{pct}%</span>
        </div>
      </div>
    );
  };

  // 按类型分组任务
  const collectTasks = TASK_PROGRESS.filter(t => t.type === "collect");
  const cleanTasks = TASK_PROGRESS.filter(t => t.type === "clean");
  const annotateTasks = TASK_PROGRESS.filter(t => t.type === "annotate");

  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: "#f8fafc", minHeight: "100vh" }}>

      {/* 指标卡片区 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "数据集总量", value: 48000, suffix: "条", icon: Database, color: "#3b82f6", bg: "#eff6ff", trend: "+12,400 本周" },
          { label: "已清洗数据", value: 18500, suffix: "条", icon: Layers, color: "#10b981", bg: "#ecfdf5", trend: "+8,200 本周" },
          { label: "已标注样本", value: 1580, suffix: "条", icon: CheckCircle2, color: "#8b5cf6", bg: "#f5f3ff", trend: "+340 今日" },
          { label: "进行中任务", value: 6, suffix: "个", icon: Upload, color: "#f59e0b", bg: "#fffbeb", trend: "采集/清洗/标注" },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={{
              background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
              padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              transition: "box-shadow 0.2s, transform 0.2s",
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
                <span style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
                  {card.trend}
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

      {/* 近7日生产趋势 */}
      <div style={{
        background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
        padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", margin: 0 }}>近7日生产趋势</h3>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0 0" }}>采集量 / 清洗量 / 标注量</p>
          </div>
          <button onClick={() => fetchStats(true)} disabled={refreshing}
            style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8" }}>
            <RefreshCw size={16} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
          </button>
        </div>
        <ReactECharts option={lineChartOption} style={{ height: 260 }} />
      </div>

      {/* 三类任务进度 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {/* 采集任务进度 */}
        <div style={{
          background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
          padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "#3b82f615",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Upload size={16} color="#3b82f6" />
              </div>
              <h3 style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", margin: 0 }}>采集任务进度</h3>
            </div>
            <Link href="/data-asset/data-access" style={{
              fontSize: 11, color: "#2563eb", textDecoration: "none",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              查看全部 <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {collectTasks.map(task => (
              <TaskProgressCard key={task.id} task={task} color="#3b82f6" icon={Upload} />
            ))}
          </div>
        </div>

        {/* 清洗任务进度 */}
        <div style={{
          background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
          padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "#10b98115",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Layers size={16} color="#10b981" />
              </div>
              <h3 style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", margin: 0 }}>清洗任务进度</h3>
            </div>
            <Link href="/data-cleaning" style={{
              fontSize: 11, color: "#059669", textDecoration: "none",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              查看全部 <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {cleanTasks.map(task => (
              <TaskProgressCard key={task.id} task={task} color="#10b981" icon={Layers} />
            ))}
          </div>
        </div>

        {/* 标注任务进度 */}
        <div style={{
          background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
          padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "#8b5cf615",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Tag size={16} color="#8b5cf6" />
              </div>
              <h3 style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", margin: 0 }}>标注任务进度</h3>
            </div>
            <Link href="/annotation" style={{
              fontSize: 11, color: "#7c3aed", textDecoration: "none",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              查看全部 <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {annotateTasks.map(task => (
              <TaskProgressCard key={task.id} task={task} color="#8b5cf6" icon={Tag} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
