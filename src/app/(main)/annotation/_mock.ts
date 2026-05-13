// 共享 Mock 数据 - 数据标注
export interface AnnotationJob {
  id: string;
  name: string;
  dataset_id: string;
  dataset_name: string;
  annotators: string[];
  annotator_team?: string;  // 标注员团队描述
  label_template?: string;  // 模板
  total_items: number;
  completed_items: number;
  kappa_score?: number;
  status: string;
  task_type: string;
  annotation_type: string; // 标注类型（对应 Label Studio 控件）
  created_at: string;
}

// 标注类型字典（基于 Label Studio）
export const ANNOTATION_TYPES: Record<string, { label: string; description: string; ls_control: string; bg: string; color: string }> = {
  rect: { label: "矩形框标注", description: "目标检测、边界框标注", ls_control: "RectangleLabels", bg: "#dbeafe", color: "#1d4ed8" },
  polygon: { label: "多边形标注", description: "语义分割、实例分割", ls_control: "PolygonLabels", bg: "#f3e8ff", color: "#7c3aed" },
  keypoint: { label: "关键点标注", description: "人体关键点、地标检测", ls_control: "KeyPointLabels", bg: "#fef3c7", color: "#d97706" },
  track: { label: "目标跟踪标注", description: "多目标跟踪、ID关联", ls_control: "VideoRectangle + Relations", bg: "#d1fae5", color: "#059669" },
  segment: { label: "时序行为标注", description: "视频片段行为标注", ls_control: "VideoTimeline", bg: "#e0e7ff", color: "#4f46e5" },
  event: { label: "事件标签标注", description: "交通事件分类、严重程度", ls_control: "Taxonomy", bg: "#fee2e2", color: "#dc2626" },
  timeseries: { label: "时序异常标注", description: "时间序列异常点标记", ls_control: "TimeSeries + Choices", bg: "#ccfbf1", color: "#0d9488" },
  ner: { label: "命名实体识别", description: "文本实体抽取", ls_control: "TextArea + Entity", bg: "#f0fdf4", color: "#16a34a" },
  sentiment: { label: "情感分类标注", description: "文本情感倾向分析", ls_control: "Choices", bg: "#fdf4ff", color: "#c026d3" },
  audio_classify: { label: "音频分类标注", description: "音频片段分类", ls_control: "AudioText", bg: "#fef9c3", color: "#ca8a04" },
  ocr: { label: "OCR识别标注", description: "文字识别标注", ls_control: "TextArea", bg: "#f1f5f9", color: "#64748b" },
  text_classify: { label: "文本分类", description: "文本分类标注", ls_control: "Choices", bg: "#e0f2fe", color: "#0284c7" },
  image_classify: { label: "图像分类", description: "图像分类标注", ls_control: "Choices", bg: "#fce7f3", color: "#db2777" },
};

// 标注任务状态字典
export const ANNOTATION_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: "待开始", bg: "#fef9c3", color: "#ca8a04" },
  in_progress: { label: "标注中", bg: "#dbeafe", color: "#1d4ed8" },
  reviewing: { label: "审核中", bg: "#e0e7ff", color: "#4338ca" },
  completed: { label: "已完成", bg: "#dcfce7", color: "#15803d" },
  paused: { label: "已暂停", bg: "#fee2e2", color: "#dc2626" },
  rejected: { label: "已驳回", bg: "#fef2f2", color: "#b91c1c" },
};

