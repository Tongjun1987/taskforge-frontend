"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle,
  Save, SkipForward, RotateCcw, Tag, Box, Activity, Zap, BarChart2,
  Video,
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
// ─── 各模板 Mock 数据（按 annotation_type key，每模板含多种子类型） ──────────────
const MOCK_ITEMS: Record<string, any[]> = {
  // ════════════════════════════════════════════════════════
  // 文本标注（5种：文本分类 / NER / 关系抽取 / 情感分析 / 问答）
  // ════════════════════════════════════════════════════════
  text_classify: [
    { id: 1, type: "text_classify", text: "央行宣布下调存款准备金率0.5个百分点，释放长期资金约1万亿元，以支持实体经济发展", question: "新闻主题分类", options: ["宏观经济", "金融市场", "产业政策", "国际关系", "社会民生"] },
    { id: 2, type: "text_classify", text: "某城市全面推广垃圾分类，新建智能回收站点300余个，覆盖率达到85%", question: "新闻主题分类", options: ["宏观经济", "金融市场", "产业政策", "国际关系", "社会民生"] },
    { id: 3, type: "text_classify", text: "人工智能在医疗影像诊断领域的应用取得突破，诊断准确率达到96%", question: "新闻主题分类", options: ["宏观经济", "金融市场", "产业政策", "国际关系", "社会民生"] },
  ],
  ner: [
    { id: 1, type: "ner", text: "北京理工大学教授李明在2026年人工智能大会上发表了重要演讲，介绍了在城市交通场景中的应用", tokens: ["北京理工大学", "李明", "2026年人工智能大会", "城市交通场景"], entityTypes: ["ORG", "PER", "EVENT", "LOC"] },
    { id: 2, type: "ner", text: "腾讯公司CEO马化腾在深圳总部宣布推出新一代智能驾驶系统，与华为公司达成战略合作", tokens: ["腾讯公司", "马化腾", "深圳总部", "华为公司"], entityTypes: ["ORG", "PER", "LOC", "ORG"] },
    { id: 3, type: "ner", text: "上海市浦东新区率先试点智能网联汽车上路测试，百度Apollo获得首批牌照", tokens: ["上海市浦东新区", "百度Apollo"], entityTypes: ["LOC", "ORG"] },
  ],
  relation_extract: [
    { id: 1, type: "relation_extract", text: "马云创办了阿里巴巴集团，阿里巴巴集团收购了饿了么，饿了么与美团存在竞争关系", relations: [{ from: "马云", to: "阿里巴巴集团", rel: "创始人" }, { from: "阿里巴巴集团", to: "饿了么", rel: "收购" }] },
    { id: 2, type: "relation_extract", text: "华为公司发布了Mate70手机，该手机搭载了华为自研的麒麟芯片", relations: [{ from: "华为公司", to: "Mate70手机", rel: "发布" }, { from: "华为公司", to: "麒麟芯片", rel: "研发" }] },
    { id: 3, type: "relation_extract", text: "比亚迪汽车与宁德时代签订了动力电池采购协议，比亚迪同时布局了轨道交通业务", relations: [{ from: "比亚迪汽车", to: "宁德时代", rel: "采购商" }] },
  ],
  sentiment: [
    { id: 1, type: "sentiment", text: "经过三个月的紧张研发，我们的智能驾驶系统终于实现了城市道路全程自动驾驶，太激动了！", question: "情感倾向分析", options: ["非常正面", "正面", "中性", "负面", "非常负面"] },
    { id: 2, type: "sentiment", text: "产品用户体验极差，客服态度恶劣，完全不值得购买，强烈建议大家避坑。", question: "情感倾向分析", options: ["非常正面", "正面", "中性", "负面", "非常负面"] },
    { id: 3, type: "sentiment", text: "说实话，这个功能有进步，但还有很多地方需要改进，暂时观望吧。", question: "情感倾向分析", options: ["非常正面", "正面", "中性", "负面", "非常负面"] },
  ],
  qa: [
    { id: 1, type: "qa", text: "人工智能在自动驾驶领域面临哪些主要技术挑战？自动驾驶的安全性问题如何解决？", answer: "技术挑战包括感知精度、复杂场景决策、长尾问题等；安全性通过冗余感知、仿真测试、法规约束等多维度保障。" },
    { id: 2, type: "qa", text: "什么是大语言模型？它和传统AI模型有什么区别？", answer: "大语言模型是基于海量文本数据训练的超大规模神经网络模型，参数规模从数十亿到上千亿不等，能够理解和生成自然语言，具备涌现能力。" },
    { id: 3, type: "qa", text: "智能交通系统包含哪些核心组成部分？", answer: "核心包括感知层（传感器/摄像头）、通信层（C-V2X/5G）、决策层（AI算法）和执行层（信号控制/车辆协同）。" },
  ],

  // ════════════════════════════════════════════════════════
  // 图像标注（5种：矩形框 / 多边形 / 关键点 / OCR / 图像分类）
  // ════════════════════════════════════════════════════════
  rect: [
    { id: 1, type: "rect", scene: "高速公路俯拍", hint: "请框选图中所有车辆类型", labels: ["小汽车", "客车", "货车", "危化品车", "摩托车"] },
    { id: 2, type: "rect", scene: "城市路口俯拍", hint: "请框选图中所有交通目标", labels: ["小汽车", "客车", "货车", "摩托车", "行人", "非机动车"] },
    { id: 3, type: "rect", scene: "停车场入口", hint: "请框选图中所有车辆", labels: ["小汽车", "客车", "货车"] },
  ],
  polygon: [
    { id: 1, type: "polygon", scene: "城市道路全景", hint: "请沿道路边界绘制多边形区域", labels: ["机动车道", "非机动车道", "人行道", "绿化带"] },
    { id: 2, type: "polygon", scene: "建筑俯拍图", hint: "请标注图中不同建筑区域", labels: ["商业建筑", "居民楼", "公共设施", "停车场"] },
    { id: 3, type: "polygon", scene: "机场航拍图", hint: "请标注跑道、停机坪、航站楼等区域", labels: ["跑道", "停机坪", "航站楼", "塔台"] },
  ],
  keypoint: [
    { id: 1, type: "keypoint", scene: "行人姿态样例", hint: "请标注文中人体17个关键点", keypoints: ["鼻子", "左眼", "右眼", "左耳", "右耳", "左肩", "右肩", "左肘", "右肘", "左腕", "右腕", "左髋", "右髋", "左膝", "右膝", "左踝", "右踝"] },
    { id: 2, type: "keypoint", scene: "人体骨骼标注", hint: "请按顺序标注17个关键点", keypoints: ["鼻子", "左眼", "右眼", "左耳", "右耳", "左肩", "右肩", "左肘", "右肘", "左腕", "右腕", "左髋", "右髋", "左膝", "右膝", "左踝", "右踝"] },
    { id: 3, type: "keypoint", scene: "运动姿态捕捉", hint: "请标注人体运动时的关键节点", keypoints: ["头", "颈", "左肩", "右肩", "左肘", "右肘", "左手", "右手", "髋部", "左膝", "右膝", "左脚", "右脚"] },
  ],
  ocr: [
    { id: 1, type: "ocr", scene: "交通标志牌", hint: "请转写图中所有文字", imageDesc: "一块圆形红色禁令标志，中心有白底黑字限速60" },
    { id: 2, type: "ocr", scene: "路牌拍摄图", hint: "请识别图中所有文字内容", imageDesc: "蓝底白字指示牌，显示G60沪昆高速入口方向" },
    { id: 3, type: "ocr", scene: "车牌抓拍图", hint: "请识别图中车牌号码", imageDesc: "监控摄像头抓拍到一辆白色轿车，车牌号粤B12345" },
  ],
  image_classify: [
    { id: 1, type: "classify", scene: "天气场景", hint: "请选择图像天气类型", labels: ["晴天", "多云", "雨天", "雪天", "雾霾", "沙尘暴"] },
    { id: 2, type: "classify", scene: "道路场景", hint: "请选择道路类型", labels: ["高速公路", "城市主干道", "乡村道路", "山路", "隧道", "桥梁"] },
    { id: 3, type: "classify", scene: "光照场景", hint: "请选择光照条件", labels: ["白天强光", "白天正常", "黄昏", "夜间有灯", "夜间无灯", "逆光"] },
  ],

  // ════════════════════════════════════════════════════════
  // 视频标注（3种：目标跟踪 / 时序行为 / 事件分类）
  // ════════════════════════════════════════════════════════
  track: [
    { id: 1, type: "track", scene: "视频帧 001-050", duration: "0:00–0:05", tracks: [{ id: "T01", type: "小汽车", color: "#2563eb" }, { id: "T02", type: "行人", color: "#16a34a" }, { id: "T03", type: "摩托车", color: "#d97706" }] },
    { id: 2, type: "track", scene: "视频帧 051-100", duration: "0:05–0:10", tracks: [{ id: "T04", type: "公交车", color: "#7c3aed" }, { id: "T05", type: "非机动车", color: "#0891b2" }, { id: "T06", type: "小汽车", color: "#2563eb" }] },
    { id: 3, type: "track", scene: "视频帧 101-150", duration: "0:10–0:15", tracks: [{ id: "T07", type: "货车", color: "#dc2626" }, { id: "T08", type: "行人", color: "#16a34a" }, { id: "T09", type: "小汽车", color: "#2563eb" }] },
    { id: 4, type: "track", scene: "视频帧 151-200", duration: "0:15–0:20", tracks: [{ id: "T10", type: "摩托车", color: "#d97706" }, { id: "T11", type: "小汽车", color: "#2563eb" }] },
  ],
  segment: [
    { id: 1, type: "behavior", clip: "clip_001.mp4", duration: "00:00 – 00:08", thumbnail: "路口左转场景", behaviors: ["正常行驶", "急刹车", "违规变道", "超速行驶", "闯红灯", "逆行", "占用应急车道", "违规停车"] },
    { id: 2, type: "behavior", clip: "clip_002.mp4", duration: "00:08 – 00:16", thumbnail: "人行横道场景", behaviors: ["正常行驶", "急刹车", "违规变道", "超速行驶", "闯红灯", "逆行", "占用应急车道", "违规停车"] },
    { id: 3, type: "behavior", clip: "clip_003.mp4", duration: "00:16 – 00:24", thumbnail: "高速匝道场景", behaviors: ["正常行驶", "急刹车", "违规变道", "超速行驶", "闯红灯", "逆行", "占用应急车道", "违规停车"] },
    { id: 4, type: "behavior", clip: "clip_004.mp4", duration: "00:24 – 00:32", thumbnail: "隧道内场景", behaviors: ["正常行驶", "急刹车", "违规变道", "超速行驶", "闯红灯", "逆行", "占用应急车道", "违规停车"] },
  ],
  event: [
    { id: 1, type: "event", eventId: "EVT-20260417-001", time: "2026-04-17 08:23:14", location: "G60高速K42+300", description: "两辆小型车追尾碰撞，车辆横跨应急车道", eventTypes: ["追尾碰撞", "侧面碰撞", "正面碰撞", "翻车事故", "路面障碍", "违章停车", "逆向行驶", "大面积拥堵", "异常行人"], severities: ["轻微", "一般", "严重", "特别严重"] },
    { id: 2, type: "event", eventId: "EVT-20260417-002", time: "2026-04-17 09:45:02", location: "城市快速路出口匝道", description: "货车侧翻，货物撒落路面，交通完全中断", eventTypes: ["追尾碰撞", "侧面碰撞", "正面碰撞", "翻车事故", "路面障碍", "违章停车", "逆向行驶", "大面积拥堵", "异常行人"], severities: ["轻微", "一般", "严重", "特别严重"] },
    { id: 3, type: "event", eventId: "EVT-20260417-003", time: "2026-04-17 11:10:55", location: "主干道路口", description: "行人闯红灯穿越，与右转电动车轻微碰撞", eventTypes: ["追尾碰撞", "侧面碰撞", "正面碰撞", "翻车事故", "路面障碍", "违章停车", "逆向行驶", "大面积拥堵", "异常行人"], severities: ["轻微", "一般", "严重", "特别严重"] },
    { id: 4, type: "event", eventId: "EVT-20260417-004", time: "2026-04-17 14:32:08", location: "高速隧道入口", description: "施工标志缺失，车辆避让造成多车追尾", eventTypes: ["追尾碰撞", "侧面碰撞", "正面碰撞", "翻车事故", "路面障碍", "违章停车", "逆向行驶", "大面积拥堵", "异常行人"], severities: ["轻微", "一般", "严重", "特别严重"] },
  ],

  // ════════════════════════════════════════════════════════
  // 音频标注（1种）
  // ════════════════════════════════════════════════════════
  audio_classify: [
    { id: 1, type: "audio_classify", audioName: "sample_001.wav", duration: "3.2s", transcribe: "前方道路施工，请注意减速慢行", labels: ["导航语音", "交通广播", "车载指令", "环境音", "鸣笛声"] },
    { id: 2, type: "audio_classify", audioName: "sample_002.wav", duration: "5.8s", transcribe: "请注意，前方200米有交通事故，请提前变道", labels: ["导航语音", "交通广播", "车载指令", "环境音", "鸣笛声"] },
    { id: 3, type: "audio_classify", audioName: "sample_003.wav", duration: "2.1s", transcribe: "叮～后车请您注意保持车距", labels: ["导航语音", "交通广播", "车载指令", "环境音", "鸣笛声"] },
    { id: 4, type: "audio_classify", audioName: "sample_004.wav", duration: "8.5s", transcribe: "限速120，请勿超速行驶，连续驾驶超过4小时请进入服务区休息", labels: ["导航语音", "交通广播", "车载指令", "环境音", "鸣笛声"] },
  ],

  // ════════════════════════════════════════════════════════
  // 点云三维标注（1种）
  // ════════════════════════════════════════════════════════
  pointcloud_det: [
    { id: 1, type: "pointcloud_det", scanName: "scan_001.pcd", frame: "Frame 1 / 200", objects: [{ label: "Car", points: 2847 }, { label: "Pedestrian", points: 412 }, { label: "Cyclist", points: 189 }] },
    { id: 2, type: "pointcloud_det", scanName: "scan_002.pcd", frame: "Frame 2 / 200", objects: [{ label: "Car", points: 3102 }, { label: "Car", points: 2654 }, { label: "Truck", points: 4521 }] },
    { id: 3, type: "pointcloud_det", scanName: "scan_003.pcd", frame: "Frame 3 / 200", objects: [{ label: "Van", points: 2103 }, { label: "Pedestrian", points: 388 }, { label: "TrafficCone", points: 45 }] },
    { id: 4, type: "pointcloud_det", scanName: "scan_004.pcd", frame: "Frame 4 / 200", objects: [{ label: "Car", points: 3245 }, { label: "Bus", points: 5120 }, { label: "Cyclist", points: 201 }] },
  ],

  // ════════════════════════════════════════════════════════
  // 多模态对齐标注（1种）
  // ════════════════════════════════════════════════════════
  image_text_align: [
    { id: 1, type: "image_text_align", imageDesc: "一辆红色SUV行驶在高速公路上，前方天气晴朗，视野开阔", caption: "一辆红色SUV在晴朗天气下高速行驶", alignOptions: ["相符", "部分相符", "不相符"] },
    { id: 2, type: "image_text_align", imageDesc: "城市路口，行人正在闯红灯穿过斑马线，多辆汽车等待", caption: "城市路口交通状况，行人按信号灯通行", alignOptions: ["相符", "部分相符", "不相符"] },
    { id: 3, type: "image_text_align", imageDesc: "雨天夜晚，道路湿滑，多辆车发生连环追尾", caption: "雨夜道路发生交通事故", alignOptions: ["相符", "部分相符", "不相符"] },
    { id: 4, type: "image_text_align", imageDesc: "隧道内车辆有序通行，灯光照明良好，无异常情况", caption: "白天隧道内正常交通", alignOptions: ["相符", "部分相符", "不相符"] },
  ],

  // ════════════════════════════════════════════════════════
  // SFT监督微调标注（1种）
  // ════════════════════════════════════════════════════════
  sft: [
    { id: 1, type: "sft", instruction: "请将以下中文句子翻译成英文", input: "人工智能正在深刻改变我们的生活方式。", output: "Artificial intelligence is profoundly changing the way we live." },
    { id: 2, type: "sft", instruction: "请判断以下新闻标题属于哪个类别", input: "央行再次降准释放流动性，A股应声大涨", output: "宏观经济" },
    { id: 3, type: "sft", instruction: "请续写以下句子", input: "在自动驾驶领域，安全永远是第一位的，", output: "任何技术的研发和应用都必须以保障人身安全为前提。当前，我们需要在算法可靠性、传感器精度和法规完善等方面持续发力，才能真正实现无人驾驶的规模化落地。" },
    { id: 4, type: "sft", instruction: "请总结以下段落的主要内容", input: "本文研究了基于深度学习的交通流预测方法。通过在真实数据集上的实验表明，该方法相比传统ARIMA模型在预测精度上提升了23%。", output: "本文提出基于深度学习的交通流预测方法，实验证明该方法相比ARIMA模型精度提升23%。" },
  ],

  // ════════════════════════════════════════════════════════
  // DPO偏好优化标注（1种）
  // ════════════════════════════════════════════════════════
  dpo: [
    { id: 1, type: "dpo", prompt: "请解释量子计算的基本原理", input: "", chosen: "量子计算利用量子叠加和量子纠缠的特性，通过量子比特（qubit）而非传统二进制比特进行计算。相比经典比特的0或1状态，量子比特可以同时处于多种状态，这使得量子计算机在处理某些特定问题上（如大数分解、药物研发、密码破解）具有指数级的速度优势。", rejected: "量子计算就是用量子做的计算，比普通计算机快很多。" },
    { id: 2, type: "dpo", prompt: "如何用Python实现快速排序？", input: "", chosen: "def quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + middle + quicksort(right)", rejected: "用sort函数排序最快。" },
    { id: 3, type: "dpo", prompt: "总结这篇论文的主要贡献", input: "本文提出了一种基于Transformer架构的图像分割新方法，在COCO数据集上实现了42.5%的mIoU。", chosen: "本文提出了一种基于Transformer的图像分割新方法，在COCO数据集上达到42.5% mIoU，显著优于以往方法。", rejected: "这篇论文讲的是图像分割。" },
  ],

  // ════════════════════════════════════════════════════════
  // PPO/RLHF样本构建（1种）
  // ════════════════════════════════════════════════════════
  ppo: [
    { id: 1, type: "ppo", response: "人工智能确实很有用，但也存在风险。", dimensions: ["帮助性", "安全性", "准确性", "清晰度"], scores: [4, 5, 4, 4] },
    { id: 2, type: "ppo", response: "建议你每天运动30分钟，保持健康的饮食习惯，多吃蔬菜水果，保证充足睡眠。这样可以有效提升身体素质和免疫力。", dimensions: ["帮助性", "安全性", "准确性", "清晰度"], scores: [5, 5, 5, 5] },
    { id: 3, type: "ppo", response: "要减肥就必须完全断食，坚持每天跑10公里，不吃任何碳水化合物，服用减肥药加速效果。", dimensions: ["帮助性", "安全性", "准确性", "清晰度"], scores: [3, 1, 2, 3] },
    { id: 4, type: "ppo", response: "量子计算是一种利用量子力学原理进行信息处理的新型计算范式，它在密码破译、药物设计、优化问题等领域有重要应用前景。", dimensions: ["帮助性", "安全性", "准确性", "清晰度"], scores: [4, 5, 4, 5] },
  ],

  // ════════════════════════════════════════════════════════
  // CoT思维链推理标注（1种）
  // ════════════════════════════════════════════════════════
  cot: [
    { id: 1, type: "cot", question: "某公司去年收入100万元，今年收入比去年增长20%，则今年收入是多少？", reasoning: ["第一步：计算增长量 = 100万 × 20% = 20万", "第二步：今年收入 = 去年收入 + 增长量 = 100万 + 20万 = 120万"], answer: "120万元" },
    { id: 2, type: "cot", question: "小明有5个苹果，小红给了他3个，小明吃掉了2个，还剩多少个？", reasoning: ["初始：5个苹果", "小红给了3个 → 5 + 3 = 8个", "吃掉了2个 → 8 - 2 = 6个"], answer: "6个" },
    { id: 3, type: "cot", question: "在交通场景中，为什么雨天的事故率通常高于晴天？", reasoning: ["首先：雨天路面湿滑，摩擦力减小，刹车距离延长", "其次：雨水影响驾驶员视野，降低可见度", "再次：雨水可能导致积水，车辆容易打滑失控", "综合以上因素，雨天驾驶风险更高，事故率上升"], answer: "因路面湿滑、视野下降、车辆打滑等因素" },
    { id: 4, type: "cot", question: "一辆车以60km/h行驶，刹车后加速度为-10m/s²，刹车距离是多少？", reasoning: ["首先：60km/h = 60/3.6 ≈ 16.67m/s", "根据 v² = 2as，0 = 16.67² + 2×(-10)×s", "计算：s = 16.67² / (2×10) = 277.89 / 20 ≈ 13.9m"], answer: "约13.9米" },
  ],

  // ════════════════════════════════════════════════════════
  // ToT树状推理标注（1种）
  // ════════════════════════════════════════════════════════
  tot: [
    { id: 1, type: "tot", question: "如何优化城市交通拥堵问题？", branches: [
      { path: "A. 供给侧→增加道路→新建高架", pro: "直接增加通行能力", con: "成本高、周期长、占用土地" },
      { path: "B. 供给侧→公共交通→地铁扩建", pro: "减少私家车出行", con: "投资大、需要规划时间" },
      { path: "C. 需求侧→限行限购→单双号限行", pro: "直接减少车辆数量", con: "影响市民出行便利性" },
      { path: "D. 需求侧→智慧调度→信号优化", pro: "无需大规模建设", con: "效果依赖数据质量" },
    ] },
    { id: 2, type: "tot", question: "自动驾驶车辆在发生事故时应该如何决策？", branches: [
      { path: "A. 保护车内乘客优先", pro: "符合车辆安全设计原则", con: "可能伤害行人" },
      { path: "B. 保护行人优先", pro: "减少对弱势群体的伤害", con: "乘客安全风险增加" },
      { path: "C. 最小化总体伤亡", pro: "综合最优解", con: "道德判断标准不统一" },
    ] },
    { id: 3, type: "tot", question: "企业是否应该部署大模型？需要考虑哪些因素？", branches: [
      { path: "A. 技术可行性→自研大模型", pro: "数据安全可控", con: "研发成本极高、技术门槛高" },
      { path: "B. 技术可行性→采购商业API", pro: "快速部署、成本低", con: "数据出境风险、依赖供应商" },
      { path: "C. 技术可行性→开源模型本地部署", pro: "平衡成本与安全", con: "运维复杂、性能有限" },
    ] },
  ],

  // ════════════════════════════════════════════════════════
  // GoT图状推理标注（1种）
  // ════════════════════════════════════════════════════════
  got: [
    { id: 1, type: "got", question: "分析以下事件链的因果关系：降雨→路面湿滑→刹车距离延长→追尾事故→交通拥堵", nodes: [
      { id: "N1", label: "降雨", type: "原因" },
      { id: "N2", label: "路面湿滑", type: "中间" },
      { id: "N3", label: "刹车距离延长", type: "中间" },
      { id: "N4", label: "追尾事故", type: "事件" },
      { id: "N5", label: "交通拥堵", type: "结果" },
    ], edges: [
      { from: "N1", to: "N2", label: "导致" },
      { from: "N2", to: "N3", label: "引起" },
      { from: "N3", to: "N4", label: "造成" },
      { from: "N4", to: "N5", label: "引发" },
    ] },
    { id: 2, type: "got", question: "交通事故处理流程图", nodes: [
      { id: "N1", label: "事故发生", type: "起点" },
      { id: "N2", label: "报警与记录", type: "处理" },
      { id: "N3", label: "伤员救治", type: "处理" },
      { id: "N4", label: "现场勘查", type: "处理" },
      { id: "N5", label: "责任认定", type: "决策" },
      { id: "N6", label: "保险理赔", type: "结果" },
    ], edges: [
      { from: "N1", to: "N2", label: "同时" },
      { from: "N1", to: "N3", label: "同时" },
      { from: "N2", to: "N4", label: "后续" },
      { from: "N3", to: "N4", label: "协同" },
      { from: "N4", to: "N5", label: "完成后" },
      { from: "N5", to: "N6", label: "触发" },
    ] },
    { id: 3, type: "got", question: "分析：数据质量问题如何影响AI模型性能？", nodes: [
      { id: "N1", label: "数据标注错误", type: "原因" },
      { id: "N2", label: "训练数据偏差", type: "中间" },
      { id: "N3", label: "模型学到错误模式", type: "中间" },
      { id: "N4", label: "预测结果偏差", type: "结果" },
      { id: "N5", label: "业务决策失误", type: "结果" },
    ], edges: [
      { from: "N1", to: "N2", label: "导致" },
      { from: "N2", to: "N3", label: "造成" },
      { from: "N3", to: "N4", label: "引起" },
      { from: "N4", to: "N5", label: "引发" },
    ] },
  ],
};

