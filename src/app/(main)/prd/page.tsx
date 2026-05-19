"use client";
import { useState, useEffect } from "react";
import {
  BookOpen, Upload, Layers, Tag, Cpu, Search,
  ChevronRight, ChevronDown, CheckCircle2, Target,
  Database, Settings, Users, Shield, Clock,
  FileText, Download, TrendingUp, ArrowRight,
  GitBranch, Link2, RefreshCw, Brain, Sparkles,
  BarChart3, PieChart, Activity, GitMerge, Workflow
} from "lucide-react";

// ============================================================
// PRD 模块定义 - 按用户要求结构重组
// 1. 产品概述
// 2. 产品需求
//    2.1 场景建模
//    2.2 数据生产
//    2.3 模型生产
// ============================================================

// 统一的功能卡片组件
interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  items: FeatureItem[];
}

interface FeatureItem {
  name: string;
  detail: string;
  priority?: "P0" | "P1" | "P2";
}

// ============================================================
// PRD 模块数据
// ============================================================
const PRD_MODULES = [
  // 1. 产品概述
  {
    key: "overview",
    label: "产品概述",
    icon: BookOpen,
    color: "#3b82f6",
    bgGradient: "#3b82f610",
    desc: "产品背景、核心价值、目标用户",
    sections: [
      { id: "bg", label: "产品背景" },
      { id: "value", label: "核心价值" },
      { id: "users", label: "目标用户" },
      { id: "terms", label: "术语定义" },
    ],
  },
  // 2.1 场景建模
  {
    key: "scene-modeling",
    label: "2.1 场景建模",
    icon: Target,
    color: "#8b5cf6",
    bgGradient: "#8b5cf610",
    desc: "场景管理、标签体系、任务建模",
    sections: [
      { id: "overview", label: "模块概述" },
      { id: "scene", label: "场景管理" },
      { id: "label", label: "标签体系" },
      { id: "task", label: "任务建模" },
      { id: "usecase", label: "用户故事" },
    ],
  },
  // 2.2 数据生产
  {
    key: "data-production",
    label: "2.2 数据生产",
    icon: Database,
    color: "#10b981",
    bgGradient: "#10b98110",
    desc: "数据采集、清洗、增强、标注、溯源",
    sections: [
      { id: "overview", label: "模块概述" },
      { id: "access", label: "数据接入" },
      { id: "cleaning", label: "数据清洗" },
      { id: "augment", label: "数据增强" },
      { id: "annotation", label: "数据标注" },
      { id: "trace", label: "数据溯源" },
      { id: "usecase", label: "用户故事" },
    ],
  },
  // 2.3 模型生产
  {
    key: "model-production",
    label: "2.3 模型生产",
    icon: Brain,
    color: "#f59e0b",
    bgGradient: "#f59e0b10",
    desc: "模型仓库、训练、评估、测试",
    sections: [
      { id: "overview", label: "模块概述" },
      { id: "repo", label: "模型仓库" },
      { id: "training", label: "模型训练" },
      { id: "evaluation", label: "模型评估" },
      { id: "testing", label: "模型测试" },
      { id: "usecase", label: "用户故事" },
    ],
  },
];

// ============================================================
// 详细内容数据
// ============================================================

// 产品概述内容
const OVERVIEW_CONTENT = {
  bg: {
    title: "产品背景",
    content: `随着 AI 技术进入工业化应用阶段，企业在构建自主 AI 能力时面临三大痛点：

**1. 数据生产成本极高**
高质量训练数据的采集、清洗、标注工作繁琐，缺乏系统化工具支撑，人力成本高、质量不可控。

**2. 模型生产流程割裂**
模型训练、评估、测试、部署分散在不同系统，版本管理混乱，迭代周期长。

**3. AI 应用落地困难**
知识库构建、Prompt 管理、智能体编排缺乏统一平台，团队协作和应用运营没有系统支撑。`,
  },
  value: {
    title: "核心价值主张",
    points: [
      { icon: Sparkles, label: "一站式", desc: "从数据采集到模型部署，全链路无需跨系统操作" },
      { icon: Shield, label: "可信赖", desc: "数据溯源 + 质量门禁 + 双盲仲裁保障数据和模型质量" },
      { icon: TrendingUp, label: "高效率", desc: "AI 智能预标注、自动增强、主动学习，综合降低人工标注与处理成本" },
      { icon: Activity, label: "可追溯", desc: "全链路数据血缘追踪，操作日志完整审计" },
    ],
  },
  users: {
    title: "目标用户角色",
    roles: [
      { role: "数据工程师", desc: "数据采集、清洗、增强、标注全流程操作", color: "#3b82f6" },
      { role: "AI 算法工程师", desc: "模型训练、评估、测试、性能优化", color: "#8b5cf6" },
      { role: "标注团队负责人", desc: "标注任务分配、质检管理、进度追踪", color: "#10b981" },
      { role: "项目经理", desc: "项目整体把控、进度协调、质量验收", color: "#f59e0b" },
      { role: "平台管理员", desc: "系统配置、权限管理、资源监控", color: "#ef4444" },
    ],
  },
  terms: {
    title: "术语定义",
    terms: [
      { term: "场景 (Scene)", definition: "按业务领域划分的AI应用单元，如「交通事件识别」「电力巡检」" },
      { term: "标签体系 (Label Schema)", definition: "场景下多层级分类标签定义，如「目标类别→车辆/行人/标识」" },
      { term: "任务 (Task)", definition: "从场景衍生的具体AI模型生产任务，含数据规格、质量要求、评测指标" },
      { term: "数据集 (Dataset)", definition: "特定用途数据集合，含版本管理、分支协作、权限控制" },
      { term: "质量门禁 (Quality Gate)", definition: "数据流转各环节的质量检验关卡，如清洗质量→数量达标→标注一致性" },
      { term: "SFT", definition: "Supervised Fine-Tuning，监督微调，用于生成高质量指令-响应训练样本" },
      { term: "DPO", definition: "Direct Preference Optimization，直接偏好优化，用于构建偏好对训练数据" },
      { term: "Kappa 系数", definition: "衡量标注员间一致性的统计指标，≥0.8 为优秀" },
    ],
  },
};

