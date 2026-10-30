// ============================================================
// 数据质检管理 - 数据层
// 纯数据模块（无 "use client"），server / client 均可引用
// 口径对齐需求 4.3.4-1 ~ 4.3.4-4
// ============================================================

// ---------------------------------------------------------- 六维质量模型
export type QcDim =
  | "completeness"
  | "accuracy"
  | "consistency"
  | "uniqueness"
  | "timeliness"
  | "validity";

export interface QcDimMeta {
  key: QcDim;
  label: string;
  short: string;
  desc: string;
  tone: string;
  soft: string;
}

export const QC_DIMS: QcDimMeta[] = [
  {
    key: "completeness",
    label: "完整性",
    short: "缺失",
    desc: "校验必填字段、标注框、关键帧的缺失情况",
    tone: "#4f46e5",
    soft: "#f5f3ff",
  },
  {
    key: "accuracy",
    label: "准确性",
    short: "正确",
    desc: "校验数据值域、枚举、格式与业务含义是否正确",
    tone: "#0ea5e9",
    soft: "#f0f9ff",
  },
  {
    key: "consistency",
    label: "一致性",
    short: "一致",
    desc: "校验跨数据源匹配度、双人标注一致性与时序对齐",
    tone: "#8b5cf6",
    soft: "#faf5ff",
  },
  {
    key: "uniqueness",
    label: "唯一性",
    short: "重复",
    desc: "校验主键重复与近重复样本（感知哈希）",
    tone: "#f59e0b",
    soft: "#fffbeb",
  },
  {
    key: "timeliness",
    label: "时效性",
    short: "时效",
    desc: "校验批次产出 SLA 与数据新鲜度",
    tone: "#14b8a6",
    soft: "#f0fdfa",
  },
  {
    key: "validity",
    label: "规范性",
    short: "规范",
    desc: "校验字典白名单、坐标格式、元数据规范符合度",
    tone: "#16a34a",
    soft: "#f0fdf4",
  },
];

export const QC_DIM_MAP: Record<QcDim, QcDimMeta> = QC_DIMS.reduce(
  (acc, d) => ({ ...acc, [d.key]: d }),
  {} as Record<QcDim, QcDimMeta>
);

// ---------------------------------------------------------- 数据集与字段
export const QC_DATASETS = [
  "交通事件识别数据集",
  "交通目标检测数据集",
  "多目标跟踪数据集",
  "交通行为识别数据集",
] as const;

export interface QcField {
  name: string;
  label: string;
  type: string;
}

export const QC_FIELDS: Record<string, QcField[]> = {
  交通事件识别数据集: [
    { name: "video_id", label: "视频编号", type: "string" },
    { name: "frame_id", label: "帧号", type: "int" },
    { name: "event_type", label: "事件类型", type: "enum(12)" },
    { name: "start_time", label: "事件开始时间", type: "datetime" },
    { name: "end_time", label: "事件结束时间", type: "datetime" },
    { name: "bbox", label: "标注框", type: "float[4]" },
    { name: "confidence", label: "置信度", type: "float" },
    { name: "label_status", label: "标注状态", type: "enum(3)" },
    { name: "annotator", label: "标注员", type: "string" },
  ],
  交通目标检测数据集: [
    { name: "image_id", label: "图像编号", type: "string" },
    { name: "class_id", label: "类别编号", type: "enum(12)" },
    { name: "bbox_x", label: "框左上 X", type: "float" },
    { name: "bbox_y", label: "框左上 Y", type: "float" },
    { name: "bbox_w", label: "框宽", type: "float" },
    { name: "bbox_h", label: "框高", type: "float" },
    { name: "occluded", label: "遮挡标记", type: "bool" },
    { name: "image_width", label: "图像宽度", type: "int" },
  ],
  多目标跟踪数据集: [
    { name: "track_id", label: "轨迹编号", type: "string" },
    { name: "frame_id", label: "帧号", type: "int" },
    { name: "timestamp", label: "时间戳", type: "int(ms)" },
    { name: "ingest_time", label: "入库时间", type: "datetime" },
    { name: "cam_intrinsic", label: "相机内参", type: "float[9]" },
    { name: "cam_extrinsic", label: "相机外参", type: "float[16]" },
    { name: "bbox", label: "跟踪框", type: "float[4]" },
  ],
  交通行为识别数据集: [
    { name: "person_id", label: "目标编号", type: "string" },
    { name: "action_type", label: "行为类型", type: "enum(8)" },
    { name: "duration", label: "行为时长", type: "float(s)" },
    { name: "split", label: "数据划分", type: "enum(train/val/test)" },
    { name: "label_status", label: "标注状态", type: "enum(3)" },
    { name: "clip_path", label: "视频片段路径", type: "string" },
  ],
};

// ---------------------------------------------------------- 质量规则
export type QcRuleType = "expression" | "threshold" | "script" | "enum";
export type QcLevel = "critical" | "major" | "minor";

export interface QcRule {
  id: string;
  name: string;
  dim: QcDim;
  dataset: string;
  fields: string[];
  type: QcRuleType;
  expr: string;
  op: string;
  threshold: string;
  sampleRate: number;
  level: QcLevel;
  on: boolean;
  hits7d: number;
  owner: string;
  updatedAt: string;
  fromTemplate?: string;
}

export const QC_RULE_TYPE_LABEL: Record<QcRuleType, string> = {
  expression: "表达式",
  threshold: "阈值",
  script: "脚本",
  enum: "枚举",
};

export const QC_LEVEL_META: Record<QcLevel, { label: string; tone: string; soft: string }> = {
  critical: { label: "严重", tone: "#dc2626", soft: "#fef2f2" },
  major: { label: "一般", tone: "#b45309", soft: "#fffbeb" },
  minor: { label: "提示", tone: "#0ea5e9", soft: "#f0f9ff" },
};

