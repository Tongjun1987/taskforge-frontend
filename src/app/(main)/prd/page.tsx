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
    desc: "产品介绍、产品架构、市场调研",
    sections: [
      { id: "intro", label: "产品介绍" },
      { id: "architecture", label: "产品架构" },
      { id: "market-research", label: "市场调研" },
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

// 产品介绍内容
const PRODUCT_INTRO = {
  name: "零数数智工厂",
  slogan: "高效数据生产与模型迭代平台，让企业 AI 能力从数据到应用持续进化。",
  altSlogans: [
    "让高质量数据流动起来，让 AI 模型快速进化。",
    "从数据生产到智能体应用，一站式构建企业 AI 工厂。",
    "打通数据、模型与应用的企业级 AI 生产线。",
  ],
  positioning: "零数数智工厂是一套面向企业 AI 建设的端到端数据与模型生产平台，覆盖业务场景定义、异构数据接入、数据湖存储、数据清洗加工、数据标注质检、数据资产管理、模型训练评测、模型推理部署、知识库构建和智能体应用开发。\n\n产品以数据平台和模型平台为双核心，通过 Kafka、MinIO、Apache Iceberg、Apache Spark、Label Studio、MLflow、Ollama、Dify 等技术组件，构建可追溯、可治理、可扩展、可交付的企业级 AI 生产工作台。",
  audiences: [
    { group: "企业 AI 团队", need: "需要统一管理数据、模型、知识库和智能体应用的完整生产流程" },
    { group: "数据工程师", need: "需要高效接入多源异构数据，并完成清洗、入湖、质量治理和溯源" },
    { group: "标注团队", need: "需要统一的标注任务分发、协作、质检和标注结果版本管理能力" },
    { group: "算法工程师", need: "需要规范化管理训练实验、模型评测、版本注册和模型部署" },
    { group: "产品与运营人员", need: "需要低门槛构建知识库、Prompt 模板和智能体应用" },
    { group: "平台管理员", need: "需要统一管理用户权限、资源、告警、审计、安全和系统运行状态" },
    { group: "交付与解决方案团队", need: "需要标准化平台能力支撑客户项目演示、部署、验收和扩展" },
  ],
  highlights: [
    { title: "端到端 AI 生产闭环", desc: "平台打通「场景定义、数据接入、数据处理、标注质检、数据集发布、模型训练、模型评测、推理部署、智能体应用」的完整链路，减少企业在多个工具之间反复切换的成本。", icon: Workflow, color: "#3b82f6" },
    { title: "多源异构数据统一接入", desc: "支持数据库、文件、对象存储、消息队列、API、RTSP 视频流、公开数据源等多种数据来源，适配结构化、半结构化和非结构化数据。", icon: Database, color: "#10b981" },
    { title: "数据湖与版本化资产管理", desc: "基于 MinIO 和 Apache Iceberg 构建数据湖能力，支持对象存储、湖表管理、ACID 事务、快照版本、Schema 演进和时间旅行，为数据资产沉淀提供可靠底座。", icon: Layers, color: "#8b5cf6" },
    { title: "流批一体数据加工", desc: "基于 Apache Spark 支持实时和离线数据清洗、质量评估、数据增强、特征工程和入湖处理，提升数据生产效率和质量可控性。", icon: Settings, color: "#f59e0b" },
    { title: "专业标注能力集成", desc: "集成 Label Studio，支持图像、文本、音频、视频、点云、多模态以及 SFT、DPO、RLHF、CoT 等多类型标注任务，支持团队协作、版本同步和质检闭环。", icon: Tag, color: "#ef4444" },
    { title: "模型实验与评测标准化", desc: "集成 MLflow，支持实验追踪、参数管理、指标对比、模型注册和版本管理，让模型训练和评测过程可复现、可比较、可追溯。", icon: BarChart3, color: "#06b6d4" },
    { title: "本地模型推理与智能体应用", desc: "通过 Ollama 支持本地大模型部署和轻量推理服务，通过 Dify 支持 RAG 知识库、Prompt 调试、可视化工作流和智能体应用构建。", icon: Brain, color: "#6366f1" },
    { title: "企业级治理与可观测性", desc: "提供 RBAC 权限、数据范围控制、操作审计、任务监控、组件健康检查、告警中心、质量门禁和资源监控，满足企业级管理和交付要求。", icon: Shield, color: "#14b8a6" },
  ],
  mainFunctions: [
    { title: "任务建模中心", items: ["业务场景管理", "标签体系管理", "建模任务管理", "任务进度、数据集、标注、模型实验关联查看"] },
    { title: "数据接入中心", items: ["9 类异构数据源接入", "数据源连接测试", "批量采集和流式采集", "调度策略、失败重试、限速和并发控制", "任务进度、日志、异常、告警和重试管理"] },
    { title: "数据平台", items: ["Kafka 消息缓存、预清洗、校验、去重和事件分发", "MinIO 对象存储", "Apache Iceberg 数据湖表、快照、版本和 Schema 演进", "Apache Spark 流批清洗、质量评估、数据增强和特征工程"] },
    { title: "数据标注中心", items: ["多类型标注模板", "标注任务创建和分发", "标注工作台", "团队协作与进度管理", "Kappa 一致性评估", "标注结果同步、导出和版本管理"] },
    { title: "数据资产管理", items: ["数据集管理", "数据集版本控制", "训练集、验证集、测试集划分", "数据质量报告", "数据质量门禁", "数据全链路溯源"] },
    { title: "模型生产中心", items: ["模型仓库", "模型训练任务", "MLflow 实验追踪", "模型评测和报告生成", "模型版本注册", "模型部署门禁"] },
    { title: "模型推理服务", items: ["Ollama 本地模型部署", "多模型管理", "在线推理测试", "API Key 管理", "调用量、延迟、错误率和限流监控"] },
    { title: "知识库与智能体应用", items: ["知识库创建和文档解析", "向量化和检索测试", "Prompt 模板管理", "RAG 应用构建", "智能体可视化工作流编排", "应用发布、调试和运行日志"] },
    { title: "平台管理与运营监测", items: ["用户、角色、部门、菜单和权限管理", "系统参数和通知管理", "操作日志和审计追踪", "首页运营看板", "告警中心", "算力和组件健康监控"] },
  ],
  painPoints: [
    { pain: "数据来源分散，接入成本高", solution: "提供统一数据源管理和多源异构数据接入流程" },
    { pain: "数据清洗、标注、训练链路割裂", solution: "打通数据生产到模型训练的端到端流程" },
    { pain: "数据质量不可控", solution: "提供预清洗、质量规则、质量报告和质量门禁" },
    { pain: "标注任务协作效率低", solution: "集成专业标注工具，统一管理任务分发、质检和版本同步" },
    { pain: "模型训练过程不可复现", solution: "通过 MLflow 记录参数、指标、日志和模型产物" },
    { pain: "模型部署与应用构建门槛高", solution: "支持 Ollama 本地推理和 Dify 智能体应用构建" },
    { pain: "数据、模型、应用缺少统一治理", solution: "建立统一资产目录、权限体系、审计日志和溯源链路" },
    { pain: "平台运行缺少监控", solution: "提供任务、数据、模型、组件和资源的统一监控告警" },
  ],
  valueBenefits: [
    { audience: "对业务", benefits: ["缩短 AI 项目从数据准备到应用上线的整体周期", "沉淀高质量数据资产、模型资产和知识资产", "支持企业 AI 能力从单点试验走向规模化生产"] },
    { audience: "对数据团队", benefits: ["降低多源数据接入和清洗成本", "提升数据质量可控性和可追溯性", "减少重复的数据处理和人工核查工作"] },
    { audience: "对算法团队", benefits: ["提升训练实验管理效率", "支持模型指标横向对比和版本追踪", "提高模型发布前评测和回归验证的规范性"] },
    { audience: "对应用团队", benefits: ["降低知识库、Prompt 和智能体应用构建门槛", "支持快速搭建 RAG 问答、智能客服、业务助手等 AI 应用", "提供从模型调用到应用反馈的运行观测能力"] },
    { audience: "对管理者", benefits: ["统一掌握数据资产、模型资产、任务执行和平台健康状态", "通过权限、审计、质量门禁和告警机制降低运营风险", "支撑客户项目标准化交付和持续运营"] },
  ],
  serviceModes: [
    { title: "私有化部署", desc: "适合对数据安全、模型资产和内网运行有要求的企业客户。平台部署在客户自有服务器、私有云或专有云环境中，数据不出域，支持本地模型部署和内部系统集成。" },
    { title: "本地演示与试点交付", desc: "适合售前验证、POC、试点项目和小规模团队使用。可按最小闭环部署核心模块，优先验证数据接入、标注、数据集、模型训练和知识库应用流程。" },
    { title: "混合云集成", desc: "适合同时使用本地数据和云端模型、云端存储或第三方 API 的客户。平台可通过统一凭据、API 适配器和权限控制接入外部能力。" },
    { title: "定制化项目交付", desc: "适合行业场景明确、流程复杂或需对接现有系统的客户。可围绕数据源适配、标注模板、质量规则、模型训练脚本、业务知识库和智能体应用进行定制开发。" },
  ],
  summary: "零数数智工厂是一套面向企业 AI 工程化落地的端到端生产平台，通过统一的数据平台、模型平台和智能体开发能力，帮助企业把分散的数据、模型和应用流程组织成可管理、可追踪、可复用、可持续迭代的 AI 生产体系。",
};

// 市场调研内容
const MARKET_RESEARCH_CONTENT = {
  perspectives: [
    {
      key: "national",
      label: "国家视角",
      icon: Shield,
      color: "#3b82f6",
      summary: "数据是人工智能与数字经济的核心生产要素，但「数据怎么高效生产」与「数据怎么安全跨域打通」始终是制约数据要素价值释放的两大瓶颈",
      sections: [
        {
          id: "1.1",
          title: "多模态非结构化数据语义规则：从「可读」到「可理解」",
          pain: "非结构化数据占全球数据总量80%以上，语义规则缺失导致价值难以释放。GB/T 32909-2016已发布近十年，面对大模型多模态需求覆盖深度不足。",
          progress: "TC609四项标准（2025年8月）构建「建设-格式-分类-评测」闭环；ISO/IEC 5259-1:2024实现「以数据使用为中心」范式变革；中国已启动采标。",
          trends: [
            "从单一模态规范→跨模态协同标注规范",
            "从人工标注→半自动化+AI辅助标注规范",
            "从文件级分类→实例级细粒度语义标注",
          ],
        },
        {
          id: "1.2",
          title: "高质量数据集全生命周期标准化：从「可信」到「可评」",
          pain: "知识数据三重痛点：表达不规范、结构不统一、质量评价缺失。现有标准多聚焦「建什么」，缺少「建得好不好」的量化评测体系。",
          progress: "TC609构建六步法全流程；信通院指引提出「规划-建设-交付-运维-运营」完整体系，强调「思维链（CoT）数据」作为高阶知识形态。",
          trends: [
            "从劳动密集型→知识密集型转型",
            "从静态评价→动态质量监测演进",
          ],
        },
        {
          id: "1.3",
          title: "多源异构数据本体模型标准化：从「可用」到「可复用」",
          pain: "多源异构数据融合面临「结构不统一、语义不一致、融合效率低」三大痛点。AI场景下语义歧义直接导致推理幻觉。",
          progress: "GB/T 42131-2022构建知识图谱技术框架；W3C OKI社区组（2025年10月）提出「对齐的本体网络」路径；清华大学CIMO本体验证工程可行性。",
          trends: [
            "从单一本体→对齐的本体网络",
            "从人工构建→AI辅助构建",
            "从技术标准→应用标准延伸",
          ],
        },
        {
          id: "1.4",
          title: "智能化数据工厂标准化：从「手工作坊」到「工业流水线」",
          pain: "数据标注产业年均复合增长率超20%，但仍面临专业化程度不足、标准缺失等挑战。数据生产链条长、环节间缺乏统一接口、质量评估体系不健全。",
          progress: "工信部启动「工业数据筑基行动」（1+4+N框架）；国家发改委等部门提出建立数据标注标准体系框架；微软Factory Namespace Manager验证AI驱动标准化可行性。",
          trends: [
            "场景驱动、分行业推进策略",
            "标准聚焦「接口规范」和「质量底线」",
            "先在钢铁、汽车等数据基础好的行业形成示范",
          ],
        },
      ],
      keyFindings: [
        "TC609四项标准首次实现多模态数据统一封装与实例级语义标注",
        "ISO/IEC 5259-1:2024从「以数据生产为中心」→「以数据使用为中心」范式变革",
        "GB/T 32909-2016已近十年，面对大模型多模态需求覆盖深度不足",
        "W3C OKI社区组提出「对齐的本体网络」路径，代表多本体互操作范式",
        "信通院提出「思维链数据」作为高阶知识形态，质量评价深入推理过程",
      ],
    },
    {
      key: "player",
      label: "玩家视角",
      icon: TrendingUp,
      color: "#8b5cf6",
      summary: "Data&AI数据基础设施——AI时代的「核心数字底座」，数据平台从「被动容器」升级为「主动生产力载体」",
      trackDefinition: {
        desc: "为支撑人工智能规模化落地而构建的一体化基础软件平台，通过AI原生架构重构数据处理范式，融合数据工程与AI工程。其本质是传统大数据平台的升级形态。",
        evolution: [
          { stage: "第一阶段", ai: "感知智能", data: "分散的非结构化数据", infra: "数据库/数据仓库" },
          { stage: "第二阶段", ai: "生成式AI", data: "结构化+单/多模态混合", infra: "数据平台/云数据仓库" },
          { stage: "第三阶段", ai: "Agentic AI", data: "融合的多模态数据", infra: "Data&AI数据基础设施" },
        ],
        diff: [
          { dim: "数据类型", old: "以结构化为主", new: "原生支持多模态" },
          { dim: "实时性", old: "批量处理为主，延迟高", new: "并行处理+实时动态处理" },
          { dim: "AI集成", old: "需外接ML平台", new: "Data&AI一体化" },
          { dim: "工具链", old: "缺乏AutoML/大模型运营", new: "支持训推一体/智能体生态" },
          { dim: "治理模式", old: "规则引擎+人工标注", new: "AI驱动自动化，智能标注" },
        ],
      },
      capabilities: [
        { name: "融合开发能力", desc: "多源多模态数据集成与AI工程化", subs: "数据集成、数据开发、模型训推、智能数据治理、Agent开发" },
        { name: "平台架构能力", desc: "湖仓一体、AI原生新型架构", subs: "Unity Catalog/Format/Processing、存算分离、Data Fabric" },
        { name: "资源调度能力", desc: "CPU/GPU异构计算调度效率与成本控制", subs: "存算分离弹性扩展、资源隔离与稳定性" },
        { name: "智能原生能力", desc: "数据与AI的闭环互动深度与广度", subs: "AI-in-Lakehouse、低代码/自动化、智能体生态支持" },
        { name: "安全运营能力", desc: "高可用性、安全合规性与运维效率", subs: "数据隐私合规、加密审计、容灾高可用、TCO/ROI优化" },
      ],
      players: [
        {
          type: "智能应用厂商",
          tag: "场景快速落地",
          reps: "爱数、数新智能、数势、Dify等",
          features: ["围绕数据/AI场景做定制化服务和工具", "无体系化数据基础设施技术产品积累", "智能原生能力相对较强"],
          positioning: "聚集细分领域的专业类厂商",
          radar: "智能原生 > 融合开发 > 资源调度 > 平台架构 ≈ 安全运营",
        },
        {
          type: "数据平台厂商",
          tag: "大数据平台转型期",
          reps: "Snowflake、星环、明略科技、东方金信等",
          features: ["有较多大数据平台项目和客户积累", "处于融合AI能力的转型期，尚未形成Data&AI一体化产品", "缺少基础设施一体化建设的实施经验和案例"],
          positioning: "探索期",
          radar: "融合开发 ≈ 资源调度 > 平台架构 > 安全运营 > 智能原生",
        },
        {
          type: "专业平台厂商",
          tag: "先发优势 ⭐",
          reps: "Databricks（国际）、科杰科技（国内）",
          features: ["率先实现面向AI原生的Data&AI一体化基础设施软件成熟产品", "多个行业标杆案例，形成成熟方法论", "AI时代Data&AI一体化基础设施赛道取得先发优势"],
          positioning: "先发优势持续扩大",
          radar: "融合开发 ≈ 智能原生 > 平台架构 > 安全运营 > 资源调度",
          highlight: true,
        },
        {
          type: "综合平台厂商",
          tag: "品牌强但架构割裂",
          reps: "阿里云、华为、腾讯",
          features: ["丰富的产品线整合，品牌力强", "基于自研+收购构建端到端全栈能力", "核心短板：各模组分属不同团队，架构仍然割裂"],
          positioning: "品牌优势，但落地服务依赖三方",
          radar: "资源调度最强，各维度相对均衡",
        },
      ],
      scenarios: [
        {
          name: "大型国央企",
          pain: "数据孤岛严重、安全合规要求最严、数据统计时效性差",
          case: "中国石化 × 科杰科技：围绕勘探9大核心业务，构建统一数据资源目录，支撑61套业务系统用数服务",
          tag: "破解数据孤岛与安全合规",
        },
        {
          name: "大型金融企业",
          pain: "实时性不足、数据标准不统一、数字化能力难以规模化",
          case: "中信银行 × 科杰科技：构建「离线+实时+AI」三位一体数据底座，信贷审批响应时间压缩至分钟级",
          tag: "释放多模态数据价值",
        },
        {
          name: "跨国外企",
          pain: "多云/混合云异构数据源整合困难、全球统一治理vs各国数据主权合规",
          case: "亚洲头部零售集团 × 科杰科技：整合十大主题域近5年300+表100亿+条数据，核心报表响应速度提升10倍",
          tag: "本地化与国际化统一",
        },
        {
          name: "城市政府",
          pain: "行业标准缺失、中小企业AI技术门槛高、公共数据开放服务能力不足",
          case: "某市数据集团 × 科杰科技：构建「数联网+区块链+隐私保护计算+可信数据空间」全流程城市数据流通平台",
          tag: "打通数字化产业生态",
        },
      ],
      trends: [
        { title: "Data&AI一体化成不可逆的行业共识", desc: "全球领先厂商不约而同向Data&AI融合方向聚合，加速数据标注、治理等传统环节向AI原生的「智能数据工厂」演进" },
        { title: "Agentic AI提出「实时+多模态」双重要求", desc: "Gartner预测2028年至少15%日常工作决策由Agentic AI自主做出，数据生产质量将成为AI竞争力决定性变量" },
        { title: "专业平台厂商先发优势持续扩大", desc: "技术成熟+方法论沉淀+标杆案例的复合护城河，综合平台厂商因架构割裂存在结构性短板" },
        { title: "价值评估向「点-线-面-体」体系演进", desc: "五级价值评估模型与国家数据要素市场化政策框架高度契合，商业叙事需要从「技术能力」向「价值链条」升维" },
      ],
      strategicInsights: [
        { dim: "产品定位", current: "数智工厂（数据生产+模型生产）", benchmark: "智能应用厂商→专业平台厂商路径", suggestion: "明确Data&AI融合的产品战略叙事，避免停留在工具层" },
        { dim: "核心能力", current: "数据标注+模型训练全链路", benchmark: "与专业平台厂商融合开发能力对齐", suggestion: "重点投入AI辅助标注、智能质检、数据飞轮闭环" },
        { dim: "目标客群", current: "待明确", benchmark: "大型国央企、金融机构优先", suggestion: "以国央企勘探/制造场景为切入点，积累标杆案例" },
        { dim: "竞争壁垒", current: "行业数据积累+领域知识", benchmark: "方法论沉淀是关键", suggestion: "系统整理落地案例，形成可复制的行业解决方案" },
        { dim: "叙事升维", current: "功能层叙事", benchmark: "构建完整价值主张", suggestion: "构建「数据生产效率→模型质量提升→业务智能化→行业协同」的完整价值主张" },
      ],
    },
  ],
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
      "文本": ["去重", "空值填充", "格式标准化", "异常字符过滤", "长度截断", "乱码修复", "敏感信息脱敏", "HTML标签清除"],
      "图像": ["去重", "模糊过滤", "分辨率过滤", "亮度/对比度过滤", "格式转换", "尺寸归一化", "水印去除"],
      "视频": ["去重", "时长过滤", "画质过滤", "关键帧提取", "音视频分离", "格式转换"],
      "音频": ["去重", "时长过滤", "采样率转换", "噪声过滤", "静音检测", "格式转换"],
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
  const [activeSection, setActiveSection] = useState("intro");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [mrPerspective, setMrPerspective] = useState("national");

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
              {/* 产品介绍 */}
              {activeSection === "intro" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                  {/* 产品名称 & Slogan */}
                  <div style={{ padding: "28px 32px", background: "linear-gradient(135deg, #3b82f608 0%, #fff 100%)", border: "1px solid #3b82f620", borderRadius: 14 }}>
                    <h2 style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>
                      {PRODUCT_INTRO.name}
                    </h2>
                    <p style={{ fontSize: 16, color: "#3b82f6", fontWeight: 600, lineHeight: 1.6, marginBottom: 12 }}>
                      {PRODUCT_INTRO.slogan}
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {PRODUCT_INTRO.altSlogans.map((s, i) => (
                        <span key={i} style={{ fontSize: 11, color: "#64748b", padding: "4px 10px", background: "#f1f5f9", borderRadius: 4, border: "1px solid #e2e8f0" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 产品定位 */}
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 600, color: "#1e293b", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <Target size={18} style={{ color: "#3b82f6" }} /> 产品定位
                    </h3>
                    <div style={{ whiteSpace: "pre-wrap", fontSize: 14, color: "#475569", lineHeight: 1.8, padding: "18px 22px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                      {PRODUCT_INTRO.positioning}
                    </div>
                  </div>

                  {/* 面向人群 */}
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 600, color: "#1e293b", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <Users size={18} style={{ color: "#3b82f6" }} /> 面向人群
                    </h3>
                    <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr", gap: 0, padding: "10px 18px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600, color: "#64748b" }}>
                        <div>用户群体</div><div>核心诉求</div>
                      </div>
                      {PRODUCT_INTRO.audiences.map((a, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr", gap: 0, padding: "12px 18px", borderBottom: i < PRODUCT_INTRO.audiences.length - 1 ? "1px solid #f1f5f9" : "none", fontSize: 13 }}>
                          <div style={{ fontWeight: 500, color: "#1e293b" }}>{a.group}</div>
                          <div style={{ color: "#64748b" }}>{a.need}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 核心亮点 */}
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 600, color: "#1e293b", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <Sparkles size={18} style={{ color: "#3b82f6" }} /> 核心亮点
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                      {PRODUCT_INTRO.highlights.map((h, i) => {
                        const Icon = h.icon;
                        return (
                          <div key={i} style={{ padding: "20px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, borderLeft: `4px solid ${h.color}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${h.color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Icon size={18} style={{ color: h.color }} />
                              </div>
                              <span style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>{h.title}</span>
                            </div>
                            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{h.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 主要功能 */}
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 600, color: "#1e293b", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <Cpu size={18} style={{ color: "#3b82f6" }} /> 主要功能
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                      {PRODUCT_INTRO.mainFunctions.map((f, i) => (
                        <div key={i} style={{ padding: "18px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 10 }}>{f.title}</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {f.items.map((item, j) => (
                              <div key={j} style={{ fontSize: 12, color: "#64748b", paddingLeft: 10, position: "relative" }}>
                                <span style={{ position: "absolute", left: 0, color: "#3b82f6" }}>·</span>
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 解决痛点 */}
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 600, color: "#1e293b", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <TrendingUp size={18} style={{ color: "#3b82f6" }} /> 解决痛点
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                      {PRODUCT_INTRO.painPoints.map((p, i) => (
                        <div key={i} style={{ padding: "16px 20px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#ef4444", marginBottom: 6 }}>❌ {p.pain}</div>
                          <div style={{ fontSize: 12, color: "#10b981" }}>✅ {p.solution}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 价值收益 */}
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 600, color: "#1e293b", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <Activity size={18} style={{ color: "#3b82f6" }} /> 价值收益
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {PRODUCT_INTRO.valueBenefits.map((b, i) => (
                        <div key={i} style={{ padding: "18px 22px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, borderLeft: "4px solid #3b82f6" }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>{b.audience}</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {b.benefits.map((item, j) => (
                              <div key={j} style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>• {item}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 服务模式 */}
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 600, color: "#1e293b", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <Settings size={18} style={{ color: "#3b82f6" }} /> 服务模式
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                      {PRODUCT_INTRO.serviceModes.map((m, i) => (
                        <div key={i} style={{ padding: "20px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#3b82f6", marginBottom: 8 }}>{m.title}</div>
                          <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{m.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 一句话总结 */}
                  <div style={{ padding: "22px 28px", background: "linear-gradient(135deg, #3b82f610 0%, #3b82f605 100%)", border: "1.5px solid #3b82f630", borderRadius: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>一句话总结</div>
                    <div style={{ fontSize: 15, color: "#1e293b", lineHeight: 1.7, fontWeight: 500 }}>{PRODUCT_INTRO.summary}</div>
                  </div>
                </div>
              )}

              {/* 产品架构 */}
              {activeSection === "architecture" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <SectionTitle title="产品架构图" desc="从数据到模型到应用的全链路数据要素价值体系" color={currentModule.color} />
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", background: "#f0f4f8" }}>
                    <iframe
                      src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/architecture.html`}
                      style={{ width: "100%", height: "820px", border: "none", display: "block" }}
                      title="零数数智工厂产品架构图"
                    />
                  </div>
                </div>
              )}

              {/* 市场调研 */}
              {activeSection === "market-research" && (() => {
                const activePersp = MARKET_RESEARCH_CONTENT.perspectives.find(p => p.key === mrPerspective)!;
                const PerspIcon = activePersp.icon;
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                    {/* 视角切换 */}
                    <div style={{ display: "flex", gap: 10 }}>
                      {MARKET_RESEARCH_CONTENT.perspectives.map(p => {
                        const PIcon = p.icon;
                        return (
                          <button
                            key={p.key}
                            onClick={() => setMrPerspective(p.key)}
                            style={{
                              padding: "10px 22px",
                              fontSize: 14,
                              fontWeight: mrPerspective === p.key ? 700 : 500,
                              color: mrPerspective === p.key ? "#fff" : "#475569",
                              background: mrPerspective === p.key ? p.color : "#fff",
                              border: `1.5px solid ${mrPerspective === p.key ? p.color : "#e2e8f0"}`,
                              borderRadius: 8,
                              cursor: "pointer",
                              transition: "all 0.2s",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <PIcon size={16} />
                            {p.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* 核心论点 */}
                    <div style={{
                      padding: "20px 24px",
                      background: `linear-gradient(135deg, ${activePersp.color}08 0%, #fff 100%)`,
                      border: `1px solid ${activePersp.color}20`,
                      borderRadius: 12,
                      borderLeft: `4px solid ${activePersp.color}`,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        核心论点
                      </div>
                      <div style={{ fontSize: 15, color: "#1e293b", lineHeight: 1.8, fontWeight: 500 }}>
                        {activePersp.summary}
                      </div>
                    </div>

                    {/* ========== 国家视角内容 ========== */}
                    {mrPerspective === "national" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {activePersp.sections!.map((sec: any, i: number) => (
                          <div key={i} style={{
                            padding: "22px 26px",
                            background: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: 12,
                          }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                width: 26, height: 26, borderRadius: 6,
                                background: `${activePersp.color}12`, fontSize: 11, fontWeight: 700, color: activePersp.color,
                              }}>
                                {sec.id}
                              </span>
                              {sec.title}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                              <div style={{ padding: "14px 16px", background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca" }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", marginBottom: 6 }}>痛点与现状</div>
                                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>{sec.pain}</div>
                              </div>
                              <div style={{ padding: "14px 16px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", marginBottom: 6 }}>进展与突破</div>
                                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>{sec.progress}</div>
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", marginBottom: 8 }}>发展趋势</div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {sec.trends.map((t: string, j: number) => (
                                  <div key={j} style={{ fontSize: 12, color: "#475569", paddingLeft: 14, position: "relative" }}>
                                    <span style={{ position: "absolute", left: 0, color: "#3b82f6" }}>→</span>
                                    {t}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* 关键发现 */}
                        <div style={{
                          padding: "22px 26px",
                          background: "linear-gradient(135deg, #3b82f608 0%, #fff 100%)",
                          border: "1.5px solid #3b82f620",
                          borderRadius: 12,
                        }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                            <Sparkles size={16} style={{ color: "#3b82f6" }} /> 关键发现
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {activePersp.keyFindings!.map((f: string, i: number) => (
                              <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
                                <span style={{
                                  flexShrink: 0, width: 22, height: 22, borderRadius: 6,
                                  background: "#3b82f612", display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 11, fontWeight: 700, color: "#3b82f6",
                                }}>
                                  {i + 1}
                                </span>
                                {f}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ========== 玩家视角内容 ========== */}
                    {mrPerspective === "player" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

                        {/* 赛道定义 */}
                        <div style={{ padding: "24px 28px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12 }}>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                            <Target size={18} style={{ color: activePersp.color }} /> 赛道定义
                          </h3>
                          <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.8, marginBottom: 20 }}>
                            {activePersp.trackDefinition!.desc}
                          </p>

                          {/* 三阶段演进 */}
                          <h4 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 10 }}>范式演进</h4>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                            {activePersp.trackDefinition!.evolution.map((e: any, i: number) => (
                              <div key={i} style={{
                                padding: "16px",
                                background: i === 2 ? `${activePersp.color}08` : "#f8fafc",
                                border: i === 2 ? `1.5px solid ${activePersp.color}40` : "1px solid #e2e8f0",
                                borderRadius: 10,
                              }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: i === 2 ? activePersp.color : "#94a3b8", marginBottom: 8 }}>{e.stage}</div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                  <div style={{ fontSize: 12 }}><span style={{ color: "#64748b" }}>AI：</span><span style={{ color: "#1e293b", fontWeight: 500 }}>{e.ai}</span></div>
                                  <div style={{ fontSize: 12 }}><span style={{ color: "#64748b" }}>数据：</span><span style={{ color: "#1e293b", fontWeight: 500 }}>{e.data}</span></div>
                                  <div style={{ fontSize: 12 }}><span style={{ color: "#64748b" }}>设施：</span><span style={{ color: "#1e293b", fontWeight: 500 }}>{e.infra}</span></div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* 五维对比表 */}
                          <h4 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 10 }}>与传统大数据平台对比</h4>
                          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 1.8fr", gap: 0, padding: "10px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600, color: "#64748b" }}>
                              <div>对比维度</div><div>传统大数据平台</div><div>Data&AI数据基础设施</div>
                            </div>
                            {activePersp.trackDefinition!.diff.map((d: any, i: number) => (
                              <div key={i} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 1.8fr", gap: 0, padding: "12px 16px", borderBottom: i < activePersp.trackDefinition!.diff.length - 1 ? "1px solid #f1f5f9" : "none", fontSize: 13 }}>
                                <div style={{ fontWeight: 600, color: "#1e293b" }}>{d.dim}</div>
                                <div style={{ color: "#94a3b8" }}>{d.old}</div>
                                <div style={{ color: activePersp.color, fontWeight: 500 }}>{d.new}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 五大关键能力 */}
                        <div style={{ padding: "24px 28px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12 }}>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                            <Cpu size={18} style={{ color: activePersp.color }} /> 五大关键能力模型
                          </h3>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: 12 }}>
                            {activePersp.capabilities!.map((c: any, i: number) => (
                              <div key={i} style={{
                                padding: "16px 20px",
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: 10,
                                borderLeft: `4px solid ${activePersp.color}`,
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                  <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{c.name}</span>
                                  <span style={{ fontSize: 12, color: "#64748b" }}>— {c.desc}</span>
                                </div>
                                <div style={{ fontSize: 12, color: "#94a3b8", paddingLeft: 4 }}>{c.subs}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 四类玩家格局 */}
                        <div style={{ padding: "24px 28px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12 }}>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                            <Users size={18} style={{ color: activePersp.color }} /> 厂商格局：四类玩家
                          </h3>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                            {activePersp.players!.map((p: any, i: number) => (
                              <div key={i} style={{
                                padding: "20px",
                                background: p.highlight ? `${activePersp.color}06` : "#f8fafc",
                                border: p.highlight ? `1.5px solid ${activePersp.color}40` : "1px solid #e2e8f0",
                                borderRadius: 10,
                              }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{p.type}</div>
                                  <span style={{
                                    fontSize: 10, fontWeight: 700,
                                    padding: "3px 8px",
                                    background: p.highlight ? `${activePersp.color}15` : "#f1f5f9",
                                    color: p.highlight ? activePersp.color : "#64748b",
                                    borderRadius: 4,
                                  }}>
                                    {p.tag}
                                  </span>
                                </div>
                                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>代表：{p.reps}</div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
                                  {p.features.map((f: string, j: number) => (
                                    <div key={j} style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>• {f}</div>
                                  ))}
                                </div>
                                <div style={{ fontSize: 11, color: "#94a3b8", padding: "8px 10px", background: "#fff", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                                  能力雷达：{p.radar}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 典型应用场景 */}
                        <div style={{ padding: "24px 28px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12 }}>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                            <Layers size={18} style={{ color: activePersp.color }} /> 典型应用场景
                          </h3>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                            {activePersp.scenarios!.map((s: any, i: number) => (
                              <div key={i} style={{
                                padding: "18px 22px",
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: 10,
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                  <span style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{s.name}</span>
                                  <span style={{ fontSize: 10, padding: "2px 6px", background: `${activePersp.color}12`, color: activePersp.color, borderRadius: 4, fontWeight: 600 }}>{s.tag}</span>
                                </div>
                                <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 8 }}>痛点：{s.pain}</div>
                                <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6, padding: "10px 12px", background: "#fff", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                                  {s.case}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 行业趋势 */}
                        <div style={{ padding: "24px 28px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12 }}>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                            <TrendingUp size={18} style={{ color: activePersp.color }} /> 行业趋势研判
                          </h3>
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {activePersp.trends!.map((t: any, i: number) => (
                              <div key={i} style={{
                                padding: "16px 20px",
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: 10,
                                borderLeft: `4px solid ${activePersp.color}`,
                              }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                                  趋势{i + 1}：{t.title}
                                </div>
                                <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>{t.desc}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 零数战略启示 */}
                        <div style={{
                          padding: "24px 28px",
                          background: `linear-gradient(135deg, ${activePersp.color}08 0%, #fff 100%)`,
                          border: `1.5px solid ${activePersp.color}30`,
                          borderRadius: 12,
                        }}>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                            <Sparkles size={18} style={{ color: activePersp.color }} /> 对零数的战略启示
                          </h3>
                          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.2fr 1.8fr", gap: 0, padding: "10px 14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                              <div>维度</div><div>当前状态</div><div>竞争对标</div><div>战略建议</div>
                            </div>
                            {activePersp.strategicInsights!.map((s: any, i: number) => (
                              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.2fr 1.8fr", gap: 0, padding: "12px 14px", borderBottom: i < activePersp.strategicInsights!.length - 1 ? "1px solid #f1f5f9" : "none", fontSize: 12 }}>
                                <div style={{ fontWeight: 600, color: activePersp.color }}>{s.dim}</div>
                                <div style={{ color: "#64748b" }}>{s.current}</div>
                                <div style={{ color: "#94a3b8" }}>{s.benchmark}</div>
                                <div style={{ color: "#1e293b", fontWeight: 500 }}>{s.suggestion}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
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