// 场景建模内容
const SCENE_MODELING_CONTENT = {
  overview: {
    title: "模块概述",
    desc: "任务建模中心是零数数智工厂的入口模块，为后续数据生产、模型训练提供统一的任务定义与规格标准。",
    features: [
      { name: "场景管理", detail: "按业务领域创建/管理AI应用场景，支持多维检索和统计", priority: "P0" as const },
      { name: "标签体系", detail: "多层级分类标签定义，支持颜色、描述、导入导出", priority: "P0" as const },
      { name: "任务建模", detail: "5步向导创建任务：基础信息→数据规格→质量要求→标注规范→评测指标", priority: "P0" as const },
      { name: "任务详情", detail: "完整任务信息展示 + 时间轴进度 + 关联数据集跳转", priority: "P1" as const },
    ],
  },
  scene: {
    title: "场景管理",
    features: [
      { name: "场景 CRUD", detail: "新建/编辑/删除/激活-停用场景", priority: "P0" as const },
      { name: "多维检索", detail: "按名称/领域/状态/时间范围筛选", priority: "P0" as const },
      { name: "场景卡片", detail: "展示关联任务数、数据集数量、领域标签", priority: "P0" as const },
      { name: "详情侧边栏", detail: "点击场景展开右侧详情面板", priority: "P1" as const },
      { name: "跳转关联", detail: "点击数据集数量自动跳转数据集列表筛选", priority: "P1" as const },
    ],
    data: {
      columns: ["场景名称", "领域类型", "关联任务", "关联数据集", "创建时间", "状态", "操作"],
      examples: [
        { name: "交通事件识别", domain: "智能交通", tasks: 5, datasets: 12, status: "进行中" },
        { name: "电力设备缺陷检测", domain: "电力巡检", tasks: 3, datasets: 8, status: "进行中" },
        { name: "金融文档OCR识别", domain: "金融科技", tasks: 2, datasets: 5, status: "已完成" },
      ],
    },
  },
  label: {
    title: "标签体系",
    features: [
      { name: "多层级标签", detail: "支持分类→标签项两级结构，可无限嵌套子标签", priority: "P0" as const },
      { name: "标签属性", detail: "名称、颜色、描述、快捷键绑定", priority: "P0" as const },
      { name: "频次统计", detail: "标签使用次数、关联数据集数量", priority: "P1" as const },
      { name: "导入导出", detail: "JSON/CSV 格式批量操作，支持多场景复用", priority: "P2" as const },
      { name: "批量编辑", detail: "多选启用/停用、重命名、删除", priority: "P2" as const },
    ],
    structure: {
      title: "标签层级结构示例（交通场景）",
      levels: [
        { level: "一级分类", example: "目标类别、行为类别、事件类别、严重程度" },
        { level: "二级标签", example: "小型轿车、货车/卡车、公交车、行人、骑行者" },
        { level: "三级标签", example: "（可扩展）轿车→私家车/出租车/网约车" },
      ],
    },
  },
  task: {
    title: "任务建模（5步向导）",
    steps: [
      {
        step: 1,
        name: "基础信息",
        fields: ["任务名称", "所属场景", "任务类型", "数据模态", "优先级"],
      },
      {
        step: 2,
        name: "数据规格",
        fields: ["数据类型", "数据量要求", "数据格式", "语言/领域", "样本单元"],
      },
      {
        step: 3,
        name: "质量要求",
        fields: ["准确性阈值", "一致性要求", "合格率目标", "质量门禁配置"],
      },
      {
        step: 4,
        name: "标注规范",
        fields: ["标注模板", "标注工具", "标注规则", "边缘案例处理"],
      },
      {
        step: 5,
        name: "评测指标",
        fields: ["主要指标", "辅助指标", "达标阈值", "评测数据集"],
      },
    ],
  },
  usecase: {
    title: "用户故事",
    stories: [
      "作为数据工程师，我希望在平台首页看到全局任务统计（总数/进行中/今日新增/已完成），以便快速掌握项目进展",
      "作为项目经理，我希望通过数据看板查看近30天数据质量趋势折线图，以便及时发现质量下滑趋势",
      "作为AI负责人，我希望自定义业务场景，并在场景下配置相关任务、数据集，以便按业务维度管理AI项目",
      "作为标注团队负责人，我希望为每个场景构建多层级标签体系，配置标签颜色和描述，以便标注员保持一致的标注语义",
      "作为数据工程师，我希望导出/导入标签体系为JSON/CSV格式，以便在多个场景间复用标签配置",
      "作为产品经理，我希望查看标签使用频次和关联数据集数量，以便识别低频标签并优化标签体系",
      "作为AI算法工程师，我希望从业务场景出发创建模型生产任务，填写数据规格和评测指标，以便为数据工程团队提供明确的交付标准",
      "作为项目经理，我希望通过时间轴视图查看任务各阶段进度（数据采集→清洗→标注→质检→完成），以便追踪整体交付节奏",
    ],
  },
};