export const QC_RULES: QcRule[] = [
  {
    id: "QCR-0001",
    name: "必填字段完整率",
    dim: "completeness",
    dataset: "交通事件识别数据集",
    fields: ["event_type", "start_time", "end_time"],
    type: "expression",
    expr: "null_ratio(event_type, start_time, end_time) <= 0.001",
    op: "<=",
    threshold: "0.1%",
    sampleRate: 100,
    level: "critical",
    on: true,
    hits7d: 12,
    owner: "李工 · 数据质量",
    updatedAt: "2026-10-18 10:20",
    fromTemplate: "RUL-QC-001",
  },
  {
    id: "QCR-0002",
    name: "标注框捕获率",
    dim: "completeness",
    dataset: "交通目标检测数据集",
    fields: ["bbox"],
    type: "expression",
    expr: "count(bbox is null) / count(*) <= 0.005",
    op: "<=",
    threshold: "0.5%",
    sampleRate: 30,
    level: "major",
    on: true,
    hits7d: 8,
    owner: "李工 · 数据质量",
    updatedAt: "2026-10-17 16:05",
  },
  {
    id: "QCR-0003",
    name: "关键帧覆盖率",
    dim: "completeness",
    dataset: "多目标跟踪数据集",
    fields: ["frame_id"],
    type: "expression",
    expr: "distinct(frame_id) / expected_frames >= 0.98",
    op: ">=",
    threshold: "98%",
    sampleRate: 100,
    level: "major",
    on: true,
    hits7d: 5,
    owner: "王工 · 数据质量",
    updatedAt: "2026-10-16 09:40",
  },
  {
    id: "QCR-0004",
    name: "事件类型值域校验",
    dim: "accuracy",
    dataset: "交通事件识别数据集",
    fields: ["event_type"],
    type: "enum",
    expr: "enum_in(event_type, EVENT_DICT_12)",
    op: "=",
    threshold: "越界 0 条",
    sampleRate: 100,
    level: "critical",
    on: true,
    hits7d: 21,
    owner: "李工 · 数据质量",
    updatedAt: "2026-10-19 11:12",
    fromTemplate: "RUL-QC-005",
  },
  {
    id: "QCR-0005",
    name: "标注框坐标值域",
    dim: "accuracy",
    dataset: "交通目标检测数据集",
    fields: ["bbox_x", "bbox_y", "bbox_w", "bbox_h"],
    type: "expression",
    expr: "range_between(bbox_x, 0, image_width) and range_between(bbox_y, 0, image_height)",
    op: "=",
    threshold: "越界 0 条",
    sampleRate: 100,
    level: "critical",
    on: true,
    hits7d: 34,
    owner: "陈工 · 平台",
    updatedAt: "2026-10-19 15:30",
    fromTemplate: "RUL-QC-005",
  },
  {
    id: "QCR-0006",
    name: "行为时长合理性",
    dim: "accuracy",
    dataset: "交通行为识别数据集",
    fields: ["duration"],
    type: "expression",
    expr: "range_between(duration, 0.2, 60)",
    op: "<=",
    threshold: "越界 0 条",
    sampleRate: 50,
    level: "major",
    on: true,
    hits7d: 6,
    owner: "王工 · 数据质量",
    updatedAt: "2026-10-15 14:00",
  },
  {
    id: "QCR-0007",
    name: "跨源主键对账",
    dim: "consistency",
    dataset: "交通事件识别数据集",
    fields: ["video_id", "frame_id"],
    type: "expression",
    expr: "match_rate(事件表, 视频索引表, video_id + frame_id) >= 0.995",
    op: ">=",
    threshold: "99.5%",
    sampleRate: 20,
    level: "critical",
    on: true,
    hits7d: 9,
    owner: "李工 · 数据质量",
    updatedAt: "2026-10-20 09:05",
  },
  {
    id: "QCR-0008",
    name: "双人标注一致性 IoU",
    dim: "consistency",
    dataset: "交通事件识别数据集",
    fields: ["bbox"],
    type: "threshold",
    expr: "iou(annotator_a, annotator_b)",
    op: ">=",
    threshold: "0.85",
    sampleRate: 10,
    level: "major",
    on: true,
    hits7d: 14,
    owner: "李工 · 数据质量",
    updatedAt: "2026-10-18 17:44",
    fromTemplate: "RUL-QC-003",
  },
  {
    id: "QCR-0009",
    name: "标注与元数据时序一致",
    dim: "consistency",
    dataset: "多目标跟踪数据集",
    fields: ["timestamp", "frame_id"],
    type: "expression",
    expr: "abs(timestamp - frame_timestamp) <= 40",
    op: "<=",
    threshold: "40 ms",
    sampleRate: 100,
    level: "minor",
    on: true,
    hits7d: 3,
    owner: "王工 · 数据质量",
    updatedAt: "2026-10-14 10:10",
  },
  {
    id: "QCR-0010",
    name: "主键唯一性",
    dim: "uniqueness",
    dataset: "交通事件识别数据集",
    fields: ["video_id", "frame_id"],
    type: "expression",
    expr: "count_dup(video_id, frame_id) = 0",
    op: "=",
    threshold: "0 条",
    sampleRate: 100,
    level: "critical",
    on: true,
    hits7d: 2,
    owner: "李工 · 数据质量",
    updatedAt: "2026-10-18 09:30",
    fromTemplate: "RUL-QC-002",
  },
  {
    id: "QCR-0011",
    name: "图像近重复检测",
    dim: "uniqueness",
    dataset: "交通目标检测数据集",
    fields: ["image_id"],
    type: "script",
    expr: "phash_distance(image_id, 已入库样本) <= 5",
    op: "<=",
    threshold: "汉明距离 5",
    sampleRate: 100,
    level: "major",
    on: true,
    hits7d: 17,
    owner: "陈工 · 平台",
    updatedAt: "2026-10-19 20:02",
  },
  {
    id: "QCR-0012",
    name: "批次产出 SLA",
    dim: "timeliness",
    dataset: "交通事件识别数据集",
    fields: ["end_time"],
    type: "threshold",
    expr: "batch_duration",
    op: "<=",
    threshold: "4 h",
    sampleRate: 100,
    level: "major",
    on: true,
    hits7d: 4,
    owner: "刘工 · 运维",
    updatedAt: "2026-10-17 11:20",
    fromTemplate: "RUL-QC-006",
  },
  {
    id: "QCR-0013",
    name: "数据新鲜度",
    dim: "timeliness",
    dataset: "多目标跟踪数据集",
    fields: ["ingest_time"],
    type: "expression",
    expr: "now() - ingest_time <= interval '24 hour'",
    op: "<=",
    threshold: "24 h",
    sampleRate: 100,
    level: "minor",
    on: true,
    hits7d: 2,
    owner: "刘工 · 运维",
    updatedAt: "2026-10-13 15:50",
  },
  {
    id: "QCR-0014",
    name: "类别字典白名单",
    dim: "validity",
    dataset: "交通目标检测数据集",
    fields: ["class_id"],
    type: "enum",
    expr: "class_id in DICT_CLASS_12",
    op: "=",
    threshold: "越界 0 条",
    sampleRate: 100,
    level: "critical",
    on: true,
    hits7d: 11,
    owner: "陈工 · 平台",
    updatedAt: "2026-10-19 09:15",
    fromTemplate: "RUL-QC-005",
  },
  {
    id: "QCR-0015",
    name: "坐标格式规范",
    dim: "validity",
    dataset: "交通目标检测数据集",
    fields: ["bbox"],
    type: "expression",
    expr: "regex_match(bbox, '^[0-9.]+,[0-9.]+,[0-9.]+,[0-9.]+$')",
    op: "=",
    threshold: "不合规 0 条",
    sampleRate: 100,
    level: "major",
    on: true,
    hits7d: 7,
    owner: "陈工 · 平台",
    updatedAt: "2026-10-12 16:35",
  },
  {
    id: "QCR-0016",
    name: "相机参数完整性",
    dim: "validity",
    dataset: "多目标跟踪数据集",
    fields: ["cam_intrinsic", "cam_extrinsic"],
    type: "expression",
    expr: "not_null(cam_intrinsic, cam_extrinsic)",
    op: "=",
    threshold: "缺失 0 条",
    sampleRate: 100,
    level: "minor",
    on: false,
    hits7d: 1,
    owner: "王工 · 数据质量",
    updatedAt: "2026-10-11 10:05",
  },
  {
    id: "QCR-0017",
    name: "训练集划分比例",
    dim: "validity",
    dataset: "交通行为识别数据集",
    fields: ["split"],
    type: "threshold",
    expr: "split_ratio(train)",
    op: ">=",
    threshold: "70% ± 10%",
    sampleRate: 100,
    level: "major",
    on: true,
    hits7d: 1,
    owner: "王工 · 数据质量",
    updatedAt: "2026-10-10 14:25",
  },
  {
    id: "QCR-0018",
    name: "标签覆盖率",
    dim: "completeness",
    dataset: "交通行为识别数据集",
    fields: ["label_status"],
    type: "expression",
    expr: "labeled_coverage(label_status) >= 0.95",
    op: ">=",
    threshold: "95%",
    sampleRate: 100,
    level: "major",
    on: true,
    hits7d: 3,
    owner: "李工 · 数据质量",
    updatedAt: "2026-10-09 08:40",
  },
];

// ---------------------------------------------------------- 智能检测器
export type DetectorKey = "outlier" | "noise" | "semantic" | "imageq";

export interface QcDetector {
  key: DetectorKey;
  name: string;
  algo: string;
  desc: string;
  version: string;
  samples: number;
  precision: number;
  recall: number;
  f1: number;
  lastTrain: string;
  on: boolean;
  found: number;
  tone: string;
  history: { version: string; precision: number; recall: number }[];
}