// 五核心任务标注任务 Mock 数据
export const MOCK_ANNOTATION_JOBS: AnnotationJob[] = [
  // ========== 交通事件识别场景 - 五核心任务专家标注 ==========
  {
    id: "anno_expert_det",
    name: "目标检测专家标注",
    dataset_id: "ds_traffic_det",
    dataset_name: "交通目标检测数据集",
    annotators: ["CV工程师(3)", "交通专家(2)"],
    annotator_team: "CV工程师(3) + 交通专家(2)",
    label_template: "rect",
    total_items: 18500,
    completed_items: 7400,
    kappa_score: 0.91,
    status: "in_progress",
    task_type: "交通目标检测",
    annotation_type: "rect",
    created_at: "2026-04-20T08:00:00Z"
  },
  {
    id: "anno_expert_mot",
    name: "MOT 专家轨迹审核",
    dataset_id: "ds_traffic_mot",
    dataset_name: "多目标跟踪数据集",
    annotators: ["CV工程师(2)", "交通工程师(2)"],
    annotator_team: "CV工程师(2) + 交通工程师(2)",
    label_template: "track",
    total_items: 12400,
    completed_items: 4960,
    kappa_score: 0.86,
    status: "in_progress",
    task_type: "多目标跟踪",
    annotation_type: "track",
    created_at: "2026-04-19T09:30:00Z"
  },
  {
    id: "anno_expert_beh",
    name: "行为识别专家标注",
    dataset_id: "ds_traffic_beh",
    dataset_name: "交通行为识别数据集",
    annotators: ["交通行为专家(3)", "CV(1)"],
    annotator_team: "交通行为专家(3) + CV(1)",
    label_template: "segment",
    total_items: 9800,
    completed_items: 4900,
    kappa_score: 0.88,
    status: "in_progress",
    task_type: "交通行为识别",
    annotation_type: "segment",
    created_at: "2026-04-18T10:00:00Z"
  },
  {
    id: "anno_expert_event",
    name: "事件识别专家标注",
    dataset_id: "ds_traffic_event",
    dataset_name: "交通事件识别数据集",
    annotators: ["交警(3)", "专家王磊(1)"],
    annotator_team: "交警(3) + 专家王磊(1)",
    label_template: "event",
    total_items: 7980,
    completed_items: 3192,
    kappa_score: 0.87,
    status: "in_progress",
    task_type: "交通事件识别",
    annotation_type: "event",
    created_at: "2026-04-17T08:30:00Z"
  },
  {
    id: "anno_expert_ts",
    name: "时序异常专家复核",
    dataset_id: "ds_traffic_ts",
    dataset_name: "交通流时序数据集",
    annotators: ["交通工程师(2)", "数据分析师(1)"],
    annotator_team: "交通工程师(2) + 数据分析师(1)",
    label_template: "timeseries",
    total_items: 43200,
    completed_items: 17280,
    kappa_score: 0.84,
    status: "in_progress",
    task_type: "时序建模与异常分析",
    annotation_type: "timeseries",
    created_at: "2026-04-16T09:00:00Z"
  },
  // ========== 其他场景任务（保留原有数据）==========
  {
    id: "anno_det_001",
    name: "目标检测标注-批次01",
    dataset_id: "ds_det_001",
    dataset_name: "COCO-Traffic-2024",
    annotators: ["张明远", "李晓峰", "王雪梅", "陈志远"],
    annotator_team: "标注团队A",
    total_items: 50000,
    completed_items: 50000,
    kappa_score: 0.924,
    status: "completed",
    task_type: "目标检测",
    annotation_type: "rect",
    label_template: "rect_12classes",
    created_at: "2026-04-01T08:00:00Z"
  },
  {
    id: "anno_track_001",
    name: "跟踪轨迹标注-视频批",
    dataset_id: "ds_track_001",
    dataset_name: "MOT17-Traffic",
    annotators: ["李晓峰", "刘宇轩"],
    annotator_team: "标注团队B",
    total_items: 8640,
    completed_items: 6221,
    kappa_score: 0.891,
    status: "in_progress",
    task_type: "多目标跟踪",
    annotation_type: "track",
    label_template: "mot_id_track",
    created_at: "2026-04-05T09:30:00Z"
  },
  {
    id: "anno_beh_001",
    name: "行为片段标注-V3",
    dataset_id: "ds_beh_001",
    dataset_name: "TrafficBehavior-V3",
    annotators: ["王雪梅", "陈志远", "赵敏"],
    annotator_team: "标注团队C",
    total_items: 34200,
    completed_items: 16416,
    kappa_score: 0.867,
    status: "in_progress",
    task_type: "交通行为识别",
    annotation_type: "segment",
    label_template: "behavior_timeline",
    created_at: "2026-04-08T10:00:00Z"
  },
  {
    id: "anno_event_001",
    name: "事件识别标注-多模态",
    dataset_id: "ds_event_001",
    dataset_name: "TrafficEvent-Dataset-2026",
    annotators: ["张明远", "王雪梅", "陈志远", "刘宇轩"],
    annotator_team: "标注团队D",
    total_items: 52800,
    completed_items: 18480,
    kappa_score: 0.882,
    status: "in_progress",
    task_type: "交通事件识别",
    annotation_type: "event",
    label_template: "event_classify",
    created_at: "2026-04-03T08:30:00Z"
  },
  {
    id: "anno_ts_001",
    name: "时序异常标注-批次01",
    dataset_id: "ds_ts_001",
    dataset_name: "TrafficTimeSeries-2026",
    annotators: ["李晓峰", "刘宇轩"],
    annotator_team: "标注团队E",
    total_items: 15000,
    completed_items: 15000,
    kappa_score: 0.948,
    status: "completed",
    task_type: "时序建模与异常分析",
    annotation_type: "timeseries",
    label_template: "anomaly_timeseries",
    created_at: "2026-04-15T09:00:00Z"
  },
  {
    id: "aj1",
    name: "客服意图识别标注-批次1",
    dataset_id: "ds-1",
    dataset_name: "客服对话语料_v1",
    annotators: ["张三", "李四", "王五"],
    annotator_team: "标注团队F",
    total_items: 500,
    completed_items: 380,
    kappa_score: 0.78,
    status: "in_progress",
    task_type: "文本分类",
    annotation_type: "ner",
    label_template: "text_classify",
    created_at: "2025-11-10T08:00:00Z"
  },
];

export const STORAGE_KEY = "taskforge_annotation_jobs";

// 兼容别名
export const MOCK_JOBS = MOCK_ANNOTATION_JOBS;
