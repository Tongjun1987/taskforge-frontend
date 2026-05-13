"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Target,
  FileText,
  Cpu,
  Database,
  ChartBar,
  ChevronRight,
  CircleCheckBig,
  Plus,
  Trash2,
} from "lucide-react";

// ===== 类型定义 =====
interface LabelNode {
  id: string;
  name: string;
  color: string;
  description: string;
  children: LabelNode[];
}

interface Scene {
  id: string;
  name: string;
  description: string;
  type: string;
  task_count: number;
  dataset_count: number;
  created_at: string;
  status: string;
  labelSchema?: LabelNode[];
}

// ===== 数据规格 =====
interface DataSpec {
  id: string;
  dataVolume: string;
  dataType: string;
  language: string;
  domain: string;
}

// ===== 质量标准 =====
interface QualityStandard {
  id: string;
  accuracyThreshold: number;
  consistencyRequirement: string;
  qualificationRate: string;
}

// ===== 标注规范 =====
interface AnnotationSpec {
  id: string;
  guidelines: string;
  edgeCaseRules: string;
  exampleSet: string;
}

interface Task {
  id: string;
  name: string;
  scene_id: string;
  task_type: string;
  modality: string;
  dataset_count: number;
  quality_status: string;
  created_at: string;
  sampleUnit?: string;
  // 新结构的数据需求
  dataSpec?: DataSpec;
  qualityStandard?: QualityStandard;
  annotationSpec?: AnnotationSpec;
  evaluationMetrics?: EvaluationMetric[];
  modelRequirements?: ModelRequirement[];
}

interface EvaluationMetric {
  id: string;
  name: string;
  key: string;
  isPrimary: boolean;
  threshold: number;
  description?: string;
}

interface ModelRequirement {
  id: string;
  category: string;
  name: string;
  value: string;
  required: boolean;
}

// ===== Mock 数据 =====
const MOCK_SCENES: Scene[] = [
  {
    id: "scene-1",
    name: "交通事件识别",
    description: "道路监控场景下的交通事故、违章等事件自动检测",
    type: "交通事件",
    task_count: 5,
    dataset_count: 8,
    created_at: "2026-04-01",
    status: "active",
  },
  {
    id: "scene-2",
    name: "智慧巡检",
    description: "电力线路、设施设备的自动化巡检验收",
    type: "工业巡检",
    task_count: 3,
    dataset_count: 5,
    created_at: "2026-03-28",
    status: "active",
  },
  {
    id: "scene-3",
    name: "OCR识别",
    description: "文档、票据、证件等文字识别任务",
    type: "文字识别",
    task_count: 2,
    dataset_count: 4,
    created_at: "2026-03-20",
    status: "active",
  },
];

// ===== 常量 =====
const TASK_TYPES = [
  "目标检测", "图像分类", "语义分割", "文字识别",
  "视频分析", "语音识别", "回归分析",
  "目标跟踪", "交通行为识别", "交通事件识别", "时序分析",
];
const MODALITIES = ["图像", "文本", "视频", "音频", "传感器", "多模态"];