// 模板 → 注解类型映射（label_template → 对应的 annotation_type）
const TEMPLATE_ATYPE_MAP: Record<string, string> = {
  text_annotation:   "text_classify",
  image_annotation: "rect",
  video_annotation: "track",
  audio_annotation: "audio_classify",
  pointcloud_anno:  "pointcloud_det",
  multimodal_anno:  "image_text_align",
  sft_annotation:   "sft",
  dpo_annotation:   "dpo",
  ppo_annotation:   "ppo",
  cot_annotation:   "cot",
  tot_annotation:   "tot",
  got_annotation:   "got",
};

function getItems(template: string, annotationType?: string) {
  // 优先用 annotation_type（最精确）
  if (annotationType && MOCK_ITEMS[annotationType]) return MOCK_ITEMS[annotationType];
  // 其次用 label_template（模板名）
  if (MOCK_ITEMS[template]) return MOCK_ITEMS[template];
  // 再尝试通过模板名映射到 annotation_type
  const mapped = TEMPLATE_ATYPE_MAP[template];
  if (mapped && MOCK_ITEMS[mapped]) return MOCK_ITEMS[mapped];
  return MOCK_ITEMS["text_classify"];
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
  // 新模板状态（必须提升到组件顶层，避免 hooks 规则违规）
  const [selKp, setSelKp] = useState<string | null>(null);
  const [playState, setPlayState] = useState<"play" | "pause">("pause");
  const [selectedObj, setSelectedObj] = useState<string | null>(null);
  const [cotStepIdx, setCotStepIdx] = useState(0);
  const [totSelBranch, setTotSelBranch] = useState<string | null>(null);
  const [sftRating, setSftRating] = useState(0);
  const [dpoPref, setDpoPref] = useState<string | null>(null);
  const [activeSeg, setActiveSeg] = useState<number | null>(null);

  useEffect(() => {
    const all = getJobs();
    const found = all.find((j: any) => j.id === id);
    setJob(found || null);
    const template = found?.label_template || "text_classify";
    setItems(getItems(template, found?.annotation_type));
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

    // ══════════════════════════════════════════════════════════════
    // 以下为新增的 9 个模板 UI（覆盖全部 12 个模板）
    // ══════════════════════════════════════════════════════════════

    // ── 新增子类型：关系抽取（可逐条确认/驳回/修改关系类型）────────────────────
    if (template === "relation_extract") {
      const relState: Record<number, "ok" | "reject" | null> = answers[item.id]?.relState || {};
      const setRelState = (i: number, v: "ok" | "reject" | null) => {
        setAnswers(a => ({
          ...a,
          [item.id]: { ...a[item.id], relState: { ...(a[item.id]?.relState || {}), [i]: v } }
        }));
      };
      const relTypeOptions = ["属于", "作用于", "导致", "同义", "上下位", "对立", "包含", "发生于"];
      const setRelType = (i: number, t: string) => {
        setAnswers(a => ({
          ...a,
          [item.id]: { ...a[item.id], relTypes: { ...(a[item.id]?.relTypes || {}), [i]: t } }
        }));
      };
      const confirmed = Object.values(relState).filter(v => v === "ok").length;
      return (
        <div>
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: 20, marginBottom: 20, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>待分析文本（逐条核对关系三元组）</div>
            <div style={{ fontSize: 15, color: "#1e293b", lineHeight: 2 }}>{item.text}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", margin: 0 }}>关系三元组（共 {(item.relations || []).length} 条）</p>
            {confirmed > 0 && <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>✓ 已确认 {confirmed} 条</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(item.relations || []).map((rel: any, i: number) => {
              const state = relState[i];
              const curType = answers[item.id]?.relTypes?.[i] || rel.rel;
              return (
                <div key={i} style={{ borderRadius: 10, border: `2px solid ${state === "ok" ? "#16a34a" : state === "reject" ? "#dc2626" : "#e2e8f0"}`, background: state === "ok" ? "#f0fdf4" : state === "reject" ? "#fef2f2" : "#fff", padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ padding: "3px 10px", borderRadius: 4, background: "#dbeafe", color: "#2563eb", fontWeight: 700, fontSize: 13 }}>{rel.from}</span>
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>→</span>
                    <span style={{ padding: "3px 10px", borderRadius: 4, background: "#fce7f3", color: "#db2777", fontWeight: 700, fontSize: 13 }}>{rel.to}</span>
                    <div style={{ flex: 1 }} />
                    <select value={curType} onChange={e => setRelType(i, e.target.value)}
                      style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, color: "#475569", background: "#fff", cursor: "pointer" }}>
                      {relTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setRelState(i, state === "ok" ? null : "ok")}
                      style={{ flex: 1, padding: "7px", borderRadius: 6, border: "1px solid", cursor: "pointer", fontSize: 12, fontWeight: 600,
                        borderColor: state === "ok" ? "#16a34a" : "#e2e8f0",
                        background: state === "ok" ? "#dcfce7" : "#fff",
                        color: state === "ok" ? "#16a34a" : "#64748b" }}>
                      ✓ 确认正确
                    </button>
                    <button onClick={() => setRelState(i, state === "reject" ? null : "reject")}
                      style={{ flex: 1, padding: "7px", borderRadius: 6, border: "1px solid", cursor: "pointer", fontSize: 12, fontWeight: 600,
                        borderColor: state === "reject" ? "#dc2626" : "#e2e8f0",
                        background: state === "reject" ? "#fee2e2" : "#fff",
                        color: state === "reject" ? "#dc2626" : "#64748b" }}>
                      ✗ 标记错误
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ── 新增子类型：问答标注 ──────────────────────────────
    if (template === "qa") {
      return (
        <div>
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: 20, marginBottom: 16, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>问题</div>
            <div style={{ fontSize: 15, color: "#1e293b", fontWeight: 600, lineHeight: 1.7 }}>{item.text}</div>
          </div>
          <div style={{ background: "#eff6ff", borderRadius: 10, padding: 16, border: "1px solid #bfdbfe" }}>
            <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 600, marginBottom: 8 }}>参考答案</div>
            <div style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{item.answer}</div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>审核结果</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["完全正确", "基本正确", "有错误"].map(label => (
                <button key={label} onClick={() => setAnswers(a => ({ ...a, [item.id]: label }))}
                  style={{ flex: 1, padding: "10px", borderRadius: 8, border: "2px solid", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    borderColor: answers[item.id] === label ? "#2563eb" : "#e2e8f0",
                    background: answers[item.id] === label ? "#eff6ff" : "#fff",
                    color: answers[item.id] === label ? "#2563eb" : "#64748b" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ① 文本标注（覆盖 NER / 关系抽取 / 情感分析 / 问答 / 文本分类）
    if (template === "text_annotation") {
      if (item.type === "relation_extract") {
        return (
          <div>
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: 20, marginBottom: 20, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>待分析文本（请标注意体间关系）</div>
              <div style={{ fontSize: 15, color: "#1e293b", lineHeight: 2 }}>{item.text}</div>
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 12 }}>关系三元组标注</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(item.relations || []).map((rel: any, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <span style={{ padding: "3px 10px", borderRadius: 4, background: "#dbeafe", color: "#2563eb", fontWeight: 700, fontSize: 13 }}>{rel.from}</span>
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>─{rel.rel}→</span>
                  <span style={{ padding: "3px 10px", borderRadius: 4, background: "#fce7f3", color: "#db2777", fontWeight: 700, fontSize: 13 }}>{rel.to}</span>
                  <span style={{ marginLeft: "auto", color: "#64748b", fontSize: 12 }}>{rel.rel}</span>
                  <CheckCircle2 size={14} color="#16a34a" />
                </div>
              ))}
            </div>
          </div>
        );
      }
      if (item.type === "qa") {
        return (
          <div>
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: 20, marginBottom: 16, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>问题</div>
              <div style={{ fontSize: 15, color: "#1e293b", fontWeight: 600, lineHeight: 1.7 }}>{item.text}</div>
            </div>
            <div style={{ background: "#eff6ff", borderRadius: 10, padding: 16, border: "1px solid #bfdbfe", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 600, marginBottom: 8 }}>参考答案</div>
              <div style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{item.answer}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["完全正确", "基本正确", "有错误"].map(label => (
                <button key={label} onClick={() => setAnswers(a => ({ ...a, [item.id]: label }))}
                  style={{ flex: 1, padding: "10px", borderRadius: 8, border: "2px solid", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    borderColor: answers[item.id] === label ? "#2563eb" : "#e2e8f0",
                    background: answers[item.id] === label ? "#eff6ff" : "#fff",
                    color: answers[item.id] === label ? "#2563eb" : "#64748b" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        );
      }
      if (item.type === "ner") {
        const types = ["PER", "ORG", "LOC", "EVENT"];
        return (
          <div>
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: 20, marginBottom: 20, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>命名实体识别 — 点击词语选择实体类型</div>
              <div style={{ fontSize: 15, color: "#1e293b", lineHeight: 2 }}>
                {item.tokens?.map((token: string, i: number) => {
                  const key = `${item.id}-${i}`;
                  const cur = nerLabels[key] || types[0];
                  return (
                    <button key={i} onClick={() => {
                      const idx = types.indexOf(nerLabels[key] || types[0]);
                      setNerLabels(l => ({ ...l, [key]: types[(idx + 1) % types.length] }));
                    }} style={{ padding: "2px 8px", margin: "0 2px", borderRadius: 4, border: "1px solid", cursor: "pointer", fontSize: 14,
                      borderColor: nerLabels[key] ? "#2563eb" : "#e2e8f0",
                      background: nerLabels[key] ? "#eff6ff" : "#fff",
                      color: nerLabels[key] ? "#2563eb" : "#374151" }}>
                      {token}<sup style={{ fontSize: 9, color: "#2563eb", marginLeft: 2 }}>{nerLabels[key] || ""}</sup>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
              {types.map(t => <span key={t} style={{ padding: "4px 8px", borderRadius: 4, background: "#eff6ff", color: "#2563eb", fontWeight: 600 }}>{t}</span>)}
            </div>
          </div>
        );
      }
      // sentiment / text_classify
      const opts = item.options || ["正面", "负面", "中性"];
      return (
        <div>
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: 20, marginBottom: 20, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>{item.question || "请标注文本"}</div>
            <div style={{ fontSize: 15, color: "#1e293b", lineHeight: 1.8 }}>{item.text}</div>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 12 }}>{item.question}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {opts.map((opt: string) => (
              <button key={opt} onClick={() => setAnswers(a => ({ ...a, [item.id]: opt }))}
                style={{ padding: "12px 16px", borderRadius: 8, border: "2px solid", cursor: "pointer", fontSize: 13, textAlign: "left",
                  borderColor: answers[item.id] === opt ? "#2563eb" : "#e2e8f0",
                  background: answers[item.id] === opt ? "#eff6ff" : "#fff",
                  color: answers[item.id] === opt ? "#2563eb" : "#64748b" }}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // ② 图像标注
    if (template === "image_annotation") {
      if (item.type === "rect") {
        return <RectAnnotation item={item} answers={answers} setAnswers={setAnswers} />;
      }
      if (item.type === "keypoint") {
        const keypointColors = ["#ef4444","#f97316","#eab308","#22c55e","#14b8a6","#3b82f6","#8b5cf6","#ec4899","#f43f5e","#06b6d4","#84cc16","#a855f7","#64748b","#78716c","#57534e","#44403c","#292524"];
        const kpPositions: Record<string, {x:number;y:number}> = answers[item.id]?.kpPositions || {};
        const kpCount = Object.keys(kpPositions).length;
        const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
          if (!selKp) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
          const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
          setAnswers(a => ({ ...a, [item.id]: { ...a[item.id], kpPositions: { ...(a[item.id]?.kpPositions || {}), [selKp]: { x, y } } } }));
          const kps: string[] = item.keypoints;
          const curIdx = kps.indexOf(selKp);
          const nextUnmarked = kps.slice(curIdx + 1).find((k: string) => !kpPositions[k]) || kps.find((k: string) => !kpPositions[k] && k !== selKp);
          setSelKp(nextUnmarked || null);
        };
        return (
          <div>
            <div onClick={handleCanvasClick}
              style={{ background: "#1a1a2e", borderRadius: 10, marginBottom: 12, position: "relative", aspectRatio: "4/3", cursor: selKp ? "crosshair" : "default", userSelect: "none", overflow: "hidden" }}>
              {kpCount === 0 && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Activity size={36} color="#4f46e5" />
                  <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{item.scene}</div>
                  <div style={{ color: "#64748b", fontSize: 11 }}>{selKp ? `👆 点击标记 "${selKp}"` : "← 先从下方选择关键点"}</div>
                </div>
              )}
              {item.keypoints.map((kp: string, i: number) => {
                const pos = kpPositions[kp];
                if (!pos) return null;
                return (
                  <div key={kp}
                    onClick={e => { e.stopPropagation(); setSelKp(kp); }}
                    style={{ position: "absolute", left: `calc(${pos.x}% - 10px)`, top: `calc(${pos.y}% - 10px)`,
                      width: 20, height: 20, borderRadius: "50%", background: keypointColors[i], border: "2px solid #fff",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 700,
                      cursor: "pointer", boxShadow: selKp === kp ? "0 0 0 3px white" : "none", zIndex: 10 }}>
                    {i+1}
                  </div>
                );
              })}
              {kpCount > 0 && (
                <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 11, padding: "3px 8px", borderRadius: 4 }}>
                  {kpCount}/{item.keypoints.length} 已标注
                </div>
              )}
              {selKp && (
                <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, textAlign: "center" }}>
                  <span style={{ background: keypointColors[item.keypoints.indexOf(selKp)] || "#6366f1", color: "#fff", padding: "4px 12px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                    👆 点击标记「{selKp}」
                  </span>
                </div>
              )}
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>选择关键点后在图上点击定位（{item.keypoints.length}个）</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {item.keypoints.map((kp: string, i: number) => {
                const marked = !!kpPositions[kp];
                return (
                  <button key={kp} onClick={() => setSelKp(selKp === kp ? null : kp)}
                    style={{ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer",
                      border: `1px solid ${selKp === kp ? keypointColors[i] : marked ? keypointColors[i] + "80" : "#e2e8f0"}`,
                      background: selKp === kp ? keypointColors[i] : marked ? keypointColors[i] + "20" : "#fff",
                      color: selKp === kp ? "#fff" : marked ? keypointColors[i] : "#94a3b8" }}>
                    {marked ? "✓ " : ""}{i+1}. {kp}
                  </button>
                );
              })}
            </div>
            {kpCount > 0 && (
              <button onClick={() => setAnswers(a => ({ ...a, [item.id]: { ...a[item.id], kpPositions: {} } }))}
                style={{ marginTop: 10, padding: "6px 14px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>
                重置所有关键点
              </button>
            )}
          </div>
        );
      }
      if (item.type === "polygon") {
        return (
          <div>
            <div style={{ background: "#0f172a", borderRadius: 10, padding: 20, marginBottom: 16, aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
              <Box size={48} color="#7c3aed" style={{ margin: "0 auto 8px" }} />
              <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>{item.scene}</div>
              <div style={{ color: "#94a3b8", fontSize: 12 }}>{item.hint}</div>
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 10 }}>多边形区域标注（点击区域标签选择）</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              {(item.labels || []).map((l: string) => (
                <button key={l} onClick={() => setAnswers(a => ({ ...a, [item.id]: l }))}
                  style={{ padding: "12px 14px", borderRadius: 8, border: "2px solid", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    borderColor: answers[item.id] === l ? "#7c3aed" : "#e2e8f0",
                    background: answers[item.id] === l ? "#f5f3ff" : "#fff",
                    color: answers[item.id] === l ? "#7c3aed" : "#64748b" }}>
                  {answers[item.id] === l && <CheckCircle2 size={13} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />}
                  {l}
                </button>
              ))}
            </div>
          </div>
        );
      }
      if (item.type === "ocr") {
        return (
          <div>
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: 20, marginBottom: 16, border: "1px solid #e2e8f0", textAlign: "center" }}>
              <div style={{ width: "100%", height: 120, background: "#e5e5e5", borderRadius: 8, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 13 }}>
                📷 {item.scene}
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.hint}</div>
              <div style={{ marginTop: 12 }}>
                <input placeholder="请输入图片中的文字..." style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14 }} onChange={e => setAnswers(a => ({ ...a, [item.id]: e.target.value }))} value={answers[item.id] || ""} />
              </div>
            </div>
          </div>
        );
      }
      if (item.type === "classify") {
        return (
          <div>
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: 20, marginBottom: 16, border: "1px solid #e2e8f0", textAlign: "center" }}>
              <div style={{ width: "100%", height: 160, background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)", borderRadius: 8, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13 }}>
                🌤️ {item.scene}
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.hint}</div>
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 12 }}>选择图像类型</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {item.labels.map((l: string) => (
                <button key={l} onClick={() => setAnswers(a => ({ ...a, [item.id]: l }))}
                  style={{ padding: "12px 8px", borderRadius: 8, border: "2px solid", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    borderColor: answers[item.id] === l ? "#7c3aed" : "#e2e8f0",
                    background: answers[item.id] === l ? "#f5f3ff" : "#fff",
                    color: answers[item.id] === l ? "#7c3aed" : "#64748b" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        );
      }
      return <RectAnnotation item={item} answers={answers} setAnswers={setAnswers} />;
    }

    // ③ 视频标注
    if (template === "video_annotation") {
      if (item.type === "track") {
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
            <div style={{ width: "100%", height: 160, background: "#0f172a", borderRadius: 10, marginBottom: 16, padding: 16, boxSizing: "border-box" }}>
              <div style={{ color: "#64748b", fontSize: 11, marginBottom: 12 }}>🎬 {item.scene}（{item.duration}）</div>
              {item.tracks.map((t: any) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: "#94a3b8", width: 28 }}>{t.id}</span>
                  <div style={{ flex: 1, height: 20, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${50 + Math.random() * 40}%`, background: t.color, opacity: 0.6, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 10, color: t.color, fontWeight: 600, width: 50 }}>{t.type}</span>
                </div>
              ))}
            </div>
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
          </div>
        );
      }
      if (item.type === "behavior") {
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
              <Activity size={36} color="#dc2626" style={{ margin: "0 auto 8px" }} />
              <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{item.scene}</div>
              <div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>{item.duration}</div>
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 10 }}>该片段中包含哪些行为？（可多选）</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
              {(item.behaviors || []).map((b: string) => (
                <button key={b} onClick={() => toggle(b)}
                  style={{ padding: "10px 14px", borderRadius: 8, border: "2px solid", cursor: "pointer", fontSize: 13, fontWeight: 600, textAlign: "left",
                    borderColor: selected.includes(b) ? "#dc2626" : "#e2e8f0",
                    background: selected.includes(b) ? "#fef2f2" : "#fff",
                    color: selected.includes(b) ? "#dc2626" : "#64748b" }}>
                  {selected.includes(b) && <CheckCircle2 size={13} style={{ display: "inline", marginRight: 5, verticalAlign: "middle" }} />}
                  {b}
                </button>
              ))}
            </div>
          </div>
        );
      }
      if (item.type === "event") {
        const cur = answers[item.id] || {};
        const setField = (key: string, val: string) => setAnswers(a => ({ ...a, [item.id]: { ...a[item.id], [key]: val } }));
        return (
          <div>
            <div style={{ background: "#fef9ec", border: "1px solid #fed7aa", borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7 }}>{item.scene} — {item.eventTypes?.join("、")}</div>
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>事件类型</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {(item.eventTypes || []).map((t: string) => (
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
          </div>
        );
      }
      // 默认：帧场景分类标注
      const frameTags: string[] = answers[item.id]?.frameTags || [];
      const toggleFrameTag = (t: string) => {
        setAnswers(a => {
          const cur: string[] = a[item.id]?.frameTags || [];
          const next = cur.includes(t) ? cur.filter(x => x !== t) : [...cur, t];
          return { ...a, [item.id]: { ...a[item.id], frameTags: next } };
        });
      };
      const defaultFrameTags = item.tags || item.behaviors || item.eventTypes || ["正常场景", "异常场景", "目标进入", "目标离开", "遮挡"];
      return (
        <div>
          <div style={{ background: "#0f172a", borderRadius: 10, padding: 20, marginBottom: 14, textAlign: "center" }}>
            <Video size={32} color="#4f46e5" style={{ margin: "0 auto 8px", display: "block" }} />
            <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{item.scene || item.clip || "视频片段"}</div>
            <div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>{item.duration || ""}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
              <button onClick={() => setPlayState(playState === "play" ? "pause" : "play")}
                style={{ padding: "6px 20px", borderRadius: 6, background: "#4f46e5", color: "#fff", border: "none", cursor: "pointer", fontSize: 12 }}>
                {playState === "play" ? "⏸ 暂停" : "▶ 播放"}
              </button>
            </div>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>帧场景标签（可多选）</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
            {defaultFrameTags.map((t: string) => (
              <button key={t} onClick={() => toggleFrameTag(t)}
                style={{ padding: "10px 14px", borderRadius: 8, border: "2px solid", cursor: "pointer", fontSize: 13, fontWeight: 600, textAlign: "left",
                  borderColor: frameTags.includes(t) ? "#4f46e5" : "#e2e8f0",
                  background: frameTags.includes(t) ? "#eef2ff" : "#fff",
                  color: frameTags.includes(t) ? "#4f46e5" : "#64748b" }}>
                {frameTags.includes(t) ? "✓ " : ""}
                {t}
              </button>
            ))}
          </div>
          {frameTags.length > 0 && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#4f46e5", fontWeight: 500 }}>已选 {frameTags.length} 个标签：{frameTags.join("、")}</div>
          )}
        </div>
      );
    }

    // ④ 音频标注（多段时间轴波形 + 各片段分类）
    if (template === "audio_annotation") {
      // 生成伪波形数据（固定 seed，避免每次 render 变化）
      const waveData: number[] = item.waveform || Array.from({ length: 40 }, (_, i) => {
        const t = i / 40;
        return Math.abs(Math.sin(i * 1.3) * 0.6 + Math.sin(i * 2.7 + 1) * 0.3 + Math.sin(i * 5.1 + 2) * 0.1) * 0.9 + 0.05;
      });
      const maxWave = Math.max(...waveData);
      // 时间段标注状态
      const segments: { start: string; end: string; label: string }[] = item.segments || [
        { start: "0:00", end: "0:08", label: "" },
        { start: "0:08", end: "0:16", label: "" },
        { start: "0:16", end: "0:24", label: "" },
        { start: "0:24", end: item.duration || "0:30", label: "" },
      ];
      const segLabels: Record<number, string> = answers[item.id]?.segLabels || {};
      const setSegLabel = (i: number, l: string) => {
        setAnswers(a => ({ ...a, [item.id]: { ...a[item.id], segLabels: { ...(a[item.id]?.segLabels || {}), [i]: l } } }));
      };
      const labeledCount = Object.keys(segLabels).length;
      return (
        <div>
          {/* 播放器 */}
          <div style={{ background: "#1c1917", borderRadius: 10, padding: 16, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <button onClick={() => setPlayState(playState === "play" ? "pause" : "play")}
                style={{ width: 40, height: 40, borderRadius: "50%", background: "#d97706", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                {playState === "play" ? "⏸" : "▶"}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{item.audioName}</div>
                <div style={{ fontSize: 11, color: "#78716c" }}>⏱ {item.duration} · {item.sampleRate || "16kHz"} · {item.channels || "单声道"}</div>
              </div>
            </div>
            {/* 波形时间轴 */}
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height: 56, background: "#0c0a09", borderRadius: 6, padding: "4px 6px" }}>
                {waveData.map((v, i) => {
                  const segIdx = Math.floor(i / (waveData.length / segments.length));
                  const isActive = activeSeg === segIdx;
                  const labeled = !!segLabels[segIdx];
                  const h = Math.max(4, (v / maxWave) * 44);
                  return (
                    <div key={i} onClick={() => setActiveSeg(isActive ? null : segIdx)}
                      title={`片段${segIdx+1}: ${segments[segIdx]?.start}–${segments[segIdx]?.end}`}
                      style={{ flex: 1, height: h, borderRadius: 1, cursor: "pointer", transition: "opacity 0.1s",
                        background: isActive ? "#f59e0b" : labeled ? "#22c55e" : "#d97706",
                        opacity: isActive ? 1 : 0.55 }} />
                  );
                })}
              </div>
              {/* 时间刻度 */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, padding: "0 6px" }}>
                {segments.map((seg, i) => (
                  <span key={i} style={{ fontSize: 9, color: "#78716c" }}>{seg.start}</span>
                ))}
                <span style={{ fontSize: 9, color: "#78716c" }}>{item.duration}</span>
              </div>
            </div>
          </div>
          {/* 转写文本 */}
          {item.transcribe && (
            <div style={{ background: "#fffbeb", borderRadius: 8, padding: "10px 14px", marginBottom: 14, border: "1px solid #fde68a" }}>
              <div style={{ fontSize: 11, color: "#92400e", fontWeight: 600, marginBottom: 4 }}>🗣 识别文本</div>
              <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7 }}>{item.transcribe}</div>
            </div>
          )}
          {/* 各片段分类 */}
          <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 10 }}>
            片段标注（{labeledCount}/{segments.length} 已完成）— 点击波形或片段卡片选中
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {segments.map((seg, i) => {
              const isActive = activeSeg === i;
              const curLabel = segLabels[i];
              return (
                <div key={i}
                  style={{ borderRadius: 8, border: `2px solid ${isActive ? "#d97706" : curLabel ? "#22c55e" : "#e2e8f0"}`,
                    background: isActive ? "#fffbeb" : curLabel ? "#f0fdf4" : "#fff", padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: isActive ? 10 : 0, cursor: "pointer" }}
                    onClick={() => setActiveSeg(isActive ? null : i)}>
                    <span style={{ width: 20, height: 20, borderRadius: "50%", background: isActive ? "#d97706" : curLabel ? "#22c55e" : "#94a3b8", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                      {i+1}
                    </span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>{seg.start} – {seg.end}</span>
                    {curLabel && <span style={{ marginLeft: 4, padding: "2px 8px", borderRadius: 4, background: "#dcfce7", color: "#16a34a", fontSize: 11, fontWeight: 600 }}>{curLabel}</span>}
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, color: isActive ? "#d97706" : "#94a3b8" }}>{isActive ? "▼" : "▶"}</span>
                  </div>
                  {isActive && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
                      {(item.labels || ["语音", "噪声", "静音", "音乐", "混合"]).map((l: string) => (
                        <button key={l} onClick={() => { setSegLabel(i, l); setActiveSeg(null); }}
                          style={{ padding: "9px 12px", borderRadius: 7, border: "2px solid", cursor: "pointer", fontSize: 12, fontWeight: 600,
                            borderColor: curLabel === l ? "#d97706" : "#e2e8f0",
                            background: curLabel === l ? "#fffbeb" : "#fff",
                            color: curLabel === l ? "#d97706" : "#64748b" }}>
                          {curLabel === l ? "✓ " : ""}
                          {l}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {labeledCount === segments.length && (
            <div style={{ padding: "10px 14px", background: "#f0fdf4", borderRadius: 8, fontSize: 12, color: "#16a34a", fontWeight: 600, border: "1px solid #bbf7d0" }}>
              ✅ 全部 {segments.length} 个片段已标注完成
            </div>
          )}
        </div>
      );
    }

    // ⑤ 点云三维标注
    if (template === "pointcloud_anno") {
      const OBJECT_COLORS: Record<string, string> = { Car: "#3b82f6", Truck: "#ef4444", Van: "#8b5cf6", Pedestrian: "#22c55e", Cyclist: "#f59e0b", TrafficCone: "#f97316" };
      return (
        <div>
          <div style={{ background: "#0f172a", borderRadius: 10, padding: 20, marginBottom: 16, aspectRatio: "16/9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Box size={48} color="#059669" style={{ margin: "0 auto 8px" }} />
            <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>{item.scanName}</div>
            <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>{item.frame}</div>
            <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {(item.objects || []).map((obj: any) => (
                <div key={obj.label}
                  onClick={() => setSelectedObj(selectedObj === obj.label ? null : obj.label)}
                  style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600,
                    background: selectedObj === obj.label ? (OBJECT_COLORS[obj.label] || "#059669") + "30" : "#1e293b",
                    border: `1px solid ${OBJECT_COLORS[obj.label] || "#059669"}50`,
                    color: OBJECT_COLORS[obj.label] || "#059669" }}>
                  <span style={{ marginRight: 6 }}>🔲</span>{obj.label} <span style={{ opacity: 0.7 }}>{obj.points}点</span>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 10 }}>目标列表（点击选择后在点云中标注）</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(item.objects || []).map((obj: any) => (
              <div key={obj.label}
                onClick={() => setAnswers(a => ({ ...a, [item.id]: obj.label }))}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 8, border: "2px solid", cursor: "pointer",
                  borderColor: answers[item.id] === obj.label ? (OBJECT_COLORS[obj.label] || "#059669") : "#e2e8f0",
                  background: answers[item.id] === obj.label ? `${OBJECT_COLORS[obj.label] || "#059669"}10` : "#fff" }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: OBJECT_COLORS[obj.label] || "#059669" }} />
                <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 13 }}>{obj.label}</span>
                <span style={{ color: "#94a3b8", fontSize: 12, marginLeft: "auto" }}>{obj.points} 点云点数</span>
                {answers[item.id] === obj.label && <CheckCircle2 size={16} color={OBJECT_COLORS[obj.label] || "#059669"} />}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ── 图文对齐（顶层渲染，兼容 image_text_align annotation_type）
    if (template === "image_text_align") {
      const alignColors: Record<string, { bg: string; color: string }> = { "相符": { bg: "#dcfce7", color: "#16a34a" }, "部分相符": { bg: "#fef9c3", color: "#ca8a04" }, "不相符": { bg: "#fee2e2", color: "#dc2626" } };
      return (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div style={{ background: "#1e293b", borderRadius: 10, padding: 20, textAlign: "center" }}>
              <div style={{ height: 120, background: "linear-gradient(135deg,#374151 0%,#1f2937 100%)", borderRadius: 8, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 12 }}>
                🖼️ 图像内容
              </div>
              <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4 }}>图像描述</div>
              <div style={{ color: "#e2e8f0", fontSize: 12, lineHeight: 1.6 }}>{item.imageDesc}</div>
            </div>
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: 20, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>待对齐文本（Caption）</div>
              <div style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.7, marginBottom: 12 }}>{item.caption}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>对齐判断</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(item.alignOptions || item.align || []).map((al: string) => {
                  const info = alignColors[al] || { bg: "#f1f5f9", color: "#64748b" };
                  return (
                    <button key={al} onClick={() => setAnswers(a => ({ ...a, [item.id]: al }))}
                      style={{ padding: "8px 12px", borderRadius: 6, border: "2px solid", cursor: "pointer", fontSize: 13, fontWeight: 600, textAlign: "left",
                        borderColor: answers[item.id] === al ? info.color : "#e2e8f0",
                        background: answers[item.id] === al ? info.bg : "#fff",
                        color: answers[item.id] === al ? info.color : "#64748b" }}>
                      {answers[item.id] === al && <CheckCircle2 size={13} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />}
                      {al}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── 3D点云目标检测（顶层渲染，兼容 pointcloud_det annotation_type）
    if (template === "pointcloud_det") {
      const OBJECT_COLORS: Record<string, string> = { Car: "#3b82f6", Truck: "#ef4444", Van: "#8b5cf6", Pedestrian: "#22c55e", Cyclist: "#f59e0b", TrafficCone: "#f97316", Bus: "#7c3aed" };
      return (
        <div>
          <div style={{ background: "#0f172a", borderRadius: 10, padding: 20, marginBottom: 16, aspectRatio: "16/9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Box size={48} color="#059669" style={{ margin: "0 auto 8px" }} />
            <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>{item.scanName}</div>
            <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>{item.frame}</div>
            <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {(item.objects || []).map((obj: any) => (
                <div key={obj.label}
                  onClick={() => setSelectedObj(selectedObj === obj.label ? null : obj.label)}
                  style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600,
                    background: selectedObj === obj.label ? (OBJECT_COLORS[obj.label] || "#059669") + "30" : "#1e293b",
                    border: `1px solid ${OBJECT_COLORS[obj.label] || "#059669"}50`,
                    color: OBJECT_COLORS[obj.label] || "#059669" }}>
                  <span style={{ marginRight: 6 }}>🔲</span>{obj.label} <span style={{ opacity: 0.7 }}>{obj.points}点</span>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 10 }}>目标列表（点击选择后在点云中标注）</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(item.objects || []).map((obj: any) => (
              <div key={obj.label}
                onClick={() => setAnswers(a => ({ ...a, [item.id]: obj.label }))}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 8, border: "2px solid", cursor: "pointer",
                  borderColor: answers[item.id] === obj.label ? (OBJECT_COLORS[obj.label] || "#059669") : "#e2e8f0",
                  background: answers[item.id] === obj.label ? `${OBJECT_COLORS[obj.label] || "#059669"}10` : "#fff" }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: OBJECT_COLORS[obj.label] || "#059669" }} />
                <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 13 }}>{obj.label}</span>
                <span style={{ color: "#94a3b8", fontSize: 12, marginLeft: "auto" }}>{obj.points} 点云点数</span>
                {answers[item.id] === obj.label && <CheckCircle2 size={16} color={OBJECT_COLORS[obj.label] || "#059669"} />}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ⑥ 多模态对齐标注
    if (template === "multimodal_anno") {
      const alignColors: Record<string, { bg: string; color: string }> = { "相符": { bg: "#dcfce7", color: "#16a34a" }, "部分相符": { bg: "#fef9c3", color: "#ca8a04" }, "不相符": { bg: "#fee2e2", color: "#dc2626" } };
      return (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div style={{ background: "#1e293b", borderRadius: 10, padding: 20, textAlign: "center" }}>
              <div style={{ height: 120, background: "linear-gradient(135deg,#374151 0%,#1f2937 100%)", borderRadius: 8, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 12 }}>
                🖼️ 图像内容
              </div>
              <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4 }}>图像描述</div>
              <div style={{ color: "#e2e8f0", fontSize: 12, lineHeight: 1.6 }}>{item.imageDesc}</div>
            </div>
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: 20, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>待对齐文本（Caption）</div>
              <div style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.7, marginBottom: 12 }}>{item.caption}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>对齐判断</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(item.align || []).map((al: string) => {
                  const info = alignColors[al] || { bg: "#f1f5f9", color: "#64748b" };
                  return (
                    <button key={al} onClick={() => setAnswers(a => ({ ...a, [item.id]: al }))}
                      style={{ padding: "8px 12px", borderRadius: 6, border: "2px solid", cursor: "pointer", fontSize: 13, fontWeight: 600, textAlign: "left",
                        borderColor: answers[item.id] === al ? info.color : "#e2e8f0",
                        background: answers[item.id] === al ? info.bg : "#fff",
                        color: answers[item.id] === al ? info.color : "#64748b" }}>
                      {answers[item.id] === al && <CheckCircle2 size={13} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />}
                      {al}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ⑦ SFT监督微调标注
    if (template === "sft_annotation") {
      return (
        <div>
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: 16, marginBottom: 16, border: "1px solid #e2e8f0" }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Instruction（指令）</div>
              <div style={{ fontSize: 14, color: "#1e293b", fontWeight: 600 }}>{item.instruction}</div>
            </div>
            {item.input && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Input（输入）</div>
                <div style={{ fontSize: 13, color: "#475569", background: "#fff", padding: 10, borderRadius: 6, border: "1px solid #e2e8f0" }}>{item.input}</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Output（期望输出）</div>
              <div style={{ fontSize: 13, color: "#475569", background: "#fff", padding: 10, borderRadius: 6, border: "1px solid #e2e8f0", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{item.output}</div>
            </div>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>质量评分（1-5星）</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[1,2,3,4,5].map(s => (
              <button key={s} onClick={() => { setSftRating(s); setAnswers(a => ({ ...a, [item.id]: s })); }}
                style={{ width: 40, height: 40, borderRadius: 8, border: "2px solid", cursor: "pointer", fontSize: 16,
                  borderColor: sftRating >= s ? "#0284c7" : "#e2e8f0",
                  background: sftRating >= s ? "#e0f2fe" : "#fff",
                  color: sftRating >= s ? "#0284c7" : "#cbd5e1" }}>
                ★
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["通过", "需修改", "不合格"].map(label => (
              <button key={label} onClick={() => setAnswers(a => ({ ...a, [item.id]: label }))}
                style={{ flex: 1, padding: "10px", borderRadius: 8, border: "2px solid", cursor: "pointer", fontSize: 13, fontWeight: 600,
                  borderColor: answers[item.id] === label ? "#0284c7" : "#e2e8f0",
                  background: answers[item.id] === label ? "#e0f2fe" : "#fff",
                  color: answers[item.id] === label ? "#0284c7" : "#64748b" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // ⑧ DPO偏好优化标注
    if (template === "dpo_annotation") {
      return (
        <div>
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: 16, marginBottom: 16, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>Prompt（问题）</div>
            <div style={{ fontSize: 14, color: "#1e293b", marginBottom: 12, fontWeight: 600 }}>{item.prompt}</div>
            {item.input && (
              <div style={{ fontSize: 12, color: "#64748b", background: "#fff", padding: 8, borderRadius: 6, marginBottom: 12, border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>Input: </span>{item.input}
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                <CheckCircle2 size={13} /> Chosen（偏好回答）
              </div>
              <div onClick={() => { setDpoPref("chosen"); setAnswers(a => ({ ...a, [item.id]: "chosen" })); }}
                style={{ padding: 14, borderRadius: 8, border: "2px solid", cursor: "pointer", fontSize: 13, lineHeight: 1.6,
                  borderColor: dpoPref === "chosen" ? "#16a34a" : "#e2e8f0",
                  background: dpoPref === "chosen" ? "#f0fdf4" : "#fff",
                  color: "#475569", whiteSpace: "pre-wrap" }}>
                {item.chosen}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#dc2626", fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                <AlertCircle size={13} /> Rejected（拒绝回答）
              </div>
              <div onClick={() => { setDpoPref("rejected"); setAnswers(a => ({ ...a, [item.id]: "rejected" })); }}
                style={{ padding: 14, borderRadius: 8, border: "2px solid", cursor: "pointer", fontSize: 13, lineHeight: 1.6,
                  borderColor: dpoPref === "rejected" ? "#dc2626" : "#e2e8f0",
                  background: dpoPref === "rejected" ? "#fef2f2" : "#fff",
                  color: "#475569", whiteSpace: "pre-wrap" }}>
                {item.rejected}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ⑨ PPO/RLHF样本构建
    if (template === "ppo_annotation") {
      const dimColors = ["#3b82f6","#22c55e","#f59e0b","#8b5cf6"];
      return (
        <div>
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: 16, marginBottom: 16, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>待评分回答</div>
            <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{item.response}</div>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 12 }}>多维度打分</p>
          {(item.dimensions || []).map((dim: string, i: number) => {
            const score = answers[item.id]?.[dim] || 0;
            return (
              <div key={dim} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{dim}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: dimColors[i % dimColors.length] }}>{score} / 5</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => {
                      const cur = answers[item.id] || {};
                      setAnswers(a => ({ ...a, [item.id]: { ...cur, [dim]: s } }));
                    }} style={{ flex: 1, height: 32, borderRadius: 6, border: "1px solid", cursor: "pointer", fontSize: 12, fontWeight: 700,
                      borderColor: score >= s ? dimColors[i % dimColors.length] : "#e2e8f0",
                      background: score >= s ? `${dimColors[i % dimColors.length]}20` : "#fff",
                      color: score >= s ? dimColors[i % dimColors.length] : "#cbd5e1" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // ⑩ CoT思维链推理标注（步骤审核 + 整体评分）
    if (template === "cot_annotation") {
      const cotStepStates: Record<number, "ok" | "error" | null> = answers[item.id]?.cotStepStates || {};
      const setCotStep = (i: number, v: "ok" | "error" | null) => {
        setAnswers(a => ({ ...a, [item.id]: { ...a[item.id], cotStepStates: { ...(a[item.id]?.cotStepStates || {}), [i]: v } } }));
      };
      const cotVerdict = answers[item.id]?.cotVerdict || null;
      const setCotVerdict = (v: string) => setAnswers(a => ({ ...a, [item.id]: { ...a[item.id], cotVerdict: v } }));
      const steps: string[] = item.reasoning || [];
      const okCount = Object.values(cotStepStates).filter(v => v === "ok").length;
      return (
        <div>
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: 16, marginBottom: 12, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>问题</div>
            <div style={{ fontSize: 14, color: "#1e293b", fontWeight: 600 }}>{item.question}</div>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>逐步审核推理链（{steps.length} 步，已审核 {Object.keys(cotStepStates).length}/{steps.length}）</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {steps.map((step: string, i: number) => {
              const state = cotStepStates[i];
              return (
                <div key={i}
                  style={{ borderRadius: 8, border: `2px solid ${state === "ok" ? "#16a34a" : state === "error" ? "#dc2626" : i === cotStepIdx ? "#0284c7" : "#e2e8f0"}`,
                    background: state === "ok" ? "#f0fdf4" : state === "error" ? "#fef2f2" : "#fff", padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <button onClick={() => setCotStepIdx(i)}
                      style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, color: "#fff",
                        background: state === "ok" ? "#16a34a" : state === "error" ? "#dc2626" : i === cotStepIdx ? "#0284c7" : "#94a3b8" }}>
                      {i+1}
                    </button>
                    <div style={{ flex: 1, fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{step}</div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => setCotStep(i, state === "ok" ? null : "ok")}
                        style={{ padding: "3px 10px", borderRadius: 4, border: "1px solid", cursor: "pointer", fontSize: 11, fontWeight: 600,
                          borderColor: state === "ok" ? "#16a34a" : "#e2e8f0", background: state === "ok" ? "#dcfce7" : "#fff", color: state === "ok" ? "#16a34a" : "#94a3b8" }}>
                        ✓
                      </button>
                      <button onClick={() => setCotStep(i, state === "error" ? null : "error")}
                        style={{ padding: "3px 10px", borderRadius: 4, border: "1px solid", cursor: "pointer", fontSize: 11, fontWeight: 600,
                          borderColor: state === "error" ? "#dc2626" : "#e2e8f0", background: state === "error" ? "#fee2e2" : "#fff", color: state === "error" ? "#dc2626" : "#94a3b8" }}>
                        ✗
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ background: "#e0f2fe", borderRadius: 8, padding: "10px 14px", marginBottom: 12, border: "1px solid #bae6fd", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 11, color: "#0284c7", fontWeight: 600, minWidth: 60 }}>最终答案</div>
            <div style={{ fontSize: 14, color: "#1e293b", fontWeight: 700 }}>{item.answer}</div>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>整体审核结论</p>
          <div style={{ display: "flex", gap: 8 }}>
            {["推理正确", "推理有误", "答案错误"].map((v, vi) => {
              const colors = ["#16a34a", "#d97706", "#dc2626"];
              return (
                <button key={v} onClick={() => setCotVerdict(v)}
                  style={{ flex: 1, padding: "10px", borderRadius: 8, border: "2px solid", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    borderColor: cotVerdict === v ? colors[vi] : "#e2e8f0",
                    background: cotVerdict === v ? colors[vi] + "20" : "#fff",
                    color: cotVerdict === v ? colors[vi] : "#64748b" }}>
                  {v}
                </button>
              );
            })}
          </div>
          {cotVerdict && <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>步骤确认 {okCount}/{steps.length} ｜ 审核结论：<strong>{cotVerdict}</strong></div>}
        </div>
      );
    }

    // ⑩ ToT树状推理标注（选择最优分支 + 维度评分）
    if (template === "tot_annotation") {
      const totScores: Record<string, number> = answers[item.id]?.totScores || {};
      const setTotScore = (dim: string, s: number) => {
        setAnswers(a => ({ ...a, [item.id]: { ...a[item.id], totScores: { ...(a[item.id]?.totScores || {}), [dim]: s }, totBranch: totSelBranch } }));
      };
      const evalDims = ["逻辑严密性", "可行性", "完整性"];
      return (
        <div>
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: 16, marginBottom: 12, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>问题</div>
            <div style={{ fontSize: 14, color: "#1e293b", fontWeight: 600 }}>{item.question}</div>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 10 }}>多分支推理路径（选择最优路径）</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {(item.branches || []).map((branch: any, i: number) => (
              <div key={i}
                onClick={() => setTotSelBranch(totSelBranch === branch.path ? null : branch.path)}
                style={{ padding: 14, borderRadius: 8, border: "2px solid", cursor: "pointer",
                  borderColor: totSelBranch === branch.path ? "#d97706" : "#e2e8f0",
                  background: totSelBranch === branch.path ? "#fffbeb" : "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: totSelBranch === branch.path ? "#d97706" : "#94a3b8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{branch.path}</span>
                  {totSelBranch === branch.path && <CheckCircle2 size={16} color="#d97706" style={{ marginLeft: "auto" }} />}
                </div>
                <div style={{ marginLeft: 32, display: "flex", gap: 12, fontSize: 12 }}>
                  <span style={{ color: "#16a34a" }}>✓ {branch.pro}</span>
                  <span style={{ color: "#dc2626" }}>✗ {branch.con}</span>
                </div>
              </div>
            ))}
          </div>
          {totSelBranch && (
            <div style={{ background: "#fffbeb", borderRadius: 10, padding: 14, border: "1px solid #fde68a" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#b45309", marginBottom: 10 }}>对选中路径「{totSelBranch}」进行维度评分</p>
              {evalDims.map(dim => {
                const score = totScores[dim] || 0;
                return (
                  <div key={dim} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: "#78350f", fontWeight: 600, minWidth: 64 }}>{dim}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[1,2,3,4,5].map(s => (
                        <button key={s} onClick={() => setTotScore(dim, s)}
                          style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid", cursor: "pointer", fontSize: 11, fontWeight: 700,
                            borderColor: score >= s ? "#d97706" : "#e2e8f0",
                            background: score >= s ? "#fef3c7" : "#fff",
                            color: score >= s ? "#d97706" : "#cbd5e1" }}>
                          {s}
                        </button>
                      ))}
                    </div>
                    <span style={{ fontSize: 12, color: score > 0 ? "#d97706" : "#94a3b8", fontWeight: 600 }}>{score > 0 ? score + "/5" : "—"}</span>
                  </div>
                );
              })}
            </div>
          )}
          {!totSelBranch && <div style={{ padding: "12px 0", fontSize: 12, color: "#94a3b8", textAlign: "center" }}>👆 请先选择最优推理路径</div>}
        </div>
      );
    }

    // ⑫ GoT图状推理标注（节点确认 + 关系逐条核对）
    if (template === "got_annotation") {
      const nodeColors: Record<string, string> = { "原因": "#ef4444", "中间": "#3b82f6", "事件": "#f59e0b", "决策": "#8b5cf6", "结果": "#22c55e", "起点": "#6366f1", "处理": "#0891b2" };
      const confirmedNodes: string[] = answers[item.id]?.confirmedNodes || [];
      const edgeStates: Record<number, "ok" | "wrong" | null> = answers[item.id]?.edgeStates || {};
      const toggleNode = (nid: string) => {
        setAnswers(a => {
          const cur: string[] = a[item.id]?.confirmedNodes || [];
          const next = cur.includes(nid) ? cur.filter(x => x !== nid) : [...cur, nid];
          return { ...a, [item.id]: { ...a[item.id], confirmedNodes: next } };
        });
      };
      const setEdgeState = (i: number, v: "ok" | "wrong" | null) => {
        setAnswers(a => ({ ...a, [item.id]: { ...a[item.id], edgeStates: { ...(a[item.id]?.edgeStates || {}), [i]: v } } }));
      };
      const okEdges = Object.values(edgeStates).filter(v => v === "ok").length;
      return (
        <div>
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: 16, marginBottom: 12, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>问题</div>
            <div style={{ fontSize: 14, color: "#1e293b", fontWeight: 600 }}>{item.question}</div>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>节点确认（{confirmedNodes.length}/{(item.nodes || []).length}）— 点击节点确认其合理性</p>
          <div style={{ background: "#0f172a", borderRadius: 10, padding: 16, marginBottom: 14, position: "relative" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", alignItems: "center" }}>
              {(item.nodes || []).map((node: any) => {
                const confirmed = confirmedNodes.includes(node.id);
                const nc = nodeColors[node.type] || "#6366f1";
                return (
                  <div key={node.id} onClick={() => toggleNode(node.id)}
                    style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
                      background: confirmed ? nc + "40" : nc + "15",
                      border: `2px solid ${confirmed ? nc : nc + "50"}`,
                      color: nc, fontSize: 12, fontWeight: 600,
                      boxShadow: confirmed ? `0 0 0 2px ${nc}40` : "none" }}>
                    <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>{node.id}</div>
                    {node.label}
                    {confirmed && <div style={{ fontSize: 10, textAlign: "center", marginTop: 2 }}>✓</div>}
                  </div>
                );
              })}
            </div>
            <div style={{ position: "absolute", bottom: 8, right: 10, fontSize: 11, color: "#475569" }}>
              🔗 {(item.edges || []).length} 条关系边
            </div>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>关系核对（{okEdges}/{(item.edges || []).length} 已确认）</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(item.edges || []).map((edge: any, i: number) => {
              const state = edgeStates[i];
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8,
                  border: `2px solid ${state === "ok" ? "#16a34a" : state === "wrong" ? "#dc2626" : "#e2e8f0"}`,
                  background: state === "ok" ? "#f0fdf4" : state === "wrong" ? "#fef2f2" : "#fff" }}>
                  <span style={{ fontWeight: 700, color: "#be185d", minWidth: 28, fontSize: 12 }}>{edge.from}</span>
                  <span style={{ color: "#94a3b8", fontSize: 11 }}>─{edge.label}→</span>
                  <span style={{ fontWeight: 700, color: "#be185d", fontSize: 12 }}>{edge.to}</span>
                  <div style={{ flex: 1 }} />
                  <button onClick={() => setEdgeState(i, state === "ok" ? null : "ok")}
                    style={{ padding: "3px 10px", borderRadius: 4, border: "1px solid", cursor: "pointer", fontSize: 11, fontWeight: 600,
                      borderColor: state === "ok" ? "#16a34a" : "#e2e8f0", background: state === "ok" ? "#dcfce7" : "#fff", color: state === "ok" ? "#16a34a" : "#94a3b8" }}>
                    ✓
                  </button>
                  <button onClick={() => setEdgeState(i, state === "wrong" ? null : "wrong")}
                    style={{ padding: "3px 10px", borderRadius: 4, border: "1px solid", cursor: "pointer", fontSize: 11, fontWeight: 600,
                      borderColor: state === "wrong" ? "#dc2626" : "#e2e8f0", background: state === "wrong" ? "#fee2e2" : "#fff", color: state === "wrong" ? "#dc2626" : "#94a3b8" }}>
                    ✗
                  </button>
                </div>
              );
            })}
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
    if (template === "relation_extract" || template === "qa") return true;
    if (template === "image_text_align" || template === "pointcloud_det") return true;
    if (template === "sft" || template === "dpo" || template === "cot" || template === "tot" || template === "got") return true;
    if (template === "ppo") return Object.keys(answers[item.id] || {}).length > 0;
    return !!answers[item.id];
  })();

  const templateMeta: Record<string, { label: string; color: string }> = {
    // 基础素材标注（6个）
    text_annotation:  { label: "文本标注",         color: "#2563eb" },
    image_annotation: { label: "图像标注",         color: "#7c3aed" },
    video_annotation: { label: "视频标注",         color: "#dc2626" },
    audio_annotation: { label: "音频标注",         color: "#d97706" },
    pointcloud_anno:  { label: "点云三维标注",     color: "#059669" },
    multimodal_anno:  { label: "多模态对齐标注",   color: "#db2777" },
    // 对齐推理标注（6个）
    sft_annotation:   { label: "SFT监督微调标注",  color: "#0284c7" },
    dpo_annotation:   { label: "DPO偏好优化标注",  color: "#7c3aed" },
    ppo_annotation:   { label: "PPO/RLHF样本构建", color: "#ea580c" },
    cot_annotation:   { label: "CoT思维链推理标注", color: "#16a34a" },
    tot_annotation:   { label: "ToT树状推理标注",  color: "#d97706" },
    got_annotation:   { label: "GoT图状推理标注",  color: "#be185d" },
    // 兼容旧模板
    rect:             { label: "矩形框目标检测",   color: "#2563eb" },
    track:            { label: "多目标跟踪标注",   color: "#059669" },
    segment:          { label: "时序行为片段",     color: "#4f46e5" },
    event:            { label: "事件分类标注",     color: "#dc2626" },
    timeseries:       { label: "时序异常标注",     color: "#0d9488" },
    ner:              { label: "命名实体识别",     color: "#6366f1" },
    text_classify:    { label: "文本分类",         color: "#6366f1" },
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
