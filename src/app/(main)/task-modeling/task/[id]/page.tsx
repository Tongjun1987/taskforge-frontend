"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Target,
  Database,
  FileText,
  Settings,
  CircleCheckBig,
  TriangleAlert,
  Clock,
  Edit3,
  Plus,
  X,
  ChevronRight,
  Cpu,
  Layers,
  ChartBar,
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
  // 数据规格
  dataVolume: string;      // 目标数据量
  dataType: string;        // 数据类型
  language: string;         // 语言
  domain: string;           // 领域范围
}

// ===== 质量标准 =====
interface QualityStandard {
  id: string;
  accuracyThreshold: number;      // 准确率阈值
  consistencyRequirement: string; // 一致性要求
  qualificationRate: string;      // 合格率底线
}

// ===== 标注规范 =====
interface AnnotationSpec {
  id: string;
  guidelines: string;       // 标注指南
  edgeCaseRules: string;    // 边界案例处理规则
  exampleSet: string;       // 示例集
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
  description?: string;     // 中文语义描述
}

interface ModelRequirement {
  id: string;
  category: string;
  name: string;
  value: string;
  required: boolean;
}

// ===== Mock 数据（从主页面复制）=====
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
      // 数据规格
      dataSpec: {
        id: "ds-1",
        dataVolume: "≥50,000张图像（白天30,000+夜晚20,000）",
        dataType: "图像（JPG/PNG，分辨率1920×1080或1280×720）",
        language: "中文路标/英文路标",
        domain: "城市道路、高速公路、交叉路口等交通场景",
      },
      // 质量标准
      qualityStandard: {
        id: "qs-1",
        accuracyThreshold: 0.75,
        consistencyRequirement: "同一目标多次标注结果一致率≥95%，多人标注Kappa系数≥0.8",
        qualificationRate: "合格率底线≥90%，即标注合格样本占总样本的比例",
      },
      // 标注规范
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
        guidelines: "1. 视频帧间隔不超过30帧需连续标注\n2. 目标ID一旦分配不可更改（除非目标消失后重新出现）\n3. 遮挡目标需根据上下文推断位置\n4. 目标离开画面标记为“消失”，返回标记为“新目标”",
        edgeCaseRules: "1. 目标被完全遮挡超过5秒：标记为“遮挡”，恢复后继续同一ID\n2. 两个同类目标交叉：使用外观特征区分\n3. 目标分裂/合并：按分裂/合并前后的中心点分配ID\n4. 低帧率视频：每5帧标注一次，中间帧线性插值",
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
        { id: "mr-12", category: "模型输出", name: "目标唯一ID", value: "跨帧保持不变，用于区分不同目标", required: true },
        { id: "mr-13", category: "模型输出", name: "逐帧轨迹", value: "每帧对应的 bbox，形成连续运动轨迹", required: true },
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
        { id: "mr-21", category: "模型输出", name: "行为类别标签", value: "逆行、违停、横穿马路等交通行为", required: true },
        { id: "mr-22", category: "模型输出", name: "时间区间", value: "行为发生的起止秒数/起止帧", required: true },
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
        edgeCaseRules: "1. 多事件同时发生：按严重程度排序，主要事件优先\n2. 事件早期预警：标注为“可疑行为”而非事件\n3. 事件演化：需标注从发生到结束的全过程\n4. 轻微事故（无损失）：标注为“异常事件”而非“事故”",
        exampleSet: "正例：追尾事故：车辆A正常行驶→前车急刹→碰撞→事故发生\n反例：未标注涉事目标列表，或事件等级与实际不符",
      },
      evaluationMetrics: [
        { id: "ev-10", name: "F1 Score", key: "f1", threshold: 0.80, isPrimary: true, description: "交通事件识别的综合性能指标，平衡精确率和召回率" },
        { id: "ev-11", name: "Recall", key: "recall", threshold: 0.80, isPrimary: false, description: "实际发生的交通事件被正确识别的比例" },
        { id: "ev-12", name: "Precision", key: "precision", threshold: 0.80, isPrimary: false, description: "识别出的事件中实际正确的比例" },
      ],
      modelRequirements: [
        { id: "mr-27", category: "模型输入", name: "输入数据", value: "完整交通事件视频片段（5~30秒，包含事件完整过程）", required: true },
        { id: "mr-31", category: "模型输出", name: "事件类别标签", value: "交通事故、拥堵、违停、抛洒物等", required: true },
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
        edgeCaseRules: "1. 渐变型异常（如缓慢拥堵）：标注起始点和达到阈值点\n2. 突发型异常（如事故）：标注事件发生时刻\n3. 周期性拥堵（如早晚高峰）：标注为“常态异常”\n4. 多个异常叠加：分别标注并标注优先级",
        exampleSet: "正例：事故→拥堵形成→拥堵持续→事故清除→拥堵消散\n反例：缺少异常点精确定位，或趋势判定缺乏依据",
      },
      evaluationMetrics: [
        { id: "ev-13", name: "F1 Score", key: "f1", threshold: 0.75, isPrimary: true, description: "时序异常检测的综合性能指标" },
        { id: "ev-14", name: "MAE（异常点定位）", key: "MAE", threshold: 0.20, isPrimary: false, description: "异常点预测时间与实际时间的平均绝对误差" },
      ],
      modelRequirements: [
        { id: "mr-38", category: "模型输入", name: "输入数据", value: "长时连续交通监控视频序列（几十秒~几分钟级）", required: true },
        { id: "mr-42", category: "模型输出", name: "时序变化趋势", value: "拥堵扩散/缓解/平稳等", required: true },
        { id: "mr-43", category: "模型输出", name: "异常变化点", value: "精准定位异常发生的时刻（如突发停车）", required: true },
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
      dataSpec: {
        id: "ds-6",
        dataVolume: "≥10,000张杆塔图像",
        dataType: "无人机巡检图像（JPG，4K分辨率）",
        language: "中文设备编号",
        domain: "高压输电线路杆塔",
      },
      qualityStandard: {
        id: "qs-6",
        accuracyThreshold: 0.90,
        consistencyRequirement: "杆塔定位误差≤10像素",
        qualificationRate: "合格图像占比≥95%",
      },
      annotationSpec: {
        id: "as-6",
        guidelines: "1. 标注框需完整包含杆塔主体\n2. 标注杆塔类型和编号\n3. 标注拍摄角度",
        edgeCaseRules: "1. 部分遮挡杆塔：标注可见部分\n2. 多杆塔重叠：分别标注",
        exampleSet: "正例：完整杆塔清晰可见，标注框紧贴杆塔边缘",
      },
      evaluationMetrics: [
        { id: "ev-15", name: "mAP@IoU=0.5", key: "mAP@0.5", threshold: 0.90, isPrimary: true },
      ],
      modelRequirements: [],
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
      dataSpec: {
        id: "ds-7",
        dataVolume: "≥5,000张绝缘子图像（正常/缺陷比例1:1）",
        dataType: "红外热成像图+可见光图像",
        language: "中文缺陷描述",
        domain: "高压绝缘子",
      },
      qualityStandard: {
        id: "qs-7",
        accuracyThreshold: 0.88,
        consistencyRequirement: "缺陷等级判定一致率≥90%",
        qualificationRate: "缺陷识别准确率≥88%",
      },
      annotationSpec: {
        id: "as-7",
        guidelines: "1. 正常/缺陷二分类\n2. 缺陷等级：轻微/中等/严重",
        edgeCaseRules: "1. 模糊图像降低置信度\n2. 多种缺陷共存按最严重标注",
        exampleSet: "正例：绝缘子表面有明显裂纹，标注为“中等缺陷”",
      },
      evaluationMetrics: [
        { id: "ev-16", name: "Accuracy", key: "accuracy", threshold: 0.88, isPrimary: true },
      ],
      modelRequirements: [],
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
      dataSpec: {
        id: "ds-8",
        dataVolume: "≥100,000条温度时序数据",
        dataType: "传感器数据（CSV格式，含时间戳、温度值、位置）",
        language: "中文设备编号",
        domain: "变电站一次设备",
      },
      qualityStandard: {
        id: "qs-8",
        accuracyThreshold: 0.85,
        consistencyRequirement: "温度预测误差≤2℃",
        qualificationRate: "异常预警准确率≥90%",
      },
      annotationSpec: {
        id: "as-8",
        guidelines: "1. 正常温度范围标注\n2. 异常温度阈值标注\n3. 温度趋势标注",
        edgeCaseRules: "1. 传感器故障数据过滤\n2. 环境温度补偿",
        exampleSet: "正例：设备A在负载80%时温度65℃，标注为正常",
      },
      evaluationMetrics: [
        { id: "ev-17", name: "MAE", key: "MAE", threshold: 2, isPrimary: true },
        { id: "ev-18", name: "R²", key: "R2", threshold: 0.85, isPrimary: false },
      ],
      modelRequirements: [],
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
      dataSpec: {
        id: "ds-9",
        dataVolume: "≥20,000张发票图像",
        dataType: "发票扫描图像（JPG/PDF，300dpi以上）",
        language: "中文+数字+英文",
        domain: "增值税发票、机票行程单、电子发票",
      },
      qualityStandard: {
        id: "qs-9",
        accuracyThreshold: 0.95,
        consistencyRequirement: "字符识别准确率≥95%",
        qualificationRate: "关键字段准确率≥98%",
      },
      annotationSpec: {
        id: "as-9",
        guidelines: "1. 按字符框标注\n2. 标注字符类别\n3. 关键字段（金额、税额）需特别标注",
        edgeCaseRules: "1. 模糊字符降低置信度\n2. 印章遮挡部分跳过",
        exampleSet: "正例：发票号码123456789，逐一字符框标注",
      },
      evaluationMetrics: [
        { id: "ev-19", name: "Accuracy", key: "accuracy", threshold: 0.95, isPrimary: true },
        { id: "ev-20", name: "CER", key: "CER", threshold: 5, isPrimary: false },
      ],
      modelRequirements: [],
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
      dataSpec: {
        id: "ds-10",
        dataVolume: "≥10,000张证件图像",
        dataType: "证件照片（身份证、驾驶证、营业执照等）",
        language: "中文+拼音+数字",
        domain: "身份证、驾驶证、营业执照、护照",
      },
      qualityStandard: {
        id: "qs-10",
        accuracyThreshold: 0.98,
        consistencyRequirement: "字段提取准确率≥98%",
        qualificationRate: "完整证件信息提取率≥95%",
      },
      annotationSpec: {
        id: "as-10",
        guidelines: "1. 字段级标注\n2. 标注字段类型\n3. 标注有效期等关键信息",
        edgeCaseRules: "1. 反光/阴影：降低置信度\n2. 缺角证件：标注不完整",
        exampleSet: "正例：姓名：张三，字段标注为“name”，内容为“张三”",
      },
      evaluationMetrics: [
        { id: "ev-21", name: "Accuracy", key: "accuracy", threshold: 0.98, isPrimary: true },
      ],
      modelRequirements: [],
    },
  ],
};