export const QC_DETECTORS: QcDetector[] = [
  {
    key: "outlier",
    name: "统计分布异常检测",
    algo: "Z-score + IQR 双阈值",
    desc: "对数值型字段做分布拟合，识别偏离 3σ 或超出 IQR 1.5 倍的异常值，无需标注样本",
    version: "v3.2",
    samples: 0,
    precision: 96.4,
    recall: 91.2,
    f1: 93.7,
    lastTrain: "无需训练（统计方法）",
    on: true,
    found: 46,
    tone: "#4f46e5",
    history: [
      { version: "v3.0", precision: 92.8, recall: 88.5 },
      { version: "v3.1", precision: 94.6, recall: 89.9 },
      { version: "v3.2", precision: 96.4, recall: 91.2 },
    ],
  },
  {
    key: "noise",
    name: "深度学习噪声识别",
    algo: "NoiseNet-ResNet50",
    desc: "识别标签噪声、错标漏标与跨类别混淆样本，输出噪声概率并给出候选正确标签",
    version: "v2.5",
    samples: 128400,
    precision: 93.1,
    recall: 89.6,
    f1: 91.3,
    lastTrain: "2026-10-14 22:10",
    on: true,
    found: 132,
    tone: "#0ea5e9",
    history: [
      { version: "v1.0", precision: 84.2, recall: 79.5 },
      { version: "v2.0", precision: 89.7, recall: 85.2 },
      { version: "v2.4", precision: 91.8, recall: 88.1 },
      { version: "v2.5", precision: 93.1, recall: 89.6 },
    ],
  },
  {
    key: "semantic",
    name: "语义一致性检测",
    algo: "HHEM-2.1 + BERTScore",
    desc: "对文本型标注做语义蕴含与相似度判定，识别描述与原文不符、答非所问类问题",
    version: "v1.8",
    samples: 86200,
    precision: 90.5,
    recall: 87.3,
    f1: 88.9,
    lastTrain: "2026-10-16 03:40",
    on: true,
    found: 58,
    tone: "#8b5cf6",
    history: [
      { version: "v1.0", precision: 81.4, recall: 76.8 },
      { version: "v1.5", precision: 87.2, recall: 84.0 },
      { version: "v1.8", precision: 90.5, recall: 87.3 },
    ],
  },
  {
    key: "imageq",
    name: "图像质量评估",
    algo: "Artimuse + BRISQUE",
    desc: "评估模糊、过曝、欠曝、压缩伪影等成像缺陷，输出质量分并拦截不可用帧",
    version: "v4.0",
    samples: 156800,
    precision: 95.2,
    recall: 92.8,
    f1: 94.0,
    lastTrain: "2026-10-18 01:25",
    on: true,
    found: 87,
    tone: "#f59e0b",
    history: [
      { version: "v2.0", precision: 88.5, recall: 84.1 },
      { version: "v3.0", precision: 92.3, recall: 89.7 },
      { version: "v3.5", precision: 93.9, recall: 91.4 },
      { version: "v4.0", precision: 95.2, recall: 92.8 },
    ],
  },
];

export const DETECTOR_MAP = QC_DETECTORS.reduce(
  (acc, d) => ({ ...acc, [d.key]: d }),
  {} as Record<DetectorKey, QcDetector>
);

// ---------------------------------------------------------- 检测任务
export interface QcDetectJob {
  id: string;
  dataset: string;
  batch: string;
  detectors: DetectorKey[];
  total: number;
  found: number;
  status: "running" | "done" | "failed";
  startedAt: string;
  cost: string;
  operator: string;
}

export const QC_DETECT_JOBS: QcDetectJob[] = [
  {
    id: "QDJ-20261020-01",
    dataset: "交通事件识别数据集",
    batch: "RUN-2003",
    detectors: ["outlier", "noise", "imageq"],
    total: 8542,
    found: 216,
    status: "running",
    startedAt: "2026-10-20 14:02",
    cost: "运行 18 分钟",
    operator: "系统自动",
  },
  {
    id: "QDJ-20261020-00",
    dataset: "交通目标检测数据集",
    batch: "RUN-2001",
    detectors: ["outlier", "noise", "imageq", "semantic"],
    total: 12600,
    found: 348,
    status: "done",
    startedAt: "2026-10-20 09:30",
    cost: "26 分 12 秒",
    operator: "王强",
  },
  {
    id: "QDJ-20261019-02",
    dataset: "多目标跟踪数据集",
    batch: "RUN-2005",
    detectors: ["outlier", "noise"],
    total: 9820,
    found: 174,
    status: "done",
    startedAt: "2026-10-19 20:15",
    cost: "14 分 05 秒",
    operator: "李明",
  },
  {
    id: "QDJ-20261019-01",
    dataset: "交通行为识别数据集",
    batch: "RUN-2004",
    detectors: ["outlier", "semantic"],
    total: 6400,
    found: 92,
    status: "done",
    startedAt: "2026-10-19 10:08",
    cost: "9 分 44 秒",
    operator: "王雪梅",
  },
  {
    id: "QDJ-20261018-03",
    dataset: "交通事件识别数据集",
    batch: "RUN-2002",
    detectors: ["noise", "imageq"],
    total: 7980,
    found: 0,
    status: "failed",
    startedAt: "2026-10-18 22:40",
    cost: "中断于 2 分 31 秒",
    operator: "系统自动",
  },
];

// ---------------------------------------------------------- 检出样例
export interface QcSample {
  id: string;
  detector: DetectorKey;
  dataset: string;
  sampleId: string;
  field: string;
  content: string;
  reason: string;
  confidence: number;
  review: "pending" | "confirmed" | "false";
}

export const QC_SAMPLES: QcSample[] = [
  {
    id: "S-1",
    detector: "outlier",
    dataset: "交通事件识别数据集",
    sampleId: "TE-2026-0085412",
    field: "confidence",
    content: "confidence = 0.02（同批次均值 0.87）",
    reason: "低于 3σ 下界，疑似预标注模型异常输出",
    confidence: 0.98,
    review: "confirmed",
  },
  {
    id: "S-2",
    detector: "noise",
    dataset: "交通目标检测数据集",
    sampleId: "TD-2026-0021887",
    field: "class_id",
    content: "class_id = 12（车辆）· bbox 覆盖人行道区域",
    reason: "标签与框内目标语义不符，候选标签：行人",
    confidence: 0.91,
    review: "confirmed",
  },
  {
    id: "S-3",
    detector: "imageq",
    dataset: "交通目标检测数据集",
    sampleId: "TD-2026-0022014",
    field: "image",
    content: "1920×1080 · 亮度均值 12 · 噪声比 0.41",
    reason: "夜间低照度严重欠曝，标注框不可辨识",
    confidence: 0.94,
    review: "pending",
  },
  {
    id: "S-4",
    detector: "semantic",
    dataset: "交通事件识别数据集",
    sampleId: "TE-2026-0085503",
    field: "event_desc",
    content: "描述：车辆正常通行 · 事件类型：交通拥堵",
    reason: "描述语义与事件类型相悖，蕴含度 0.12",
    confidence: 0.89,
    review: "confirmed",
  },
  {
    id: "S-5",
    detector: "outlier",
    dataset: "多目标跟踪数据集",
    sampleId: "MT-2026-0014336",
    field: "timestamp",
    content: "timestamp = 17892 ms（相邻帧 333 ms）",
    reason: "间隔异常放大 53 倍，疑似丢帧后补偿错误",
    confidence: 0.96,
    review: "pending",
  },
  {
    id: "S-6",
    detector: "noise",
    dataset: "交通事件识别数据集",
    sampleId: "TE-2026-0085177",
    field: "bbox",
    content: "bbox = [412, 208, 0, 96]",
    reason: "框宽为 0，退化框，属标注噪声",
    confidence: 0.99,
    review: "confirmed",
  },
  {
    id: "S-7",
    detector: "imageq",
    dataset: "交通行为识别数据集",
    sampleId: "TB-2026-0007213",
    field: "clip",
    content: "码率 218 kbps · 块效应指数 0.63",
    reason: "压缩伪影过重，行为细节丢失",
    confidence: 0.87,
    review: "false",
  },
  {
    id: "S-8",
    detector: "semantic",
    dataset: "交通行为识别数据集",
    sampleId: "TB-2026-0007298",
    field: "action_type",
    content: "action_type = 翻越护栏 · 片段内容为行人正常行走",
    reason: "行为标签与视频语义不一致，相似度 0.18",
    confidence: 0.93,
    review: "pending",
  },
];

