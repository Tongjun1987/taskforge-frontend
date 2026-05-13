"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  X,
  Target,
  Layers,
  Database,
  Clock,
  Edit3,
  Trash2,
  Check,
  ArrowRight,
  Sparkles,
  Info,
  Tag,
  CheckCircle,
  Cpu,
  Rocket,
} from "lucide-react";

// ===== 类型定义 =====
interface LabelNode {
  id: string;
  name: string;
  color: string;
  description: string;
  children: LabelNode[];
  collapsed?: boolean;
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

interface DataSpec {
  id: string;
  dataVolume: string;
  dataType: string;
  language: string;
  domain: string;
}

interface QualityStandard {
  id: string;
  accuracyThreshold: number;
  consistencyRequirement: string;
  qualificationRate: string;
}

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
  // 数据需求（与 create/[id] 保持一致）
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
  description?: string;       // 中文语义描述
}

interface ModelRequirement {
  id: string;
  category: string;
  name: string;
  value: string;
  required: boolean;
}

// ===== Mock 数据 =====
const DEFAULT_LABEL_SCHEMAS: Record<string, LabelNode[]> = {
  "scene-1": [
    // 目标类别
    {
      id: "label-target",
      name: "目标类别",
      color: "#3b82f6",
      description: "交通场景核心检测目标",
      children: [
        { id: "label-car", name: "小型轿车", color: "#3b82f6", description: "小客车、私家车", children: [] },
        { id: "label-truck", name: "货车/卡车", color: "#6366f1", description: "货运卡车、大型货车", children: [] },
        { id: "label-bus", name: "公交车", color: "#8b5cf6", description: "公共交通巴士", children: [] },
        { id: "label-pedestrian", name: "行人", color: "#22c55e", description: "道路上行人", children: [] },
        { id: "label-cyclist", name: "骑行者", color: "#06b6d4", description: "自行车、电动车骑行者", children: [] },
        { id: "label-sign", name: "交通标识", color: "#f59e0b", description: "道路标志标线", children: [] },
      ],
    },
    // 行为类别
    {
      id: "label-action",
      name: "行为类别",
      color: "#f97316",
      description: "交通违规与异常行为",
      children: [
        { id: "label-act-rl", name: "闯红灯", color: "#ef4444", description: "红灯时越过停止线", children: [] },
        { id: "label-act-rv", name: "逆向行驶", color: "#dc2626", description: "在禁止方向车道行驶", children: [] },
        { id: "label-act-jw", name: "行人横穿", color: "#f97316", description: "行人未走斑马线横穿车道", children: [] },
        { id: "label-act-ut", name: "违规掉头", color: "#eab308", description: "禁止掉头路口违规掉头", children: [] },
        { id: "label-act-pk", name: "违章停车", color: "#f59e0b", description: "禁止停车区域停放车辆", children: [] },
        { id: "label-act-sp", name: "低速行驶", color: "#84cc16", description: "低于道路最低限速", children: [] },
      ],
    },
    // 事件类别
    {
      id: "label-event",
      name: "事件类别",
      color: "#ef4444",
      description: "交通事故与道路异常事件",
      children: [
        { id: "label-evt-acc", name: "交通事故", color: "#ef4444", description: "车辆碰撞、追尾等事故", children: [] },
        { id: "label-evt-con", name: "道路拥堵", color: "#f97316", description: "交通流量过大导致拥堵", children: [] },
        { id: "label-evt-debris", name: "抛洒物", color: "#eab308", description: "道路遗撒物、障碍物", children: [] },
        { id: "label-evt-wea", name: "异常天气", color: "#06b6d4", description: "大雾、暴雨等影响通行", children: [] },
      ],
    },
    // 严重程度
    {
      id: "label-severity",
      name: "严重程度",
      color: "#8b5cf6",
      description: "事件影响等级",
      children: [
        { id: "label-sev-1", name: "轻度", color: "#22c55e", description: "轻微影响通行", children: [] },
        { id: "label-sev-2", name: "中度", color: "#f59e0b", description: "影响局部通行", children: [] },
        { id: "label-sev-3", name: "重度", color: "#ef4444", description: "严重影响通行或安全", children: [] },
      ],
    },
  ],
  "scene-2": [
    {
      id: "label-eq",
      name: "设备类型",
      color: "#8b5cf6",
      description: "电力设备类型",
      children: [
        { id: "label-eq-tow", name: "杆塔", color: "#7c3aed", description: "电力杆塔设备", children: [] },
        { id: "label-eq-ins", name: "绝缘子", color: "#a855f7", description: "绝缘子缺陷", children: [] },
        { id: "label-eq-cab", name: "线缆", color: "#c084fc", description: "电缆线路状态", children: [] },
      ],
    },
    {
      id: "label-def",
      name: "缺陷等级",
      color: "#ef4444",
      description: "缺陷严重程度",
      children: [
        { id: "label-def-n", name: "正常", color: "#22c55e", description: "设备状态正常", children: [] },
        { id: "label-def-m", name: "轻微缺陷", color: "#f59e0b", description: "需关注", children: [] },
        { id: "label-def-s", name: "严重缺陷", color: "#ef4444", description: "需立即处理", children: [] },
      ],
    },
  ],
  "scene-3": [
    {
      id: "label-doc",
      name: "文档类型",
      color: "#2563eb",
      description: "文档的类别",
      children: [
        { id: "label-doc-inv", name: "发票", color: "#3b82f6", description: "增值税发票", children: [] },
        { id: "label-doc-id", name: "证件", color: "#6366f1", description: "身份证、驾照等", children: [] },
        { id: "label-doc-con", name: "合同", color: "#8b5cf6", description: "商业合同文本", children: [] },
      ],
    },
  ],
};

const MOCK_SCENES: Scene[] = [
  {
    id: "scene-1",
    name: "交通事件识别",
    description: "道路监控场景下的交通事故、违章等事件自动检测",
    type: "交通事件",
    task_count: 4,
    dataset_count: 8,
    created_at: "2026-04-01",
    status: "active",
    labelSchema: DEFAULT_LABEL_SCHEMAS["scene-1"],
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
    labelSchema: DEFAULT_LABEL_SCHEMAS["scene-2"],
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
    labelSchema: DEFAULT_LABEL_SCHEMAS["scene-3"],
  },
];