// 数据生产内容
const DATA_PRODUCTION_CONTENT = {
  overview: {
    title: "模块概述",
    desc: "数据生产中心覆盖数据接入、清洗、增强、标注、溯源全流程，为AI模型训练提供高质量训练数据。",
    stats: [
      { label: "已采集数据", value: "2.3M+", icon: Database },
      { label: "日处理能力", value: "100W+", icon: Activity },
      { label: "标注效率提升", value: "60%+", icon: TrendingUp },
      { label: "质量合格率", value: "98.5%", icon: Shield },
    ],
  },
  access: {
    title: "数据接入",
    desc: "支持多源异构数据的统一接入，提供采集任务管理、数据源配置、存储管理。",
    features: [
      { name: "任务列表", detail: "任务ID、名称、数据类型、数据源类型、所属项目、状态、进度", priority: "P0" as const },
      { name: "多条件筛选", detail: "按任务名称/ID/类型/项目/状态/时间范围筛选", priority: "P0" as const },
      { name: "新增任务向导", detail: "4步流程：基础信息→数据源配置→汇聚存储→确认创建", priority: "P0" as const },
      { name: "实时监控", detail: "采集进度可视化、执行日志、异常告警", priority: "P1" as const },
      { name: "批量操作", detail: "批量终止/重启/删除/导出配置", priority: "P1" as const },
    ],
    dataSourceTypes: [
      { type: "本地文件", formats: "CSV/TXT/JSON/XML/Parquet", icon: FileText },
      { type: "对象存储", formats: "OSS/S3/MinIO", icon: Database },
      { type: "关系型数据库", formats: "MySQL/PostgreSQL/Oracle", icon: Database },
      { type: "非关系型数据库", formats: "MongoDB/Redis", icon: Database },
      { type: "API接口", formats: "RESTful/GraphQL", icon: Link2 },
      { type: "消息队列", formats: "Kafka/RabbitMQ", icon: Activity },
      { type: "流媒体", formats: "RTSP/HLS/FLV", icon: Activity },
    ],
    collectModes: [
      { mode: "批量离线采集", desc: "静态历史数据，一次性或周期性定时执行", icon: Clock },
      { mode: "流式实时采集", desc: "实时增量数据，持续消费，支持断点续传", icon: Activity },
    ],
  },
  cleaning: {
    title: "数据清洗",
    desc: "提供多类型数据清洗算子，自动化处理数据质量问题。",
    operators: {
      文本: ["去重", "空值填充", "格式标准化", "异常字符过滤", "长度截断", "乱码修复", "敏感信息脱敏", "HTML标签清除"],
      图像: ["去重", "模糊过滤", "分辨率过滤", "亮度/对比度过滤", "格式转换", "尺寸归一化", "水印去除"],
      视频: ["去重", "时长过滤", "画质过滤", "关键帧提取", "音视频分离", "格式转换"],
      音频: ["去重", "时长过滤", "采样率转换", "噪声过滤", "静音检测", "格式转换"],
    },
    features: [
      { name: "算子组合", detail: "可视化拖拽配置清洗算子流水线", priority: "P0" as const },
      { name: "参数配置", detail: "各算子支持独立参数设置", priority: "P0" as const },
      { name: "结果预览", detail: "实时预览清洗效果", priority: "P1" as const },
      { name: "质量报告", detail: "原始量/清洗后量/剔除率/质量分", priority: "P0" as const },
    ],
  },
  augment: {
    title: "数据增强",
    desc: "基于规则和AI的样本增强，提升数据多样性和模型泛化能力。",
    types: [
      {
        type: "图像增强",
        methods: ["翻转", "旋转", "裁剪", "放大", "对比度", "色彩调整", "模糊", "噪声", "MixUp", "CutMix"],
        icon: Layers,
      },
      {
        type: "文本增强",
        methods: ["同义词替换", "随机插入", "回译", "Dropout", "上下文增强", "EED", "伪反义"],
        icon: FileText,
      },
      {
        type: "音频增强",
        methods: ["背景噪声", "变速", "音高调整", "混响", "时移", "人声分离"],
        icon: Activity,
      },
      {
        type: "视频增强",
        methods: ["丢帧", "帧率调整", "时序扰动", "帧级图像增强", "时间轴裁剪"],
        icon: Activity,
      },
    ],
    features: [
      { name: "规则管理", detail: "可视化开关 + 参数配置", priority: "P0" as const },
      { name: "AI增强", detail: "第三方AI服务集成（DALL-E/SD/GPT）", priority: "P1" as const },
      { name: "效果预览", detail: "实时预览增强效果对比", priority: "P1" as const },
    ],
  },
  annotation: {
    title: "数据标注",
    desc: "支持多模态数据的专业标注，提供丰富的标注模板和工具。",
    templates: [
      { name: "文本标注", types: "实体识别、关系抽取、情感分析、问答标注", color: "#3b82f6" },
      { name: "图像标注", types: "分类、目标检测、语义分割、OCR", color: "#8b5cf6" },
      { name: "视频标注", types: "视频分类、行为检测、关键帧标注", color: "#10b981" },
      { name: "音频标注", types: "音频分类、语音识别、情绪识别", color: "#f59e0b" },
      { name: "点云标注", types: "3D目标检测、场景分割", color: "#ef4444" },
      { name: "多模态标注", types: "图文对齐、视频-文本对齐", color: "#06b6d4" },
    ],
    llmTemplates: [
      { name: "SFT", desc: "Instruction-Input-Output 高质量样本", icon: FileText },
      { name: "DPO", desc: "Chosen/Rejected 偏好对标注", icon: GitMerge },
      { name: "PPO/RLHF", desc: "奖励模型训练数据构建", icon: TrendingUp },
      { name: "CoT", desc: "中间推理步骤标注", icon: Brain },
      { name: "ToT", desc: "多分支推理路径标注", icon: GitBranch },
      { name: "GoT", desc: "图结构推理过程标注", icon: Workflow },
    ],
    features: [
      { name: "专家标注", detail: "专业标注员手动标注，支持12种标注模板", priority: "P0" as const },
      { name: "智能标注", detail: "AI预标注+人工审核，效率提升60%+", priority: "P0" as const },
      { name: "双盲标注", detail: "两位标注员独立标注，Kappa一致性仲裁", priority: "P1" as const },
      { name: "快捷键支持", detail: "A/D翻页、S跳过、Enter确认", priority: "P0" as const },
    ],
  },
  trace: {
    title: "数据溯源",
    desc: "全链路数据血缘追踪，支持可视化溯源图谱和报告导出。",
    features: [
      { name: "血缘图谱", detail: "采集→处理→校验→存储→归档 全链路可视化", priority: "P0" as const },
      { name: "溯源查询", detail: "数据ID/任务ID/数据类型/来源/操作人/时间范围", priority: "P0" as const },
      { name: "操作记录", detail: "操作类型、人、时间、内容、结果、IP地址", priority: "P0" as const },
      { name: "报告导出", detail: "PDF/Excel格式溯源报告", priority: "P1" as const },
    ],
  },
  usecase: {
    title: "用户故事",
    stories: [
      "作为数据工程师，我希望通过向导创建数据采集任务，支持本地上传、API对接、数据库连接多种方式，以便灵活接入不同来源的数据",
      "作为数据工程师，我希望查看数据采集的实时进度和日志记录，以便及时发现接入异常",
      "作为数据工程师，我希望查看数据集的版本历史（版本号/修改人/时间/变更说明），以便追溯数据变化来源",
      "作为数据工程师，我希望通过可视化数据血缘图查看数据从采集→处理→标注的完整溯源链路，以便追查数据质量问题根源",
      "作为数据工程师，我希望配置字段映射和格式转换规则，支持批量处理和历史记录，以便将不同来源的异构数据统一为标准格式",
      "作为数据工程师，我希望通过清洗任务向导选择数据类型对应的清洗算子组合，以便自动化处理数据质量问题",
      "作为标注工程师，我希望使用快捷键和自动跳转未标注项功能，以便提升单次标注效率",
      "作为标注质检员，我希望系统基于预训练模型自动对数据进行预标注，以便将人工审核量从100%降低到30%以内",
      "作为标注负责人，我希望开启双盲标注模式，由两位标注员独立完成同一份数据，系统自动计算Kappa一致性，以便保障标注质量",
      "作为质检负责人，我希望导出完整的数据集质量报告为PDF，以便向客户交付质量证明",
    ],
  },
};