// ---------------------------------------------------------- 质检报告
export type QcReportStatus = "published" | "draft";

export interface QcReport {
  id: string;
  name: string;
  dataset: string;
  datasetVersion: string;
  batch: string;
  pipeline: string;
  time: string;
  score: number;
  dims: Record<QcDim, number>;
  total: number;
  bad: number;
  critical: number;
  major: number;
  minor: number;
  status: QcReportStatus;
  trend: number[];
  detectJobs: string[];
}

const dimsOf = (
  completeness: number,
  accuracy: number,
  consistency: number,
  uniqueness: number,
  timeliness: number,
  validity: number
): Record<QcDim, number> => ({ completeness, accuracy, consistency, uniqueness, timeliness, validity });

export const QC_REPORTS: QcReport[] = [
  {
    id: "QR-2026-1021",
    name: "交通事件识别数据集 · 第 21 批次质量报告",
    dataset: "交通事件识别数据集",
    datasetVersion: "v2.1",
    batch: "RUN-2003",
    pipeline: "交通事件识别数据生产线",
    time: "2026-10-20 09:42",
    score: 93.6,
    dims: dimsOf(97.2, 94.1, 90.8, 99.4, 95.0, 96.3),
    total: 8542,
    bad: 218,
    critical: 12,
    major: 87,
    minor: 119,
    status: "published",
    trend: [89.4, 90.8, 91.2, 90.6, 92.4, 93.0, 92.8, 93.6],
    detectJobs: ["QDJ-20261020-01"],
  },
  {
    id: "QR-2026-1020",
    name: "交通目标检测数据集 · 第 18 批次质量报告",
    dataset: "交通目标检测数据集",
    datasetVersion: "v3.0",
    batch: "RUN-2001",
    pipeline: "交通目标检测数据生产线",
    time: "2026-10-20 08:15",
    score: 91.2,
    dims: dimsOf(95.6, 89.4, 88.2, 97.8, 96.1, 90.5),
    total: 12600,
    bad: 402,
    critical: 26,
    major: 158,
    minor: 218,
    status: "published",
    trend: [87.2, 88.4, 89.1, 90.3, 89.7, 90.8, 91.0, 91.2],
    detectJobs: ["QDJ-20261020-00"],
  },
  {
    id: "QR-2026-1019",
    name: "多目标跟踪数据集 · 第 9 批次质量报告",
    dataset: "多目标跟踪数据集",
    datasetVersion: "v1.1",
    batch: "RUN-2005",
    pipeline: "多目标跟踪数据生产线",
    time: "2026-10-19 20:38",
    score: 88.4,
    dims: dimsOf(93.1, 87.6, 84.2, 96.4, 89.5, 91.8),
    total: 9820,
    bad: 516,
    critical: 34,
    major: 202,
    minor: 280,
    status: "draft",
    trend: [85.1, 86.2, 87.0, 86.4, 87.8, 88.1, 88.0, 88.4],
    detectJobs: ["QDJ-20261019-02"],
  },
  {
    id: "QR-2026-1018",
    name: "交通行为识别数据集 · 第 6 批次质量报告",
    dataset: "交通行为识别数据集",
    datasetVersion: "v1.2",
    batch: "RUN-2004",
    pipeline: "交通行为识别数据生产线",
    time: "2026-10-19 10:26",
    score: 95.8,
    dims: dimsOf(98.1, 95.4, 94.2, 99.6, 96.8, 95.0),
    total: 6400,
    bad: 96,
    critical: 3,
    major: 32,
    minor: 61,
    status: "published",
    trend: [92.4, 93.1, 93.8, 94.2, 94.9, 95.1, 95.5, 95.8],
    detectJobs: ["QDJ-20261019-01"],
  },
  {
    id: "QR-2026-1017",
    name: "交通事件识别数据集 · 第 20 批次质量报告",
    dataset: "交通事件识别数据集",
    datasetVersion: "v2.1",
    batch: "RUN-2002",
    pipeline: "交通事件识别数据生产线",
    time: "2026-10-18 21:50",
    score: 92.8,
    dims: dimsOf(96.4, 93.2, 89.6, 99.1, 94.2, 95.8),
    total: 7980,
    bad: 264,
    critical: 15,
    major: 96,
    minor: 153,
    status: "published",
    trend: [89.4, 90.8, 91.2, 90.6, 92.4, 93.0, 92.8, 92.8],
    detectJobs: ["QDJ-20261018-03"],
  },
  {
    id: "QR-2026-1016",
    name: "交通目标检测数据集 · 第 17 批次质量报告",
    dataset: "交通目标检测数据集",
    datasetVersion: "v3.0",
    batch: "RUN-2001",
    pipeline: "交通目标检测数据生产线",
    time: "2026-10-17 19:12",
    score: 90.8,
    dims: dimsOf(94.8, 88.9, 87.6, 97.2, 95.4, 90.1),
    total: 11840,
    bad: 448,
    critical: 29,
    major: 174,
    minor: 245,
    status: "published",
    trend: [87.2, 88.4, 89.1, 90.3, 89.7, 90.8, 91.0, 90.8],
    detectJobs: [],
  },
  {
    id: "QR-2026-1015",
    name: "多目标跟踪数据集 · 第 8 批次质量报告",
    dataset: "多目标跟踪数据集",
    datasetVersion: "v1.1",
    batch: "RUN-2005",
    pipeline: "多目标跟踪数据生产线",
    time: "2026-10-16 16:30",
    score: 88.0,
    dims: dimsOf(92.6, 87.1, 83.8, 96.0, 89.1, 91.2),
    total: 9640,
    bad: 528,
    critical: 36,
    major: 208,
    minor: 284,
    status: "draft",
    trend: [85.1, 86.2, 87.0, 86.4, 87.8, 88.1, 88.0, 88.0],
    detectJobs: [],
  },
  {
    id: "QR-2026-1014",
    name: "交通行为识别数据集 · 第 5 批次质量报告",
    dataset: "交通行为识别数据集",
    datasetVersion: "v1.2",
    batch: "RUN-2004",
    pipeline: "交通行为识别数据生产线",
    time: "2026-10-15 11:08",
    score: 95.5,
    dims: dimsOf(97.8, 95.1, 93.9, 99.4, 96.4, 94.8),
    total: 6120,
    bad: 104,
    critical: 4,
    major: 35,
    minor: 65,
    status: "published",
    trend: [92.4, 93.1, 93.8, 94.2, 94.9, 95.1, 95.5, 95.5],
    detectJobs: [],
  },
  {
    id: "QR-2026-1013",
    name: "交通事件识别数据集 · 第 19 批次质量报告",
    dataset: "交通事件识别数据集",
    datasetVersion: "v2.0",
    batch: "RUN-2002",
    pipeline: "交通事件识别数据生产线",
    time: "2026-10-14 09:24",
    score: 92.4,
    dims: dimsOf(96.0, 92.8, 89.0, 98.8, 93.8, 95.2),
    total: 7860,
    bad: 288,
    critical: 18,
    major: 104,
    minor: 166,
    status: "published",
    trend: [89.4, 90.8, 91.2, 90.6, 92.4, 93.0, 92.8, 92.4],
    detectJobs: [],
  },
  {
    id: "QR-2026-1012",
    name: "交通目标检测数据集 · 第 16 批次质量报告",
    dataset: "交通目标检测数据集",
    datasetVersion: "v2.9",
    batch: "RUN-2001",
    pipeline: "交通目标检测数据生产线",
    time: "2026-10-13 15:47",
    score: 84.6,
    dims: dimsOf(90.2, 82.4, 79.6, 94.8, 88.2, 86.4),
    total: 11200,
    bad: 986,
    critical: 78,
    major: 402,
    minor: 506,
    status: "published",
    trend: [87.2, 88.4, 89.1, 90.3, 89.7, 90.8, 91.0, 84.6],
    detectJobs: [],
  },
  {
    id: "QR-2026-1011",
    name: "多目标跟踪数据集 · 第 7 批次质量报告",
    dataset: "多目标跟踪数据集",
    datasetVersion: "v1.0",
    batch: "RUN-2005",
    pipeline: "多目标跟踪数据生产线",
    time: "2026-10-12 10:12",
    score: 86.2,
    dims: dimsOf(91.4, 85.2, 81.0, 95.2, 87.6, 89.8),
    total: 9200,
    bad: 640,
    critical: 48,
    major: 246,
    minor: 346,
    status: "draft",
    trend: [85.1, 86.2, 87.0, 86.4, 87.8, 88.1, 88.0, 86.2],
    detectJobs: [],
  },
  {
    id: "QR-2026-1010",
    name: "交通行为识别数据集 · 第 4 批次质量报告",
    dataset: "交通行为识别数据集",
    datasetVersion: "v1.1",
    batch: "RUN-2004",
    pipeline: "交通行为识别数据生产线",
    time: "2026-10-11 17:35",
    score: 94.2,
    dims: dimsOf(97.2, 93.8, 92.4, 99.0, 95.2, 93.6),
    total: 5840,
    bad: 138,
    critical: 6,
    major: 48,
    minor: 84,
    status: "published",
    trend: [92.4, 93.1, 93.8, 94.2, 94.9, 95.1, 95.5, 94.2],
    detectJobs: [],
  },
];

