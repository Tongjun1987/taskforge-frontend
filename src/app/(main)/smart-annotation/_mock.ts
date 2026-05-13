// 智能标注任务 Mock 数据（共享）
export interface SmartAnnotationJob {
  id: string;
  name: string;
  dataset_id: string;
  dataset_name: string;
  task_name: string; // 关联任务名称
  model_name: string;
  strategy: string; // 预标注策略
  total_items: number;
  prelabeled_items: number;
  pending_review: number;
  auto_approved: number;
  auto_rate: number; // AI自动化率
  status: string;
  created_at: string;
  confidence_threshold?: number;
  sampling_rate?: number;
  auto_pass_threshold?: number;
}

// 预标注策略字典
export const PRELABEL_STRATEGIES = [
  { value: "full_prelabel", label: "全量预标注", description: "AI模型对所有数据进行预标注" },
  { value: "active_learning", label: "主动学习", description: "选择不确定性样本进行人工标注" },
  { value: "confidence_filter", label: "置信度过滤", description: "高置信度自动通过，低置信度人工复核" },
  { value: "unsupervised", label: "无监督标注", description: "使用聚类/异常检测等无监督方法" },
];

// 五核心任务智能标注 Mock 数据（基于 V2 仿真）
export const MOCK_SMART_JOBS: SmartAnnotationJob[] = [
  // ========== 交通事件识别场景 - 五核心任务智能标注 ==========
  {
    id: "sa_det_001",
    name: "目标检测预标注",
    dataset_id: "ds_det_001",
    dataset_name: "COCO-Traffic-2024",
    task_name: "交通目标检测",
    model_name: "YOLOv8x-traffic-v2",
    strategy: "full_prelabel",
    total_items: 18500,
    prelabeled_items: 18500,
    pending_review: 2220,
    auto_approved: 16280,
    auto_rate: 88.0,
    status: "completed",
    created_at: "2026-04-02T08:00:00Z",
    confidence_threshold: 0.85,
    auto_pass_threshold: 0.92,
  },
  {
    id: "sa_track_001",
    name: "MOT轨迹自动关联",
    dataset_id: "ds_track_001",
    dataset_name: "MOT17-Traffic",
    task_name: "多目标跟踪",
    model_name: "ByteTrack-v1",
    strategy: "full_prelabel",
    total_items: 12400,
    prelabeled_items: 12400,
    pending_review: 1860,
    auto_approved: 10540,
    auto_rate: 85.0,
    status: "running",
    created_at: "2026-04-05T09:30:00Z",
    confidence_threshold: 0.80,
    auto_pass_threshold: 0.88,
  },
  {
    id: "sa_beh_001",
    name: "行为识别预分类",
    dataset_id: "ds_beh_001",
    dataset_name: "TrafficBehavior-V3",
    task_name: "交通行为识别",
    model_name: "VideoSwin-B",
    strategy: "active_learning",
    total_items: 9800,
    prelabeled_items: 9800,
    pending_review: 1960,
    auto_approved: 7840,
    auto_rate: 80.0,
    status: "running",
    created_at: "2026-04-08T10:00:00Z",
    confidence_threshold: 0.85,
    sampling_rate: 0.25,
    auto_pass_threshold: 0.90,
  },
  {
    id: "sa_event_001",
    name: "事件识别预标注",
    dataset_id: "ds_event_001",
    dataset_name: "TrafficEvent-Dataset-2026",
    task_name: "交通事件识别",
    model_name: "YOLOv8-event-v1",
    strategy: "full_prelabel",
    total_items: 7980,
    prelabeled_items: 7980,
    pending_review: 1596,
    auto_approved: 6384,
    auto_rate: 80.0,
    status: "completed",
    created_at: "2026-04-03T08:30:00Z",
    confidence_threshold: 0.85,
    auto_pass_threshold: 0.90,
  },
  {
    id: "sa_ts_001",
    name: "时序异常自动标记",
    dataset_id: "ds_ts_001",
    dataset_name: "TrafficTimeSeries-2026",
    task_name: "时序建模与异常分析",
    model_name: "IsolationForest",
    strategy: "unsupervised",
    total_items: 480000,
    prelabeled_items: 480000,
    pending_review: 43200,
    auto_approved: 436800,
    auto_rate: 91.0,
    status: "running",
    created_at: "2026-04-15T09:00:00Z",
    confidence_threshold: 0.90,
    auto_pass_threshold: 0.95,
  },
  // ========== 其他智能标注任务 ==========
  {
    id: "sa-1",
    name: "意图识别-主动学习标注",
    dataset_id: "ds-1",
    dataset_name: "客服意图识别数据集",
    task_name: "意图识别",
    model_name: "意图识别模型-v3.2",
    strategy: "active_learning",
    total_items: 5000,
    prelabeled_items: 3200,
    pending_review: 480,
    auto_approved: 2720,
    auto_rate: 85.0,
    status: "running",
    created_at: "2026-04-10T08:00:00Z",
    confidence_threshold: 0.85,
    sampling_rate: 0.2,
    auto_pass_threshold: 0.95,
  },
  {
    id: "sa-2",
    name: "情感分析-全量预标注",
    dataset_id: "ds-3",
    dataset_name: "情感分析语料库",
    task_name: "情感分析",
    model_name: "情感分析模型-v2.1",
    strategy: "full_prelabel",
    total_items: 12000,
    prelabeled_items: 12000,
    pending_review: 2400,
    auto_approved: 9600,
    auto_rate: 80.0,
    status: "completed",
    created_at: "2026-04-08T10:00:00Z",
    confidence_threshold: 0.9,
    auto_pass_threshold: 0.92,
  },
  {
    id: "sa-3",
    name: "NER-置信度过滤标注",
    dataset_id: "ds-1",
    dataset_name: "金融新闻语料",
    task_name: "命名实体识别",
    model_name: "BERT-NER-v1.5",
    strategy: "confidence_filter",
    total_items: 8500,
    prelabeled_items: 8500,
    pending_review: 1275,
    auto_approved: 7225,
    auto_rate: 85.0,
    status: "running",
    created_at: "2026-04-11T09:00:00Z",
    confidence_threshold: 0.7,
    auto_pass_threshold: 0.9,
  },
  {
    id: "sa-4",
    name: "图像分类-主动学习",
    dataset_id: "ds-2",
    dataset_name: "产品分类图像集",
    task_name: "图像分类",
    model_name: "图像分类模型-v2.0",
    strategy: "active_learning",
    total_items: 8500,
    prelabeled_items: 5100,
    pending_review: 850,
    auto_approved: 4250,
    auto_rate: 83.3,
    status: "running",
    created_at: "2026-04-12T14:00:00Z",
    confidence_threshold: 0.8,
    sampling_rate: 0.15,
    auto_pass_threshold: 0.93,
  },
];

export const STORAGE_KEY = "taskforge_smart_annotation_jobs";

export function getSmartJobs(): SmartAnnotationJob[] {
  if (typeof window === "undefined") return MOCK_SMART_JOBS;
  const d = localStorage.getItem(STORAGE_KEY);
  return d ? JSON.parse(d) : MOCK_SMART_JOBS;
}

export function saveSmartJobs(jobs: SmartAnnotationJob[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}