const EVAL_PRESETS: Record<string, { name: string; key: string; threshold: number; isPrimary: boolean }[]> = {
  "目标检测": [
    { name: "mAP@IoU=0.5", key: "mAP@0.5", threshold: 0.75, isPrimary: true },
    { name: "Precision", key: "precision", threshold: 0.80, isPrimary: false },
    { name: "Recall", key: "recall", threshold: 0.75, isPrimary: false },
    { name: "F1 Score", key: "f1", threshold: 0.75, isPrimary: false },
  ],
  "图像分类": [
    { name: "Accuracy", key: "accuracy", threshold: 0.90, isPrimary: true },
    { name: "F1（宏平均）", key: "f1_macro", threshold: 0.85, isPrimary: false },
    { name: "Precision", key: "precision", threshold: 0.85, isPrimary: false },
    { name: "Recall", key: "recall", threshold: 0.85, isPrimary: false },
  ],
  "语义分割": [
    { name: "Mean IoU", key: "mIoU", threshold: 0.70, isPrimary: true },
    { name: "Dice Coefficient", key: "dice", threshold: 0.70, isPrimary: false },
  ],
  "文字识别": [
    { name: "CER（字符错误率）", key: "CER", threshold: 5, isPrimary: true },
    { name: "WER（词错误率）", key: "WER", threshold: 15, isPrimary: false },
    { name: "Accuracy", key: "accuracy", threshold: 0.95, isPrimary: false },
  ],
  "视频分析": [
    { name: "F1 Score", key: "f1", threshold: 0.75, isPrimary: true },
    { name: "Recall", key: "recall", threshold: 0.75, isPrimary: false },
  ],
  "语音识别": [
    { name: "WER（词错误率）", key: "WER", threshold: 10, isPrimary: true },
    { name: "CER（字符错误率）", key: "CER", threshold: 5, isPrimary: false },
  ],
  "回归分析": [
    { name: "MAE（平均绝对误差）", key: "MAE", threshold: 0.15, isPrimary: true },
    { name: "RMSE（均方根误差）", key: "RMSE", threshold: 0.20, isPrimary: false },
    { name: "R²（决定系数）", key: "R2", threshold: 0.85, isPrimary: false },
  ],
  "目标跟踪": [
    { name: "MOTA（多目标跟踪精度）", key: "MOTA", threshold: 0.60, isPrimary: true },
    { name: "IDF1（身份F1）", key: "IDF1", threshold: 0.55, isPrimary: false },
    { name: "MOTP（跟踪精度）", key: "MOTP", threshold: 0.70, isPrimary: false },
  ],
  "交通行为识别": [
    { name: "F1 Score", key: "f1", threshold: 0.75, isPrimary: true },
    { name: "Recall", key: "recall", threshold: 0.75, isPrimary: false },
    { name: "Precision", key: "precision", threshold: 0.75, isPrimary: false },
  ],
  "交通事件识别": [
    { name: "F1 Score", key: "f1", threshold: 0.80, isPrimary: true },
    { name: "Recall", key: "recall", threshold: 0.80, isPrimary: false },
    { name: "Precision", key: "precision", threshold: 0.80, isPrimary: false },
  ],
  "时序分析": [
    { name: "F1 Score", key: "f1", threshold: 0.75, isPrimary: true },
    { name: "MAE（异常点定位）", key: "MAE", threshold: 0.20, isPrimary: false },
  ],
};

const SAMPLE_UNITS: Record<string, string[]> = {
  "目标检测": ["单个检测框（坐标+类别）", "单个目标区域（bbox）"],
  "图像分类": ["单张图像（整体标签）", "单张图像（多标签）"],
  "语义分割": ["像素级分割图（mask）", "多边形标注区域"],
  "文字识别": ["单条文本行（OCR）", "文本段落（文档级）"],
  "视频分析": ["视频片段（连续帧）", "关键帧（事件节点）"],
  "语音识别": ["音频片段+转写文本", "时间戳标注片段"],
  "回归分析": ["单条传感器时序数据", "多维特征向量"],
  "目标跟踪": ["单个目标跨帧轨迹（ID+多帧bbox）", "视频片段中所有目标轨迹"],
  "交通行为识别": ["短视频片段内单目标行为（3~10秒）", "多目标协同行为"],
  "交通事件识别": ["完整事件视频片段（5~30秒）", "事件+关联行为组合"],
  "时序分析": ["长时视频序列（几十秒~分钟）", "多路段/多时段时序对比"],
};