export const REPORT_MAP = QC_REPORTS.reduce(
  (acc, r) => ({ ...acc, [r.id]: r }),
  {} as Record<string, QcReport>
);

// ---------------------------------------------------------- 报告问题明细
export interface QcIssue {
  sampleId: string;
  field: string;
  ruleId: string;
  ruleName: string;
  dim: QcDim;
  actual: string;
  expect: string;
  level: QcLevel;
  advice: string;
}

const pad = (n: number, w = 4) => String(n).padStart(w, "0");

/** FNV-1a 稳定哈希：同一输入永远得同一结果，保证刷新后数值不变 */
function h32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * 每条规则对应的真实错误形态。
 * 实际值 / 期望值 / 建议必须与规则表达式口径一致——
 * 否则报告里会出现「行为时长合理性」的期望值写成 IoU 这种自相矛盾。
 */
const RULE_FAULTS: Record<string, { actuals: string[]; expect: string; advice: string }> = {
  "QCR-0001": {
    actuals: ["start_time = null", "end_time = null", 'event_type = ""'],
    expect: "null_ratio(event_type, start_time, end_time) <= 0.1%",
    advice: "回查上游抽帧节点补写事件起止时间后重跑",
  },
  "QCR-0002": {
    actuals: ["bbox = null", "bbox = [0, 0, 0, 0]"],
    expect: "bbox 空值占比 <= 0.5%",
    advice: "退回标注员补标 bbox，并纳入本批次全检清单",
  },
  "QCR-0003": {
    actuals: ["frame_id 缺 12 / 1200 帧", "frame_id 缺 37 / 980 帧"],
    expect: "distinct(frame_id) / expected_frames >= 98%",
    advice: "回落至抽帧节点重取缺失帧，重跑本批次",
  },
  "QCR-0004": {
    actuals: ['event_type = "unknown"', "event_type = 13（字典仅 12 类）"],
    expect: "enum_in(event_type, EVENT_DICT_12)",
    advice: "按事件字典映射纠正越界值后复检",
  },
  "QCR-0005": {
    actuals: ["bbox_x = -12", "bbox_w = 1980（超出图像宽度 1920）", "bbox_y = 1104（超出图像高度 1080）"],
    expect: "0 <= bbox_x <= image_width 且 0 <= bbox_y <= image_height",
    advice: "裁剪越界框或退回标注员重标",
  },
  "QCR-0006": {
    actuals: ["duration = -1", "duration = 92.5", "duration = 0"],
    expect: "0.2 <= duration <= 60（秒）",
    advice: "按视频片段真实时长重算并回写",
  },
  "QCR-0007": {
    actuals: ["video_id + frame_id 在视频索引表无匹配", "video_id 存在但 frame_id 越界"],
    expect: "match_rate(事件表, 视频索引表) >= 99.5%",
    advice: "补录视频索引条目，或剔除孤儿帧后重跑",
  },
  "QCR-0008": {
    actuals: ["IoU = 0.61", "IoU = 0.72", "IoU = 0.54"],
    expect: "iou(annotator_a, annotator_b) >= 0.85",
    advice: "提交双标仲裁，取一致性更高的一版为准",
  },
  "QCR-0009": {
    actuals: ["|Δt| = 128 ms", "|Δt| = 61 ms"],
    expect: "abs(timestamp - frame_timestamp) <= 40 ms",
    advice: "按帧率重算时间戳，重跑时序对齐",
  },
  "QCR-0010": {
    actuals: ["video_id + frame_id 重复 3 次", "video_id + frame_id 重复 1 次"],
    expect: "count_dup(video_id, frame_id) = 0",
    advice: "保留最新入库记录，去重后重跑本批次",
  },
  "QCR-0011": {
    actuals: ["汉明距离 = 3（与已入库样本近似）", "汉明距离 = 5（与已入库样本近似）"],
    expect: "phash_distance >= 6（去重阈值 5）",
    advice: "保留清晰度更高的一张，剔除近重复样本",
  },
  "QCR-0012": {
    actuals: ["批次耗时 5.8 h", "批次耗时 4.6 h"],
    expect: "batch_duration <= 4 h",
    advice: "扩容标注并发席位，或将批次拆小重排",
  },
  "QCR-0013": {
    actuals: ["入库距今 31 h", "入库距今 26 h"],
    expect: "now() - ingest_time <= 24 h",
    advice: "触发增量回补，重跑超期分片",
  },
  "QCR-0014": {
    actuals: ["class_id = 17（越界）", 'class_id = "car"（非数字）'],
    expect: "class_id in DICT_CLASS_12",
    advice: "按类别字典映射纠正后复检",
  },
  "QCR-0015": {
    actuals: ['bbox = "412;208;96;0"', 'bbox = "412 208 96 0"'],
    expect: 'regex_match(bbox, "^x1,y1,x2,y2$")',
    advice: "按导出模板重写坐标字段，分隔符统一为英文逗号",
  },
  "QCR-0016": {
    actuals: ["cam_extrinsic = null", "cam_intrinsic = null"],
    expect: "cam_intrinsic(9 维) / cam_extrinsic(16 维) 均非空",
    advice: "补做相机标定，未标定相机不参与点云融合",
  },
  "QCR-0017": {
    actuals: ["split_ratio(train) = 0.52", "split_ratio(train) = 0.83"],
    expect: "train 占比 70% ± 10%",
    advice: "按分层抽样重划 train/val/test 后重跑",
  },
  "QCR-0018": {
    actuals: ["label_status 未标注 42 条", "label_status 未标注 17 条"],
    expect: "labeled_coverage(label_status) >= 95%",
    advice: "将未标注样本退回标注队列，补齐后重跑",
  },
};