// 模型生产内容
const MODEL_PRODUCTION_CONTENT = {
  overview: {
    title: "模块概述",
    desc: "模型生产中心提供从模型仓库、训练、评估到测试的全链路模型生产能力。",
    stats: [
      { label: "模型总数", value: "156", icon: Brain },
      { label: "训练任务", value: "89", icon: Activity },
      { label: "平均准确率", value: "94.2%", icon: TrendingUp },
      { label: "评测次数", value: "234", icon: BarChart3 },
    ],
  },
  repo: {
    title: "模型仓库",
    desc: "集中管理企业AI资产，支持多版本控制、权限管理、模型卡片。",
    features: [
      { name: "模型列表", detail: "按类型/状态/标签筛选，支持搜索", priority: "P0" as const },
      { name: "版本管理", detail: "多版本支持，版本对比，一键回滚", priority: "P0" as const },
      { name: "模型卡片", detail: "元数据、性能指标、使用说明、API文档", priority: "P0" as const },
      { name: "文件浏览", detail: "config.json/tokenizer/weights目录结构", priority: "P1" as const },
      { name: "部署管理", detail: "GPU数量/批处理大小/并发数配置", priority: "P1" as const },
    ],
    tabs: ["基础信息", "版本管理", "评测记录", "部署实例"],
  },
  training: {
    title: "模型训练",
    desc: "可视化训练配置、分布式训练、实验追踪。",
    features: [
      { name: "训练向导", detail: "3步：选择基础模型→配置超参数→确认启动", priority: "P0" as const },
      { name: "训练方法", detail: "SFT/LoRA/RLHF/DPO多方法支持", priority: "P0" as const },
      { name: "实验监控", detail: "Train Loss/Eval Loss曲线、GPU利用率", priority: "P0" as const },
      { name: "资源管理", detail: "GPU调度、多机多卡、配额控制", priority: "P1" as const },
    ],
    metrics: ["Train Loss", "Eval Loss", "Learning Rate", "GPU Memory", "Throughput"],
  },
  evaluation: {
    title: "模型评估",
    desc: "标准化评测体系、Benchmark管理、多维度指标看板。",
    strategies: [
      { name: "分类准确性", desc: "准确率/精确率/召回率/F1分数" },
      { name: "生成质量", desc: "BLEU/ROUGE/METEOR/GPT-Score" },
      { name: "语义相似度", desc: "Cosine Similarity/Sentence BERT" },
      { name: "标注一致性", desc: "人工评估 + Kappa系数" },
      { name: "鲁棒性测试", desc: "对抗样本/噪声扰动测试" },
      { name: "公平性评估", desc: "性别/年龄/地区偏差检测" },
    ],
    features: [
      { name: "评测任务", detail: "任务创建、配置、执行、结果分析", priority: "P0" as const },
      { name: "Benchmark", detail: "预置+自定义评测集管理", priority: "P0" as const },
      { name: "指标看板", detail: "多维度性能可视化雷达图", priority: "P1" as const },
      { name: "报告导出", detail: "PDF格式评估报告", priority: "P1" as const },
    ],
  },
  testing: {
    title: "模型测试",
    desc: "生产前测试、A/B测试、灰度发布支持。",
    features: [
      { name: "在线推理", detail: "输入输出验证、边界条件测试", priority: "P0" as const },
      { name: "性能测试", detail: "延迟、吞吐量、并发测试", priority: "P0" as const },
      { name: "多模型对比", detail: "最多3个模型同时并排测试", priority: "P1" as const },
      { name: "A/B测试", detail: "流量分配、效果对比", priority: "P2" as const },
      { name: "灰度发布", detail: "按比例切分流量、金丝雀发布", priority: "P2" as const },
    ],
  },
  usecase: {
    title: "用户故事",
    stories: [
      "作为AI算法工程师，我希望在模型仓库中管理模型（上传/版本控制/状态标注），支持按框架/任务类型/状态筛选，以便快速定位和复用模型资产",
      "作为AI算法工程师，我希望浏览模型文件目录结构，并下载指定文件，以便在本地环境复现模型推理",
      "作为平台管理员，我希望管理模型部署实例（配置GPU数量/批处理大小/并发数），以便控制模型服务资源消耗",
      "作为AI算法工程师，我希望通过3步向导创建训练任务，支持SFT/LoRA/RLHF方法选择，以便快速发起新一轮模型训练",
      "作为AI算法工程师，我希望在实验监控面板实时查看Train Loss/Eval Loss曲线、GPU利用率、评估指标趋势，以便判断训练过程是否正常收敛",
      "作为AI算法工程师，我希望能对训练完成的模型进行多维度评估（准确率/精确率/召回率/F1），支持6种评测策略，以便量化模型质量",
      "作为AI算法工程师，我希望对模型进行在线推理测试，查看预测结果和置信度，支持多模型并排对比，以便在部署前验证模型效果",
      "作为AI算法工程师，我希望导出评估历史结果为PDF报告，以便向业务方汇报模型性能",
    ],
  },
};