// ===== 任务详情页组件 =====
function TaskDetailContent() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "data" | "metrics" | "model">("overview");

  useEffect(() => {
    // 查找任务
    for (const sceneId of Object.keys(MOCK_TASKS)) {
      const found = MOCK_TASKS[sceneId].find((t) => t.id === taskId);
      if (found) {
        setTask(found);
        const sceneData = MOCK_SCENES.find((s) => s.id === found.scene_id);
        setScene(sceneData || null);
        break;
      }
    }
  }, [taskId]);

  // 质量状态样式
  const getQualityStyle = (status: string) => {
    const styles: Record<string, { bg: string; color: string; text: string }> = {
      pass: { bg: "#dcfce7", color: "#16a34a", text: "通过" },
      warning: { bg: "#fef3c7", color: "#d97706", text: "告警" },
      pending: { bg: "#f3f4f6", color: "#6b7280", text: "待检" },
      fail: { bg: "#fee2e2", color: "#dc2626", text: "失败" },
    };
    return styles[status] || styles.pending;
  };

  if (!task) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#f8fafc",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <Target size={48} style={{ color: "#cbd5e1", marginBottom: 16 }} />
          <p style={{ fontSize: 16, color: "#64748b", marginBottom: 16 }}>任务不存在或已被删除</p>
          <button
            onClick={() => router.push("/task-modeling")}
            style={{
              padding: "10px 20px",
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            返回任务建模
          </button>
        </div>
      </div>
    );
  }

  const qualityStyle = getQualityStyle(task.quality_status);

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
            {task.name}
          </h1>
          <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
            {scene?.name} / {task.task_type}
          </p>
        </div>
        <button
          onClick={() => router.push(`/task-modeling/task/edit/${task.id}`)}
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
          <Edit3 size={16} />
          编辑任务
        </button>
      </div>

      {/* 主内容区 */}
      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        {/* 概览卡片 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
            {/* 左侧图标 */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                background: "linear-gradient(135deg, #dbeafe, #e0e7ff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Target size={28} style={{ color: "#4f46e5" }} />
            </div>

            {/* 右侧信息 */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                  {task.name}
                </h2>
                <span
                  style={{
                    padding: "2px 10px",
                    borderRadius: 10,
                    fontSize: 12,
                    background: qualityStyle.bg,
                    color: qualityStyle.color,
                  }}
                >
                  {qualityStyle.text}
                </span>
              </div>

              {/* 属性标签 */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: 6,
                    fontSize: 13,
                    background: "#f5f3ff",
                    color: "#4f46e5",
                  }}
                >
                  {task.task_type}
                </span>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: 6,
                    fontSize: 13,
                    background: "#f0fdf4",
                    color: "#16a34a",
                  }}
                >
                  {task.modality}
                </span>
                {task.sampleUnit && (
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: 6,
                      fontSize: 13,
                      background: "#fef3c7",
                      color: "#d97706",
                    }}
                  >
                    {task.sampleUnit}
                  </span>
                )}
              </div>

              {/* 统计信息 */}
              <div style={{ display: "flex", gap: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Database size={14} style={{ color: "#94a3b8" }} />
                  <span style={{ fontSize: 13, color: "#64748b" }}>
                    <strong style={{ color: "#1e293b" }}>{task.dataset_count}</strong> 个数据集
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={14} style={{ color: "#94a3b8" }} />
                  <span style={{ fontSize: 13, color: "#64748b" }}>
                    创建于 {task.created_at}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 导航 */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 16,
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          {[
            { key: "overview", label: "任务概览", icon: Target },
            { key: "data", label: "数据需求", icon: Database },
            { key: "metrics", label: "评测指标", icon: ChartBar },
            { key: "model", label: "模型需求", icon: Cpu },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 16px",
                fontSize: 14,
                fontWeight: activeTab === tab.key ? 600 : 400,
                color: activeTab === tab.key ? "#4f46e5" : "#64748b",
                background: "none",
                border: "none",
                borderBottom: activeTab === tab.key ? "2px solid #4f46e5" : "2px solid transparent",
                cursor: "pointer",
                marginBottom: -1,
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 内容 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            border: "1px solid #e2e8f0",
          }}
        >
          {activeTab === "overview" && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>
                任务概览
              </h3>
              
              {/* 基本信息 */}
              <div
                style={{
                  padding: 16,
                  background: "#f8fafc",
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 12 }}>
                  基本信息
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>任务ID</div>
                    <div style={{ fontSize: 13, color: "#1e293b" }}>{task.id}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>所属场景</div>
                    <div style={{ fontSize: 13, color: "#1e293b" }}>{scene?.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>任务类型</div>
                    <div style={{ fontSize: 13, color: "#1e293b" }}>{task.task_type}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>数据类型</div>
                    <div style={{ fontSize: 13, color: "#1e293b" }}>{task.modality}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>创建时间</div>
                    <div style={{ fontSize: 13, color: "#1e293b" }}>{task.created_at}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>数据集数量</div>
                    <div style={{ fontSize: 13, color: "#1e293b" }}>{task.dataset_count} 个</div>
                  </div>
                </div>
              </div>

              {/* 样本单元 */}
              {task.sampleUnit && (
                <div
                  style={{
                    padding: 16,
                    background: "#f8fafc",
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>
                    样本单元
                  </div>
                  <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                    {task.sampleUnit}
                  </p>
                </div>
              )}

              {/* 建模流程 */}
              <div
                style={{
                  padding: 16,
                  background: "#f8fafc",
                  borderRadius: 8,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 12 }}>
                  建模流程
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "12px 20px",
                      background: "#fff",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Database size={18} style={{ color: "#4f46e5", marginBottom: 6 }} />
                    <span style={{ fontSize: 12, color: "#1e293b" }}>数据采集</span>
                  </div>
                  <ChevronRight size={16} style={{ color: "#cbd5e1" }} />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "12px 20px",
                      background: "#fff",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <FileText size={18} style={{ color: "#7c3aed", marginBottom: 6 }} />
                    <span style={{ fontSize: 12, color: "#1e293b" }}>数据标注</span>
                  </div>
                  <ChevronRight size={16} style={{ color: "#cbd5e1" }} />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "12px 20px",
                      background: "#fff",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Settings size={18} style={{ color: "#d97706", marginBottom: 6 }} />
                    <span style={{ fontSize: 12, color: "#1e293b" }}>模型训练</span>
                  </div>
                  <ChevronRight size={16} style={{ color: "#cbd5e1" }} />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "12px 20px",
                      background: "#4f46e5",
                      borderRadius: 8,
                    }}
                  >
                    <Layers size={18} style={{ color: "#fff", marginBottom: 6 }} />
                    <span style={{ fontSize: 12, color: "#fff" }}>模型部署</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                  数据需求
                </h3>
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

                  {task.dataSpec ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                      <div style={{
                        padding: 12,
                        background: "#f8fafc",
                        borderRadius: 8,
                      }}>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>目标数据量</div>
                        <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>
                          {task.dataSpec.dataVolume}
                        </div>
                      </div>
                      <div style={{
                        padding: 12,
                        background: "#f8fafc",
                        borderRadius: 8,
                      }}>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>数据类型</div>
                        <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>
                          {task.dataSpec.dataType}
                        </div>
                      </div>
                      <div style={{
                        padding: 12,
                        background: "#f8fafc",
                        borderRadius: 8,
                      }}>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>语言</div>
                        <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>
                          {task.dataSpec.language}
                        </div>
                      </div>
                      <div style={{
                        padding: 12,
                        background: "#f8fafc",
                        borderRadius: 8,
                      }}>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>领域范围</div>
                        <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>
                          {task.dataSpec.domain}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: 20, color: "#94a3b8" }}>
                      暂无数据规格定义
                    </div>
                  )}
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

                  {task.qualityStandard ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{
                        padding: 12,
                        background: "#f8fafc",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}>
                        <div style={{ fontSize: 11, color: "#64748b", minWidth: 80 }}>准确率阈值</div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 12px",
                            background: "#4f46e5",
                            color: "#fff",
                            borderRadius: 20,
                            fontSize: 14,
                            fontWeight: 600,
                          }}>
                            ≥{(task.qualityStandard.accuracyThreshold * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                      <div style={{
                        padding: 12,
                        background: "#f8fafc",
                        borderRadius: 8,
                      }}>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>一致性要求</div>
                        <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                          {task.qualityStandard.consistencyRequirement}
                        </div>
                      </div>
                      <div style={{
                        padding: 12,
                        background: "#f8fafc",
                        borderRadius: 8,
                      }}>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>合格率底线</div>
                        <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                          {task.qualityStandard.qualificationRate}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: 20, color: "#94a3b8" }}>
                      暂无质量标准定义
                    </div>
                  )}
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

                  {task.annotationSpec ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{
                        padding: 12,
                        background: "#f8fafc",
                        borderRadius: 8,
                        borderLeft: "3px solid #4f46e5",
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 500, color: "#4f46e5", marginBottom: 6 }}>标注指南</div>
                        <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                          {task.annotationSpec.guidelines}
                        </div>
                      </div>
                      <div style={{
                        padding: 12,
                        background: "#fffbeb",
                        borderRadius: 8,
                        borderLeft: "3px solid #f59e0b",
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 500, color: "#92400e", marginBottom: 6 }}>边界案例处理规则</div>
                        <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                          {task.annotationSpec.edgeCaseRules}
                        </div>
                      </div>
                      <div style={{
                        padding: 12,
                        background: "#f0fdf4",
                        borderRadius: 8,
                        borderLeft: "3px solid #16a34a",
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 500, color: "#16a34a", marginBottom: 6 }}>示例集</div>
                        <div style={{ fontSize: 13, color: "#166534", lineHeight: 1.6 }}>
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ fontWeight: 500 }}>✅ 正例：</span>
                            {task.annotationSpec.exampleSet.split("反例：")[0].replace("正例：", "")}
                          </div>
                          {task.annotationSpec.exampleSet.includes("反例：") && (
                            <div>
                              <span style={{ fontWeight: 500, color: "#dc2626" }}>❌ 反例：</span>
                              {task.annotationSpec.exampleSet.split("反例：")[1]}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: 20, color: "#94a3b8" }}>
                      暂无标注规范定义
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "metrics" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                  评估指标
                </h3>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  共 {task.evaluationMetrics?.length || 0} 项
                </span>
              </div>

              {task.evaluationMetrics && task.evaluationMetrics.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {task.evaluationMetrics.map((metric) => (
                    <div
                      key={metric.id}
                      style={{
                        padding: 16,
                        background: metric.isPrimary ? "#f5f3ff" : "#fff",
                        borderRadius: 10,
                        border: metric.isPrimary ? "1px solid #c4b5fd" : "1px solid #e2e8f0",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>
                              {metric.name}
                            </span>
                            {metric.isPrimary && (
                              <span
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: 4,
                                  fontSize: 10,
                                  background: "#4f46e5",
                                  color: "#fff",
                                  fontWeight: 500,
                                }}
                              >
                                核心指标
                              </span>
                            )}
                          </div>
                          {metric.description && (
                            <div style={{ 
                              fontSize: 13, 
                              color: "#64748b", 
                              lineHeight: 1.6,
                              padding: "10px 12px",
                              background: "#f8fafc",
                              borderRadius: 6,
                              marginBottom: 10,
                            }}>
                              {metric.description}
                            </div>
                          )}
                          <div style={{ 
                            display: "flex",
                            alignItems: "center",
                            gap: 8
                          }}>
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>指标 Key:</span>
                            <code style={{ 
                              fontSize: 12, 
                              color: "#475569", 
                              fontFamily: "monospace",
                              padding: "2px 8px",
                              background: "#e2e8f0",
                              borderRadius: 4,
                            }}>
                              {metric.key}
                            </code>
                          </div>
                        </div>
                        <div style={{ 
                          textAlign: "center",
                          padding: "12px 20px",
                          background: metric.isPrimary ? "#4f46e5" : "#f1f5f9",
                          borderRadius: 10,
                          minWidth: 100,
                        }}>
                          <div style={{ fontSize: 10, color: metric.isPrimary ? "#c7d2fe" : "#94a3b8", marginBottom: 4 }}>
                            达标阈值
                          </div>
                          <div style={{ 
                            fontSize: 24, 
                            fontWeight: 700, 
                            color: metric.isPrimary ? "#fff" : "#4f46e5" 
                          }}>
                            {typeof metric.threshold === "number" && metric.threshold < 1
                              ? `${(metric.threshold * 100).toFixed(0)}%`
                              : metric.threshold}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                  <ChartBar size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                  <p>暂无评估指标定义</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "model" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                  模型需求
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* 模型输入 */}
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
                      模型输入
                    </h4>
                  </div>

                  {task.modelRequirements?.filter(r => r.category === "模型输入").length ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {task.modelRequirements
                        .filter((r) => r.category === "模型输入")
                        .map((req) => (
                          <div
                            key={req.id}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 12,
                              padding: 12,
                              background: "#f8fafc",
                              borderRadius: 8,
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>
                                  {req.name}
                                </span>
                                {req.required && (
                                  <span
                                    style={{
                                      padding: "2px 6px",
                                      borderRadius: 4,
                                      fontSize: 10,
                                      background: "#fee2e2",
                                      color: "#dc2626",
                                    }}
                                  >
                                    必填
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                                {req.value}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: 16, color: "#94a3b8" }}>
                      暂无模型输入定义
                    </div>
                  )}
                </div>

                {/* 模型输出 */}
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
                      <Cpu size={14} style={{ color: "#16a34a" }} />
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                      模型输出
                    </h4>
                  </div>

                  {task.modelRequirements?.filter(r => r.category === "模型输出").length ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {task.modelRequirements
                        .filter((r) => r.category === "模型输出")
                        .map((req) => (
                          <div
                            key={req.id}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 12,
                              padding: 12,
                              background: "#f8fafc",
                              borderRadius: 8,
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>
                                  {req.name}
                                </span>
                                {req.required && (
                                  <span
                                    style={{
                                      padding: "2px 6px",
                                      borderRadius: 4,
                                      fontSize: 10,
                                      background: "#fee2e2",
                                      color: "#dc2626",
                                    }}
                                  >
                                    必填
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                                {req.value}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: 16, color: "#94a3b8" }}>
                      暂无模型输出定义
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== 页面组件（带 Suspense）=====
export default function TaskDetailPage() {
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
      <TaskDetailContent />
    </Suspense>
  );
}