/** 规则没有预设错误形态时（如用户新建规则）按表达式特征兜底推导 */
function faultOf(rule: QcRule) {
  const preset = RULE_FAULTS[rule.id];
  if (preset) return preset;
  const expr = rule.expr.toLowerCase();
  let actuals: string[];
  if (expr.includes("null") || expr.includes("not_null") || expr.includes("coverage")) {
    actuals = [`${rule.fields[0]} = null`, `${rule.fields[0]} 缺失`];
  } else if (expr.includes("enum") || expr.includes("in ")) {
    actuals = [`${rule.fields[0]} = 越界值`, `${rule.fields[0]} 不在字典内`];
  } else if (expr.includes("dup") || expr.includes("distinct")) {
    actuals = [`${rule.fields[0]} 重复 2 次`];
  } else {
    actuals = [`${rule.fields[0]} = 越界值`, `${rule.fields[0]} = null`];
  }
  return {
    actuals,
    expect: `${rule.expr}（${rule.op} ${rule.threshold}）`,
    advice: "按规则口径修正后重跑本批次验证",
  };
}

/**
 * 按报告确定性派生问题明细（同 ID 多次渲染结果一致，刷新不变）。
 * 规则连续取用，避免一张报告里全落在同一个字段上。
 */
export function issuesOf(reportId: string): QcIssue[] {
  const rep = REPORT_MAP[reportId];
  if (!rep) return [];
  const rules = QC_RULES.filter((r) => r.dataset === rep.dataset);
  const pool = rules.length ? rules : QC_RULES;
  const prefix =
    rep.dataset === "交通事件识别数据集"
      ? "TE"
      : rep.dataset === "交通目标检测数据集"
      ? "TD"
      : rep.dataset === "多目标跟踪数据集"
      ? "MT"
      : "TB";
  const count = Math.min(8, Math.max(6, Math.round(rep.bad / 25)));
  const start = h32(reportId) % pool.length;

  return Array.from({ length: count }).map((_, i) => {
    const rule = pool[(start + i) % pool.length];
    const fault = faultOf(rule);
    // 种子带上行号：同一规则命中多条时要得到不同的样本号，不能重复
    const h = h32(`${reportId}|${rule.id}|${i}`);
    const sampleSeq = 7000 + (h % 2400);
    return {
      sampleId: `${prefix}-2026-${pad(sampleSeq, 7)}`,
      field: rule.fields[h % rule.fields.length],
      ruleId: rule.id,
      ruleName: rule.name,
      dim: rule.dim,
      actual: fault.actuals[h % fault.actuals.length],
      expect: fault.expect,
      // 级别跟着规则走，不再按序号臆造（否则严重项与规则严重度打架）
      level: rule.level,
      advice: fault.advice,
    };
  });
}

/**
 * 按字段 / 按维度聚合问题分布。
 * 覆盖报告里的**全部**问题样本（rep.bad），不是只统计明细表那几条，
 * 用最大余数法把 bad 按规则近 7 天命中量加权分摊。
 */
export function issueDist(reportId: string) {
  const rep = REPORT_MAP[reportId];
  const byField = new Map<string, number>();
  const byDim = new Map<QcDim, number>();
  if (!rep) {
    return { field: [] as { label: string; value: number }[], dim: [] as { label: string; value: number; tone: string }[] };
  }
  const rules = QC_RULES.filter((r) => r.dataset === rep.dataset);
  const pool = rules.length ? rules : QC_RULES;

  const weights = pool.map((r) => Math.max(1, r.hits7d + (h32(`${reportId}|${r.id}`) % 9) - 4));
  const wsum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (rep.bad * w) / wsum);
  const alloc = raw.map((v) => Math.floor(v));
  let rest = rep.bad - alloc.reduce((a, b) => a + b, 0);
  const order = raw.map((v, i) => ({ i, frac: v - Math.floor(v) })).sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < rest; k++) alloc[order[k % order.length].i] += 1;

  pool.forEach((r, i) => {
    const n = alloc[i];
    if (!n) return;
    byDim.set(r.dim, (byDim.get(r.dim) || 0) + n);
    const per = Math.floor(n / r.fields.length);
    let left = n - per * r.fields.length;
    r.fields.forEach((f) => {
      const add = per + (left > 0 ? 1 : 0);
      if (left > 0) left -= 1;
      byField.set(f, (byField.get(f) || 0) + add);
    });
  });

  return {
    field: Array.from(byField.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value })),
    dim: Array.from(byDim.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([k, value]) => ({ label: QC_DIM_MAP[k].label, value, tone: QC_DIM_MAP[k].tone })),
  };
}

// ---------------------------------------------------------- 质量问题工单
export type TicketStatus = "pending" | "processing" | "review" | "closed";

export const TICKET_STATUS: Record<TicketStatus, { label: string; tone: string; soft: string }> = {
  pending: { label: "待分派", tone: "#b45309", soft: "#fffbeb" },
  processing: { label: "处理中", tone: "#2563eb", soft: "#eff6ff" },
  review: { label: "待复检", tone: "#7c3aed", soft: "#f5f3ff" },
  closed: { label: "已关闭", tone: "#16a34a", soft: "#f0fdf4" },
};

export interface TicketEvent {
  time: string;
  actor: string;
  action: string;
  note?: string;
}

export interface QcTicket {
  id: string;
  title: string;
  reportId: string;
  dataset: string;
  batch: string;
  dim: QcDim;
  ruleId: string;
  ruleName: string;
  level: QcLevel;
  owner: string;
  status: TicketStatus;
  createdAt: string;
  dueAt: string;
  desc: string;
  impact: { rows: number; batches: number; downstream: string[] };
  samples: { sampleId: string; field: string; value: string; expect: string }[];
  suggestion: string;
  timeline: TicketEvent[];
}

export const QC_TICKET_OWNERS = ["李工 · 数据质量", "王工 · 数据质量", "陈工 · 平台", "王强 · 标注组长", "李明 · 清洗负责人"];