// ============================================================
// 组件定义
// ============================================================

function ModuleCard({ module, onClick, isActive }: { module: any; onClick: () => void; isActive: boolean }) {
  const Icon = module.icon;
  return (
    <div
      onClick={onClick}
      style={{
        padding: "16px 20px",
        background: isActive ? module.bgGradient : "#fff",
        border: `1.5px solid ${isActive ? module.color : "#e2e8f0"}`,
        borderRadius: 12,
        cursor: "pointer",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
      }}
      onMouseEnter={e => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.borderColor = module.color;
          (e.currentTarget as HTMLElement).style.background = `${module.color}05`;
          (e.currentTarget as HTMLElement).style.transform = "translateX(2px)";
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
          (e.currentTarget as HTMLElement).style.background = "#fff";
          (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
        }
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: `${module.color}15`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={22} style={{ color: module.color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
          {module.label}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
          {module.desc}
        </div>
      </div>
      <ChevronRight size={18} style={{ color: isActive ? module.color : "#cbd5e1", flexShrink: 0, marginTop: 2 }} />
    </div>
  );
}

function SectionNav({ module, activeSection, onSectionClick }: { module: any; activeSection: string; onSectionClick: (id: string) => void }) {
  return (
    <div style={{
      position: "sticky",
      top: 0,
      background: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
      padding: "14px 24px",
      zIndex: 10,
    }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {module.sections.map((section: any) => (
          <button
            key={section.id}
            onClick={() => onSectionClick(section.id)}
            style={{
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: activeSection === section.id ? 600 : 500,
              color: activeSection === section.id ? "#fff" : "#475569",
              background: activeSection === section.id ? module.color : "#fff",
              border: `1px solid ${activeSection === section.id ? module.color : "#e2e8f0"}`,
              borderRadius: 6,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {section.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FeatureCard({ name, detail, priority, color }: { name: string; detail: string; priority?: "P0" | "P1" | "P2"; color: string }) {
  const priorityColors: Record<string, string> = { P0: "#ef4444", P1: "#f59e0b", P2: "#64748b" };
  return (
    <div style={{
      padding: "14px 18px",
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
          <CheckCircle2 size={15} style={{ color, marginRight: 6, verticalAlign: "middle" }} />
          {name}
        </div>
        {priority && (
          <span style={{
            fontSize: 10, fontWeight: 700,
            padding: "2px 6px",
            background: `${priorityColors[priority]}15`,
            color: priorityColors[priority],
            borderRadius: 4,
          }}>
            {priority}
          </span>
        )}
      </div>
      <div style={{ fontSize: 12, color: "#64748b", paddingLeft: 21 }}>
        {detail}
      </div>
    </div>
  );
}

function SectionTitle({ title, desc, color }: { title: string; desc?: string; color: string }) {
  return (
    <div style={{
      padding: "20px 24px",
      background: `linear-gradient(135deg, ${color}08 0%, #fff 100%)`,
      border: `1px solid ${color}20`,
      borderRadius: 12,
      marginBottom: 24,
    }}>
      <h3 style={{ fontSize: 17, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
        {title}
      </h3>
      {desc && (
        <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>
          {desc}
        </p>
      )}
    </div>
  );
}

function UserStoryCard({ story, index }: { story: string; index: number }) {
  return (
    <div style={{
      padding: "12px 16px",
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 8,
      display: "flex",
      gap: 12,
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: 6,
        background: "#f1f5f9",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        fontSize: 11, fontWeight: 700, color: "#64748b",
      }}>
        {String(index).padStart(2, '0')}
      </div>
      <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
        {story}
      </div>
    </div>
  );
}

function TableRow({ cells, isHeader = false }: { cells: string[]; isHeader?: boolean }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: cells.map((_, i) => i === 0 ? "1.5fr" : "1fr").join(" "),
      gap: 12,
      padding: "12px 16px",
      background: isHeader ? "#f8fafc" : "#fff",
      borderBottom: "1px solid #e2e8f0",
      fontSize: 13,
      fontWeight: isHeader ? 600 : 400,
      color: isHeader ? "#475569" : "#1e293b",
    }}>
      {cells.map((cell, i) => (
        <div key={i}>{cell}</div>
      ))}
    </div>
  );
}

// ============================================================
// 主组件
// ============================================================
export default function PRDPage() {
  const [activeModule, setActiveModule] = useState("overview");
  const [activeSection, setActiveSection] = useState("bg");
  const [searchKeyword, setSearchKeyword] = useState("");

  const currentModule = PRD_MODULES.find(m => m.key === activeModule)!;

  // 切换模块时重置 section
  useEffect(() => {
    const module = PRD_MODULES.find(m => m.key === activeModule);
    if (module && module.sections.length > 0) {
      setActiveSection(module.sections[0].id);
    }
  }, [activeModule]);

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* 左侧模块导航 */}
      <div style={{
        width: 300,
        borderRight: "1px solid #e2e8f0",
        background: "#f8fafc",
        overflow: "auto",
        flexShrink: 0,
      }}>
        <div style={{ padding: "20px 16px 8px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12, paddingLeft: 6 }}>
            PRD 文档导航
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PRD_MODULES.map(module => (
              <ModuleCard
                key={module.key}
                module={module}
                isActive={activeModule === module.key}
                onClick={() => setActiveModule(module.key)}
              />
            ))}
          </div>
        </div>

        {/* 版本信息 */}
        <div style={{ margin: "24px 16px", padding: "14px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>文档信息</div>
          <div style={{ fontSize: 12, color: "#64748b", display: "flex", flexDirection: "column", gap: 4 }}>
            <div>版本：v1.1</div>
            <div>日期：2026-05-18</div>
            <div>状态：编写中</div>
          </div>
        </div>
      </div>

      {/* 右侧内容区 */}
      <div style={{ flex: 1, overflow: "auto", background: "#fff" }}>
        {/* 顶部标题栏 */}
        <div style={{
          padding: "24px 32px",
          borderBottom: "1px solid #e2e8f0",
          background: "linear-gradient(135deg, #f8fafc 0%, #fff 100%)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: currentModule.bgGradient,
              border: `1px solid ${currentModule.color}20`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {(() => { const Icon = currentModule.icon; return <Icon size={28} style={{ color: currentModule.color }} />; })()}
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1e293b", margin: 0 }}>
                零数数智工厂 — {currentModule.label}
              </h1>
              <p style={{ fontSize: 13, color: "#64748b", margin: "6px 0 0" }}>
                {currentModule.desc}
              </p>
            </div>
          </div>
        </div>

        {/* 分段导航 */}
        <SectionNav
          module={currentModule}
          activeSection={activeSection}
          onSectionClick={setActiveSection}
        />

        {/* 内容区 */}
        <div style={{ padding: "28px 32px" }}>
          {/* ==================== 产品概述 ==================== */}
          {activeModule === "overview" && (
            <>
              {/* 产品背景 */}
              {activeSection === "bg" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={OVERVIEW_CONTENT.bg.title} color={currentModule.color} />
                  <div style={{ whiteSpace: "pre-wrap", fontSize: 14, color: "#475569", lineHeight: 1.8, padding: "0 4px" }}>
                    {OVERVIEW_CONTENT.bg.content}
                  </div>
                </div>
              )}

              {/* 核心价值 */}
              {activeSection === "value" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={OVERVIEW_CONTENT.value.title} desc="零数数智工厂的三大核心价值主张" color={currentModule.color} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                    {OVERVIEW_CONTENT.value.points.map((point, i) => {
                      const Icon = point.icon;
                      return (
                        <div key={i} style={{
                          padding: "24px",
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 12,
                        }}>
                          <div style={{
                            width: 48, height: 48, borderRadius: 12,
                            background: `${currentModule.color}10`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            marginBottom: 16,
                          }}>
                            <Icon size={24} style={{ color: currentModule.color }} />
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>
                            {point.label}
                          </div>
                          <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                            {point.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 目标用户 */}
              {activeSection === "users" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={OVERVIEW_CONTENT.users.title} color={currentModule.color} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                    {OVERVIEW_CONTENT.users.roles.map((r, i) => (
                      <div key={i} style={{
                        padding: "18px 20px",
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                        borderLeft: `4px solid ${r.color}`,
                      }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                          {r.role}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {r.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 术语定义 */}
              {activeSection === "terms" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={OVERVIEW_CONTENT.terms.title} color={currentModule.color} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {OVERVIEW_CONTENT.terms.terms.map((t, i) => (
                      <div key={i} style={{
                        padding: "14px 18px",
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                      }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: currentModule.color, marginBottom: 4 }}>
                          {t.term}
                        </div>
                        <div style={{ fontSize: 13, color: "#475569" }}>
                          {t.definition}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ==================== 场景建模 ==================== */}
          {activeModule === "scene-modeling" && (
            <>
              {/* 模块概述 */}
              {activeSection === "overview" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={SCENE_MODELING_CONTENT.overview.title} desc={SCENE_MODELING_CONTENT.overview.desc} color={currentModule.color} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                    {SCENE_MODELING_CONTENT.overview.features.map((f, i) => (
                      <FeatureCard key={i} {...f} color={currentModule.color} />
                    ))}
                  </div>
                </div>
              )}

              {/* 场景管理 */}
              {activeSection === "scene" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={SCENE_MODELING_CONTENT.scene.title} color={currentModule.color} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
                    {SCENE_MODELING_CONTENT.scene.features.map((f, i) => (
                      <FeatureCard key={i} {...f} color={currentModule.color} />
                    ))}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 12 }}>场景表示例</h4>
                    <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                      <TableRow cells={SCENE_MODELING_CONTENT.scene.data.columns} isHeader />
                      {SCENE_MODELING_CONTENT.scene.data.examples.map((row, i) => (
                        <TableRow key={i} cells={[row.name, row.domain, String(row.tasks), String(row.datasets), "—", row.status]} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 标签体系 */}
              {activeSection === "label" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={SCENE_MODELING_CONTENT.label.title} color={currentModule.color} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
                    {SCENE_MODELING_CONTENT.label.features.map((f, i) => (
                      <FeatureCard key={i} {...f} color={currentModule.color} />
                    ))}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 12 }}>{SCENE_MODELING_CONTENT.label.structure.title}</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {SCENE_MODELING_CONTENT.label.structure.levels.map((l, i) => (
                        <div key={i} style={{ display: "flex", gap: 16, alignItems: "center" }}>
                          <div style={{ width: 90, fontSize: 12, fontWeight: 600, color: "#64748b" }}>{l.level}</div>
                          <div style={{ flex: 1, fontSize: 13, color: "#475569", padding: "8px 14px", background: "#f8fafc", borderRadius: 6 }}>
                            {l.example}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 任务建模 */}
              {activeSection === "task" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={SCENE_MODELING_CONTENT.task.title} desc="5步向导完成模型生产任务的完整定义" color={currentModule.color} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {SCENE_MODELING_CONTENT.task.steps.map((step, i) => (
                      <div key={i} style={{
                        display: "flex",
                        gap: 20,
                        padding: "18px 20px",
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: `${currentModule.color}15`,
                          color: currentModule.color,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, fontWeight: 700,
                          flexShrink: 0,
                        }}>
                          {step.step}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 10 }}>
                            {step.name}
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {step.fields.map((field, j) => (
                              <span key={j} style={{
                                fontSize: 12, color: "#64748b",
                                padding: "4px 10px",
                                background: "#f1f5f9",
                                borderRadius: 4,
                              }}>
                                {field}
                              </span>
                            ))}
                          </div>
                        </div>
                        {i < 4 && <ArrowRight size={18} style={{ color: "#cbd5e1", flexShrink: 0, alignSelf: "center" }} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 用户故事 */}
              {activeSection === "usecase" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={SCENE_MODELING_CONTENT.usecase.title} color={currentModule.color} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {SCENE_MODELING_CONTENT.usecase.stories.map((story, i) => (
                      <UserStoryCard key={i} story={story} index={i + 1} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ==================== 数据生产 ==================== */}
          {activeModule === "data-production" && (
            <>
              {/* 模块概述 */}
              {activeSection === "overview" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={DATA_PRODUCTION_CONTENT.overview.title} desc={DATA_PRODUCTION_CONTENT.overview.desc} color={currentModule.color} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                    {DATA_PRODUCTION_CONTENT.overview.stats.map((s, i) => {
                      const Icon = s.icon;
                      return (
                        <div key={i} style={{
                          padding: "20px",
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 10,
                          textAlign: "center",
                        }}>
                          <Icon size={24} style={{ color: currentModule.color, marginBottom: 8 }} />
                          <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b" }}>{s.value}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>{s.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 数据接入 */}
              {activeSection === "access" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={DATA_PRODUCTION_CONTENT.access.title} desc={DATA_PRODUCTION_CONTENT.access.desc} color={currentModule.color} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
                    {DATA_PRODUCTION_CONTENT.access.features.map((f, i) => (
                      <FeatureCard key={i} {...f} color={currentModule.color} />
                    ))}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 12 }}>支持的数据源类型</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
                      {DATA_PRODUCTION_CONTENT.access.dataSourceTypes.map((ds, i) => {
                        const Icon = ds.icon;
                        return (
                          <div key={i} style={{
                            padding: "16px",
                            background: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: 8,
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                              <Icon size={16} style={{ color: currentModule.color }} />
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{ds.type}</span>
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>{ds.formats}</div>
                          </div>
                        );
                      })}
                    </div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 12 }}>采集模式</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                      {DATA_PRODUCTION_CONTENT.access.collectModes.map((m, i) => {
                        const Icon = m.icon;
                        return (
                          <div key={i} style={{
                            padding: "18px",
                            background: "#fff",
                            border: `1px solid ${currentModule.color}30`,
                            borderRadius: 8,
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                              <Icon size={18} style={{ color: currentModule.color }} />
                              <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{m.mode}</span>
                            </div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>{m.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 数据清洗 */}
              {activeSection === "cleaning" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={DATA_PRODUCTION_CONTENT.cleaning.title} desc={DATA_PRODUCTION_CONTENT.cleaning.desc} color={currentModule.color} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
                    {DATA_PRODUCTION_CONTENT.cleaning.features.map((f, i) => (
                      <FeatureCard key={i} {...f} color={currentModule.color} />
                    ))}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 12 }}>清洗算子体系</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                      {Object.entries(DATA_PRODUCTION_CONTENT.cleaning.operators).map(([type, ops]) => (
                        <div key={type} style={{
                          padding: "18px",
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 10,
                        }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: currentModule.color, marginBottom: 12 }}>
                            {type}清洗算子
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {ops.map((op, j) => (
                              <span key={j} style={{
                                fontSize: 11, color: "#475569",
                                padding: "4px 8px",
                                background: "#f1f5f9",
                                borderRadius: 4,
                              }}>
                                {op}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 数据增强 */}
              {activeSection === "augment" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={DATA_PRODUCTION_CONTENT.augment.title} desc={DATA_PRODUCTION_CONTENT.augment.desc} color={currentModule.color} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                    {DATA_PRODUCTION_CONTENT.augment.types.map((t, i) => {
                      const Icon = t.icon;
                      return (
                        <div key={i} style={{
                          padding: "20px",
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 10,
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                            <Icon size={18} style={{ color: currentModule.color }} />
                            <span style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>{t.type}</span>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {t.methods.map((m, j) => (
                              <span key={j} style={{
                                fontSize: 11, color: "#64748b",
                                padding: "4px 8px",
                                background: "#f8fafc",
                                borderRadius: 4,
                                border: "1px solid #e2e8f0",
                              }}>
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 数据标注 */}
              {activeSection === "annotation" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={DATA_PRODUCTION_CONTENT.annotation.title} desc={DATA_PRODUCTION_CONTENT.annotation.desc} color={currentModule.color} />
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 12 }}>基础标注模板</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
                      {DATA_PRODUCTION_CONTENT.annotation.templates.map((t, i) => (
                        <div key={i} style={{
                          padding: "16px",
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          borderLeft: `4px solid ${t.color}`,
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>{t.name}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{t.types}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 12 }}>LLM训练数据标注模板</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                      {DATA_PRODUCTION_CONTENT.annotation.llmTemplates.map((t, i) => {
                        const Icon = t.icon;
                        return (
                          <div key={i} style={{
                            padding: "16px",
                            background: "#fff",
                            border: `1px solid ${currentModule.color}20`,
                            borderRadius: 8,
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                              <Icon size={16} style={{ color: currentModule.color }} />
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{t.name}</span>
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>{t.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 数据溯源 */}
              {activeSection === "trace" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={DATA_PRODUCTION_CONTENT.trace.title} desc={DATA_PRODUCTION_CONTENT.trace.desc} color={currentModule.color} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                    {DATA_PRODUCTION_CONTENT.trace.features.map((f, i) => (
                      <FeatureCard key={i} {...f} color={currentModule.color} />
                    ))}
                  </div>
                  <div style={{ padding: "24px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>数据血缘链路</h4>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      {["采集任务", "数据清洗", "质量校验", "数据存储", "版本归档"].map((step, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center" }}>
                          <div style={{
                            padding: "10px 16px",
                            background: "#fff",
                            border: `1px solid ${currentModule.color}40`,
                            borderRadius: 6,
                            fontSize: 13, fontWeight: 500, color: "#475569",
                          }}>
                            {step}
                          </div>
                          {i < 4 && <ChevronRight size={16} style={{ color: "#cbd5e1", margin: "0 4px" }} />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 用户故事 */}
              {activeSection === "usecase" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={DATA_PRODUCTION_CONTENT.usecase.title} color={currentModule.color} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {DATA_PRODUCTION_CONTENT.usecase.stories.map((story, i) => (
                      <UserStoryCard key={i} story={story} index={i + 1} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ==================== 模型生产 ==================== */}
          {activeModule === "model-production" && (
            <>
              {/* 模块概述 */}
              {activeSection === "overview" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={MODEL_PRODUCTION_CONTENT.overview.title} desc={MODEL_PRODUCTION_CONTENT.overview.desc} color={currentModule.color} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                    {MODEL_PRODUCTION_CONTENT.overview.stats.map((s, i) => {
                      const Icon = s.icon;
                      return (
                        <div key={i} style={{
                          padding: "20px",
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 10,
                          textAlign: "center",
                        }}>
                          <Icon size={24} style={{ color: currentModule.color, marginBottom: 8 }} />
                          <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b" }}>{s.value}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>{s.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 模型仓库 */}
              {activeSection === "repo" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={MODEL_PRODUCTION_CONTENT.repo.title} desc={MODEL_PRODUCTION_CONTENT.repo.desc} color={currentModule.color} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
                    {MODEL_PRODUCTION_CONTENT.repo.features.map((f, i) => (
                      <FeatureCard key={i} {...f} color={currentModule.color} />
                    ))}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 12 }}>模型仓库 Tab 页签</h4>
                    <div style={{ display: "flex", gap: 8 }}>
                      {MODEL_PRODUCTION_CONTENT.repo.tabs.map((tab, i) => (
                        <div key={i} style={{
                          padding: "8px 16px",
                          background: i === 0 ? currentModule.color : "#fff",
                          color: i === 0 ? "#fff" : "#64748b",
                          border: `1px solid ${i === 0 ? currentModule.color : "#e2e8f0"}`,
                          borderRadius: 6,
                          fontSize: 12, fontWeight: 500,
                        }}>
                          {tab}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 模型训练 */}
              {activeSection === "training" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={MODEL_PRODUCTION_CONTENT.training.title} desc={MODEL_PRODUCTION_CONTENT.training.desc} color={currentModule.color} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
                    {MODEL_PRODUCTION_CONTENT.training.features.map((f, i) => (
                      <FeatureCard key={i} {...f} color={currentModule.color} />
                    ))}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 12 }}>训练监控指标</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {MODEL_PRODUCTION_CONTENT.training.metrics.map((m, i) => (
                        <div key={i} style={{
                          padding: "10px 16px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 6,
                          fontSize: 12, fontWeight: 500, color: "#475569",
                        }}>
                          {m}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 模型评估 */}
              {activeSection === "evaluation" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={MODEL_PRODUCTION_CONTENT.evaluation.title} desc={MODEL_PRODUCTION_CONTENT.evaluation.desc} color={currentModule.color} />
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 12 }}>评测策略</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
                      {MODEL_PRODUCTION_CONTENT.evaluation.strategies.map((s, i) => (
                        <div key={i} style={{
                          padding: "16px",
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{s.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                    {MODEL_PRODUCTION_CONTENT.evaluation.features.map((f, i) => (
                      <FeatureCard key={i} {...f} color={currentModule.color} />
                    ))}
                  </div>
                </div>
              )}

              {/* 模型测试 */}
              {activeSection === "testing" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={MODEL_PRODUCTION_CONTENT.testing.title} desc={MODEL_PRODUCTION_CONTENT.testing.desc} color={currentModule.color} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                    {MODEL_PRODUCTION_CONTENT.testing.features.map((f, i) => (
                      <FeatureCard key={i} {...f} color={currentModule.color} />
                    ))}
                  </div>
                </div>
              )}

              {/* 用户故事 */}
              {activeSection === "usecase" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <SectionTitle title={MODEL_PRODUCTION_CONTENT.usecase.title} color={currentModule.color} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {MODEL_PRODUCTION_CONTENT.usecase.stories.map((story, i) => (
                      <UserStoryCard key={i} story={story} index={i + 1} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