// ===== 任务创建页组件 =====
function TaskCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedScene = searchParams.get("scene");

  const [currentStep, setCurrentStep] = useState(1);
  const [scenes, setScenes] = useState<Scene[]>([]);

  // 表单状态
  const [taskForm, setTaskForm] = useState({
    scene_id: "",
    name: "",
    task_type: "",
    modality: "",
    sampleUnit: "",
    // 新结构的数据需求
    dataSpec: {
      id: "ds-new",
      dataVolume: "",
      dataType: "",
      language: "",
      domain: "",
    } as DataSpec,
    qualityStandard: {
      id: "qs-new",
      accuracyThreshold: 0.8,
      consistencyRequirement: "",
      qualificationRate: "",
    } as QualityStandard,
    annotationSpec: {
      id: "as-new",
      guidelines: "",
      edgeCaseRules: "",
      exampleSet: "",
    } as AnnotationSpec,
    evaluationMetrics: [] as EvaluationMetric[],
    modelRequirements: [] as ModelRequirement[],
  });

  // 加载场景列表
  useEffect(() => {
    setScenes(MOCK_SCENES);
    if (preselectedScene) {
      setTaskForm((prev) => ({ ...prev, scene_id: preselectedScene }));
    }
  }, [preselectedScene]);

  // 选择任务类型时自动填充评测指标
  useEffect(() => {
    if (taskForm.task_type) {
      // 自动填充评测指标
      const evalMetrics = EVAL_PRESETS[taskForm.task_type] || [];
      const evalPresets = evalMetrics.map((m, i) => ({
        id: `ev-${Date.now()}-${i}`,
        name: m.name,
        key: m.key,
        threshold: m.threshold,
        isPrimary: m.isPrimary,
        description: "",
      }));

      // 自动填充样本单元选项
      const sampleOptions = SAMPLE_UNITS[taskForm.task_type] || [];

      setTaskForm((prev) => ({
        ...prev,
        evaluationMetrics: prev.evaluationMetrics.length === 0 ? evalPresets : prev.evaluationMetrics,
        sampleUnit: sampleOptions[0] || "",
      }));
    }
  }, [taskForm.task_type]);

  // 步骤验证
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return taskForm.scene_id && taskForm.name && taskForm.task_type && taskForm.modality;
      case 2:
        return taskForm.dataSpec.dataVolume && taskForm.dataSpec.dataType;
      case 3:
        return taskForm.evaluationMetrics.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  // 更新数据规格
  const updateDataSpec = (updates: Partial<DataSpec>) => {
    setTaskForm((prev) => ({
      ...prev,
      dataSpec: { ...prev.dataSpec, ...updates },
    }));
  };

  // 更新质量标准
  const updateQualityStandard = (updates: Partial<QualityStandard>) => {
    setTaskForm((prev) => ({
      ...prev,
      qualityStandard: { ...prev.qualityStandard, ...updates },
    }));
  };

  // 更新标注规范
  const updateAnnotationSpec = (updates: Partial<AnnotationSpec>) => {
    setTaskForm((prev) => ({
      ...prev,
      annotationSpec: { ...prev.annotationSpec, ...updates },
    }));
  };

  // 添加评测指标
  const addEvaluationMetric = () => {
    setTaskForm((prev) => ({
      ...prev,
      evaluationMetrics: [
        ...prev.evaluationMetrics,
        { id: `ev-${Date.now()}`, name: "", key: "", threshold: 0.8, isPrimary: false },
      ],
    }));
  };

  // 更新评测指标
  const updateEvaluationMetric = (id: string, updates: Partial<EvaluationMetric>) => {
    setTaskForm((prev) => ({
      ...prev,
      evaluationMetrics: prev.evaluationMetrics.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }));
  };

  // 删除评测指标
  const removeEvaluationMetric = (id: string) => {
    setTaskForm((prev) => ({
      ...prev,
      evaluationMetrics: prev.evaluationMetrics.filter((m) => m.id !== id),
    }));
  };

  // 提交表单
  const handleSubmit = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: taskForm.name,
      scene_id: taskForm.scene_id,
      task_type: taskForm.task_type,
      modality: taskForm.modality,
      dataset_count: 0,
      quality_status: "pending",
      created_at: new Date().toISOString().split("T")[0],
      sampleUnit: taskForm.sampleUnit,
      dataSpec: taskForm.dataSpec,
      qualityStandard: taskForm.qualityStandard,
      annotationSpec: taskForm.annotationSpec,
      evaluationMetrics: taskForm.evaluationMetrics,
      modelRequirements: taskForm.modelRequirements,
    };

    console.log("创建任务:", newTask);
    alert("任务创建成功！");
    router.push("/task-modeling");
  };

  const steps = [
    { number: 1, title: "基本信息", icon: Target },
    { number: 2, title: "数据需求", icon: Database },
    { number: 3, title: "评测指标", icon: ChartBar },
    { number: 4, title: "确认创建", icon: Check },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#f8fafc",
      }}
    >
      {/* 顶部导航栏 */}
      <div
        style={{
          height: 56,
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: 16,
        }}
      >
        <button
          onClick={() => router.push("/task-modeling")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 6,
            cursor: "pointer",
            color: "#64748b",
            fontSize: 13,
          }}
        >
          <ArrowLeft size={16} />
          返回
        </button>
        <div style={{ width: 1, height: 24, background: "#e2e8f0" }} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#1e293b", margin: 0 }}>
            创建任务
          </h1>
          <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
            定义任务的基本信息、数据需求和评测指标
          </p>
        </div>
      </div>

      {/* 步骤指示器 */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          padding: "16px 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      currentStep > step.number
                        ? "#4f46e5"
                        : currentStep === step.number
                        ? "#4f46e5"
                        : "#e2e8f0",
                    color: currentStep >= step.number ? "#fff" : "#64748b",
                    fontSize: 14,
                    fontWeight: 600,
                    transition: "all 0.2s",
                  }}
                >
                  {currentStep > step.number ? <Check size={16} /> : <step.icon size={16} />}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: currentStep >= step.number ? "#4f46e5" : "#94a3b8",
                    fontWeight: currentStep === step.number ? 600 : 400,
                  }}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  style={{
                    width: 80,
                    height: 2,
                    background: currentStep > step.number ? "#4f46e5" : "#e2e8f0",
                    margin: "0 8px",
                    marginBottom: 20,
                    transition: "all 0.2s",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 表单内容 */}
      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            border: "1px solid #e2e8f0",
          }}
        >
          {/* 步骤 1: 基本信息 */}
          {currentStep === 1 && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1e293b", marginBottom: 20 }}>
                基本信息
              </h2>

              {/* 所属场景 */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                  所属场景 <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={taskForm.scene_id}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, scene_id: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: 14,
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    background: "#fff",
                    outline: "none",
                  }}
                >
                  <option value="">请选择场景</option>
                  {scenes.map((scene) => (
                    <option key={scene.id} value={scene.id}>
                      {scene.name} - {scene.type}
                    </option>
                  ))}
                </select>
              </div>

              {/* 任务名称 */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                  任务名称 <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={taskForm.name}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="请输入任务名称"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: 14,
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* 任务类型 */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                  任务类型 <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {TASK_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setTaskForm((prev) => ({ ...prev, task_type: type }))}
                      style={{
                        padding: "8px 16px",
                        fontSize: 13,
                        border: taskForm.task_type === type ? "2px solid #4f46e5" : "1px solid #d1d5db",
                        borderRadius: 6,
                        background: taskForm.task_type === type ? "#f5f3ff" : "#fff",
                        color: taskForm.task_type === type ? "#4f46e5" : "#374151",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* 数据类型 */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                  数据类型 <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {MODALITIES.map((mod) => (
                    <button
                      key={mod}
                      onClick={() => setTaskForm((prev) => ({ ...prev, modality: mod }))}
                      style={{
                        padding: "8px 16px",
                        fontSize: 13,
                        border: taskForm.modality === mod ? "2px solid #4f46e5" : "1px solid #d1d5db",
                        borderRadius: 6,
                        background: taskForm.modality === mod ? "#f5f3ff" : "#fff",
                        color: taskForm.modality === mod ? "#4f46e5" : "#374151",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {mod}
                    </button>
                  ))}
                </div>
              </div>

              {/* 样本单元 */}
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                  样本单元
                </label>
                <select
                  value={taskForm.sampleUnit}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, sampleUnit: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: 14,
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    background: "#fff",
                    outline: "none",
                  }}
                >
                  <option value="">请选择样本单元</option>
                  {(SAMPLE_UNITS[taskForm.task_type] || []).map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* 步骤 2: 数据需求 */}
          {currentStep === 2 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                  数据需求
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* ===== 数据规格 ===== */}
                <div style={{
                  padding: 20,
                  background: "#fff",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: "linear-gradient(135deg, #dbeafe, #93c5fd)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Database size={14} style={{ color: "#2563eb" }} />
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                      数据规格
                    </h4>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 500, color: "#64748b", display: "block", marginBottom: 6 }}>
                        目标数据量 <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={taskForm.dataSpec.dataVolume}
                        onChange={(e) => updateDataSpec({ dataVolume: e.target.value })}
                        placeholder="如：≥50,000张图像"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          fontSize: 13,
                          border: "1px solid #d1d5db",
                          borderRadius: 6,
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 500, color: "#64748b", display: "block", marginBottom: 6 }}>
                        数据类型 <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={taskForm.dataSpec.dataType}
                        onChange={(e) => updateDataSpec({ dataType: e.target.value })}
                        placeholder="如：图像（JPG/PNG，1920×1080）"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          fontSize: 13,
                          border: "1px solid #d1d5db",
                          borderRadius: 6,
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 500, color: "#64748b", display: "block", marginBottom: 6 }}>
                        语言
                      </label>
                      <input
                        type="text"
                        value={taskForm.dataSpec.language}
                        onChange={(e) => updateDataSpec({ language: e.target.value })}
                        placeholder="如：中文、英文"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          fontSize: 13,
                          border: "1px solid #d1d5db",
                          borderRadius: 6,
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 500, color: "#64748b", display: "block", marginBottom: 6 }}>
                        领域范围
                      </label>
                      <input
                        type="text"
                        value={taskForm.dataSpec.domain}
                        onChange={(e) => updateDataSpec({ domain: e.target.value })}
                        placeholder="如：城市道路、高速公路"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          fontSize: 13,
                          border: "1px solid #d1d5db",
                          borderRadius: 6,
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* ===== 质量标准 ===== */}
                <div style={{
                  padding: 20,
                  background: "#fff",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: "linear-gradient(135deg, #dcfce7, #86efac)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <CircleCheckBig size={14} style={{ color: "#16a34a" }} />
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                      质量标准
                    </h4>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 500, color: "#64748b", display: "block", marginBottom: 6 }}>
                        准确率阈值
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={taskForm.qualityStandard.accuracyThreshold * 100}
                          onChange={(e) => updateQualityStandard({ accuracyThreshold: parseInt(e.target.value) / 100 })}
                          style={{ flex: 1 }}
                        />
                        <span style={{
                          padding: "6px 16px",
                          background: "#4f46e5",
                          color: "#fff",
                          borderRadius: 20,
                          fontSize: 14,
                          fontWeight: 600,
                          minWidth: 70,
                          textAlign: "center",
                        }}>
                          ≥{(taskForm.qualityStandard.accuracyThreshold * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 500, color: "#64748b", display: "block", marginBottom: 6 }}>
                        一致性要求
                      </label>
                      <textarea
                        value={taskForm.qualityStandard.consistencyRequirement}
                        onChange={(e) => updateQualityStandard({ consistencyRequirement: e.target.value })}
                        placeholder="如：同一目标多次标注结果一致率≥95%"
                        rows={2}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          fontSize: 13,
                          border: "1px solid #d1d5db",
                          borderRadius: 6,
                          outline: "none",
                          resize: "vertical",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 500, color: "#64748b", display: "block", marginBottom: 6 }}>
                        合格率底线
                      </label>
                      <textarea
                        value={taskForm.qualityStandard.qualificationRate}
                        onChange={(e) => updateQualityStandard({ qualificationRate: e.target.value })}
                        placeholder="如：合格率底线≥90%"
                        rows={2}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          fontSize: 13,
                          border: "1px solid #d1d5db",
                          borderRadius: 6,
                          outline: "none",
                          resize: "vertical",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* ===== 标注规范 ===== */}
                <div style={{
                  padding: 20,
                  background: "#fff",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: "linear-gradient(135deg, #fef3c7, #fcd34d)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <FileText size={14} style={{ color: "#d97706" }} />
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                      标注规范
                    </h4>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 500, color: "#64748b", display: "block", marginBottom: 6 }}>
                        标注指南
                      </label>
                      <textarea
                        value={taskForm.annotationSpec.guidelines}
                        onChange={(e) => updateAnnotationSpec({ guidelines: e.target.value })}
                        placeholder="1. 标注框需紧贴目标边缘&#10;2. 目标被遮挡超过50%时标注完整轮廓&#10;3. ..."
                        rows={4}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          fontSize: 13,
                          border: "1px solid #d1d5db",
                          borderRadius: 6,
                          outline: "none",
                          resize: "vertical",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 500, color: "#92400e", display: "block", marginBottom: 6 }}>
                        边界案例处理规则
                      </label>
                      <textarea
                        value={taskForm.annotationSpec.edgeCaseRules}
                        onChange={(e) => updateAnnotationSpec({ edgeCaseRules: e.target.value })}
                        placeholder="1. 模糊/过曝图像：降低置信度或跳过&#10;2. 截断目标：标注可见部分并标记&#10;3. ..."
                        rows={4}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          fontSize: 13,
                          border: "1px solid #fbbf24",
                          borderRadius: 6,
                          outline: "none",
                          resize: "vertical",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                          background: "#fffbeb",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 500, color: "#16a34a", display: "block", marginBottom: 6 }}>
                        示例集
                      </label>
                      <textarea
                        value={taskForm.annotationSpec.exampleSet}
                        onChange={(e) => updateAnnotationSpec({ exampleSet: e.target.value })}
                        placeholder="正例：标准车辆完整出现在画面中，标注框紧贴车身&#10;反例：标注框过大或过小，超出目标边界"
                        rows={3}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          fontSize: 13,
                          border: "1px solid #86efac",
                          borderRadius: 6,
                          outline: "none",
                          resize: "vertical",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                          background: "#f0fdf4",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 步骤 3: 评测指标 */}
          {currentStep === 3 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                  评测指标
                </h2>
                <button
                  onClick={addEvaluationMetric}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    fontSize: 13,
                    background: "#4f46e5",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} />
                  添加指标
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {taskForm.evaluationMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    style={{
                      padding: 16,
                      background: metric.isPrimary ? "#f5f3ff" : "#fff",
                      borderRadius: 8,
                      border: metric.isPrimary ? "1px solid #c4b5fd" : "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <div style={{ flex: 1 }}>
                        <input
                          type="text"
                          value={metric.name}
                          onChange={(e) => updateEvaluationMetric(metric.id, { name: e.target.value })}
                          placeholder="指标名称（如：精确率）"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            fontSize: 13,
                            border: "1px solid #d1d5db",
                            borderRadius: 6,
                            outline: "none",
                            marginBottom: 8,
                          }}
                        />
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            type="text"
                            value={metric.key}
                            onChange={(e) => updateEvaluationMetric(metric.id, { key: e.target.value })}
                            placeholder="指标 Key（如：precision）"
                            style={{
                              flex: 1,
                              padding: "6px 12px",
                              fontSize: 12,
                              border: "1px solid #d1d5db",
                              borderRadius: 4,
                              outline: "none",
                            }}
                          />
                          <input
                            type="number"
                            value={metric.threshold}
                            onChange={(e) => updateEvaluationMetric(metric.id, { threshold: parseFloat(e.target.value) || 0 })}
                            step="0.01"
                            placeholder="阈值"
                            style={{
                              width: 80,
                              padding: "6px 12px",
                              fontSize: 12,
                              border: "1px solid #d1d5db",
                              borderRadius: 4,
                              outline: "none",
                              textAlign: "center",
                            }}
                          />
                        </div>
                      </div>
                      <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", flexShrink: 0 }}>
                        <input
                          type="checkbox"
                          checked={metric.isPrimary}
                          onChange={(e) => updateEvaluationMetric(metric.id, { isPrimary: e.target.checked })}
                          style={{ width: 16, height: 16 }}
                        />
                        <span style={{ fontSize: 12, color: "#64748b" }}>核心指标</span>
                      </label>
                      <button
                        onClick={() => removeEvaluationMetric(metric.id)}
                        style={{
                          padding: 6,
                          background: "#fef2f2",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          color: "#ef4444",
                          flexShrink: 0,
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 500, color: "#64748b", display: "block", marginBottom: 6 }}>
                        中文语义描述
                      </label>
                      <textarea
                        value={metric.description || ""}
                        onChange={(e) => updateEvaluationMetric(metric.id, { description: e.target.value })}
                        placeholder="描述该指标的含义和评估标准，如：衡量预测为正类的样本中实际为正类的比例，避免误检"
                        rows={2}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          fontSize: 13,
                          border: "1px solid #d1d5db",
                          borderRadius: 6,
                          outline: "none",
                          resize: "vertical",
                          fontFamily: "inherit",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {taskForm.evaluationMetrics.length === 0 && (
                <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                  <ChartBar size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                  <p>暂无评测指标，点击上方按钮添加</p>
                </div>
              )}
            </div>
          )}

          {/* 步骤 4: 确认创建 */}
          {currentStep === 4 && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1e293b", marginBottom: 20 }}>
                确认创建
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* 基本信息摘要 */}
                <div style={{ padding: 16, background: "#f8fafc", borderRadius: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#475569", marginBottom: 12 }}>
                    基本信息
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>所属场景</div>
                      <div style={{ fontSize: 13, color: "#1e293b" }}>
                        {scenes.find((s) => s.id === taskForm.scene_id)?.name || "-"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>任务名称</div>
                      <div style={{ fontSize: 13, color: "#1e293b" }}>{taskForm.name || "-"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>任务类型</div>
                      <div style={{ fontSize: 13, color: "#1e293b" }}>{taskForm.task_type || "-"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>数据类型</div>
                      <div style={{ fontSize: 13, color: "#1e293b" }}>{taskForm.modality || "-"}</div>
                    </div>
                  </div>
                </div>

                {/* 数据需求摘要 */}
                <div style={{ padding: 16, background: "#f8fafc", borderRadius: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#475569", marginBottom: 12 }}>
                    数据需求
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>目标数据量</div>
                      <div style={{ fontSize: 13, color: "#1e293b" }}>
                        {taskForm.dataSpec.dataVolume || "-"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>数据类型</div>
                      <div style={{ fontSize: 13, color: "#1e293b" }}>
                        {taskForm.dataSpec.dataType || "-"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>语言</div>
                      <div style={{ fontSize: 13, color: "#1e293b" }}>
                        {taskForm.dataSpec.language || "-"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>领域范围</div>
                      <div style={{ fontSize: 13, color: "#1e293b" }}>
                        {taskForm.dataSpec.domain || "-"}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed #e2e8f0" }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>质量标准</div>
                    <div style={{ fontSize: 13, color: "#1e293b" }}>
                      准确率阈值 ≥{(taskForm.qualityStandard.accuracyThreshold * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* 评测指标摘要 */}
                <div style={{ padding: 16, background: "#f8fafc", borderRadius: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#475569", marginBottom: 12 }}>
                    评估指标 <span style={{ fontWeight: 400, color: "#94a3b8" }}>({taskForm.evaluationMetrics.length} 项)</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {taskForm.evaluationMetrics.map((metric) => (
                      <div key={metric.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, color: "#1e293b" }}>{metric.name}</span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>
                          {typeof metric.threshold === "number" && metric.threshold < 1
                            ? `≥${(metric.threshold * 100).toFixed(0)}%`
                            : `≥${metric.threshold}`}
                        </span>
                        {metric.isPrimary && (
                          <span
                            style={{
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontSize: 10,
                              background: "#4f46e5",
                              color: "#fff",
                            }}
                          >
                            核心
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 底部操作栏 */}
      <div
        style={{
          background: "#fff",
          borderTop: "1px solid #e2e8f0",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 20px",
            fontSize: 14,
            background: currentStep === 1 ? "#f1f5f9" : "#fff",
            color: currentStep === 1 ? "#94a3b8" : "#374151",
            border: "1px solid #e2e8f0",
            borderRadius: 6,
            cursor: currentStep === 1 ? "not-allowed" : "pointer",
          }}
        >
          <ArrowLeft size={16} />
          上一步
        </button>

        {currentStep < 4 ? (
          <button
            onClick={() => setCurrentStep((prev) => prev + 1)}
            disabled={!canProceed()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 24px",
              fontSize: 14,
              background: canProceed() ? "#4f46e5" : "#94a3b8",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: canProceed() ? "pointer" : "not-allowed",
            }}
          >
            下一步
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 24px",
              fontSize: 14,
              background: "#22c55e",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            <Check size={16} />
            确认创建
          </button>
        )}
      </div>
    </div>
  );
}

// ===== 页面组件（带 Suspense）=====
export default function TaskCreatePage() {
  return (
    <Suspense fallback={
      <div style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40,
            height: 40,
            border: "3px solid #e2e8f0",
            borderTopColor: "#4f46e5",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#64748b", fontSize: 14 }}>加载中...</p>
        </div>
      </div>
    }>
      <TaskCreateContent />
    </Suspense>
  );
}