export const QC_TICKETS: QcTicket[] = [
  {
    id: "QCT-2026-0041",
    title: "事件类型值域越界 21 条，需按字典映射纠正",
    reportId: "QR-2026-1021",
    dataset: "交通事件识别数据集",
    batch: "RUN-2003",
    dim: "accuracy",
    ruleId: "QCR-0004",
    ruleName: "事件类型值域校验",
    level: "critical",
    owner: "李工 · 数据质量",
    status: "processing",
    createdAt: "2026-10-20 09:45",
    dueAt: "2026-10-21 09:45",
    desc: "本批次事件类型字段出现 21 条字典外取值（如 13、14、\"unknown_2\"），超出 EVENT_DICT_12 白名单，导致下游事件融合节点无法归类。",
    impact: { rows: 21, batches: 1, downstream: ["事件融合节点", "数据集构建", "交通事件识别数据集 v2.1"] },
    samples: [
      { sampleId: "TE-2026-0085412", field: "event_type", value: "13（越界）", expect: "枚举 0~11" },
      { sampleId: "TE-2026-0085503", field: "event_type", value: "unknown_2", expect: "枚举 0~11" },
      { sampleId: "TE-2026-0085586", field: "event_type", value: "14（越界）", expect: "枚举 0~11" },
    ],
    suggestion: "按事件类型映射表自动纠正可映射项；无法映射的 5 条退回标注员重标。",
    timeline: [
      { time: "2026-10-20 09:45", actor: "系统", action: "自动开单", note: "由 QR-2026-1021 命中 QCR-0004 触发" },
      { time: "2026-10-20 10:02", actor: "李工 · 数据质量", action: "分派", note: "指派给标注组长 王强" },
      { time: "2026-10-20 13:20", actor: "王强 · 标注组长", action: "开始处理", note: "已定位 16 条可自动映射" },
    ],
  },
  {
    id: "QCT-2026-0040",
    title: "标注框越界 34 条，坐标超出图像边界",
    reportId: "QR-2026-1020",
    dataset: "交通目标检测数据集",
    batch: "RUN-2001",
    dim: "accuracy",
    ruleId: "QCR-0005",
    ruleName: "标注框坐标值域",
    level: "critical",
    owner: "陈工 · 平台",
    status: "review",
    createdAt: "2026-10-20 08:20",
    dueAt: "2026-10-21 08:20",
    desc: "34 条标注框的 x/y/w/h 超出图像边界，其中 12 条宽度为 0（退化框），属预标注模型输出异常。",
    impact: { rows: 34, batches: 2, downstream: ["数据集构建", "交通目标检测数据集 v3.0"] },
    samples: [
      { sampleId: "TD-2026-0021887", field: "bbox", value: "[412, 208, 0, 96]", expect: "w > 0 且不越界" },
      { sampleId: "TD-2026-0022014", field: "bbox", value: "[1980, 1040, 120, 80]", expect: "x + w <= 1920" },
    ],
    suggestion: "删除退化框，越界框按图像边界裁剪后回归预标注节点重跑。",
    timeline: [
      { time: "2026-10-20 08:20", actor: "系统", action: "自动开单", note: "由 QR-2026-1020 命中 QCR-0005 触发" },
      { time: "2026-10-20 08:31", actor: "陈工 · 平台", action: "接单" },
      { time: "2026-10-20 11:05", actor: "陈工 · 平台", action: "提交处理", note: "已重跑预标注，裁剪 22 条、删除 12 条" },
    ],
  },
  {
    id: "QCT-2026-0039",
    title: "跨源主键对账匹配率 98.7%，低于 99.5% 阈值",
    reportId: "QR-2026-1021",
    dataset: "交通事件识别数据集",
    batch: "RUN-2003",
    dim: "consistency",
    ruleId: "QCR-0007",
    ruleName: "跨源主键对账",
    level: "critical",
    owner: "李明 · 清洗负责人",
    status: "pending",
    createdAt: "2026-10-20 09:46",
    dueAt: "2026-10-21 09:46",
    desc: "事件表与视频索引表按 video_id + frame_id 对账，111 条在视频索引表中找不到对应帧，疑似抽帧节点丢帧或索引未同步。",
    impact: { rows: 111, batches: 1, downstream: ["事件融合节点", "数据集构建"] },
    samples: [
      { sampleId: "TE-2026-0085420", field: "video_id + frame_id", value: "V-0912 / 04821", expect: "视频索引表存在该帧" },
      { sampleId: "TE-2026-0085466", field: "video_id + frame_id", value: "V-0933 / 11208", expect: "视频索引表存在该帧" },
    ],
    suggestion: "核查抽帧节点丢帧日志；若视频源本身缺失，标记该段为不可用并从事件表剔除。",
    timeline: [
      { time: "2026-10-20 09:46", actor: "系统", action: "自动开单", note: "由 QR-2026-1021 命中 QCR-0007 触发" },
    ],
  },
  {
    id: "QCT-2026-0038",
    title: "双人标注 IoU 低于 0.85 共 14 条，需仲裁",
    reportId: "QR-2026-1021",
    dataset: "交通事件识别数据集",
    batch: "RUN-2003",
    dim: "consistency",
    ruleId: "QCR-0008",
    ruleName: "双人标注一致性 IoU",
    level: "major",
    owner: "王强 · 标注组长",
    status: "processing",
    createdAt: "2026-10-20 09:47",
    dueAt: "2026-10-22 09:47",
    desc: "双人标注一致性 IoU 低于 0.85 的样本 14 条，集中在夜间低照度场景，需第三方仲裁确认边界。",
    impact: { rows: 14, batches: 1, downstream: ["标注质检", "数据集构建"] },
    samples: [
      { sampleId: "TE-2026-0085444", field: "bbox", value: "IoU 0.62", expect: "IoU >= 0.85" },
      { sampleId: "TE-2026-0085479", field: "bbox", value: "IoU 0.71", expect: "IoU >= 0.85" },
    ],
    suggestion: "安排第三方仲裁员复核，仲裁结果直接写入黄金样本集，用于后续标注培训。",
    timeline: [
      { time: "2026-10-20 09:47", actor: "系统", action: "自动开单" },
      { time: "2026-10-20 10:15", actor: "王强 · 标注组长", action: "接单", note: "已排出 2 名仲裁员" },
    ],
  },
  {
    id: "QCT-2026-0037",
    title: "图像近重复 17 条，疑似同一路段多路视频重复采集",
    reportId: "QR-2026-1020",
    dataset: "交通目标检测数据集",
    batch: "RUN-2001",
    dim: "uniqueness",
    ruleId: "QCR-0011",
    ruleName: "图像近重复检测",
    level: "major",
    owner: "李明 · 清洗负责人",
    status: "closed",
    createdAt: "2026-10-20 08:22",
    dueAt: "2026-10-22 08:22",
    desc: "感知哈希汉明距离 <= 5 的近重复样本 17 条，来源为 G15 高速上行/下行两路摄像头重叠区。",
    impact: { rows: 17, batches: 1, downstream: ["数据集构建"] },
    samples: [
      { sampleId: "TD-2026-0021931", field: "image_id", value: "与 TD-2026-0021902 距离 3", expect: "汉明距离 > 5" },
      { sampleId: "TD-2026-0021968", field: "image_id", value: "与 TD-2026-0021940 距离 4", expect: "汉明距离 > 5" },
    ],
    suggestion: "保留清晰度更高的一条，其余去重；同时在采集侧标注重叠区，避免后续重复。",
    timeline: [
      { time: "2026-10-20 08:22", actor: "系统", action: "自动开单" },
      { time: "2026-10-20 08:50", actor: "李明 · 清洗负责人", action: "接单" },
      { time: "2026-10-20 10:30", actor: "李明 · 清洗负责人", action: "提交处理", note: "已去重 17 条，保留 8 条高清晰度样本" },
      { time: "2026-10-20 10:52", actor: "系统", action: "复检通过", note: "重跑 QCR-0011，命中 0 条" },
      { time: "2026-10-20 10:53", actor: "李工 · 数据质量", action: "关闭工单" },
    ],
  },
  {
    id: "QCT-2026-0036",
    title: "批次产出超 SLA（5h12m > 4h）",
    reportId: "QR-2026-1017",
    dataset: "交通事件识别数据集",
    batch: "RUN-2002",
    dim: "timeliness",
    ruleId: "QCR-0012",
    ruleName: "批次产出 SLA",
    level: "major",
    owner: "刘工 · 运维",
    status: "closed",
    createdAt: "2026-10-18 21:52",
    dueAt: "2026-10-19 21:52",
    desc: "本批次端到端耗时 5 小时 12 分，超出 4 小时 SLA，主要瓶颈在专家标注节点（占 61%）。",
    impact: { rows: 7980, batches: 1, downstream: ["生产运营报表"] },
    samples: [
      { sampleId: "BATCH-RUN-2002", field: "batch_duration", value: "312 min", expect: "<= 240 min" },
    ],
    suggestion: "专家标注节点扩容 2 个席位，或将该产线的标注环节改为智能预标注 + 人工复核。",
    timeline: [
      { time: "2026-10-18 21:52", actor: "系统", action: "自动开单" },
      { time: "2026-10-18 22:10", actor: "刘工 · 运维", action: "接单" },
      { time: "2026-10-19 09:20", actor: "刘工 · 运维", action: "提交处理", note: "标注席位由 6 扩至 8" },
      { time: "2026-10-19 18:40", actor: "系统", action: "复检通过", note: "RUN-2003 耗时回落至 3h04m" },
      { time: "2026-10-19 18:41", actor: "李工 · 数据质量", action: "关闭工单" },
    ],
  },
  {
    id: "QCT-2026-0035",
    title: "类别字典白名单越界 11 条",
    reportId: "QR-2026-1016",
    dataset: "交通目标检测数据集",
    batch: "RUN-2001",
    dim: "validity",
    ruleId: "QCR-0014",
    ruleName: "类别字典白名单",
    level: "critical",
    owner: "陈工 · 平台",
    status: "closed",
    createdAt: "2026-10-17 19:15",
    dueAt: "2026-10-18 19:15",
    desc: "11 条样本 class_id = 12~15，超出 0~11 的 12 类白名单，为旧版标注工具导出残留。",
    impact: { rows: 11, batches: 1, downstream: ["数据集构建"] },
    samples: [
      { sampleId: "TD-2026-0021740", field: "class_id", value: "13", expect: "0~11" },
    ],
    suggestion: "按旧版字典映射表转换，无法映射的剔除。",
    timeline: [
      { time: "2026-10-17 19:15", actor: "系统", action: "自动开单" },
      { time: "2026-10-17 19:40", actor: "陈工 · 平台", action: "接单" },
      { time: "2026-10-17 21:05", actor: "陈工 · 平台", action: "提交处理", note: "已转换 9 条，剔除 2 条" },
      { time: "2026-10-17 21:20", actor: "系统", action: "复检通过" },
      { time: "2026-10-17 21:21", actor: "李工 · 数据质量", action: "关闭工单" },
    ],
  },
  {
    id: "QCT-2026-0034",
    title: "标注框坐标格式不合规 7 条（科学计数法）",
    reportId: "QR-2026-1016",
    dataset: "交通目标检测数据集",
    batch: "RUN-2001",
    dim: "validity",
    ruleId: "QCR-0015",
    ruleName: "坐标格式规范",
    level: "major",
    owner: "陈工 · 平台",
    status: "review",
    createdAt: "2026-10-17 19:16",
    dueAt: "2026-10-20 19:16",
    desc: "7 条坐标使用科学计数法（如 4.12e+02），不符合正则约束，下游解析会失败。",
    impact: { rows: 7, batches: 1, downstream: ["数据集构建"] },
    samples: [
      { sampleId: "TD-2026-0021758", field: "bbox", value: "4.12e+02,2.08e+02,1.20e+02,9.60e+01", expect: "十进制浮点" },
    ],
    suggestion: "统一格式化为 2 位小数定点数后回写。",
    timeline: [
      { time: "2026-10-17 19:16", actor: "系统", action: "自动开单" },
      { time: "2026-10-17 20:00", actor: "陈工 · 平台", action: "接单" },
      { time: "2026-10-18 09:30", actor: "陈工 · 平台", action: "提交处理", note: "7 条已格式化" },
    ],
  },
  {
    id: "QCT-2026-0033",
    title: "关键帧覆盖率 96.2%，低于 98% 阈值",
    reportId: "QR-2026-1019",
    dataset: "多目标跟踪数据集",
    batch: "RUN-2005",
    dim: "completeness",
    ruleId: "QCR-0003",
    ruleName: "关键帧覆盖率",
    level: "major",
    owner: "李明 · 清洗负责人",
    status: "pending",
    createdAt: "2026-10-19 20:40",
    dueAt: "2026-10-21 20:40",
    desc: "9 段视频关键帧覆盖率低于 98%，最低 92.4%，疑似运行时抽帧丢帧。",
    impact: { rows: 380, batches: 1, downstream: ["轨迹关联", "数据集构建"] },
    samples: [
      { sampleId: "MT-2026-0014336", field: "frame_id", value: "缺 3.8% 帧", expect: ">= 98% 覆盖" },
    ],
    suggestion: "重新抽帧补齐缺失帧；若源视频损坏，标记整段为不可用。",
    timeline: [
      { time: "2026-10-19 20:40", actor: "系统", action: "自动开单" },
    ],
  },
  {
    id: "QCT-2026-0032",
    title: "相机内外参缺失 1 条，影响点云融合",
    reportId: "QR-2026-1019",
    dataset: "多目标跟踪数据集",
    batch: "RUN-2005",
    dim: "validity",
    ruleId: "QCR-0016",
    ruleName: "相机参数完整性",
    level: "minor",
    owner: "王工 · 数据质量",
    status: "closed",
    createdAt: "2026-10-19 20:41",
    dueAt: "2026-10-26 20:41",
    desc: "1 条样本 cam_extrinsic 为空，该相机未标定即接入采集。",
    impact: { rows: 1, batches: 1, downstream: ["点云融合"] },
    samples: [
      { sampleId: "MT-2026-0014390", field: "cam_extrinsic", value: "null", expect: "16 维外参矩阵" },
    ],
    suggestion: "补做相机标定；标定前该相机数据不参与点云融合。",
    timeline: [
      { time: "2026-10-19 20:41", actor: "系统", action: "自动开单" },
      { time: "2026-10-20 09:10", actor: "王工 · 数据质量", action: "接单" },
      { time: "2026-10-20 15:30", actor: "王工 · 数据质量", action: "提交处理", note: "已补标定参数" },
      { time: "2026-10-20 15:50", actor: "系统", action: "复检通过" },
      { time: "2026-10-20 15:51", actor: "李工 · 数据质量", action: "关闭工单" },
    ],
  },
];

