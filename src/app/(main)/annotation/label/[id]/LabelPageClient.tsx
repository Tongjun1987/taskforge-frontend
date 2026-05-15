"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle,
  Save, SkipForward, RotateCcw, Tag, Box, Activity, Zap, BarChart2
} from "lucide-react";
import { MOCK_JOBS, STORAGE_KEY } from "../../_mock";

// ─── 矩形框标注子组件（hooks 必须在组件顶层） ────────────────────────────────────
function RectAnnotation({ item, answers, setAnswers }: {
  item: any;
  answers: Record<number, any>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<number, any>>>;
}) {
  const BBOX_COLORS = [
    "#3b82f6","#ef4444","#10b981","#f59e0b","#8b5cf6",
    "#ec4899","#06b6d4","#84cc16","#f97316","#6366f1",
    "#14b8a6","#a855f7"
  ];

  const boxes: Array<{ x: number; y: number; w: number; h: number; label: string; color: string }> =
    answers[item.id]?.boxes || [];

  const [drawing, setDrawing] = useState<{ startX: number; startY: number; label: string } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>(item.labels[0]);
  const [activeTool, setActiveTool] = useState<"bbox" | "pan">("bbox");
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== "bbox") return;
    const rect = canvasRef.current!.getBoundingClientRect();
    setDrawing({ startX: e.clientX - rect.left, startY: e.clientY - rect.top, label: selectedLabel });
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing && activeTool !== "bbox") return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    setMousePos({ x, y });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!drawing) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    const x = Math.min(drawing.startX, endX);
    const y = Math.min(drawing.startY, endY);
    const w = Math.abs(endX - drawing.startX);
    const h = Math.abs(endY - drawing.startY);
    if (w > 10 && h > 10) {
      const color = BBOX_COLORS[boxes.length % BBOX_COLORS.length];
      setAnswers(a => ({
        ...a,
        [item.id]: {
          labels: [...(a[item.id]?.labels || []), drawing.label],
          boxes: [...(a[item.id]?.boxes || []), { x, y, w, h, label: drawing.label, color }],
        },
      }));
    }
    setDrawing(null);
    setMousePos(null);
  };

  const removeBox = (idx: number) => {
    setAnswers(a => {
      const curBoxes = a[item.id]?.boxes || [];
      const curLabels = a[item.id]?.labels || [];
      const removedLabel = curBoxes[idx]?.label;
      return {
        ...a,
        [item.id]: {
          boxes: curBoxes.filter((_: any, i: number) => i !== idx),
          labels: curLabels.filter((l: string) => l !== removedLabel),
        },
      };
    });
  };

  const labelColorMap: Record<string, string> = {};
  item.labels.forEach((l: string, i: number) => {
    labelColorMap[l] = BBOX_COLORS[i % BBOX_COLORS.length];
  });

  return (
    <div>
      {/* 工具栏 */}
      <div style={{
        display: "flex", alignItems: "center", gap: 4, marginBottom: 12,
        background: "#f8fafc", borderRadius: 8, padding: "6px 10px", border: "1px solid #e2e8f0"
      }}>
        <span style={{ fontSize: 11, color: "#94a3b8", marginRight: 6 }}>工具:</span>
        {([
          { key: "bbox", icon: "⬜", label: "创建边界框" },
          { key: "pan", icon: "✋", label: "平移/选择" },
        ] as const).map(tool => (
          <button key={tool.key} onClick={() => setActiveTool(tool.key as "bbox" | "pan")}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
              borderRadius: 6, border: "1px solid", cursor: "pointer", fontSize: 12,
              borderColor: activeTool === tool.key ? "#3b82f6" : "#e2e8f0",
              background: activeTool === tool.key ? "#eff6ff" : "#fff",
              color: activeTool === tool.key ? "#2563eb" : "#64748b",
            }}>
            <span>{tool.icon}</span> {tool.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: "#94a3b8" }}>
          {mousePos ? `X: ${Math.round(mousePos.x)} Y: ${Math.round(mousePos.y)}` : "移动鼠标绘制"}
        </span>
      </div>

      {/* 模拟交通图像 */}
      <div style={{
        position: "relative", borderRadius: 10, overflow: "hidden",
        border: "2px solid #334155", marginBottom: 12,
        background: "#0d1117", cursor: activeTool === "bbox" ? "crosshair" : "default"
      }}>
        <div ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => { setDrawing(null); setMousePos(null); }}
          style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden" }}>

          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #1a3a5c 0%, #2d5a7b 40%, #4a7a9b 60%, #6b9a6b 75%, #4a6b4a 100%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "#3d3d3d" }}>
            <div style={{ position: "absolute", top: "20%", left: 0, right: 0, height: 3, background: "#fbbf24" }} />
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 3, background: "#fff", opacity: 0.9 }} />
            <div style={{ position: "absolute", top: "50%", left: "33%", right: "33%", height: 3, background: "#fbbf24", backgroundImage: "repeating-linear-gradient(90deg, #fbbf24 0, #fbbf24 30px, transparent 30px, transparent 50px)", backgroundSize: "50px 3px" }} />
          </div>
          <div style={{ position: "absolute", bottom: "55%", left: "5%", width: "12%", height: "25%", background: "#4a5568", borderRadius: "2px 2px 0 0" }} />
          <div style={{ position: "absolute", bottom: "55%", left: "18%", width: "10%", height: "18%", background: "#718096", borderRadius: "2px 2px 0 0" }} />
          {[0,1,2].map(i => (
            <div key={i} style={{ position: "absolute", bottom: "55%", left: `${6 + i * 4}%`, width: "2.5%", height: "3%", background: "#fde68a", opacity: 0.7 }} />
          ))}
          <div style={{ position: "absolute", bottom: "55%", right: "8%", width: "14%", height: "30%", background: "#5a6578", borderRadius: "2px 2px 0 0" }} />
          <div style={{ position: "absolute", bottom: "47%", left: "20%", width: "8%", height: "4%", background: "#ef4444", borderRadius: 4, opacity: 0.8 }} />
          <div style={{ position: "absolute", bottom: "47%", left: "45%", width: "6%", height: "3%", background: "#3b82f6", borderRadius: 4, opacity: 0.7 }} />
          <div style={{ position: "absolute", bottom: "47%", right: "22%", width: "9%", height: "4.5%", background: "#fff", borderRadius: 4, opacity: 0.8 }} />
          <div style={{ position: "absolute", bottom: "18%", left: "8%", width: "16%", height: "10%", background: "#2563eb", borderRadius: "8px 8px 4px 4px" }}>
            <div style={{ position: "absolute", top: "15%", left: "5%", width: "30%", height: "30%", background: "#60a5fa", borderRadius: 2 }} />
            <div style={{ position: "absolute", top: "15%", right: "5%", width: "30%", height: "30%", background: "#60a5fa", borderRadius: 2 }} />
          </div>
          <div style={{ position: "absolute", bottom: "18%", left: "40%", width: "14%", height: "9%", background: "#dc2626", borderRadius: "6px 6px 3px 3px" }}>
            <div style={{ position: "absolute", top: "15%", left: "5%", width: "28%", height: "28%", background: "#fca5a5", borderRadius: 2 }} />
            <div style={{ position: "absolute", top: "15%", right: "5%", width: "28%", height: "28%", background: "#fca5a5", borderRadius: 2 }} />
          </div>
          <div style={{ position: "absolute", bottom: "14%", left: "65%", width: "3%", height: "8%", background: "#10b981", borderRadius: "50% 50% 30% 30%" }} />
          <div style={{ position: "absolute", bottom: "14%", right: "6%", width: "5%", height: "14%", background: "#7c3aed", borderRadius: 4 }}>
            <div style={{ position: "absolute", top: "5%", left: "10%", width: "80%", height: "4%", background: "#fbbf24" }} />
          </div>
          <div style={{ position: "absolute", top: 8, right: 8, display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.5)", padding: "3px 8px", borderRadius: 4 }}>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>📷</span>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>{item.scene}</span>
          </div>

          {boxes.map((box, idx) => (
            <div key={idx}
              onClick={() => removeBox(idx)}
              title="点击删除此框"
              style={{
                position: "absolute",
                left: box.x,
                top: box.y,
                width: box.w,
                height: box.h,
                border: `2px solid ${box.color}`,
                borderRadius: 2,
                cursor: "pointer",
                boxShadow: `0 0 0 1px rgba(0,0,0,0.3)`,
              }}>
              <div style={{
                position: "absolute", top: -20, left: 0,
                background: box.color, color: "#fff",
                fontSize: 10, padding: "1px 6px", borderRadius: 2, fontWeight: 600,
                whiteSpace: "nowrap", maxWidth: box.w + 4, overflow: "hidden", textOverflow: "ellipsis"
              }}>
                {box.label}
              </div>
            </div>
          ))}

          {drawing && mousePos && (
            <div style={{
              position: "absolute",
              left: Math.min(drawing.startX, mousePos.x),
              top: Math.min(drawing.startY, mousePos.y),
              width: Math.abs(mousePos.x - drawing.startX),
              height: Math.abs(mousePos.y - drawing.startY),
              border: `2px dashed ${BBOX_COLORS[boxes.length % BBOX_COLORS.length]}`,
              background: `${BBOX_COLORS[boxes.length % BBOX_COLORS.length]}20`,
              pointerEvents: "none",
            }} />
          )}
        </div>
      </div>

      {/* 标签选择 */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>选择目标类别：</span>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>（当前选中: <strong style={{ color: labelColorMap[selectedLabel] as string }}>{selectedLabel}</strong>，点击标签后继续绘制框）</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {item.labels.map((l: string) => (
            <button key={l} onClick={() => setSelectedLabel(l)}
              style={{
                padding: "5px 12px", borderRadius: 6, border: "2px solid", cursor: "pointer",
                fontSize: 12, fontWeight: 600,
                borderColor: selectedLabel === l ? labelColorMap[l] : "#e2e8f0",
                background: selectedLabel === l ? `${labelColorMap[l]}20` : "#fff",
                color: selectedLabel === l ? labelColorMap[l] : "#64748b",
              }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: labelColorMap[l], marginRight: 5 }} />
              {l}
            </button>
          ))}
        </div>
      </div>

      {boxes.length > 0 && (
        <div style={{
          background: "#eff6ff", border: "1px solid #bfdbfe",
          borderRadius: 8, padding: "10px 14px", fontSize: 12
        }}>
          <div style={{ color: "#1d4ed8", fontWeight: 600, marginBottom: 6 }}>
            ✅ 已标注 {boxes.length} 个目标
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {boxes.map((box, idx) => (
              <span key={idx} onClick={() => removeBox(idx)} title="点击删除"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "3px 8px", borderRadius: 4, fontSize: 11,
                  background: `${box.color}20`, color: box.color,
                  border: `1px solid ${box.color}50`, cursor: "pointer", fontWeight: 600,
                }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: box.color, display: "inline-block" }} />
                {box.label}
                <span style={{ opacity: 0.6 }}>×</span>
              </span>
            ))}
          </div>
        </div>
      )}
      {boxes.length === 0 && (
        <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", padding: "8px 0" }}>
          💡 在图像上拖拽绘制边界框，或直接选择上方类别标签进行标注
        </div>
      )}
    </div>
  );
}