const MOCK_TASKS: Record<string, Task[]> = {
  "scene-1": [
    {
      id: "task-1",
      name: "交通目标检测",
      scene_id: "scene-1",
      task_type: "目标检测",
      modality: "图像",
      dataset_count: 3,
      quality_status: "pass",
      created_at: "2026-04-02",
      sampleUnit: "单个检测框（坐标+类别）",
      dataSpec: {
        id: "ds-1",
        dataVolume: "≥50,000张图像（白天30,000+夜晚20,000）",
        dataType: "图像（JPG/PNG，分辨率1920×1080或1280×720）",
        language: "中文路标/英文路标",
        domain: "城市道路、高速公路、交叉路口等交通场景",
      },
      qualityStandard: {
        id: "qs-1",
        accuracyThreshold: 0.75,
        consistencyRequirement: "同一目标多次标注结果一致率≥95%，多人标注Kappa系数≥0.8",
        qualificationRate: "合格率底线≥90%，即标注合格样本占总样本的比例",
      },
      annotationSpec: {
        id: "as-1",
        guidelines: "1. 标注框需紧贴目标边缘，误差不超过3像素\n2. 目标被遮挡超过50%时标注完整轮廓\n3. 小目标（<32×32像素）需特殊标记\n4. 多类别重叠时采用从上到下优先级：人>车>物",
        edgeCaseRules: "1. 模糊/过曝图像：降低置信度或跳过\n2. 截断目标：标注可见部分并标记truncated=True\n3. 夜间低照度：需开启图像增强设备辅助标注\n4. 运动模糊：标注中心位置，备注模糊程度",
        exampleSet: "正例：标准车辆完整出现在画面中，标注框紧贴车身\n反例：标注框过大或过小，超出目标边界",
      },
      evaluationMetrics: [
        { id: "ev-1", name: "mAP@IoU=0.5", key: "mAP@0.5", threshold: 0.75, isPrimary: true, description: "衡量目标检测模型在IoU阈值为0.5时的整体检测精度，综合考虑召回率和精确率" },
        { id: "ev-2", name: "Precision", key: "precision", threshold: 0.80, isPrimary: false, description: "检测为正的样本中实际为正的比例，用于衡量误检率" },
        { id: "ev-3", name: "Recall", key: "recall", threshold: 0.75, isPrimary: false, description: "实际为正的样本中被正确检测出的比例，用于衡量漏检率" },
      ],
      modelRequirements: [
        { id: "mr-1", category: "模型输入", name: "输入数据", value: "交通监控视频单帧图像（1920×1080、1280×720）", required: true },
        { id: "mr-2", category: "模型输入", name: "预处理参数", value: "可选：亮度/对比度调整，道路场景类型（路口/高速/城市）", required: false },
        { id: "mr-3", category: "模型输出", name: "目标类别", value: "车辆、行人、非机动车、交通标识等核心目标", required: true },
        { id: "mr-4", category: "模型输出", name: "边界框", value: "bbox，以 [x1,y1,x2,y2] 格式表示", required: true },
        { id: "mr-5", category: "模型输出", name: "检测置信度", value: "判断检测结果的可靠性，用于筛选有效结果", required: true },
        { id: "mr-6", category: "模型输出", name: "帧编号/时间戳", value: "关联检测结果对应的图像帧", required: true },
      ],
    },
    {
      id: "task-2",
      name: "多目标跟踪",
      scene_id: "scene-1",
      task_type: "目标跟踪",
      modality: "视频",
      dataset_count: 2,
      quality_status: "pass",
      created_at: "2026-04-03",
      sampleUnit: "单个目标跨帧轨迹（ID+多帧bbox）",
      dataSpec: {
        id: "ds-2",
        dataVolume: "≥500段视频，每段10~30秒，含20~50个目标",
        dataType: "视频（MP4/AVI，25~30fps，分辨率1920×1080）",
        language: "中文标注",
        domain: "城市道路、停车场、收费站等目标密集场景",
      },
      qualityStandard: {
        id: "qs-2",
        accuracyThreshold: 0.60,
        consistencyRequirement: "同一目标轨迹标注连续完整，ID切换次数≤5%",
        qualificationRate: "轨迹完整率≥95%，即有效跟踪帧数/总帧数",
      },
      annotationSpec: {
        id: "as-2",
        guidelines: "1. 视频帧间隔不超过30帧需连续标注\n2. 目标ID一旦分配不可更改（除非目标消失后重新出现）\n3. 遮挡目标需根据上下文推断位置\n4. 目标离开画面标记为「消失」，返回标记为「新目标」",
        edgeCaseRules: "1. 目标被完全遮挡超过5秒：标记为「遮挡」，恢复后继续同一ID\n2. 两个同类目标交叉：使用外观特征区分\n3. 目标分裂/合并：按分裂/合并前后的中心点分配ID\n4. 低帧率视频：每5帧标注一次，中间帧线性插值",
        exampleSet: "正例：车辆A从进入画面到离开，ID保持一致\n反例：同一车辆在不同帧被分配了不同ID",
      },
      evaluationMetrics: [
        { id: "ev-4", name: "MOTA（多目标跟踪精度）", key: "MOTA", threshold: 0.60, isPrimary: true, description: "综合衡量跟踪过程中的漏检、误检和ID切换，整体跟踪准确性指标" },
        { id: "ev-5", name: "IDF1（身份F1）", key: "IDF1", threshold: 0.55, isPrimary: false, description: "正确识别的目标身份占总识别的比例，衡量ID一致性" },
        { id: "ev-6", name: "MOTP（跟踪精度）", key: "MOTP", threshold: 0.70, isPrimary: false, description: "跟踪位置与真实位置的匹配精度，衡量定位准确性" },
      ],
      modelRequirements: [
        { id: "mr-9", category: "模型输入", name: "输入数据", value: "交通监控连续视频帧序列（10~30帧）", required: true },
        { id: "mr-10", category: "模型输入", name: "目标检测结果", value: "单帧目标类别、bbox、置信度", required: true },
        { id: "mr-11", category: "模型输入", name: "外观特征", value: "可选：车辆颜色、行人衣着，辅助提升跟踪稳定性", required: false },
        { id: "mr-12", category: "模型输出", name: "目标唯一ID", value: "跨帧保持不变，用于区分不同目标", required: true },
        { id: "mr-13", category: "模型输出", name: "逐帧轨迹", value: "每帧对应的 bbox，形成连续运动轨迹", required: true },
        { id: "mr-14", category: "模型输出", name: "跟踪置信度", value: "判断轨迹连续性的可靠性", required: true },
      ],
    },
    {
      id: "task-3",
      name: "交通行为识别",
      scene_id: "scene-1",
      task_type: "交通行为识别",
      modality: "视频",
      dataset_count: 2,
      quality_status: "warning",
      created_at: "2026-04-04",
      sampleUnit: "短视频片段内单目标行为（3~10秒）",
      dataSpec: {
        id: "ds-3",
        dataVolume: "≥10,000个行为片段，覆盖5种以上行为类型",
        dataType: "视频片段（MP4，3~10秒，含完整行为过程）",
        language: "中文行为描述",
        domain: "交叉路口、人行横道、高速公路等",
      },
      qualityStandard: {
        id: "qs-3",
        accuracyThreshold: 0.75,
        consistencyRequirement: "同一行为多人标注结果一致率≥85%，时间边界误差≤0.5秒",
        qualificationRate: "有效行为样本率≥80%，即含清晰起止点的样本占比",
      },
      annotationSpec: {
        id: "as-3",
        guidelines: "1. 行为起止时间需精确到帧\n2. 关联目标需标注其当前行为\n3. 行为类别需符合国家标准分类\n4. 异常行为（如逆行）需特别标注",
        edgeCaseRules: "1. 行为边界模糊：标注到可见变化起始帧\n2. 多目标同时发生行为：分别标注每个目标\n3. 行为中断后继续：视为同一行为\n4. 持续性行为（如违停）：需标注持续时长",
        exampleSet: "正例：行人闯红灯行为：红灯亮起→行人过马路→绿灯亮起\n反例：行为起止时间不完整，缺少关键过程帧",
      },
      evaluationMetrics: [
        { id: "ev-7", name: "F1 Score", key: "f1", threshold: 0.75, isPrimary: true, description: "精确率和召回率的调和平均数，综合衡量行为识别性能" },
        { id: "ev-8", name: "Recall", key: "recall", threshold: 0.75, isPrimary: false, description: "实际发生的行为被正确识别的比例，衡量漏检能力" },
        { id: "ev-9", name: "Precision", key: "precision", threshold: 0.75, isPrimary: false, description: "识别出的行为中实际正确的比例，衡量误判能力" },
      ],
      modelRequirements: [
        { id: "mr-18", category: "模型输入", name: "输入数据", value: "交通场景短视频片段（3~10秒，16/32帧连续帧序列）", required: true },
        { id: "mr-19", category: "模型输入", name: "目标检测结果", value: "目标类别+bbox", required: true },
        { id: "mr-20", category: "模型输入", name: "目标跟踪结果", value: "目标ID+逐帧轨迹", required: true },
        { id: "mr-21", category: "模型输出", name: "行为类别标签", value: "逆行、违停、横穿马路等交通行为", required: true },
        { id: "mr-22", category: "模型输出", name: "时间区间", value: "行为发生的起止秒数/起止帧", required: true },
        { id: "mr-23", category: "模型输出", name: "行为置信度", value: "判断行为识别结果的可靠性", required: true },
        { id: "mr-24", category: "模型输出", name: "关联目标ID", value: "明确该行为对应的具体目标", required: true },
      ],
    },
    {
      id: "task-4",
      name: "交通事件识别",
      scene_id: "scene-1",
      task_type: "交通事件识别",
      modality: "视频",
      dataset_count: 1,
      quality_status: "pending",
      created_at: "2026-04-05",
      sampleUnit: "完整事件视频片段（5~30秒）",
      dataSpec: {
        id: "ds-4",
        dataVolume: "≥2,000个事件样本，涵盖事故/拥堵/抛洒物等类型",
        dataType: "事件视频片段（MP4，5~30秒，含完整事件过程）",
        language: "中文事件描述",
        domain: "高速公路、城市快速路、隧道等",
      },
      qualityStandard: {
        id: "qs-4",
        accuracyThreshold: 0.80,
        consistencyRequirement: "同一事件多人标注等级一致率≥90%，事件起止时间误差≤2秒",
        qualificationRate: "事件分级准确率≥85%，即轻度/中度/重度判定正确率",
      },
      annotationSpec: {
        id: "as-4",
        guidelines: "1. 事故类事件：标注涉事车辆、碰撞位置、损失等级\n2. 拥堵类事件：标注拥堵范围、持续时间、严重程度\n3. 抛洒物类事件：标注位置、抛洒物类型、对交通影响\n4. 事件等级判定需综合考虑伤亡、财产损失、交通影响",
        edgeCaseRules: "1. 多事件同时发生：按严重程度排序，主要事件优先\n2. 事件早期预警：标注为「可疑行为」而非事件\n3. 事件演化：需标注从发生到结束的全过程\n4. 轻微事故（无损失）：标注为「异常事件」而非「事故」",
        exampleSet: "正例：追尾事故：车辆A正常行驶→前车急刹→碰撞→事故发生\n反例：未标注涉事目标列表，或事件等级与实际不符",
      },
      evaluationMetrics: [
        { id: "ev-10", name: "F1 Score", key: "f1", threshold: 0.80, isPrimary: true, description: "交通事件识别的综合性能指标，平衡精确率和召回率" },
        { id: "ev-11", name: "Recall", key: "recall", threshold: 0.80, isPrimary: false, description: "实际发生的交通事件被正确识别的比例" },
        { id: "ev-12", name: "Precision", key: "precision", threshold: 0.80, isPrimary: false, description: "识别出的事件中实际正确的比例" },
      ],
      modelRequirements: [
        { id: "mr-27", category: "模型输入", name: "输入数据", value: "完整交通事件视频片段（5~30秒，包含事件完整过程）", required: true },
        { id: "mr-28", category: "模型输入", name: "目标检测结果", value: "目标类别+bbox", required: true },
        { id: "mr-29", category: "模型输入", name: "目标跟踪结果", value: "目标ID+轨迹+运动参数", required: true },
        { id: "mr-30", category: "模型输入", name: "行为识别结果", value: "行为标签+时间区间", required: true },
        { id: "mr-31", category: "模型输出", name: "事件类别标签", value: "交通事故、拥堵、违停、抛洒物等", required: true },
        { id: "mr-32", category: "模型输出", name: "时空信息", value: "起止时间、车道号、路口区域", required: true },
        { id: "mr-33", category: "模型输出", name: "事件置信度", value: "判断事件识别结果的可靠性", required: true },
        { id: "mr-34", category: "模型输出", name: "涉事目标ID", value: "明确参与事件的所有目标", required: true },
      ],
    },
    {
      id: "task-5",
      name: "时序建模与异常分析",
      scene_id: "scene-1",
      task_type: "时序分析",
      modality: "视频",
      dataset_count: 0,
      quality_status: "pending",
      created_at: "2026-04-06",
      sampleUnit: "长时视频序列（几十秒~分钟）",
      dataSpec: {
        id: "ds-5",
        dataVolume: "≥500段长时视频，每段30秒~5分钟",
        dataType: "连续视频流（MP4/流媒体格式）及对应时序特征数据",
        language: "中文交通状态描述",
        domain: "城市主干道、高速公路收费口、大型停车场等",
      },
      qualityStandard: {
        id: "qs-5",
        accuracyThreshold: 0.75,
        consistencyRequirement: "异常点定位误差≤1秒，趋势判断准确率≥85%",
        qualificationRate: "异常事件标注完整率≥90%",
      },
      annotationSpec: {
        id: "as-5",
        guidelines: "1. 异常点需标注精确时间戳\n2. 趋势判定需有明确的判定依据\n3. 事件演化阶段需连续标注\n4. 需提供正常状态基线数据",
        edgeCaseRules: "1. 渐变型异常（如缓慢拥堵）：标注起始点和达到阈值点\n2. 突发型异常（如事故）：标注事件发生时刻\n3. 周期性拥堵（如早晚高峰）：标注为「常态异常」\n4. 多个异常叠加：分别标注并标注优先级",
        exampleSet: "正例：事故→拥堵形成→拥堵持续→事故清除→拥堵消散\n反例：缺少异常点精确定位，或趋势判定缺乏依据",
      },
      evaluationMetrics: [
        { id: "ev-13", name: "F1 Score", key: "f1", threshold: 0.75, isPrimary: true, description: "时序异常检测的综合性能指标" },
        { id: "ev-14", name: "MAE（异常点定位）", key: "MAE", threshold: 0.20, isPrimary: false, description: "异常点预测时间与实际时间的平均绝对误差" },
      ],
      modelRequirements: [
        { id: "mr-38", category: "模型输入", name: "输入数据", value: "长时连续交通监控视频序列（几十秒~几分钟级）", required: true },
        { id: "mr-39", category: "模型输入", name: "跟踪轨迹序列", value: "所有目标的跨帧轨迹、运动参数", required: true },
        { id: "mr-40", category: "模型输入", name: "交通时序特征", value: "车流速度、流量、密度等随时间变化的数据", required: true },
        { id: "mr-42", category: "模型输出", name: "时序变化趋势", value: "拥堵扩散/缓解/平稳等", required: true },
        { id: "mr-43", category: "模型输出", name: "异常变化点", value: "精准定位异常发生的时刻（如突发停车）", required: true },
        { id: "mr-44", category: "模型输出", name: "事件演化阶段", value: "发生→发展→稳定→结束", required: true },
      ],
    },
  ],
  "scene-2": [
    {
      id: "task-5",
      name: "电力杆塔检测",
      scene_id: "scene-2",
      task_type: "目标检测",
      modality: "图像",
      dataset_count: 2,
      quality_status: "pass",
      created_at: "2026-03-29",
      sampleUnit: "单个杆塔目标框（坐标+类别）",
      dataSpec: {
        id: "ds-6",
        dataVolume: "≥20,000张图像，覆盖不同电压等级杆塔",
        dataType: "图像（JPG/PNG，分辨率2048×1536或更高）",
        language: "中文设备标识",
        domain: "高压输电线路、变电站、配电线路等",
      },
      qualityStandard: {
        id: "qs-6",
        accuracyThreshold: 0.80,
        consistencyRequirement: "同一杆塔多次标注结果一致率≥95%",
        qualificationRate: "合格率底线≥92%",
      },
      annotationSpec: {
        id: "as-6",
        guidelines: "1. 标注框需紧贴杆塔轮廓\n2. 不同电压等级杆塔需标注等级\n3. 杆塔部件需分层标注",
        edgeCaseRules: "1. 模糊图像降低置信度\n2. 遮挡超50%标注完整轮廓",
        exampleSet: "正例：标准杆塔完整出现在画面中\n反例：标注框过大或过小",
      },
      evaluationMetrics: [
        { id: "ev-15", name: "mAP@IoU=0.5", key: "mAP@0.5", threshold: 0.80, isPrimary: true, description: "目标检测平均精度" },
        { id: "ev-16", name: "Precision", key: "precision", threshold: 0.85, isPrimary: false, description: "检测精确率" },
      ],
      modelRequirements: [
        { id: "mr-45", category: "模型输入", name: "输入数据", value: "电力巡检图像（2048×1536）", required: true },
        { id: "mr-46", category: "模型输出", name: "杆塔类别", value: "直线塔、转角塔、终端塔等", required: true },
        { id: "mr-47", category: "模型输出", name: "边界框", value: "bbox [x1,y1,x2,y2]", required: true },
      ],
    },
    {
      id: "task-6",
      name: "绝缘子缺陷识别",
      scene_id: "scene-2",
      task_type: "图像分类",
      modality: "图像",
      dataset_count: 2,
      quality_status: "pass",
      created_at: "2026-03-30",
      sampleUnit: "单个绝缘子图像（分类标签）",
      dataSpec: {
        id: "ds-7",
        dataVolume: "≥10,000张图像，含正常/缺陷样本",
        dataType: "图像（JPG/PNG，可见光/红外）",
        language: "中文缺陷描述",
        domain: "高压输电线路绝缘子",
      },
      qualityStandard: {
        id: "qs-7",
        accuracyThreshold: 0.85,
        consistencyRequirement: "缺陷分类一致率≥90%",
        qualificationRate: "有效样本率≥88%",
      },
      annotationSpec: {
        id: "as-7",
        guidelines: "1. 缺陷类型需符合国家标准\n2. 严重程度需量化标注\n3. 缺陷位置需精确",
        edgeCaseRules: "1. 微小缺陷需放大标注\n2. 复合缺陷分别标注",
        exampleSet: "正例：正常绝缘子完整无缺陷\n反例：缺陷类型与实际不符",
      },
      evaluationMetrics: [
        { id: "ev-17", name: "Accuracy", key: "accuracy", threshold: 0.85, isPrimary: true, description: "分类准确率" },
        { id: "ev-18", name: "F1 Score", key: "f1", threshold: 0.82, isPrimary: false, description: "F1综合评分" },
      ],
      modelRequirements: [
        { id: "mr-48", category: "模型输入", name: "输入数据", value: "绝缘子图像", required: true },
        { id: "mr-49", category: "模型输出", name: "缺陷分类", value: "正常/裂纹/破损/污染", required: true },
        { id: "mr-50", category: "模型输出", name: "置信度", value: "判断可靠性", required: true },
      ],
    },
    {
      id: "task-7",
      name: "设备温度监测",
      scene_id: "scene-2",
      task_type: "回归分析",
      modality: "传感器",
      dataset_count: 1,
      quality_status: "warning",
      created_at: "2026-03-31",
      sampleUnit: "设备温度时序数据点",
      dataSpec: {
        id: "ds-8",
        dataVolume: "≥5,000个监测点，≥30天连续数据",
        dataType: "传感器数据（温度/电流/电压时序）",
        language: "中文设备标识",
        domain: "变电站、开关柜、配电房等",
      },
      qualityStandard: {
        id: "qs-8",
        accuracyThreshold: 0.75,
        consistencyRequirement: "温度异常判定准确率≥85%",
        qualificationRate: "有效数据完整率≥90%",
      },
      annotationSpec: {
        id: "as-8",
        guidelines: "1. 异常阈值需符合设备规范\n2. 告警等级需量化\n3. 时序数据需连续完整",
        edgeCaseRules: "1. 传感器故障数据需剔除\n2. 环境温度补偿需标注",
        exampleSet: "正例：正常温度范围内稳定运行\n反例：异常未及时告警",
      },
      evaluationMetrics: [
        { id: "ev-19", name: "MAE", key: "MAE", threshold: 2.0, isPrimary: true, description: "温度预测平均绝对误差" },
        { id: "ev-20", name: "RMSE", key: "RMSE", threshold: 3.0, isPrimary: false, description: "均方根误差" },
      ],
      modelRequirements: [
        { id: "mr-51", category: "模型输入", name: "输入数据", value: "设备传感器时序数据", required: true },
        { id: "mr-52", category: "模型输出", name: "温度预测", value: "设备温度值（℃）", required: true },
        { id: "mr-53", category: "模型输出", name: "异常告警", value: "正常/告警/严重", required: true },
      ],
    },
  ],
  "scene-3": [
    {
      id: "task-8",
      name: "发票OCR识别",
      scene_id: "scene-3",
      task_type: "文字识别",
      modality: "文本",
      dataset_count: 2,
      quality_status: "pass",
      created_at: "2026-03-21",
      sampleUnit: "单张发票（文字+表格坐标）",
      dataSpec: {
        id: "ds-9",
        dataVolume: "≥10,000张发票图像，涵盖多种票种",
        dataType: "图像（PDF/扫描件 JPG，分辨率300DPI）",
        language: "中文/英文发票",
        domain: "增值税发票、机票行程单、酒店账单等",
      },
      qualityStandard: {
        id: "qs-9",
        accuracyThreshold: 0.95,
        consistencyRequirement: "关键字段识别一致率≥98%",
        qualificationRate: "有效识别率≥95%",
      },
      annotationSpec: {
        id: "as-9",
        guidelines: "1. 文字区域需精确框选\n2. 表格结构需还原\n3. 关键字段需分类标注",
        edgeCaseRules: "1. 模糊/倾斜图像需矫正\n2. 手写内容单独标注",
        exampleSet: "正例：发票所有字段清晰可辨\n反例：字段识别错误或遗漏",
      },
      evaluationMetrics: [
        { id: "ev-21", name: "Character Accuracy", key: "char_acc", threshold: 0.95, isPrimary: true, description: "字符识别准确率" },
        { id: "ev-22", name: "Field Accuracy", key: "field_acc", threshold: 0.93, isPrimary: false, description: "字段提取准确率" },
      ],
      modelRequirements: [
        { id: "mr-54", category: "模型输入", name: "输入数据", value: "发票图像（300DPI）", required: true },
        { id: "mr-55", category: "模型输出", name: "文字内容", value: "OCR识别结果文本", required: true },
        { id: "mr-56", category: "模型输出", name: "结构化字段", value: "金额/日期/税号等", required: true },
      ],
    },
    {
      id: "task-9",
      name: "证件信息提取",
      scene_id: "scene-3",
      task_type: "文字识别",
      modality: "文本",
      dataset_count: 2,
      quality_status: "pass",
      created_at: "2026-03-22",
      sampleUnit: "单张证件（人像+文字区域）",
      dataSpec: {
        id: "ds-10",
        dataVolume: "≥5,000张证件图像，覆盖多种类型",
        dataType: "图像（身份证/护照/驾照/营业执照等）",
        language: "中文/英文",
        domain: "身份证、护照、驾驶证、营业执照等",
      },
      qualityStandard: {
        id: "qs-10",
        accuracyThreshold: 0.98,
        consistencyRequirement: "关键字段一致率≥99%",
        qualificationRate: "有效识别率≥97%",
      },
      annotationSpec: {
        id: "as-10",
        guidelines: "1. 人像区域需精确定位\n2. 文字字段需分类标注\n3. 防伪特征需特殊标记",
        edgeCaseRules: "1. 损坏证件需标注损坏程度\n2. 多种语言混合需分语言标注",
        exampleSet: "正例：证件所有字段清晰可辨\n反例：字段识别错误或人像位置偏移",
      },
      evaluationMetrics: [
        { id: "ev-23", name: "Field Accuracy", key: "field_acc", threshold: 0.98, isPrimary: true, description: "字段提取准确率" },
        { id: "ev-24", name: "Name Match Rate", key: "name_match", threshold: 0.99, isPrimary: false, description: "姓名匹配率" },
      ],
      modelRequirements: [
        { id: "mr-57", category: "模型输入", name: "输入数据", value: "证件图像", required: true },
        { id: "mr-58", category: "模型输出", name: "人像坐标", value: "人像区域bbox", required: true },
        { id: "mr-59", category: "模型输出", name: "结构化信息", value: "姓名/号码/有效期等", required: true },
      ],
    },
  ],
};