export const TICKET_MAP = QC_TICKETS.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {} as Record<string, QcTicket>
);

// ---------------------------------------------------------- 公共派生
/** 质量等级 */
export function gradeOf(score: number): { label: string; tone: string; soft: string } {
  if (score >= 95) return { label: "优秀", tone: "#16a34a", soft: "#f0fdf4" };
  if (score >= 90) return { label: "良好", tone: "#2563eb", soft: "#eff6ff" };
  if (score >= 85) return { label: "合格", tone: "#b45309", soft: "#fffbeb" };
  return { label: "不合格", tone: "#dc2626", soft: "#fef2f2" };
}

/** 工单 SLA 剩余（小时），负值代表超时 */
export function slaHours(dueAt: string, now = "2026-10-20 17:44"): number {
  const parse = (s: string) => {
    const m = s.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
    if (!m) return 0;
    return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) / 3600000;
  };
  return Math.round((parse(dueAt) - parse(now)) * 10) / 10;
}

/** 全部规则按维度聚合：启用数 / 总数 / 命中数 */
export function rulesByDim() {
  return QC_DIMS.map((d) => {
    const list = QC_RULES.filter((r) => r.dim === d.key);
    return {
      ...d,
      total: list.length,
      enabled: list.filter((r) => r.on).length,
      hits: list.reduce((s, r) => s + r.hits7d, 0),
      datasets: new Set(list.map((r) => r.dataset)).size,
    };
  });
}

/** 报告列表统计 */
export function reportStats() {
  const total = QC_REPORTS.length;
  const avg = Math.round((QC_REPORTS.reduce((s, r) => s + r.score, 0) / total) * 10) / 10;
  return {
    total,
    avg,
    excellent: QC_REPORTS.filter((r) => r.score >= 95).length,
    unqualified: QC_REPORTS.filter((r) => r.score < 85).length,
    abnormal: QC_REPORTS.reduce((s, r) => s + r.bad, 0),
    published: QC_REPORTS.filter((r) => r.status === "published").length,
  };
}

/** 工单统计 */
export function ticketStats() {
  const open = QC_TICKETS.filter((t) => t.status !== "closed");
  return {
    total: QC_TICKETS.length,
    pending: QC_TICKETS.filter((t) => t.status === "pending").length,
    processing: QC_TICKETS.filter((t) => t.status === "processing").length,
    review: QC_TICKETS.filter((t) => t.status === "review").length,
    closed: QC_TICKETS.filter((t) => t.status === "closed").length,
    overdue: open.filter((t) => slaHours(t.dueAt) < 0).length,
  };
}