function getJobs() {
  if (typeof window === "undefined") return [...MOCK_JOBS];
  const d = localStorage.getItem(STORAGE_KEY);
  const saved = d ? JSON.parse(d) : [];
  if (!d || saved.length === 0) return [...MOCK_JOBS];
  return saved;
}

// ─── 各模板的 Mock 标注数据 ────────────────────────────────────────────────
const MOCK_ITEMS: Record<string, any[]> = {
  // 矩形框目标检测
  rect: [
    { id: 1, scene: "路口俯拍", hint: "请框选图中所有交通目标并选择类别", labels: ["小汽车","公交车","货车","摩托车","行人","非机动车","交通锥","隔离墩","红绿灯","路牌","施工车辆","特种车辆"] },
    { id: 2, scene: "隧道入口", hint: "请框选图中所有交通目标并选择类别", labels: ["小汽车","公交车","货车","摩托车","行人","非机动车","交通锥","隔离墩","红绿灯","路牌","施工车辆","特种车辆"] },
    { id: 3, scene: "高速收费站", hint: "请框选图中所有交通目标并选择类别", labels: ["小汽车","公交车","货车","摩托车","行人","非机动车","交通锥","隔离墩","红绿灯","路牌","施工车辆","特种车辆"] },
    { id: 4, scene: "城市主干道", hint: "请框选图中所有交通目标并选择类别", labels: ["小汽车","公交车","货车","摩托车","行人","非机动车","交通锥","隔离墩","红绿灯","路牌","施工车辆","特种车辆"] },
    { id: 5, scene: "十字路口", hint: "请框选图中所有交通目标并选择类别", labels: ["小汽车","公交车","货车","摩托车","行人","非机动车","交通锥","隔离墩","红绿灯","路牌","施工车辆","特种车辆"] },
  ],
  // 多目标跟踪
  track: [
    { id: 1, scene: "视频帧 001-050", duration: "0:00–0:05", tracks: [{id:"T01",type:"小汽车",color:"#2563eb"},{id:"T02",type:"行人",color:"#16a34a"},{id:"T03",type:"摩托车",color:"#d97706"}] },
    { id: 2, scene: "视频帧 051-100", duration: "0:05–0:10", tracks: [{id:"T04",type:"公交车",color:"#7c3aed"},{id:"T05",type:"非机动车",color:"#0891b2"},{id:"T06",type:"小汽车",color:"#2563eb"}] },
    { id: 3, scene: "视频帧 101-150", duration: "0:10–0:15", tracks: [{id:"T07",type:"货车",color:"#dc2626"},{id:"T08",type:"行人",color:"#16a34a"},{id:"T09",type:"小汽车",color:"#2563eb"}] },
    { id: 4, scene: "视频帧 151-200", duration: "0:15–0:20", tracks: [{id:"T10",type:"摩托车",color:"#d97706"},{id:"T11",type:"小汽车",color:"#2563eb"}] },
  ],
  // 时序行为片段
  segment: [
    { id: 1, clip: "clip_001.mp4", duration: "00:00 – 00:08", thumbnail: "路口左转场景", behaviors: ["正常行驶","急刹车","违规变道","超速行驶","闯红灯","逆行","占用应急车道","违规停车"] },
    { id: 2, clip: "clip_002.mp4", duration: "00:08 – 00:16", thumbnail: "人行横道场景", behaviors: ["正常行驶","急刹车","违规变道","超速行驶","闯红灯","逆行","占用应急车道","违规停车"] },
    { id: 3, clip: "clip_003.mp4", duration: "00:16 – 00:24", thumbnail: "高速匝道场景", behaviors: ["正常行驶","急刹车","违规变道","超速行驶","闯红灯","逆行","占用应急车道","违规停车"] },
    { id: 4, clip: "clip_004.mp4", duration: "00:24 – 00:32", thumbnail: "隧道内场景", behaviors: ["正常行驶","急刹车","违规变道","超速行驶","闯红灯","逆行","占用应急车道","违规停车"] },
  ],
  // 事件分类
  event: [
    { id: 1, eventId: "EVT-20260417-001", time: "2026-04-17 08:23:14", location: "G60高速K42+300", description: "两辆小型车追尾碰撞，车辆横跨应急车道", eventTypes: ["追尾碰撞","侧面碰撞","正面碰撞","翻车事故","路面障碍","违章停车","逆向行驶","大面积拥堵","异常行人"], severities: ["轻微","一般","严重","特别严重"] },
    { id: 2, eventId: "EVT-20260417-002", time: "2026-04-17 09:45:02", location: "城市快速路出口匝道", description: "货车侧翻，货物撒落路面，交通完全中断", eventTypes: ["追尾碰撞","侧面碰撞","正面碰撞","翻车事故","路面障碍","违章停车","逆向行驶","大面积拥堵","异常行人"], severities: ["轻微","一般","严重","特别严重"] },
    { id: 3, eventId: "EVT-20260417-003", time: "2026-04-17 11:10:55", location: "主干道路口", description: "行人闯红灯穿越，与右转电动车轻微碰撞", eventTypes: ["追尾碰撞","侧面碰撞","正面碰撞","翻车事故","路面障碍","违章停车","逆向行驶","大面积拥堵","异常行人"], severities: ["轻微","一般","严重","特别严重"] },
    { id: 4, eventId: "EVT-20260417-004", time: "2026-04-17 14:32:08", location: "高速隧道入口", description: "施工标志缺失，车辆避让造成多车追尾", eventTypes: ["追尾碰撞","侧面碰撞","正面碰撞","翻车事故","路面障碍","违章停车","逆向行驶","大面积拥堵","异常行人"], severities: ["轻微","一般","严重","特别严重"] },
    { id: 5, eventId: "EVT-20260417-005", time: "2026-04-17 17:48:30", location: "城市主干道", description: "晚高峰单向三车道全部堵塞，尾巴延伸至2公里", eventTypes: ["追尾碰撞","侧面碰撞","正面碰撞","翻车事故","路面障碍","违章停车","逆向行驶","大面积拥堵","异常行人"], severities: ["轻微","一般","严重","特别严重"] },
  ],
  // 时序异常标注
  timeseries: [
    { id: 1, sensorId: "LOOP-G60-042", date: "2026-04-16", timeRange: "07:00–09:00", points: [12,15,28,45,78,124,186,215,196,178,155,134], anomalyTypes: ["流量突增","流量骤降","速度异常偏低","速度异常偏高","占有率过高","传感器故障","数据缺失"] },
    { id: 2, sensorId: "LOOP-G60-043", date: "2026-04-16", timeRange: "09:00–11:00", points: [134,128,115,98,87,76,65,42,18,8,3,7], anomalyTypes: ["流量突增","流量骤降","速度异常偏低","速度异常偏高","占有率过高","传感器故障","数据缺失"] },
    { id: 3, sensorId: "LOOP-G60-044", date: "2026-04-16", timeRange: "11:00–13:00", points: [95,98,102,99,245,312,289,265,198,154,128,110], anomalyTypes: ["流量突增","流量骤降","速度异常偏低","速度异常偏高","占有率过高","传感器故障","数据缺失"] },
    { id: 4, sensorId: "LOOP-G60-045", date: "2026-04-16", timeRange: "13:00–15:00", points: [88,90,0,0,0,92,95,98,100,105,108,112], anomalyTypes: ["流量突增","流量骤降","速度异常偏低","速度异常偏高","占有率过高","传感器故障","数据缺失"] },
    { id: 5, sensorId: "LOOP-G60-046", date: "2026-04-16", timeRange: "15:00–17:00", points: [115,118,120,125,122,119,116,145,178,198,212,220], anomalyTypes: ["流量突增","流量骤降","速度异常偏低","速度异常偏高","占有率过高","传感器故障","数据缺失"] },
  ],
  // 保留旧模板
  text_classify: [
    { id: 1, text: "这个产品真的很好用，物超所值！", question: "情感倾向", options: ["正面", "负面", "中性"] },
    { id: 2, text: "快递很慢，包装也破了，非常失望。", question: "情感倾向", options: ["正面", "负面", "中性"] },
    { id: 3, text: "一般般吧，没什么特别的感觉。", question: "情感倾向", options: ["正面", "负面", "中性"] },
  ],
  ner: [
    { id: 1, text: "阿里巴巴集团创始人马云在杭州宣布成立达摩院", tokens: ["阿里巴巴集团", "马云", "杭州", "达摩院"], entityTypes: ["ORG", "PER", "LOC", "ORG"] },
    { id: 2, text: "腾讯公司CEO马化腾在深圳总部发表讲话", tokens: ["腾讯公司", "马化腾", "深圳总部"], entityTypes: ["ORG", "PER", "LOC"] },
  ],
};