const SCENE_TYPES = ["交通事件", "工业巡检", "文字识别", "智能安防", "医疗影像"];
const TASK_TYPES = [
  "目标检测", "图像分类", "语义分割", "文字识别",
  "视频分析", "语音识别", "回归分析",
  "目标跟踪", "交通行为识别", "交通事件识别", "时序分析",
];
const MODALITIES = ["图像", "文本", "视频", "音频", "传感器", "多模态"];
const LABEL_COLORS = [
  "#ef4444","#f97316","#eab308","#22c55e",
  "#06b6d4","#3b82f6","#6366f1","#8b5cf6",
  "#ec4899","#64748b",
];

// ===== 标签体系编辑器组件 =====
function LabelSchemaEditor({
  labels,
  sceneId,
  onChange,
}: {
  labels: LabelNode[];
  sceneId: string;
  onChange: (labels: LabelNode[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", color: "", description: "" });
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const toggleCollapse = (id: string) => {
    const next = new Set(collapsedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setCollapsedIds(next);
  };

  const startEdit = (node: LabelNode) => {
    setEditingId(node.id);
    setEditForm({ name: node.name, color: node.color, description: node.description });
  };

  const saveEdit = (parentId: string | null) => {
    if (!editForm.name.trim()) return;
    const updated = editNode(labels, editingId!, { ...editForm });
    onChange(updated);
    setEditingId(null);
  };

  const addTopLevel = () => {
    const newNode: LabelNode = {
      id: `label-${Date.now()}`,
      name: "新标签",
      color: LABEL_COLORS[labels.length % LABEL_COLORS.length],
      description: "",
      children: [],
    };
    onChange([...labels, newNode]);
    setEditingId(newNode.id);
    setEditForm({ name: "", color: newNode.color, description: "" });
  };

  const addChild = (parentId: string) => {
    const newNode: LabelNode = {
      id: `label-${Date.now()}`,
      name: "新标签",
      color: LABEL_COLORS[0],
      description: "",
      children: [],
    };
    const updated = addChildNode(labels, parentId, newNode);
    onChange(updated);
    setEditingId(newNode.id);
    setEditForm({ name: "", color: newNode.color, description: "" });
  };

  const deleteNode = (nodeId: string) => {
    if (!confirm("确定删除该标签？")) return;
    onChange(removeNode(labels, nodeId));
  };

  const countNodes = (nodes: LabelNode[]): number =>
    nodes.reduce((acc, n) => acc + 1 + countNodes(n.children), 0);

  return (
    <div>
      {/* 头部操作栏 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#64748b" }}>
            共 <strong style={{ color: "#4f46e5" }}>{countNodes(labels)}</strong> 个标签
          </span>
          {labels.length === 0 && (
            <span style={{ fontSize: 12, color: "#94a3b8" }}>点击下方按钮添加第一层标签</span>
          )}
        </div>
        <button
          onClick={addTopLevel}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            fontSize: 13,
            color: "#fff",
            background: "#4f46e5",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          <Plus size={14} />
          添加一级标签
        </button>
      </div>

      {/* 标签树 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {labels.map((node) => (
          <LabelTreeNode
            key={node.id}
            node={node}
            depth={0}
            editingId={editingId}
            editForm={editForm}
            collapsedIds={collapsedIds}
            onToggle={toggleCollapse}
            onStartEdit={startEdit}
            onEditChange={setEditForm}
            onSaveEdit={saveEdit}
            onCancelEdit={() => setEditingId(null)}
            onAddChild={addChild}
            onDelete={deleteNode}
          />
        ))}
      </div>
    </div>
  );
}

function LabelTreeNode({
  node,
  depth,
  editingId,
  editForm,
  collapsedIds,
  onToggle,
  onStartEdit,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  onAddChild,
  onDelete,
}: {
  node: LabelNode;
  depth: number;
  editingId: string | null;
  editForm: { name: string; color: string; description: string };
  collapsedIds: Set<string>;
  onToggle: (id: string) => void;
  onStartEdit: (node: LabelNode) => void;
  onEditChange: (form: { name: string; color: string; description: string }) => void;
  onSaveEdit: (parentId: string | null) => void;
  onCancelEdit: () => void;
  onAddChild: (parentId: string) => void;
  onDelete: (nodeId: string) => void;
}) {
  const isEditing = editingId === node.id;
  const isCollapsed = collapsedIds.has(node.id);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      {/* 节点行 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 12px",
          borderRadius: 6,
          border: "1px solid #e2e8f0",
          background: isEditing ? "#f5f3ff" : "#fff",
          marginLeft: depth * 24,
          transition: "all 0.15s",
        }}
      >
        {/* 展开/折叠按钮 */}
        <button
          onClick={() => hasChildren && onToggle(node.id)}
          style={{
            width: 20,
            height: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: hasChildren ? "pointer" : "default",
            color: hasChildren ? "#64748b" : "transparent",
            fontSize: 12,
            padding: 0,
            flexShrink: 0,
          }}
        >
          {hasChildren ? (isCollapsed ? "+" : "−") : "·"}
        </button>

        {/* 颜色点 */}
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: node.color,
            flexShrink: 0,
          }}
        />

        {isEditing ? (
          <>
            {/* 编辑表单 */}
            <input
              autoFocus
              value={editForm.name}
              onChange={(e) => onEditChange({ ...editForm, name: e.target.value })}
              placeholder="标签名称"
              style={{
                flex: 1,
                padding: "4px 8px",
                border: "1px solid #d4d8f0",
                borderRadius: 4,
                fontSize: 13,
                outline: "none",
                minWidth: 0,
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveEdit(null);
                if (e.key === "Escape") onCancelEdit();
              }}
            />
            {/* 颜色选择 */}
            <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
              {LABEL_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => onEditChange({ ...editForm, color: c })}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: c,
                    border: editForm.color === c ? "2px solid #1e293b" : "1px solid #e2e8f0",
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
              ))}
            </div>
            <input
              value={editForm.description}
              onChange={(e) => onEditChange({ ...editForm, description: e.target.value })}
              placeholder="描述（可选）"
              style={{
                padding: "4px 8px",
                border: "1px solid #d4d8f0",
                borderRadius: 4,
                fontSize: 12,
                outline: "none",
                width: 120,
              }}
            />
            <button
              onClick={() => onSaveEdit(null)}
              style={{
                padding: "4px 10px",
                fontSize: 12,
                color: "#fff",
                background: "#22c55e",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              保存
            </button>
            <button
              onClick={onCancelEdit}
              style={{
                padding: "4px 10px",
                fontSize: 12,
                color: "#64748b",
                background: "#f1f5f9",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              取消
            </button>
          </>
        ) : (
          <>
            {/* 正常显示 */}
            <span
              style={{
                flex: 1,
                fontSize: 13,
                fontWeight: 500,
                color: "#1e293b",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {node.name}
            </span>
            {node.description && (
              <span
                style={{
                  fontSize: 11,
                  color: "#94a3b8",
                  maxWidth: 160,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {node.description}
              </span>
            )}
            <button
              onClick={() => onAddChild(node.id)}
              title="添加子标签"
              style={{
                padding: "3px 6px",
                fontSize: 11,
                color: "#4f46e5",
                background: "#f5f3ff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              + 子标签
            </button>
            <button
              onClick={() => onStartEdit(node)}
              title="编辑"
              style={{
                padding: "3px 6px",
                fontSize: 11,
                color: "#64748b",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 4,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              编辑
            </button>
            <button
              onClick={() => onDelete(node.id)}
              title="删除"
              style={{
                padding: "3px 6px",
                fontSize: 11,
                color: "#ef4444",
                background: "#fef2f2",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              删除
            </button>
          </>
        )}
      </div>

      {/* 子节点 */}
      {!isCollapsed && node.children.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
          {node.children.map((child) => (
            <LabelTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              editingId={editingId}
              editForm={editForm}
              collapsedIds={collapsedIds}
              onToggle={onToggle}
              onStartEdit={onStartEdit}
              onEditChange={onEditChange}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ===== 辅助函数 =====
function editNode(nodes: LabelNode[], id: string, updates: Partial<LabelNode>): LabelNode[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, ...updates };
    if (n.children.length > 0) return { ...n, children: editNode(n.children, id, updates) };
    return n;
  });
}

function addChildNode(nodes: LabelNode[], parentId: string, child: LabelNode): LabelNode[] {
  return nodes.map((n) => {
    if (n.id === parentId) return { ...n, children: [...n.children, child] };
    if (n.children.length > 0) return { ...n, children: addChildNode(n.children, parentId, child) };
    return n;
  });
}

function removeNode(nodes: LabelNode[], id: string): LabelNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => ({
      ...n,
      children: removeNode(n.children, id),
    }));
}

// ===== 主页面组件 =====
function TaskModelingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTask = searchParams.get("task");

  // 状态
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [sceneTasks, setSceneTasks] = useState<Task[]>([]);
  const [expandedScenes, setExpandedScenes] = useState<Set<string>>(new Set());
  const [activeSceneTab, setActiveSceneTab] = useState<"info" | "labels" | "tasks" | "datasets">("info");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showSceneModal, setShowSceneModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  // 场景表单
  const [sceneForm, setSceneForm] = useState({
    name: "",
    description: "",
    type: "",
  });

  // 任务表单
  const [taskForm, setTaskForm] = useState({
    name: "",
    task_type: "",
    modality: "",
    sampleUnit: "",
    dataRequirements: [] as DataRequirement[],
    evaluationMetrics: [] as EvaluationMetric[],
    modelRequirements: [] as ModelRequirement[],
  });

  const DATA_FIELD_TYPES = ["string", "number", "boolean", "file", "array", "object"];
  const COMMON_DATA_FIELDS: Record<string, { field: string; type: string; required: boolean }[]> = {
    "目标检测": [
      { field: "图像文件", type: "file", required: true },
      { field: "标注框坐标", type: "array", required: true },
      { field: "目标类别", type: "string", required: true },
      { field: "置信度分数", type: "number", required: false },
    ],
    "图像分类": [
      { field: "图像文件", type: "file", required: true },
      { field: "类别标签", type: "string", required: true },
      { field: "图像元数据", type: "object", required: false },
    ],
    "文字识别": [
      { field: "图像文件", type: "file", required: true },
      { field: "识别文本", type: "string", required: true },
      { field: "文本坐标", type: "array", required: false },
    ],
    "视频分析": [
      { field: "视频文件", type: "file", required: true },
      { field: "时间戳", type: "number", required: true },
      { field: "事件标签", type: "string", required: true },
    ],
    "语音识别": [
      { field: "音频文件", type: "file", required: true },
      { field: "转写文本", type: "string", required: true },
      { field: "开始时间", type: "number", required: true },
    ],
  "回归分析": [
    { field: "特征向量", type: "array", required: true },
    { field: "目标值", type: "number", required: true },
  ],
  "目标跟踪": [
    { field: "视频帧序列", type: "file", required: true },
    { field: "目标ID", type: "string", required: true },
    { field: "逐帧bbox坐标", type: "array", required: true },
    { field: "帧编号/时间戳", type: "array", required: true },
    { field: "跟踪置信度", type: "number", required: false },
    { field: "运动参数（速度/方向）", type: "object", required: false },
  ],
  "交通行为识别": [
    { field: "视频片段", type: "file", required: true },
    { field: "目标检测结果", type: "object", required: true },
    { field: "目标跟踪结果", type: "object", required: true },
    { field: "行为类别", type: "string", required: true },
    { field: "起止时间/帧", type: "array", required: true },
    { field: "关联目标ID", type: "string", required: true },
    { field: "行为置信度", type: "number", required: false },
  ],
  "交通事件识别": [
    { field: "事件视频片段", type: "file", required: true },
    { field: "目标检测+跟踪+行为结果", type: "object", required: true },
    { field: "事件类别", type: "string", required: true },
    { field: "起止时间", type: "array", required: true },
    { field: "涉事目标ID列表", type: "array", required: true },
    { field: "事件等级（轻度/中度/重度）", type: "string", required: false },
    { field: "事件置信度", type: "number", required: false },
  ],
  "时序分析": [
    { field: "长时视频序列", type: "file", required: true },
    { field: "轨迹序列数据", type: "object", required: true },
    { field: "交通时序特征（流量/速度/密度）", type: "array", required: true },
    { field: "事件识别结果", type: "object", required: false },
    { field: "趋势标签", type: "string", required: true },
    { field: "异常变化点时间戳", type: "array", required: true },
    { field: "事件演化阶段", type: "string", required: true },
  ],
};

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

// ===== 模型需求预设（交通场景五大核心任务）=====
const MODEL_REQ_CATEGORIES = ["输入规格", "输出规格", "推理要求", "部署要求"];

const MODEL_REQUIREMENT_PRESETS: Record<string, ModelRequirement[]> = {
  "目标检测": [
    { id: "mr-det-1", category: "输入规格", name: "输入数据", value: "交通监控视频单帧图像（1920×1080、1280×720）", required: true },
    { id: "mr-det-2", category: "输入规格", name: "预处理参数", value: "可选：亮度/对比度调整，道路场景类型（路口/高速/城市）", required: false },
    { id: "mr-det-3", category: "输出规格", name: "目标类别", value: "车辆、行人、非机动车、交通标识等核心目标", required: true },
    { id: "mr-det-4", category: "输出规格", name: "边界框", value: "bbox，以 [x1,y1,x2,y2] 格式表示", required: true },
    { id: "mr-det-5", category: "输出规格", name: "检测置信度", value: "判断检测结果的可靠性，用于筛选有效结果", required: true },
    { id: "mr-det-6", category: "输出规格", name: "帧编号/时间戳", value: "关联检测结果对应的图像帧", required: true },
    { id: "mr-det-7", category: "推理要求", name: "推理速度", value: "实时场景：≤50ms/帧；离线场景不限", required: false },
    { id: "mr-det-8", category: "部署要求", name: "部署平台", value: "GPU服务器 / 边缘设备 / 手机端", required: false },
  ],
  "目标跟踪": [
    { id: "mr-trk-1", category: "输入规格", name: "输入数据", value: "交通监控连续视频帧序列（10~30帧）", required: true },
    { id: "mr-trk-2", category: "输入规格", name: "目标检测结果", value: "单帧目标类别、bbox、置信度", required: true },
    { id: "mr-trk-3", category: "输入规格", name: "外观特征", value: "可选：车辆颜色、行人衣着，辅助提升跟踪稳定性", required: false },
    { id: "mr-trk-4", category: "输出规格", name: "目标唯一ID", value: "跨帧保持不变，用于区分不同目标", required: true },
    { id: "mr-trk-5", category: "输出规格", name: "逐帧轨迹", value: "每帧对应的 bbox，形成连续运动轨迹", required: true },
    { id: "mr-trk-6", category: "输出规格", name: "跟踪置信度", value: "判断轨迹连续性的可靠性", required: true },
    { id: "mr-trk-7", category: "输出规格", name: "运动参数", value: "可选：速度、运动方向", required: false },
    { id: "mr-trk-8", category: "推理要求", name: "推理速度", value: "实时场景：≤100ms/序列；离线场景不限", required: false },
    { id: "mr-trk-9", category: "部署要求", name: "部署平台", value: "GPU服务器 / 边缘设备", required: false },
  ],
  "交通行为识别": [
    { id: "mr-act-1", category: "输入规格", name: "输入数据", value: "交通场景短视频片段（3~10秒，16/32帧连续帧序列）", required: true },
    { id: "mr-act-2", category: "输入规格", name: "目标检测结果", value: "目标类别+bbox", required: true },
    { id: "mr-act-3", category: "输入规格", name: "目标跟踪结果", value: "目标ID+逐帧轨迹", required: true },
    { id: "mr-act-4", category: "输出规格", name: "行为类别标签", value: "逆行、违停、横穿马路等交通行为", required: true },
    { id: "mr-act-5", category: "输出规格", name: "时间区间", value: "行为发生的起止秒数/起止帧", required: true },
    { id: "mr-act-6", category: "输出规格", name: "行为置信度", value: "判断行为识别结果的可靠性", required: true },
    { id: "mr-act-7", category: "输出规格", name: "关联目标ID", value: "明确该行为对应的具体目标", required: true },
    { id: "mr-act-8", category: "推理要求", name: "推理速度", value: "实时场景：≤200ms/片段；离线场景不限", required: false },
    { id: "mr-act-9", category: "部署要求", name: "部署平台", value: "GPU服务器 / 边缘设备", required: false },
  ],
  "交通事件识别": [
    { id: "mr-evt-1", category: "输入规格", name: "输入数据", value: "完整交通事件视频片段（5~30秒，包含事件完整过程）", required: true },
    { id: "mr-evt-2", category: "输入规格", name: "目标检测结果", value: "目标类别+bbox", required: true },
    { id: "mr-evt-3", category: "输入规格", name: "目标跟踪结果", value: "目标ID+轨迹+运动参数", required: true },
    { id: "mr-evt-4", category: "输入规格", name: "行为识别结果", value: "行为标签+时间区间", required: true },
    { id: "mr-evt-5", category: "输出规格", name: "事件类别标签", value: "交通事故、道路拥堵、违停、抛洒物等", required: true },
    { id: "mr-evt-6", category: "输出规格", name: "时空信息", value: "起止时间、车道号、路口区域", required: true },
    { id: "mr-evt-7", category: "输出规格", name: "事件置信度", value: "判断事件识别结果的可靠性", required: true },
    { id: "mr-evt-8", category: "输出规格", name: "涉事目标ID", value: "明确参与事件的所有目标", required: true },
    { id: "mr-evt-9", category: "输出规格", name: "事件等级", value: "可选：轻度/中度/重度", required: false },
    { id: "mr-evt-10", category: "推理要求", name: "推理速度", value: "实时场景：≤500ms/事件；离线场景不限", required: false },
    { id: "mr-evt-11", category: "部署要求", name: "部署平台", value: "GPU服务器", required: false },
  ],
  "时序分析": [
    { id: "mr-seq-1", category: "输入规格", name: "输入数据", value: "长时连续交通监控视频序列（几十秒~几分钟）", required: true },
    { id: "mr-seq-2", category: "输入规格", name: "跟踪轨迹序列", value: "所有目标的跨帧轨迹、运动参数", required: true },
    { id: "mr-seq-3", category: "输入规格", name: "交通时序特征", value: "车流速度、流量、密度等随时间变化的数据", required: true },
    { id: "mr-seq-4", category: "输入规格", name: "事件识别结果", value: "可选：辅助模型学习事件演化规律", required: false },
    { id: "mr-seq-5", category: "输出规格", name: "时序变化趋势", value: "拥堵扩散/缓解/平稳等", required: true },
    { id: "mr-seq-6", category: "输出规格", name: "异常变化点", value: "精准定位异常发生的时刻（如突发停车）", required: true },
    { id: "mr-seq-7", category: "输出规格", name: "事件演化阶段", value: "发生→发展→稳定→结束", required: true },
    { id: "mr-seq-8", category: "输出规格", name: "事件持续时长", value: "从异常发生到恢复正常的时间", required: true },
    { id: "mr-seq-9", category: "输出规格", name: "趋势预测", value: "可选：未来拥堵蔓延预测", required: false },
    { id: "mr-seq-10", category: "推理要求", name: "推理速度", value: "实时场景：≤1s/分钟；离线场景不限", required: false },
    { id: "mr-seq-11", category: "部署要求", name: "部署平台", value: "GPU服务器 / 云计算", required: false },
  ],
};

// ===== 样本单元预设（扩展交通场景）=====
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

  // 加载数据
  useEffect(() => {
    loadScenes();
  }, []);

  const loadScenes = async () => {
    setLoading(true);
    try {
      setScenes(MOCK_SCENES);
      // 默认选中第一个场景
      if (MOCK_SCENES.length > 0) {
        const first = MOCK_SCENES[0];
        setSelectedScene(first);
        loadSceneTasks(first.id);
        setExpandedScenes(new Set([first.id]));
      }
    } catch (error) {
      console.error("Failed to load scenes:", error);
    } finally {
      setLoading(false);
    }
  };

  // 加载场景任务
  const loadSceneTasks = (sceneId: string) => {
    const tasks = MOCK_TASKS[sceneId] || [];
    setSceneTasks(tasks);
  };

  // 切换场景展开
  const toggleScene = (sceneId: string) => {
    const newExpanded = new Set(expandedScenes);
    if (newExpanded.has(sceneId)) {
      newExpanded.delete(sceneId);
    } else {
      newExpanded.add(sceneId);
    }
    setExpandedScenes(newExpanded);
  };

  // 选择场景
  const selectScene = (scene: Scene) => {
    setSelectedScene(scene);
    loadSceneTasks(scene.id);
  };

  // 打开场景详情
  const openSceneDetail = (scene: Scene) => {
    setSelectedScene(scene);
    loadSceneTasks(scene.id);
  };

  // 跳转任务详情
  const goToTaskDetail = (taskId: string) => {
    router.push(`/task-modeling/task/${taskId}`);
  };

  // 跳转创建任务
  const goToCreateTask = (sceneId?: string) => {
    const url = sceneId
      ? `/task-modeling/task/create?scene=${sceneId}`
      : `/task-modeling/task/create`;
    router.push(url);
  };

  // 跳转数据集
  const goToDatasets = (task?: Task) => {
    const url = task
      ? `/data-asset/dataset?task=${encodeURIComponent(task.name)}`
      : `/data-asset/dataset`;
    router.push(url);
  };

  // 场景 CRUD
  const handleCreateScene = () => {
    setEditingScene(null);
    setSceneForm({ name: "", description: "", type: "" });
    setShowSceneModal(true);
  };

  const handleEditScene = (scene: Scene, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingScene(scene);
    setSceneForm({
      name: scene.name,
      description: scene.description,
      type: scene.type,
    });
    setShowSceneModal(true);
  };

  const handleDeleteScene = (sceneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("确定删除该场景吗？")) {
      setScenes((prev) => prev.filter((s) => s.id !== sceneId));
      if (selectedScene?.id === sceneId) {
        setSelectedScene(null);
        setSceneTasks([]);
      }
    }
  };

  const handleSaveScene = () => {
    if (!sceneForm.name.trim()) return;

    if (editingScene) {
      // 更新
      setScenes((prev) =>
        prev.map((s) =>
          s.id === editingScene.id
            ? { ...s, ...sceneForm }
            : s
        )
      );
      if (selectedScene?.id === editingScene.id) {
        setSelectedScene((prev) => prev ? { ...prev, ...sceneForm } : null);
      }
    } else {
      // 创建
      const newScene: Scene = {
        id: `scene-${Date.now()}`,
        name: sceneForm.name,
        description: sceneForm.description,
        type: sceneForm.type,
        task_count: 0,
        dataset_count: 0,
        created_at: new Date().toISOString().split("T")[0],
        status: "active",
      };
      setScenes((prev) => [...prev, newScene]);
      MOCK_TASKS[newScene.id] = [];
    }

    setShowSceneModal(false);
  };

  // 任务 CRUD - 跳转到创建页
  const handleCreateTask = () => {
    if (selectedScene) {
      goToCreateTask(selectedScene.id);
    } else {
      goToCreateTask();
    }
  };

  const handleEditTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setTaskForm({
      name: task.name,
      task_type: task.task_type,
      modality: task.modality,
      sampleUnit: task.sampleUnit || "",
      dataRequirements: task.dataRequirements || [],
      evaluationMetrics: task.evaluationMetrics || [],
      modelRequirements: task.modelRequirements || [],
    });
    setShowTaskModal(true);
  };

  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedScene) return;
    if (confirm("确定删除该任务吗？")) {
      const newTasks = (MOCK_TASKS[selectedScene.id] || []).filter(
        (t) => t.id !== taskId
      );
      MOCK_TASKS[selectedScene.id] = newTasks;
      setSceneTasks(newTasks);
      setScenes((prev) =>
        prev.map((s) =>
          s.id === selectedScene.id
            ? { ...s, task_count: newTasks.length }
            : s
        )
      );
    }
  };

  const handleSaveTask = () => {
    if (!selectedScene || !taskForm.name.trim()) return;

    if (editingTask) {
      // 更新
      const newTasks = (MOCK_TASKS[selectedScene.id] || []).map((t) =>
        t.id === editingTask.id ? { ...t, ...taskForm } : t
      );
      MOCK_TASKS[selectedScene.id] = newTasks;
      setSceneTasks(newTasks);
    } else {
      // 创建
      const newTask: Task = {
        id: `task-${Date.now()}`,
        name: taskForm.name,
        scene_id: selectedScene.id,
        task_type: taskForm.task_type,
        modality: taskForm.modality,
        dataset_count: 0,
        quality_status: "pending",
        created_at: new Date().toISOString().split("T")[0],
        sampleUnit: taskForm.sampleUnit,
        dataRequirements: taskForm.dataRequirements,
        evaluationMetrics: taskForm.evaluationMetrics,
        modelRequirements: taskForm.modelRequirements,
      };
      const currentTasks = MOCK_TASKS[selectedScene.id] || [];
      MOCK_TASKS[selectedScene.id] = [...currentTasks, newTask];
      setSceneTasks([...currentTasks, newTask]);
      setScenes((prev) =>
        prev.map((s) =>
          s.id === selectedScene.id
            ? { ...s, task_count: currentTasks.length + 1 }
            : s
        )
      );
    }

    setShowTaskModal(false);
  };

  // 过滤场景
  const filteredScenes = scenes.filter(
    (scene) =>
      scene.name.includes(searchKeyword) ||
      scene.type.includes(searchKeyword) ||
      scene.description.includes(searchKeyword)
  );

  // 质量状态颜色
  const getQualityBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; text: string }> = {
      pass: { bg: "#dcfce7", color: "#16a34a", text: "通过" },
      warning: { bg: "#fef3c7", color: "#d97706", text: "告警" },
      pending: { bg: "#f3f4f6", color: "#6b7280", text: "待检" },
      fail: { bg: "#fee2e2", color: "#dc2626", text: "失败" },
    };
    const style = styles[status] || styles.pending;
    return (
      <span
        style={{
          padding: "2px 8px",
          borderRadius: 10,
          fontSize: 12,
          background: style.bg,
          color: style.color,
        }}
      >
        {style.text}
      </span>
    );
  };

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
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#1e293b", margin: 0 }}>
            任务建模
          </h1>
          <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
            定义业务场景与任务结构，统一规划数据和模型需求，牵引后续高质量数据集生产和模型训练应用全生命周期
          </p>
        </div>
        <button
          onClick={handleCreateScene}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          <Plus size={16} />
          新建场景
        </button>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* 左侧场景列表 */}
        <div
          style={{
            width: 380,
            background: "#fff",
            borderRight: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* 搜索 */}
          <div style={{ padding: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                background: "#f8fafc",
                borderRadius: 6,
                border: "1px solid #e2e8f0",
              }}
            >
              <Search size={16} style={{ color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="搜索场景..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          {/* 场景列表 */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}>
            {filteredScenes.map((scene) => (
              <div key={scene.id}>
                {/* 场景卡片 */}
                <div
                  onClick={() => {
                    toggleScene(scene.id);
                    selectScene(scene);
                  }}
                  style={{
                    padding: "12px",
                    marginBottom: 8,
                    borderRadius: 8,
                    border: selectedScene?.id === scene.id
                      ? "2px solid #4f46e5"
                      : "1px solid #e2e8f0",
                    background: selectedScene?.id === scene.id
                      ? "#f5f3ff"
                      : "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: "linear-gradient(135deg, #dbeafe, #e0e7ff)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Layers size={18} style={{ color: "#4f46e5" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#1e293b",
                          }}
                        >
                          {scene.name}
                        </span>
                        <span
                          style={{
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontSize: 11,
                            background: "#f1f5f9",
                            color: "#64748b",
                          }}
                        >
                          {scene.type}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          color: "#64748b",
                          margin: "4px 0 0",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {scene.description}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginTop: 8,
                          fontSize: 12,
                          color: "#94a3b8",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Target size={12} />
                          {scene.task_count} 个任务
                        </span>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            cursor: "pointer",
                            color: "#4f46e5",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            goToDatasets();
                          }}
                        >
                          <Database size={12} />
                          {scene.dataset_count} 个数据集
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {expandedScenes.has(scene.id) ? (
                        <ChevronDown size={16} style={{ color: "#94a3b8" }} />
                      ) : (
                        <ChevronRight size={16} style={{ color: "#94a3b8" }} />
                      )}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openSceneDetail(scene);
                      }}
                      style={{
                        flex: 1,
                        padding: "4px 8px",
                        fontSize: 12,
                        color: "#4f46e5",
                        background: "#f5f3ff",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      查看详情
                    </button>
                    <button
                      onClick={(e) => handleEditScene(scene, e)}
                      style={{
                        padding: "4px 8px",
                        fontSize: 12,
                        color: "#64748b",
                        background: "#f8fafc",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteScene(scene.id, e)}
                      style={{
                        padding: "4px 8px",
                        fontSize: 12,
                        color: "#ef4444",
                        background: "#fef2f2",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* 任务列表（展开时显示） */}
                {expandedScenes.has(scene.id) && (
                  <div
                    style={{
                      marginLeft: 20,
                      marginBottom: 12,
                      padding: "8px 12px",
                      background: "#f8fafc",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                        关联任务
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedScene(scene);
                          handleCreateTask();
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "2px 8px",
                          fontSize: 11,
                          color: "#4f46e5",
                          background: "#fff",
                          border: "1px solid #d4d8f0",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        <Plus size={10} />
                        添加任务
                      </button>
                    </div>
                    {(MOCK_TASKS[scene.id] || []).map((task) => (
                      <div
                        key={task.id}
                        onClick={() => goToTaskDetail(task.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 8px",
                          borderRadius: 4,
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#e0e7ff")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <Target size={14} style={{ color: "#64748b" }} />
                        <span style={{ flex: 1, fontSize: 13, color: "#475569" }}>
                          {task.name}
                        </span>
                        <span
                          style={{
                            padding: "1px 6px",
                            borderRadius: 4,
                            fontSize: 10,
                            background: "#f1f5f9",
                            color: "#64748b",
                          }}
                        >
                          {task.modality}
                        </span>
                        {getQualityBadge(task.quality_status)}
                      </div>
                    ))}
                    {(!MOCK_TASKS[scene.id] || MOCK_TASKS[scene.id].length === 0) && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "#94a3b8",
                          textAlign: "center",
                          padding: "8px 0",
                        }}
                      >
                        暂无任务
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {filteredScenes.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#94a3b8",
                }}
              >
                <Layers size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
                <p style={{ fontSize: 14 }}>暂无场景</p>
                <button
                  onClick={handleCreateScene}
                  style={{
                    marginTop: 12,
                    padding: "8px 16px",
                    background: "#4f46e5",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  创建第一个场景
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 右侧主内容区 */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {selectedScene ? (
            <div>
              {/* 场景详情卡片 */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: 24,
                  marginBottom: 24,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                      {selectedScene.name}
                    </h2>
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: 8,
                        padding: "4px 12px",
                        borderRadius: 6,
                        fontSize: 13,
                        background: "#f5f3ff",
                        color: "#4f46e5",
                      }}
                    >
                      {selectedScene.type}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => handleEditScene(selectedScene, { stopPropagation: () => {} } as React.MouseEvent)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 16px",
                        fontSize: 13,
                        color: "#64748b",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      <Edit3 size={14} />
                      编辑
                    </button>
                    <button
                      onClick={() => {
                        setSelectedScene(null);
                        setSceneTasks([]);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 16px",
                        fontSize: 13,
                        color: "#94a3b8",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      <X size={14} />
                      关闭
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginBottom: 20 }}>
                  {selectedScene.description}
                </p>

                {/* Tab 导航 */}
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    marginBottom: 20,
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  {[
                    { key: "info", label: "基本信息" },
                    { key: "labels", label: "标签体系" },
                    { key: "tasks", label: "任务列表" },
                    { key: "datasets", label: "数据列表" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveSceneTab(tab.key as "info" | "labels" | "tasks" | "datasets")}
                      style={{
                        padding: "8px 16px",
                        fontSize: 14,
                        fontWeight: activeSceneTab === tab.key ? 600 : 400,
                        color: activeSceneTab === tab.key ? "#4f46e5" : "#64748b",
                        background: "none",
                        border: "none",
                        borderBottom: activeSceneTab === tab.key
                          ? "2px solid #4f46e5"
                          : "2px solid transparent",
                        cursor: "pointer",
                        marginBottom: -1,
                        transition: "all 0.2s",
                      }}
                    >
                      {tab.label}
                      {tab.key === "labels" && (
                        <span
                          style={{
                            marginLeft: 6,
                            padding: "1px 6px",
                            borderRadius: 10,
                            fontSize: 11,
                            background: "#f5f3ff",
                            color: "#4f46e5",
                          }}
                        >
                          {selectedScene.labelSchema?.reduce((acc, n) => acc + 1 + n.children.length, 0) ?? 0}
                        </span>
                      )}
                      {tab.key === "tasks" && (
                        <span
                          style={{
                            marginLeft: 6,
                            padding: "1px 6px",
                            borderRadius: 10,
                            fontSize: 11,
                            background: "#f1f5f9",
                            color: "#64748b",
                          }}
                        >
                          {sceneTasks.length}
                        </span>
                      )}
                      {tab.key === "datasets" && (
                        <span
                          style={{
                            marginLeft: 6,
                            padding: "1px 6px",
                            borderRadius: 10,
                            fontSize: 11,
                            background: "#f0fdf4",
                            color: "#16a34a",
                          }}
                        >
                          3
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab 内容 */}
                {activeSceneTab === "info" && (
                  <div>
                    {/* 建模流程示意图 */}
                    <div
                      style={{
                        padding: 20,
                        background: "#f8fafc",
                        borderRadius: 8,
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 16 }}>
                        建模流程
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        {/* 步骤 1: 数据集 */}
                        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              padding: "12px 16px",
                              background: "#fff",
                              borderRadius: 8,
                              border: "1px solid #e2e8f0",
                              cursor: "pointer",
                            }}
                            onClick={() => setActiveSceneTab("datasets")}
                          >
                            <Database size={20} style={{ color: "#4f46e5", marginBottom: 8 }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>数据集</span>
                            <span style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                              {selectedScene.dataset_count} 个
                            </span>
                          </div>
                          <ChevronRight size={16} style={{ color: "#cbd5e1", margin: "0 8px", flexShrink: 0 }} />
                        </div>

                        {/* 步骤 2: 智能标注 */}
                        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              padding: "12px 16px",
                              background: "#fff",
                              borderRadius: 8,
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <Tag size={20} style={{ color: "#7c3aed", marginBottom: 8 }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>智能标注</span>
                            <span style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                              {sceneTasks.filter(t => t.has_smart_annotation).length} 个任务
                            </span>
                          </div>
                          <ChevronRight size={16} style={{ color: "#cbd5e1", margin: "0 8px", flexShrink: 0 }} />
                        </div>

                        {/* 步骤 3: 质量审核 */}
                        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              padding: "12px 16px",
                              background: "#fff",
                              borderRadius: 8,
                              border: "1px solid #22c55e",
                            }}
                          >
                            <CheckCircle size={20} style={{ color: "#22c55e", marginBottom: 8 }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>质量审核</span>
                            <span style={{ fontSize: 11, color: "#22c55e", marginTop: 4 }}>
                              {sceneTasks.filter(t => t.quality_status === "pass").length} 通过
                            </span>
                          </div>
                          <ChevronRight size={16} style={{ color: "#cbd5e1", margin: "0 8px", flexShrink: 0 }} />
                        </div>

                        {/* 步骤 4: 模型训练 */}
                        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              padding: "12px 16px",
                              background: "#fff",
                              borderRadius: 8,
                              border: "1px solid #e2e8f0",
                              cursor: "pointer",
                            }}
                            onClick={() => router.push("/model-training")}
                          >
                            <Cpu size={20} style={{ color: "#0891b2", marginBottom: 8 }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>模型训练</span>
                            <span style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                              {sceneTasks.length} 个任务
                            </span>
                          </div>
                          <ChevronRight size={16} style={{ color: "#cbd5e1", margin: "0 8px", flexShrink: 0 }} />
                        </div>

                        {/* 步骤 5: 模型部署 */}
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              padding: "12px 16px",
                              background: "#fff",
                              borderRadius: 8,
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <Rocket size={20} style={{ color: "#ea580c", marginBottom: 8 }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>模型部署</span>
                            <span style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>待开始</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 统计数字 */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 16,
                        padding: 20,
                        background: "#f8fafc",
                        borderRadius: 8,
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: "#4f46e5" }}>
                          {selectedScene.task_count}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>关联任务</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: "#4f46e5",
                            cursor: "pointer",
                          }}
                          onClick={() => setActiveSceneTab("datasets")}
                        >
                          {selectedScene.dataset_count}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>数据集</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: "#16a34a" }}>
                          {sceneTasks.filter((t) => t.quality_status === "pass").length}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>质量通过</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: "#d97706" }}>
                          {sceneTasks.filter((t) => t.quality_status === "warning").length}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>质量告警</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSceneTab === "labels" && (
                  <LabelSchemaEditor
                    labels={selectedScene.labelSchema || []}
                    sceneId={selectedScene.id}
                    onChange={(newLabels) => {
                      setScenes((prev) =>
                        prev.map((s) =>
                          s.id === selectedScene.id ? { ...s, labelSchema: newLabels } : s
                        )
                      );
                      setSelectedScene((prev) =>
                        prev ? { ...prev, labelSchema: newLabels } : null
                      );
                    }}
                  />
                )}

                {activeSceneTab === "tasks" && (
                  <div>
                    {/* 任务列表头部 */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 16,
                      }}
                    >
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                        任务列表
                      </h3>
                      <button
                        onClick={handleCreateTask}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "7px 14px",
                          fontSize: 13,
                          color: "#fff",
                          background: "#4f46e5",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                      >
                        <Plus size={14} />
                        新建任务
                      </button>
                    </div>
                    {sceneTasks.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {sceneTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => goToTaskDetail(task.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 16,
                              padding: 16,
                              borderRadius: 8,
                              border: "1px solid #e2e8f0",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.boxShadow =
                                "0 4px 12px rgba(0,0,0,0.08)";
                              (e.currentTarget as HTMLElement).style.borderColor = "#bfdbfe";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.boxShadow = "none";
                              (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
                            }}
                          >
                            <div
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 10,
                                background: "linear-gradient(135deg, #dbeafe, #e0e7ff)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Target size={20} style={{ color: "#4f46e5" }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>
                                  {task.name}
                                </span>
                                {getQualityBadge(task.quality_status)}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 16,
                                  marginTop: 6,
                                  fontSize: 12,
                                  color: "#64748b",
                                }}
                              >
                                <span
                                  style={{
                                    padding: "2px 8px",
                                    borderRadius: 4,
                                    background: "#f1f5f9",
                                  }}
                                >
                                  {task.task_type}
                                </span>
                                <span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  <Database size={12} />
                                  {task.dataset_count} 个数据集
                                </span>
                                <span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  <Clock size={12} />
                                  {task.created_at}
                                </span>
                              </div>
                              {/* 评测指标摘要 */}
                              {task.evaluationMetrics && task.evaluationMetrics.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                                  {task.evaluationMetrics.slice(0, 3).map((metric) => (
                                    <span
                                      key={metric.id}
                                      style={{
                                        padding: "2px 8px",
                                        borderRadius: 4,
                                        fontSize: 11,
                                        background: metric.isPrimary ? "#f0fdf4" : "#f8fafc",
                                        color: metric.isPrimary ? "#16a34a" : "#64748b",
                                        border: `1px solid ${metric.isPrimary ? "#bbf7d0" : "#e2e8f0"}`,
                                        maxWidth: 180,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                      title={`${metric.name}：阈值≥${metric.threshold}，${metric.description}`}
                                    >
                                      {metric.isPrimary && "⭐ "}{metric.name}
                                    </span>
                                  ))}
                                  {task.evaluationMetrics.length > 3 && (
                                    <span style={{ fontSize: 11, color: "#94a3b8", alignSelf: "center" }}>
                                      +{task.evaluationMetrics.length - 3} 项指标
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={(e) => handleEditTask(task, e)}
                                style={{
                                  padding: "6px 12px",
                                  fontSize: 12,
                                  color: "#64748b",
                                  background: "#f8fafc",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: 6,
                                  cursor: "pointer",
                                }}
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                onClick={(e) => handleDeleteTask(task.id, e)}
                                style={{
                                  padding: "6px 12px",
                                  fontSize: 12,
                                  color: "#ef4444",
                                  background: "#fef2f2",
                                  border: "1px solid #fee2e2",
                                  borderRadius: 6,
                                  cursor: "pointer",
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "40px 20px",
                          color: "#94a3b8",
                        }}
                      >
                        <Target size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
                        <p style={{ fontSize: 14 }}>暂无任务</p>
                        <button
                          onClick={handleCreateTask}
                          style={{
                            marginTop: 12,
                            padding: "8px 16px",
                            background: "#4f46e5",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            fontSize: 13,
                            cursor: "pointer",
                          }}
                        >
                          创建第一个任务
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 数据列表 Tab */}
                {activeSceneTab === "datasets" && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 16,
                      }}
                    >
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                        关联数据集
                      </h3>
                      <button
                        onClick={() => router.push("/data-asset/dataset")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "7px 14px",
                          fontSize: 13,
                          color: "#4f46e5",
                          background: "#eef2ff",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                      >
                        <ArrowRight size={14} />
                        查看全部
                      </button>
                    </div>
                    {/* 静态数据列表 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[
                        {
                          id: "ds-1",
                          name: "交通事故检测数据集",
                          type: "图像-目标检测",
                          itemCount: 2856,
                          annotatedCount: 2400,
                          status: "进行中",
                          statusColor: "#f59e0b",
                        },
                        {
                          id: "ds-2",
                          name: "交通拥堵识别数据集",
                          type: "图像-分类",
                          itemCount: 1520,
                          annotatedCount: 1520,
                          status: "已完成",
                          statusColor: "#22c55e",
                        },
                        {
                          id: "ds-3",
                          name: "违章行为检测数据集",
                          type: "视频-目标跟踪",
                          itemCount: 856,
                          annotatedCount: 320,
                          status: "进行中",
                          statusColor: "#f59e0b",
                        },
                      ].map((ds) => (
                        <div
                          key={ds.id}
                          onClick={() => router.push(`/data-asset/dataset/detail/${ds.id}`)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            padding: 16,
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                            (e.currentTarget as HTMLElement).style.borderColor = "#bfdbfe";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.boxShadow = "none";
                            (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
                          }}
                        >
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 10,
                              background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Database size={20} style={{ color: "#16a34a" }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                                {ds.name}
                              </span>
                              <span
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: 4,
                                  fontSize: 11,
                                  background: "#f0fdf4",
                                  color: ds.statusColor,
                                }}
                              >
                                {ds.status}
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 12, color: "#64748b" }}>
                              <span>{ds.type}</span>
                              <span>样本数：{ds.itemCount}</span>
                              <span>已标注：{ds.annotatedCount}</span>
                            </div>
                          </div>
                          <ArrowRight size={16} style={{ color: "#94a3b8" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#94a3b8",
              }}
            >
              <Layers size={64} style={{ marginBottom: 16, opacity: 0.3 }} />
              <p style={{ fontSize: 16 }}>请从左侧选择一个场景</p>
              <p style={{ fontSize: 13, marginTop: 8 }}>
                或创建一个新的业务场景开始
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 场景模态框 */}
      {showSceneModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setShowSceneModal(false)}
        >
          <div
            style={{
              width: 500,
              background: "#fff",
              borderRadius: 12,
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                {editingScene ? "编辑场景" : "新建场景"}
              </h3>
              <button
                onClick={() => setShowSceneModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X size={20} style={{ color: "#64748b" }} />
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{ display: "block", fontSize: 13, color: "#475569", marginBottom: 6 }}
              >
                场景名称 *
              </label>
              <input
                type="text"
                value={sceneForm.name}
                onChange={(e) => setSceneForm({ ...sceneForm, name: e.target.value })}
                placeholder="例如：交通事件识别"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{ display: "block", fontSize: 13, color: "#475569", marginBottom: 6 }}
              >
                场景类型 *
              </label>
              <select
                value={sceneForm.type}
                onChange={(e) => setSceneForm({ ...sceneForm, type: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  fontSize: 14,
                  outline: "none",
                }}
              >
                <option value="">请选择类型</option>
                {SCENE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{ display: "block", fontSize: 13, color: "#475569", marginBottom: 6 }}
              >
                场景描述
              </label>
              <textarea
                value={sceneForm.description}
                onChange={(e) => setSceneForm({ ...sceneForm, description: e.target.value })}
                placeholder="描述该业务场景的具体应用..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  fontSize: 14,
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                onClick={() => setShowSceneModal(false)}
                style={{
                  padding: "10px 20px",
                  fontSize: 14,
                  color: "#64748b",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                取消
              </button>
              <button
                onClick={handleSaveScene}
                style={{
                  padding: "10px 20px",
                  fontSize: 14,
                  color: "#fff",
                  background: "#4f46e5",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 任务模态框 */}
      {showTaskModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setShowTaskModal(false)}
        >
          <div
            style={{
              width: 500,
              background: "#fff",
              borderRadius: 12,
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                {editingTask ? "编辑任务" : "新建任务"}
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X size={20} style={{ color: "#64748b" }} />
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{ display: "block", fontSize: 13, color: "#475569", marginBottom: 6 }}
              >
                任务名称 *
              </label>
              <input
                type="text"
                value={taskForm.name}
                onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                placeholder="例如：交通事故检测"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{ display: "block", fontSize: 13, color: "#475569", marginBottom: 6 }}
              >
                任务类型 *
              </label>
              <select
                value={taskForm.task_type}
                onChange={(e) => setTaskForm({ ...taskForm, task_type: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  fontSize: 14,
                  outline: "none",
                }}
              >
                <option value="">请选择类型</option>
                {TASK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{ display: "block", fontSize: 13, color: "#475569", marginBottom: 6 }}
              >
                数据模态 *
              </label>
              <select
                value={taskForm.modality}
                onChange={(e) => setTaskForm({ ...taskForm, modality: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  fontSize: 14,
                  outline: "none",
                }}
              >
                <option value="">请选择模态</option>
                {MODALITIES.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod}
                  </option>
                ))}
              </select>
            </div>

            {/* 样本单元 */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{ display: "block", fontSize: 13, color: "#475569", marginBottom: 6 }}
              >
                样本单元定义
              </label>
              <select
                value={taskForm.sampleUnit}
                onChange={(e) => setTaskForm({ ...taskForm, sampleUnit: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  fontSize: 14,
                  outline: "none",
                  color: taskForm.sampleUnit ? "#1e293b" : "#94a3b8",
                }}
              >
                <option value="">请先选择任务类型</option>
                {(SAMPLE_UNITS[taskForm.task_type] || []).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              {taskForm.task_type && !taskForm.sampleUnit && (
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0" }}>
                  选择该任务类型的样本单元定义
                </p>
              )}
            </div>

            {/* 评测指标配置 */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ display: "block", fontSize: 13, color: "#475569" }}>
                  评测指标定义
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {taskForm.task_type && EVAL_PRESETS[taskForm.task_type] && (
                    <button
                      type="button"
                      onClick={() => {
                        const presets = EVAL_PRESETS[taskForm.task_type]!.map((p) => ({
                          id: `ev-${Date.now()}-${Math.random()}`,
                          ...p,
                        }));
                        setTaskForm((prev) => ({
                          ...prev,
                          evaluationMetrics: [...prev.evaluationMetrics, ...presets],
                        }));
                      }}
                      style={{
                        padding: "3px 10px",
                        fontSize: 11,
                        color: "#059669",
                        background: "#ecfdf5",
                        border: "1px solid #a7f3d0",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      + 填充推荐指标
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setTaskForm((prev) => ({
                        ...prev,
                        evaluationMetrics: [
                          ...prev.evaluationMetrics,
                          { id: `ev-${Date.now()}`, name: "", key: "", isPrimary: false, threshold: 0.8 },
                        ],
                      }));
                    }}
                    style={{
                      padding: "3px 10px",
                      fontSize: 11,
                      color: "#059669",
                      background: "#fff",
                      border: "1px solid #a7f3d0",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    + 添加指标
                  </button>
                </div>
              </div>

              {taskForm.evaluationMetrics.length > 0 ? (
                <div
                  style={{
                    border: "1px solid #a7f3d0",
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 80px 100px 50px",
                      gap: 0,
                      padding: "8px 12px",
                      background: "#ecfdf5",
                      fontSize: 12,
                      color: "#059669",
                      fontWeight: 500,
                      borderBottom: "1px solid #a7f3d0",
                    }}
                  >
                    <span>指标名称</span>
                    <span>标识符</span>
                    <span style={{ textAlign: "center" }}>主指标</span>
                    <span style={{ textAlign: "center" }}>合格阈值</span>
                    <span style={{ textAlign: "center" }}>操作</span>
                  </div>
                  {taskForm.evaluationMetrics.map((m, idx) => (
                    <div
                      key={m.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 80px 100px 50px",
                        gap: 0,
                        padding: "6px 12px",
                        alignItems: "center",
                        borderBottom: idx < taskForm.evaluationMetrics.length - 1 ? "1px solid #f1f5f9" : "none",
                        background: "#fff",
                      }}
                    >
                      <input
                        value={m.name}
                        onChange={(e) => {
                          const updated = [...taskForm.evaluationMetrics];
                          updated[idx].name = e.target.value;
                          setTaskForm((prev) => ({ ...prev, evaluationMetrics: updated }));
                        }}
                        placeholder="指标名称（如：mAP@0.5）"
                        style={{
                          padding: "4px 8px",
                          border: "1px solid #e2e8f0",
                          borderRadius: 4,
                          fontSize: 13,
                          outline: "none",
                        }}
                      />
                      <input
                        value={m.key}
                        onChange={(e) => {
                          const updated = [...taskForm.evaluationMetrics];
                          updated[idx].key = e.target.value;
                          setTaskForm((prev) => ({ ...prev, evaluationMetrics: updated }));
                        }}
                        placeholder="key"
                        style={{
                          padding: "4px 8px",
                          border: "1px solid #e2e8f0",
                          borderRadius: 4,
                          fontSize: 13,
                          outline: "none",
                          marginLeft: 8,
                          fontFamily: "monospace",
                          color: "#64748b",
                        }}
                      />
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <input
                          type="radio"
                          name={`primary-${idx}`}
                          checked={m.isPrimary}
                          onChange={() => {
                            const updated = taskForm.evaluationMetrics.map((mm, ii) => ({
                              ...mm,
                              isPrimary: ii === idx,
                            }));
                            setTaskForm((prev) => ({ ...prev, evaluationMetrics: updated }));
                          }}
                          title="设为主指标"
                          style={{ width: 16, height: 16, cursor: "pointer" }}
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, paddingLeft: 8 }}>
                        <input
                          type="number"
                          value={m.threshold}
                          onChange={(e) => {
                            const updated = [...taskForm.evaluationMetrics];
                            updated[idx].threshold = parseFloat(e.target.value) || 0;
                            setTaskForm((prev) => ({ ...prev, evaluationMetrics: updated }));
                          }}
                          step="0.01"
                          min="0"
                          style={{
                            width: 60,
                            padding: "4px 8px",
                            border: "1px solid #e2e8f0",
                            borderRadius: 4,
                            fontSize: 13,
                            outline: "none",
                            textAlign: "center",
                          }}
                        />
                      </div>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <button
                          onClick={() => {
                            const updated = taskForm.evaluationMetrics.filter((_, i) => i !== idx);
                            setTaskForm((prev) => ({ ...prev, evaluationMetrics: updated }));
                          }}
                          style={{
                            padding: "2px 6px",
                            fontSize: 11,
                            color: "#ef4444",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: "#cbd5e1", textAlign: "center", padding: "12px 0" }}>
                  点击「填充推荐指标」或「添加指标」配置评测指标
                </p>
              )}
              {taskForm.evaluationMetrics.length > 0 && (
                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
                  绿色标注为主指标（每个任务必须有且仅有一个主指标），阈值表示模型合格线
                </p>
              )}
            </div>

            {/* ===== 模型需求定义 ===== */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ display: "block", fontSize: 13, color: "#475569" }}>
                  模型需求定义
                  <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}>
                    定义模型输入/输出规格与部署要求
                  </span>
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {taskForm.task_type && MODEL_REQUIREMENT_PRESETS[taskForm.task_type] && (
                    <button
                      type="button"
                      onClick={() => {
                        const presets = MODEL_REQUIREMENT_PRESETS[taskForm.task_type]!;
                        setTaskForm((prev) => ({
                          ...prev,
                          modelRequirements: [...prev.modelRequirements, ...presets],
                        }));
                      }}
                      style={{
                        padding: "3px 10px",
                        fontSize: 11,
                        color: "#0891b2",
                        background: "#f0f9ff",
                        border: "1px solid #bae6fd",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      + 填充推荐需求
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setTaskForm((prev) => ({
                        ...prev,
                        modelRequirements: [
                          ...prev.modelRequirements,
                          { id: `mr-${Date.now()}`, category: "输入规格", name: "", value: "", required: true },
                        ],
                      }));
                    }}
                    style={{
                      padding: "3px 10px",
                      fontSize: 11,
                      color: "#0891b2",
                      background: "#fff",
                      border: "1px solid #bae6fd",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    + 添加需求项
                  </button>
                </div>
              </div>

              {taskForm.modelRequirements.length > 0 ? (
                <div
                  style={{
                    border: "1px solid #bae6fd",
                    borderRadius: 6,
                    overflow: "hidden",
                    maxHeight: 320,
                    overflowY: "auto",
                  }}
                >
                  {/* 表头 */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "100px 1fr 2fr 60px",
                      gap: 0,
                      padding: "8px 12px",
                      background: "#f0f9ff",
                      fontSize: 12,
                      color: "#0891b2",
                      fontWeight: 500,
                      borderBottom: "1px solid #bae6fd",
                      position: "sticky",
                      top: 0,
                    }}
                  >
                    <span>需求分类</span>
                    <span>需求名称</span>
                    <span>需求描述</span>
                    <span style={{ textAlign: "center" }}>操作</span>
                  </div>
                  {taskForm.modelRequirements.map((req, idx) => (
                    <div
                      key={req.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "100px 1fr 2fr 60px",
                        gap: 4,
                        padding: "6px 12px",
                        alignItems: "center",
                        borderBottom: idx < taskForm.modelRequirements.length - 1 ? "1px solid #f1f5f9" : "none",
                        background: "#fff",
                      }}
                    >
                      <select
                        value={req.category}
                        onChange={(e) => {
                          const updated = [...taskForm.modelRequirements];
                          updated[idx].category = e.target.value;
                          setTaskForm((prev) => ({ ...prev, modelRequirements: updated }));
                        }}
                        style={{
                          padding: "4px 6px",
                          border: "1px solid #e2e8f0",
                          borderRadius: 4,
                          fontSize: 12,
                          outline: "none",
                          color: "#475569",
                        }}
                      >
                        {MODEL_REQ_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <input
                        value={req.name}
                        onChange={(e) => {
                          const updated = [...taskForm.modelRequirements];
                          updated[idx].name = e.target.value;
                          setTaskForm((prev) => ({ ...prev, modelRequirements: updated }));
                        }}
                        placeholder="如：输入数据"
                        style={{
                          padding: "4px 8px",
                          border: "1px solid #e2e8f0",
                          borderRadius: 4,
                          fontSize: 12,
                          outline: "none",
                        }}
                      />
                      <input
                        value={req.value}
                        onChange={(e) => {
                          const updated = [...taskForm.modelRequirements];
                          updated[idx].value = e.target.value;
                          setTaskForm((prev) => ({ ...prev, modelRequirements: updated }));
                        }}
                        placeholder="详细描述..."
                        style={{
                          padding: "4px 8px",
                          border: "1px solid #e2e8f0",
                          borderRadius: 4,
                          fontSize: 12,
                          outline: "none",
                          width: "100%",
                        }}
                      />
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}>
                        <input
                          type="checkbox"
                          checked={req.required}
                          onChange={(e) => {
                            const updated = [...taskForm.modelRequirements];
                            updated[idx].required = e.target.checked;
                            setTaskForm((prev) => ({ ...prev, modelRequirements: updated }));
                          }}
                          title="必选"
                          style={{ width: 14, height: 14, cursor: "pointer" }}
                        />
                        <button
                          onClick={() => {
                            const updated = taskForm.modelRequirements.filter((_, i) => i !== idx);
                            setTaskForm((prev) => ({ ...prev, modelRequirements: updated }));
                          }}
                          style={{
                            padding: "2px 4px",
                            fontSize: 11,
                            color: "#ef4444",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: "#cbd5e1", textAlign: "center", padding: "12px 0" }}>
                  点击「填充推荐需求」或「添加需求项」配置模型需求
                </p>
              )}
            </div>

            {/* 数据要素清单 */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ display: "block", fontSize: 13, color: "#475569" }}>
                  数据要素清单
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {taskForm.task_type && COMMON_DATA_FIELDS[taskForm.task_type] && (
                    <button
                      type="button"
                      onClick={() => {
                        const defaults = COMMON_DATA_FIELDS[taskForm.task_type]!.map((f) => ({
                          id: `dr-${Date.now()}-${Math.random()}`,
                          ...f,
                        }));
                        setTaskForm((prev) => ({
                          ...prev,
                          dataRequirements: [...prev.dataRequirements, ...defaults],
                        }));
                      }}
                      style={{
                        padding: "3px 10px",
                        fontSize: 11,
                        color: "#4f46e5",
                        background: "#f5f3ff",
                        border: "1px solid #d4d8f0",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      + 填充默认要素
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setTaskForm((prev) => ({
                        ...prev,
                        dataRequirements: [
                          ...prev.dataRequirements,
                          { id: `dr-${Date.now()}`, field: "", type: "string", required: true },
                        ],
                      }));
                    }}
                    style={{
                      padding: "3px 10px",
                      fontSize: 11,
                      color: "#4f46e5",
                      background: "#fff",
                      border: "1px solid #d4d8f0",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    + 添加字段
                  </button>
                </div>
              </div>

              {taskForm.dataRequirements.length > 0 ? (
                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 80px 60px",
                      gap: 0,
                      padding: "8px 12px",
                      background: "#f8fafc",
                      fontSize: 12,
                      color: "#64748b",
                      fontWeight: 500,
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <span>字段名称</span>
                    <span>类型</span>
                    <span style={{ textAlign: "center" }}>必填</span>
                    <span style={{ textAlign: "center" }}>操作</span>
                  </div>
                  {taskForm.dataRequirements.map((req, idx) => (
                    <div
                      key={req.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 80px 60px",
                        gap: 0,
                        padding: "6px 12px",
                        alignItems: "center",
                        borderBottom: idx < taskForm.dataRequirements.length - 1 ? "1px solid #f1f5f9" : "none",
                        background: "#fff",
                      }}
                    >
                      <input
                        value={req.field}
                        onChange={(e) => {
                          const updated = [...taskForm.dataRequirements];
                          updated[idx].field = e.target.value;
                          setTaskForm((prev) => ({ ...prev, dataRequirements: updated }));
                        }}
                        placeholder="字段名称"
                        style={{
                          padding: "4px 8px",
                          border: "1px solid #e2e8f0",
                          borderRadius: 4,
                          fontSize: 13,
                          outline: "none",
                        }}
                      />
                      <select
                        value={req.type}
                        onChange={(e) => {
                          const updated = [...taskForm.dataRequirements];
                          updated[idx].type = e.target.value;
                          setTaskForm((prev) => ({ ...prev, dataRequirements: updated }));
                        }}
                        style={{
                          padding: "4px 8px",
                          border: "1px solid #e2e8f0",
                          borderRadius: 4,
                          fontSize: 13,
                          outline: "none",
                          marginLeft: 8,
                        }}
                      >
                        {DATA_FIELD_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <input
                          type="checkbox"
                          checked={req.required}
                          onChange={(e) => {
                            const updated = [...taskForm.dataRequirements];
                            updated[idx].required = e.target.checked;
                            setTaskForm((prev) => ({ ...prev, dataRequirements: updated }));
                          }}
                          style={{ width: 16, height: 16, cursor: "pointer" }}
                        />
                      </div>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <button
                          onClick={() => {
                            const updated = taskForm.dataRequirements.filter((_, i) => i !== idx);
                            setTaskForm((prev) => ({ ...prev, dataRequirements: updated }));
                          }}
                          style={{
                            padding: "2px 6px",
                            fontSize: 11,
                            color: "#ef4444",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: "#cbd5e1", textAlign: "center", padding: "12px 0" }}>
                  点击「添加字段」或「填充默认要素」配置数据要素
                </p>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                onClick={() => setShowTaskModal(false)}
                style={{
                  padding: "10px 20px",
                  fontSize: 14,
                  color: "#64748b",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                取消
              </button>
              <button
                onClick={handleSaveTask}
                style={{
                  padding: "10px 20px",
                  fontSize: 14,
                  color: "#fff",
                  background: "#4f46e5",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 导出带 Suspense 的页面组件 =====
export default function TaskModelingPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: "#f8fafc",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 40,
                height: 40,
                border: "3px solid #e2e8f0",
                borderTopColor: "#4f46e5",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p style={{ color: "#64748b" }}>加载中...</p>
          </div>
        </div>
      }
    >
      <TaskModelingContent />
    </Suspense>
  );
}