function getItems(template: string) {
  return MOCK_ITEMS[template] || MOCK_ITEMS["text_classify"];
}

export default function LabelPageClient() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [nerLabels, setNerLabels] = useState<Record<string, string>>({});
  // timeseries 选中异常区间
  const [tsAnomalies, setTsAnomalies] = useState<Record<number, { indices: number[]; type: string }>>({});

  useEffect(() => {
    const all = getJobs();
    const found = all.find((j: any) => j.id === id);
    setJob(found || null);
    const template = found?.label_template || "text_classify";
    setItems(getItems(template));
    setLoading(false);
  }, [id]);

  if (loading) return null;
  if (!job) return (
    <main style={{ padding: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, color: "#64748b" }}>
      <AlertCircle size={48} color="#cbd5e1" />
      <p style={{ fontSize: 16 }}>任务不存在或已被删除</p>
      <button onClick={() => router.push("/annotation")} style={{ padding: "8px 20px", background: "#1e293b", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14 }}>返回列表</button>
    </main>
  );

  const item = items[current];
  const template = job.label_template || "text_classify";
  const progress = Object.keys(saved).length;
  const total = items.length;

  const handleSave = () => {
    setSaved(s => ({ ...s, [item.id]: true }));
    if (current < items.length - 1) {
      setTimeout(() => setCurrent(c => c + 1), 300);
    }
  };

  // ─── 各模板渲染 ────────────────────────────────────────────────────────────
  const renderAnnotationArea = () => {
    if (!item) return null;

    // ① 矩形框目标检测 — 使用独立子组件
    if (template === "rect") {
      return <RectAnnotation item={item} answers={answers} setAnswers={setAnswers} />;
    }

    // ② 多目标跟踪
    if (template === "track") {
      const confirmed: string[] = answers[item.id]?.confirmed || [];
      const toggleTrack = (tid: string) => {
        setAnswers(a => {
          const cur: string[] = a[item.id]?.confirmed || [];
          const next = cur.includes(tid) ? cur.filter(x => x !== tid) : [...cur, tid];
          return { ...a, [item.id]: { confirmed: next } };
        });
      };
      return (
        <div>
          <div style={{ width: "100%", height: 180, background: "#0f172a", borderRadius: 10, marginBottom: 16, padding: 16, boxSizing: "border-box" }}>
            <div style={{ color: "#64748b", fontSize: 11, marginBottom: 12 }}>🎬 {item.scene}（{item.duration}）</div>
            {item.tracks.map((t: any) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: "#94a3b8", width: 28 }}>{t.id}</span>
                <div style={{ flex: 1, height: 20, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${60 + Math.random() * 30}%`, background: t.color, opacity: 0.6, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 10, color: t.color, fontWeight: 600, width: 50 }}>{t.type}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 12 }}>请确认各跟踪目标 ID 和类别是否准确：</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {item.tracks.map((t: any) => (
              <div key={t.id} onClick={() => toggleTrack(t.id)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 8, border: "2px solid", cursor: "pointer",
                  borderColor: confirmed.includes(t.id) ? t.color : "#e2e8f0",
                  background: confirmed.includes(t.id) ? "#f8fafc" : "#fff" }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: t.color }} />
                <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 13 }}>{t.id}</span>
                <span style={{ color: "#64748b", fontSize: 12 }}>{t.type}</span>
                <div style={{ flex: 1 }} />
                {confirmed.includes(t.id) && <CheckCircle2 size={16} color={t.color} />}
              </div>
            ))}
          </div>
          {confirmed.length > 0 && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#059669", fontWeight: 500 }}>
              已确认 {confirmed.length}/{item.tracks.length} 条轨迹
            </div>
          )}
        </div>
      );
    }

    // ③ 时序行为片段
    if (template === "segment") {
      const selected: string[] = answers[item.id]?.behaviors || [];
      const toggle = (b: string) => {
        setAnswers(a => {
          const cur: string[] = a[item.id]?.behaviors || [];
          const next = cur.includes(b) ? cur.filter(x => x !== b) : [...cur, b];
          return { ...a, [item.id]: { behaviors: next } };
        });
      };
      return (
        <div>
          <div style={{ background: "#0f172a", borderRadius: 10, padding: "24px 20px", marginBottom: 16, textAlign: "center" }}>
            <Activity size={36} color="#4f46e5" style={{ margin: "0 auto 8px" }} />
            <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{item.clip}</div>
            <div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>时间段：{item.duration}</div>
            <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>{item.thumbnail}</div>
            <div style={{ marginTop: 14, display: "flex", justifyContent: "center", gap: 8 }}>
              <button style={{ padding: "7px 20px", borderRadius: 6, background: "#4f46e5", color: "#fff", border: "none", cursor: "pointer", fontSize: 12 }}>▶ 播放</button>
              <button style={{ padding: "7px 14px", borderRadius: 6, background: "#1e293b", color: "#94a3b8", border: "none", cursor: "pointer", fontSize: 12 }}>⏹ 停止</button>
            </div>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 10 }}>该片段中包含哪些行为？（可多选）</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
            {item.behaviors.map((b: string) => (
              <button key={b} onClick={() => toggle(b)}
                style={{ padding: "10px 14px", borderRadius: 8, border: "2px solid", cursor: "pointer", fontSize: 13, fontWeight: 600, textAlign: "left",
                  borderColor: selected.includes(b) ? "#4f46e5" : "#e2e8f0",
                  background: selected.includes(b) ? "#eef2ff" : "#fff",
                  color: selected.includes(b) ? "#4f46e5" : "#64748b" }}>
                {selected.includes(b) && <CheckCircle2 size={13} style={{ display: "inline", marginRight: 5, verticalAlign: "middle" }} />}
                {b}
              </button>
            ))}
          </div>
          {selected.length > 0 && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#4f46e5", fontWeight: 500 }}>
              已标注 {selected.length} 种行为：{selected.join("、")}
            </div>
          )}
        </div>
      );
    }

    // ④ 事件分类
    if (template === "event") {
      const cur = answers[item.id] || {};
      const setField = (key: string, val: string) => setAnswers(a => ({ ...a, [item.id]: { ...a[item.id], [key]: val } }));
      return (
        <div>
          <div style={{ background: "#fef9ec", border: "1px solid #fed7aa", borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 16, marginBottom: 8, fontSize: 12 }}>
              <span style={{ color: "#92400e", fontWeight: 600 }}>事件 ID: {item.eventId}</span>
              <span style={{ color: "#78350f" }}>📍 {item.location}</span>
              <span style={{ color: "#78350f" }}>🕐 {item.time}</span>
            </div>
            <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7 }}>{item.description}</div>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>事件类型</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {item.eventTypes.map((t: string) => (
              <button key={t} onClick={() => setField("type", t)}
                style={{ padding: "7px 12px", borderRadius: 6, border: "2px solid", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  borderColor: cur.type === t ? "#dc2626" : "#e2e8f0",
                  background: cur.type === t ? "#fee2e2" : "#fff",
                  color: cur.type === t ? "#dc2626" : "#64748b" }}>
                {cur.type === t && <Zap size={11} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />}
                {t}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>严重程度</p>
          <div style={{ display: "flex", gap: 8 }}>
            {item.severities.map((s: string, i: number) => {
              const colors = ["#16a34a", "#d97706", "#dc2626", "#7c3aed"];
              return (
                <button key={s} onClick={() => setField("severity", s)}
                  style={{ flex: 1, padding: "10px", borderRadius: 8, border: "2px solid", cursor: "pointer", fontSize: 13, fontWeight: 700,
                    borderColor: cur.severity === s ? colors[i] : "#e2e8f0",
                    background: cur.severity === s ? colors[i] : "#fff",
                    color: cur.severity === s ? "#fff" : "#64748b" }}>
                  {s}
                </button>
              );
            })}
          </div>
          {cur.type && cur.severity && (
            <div style={{ marginTop: 12, padding: "8px 12px", background: "#f0fdf4", borderRadius: 6, fontSize: 12, color: "#15803d", fontWeight: 500 }}>
              ✅ 已标注：{cur.type} / {cur.severity}
            </div>
          )}
        </div>
      );
    }

    // ⑤ 时序异常标注
    if (template === "timeseries") {
      const state = tsAnomalies[item.id] || { indices: [], type: "" };
      const maxVal = Math.max(...item.points);
      const toggleIdx = (i: number) => {
        setTsAnomalies(prev => {
          const cur = prev[item.id]?.indices || [];
          const next = cur.includes(i) ? cur.filter(x => x !== i) : [...cur, i];
          return { ...prev, [item.id]: { ...prev[item.id], indices: next } };
        });
      };
      const setAnomalyType = (t: string) => {
        setTsAnomalies(prev => ({ ...prev, [item.id]: { ...prev[item.id], type: t } }));
        setAnswers(a => ({ ...a, [item.id]: { ...tsAnomalies[item.id], type: t } }));
      };
      return (
        <div>
          <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 12, color: "#64748b" }}>
            <span>🔌 传感器：<strong style={{ color: "#1e293b" }}>{item.sensorId}</strong></span>
            <span>📅 {item.date}</span>
            <span>⏱ {item.timeRange}</span>
          </div>
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 12px 4px", marginBottom: 14, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <BarChart2 size={13} /> 流量时序曲线（点击柱子标记异常点）
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 80 }}>
              {item.points.map((v: number, i: number) => {
                const h = Math.max(4, (v / maxVal) * 72);
                const isSelected = state.indices.includes(i);
                const isAnomaly = v === 0 || v > maxVal * 0.85;
                return (
                  <div key={i} onClick={() => toggleIdx(i)} title={`T+${i * 10}min: ${v}`}
                    style={{ flex: 1, height: h, borderRadius: "2px 2px 0 0", cursor: "pointer", transition: "opacity 0.15s",
                      background: isSelected ? "#dc2626" : isAnomaly ? "#fbbf24" : "#3b82f6",
                      opacity: isSelected ? 1 : 0.75,
                      outline: isSelected ? "2px solid #dc2626" : "none" }} />
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#94a3b8", marginTop: 3 }}>
              <span>{item.timeRange.split("–")[0]}</span>
              <span>{item.timeRange.split("–")[1]}</span>
            </div>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>
            异常类型{state.indices.length > 0 ? `（已选 ${state.indices.length} 个异常点）` : ""}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {item.anomalyTypes.map((t: string) => (
              <button key={t} onClick={() => setAnomalyType(t)}
                style={{ padding: "6px 12px", borderRadius: 6, border: "2px solid", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  borderColor: state.type === t ? "#0d9488" : "#e2e8f0",
                  background: state.type === t ? "#ccfbf1" : "#fff",
                  color: state.type === t ? "#0d9488" : "#64748b" }}>
                {t}
              </button>
            ))}
          </div>
          {state.indices.length > 0 && state.type && (
            <div style={{ marginTop: 10, padding: "8px 12px", background: "#f0fdf4", borderRadius: 6, fontSize: 12, color: "#15803d", fontWeight: 500 }}>
              ✅ 已标注 {state.indices.length} 个异常点，类型：{state.type}
            </div>
          )}
          {state.indices.length === 0 && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#94a3b8" }}>💡 若无异常，直接点击"保存并继续"跳过</div>
          )}
        </div>
      );
    }

    // 旧模板兼容
    if (template === "text_classify" || template === "sentiment" || template === "behavior_timeline" || template === "event_classify" || template === "anomaly_timeseries") {
      return (
        <div>
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: 20, marginBottom: 20, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>待标注文本</div>
            <div style={{ fontSize: 15, color: "#1e293b", lineHeight: 1.8 }}>{item.text}</div>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 12 }}>{item.question}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {item.options?.map((opt: string) => (
              <button key={opt} onClick={() => setAnswers(a => ({ ...a, [item.id]: opt }))}
                style={{ padding: "12px 16px", borderRadius: 8, border: "2px solid", cursor: "pointer", fontSize: 13, textAlign: "left",
                  borderColor: answers[item.id] === opt ? "#6366f1" : "#e2e8f0",
                  background: answers[item.id] === opt ? "#eef2ff" : "#fff",
                  color: answers[item.id] === opt ? "#6366f1" : "#64748b" }}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (template === "ner") {
      return (
        <div>
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: 20, marginBottom: 20, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>待标注文本（点击词语选择实体类型）</div>
            <div style={{ fontSize: 15, color: "#1e293b", lineHeight: 2 }}>
              {item.tokens?.map((token: string, i: number) => (
                <span key={i}>
                  <button onClick={() => {
                    const types = ["PER", "ORG", "LOC", "MISC"];
                    const cur = nerLabels[`${item.id}-${i}`];
                    const next = cur ? types[(types.indexOf(cur) + 1) % types.length] : types[0];
                    setNerLabels(l => ({ ...l, [`${item.id}-${i}`]: next }));
                  }}
                    style={{ padding: "2px 8px", margin: "0 2px", borderRadius: 4, border: "1px solid", cursor: "pointer", fontSize: 14,
                      borderColor: nerLabels[`${item.id}-${i}`] ? "#6366f1" : "#e2e8f0",
                      background: nerLabels[`${item.id}-${i}`] ? "#eef2ff" : "#fff",
                      color: nerLabels[`${item.id}-${i}`] ? "#6366f1" : "#374151" }}>
                    {token}
                    {nerLabels[`${item.id}-${i}`] && <sup style={{ fontSize: 9, color: "#6366f1", marginLeft: 2 }}>{nerLabels[`${item.id}-${i}`]}</sup>}
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
            {["PER-人名", "ORG-机构", "LOC-地点", "MISC-其他"].map(t => (
              <span key={t} style={{ padding: "4px 8px", borderRadius: 4, background: "#eef2ff", color: "#6366f1", fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </div>
      );
    }

    return <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>暂不支持该标注模板</div>;
  };

  // ─── 保存可用条件 ──────────────────────────────────────────────────────────
  const canSave = (() => {
    if (!item) return false;
    if (template === "rect") return true;
    if (template === "track") return (answers[item.id]?.confirmed?.length || 0) > 0;
    if (template === "segment") return (answers[item.id]?.behaviors?.length || 0) > 0;
    if (template === "event") return !!(answers[item.id]?.type && answers[item.id]?.severity);
    if (template === "timeseries") return true;
    if (template === "ner") return true;
    return !!answers[item.id];
  })();

  const templateMeta: Record<string, { label: string; color: string }> = {
    rect:       { label: "矩形框目标检测", color: "#2563eb" },
    track:      { label: "多目标跟踪标注", color: "#059669" },
    segment:    { label: "时序行为片段", color: "#4f46e5" },
    event:      { label: "事件分类标注", color: "#dc2626" },
    timeseries: { label: "时序异常标注", color: "#0d9488" },
    ner:        { label: "命名实体识别", color: "#6366f1" },
    text_classify: { label: "文本分类", color: "#6366f1" },
  };
  const meta = templateMeta[template] || { label: template, color: "#6366f1" };

  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* 顶部 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.push("/annotation")} style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>
            <ArrowLeft size={16} /> 返回列表
          </button>
          <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
          <h1 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>{job.name}</h1>
          <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: meta.color + "1a", color: meta.color }}>
            <Tag size={11} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
            {meta.label}
          </span>
        </div>
        <div style={{ fontSize: 13, color: "#64748b" }}>
          进度: <strong style={{ color: meta.color }}>{progress}</strong> / {total}
        </div>
      </div>

      {/* 进度条 */}
      <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2, marginBottom: 24 }}>
        <div style={{ height: "100%", width: `${total > 0 ? (progress / total) * 100 : 0}%`, background: meta.color, borderRadius: 2, transition: "width 0.3s" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        {/* 标注主区域 */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>第 {current + 1} / {total} 条</span>
            {saved[item?.id] && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
                <CheckCircle2 size={14} /> 已保存
              </span>
            )}
          </div>

          {renderAnnotationArea()}

          {/* 操作按钮 */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", cursor: current === 0 ? "not-allowed" : "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6, color: "#64748b", opacity: current === 0 ? 0.5 : 1 }}>
                <ChevronLeft size={14} /> 上一条
              </button>
              <button onClick={() => setAnswers(a => { const n = { ...a }; delete n[item?.id]; return n; })}
                style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6, color: "#64748b" }}>
                <RotateCcw size={14} /> 重置
              </button>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setCurrent(c => Math.min(items.length - 1, c + 1))} disabled={current === items.length - 1}
                style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", cursor: current === items.length - 1 ? "not-allowed" : "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6, color: "#64748b", opacity: current === items.length - 1 ? 0.5 : 1 }}>
                跳过 <SkipForward size={14} />
              </button>
              <button onClick={handleSave} disabled={!canSave}
                style={{ padding: "8px 24px", borderRadius: 6, background: canSave ? meta.color : "#94a3b8", color: "#fff", border: "none", cursor: canSave ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <Save size={14} /> 保存并继续
              </button>
            </div>
          </div>
        </div>

        {/* 右侧面板 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* 任务信息 */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 12 }}>任务信息</div>
            {[
              { label: "数据集", value: job.dataset_name },
              { label: "标注类型", value: job.task_type },
              { label: "标注人员", value: job.annotators?.join(", ") || "未分配" },
              { label: "Kappa 系数", value: job.kappa_score ? job.kappa_score.toFixed(2) : "—" },
            ].map(i => (
              <div key={i.label} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{i.label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{i.value}</div>
              </div>
            ))}
          </div>

          {/* 标注进度导航 */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 12 }}>标注进度</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {items.map((it, i) => (
                <button key={it.id} onClick={() => setCurrent(i)}
                  style={{ width: 32, height: 32, borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                    background: saved[it.id] ? "#dcfce7" : i === current ? meta.color : "#f1f5f9",
                    color: saved[it.id] ? "#16a34a" : i === current ? "#fff" : "#64748b" }}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* 快捷键 */}
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 8 }}>快捷键</div>
            {[["←/→", "上/下一条"], ["Space", "保存并继续"], ["R", "重置标注"]].map(([key, desc]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                <code style={{ background: "#e2e8f0", padding: "1px 6px", borderRadius: 3, color: "#475569" }}>{key}</code>
                <span style={{ color: "#64748b" }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
