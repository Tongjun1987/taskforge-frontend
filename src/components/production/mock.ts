// Mock data for the Production Control Center views.
// Numbers are kept self-consistent across views (pipeline counts, task counts, output volume).

export const KPI = {
  runningPipelines: 3,
  totalPipelines: 6,
  pendingTasks: 47,
  todayOutput: "86.4",
  todayOutputUnit: "万条",
  avgCycle: "3.2",
  avgCycleUnit: "小时",
  resourceUsage: 68,
  alertCount: 7,
};

export const OUTPUT_TREND = {
  labels: ["09-27", "09-28", "09-29", "09-30", "10-01", "10-02", "10-03", "10-04", "10-05", "10-06", "10-07", "10-08", "10-09", "10-10"],
  byBusiness: [
    { name: "交通出行", color: "#4f46e5", data: [42, 48, 45, 52, 38, 30, 28, 44, 56, 61, 58, 63, 67, 72] },
    { name: "医疗健康", color: "#0ea5e9", data: [18, 20, 22, 19, 14, 11, 12, 20, 24, 26, 25, 28, 30, 32] },
    { name: "自然资源", color: "#14b8a6", data: [12, 14, 13, 15, 10, 8, 9, 13, 16, 18, 17, 19, 21, 23] },
  ],
  byPipelineType: [
    { name: "专家标注类", color: "#4f46e5", data: [38, 40, 42, 44, 30, 24, 22, 36, 45, 48, 47, 52, 55, 58] },
    { name: "智能标注类", color: "#8b5cf6", data: [22, 26, 24, 28, 20, 16, 15, 25, 30, 33, 32, 35, 38, 41] },
    { name: "数据清洗类", color: "#f59e0b", data: [14, 16, 15, 18, 12, 9, 10, 16, 19, 22, 21, 23, 25, 27] },
  ],
};

export const CAPACITY_PLAN = {
  monthTarget: 2600,
  monthActual: 1784,
  unit: "万条",
  weekTarget: [140, 150, 150, 160, 170],
  weekActual: [128, 139, 152, 146, 163],
  weekLabels: ["W1", "W2", "W3", "W4", "W5"],
};

export const PIPELINE_TYPE_DIST = [
  { label: "专家标注类", value: 2, color: "#4f46e5" },
  { label: "智能标注类", value: 2, color: "#8b5cf6" },
  { label: "数据清洗类", value: 1, color: "#f59e0b" },
  { label: "多模态融合类", value: 1, color: "#14b8a6" },
];

export type PipelineStatus = "running" | "queued" | "idle" | "error";

export const PIPELINES: {
  id: string;
  name: string;
  type: string;
  status: PipelineStatus;
  business: string;
  version: string;
  updatedAt: string;
  progress: number;
  currentNode: string;
  output: number;
  cycle: string;
  usage: number;
  alerts: number;
  nodes: {
    name: string;
    seconds: number;
    status: "done" | "running" | "waiting" | "error";
    ops: number;
    rules: number;
  }[];
}[] = [
  {
    id: "PL-1042",
    name: "交通事件识别数据生产线",
    type: "专家标注类",
    status: "running",
    business: "交通出行",
    version: "v2.3",
    updatedAt: "2026-10-09 18:20",
    progress: 72,
    currentNode: "专家标注",
    output: 28.6,
    cycle: "3.1 小时",
    usage: 76,
    alerts: 1,
    nodes: [
      { name: "数据接入", seconds: 42, status: "done", ops: 4, rules: 3 },
      { name: "数据清洗", seconds: 68, status: "done", ops: 7, rules: 5 },
      { name: "数据增强", seconds: 35, status: "done", ops: 6, rules: 4 },
      { name: "专家标注", seconds: 186, status: "running", ops: 3, rules: 8 },
      { name: "质量检验", seconds: 0, status: "waiting", ops: 5, rules: 6 },
      { name: "数据发布", seconds: 0, status: "waiting", ops: 2, rules: 3 },
    ],
  },
  {
    id: "PL-1043",
    name: "医疗影像病灶分割生产线",
    type: "智能标注类",
    status: "running",
    business: "医疗健康",
    version: "v1.8",
    updatedAt: "2026-10-08 11:05",
    progress: 54,
    currentNode: "智能预标注",
    output: 12.4,
    cycle: "4.6 小时",
    usage: 82,
    alerts: 2,
    nodes: [
      { name: "数据接入", seconds: 96, status: "done", ops: 4, rules: 3 },
      { name: "影像清洗", seconds: 74, status: "done", ops: 6, rules: 4 },
      { name: "智能预标注", seconds: 214, status: "running", ops: 3, rules: 6 },
      { name: "专家复核", seconds: 0, status: "waiting", ops: 2, rules: 5 },
      { name: "质量检验", seconds: 0, status: "waiting", ops: 5, rules: 6 },
    ],
  },
  {
    id: "PL-1044",
    name: "点云融合数据生产线",
    type: "多模态融合类",
    status: "running",
    business: "自然资源",
    version: "v3.1",
    updatedAt: "2026-10-07 16:40",
    progress: 88,
    currentNode: "质量检验",
    output: 21.8,
    cycle: "2.4 小时",
    usage: 64,
    alerts: 0,
    nodes: [
      { name: "多源接入", seconds: 58, status: "done", ops: 5, rules: 3 },
      { name: "点云清洗", seconds: 46, status: "done", ops: 6, rules: 4 },
      { name: "多模态融合", seconds: 132, status: "done", ops: 4, rules: 5 },
      { name: "质量检验", seconds: 39, status: "running", ops: 5, rules: 6 },
    ],
  },
  {
    id: "PL-1045",
    name: "文本问答增强生产线",
    type: "数据清洗类",
    status: "queued",
    business: "交通出行",
    version: "v1.2",
    updatedAt: "2026-10-05 09:30",
    progress: 0,
    currentNode: "排队中",
    output: 0,
    cycle: "--",
    usage: 0,
    alerts: 0,
    nodes: [
      { name: "文本清洗", seconds: 0, status: "waiting", ops: 6, rules: 5 },
      { name: "文本增强", seconds: 0, status: "waiting", ops: 5, rules: 4 },
      { name: "质量检验", seconds: 0, status: "waiting", ops: 5, rules: 6 },
      { name: "数据发布", seconds: 0, status: "waiting", ops: 2, rules: 3 },
    ],
  },
  {
    id: "PL-1046",
    name: "遥感地物分类生产线",
    type: "专家标注类",
    status: "idle",
    business: "自然资源",
    version: "v2.0",
    updatedAt: "2026-10-06 14:15",
    progress: 0,
    currentNode: "待启动",
    output: 0,
    cycle: "--",
    usage: 0,
    alerts: 0,
    nodes: [
      { name: "数据接入", seconds: 0, status: "waiting", ops: 4, rules: 3 },
      { name: "影像配准", seconds: 0, status: "waiting", ops: 5, rules: 4 },
      { name: "影像切片", seconds: 0, status: "waiting", ops: 4, rules: 3 },
      { name: "专家标注", seconds: 0, status: "waiting", ops: 3, rules: 8 },
      { name: "质量检验", seconds: 0, status: "waiting", ops: 5, rules: 6 },
      { name: "数据发布", seconds: 0, status: "waiting", ops: 2, rules: 3 },
    ],
  },
  {
    id: "PL-1047",
    name: "语音转写数据生产线",
    type: "智能标注类",
    status: "error",
    business: "交通出行",
    version: "v1.5",
    updatedAt: "2026-10-09 20:10",
    progress: 36,
    currentNode: "语音切分",
    output: 4.2,
    cycle: "--",
    usage: 12,
    alerts: 4,
    nodes: [
      { name: "数据接入", seconds: 31, status: "done", ops: 4, rules: 3 },
      { name: "语音切分", seconds: 22, status: "error", ops: 5, rules: 4 },
      { name: "转写标注", seconds: 0, status: "waiting", ops: 3, rules: 7 },
    ],
  },
];

export const RESOURCE_POOLS = [
  { id: "pool-gpu-a", name: "GPU 训练池 A", kind: "GPU", total: "8 卡 A100 80G", used: 6, pct: 75, status: "running" },
  { id: "pool-gpu-b", name: "GPU 推理池 B", kind: "GPU", total: "8 卡 A30 24G", used: 4, pct: 50, status: "running" },
  { id: "pool-cpu-c", name: "通用计算池 C", kind: "CPU", total: "512 核 / 2.0 TB", used: 296, pct: 58, status: "running" },
  { id: "pool-node-d", name: "边缘节点池 D", kind: "MIXED", total: "4 节点 / 64 核", used: 12, pct: 19, status: "idle" },
];

export const RESOURCE_METRICS = [
  { label: "GPU 卡数", value: "16", unit: "卡", pct: 63, tone: "#4f46e5" },
  { label: "CPU 核数", value: "512", unit: "核", pct: 58, tone: "#0ea5e9" },
  { label: "内存总量", value: "2.0", unit: "TB", pct: 61, tone: "#14b8a6" },
  { label: "存储容量", value: "48", unit: "TB", pct: 44, tone: "#8b5cf6" },
];

export const SCHEDULE_POLICIES = [
  { id: "p1", name: "优先队列", desc: "按优先级从高到低依次调度，同级先到先服务", on: true, tag: "已启用" },
  { id: "p2", name: "资源配额", desc: "每条产线限定 CPU/GPU 上限，防止资源占满", on: true, tag: "已启用" },
  { id: "p3", name: "抢占策略", desc: "高优先级任务可抢占低优先级任务的资源", on: false, tag: "未启用" },
  { id: "p4", name: "弹性扩容", desc: "队列积压超过阈值时自动扩容节点", on: false, tag: "未启用" },
];

export const QUEUE_TASKS = [
  { id: "T-2041", name: "文本问答增强·批次 7", priority: "高", wait: "12 分钟", pipeline: "PL-1045", demand: "1 GPU / 16 核" },
  { id: "T-2042", name: "文本问答增强·批次 8", priority: "中", wait: "8 分钟", pipeline: "PL-1045", demand: "1 GPU / 16 核" },
  { id: "T-2045", name: "语音转写·重试", priority: "高", wait: "3 分钟", pipeline: "PL-1047", demand: "2 GPU / 32 核" },
  { id: "T-2048", name: "遥感分类·预热", priority: "低", wait: "1 分钟", pipeline: "PL-1046", demand: "1 GPU / 8 核" },
];

export const DISPATCH_LOGS = [
  { time: "14:52:31", action: "调度", pipeline: "PL-1043", detail: "分配 2 卡 A100 至智能预标注节点", level: "info" },
  { time: "14:48:07", action: "抢占", pipeline: "PL-1042", detail: "高优先级任务 T-2039 抢占 T-2031 的 1 卡 GPU", level: "warn" },
  { time: "14:41:20", action: "释放", pipeline: "PL-1044", detail: "融合节点完成，释放 32 核 CPU / 96 GB 内存", level: "info" },
  { time: "14:36:55", action: "排队", pipeline: "PL-1045", detail: "任务 T-2041 进入等待队列（前方 2 个任务）", level: "info" },
  { time: "14:30:12", action: "异常", pipeline: "PL-1047", detail: "语音切分节点 OOM，已回收资源并标记失败", level: "error" },
  { time: "14:22:40", action: "扩容", pipeline: "-", detail: "池 C 自动扩容 +1 节点（8 核 / 32 GB）", level: "info" },
];

export type AlertLevel = "critical" | "warning" | "info";

export const ALERT_RULES = [
  { id: "R-01", kind: "阈值类", name: "GPU 利用率持续 > 90%", target: "全部产线", level: "critical" as AlertLevel, on: true, hits: 12 },
  { id: "R-02", kind: "阈值类", name: "节点耗时 > 基线 2 倍", target: "全部产线", level: "warning" as AlertLevel, on: true, hits: 23 },
  { id: "R-03", kind: "业务类", name: "标注一致性 < 92%", target: "专家标注类产线", level: "warning" as AlertLevel, on: true, hits: 8 },
  { id: "R-04", kind: "业务类", name: "质检通过率 < 95%", target: "全部产线", level: "critical" as AlertLevel, on: true, hits: 5 },
  { id: "R-05", kind: "代码类", name: "算子执行抛异常", target: "清洗 / 增强节点", level: "critical" as AlertLevel, on: true, hits: 3 },
  { id: "R-06", kind: "代码类", name: "节点超时自动重试失败", target: "全部节点", level: "warning" as AlertLevel, on: true, hits: 6 },
  { id: "R-07", kind: "阈值类", name: "队列积压 > 20 个任务", target: "调度器", level: "info" as AlertLevel, on: false, hits: 0 },
];

export const ALERTS: {
  id: string;
  level: AlertLevel;
  source: string;
  pipeline: string;
  content: string;
  time: string;
  status: "待处理" | "处理中" | "已闭环";
}[] = [
  { id: "A-3091", level: "critical", source: "GPU 利用率", pipeline: "PL-1043", content: "医疗影像产线 GPU 利用率连续 25 分钟超 92%", time: "14:47", status: "待处理" },
  { id: "A-3090", level: "critical", source: "算子执行", pipeline: "PL-1047", content: "语音切分算子 OOM，任务已中止", time: "14:30", status: "处理中" },
  { id: "A-3088", level: "warning", source: "节点耗时", pipeline: "PL-1042", content: "专家标注节点耗时 186s，超基线 1.8 倍", time: "14:26", status: "处理中" },
  { id: "A-3086", level: "warning", source: "标注一致性", pipeline: "PL-1042", content: "专家标注一致性 91.2%，低于阈值 92%", time: "14:12", status: "待处理" },
  { id: "A-3084", level: "info", source: "队列积压", pipeline: "PL-1045", content: "待处理任务达 4 个，建议扩容或降低优先级", time: "13:58", status: "待处理" },
  { id: "A-3081", level: "info", source: "资源释放", pipeline: "PL-1044", content: "融合节点完成，资源已释放", time: "13:41", status: "已闭环" },
  { id: "A-3079", level: "warning", source: "质检通过率", pipeline: "PL-1046", content: "上一批次质检通过率 93.4%，低于 95% 阈值", time: "11:20", status: "已闭环" },
];

export const ALERT_TREND = [
  { label: "10-04", severe: 1, warn: 4, info: 6 },
  { label: "10-05", severe: 2, warn: 5, info: 8 },
  { label: "10-06", severe: 0, warn: 3, info: 5 },
  { label: "10-07", severe: 1, warn: 6, info: 7 },
  { label: "10-08", severe: 3, warn: 7, info: 9 },
  { label: "10-09", severe: 2, warn: 5, info: 8 },
  { label: "10-10", severe: 2, warn: 5, info: 9 },
];

export const NOTIFY_CHANNELS = [
  { id: "c1", name: "站内通知", desc: "平台右上角弹窗与消息中心", on: true, scope: "全部级别" },
  { id: "c2", name: "移动端（企微）", desc: "推送至负责人企业微信", on: true, scope: "严重 / 告警" },
  { id: "c3", name: "邮件通知", desc: "发送至运维组邮箱", on: false, scope: "严重" },
];

export const REPORT_TEMPLATES = [
  { id: "rt-1", name: "生产运营报表", desc: "产线产出量、任务数量、平均生产周期、对比同比", icon: "chart", tone: "#4f46e5" },
  { id: "rt-2", name: "资源利用率报表", desc: "GPU/CPU/内存利用率趋势、排队时长、抢占次数", icon: "cpu", tone: "#0ea5e9" },
  { id: "rt-3", name: "质量趋势报表", desc: "各模块质量通过率、异常率、标注一致性变化", icon: "shield", tone: "#16a34a" },
  { id: "rt-4", name: "成本核算表", desc: "单样本成本、算力成本、人工成本、预算执行率", icon: "coin", tone: "#f59e0b" },
];

// 报表：period = 周期类型（每日/每周/每月），periodValue = 所属周期（具体日期 / 起止日期 / 年月）
export const REPORTS = [
  // ---- 日报 ----
  { id: "RP-20261020-01", name: "生产运营日报", type: "生产运营报表", period: "每日", periodValue: "2026-10-20", generated: "2026-10-20 08:00", status: "已生成", size: "1.1 MB" },
  { id: "RP-20261020-02", name: "资源利用日报", type: "资源利用率报表", period: "每日", periodValue: "2026-10-20", generated: "2026-10-20 07:30", status: "已生成", size: "392 KB" },
  { id: "RP-20261020-03", name: "质量趋势日报", type: "质量趋势报表", period: "每日", periodValue: "2026-10-20", generated: "2026-10-20 08:10", status: "已生成", size: "860 KB" },
  { id: "RP-20261020-04", name: "成本核算日报", type: "成本核算表", period: "每日", periodValue: "2026-10-20", generated: "2026-10-20 09:00", status: "已生成", size: "420 KB" },
  { id: "RP-20261019-01", name: "生产运营日报", type: "生产运营报表", period: "每日", periodValue: "2026-10-19", generated: "2026-10-19 08:00", status: "已生成", size: "1.0 MB" },
  { id: "RP-20261019-02", name: "资源利用日报", type: "资源利用率报表", period: "每日", periodValue: "2026-10-19", generated: "2026-10-19 07:30", status: "已生成", size: "376 KB" },
  { id: "RP-20261019-03", name: "质量趋势日报", type: "质量趋势报表", period: "每日", periodValue: "2026-10-19", generated: "2026-10-19 08:10", status: "已生成", size: "842 KB" },
  { id: "RP-20261019-04", name: "成本核算日报", type: "成本核算表", period: "每日", periodValue: "2026-10-19", generated: "2026-10-19 09:00", status: "已生成", size: "408 KB" },
  { id: "RP-20261018-01", name: "生产运营日报", type: "生产运营报表", period: "每日", periodValue: "2026-10-18", generated: "2026-10-18 08:00", status: "已生成", size: "0.9 MB" },
  { id: "RP-20261018-02", name: "资源利用日报", type: "资源利用率报表", period: "每日", periodValue: "2026-10-18", generated: "2026-10-18 07:30", status: "已生成", size: "365 KB" },
  { id: "RP-20261018-03", name: "质量趋势日报", type: "质量趋势报表", period: "每日", periodValue: "2026-10-18", generated: "2026-10-18 08:10", status: "已生成", size: "815 KB" },
  { id: "RP-20261018-04", name: "成本核算日报", type: "成本核算表", period: "每日", periodValue: "2026-10-18", generated: "2026-10-18 09:00", status: "已生成", size: "402 KB" },
  // ---- 周报 ----
  { id: "RP-20261019-11", name: "生产运营周报", type: "生产运营报表", period: "每周", periodValue: "2026-10-12 ~ 2026-10-18", generated: "2026-10-19 08:00", status: "已生成", size: "1.6 MB" },
  { id: "RP-20261019-12", name: "资源利用周报", type: "资源利用率报表", period: "每周", periodValue: "2026-10-12 ~ 2026-10-18", generated: "2026-10-19 07:40", status: "已生成", size: "780 KB" },
  { id: "RP-20261019-13", name: "质量趋势周报", type: "质量趋势报表", period: "每周", periodValue: "2026-10-12 ~ 2026-10-18", generated: "2026-10-19 08:20", status: "生成中", size: "--" },
  { id: "RP-20261012-11", name: "生产运营周报", type: "生产运营报表", period: "每周", periodValue: "2026-10-05 ~ 2026-10-11", generated: "2026-10-12 08:00", status: "已生成", size: "1.5 MB" },
  { id: "RP-20261012-12", name: "资源利用周报", type: "资源利用率报表", period: "每周", periodValue: "2026-10-05 ~ 2026-10-11", generated: "2026-10-12 07:40", status: "已生成", size: "742 KB" },
  { id: "RP-20261012-13", name: "质量趋势周报", type: "质量趋势报表", period: "每周", periodValue: "2026-10-05 ~ 2026-10-11", generated: "2026-10-12 08:20", status: "已生成", size: "1.2 MB" },
  // ---- 月报 ----
  { id: "RP-20261001-21", name: "生产运营月报", type: "生产运营报表", period: "每月", periodValue: "2026-09", generated: "2026-10-01 08:30", status: "已生成", size: "3.2 MB" },
  { id: "RP-20261001-22", name: "质量趋势月报", type: "质量趋势报表", period: "每月", periodValue: "2026-09", generated: "2026-10-01 09:00", status: "已生成", size: "2.4 MB" },
  { id: "RP-20261001-23", name: "成本核算月报", type: "成本核算表", period: "每月", periodValue: "2026-09", generated: "2026-10-01 09:20", status: "已生成", size: "1.9 MB" },
  { id: "RP-20260901-21", name: "生产运营月报", type: "生产运营报表", period: "每月", periodValue: "2026-08", generated: "2026-09-01 08:30", status: "已生成", size: "3.0 MB" },
  { id: "RP-20260901-22", name: "质量趋势月报", type: "质量趋势报表", period: "每月", periodValue: "2026-08", generated: "2026-09-01 09:00", status: "已生成", size: "2.2 MB" },
  { id: "RP-20260901-23", name: "成本核算月报", type: "成本核算表", period: "每月", periodValue: "2026-08", generated: "2026-09-01 09:20", status: "已生成", size: "1.8 MB" },
];

export const REPORT_SCHEDULES = [
  { id: "s1", report: "生产运营报表", period: "每周一 08:00", channels: "站内 + 邮件", receivers: "生产运营组（3 人）", on: true },
  { id: "s2", report: "资源利用率报表", period: "每日 07:30", channels: "站内", receivers: "运维组（2 人）", on: true },
  { id: "s3", report: "质量趋势报表", period: "每月 1 日 09:00", channels: "站内 + 邮件", receivers: "质量委员会（5 人）", on: true },
  { id: "s4", report: "成本核算表", period: "每月 1 日 09:00", channels: "邮件", receivers: "财务 / 产品（4 人）", on: false },
];

// Process component library for the pipeline editor
export const OP_COMPONENTS: { group: string; tone: string; items: { id: string; name: string; ops: number; desc: string }[] }[] = [
  {
    group: "数据接入",
    tone: "#0ea5e9",
    items: [
      { id: "c-in-1", name: "文件 / 对象存储接入", ops: 6, desc: "支持 LOCAL / S3 / OSS" },
      { id: "c-in-2", name: "数据库接入", ops: 5, desc: "MySQL / PG / Mongo / ES" },
      { id: "c-in-3", name: "消息队列接入", ops: 2, desc: "Kafka 实时接入" },
    ],
  },
  {
    group: "数据清洗",
    tone: "#4f46e5",
    items: [
      { id: "c-cl-1", name: "图像清洗算子组", ops: 10, desc: "模糊 / 水印 / 尺寸过滤" },
      { id: "c-cl-2", name: "文本清洗算子组", ops: 40, desc: "去噪 / 去重 / 规范化" },
      { id: "c-cl-3", name: "视频清洗算子组", ops: 13, desc: "时长 / 帧率 / 水印过滤" },
      { id: "c-cl-4", name: "多模态清洗算子组", ops: 6, desc: "图文对齐 / 模态一致性" },
    ],
  },
  {
    group: "数据增强",
    tone: "#8b5cf6",
    items: [
      { id: "c-aug-1", name: "图像增强算子组", ops: 18, desc: "旋转 / 裁切 / 色彩变换" },
      { id: "c-aug-2", name: "文本增强算子组", ops: 22, desc: "改写 / 扩写 / 翻译" },
      { id: "c-aug-3", name: "模态转换", ops: 5, desc: "DICOM → JPG，ULog → 时序特征" },
    ],
  },
  {
    group: "标注与质检",
    tone: "#14b8a6",
    items: [
      { id: "c-an-1", name: "专家标注模板", ops: 77, desc: "图像 / 文本 / 语音 / 点云" },
      { id: "c-an-2", name: "智能标注模板", ops: 62, desc: "ML Backend 预标注" },
      { id: "c-an-3", name: "质量检验规则组", ops: 275, desc: "完整性 / 一致性 / 准确性" },
    ],
  },
  {
    group: "融合与输出",
    tone: "#f59e0b",
    items: [
      { id: "c-fu-1", name: "多源融合", ops: 8, desc: "多模态对齐与合并" },
      { id: "c-fu-2", name: "发布输出", ops: 4, desc: "受管数据集发布" },
      { id: "c-fu-3", name: "版本快照", ops: 3, desc: "数据集快照与回滚" },
    ],
  },
];

// ===== 产线节点模型（编排画布 / 模板库共用）=====
export type PipeNode = {
  id: string;
  name: string;
  group: string;
  tone: string;
  ops: number;
  desc: string;
  rules: string[]; // 引用的规则模板 id
  res: { gpu: number; mem: number; prio: "高" | "中" | "低" };
};

// 城市治理 · 交通事件识别高质量数据集产线（PL-2011）
// 一条真实可运行的产线：视频接入 → 抽帧 → 清洗 → 检测预标注 → 跟踪 → 行为 → 事件 → 构建 → 质检 → 发布
export const TRAFFIC_PIPELINE = {
  id: "PL-2011",
  name: "交通事件识别高质量数据集产线",
  version: "v1.2",
  scene: "城市治理 · 交通事件识别",
  dataset: "交通事件识别高质量数据集 v3",
  target: "12 万条事件片段 · 6 类事件 · COCO + MP4 切片",
  sla: "单批次 ≤ 4 小时 · 质检一次通过率 ≥ 95%",
  owner: "王工 · 数据生产组",
  updatedAt: "2026-10-18 17:20",
  resource: { gpu: 2, gpuType: "A100 40G", cpu: 32, mem: 128, pool: "GPU 训练池 A", exclusive: false },
  nodes: [
    { id: "t1", name: "城市道路视频接入", group: "数据接入", tone: "#0ea5e9", ops: 6, desc: "6 路卡口 RTSP + 离线 MP4", rules: ["RUL-FL-001", "RUL-FL-002", "RUL-FL-003"], res: { gpu: 0, mem: 8, prio: "中" } },
    { id: "t2", name: "关键帧抽帧", group: "抽帧与清洗", tone: "#06b6d4", ops: 3, desc: "25 帧间隔 + 场景切换触发", rules: ["RUL-DP-001", "RUL-FL-005"], res: { gpu: 0, mem: 8, prio: "中" } },
    { id: "t3", name: "视频清洗", group: "抽帧与清洗", tone: "#4f46e5", ops: 13, desc: "去水印 / 脱敏 / 分辨率归一", rules: ["RUL-DP-002", "RUL-DP-003", "RUL-DP-005", "RUL-FL-006"], res: { gpu: 0, mem: 16, prio: "中" } },
    { id: "t4", name: "目标检测预标注", group: "检测与跟踪", tone: "#7c3aed", ops: 62, desc: "YOLOv8 · 12 类交通目标", rules: ["RUL-AN-001", "RUL-QC-005"], res: { gpu: 1, mem: 24, prio: "高" } },
    { id: "t5", name: "多目标跟踪", group: "检测与跟踪", tone: "#8b5cf6", ops: 9, desc: "ByteTrack 轨迹关联与补全", rules: ["RUL-AN-003"], res: { gpu: 1, mem: 16, prio: "高" } },
    { id: "t6", name: "交通行为识别", group: "语义识别", tone: "#14b8a6", ops: 18, desc: "逆行 / 违停 / 闯红灯等 6 类", rules: ["RUL-AN-002"], res: { gpu: 1, mem: 16, prio: "高" } },
    { id: "t7", name: "事件识别与融合", group: "语义识别", tone: "#0d9488", ops: 11, desc: "行为 + 轨迹融合判定事件等级", rules: ["RUL-AN-002", "RUL-TL-003"], res: { gpu: 0, mem: 8, prio: "高" } },
    { id: "t8", name: "高质量数据集构建", group: "数据集构建", tone: "#f59e0b", ops: 7, desc: "8:1:1 划分 + 去重 + 几何增强", rules: ["RUL-DP-004", "RUL-DP-006", "RUL-TL-001", "RUL-TL-002", "RUL-DL-003"], res: { gpu: 0, mem: 8, prio: "中" } },
    { id: "t9", name: "质量检验", group: "质量检验", tone: "#f97316", ops: 275, desc: "六维校验 + 抽检 + 超时告警", rules: ["RUL-QC-001", "RUL-QC-002", "RUL-QC-003", "RUL-QC-004", "RUL-QC-006", "RUL-QC-007"], res: { gpu: 0, mem: 8, prio: "中" } },
    { id: "t10", name: "版本发布", group: "交付发布", tone: "#16a34a", ops: 4, desc: "COCO + MP4 + 质检报告", rules: ["RUL-DL-001", "RUL-DL-002", "RUL-DL-004", "RUL-DL-005", "RUL-DL-006", "RUL-QC-008"], res: { gpu: 0, mem: 4, prio: "低" } },
  ] as PipeNode[],
};

const genNodes = (names: string[], tone: string, ops = 8): PipeNode[] =>
  names.map((n, i) => ({
    id: `g${i + 1}`,
    name: n,
    group: "工序",
    tone,
    ops,
    desc: "模板内置工序节点",
    rules: [],
    res: { gpu: i >= 2 && i <= 4 ? 1 : 0, mem: 16, prio: "中" as const },
  }));

// ===== 4.2.2-3 产线模板库 =====
export type PipelineTemplate = {
  id: string;
  name: string;
  desc: string;
  scene: string;
  version: string;
  owner: string;
  updatedAt: string;
  nodes: number;
  ruleCount: number;
  used: number;
  tone: string;
  chain: string[];
  nodeList: PipeNode[];
  source: string;
};

export const PIPELINE_TEMPLATES: PipelineTemplate[] = [
  {
    id: "pt-1",
    name: "交通事件识别高质量数据集产线",
    desc: "城市道路视频接入 → 抽帧 → 清洗 → 检测预标注 → 跟踪 → 行为 → 事件 → 构建 → 质检 → 发布，含 32 条规则引用",
    scene: "城市治理 · 交通事件识别",
    version: "v1.2",
    owner: "王工",
    updatedAt: "2026-10-18 17:20",
    nodes: 10,
    ruleCount: 32,
    used: 6,
    tone: "#4f46e5",
    chain: ["视频接入", "抽帧", "清洗", "检测预标注", "跟踪", "行为识别", "事件融合", "数据集构建", "质检", "发布"],
    nodeList: TRAFFIC_PIPELINE.nodes,
    source: "PL-2011",
  },
  {
    id: "pt-2",
    name: "通用数据清洗模板",
    desc: "接入 → 图像/文本清洗 → 去重 → 质检 → 发布，适合作为产线前段标准件",
    scene: "通用 · 清洗类",
    version: "v2.0",
    owner: "李工",
    updatedAt: "2026-09-28 10:05",
    nodes: 6,
    ruleCount: 8,
    used: 14,
    tone: "#0ea5e9",
    chain: ["接入", "图像清洗", "文本清洗", "去重", "质检", "发布"],
    nodeList: genNodes(["接入", "图像清洗", "文本清洗", "去重", "质检", "发布"], "#0ea5e9", 10),
    source: "PL-1003",
  },
  {
    id: "pt-3",
    name: "图像数据标注模板",
    desc: "接入 → 图像清洗 → 智能预标注 → 专家复核 → 发布，标注类产线的最小闭环",
    scene: "通用 · 图像标注",
    version: "v1.8",
    owner: "张工",
    updatedAt: "2026-10-08 09:40",
    nodes: 7,
    ruleCount: 11,
    used: 22,
    tone: "#14b8a6",
    chain: ["接入", "图像清洗", "预标注", "专家复核", "抽检", "质检", "发布"],
    nodeList: genNodes(["接入", "图像清洗", "预标注", "专家复核", "抽检", "质检", "发布"], "#14b8a6", 12),
    source: "PL-1008",
  },
  {
    id: "pt-4",
    name: "多模态数据融合模板",
    desc: "多源接入 → 各模态清洗 → 时空对齐 → 融合 → 质检，适合视频 + 雷达 + 文本联合标注",
    scene: "通用 · 多模态",
    version: "v1.3",
    owner: "赵工",
    updatedAt: "2026-09-19 15:12",
    nodes: 8,
    ruleCount: 14,
    used: 9,
    tone: "#8b5cf6",
    chain: ["多源接入", "视频清洗", "点云清洗", "文本清洗", "时空对齐", "融合", "质检", "发布"],
    nodeList: genNodes(["多源接入", "视频清洗", "点云清洗", "文本清洗", "时空对齐", "融合", "质检", "发布"], "#8b5cf6", 9),
    source: "PL-1015",
  },
  {
    id: "pt-5",
    name: "文本数据增强模板",
    desc: "文本接入 → 清洗 → 增强扩写 → 质检 → 发布，适合低资源语料扩充",
    scene: "通用 · 文本增强",
    version: "v1.1",
    owner: "陈工",
    updatedAt: "2026-08-30 11:26",
    nodes: 5,
    ruleCount: 7,
    used: 17,
    tone: "#f59e0b",
    chain: ["文本接入", "清洗", "增强扩写", "质检", "发布"],
    nodeList: genNodes(["文本接入", "清洗", "增强扩写", "质检", "发布"], "#f59e0b", 11),
    source: "PL-1022",
  },
];

// Node metrics used by the task tracking drawer
export const TASK_TRACKING = {
  nodeCost: [
    { name: "数据接入", seconds: 42, tone: "#0ea5e9" },
    { name: "数据清洗", seconds: 68, tone: "#4f46e5" },
    { name: "数据增强", seconds: 35, tone: "#8b5cf6" },
    { name: "专家标注", seconds: 186, tone: "#14b8a6" },
    { name: "质量检验", seconds: 0, tone: "#94a3b8" },
    { name: "数据发布", seconds: 0, tone: "#94a3b8" },
  ],
  resource: {
    labels: ["0m", "5m", "10m", "15m", "20m", "25m", "30m"],
    cpu: [18, 46, 62, 58, 66, 71, 64],
    gpu: [0, 22, 48, 52, 61, 68, 60],
    ram: [24, 38, 52, 49, 55, 58, 54],
  },
  history: [
    { run: "#3", start: "2026-10-10 14:02", duration: "3h 08m", output: "286,420", status: "运行中" },
    { run: "#2", start: "2026-10-09 09:15", duration: "3h 42m", output: "301,884", status: "已完成" },
    { run: "#1", start: "2026-10-08 08:40", duration: "5h 21m", output: "198,260", status: "已失败" },
  ],
  failureArchive: [
    {
      run: "#1",
      category: "问题数据",
      reason: "输入集中 1,204 条标注缺失 bbox，导致校验节点中止",
      advice: "建议在清洗节点后接一个「空标注过滤」算子，并对该批数据重新跑一次质检",
    },
    {
      run: "#1",
      category: "代码问题",
      reason: "增强算子 image_rotate 在旋转后未重建标注坐标映射",
      advice: "已更新算子至 v1.3.2（修复坐标变换），重试后已通过",
    },
  ],
};

export const TASK_PRIORITIES = ["紧急", "高", "中", "低"];
export const TASK_SCHEDULES = ["单次执行", "每小时", "每天", "每周", "每月"];

// ===== 4.2.1-1 任务创建：输入数据源（对接的具体数据源实例，而非接入方式） =====
export interface TaskInputSource {
  id: string;
  name: string;
  type: string;      // 接入方式
  location: string;  // 具体地址 / 表名 / topic
  scale: string;     // 当前数据量
  syncedAt: string;  // 最近同步时间
}

export const TASK_INPUT_SOURCES: TaskInputSource[] = [
  { id: "src-traffic-road", name: "城市道路图像库", type: "对象存储 S3", location: "s3://ls-prod/traffic/road-2026Q3", scale: "128,400 张", syncedAt: "10-19 09:12" },
  { id: "src-highway-cap", name: "高速卡口抓拍集", type: "平台数据集", location: "数据集 ds-20260918-014", scale: "86,200 张", syncedAt: "10-18 22:40" },
  { id: "src-ticket-text", name: "工单文本库", type: "关系型数据库 MySQL", location: "10.20.3.17:3306 / ops.ticket", scale: "412,900 条", syncedAt: "10-19 08:00" },
  { id: "src-device-telemetry", name: "设备遥测流", type: "消息队列 Kafka", location: "mq-prod:9092 / topic-device-telemetry", scale: "实时流", syncedAt: "实时接入" },
  { id: "src-sensor-ts", name: "产线传感器时序库", type: "时序数据库 InfluxDB", location: "influx-prod / line_sensor_mm", scale: "2,140 万点", syncedAt: "10-19 09:15" },
  { id: "src-annotation-return", name: "标注结果回传目录", type: "本地文件 SFTP", location: "/data/annotation/return/2026-10", scale: "23,700 个文件", syncedAt: "10-19 07:30" },
  { id: "src-thirdparty-api", name: "第三方标注接口", type: "API 接口", location: "api.labelsvc.internal/v1/tasks", scale: "按需拉取", syncedAt: "10-19 06:50" },
];

export const TASK_OUTPUT_TARGETS = [
  "高质量数据集",
  "标注数据集",
  "模型仓库",
  "评测报告",
  "数据服务接口",
];

export const TASK_PROCESS_STEPS = [
  "采集",
  "清洗",
  "脱敏",
  "增强",
  "标注",
  "质检",
  "融合",
  "发布",
];

// ===== 4.2.1-2 任务跟踪 =====
export type RunStatus = "running" | "paused" | "queued" | "success" | "failed";

export const RUN_STATUS: Record<RunStatus, { label: string; tone: string; soft: string }> = {
  running: { label: "执行中", tone: "#4f46e5", soft: "#eef2ff" },
  paused: { label: "已暂停", tone: "#f59e0b", soft: "#fffbeb" },
  queued: { label: "排队中", tone: "#0ea5e9", soft: "#f0f9ff" },
  success: { label: "已完成", tone: "#16a34a", soft: "#f0fdf4" },
  failed: { label: "执行失败", tone: "#dc2626", soft: "#fef2f2" },
};

export const TASK_RUNS: {
  id: string;
  taskId: string;   // 关联的任务（一个任务可有多次运行）
  name: string;
  scene: string;
  pipeline: string;
  priority: string;
  schedule: string;
  status: RunStatus;
  progress: number;
  nodeNow: string;
  nodesDone: number;
  nodesTotal: number;
  elapsed: string;
  cpu: number;
  gpu: number;
  ram: number;
  startedAt: string;
}[] = [
  {
    id: "RUN-2001",
    taskId: "task-4",
    name: "交通事件识别·图像预处理",
    scene: "交通事件识别",
    pipeline: "PL-1042 交通事件识别数据生产线",
    priority: "高",
    schedule: "每天",
    status: "running",
    progress: 68,
    nodeNow: "数据增强",
    nodesDone: 2,
    nodesTotal: 6,
    elapsed: "1 小时 12 分",
    cpu: 62,
    gpu: 78,
    ram: 54,
    startedAt: "2026-10-10 09:20",
  },
  {
    id: "RUN-2002",
    taskId: "task-3",
    name: "交通事件识别·专家标注",
    scene: "交通事件识别",
    pipeline: "PL-1042 交通事件识别数据生产线",
    priority: "紧急",
    schedule: "单次执行",
    status: "running",
    progress: 41,
    nodeNow: "专家标注",
    nodesDone: 3,
    nodesTotal: 6,
    elapsed: "2 小时 46 分",
    cpu: 38,
    gpu: 22,
    ram: 41,
    startedAt: "2026-10-10 07:50",
  },
  {
    id: "RUN-2003",
    taskId: "task-1",
    name: "医疗影像病灶·智能预标注",
    scene: "医疗影像病灶检测",
    pipeline: "PL-1043 医疗影像病灶分割生产线",
    priority: "高",
    schedule: "每周",
    status: "running",
    progress: 54,
    nodeNow: "智能预标注",
    nodesDone: 2,
    nodesTotal: 5,
    elapsed: "3 小时 05 分",
    cpu: 44,
    gpu: 82,
    ram: 63,
    startedAt: "2026-10-10 06:40",
  },
  {
    id: "RUN-2004",
    taskId: "task-2",
    name: "点云融合·质量检验",
    scene: "多源点云融合",
    pipeline: "PL-1044 点云融合数据生产线",
    priority: "中",
    schedule: "每天",
    status: "success",
    progress: 100,
    nodeNow: "已完成",
    nodesDone: 4,
    nodesTotal: 4,
    elapsed: "2 小时 24 分",
    cpu: 51,
    gpu: 46,
    ram: 48,
    startedAt: "2026-10-10 02:10",
  },
  {
    id: "RUN-2005",
    taskId: "task-5",
    name: "文本问答·数据增强",
    scene: "政务问答语料生产",
    pipeline: "PL-1045 文本问答增强生产线",
    priority: "低",
    schedule: "每月",
    status: "queued",
    progress: 0,
    nodeNow: "排队等待资源",
    nodesDone: 0,
    nodesTotal: 4,
    elapsed: "等待 12 分",
    cpu: 0,
    gpu: 0,
    ram: 0,
    startedAt: "--",
  },
  {
    id: "RUN-2006",
    taskId: "task-6",
    name: "语音转写·音频切分",
    scene: "语音转写语料生产",
    pipeline: "PL-1047 语音转写数据生产线",
    priority: "中",
    schedule: "单次执行",
    status: "paused",
    progress: 36,
    nodeNow: "语音切分",
    nodesDone: 1,
    nodesTotal: 3,
    elapsed: "48 分（已暂停 22 分）",
    cpu: 12,
    gpu: 8,
    ram: 19,
    startedAt: "2026-10-10 15:02",
  },
  {
    id: "RUN-2007",
    taskId: "task-7",
    name: "遥感地物·专家标注",
    scene: "遥感地物分类",
    pipeline: "PL-1046 遥感地物分类生产线",
    priority: "中",
    schedule: "每周",
    status: "failed",
    progress: 82,
    nodeNow: "质量检验",
    nodesDone: 4,
    nodesTotal: 6,
    elapsed: "4 小时 51 分",
    cpu: 28,
    gpu: 31,
    ram: 36,
    startedAt: "2026-10-09 21:30",
  },
];

// 运行批次 ↔ 产线快照映射
// 批次一旦产生即冻结在当时那一版产线上，产线后续改版不影响历史批次；
// PIPELINES.version 是产线「当前」版本，这里记录该批次「当时」使用的版本。
export const RUN_PIPELINE: Record<string, { pipelineId: string; version: string }> = {
  "RUN-2001": { pipelineId: "PL-1042", version: "v2.3" },
  "RUN-2002": { pipelineId: "PL-1042", version: "v2.2" },
  "RUN-2003": { pipelineId: "PL-1043", version: "v1.8" },
  "RUN-2004": { pipelineId: "PL-1044", version: "v3.1" },
  "RUN-2005": { pipelineId: "PL-1045", version: "v1.2" },
  "RUN-2006": { pipelineId: "PL-1047", version: "v1.5" },
  "RUN-2007": { pipelineId: "PL-1046", version: "v2.0" },
};

// ===== 4.2.2 单个任务下的产线（一个任务可装配多条产线）=====
export const TASK_PIPELINES: {
  id: string;
  name: string;
  goal: string;
  status: PipelineStatus;
  version: string;
  resource: string;
  dataset: string;
  nodes: { name: string; tone: string; ops: number }[];
  rules: string[];
  updatedAt: string;
}[] = [
  {
    id: "PL-1042-01",
    name: "图像预处理产线",
    goal: "把原始交通影像清洗、增强为可标注的样本集",
    status: "running",
    version: "v1.4",
    resource: "GPU 训练池 A",
    dataset: "交通事件原始影像集",
    nodes: [
      { name: "文件接入", tone: "#0ea5e9", ops: 6 },
      { name: "图像清洗", tone: "#4f46e5", ops: 10 },
      { name: "图像增强", tone: "#8b5cf6", ops: 18 },
      { name: "质量检验", tone: "#f59e0b", ops: 275 },
      { name: "样本输出", tone: "#16a34a", ops: 4 },
    ],
    rules: ["数据筛选", "质检规则"],
    updatedAt: "2026-10-10 09:20",
  },
  {
    id: "PL-1042-02",
    name: "专家标注产线",
    goal: "对预处理后的样本做人工标注与仲裁复核",
    status: "running",
    version: "v2.1",
    resource: "通用计算池 C",
    dataset: "交通事件预处理样本集",
    nodes: [
      { name: "样本接入", tone: "#0ea5e9", ops: 3 },
      { name: "任务分层", tone: "#4f46e5", ops: 3 },
      { name: "专家标注", tone: "#14b8a6", ops: 77 },
      { name: "仲裁复核", tone: "#8b5cf6", ops: 12 },
      { name: "质量检验", tone: "#f59e0b", ops: 275 },
      { name: "交付输出", tone: "#16a34a", ops: 4 },
    ],
    rules: ["任务分层", "标注模板", "人员分配", "质检规则", "交付标准"],
    updatedAt: "2026-10-10 07:50",
  },
  {
    id: "PL-1042-03",
    name: "智能预标注产线",
    goal: "用 ML Backend 批量预标注，再由人工校正提速",
    status: "queued",
    version: "v0.9",
    resource: "GPU 推理池 B",
    dataset: "交通事件预处理样本集",
    nodes: [
      { name: "样本接入", tone: "#0ea5e9", ops: 3 },
      { name: "模型预标注", tone: "#8b5cf6", ops: 62 },
      { name: "人工校正", tone: "#14b8a6", ops: 18 },
      { name: "质量检验", tone: "#f59e0b", ops: 275 },
    ],
    rules: ["标注模板", "质检规则"],
    updatedAt: "2026-10-09 18:30",
  },
];

// ===== 4.2.2-2 规则模板库（能力型规则库，可在产线编排的节点上引用）=====
// 规则按「能力类别」组织，而不是按产线环节组织：同一类规则可以被不同工序的节点引用。
// 其中「标注模板 / 数据处理 / 质检规则」三类直接对齐平台已有能力：
//   标注模板  ← 数据生产 · 专家标注（标注模板库）
//   数据处理  ← 数据生产 · 数据清洗 / 数据增强（算子库）
//   质检规则  ← 数据质量管理（规则模块）
export type RuleStage = {
  key: string;
  name: string;
  desc: string;
  tone: string;
  source: string;
};

export const RULE_STAGES: RuleStage[] = [
  {
    key: "filter",
    name: "数据筛选",
    desc: "入线前的来源合规与样本准入筛选，不满足条件的样本直接拦截，不进入后续算力环节",
    tone: "#0ea5e9",
    source: "平台预置 · 可扩展为数据源准入策略",
  },
  {
    key: "layer",
    name: "任务分层",
    desc: "按难度、价值与人力把样本或任务分级，决定派发顺序、抽检比例与仲裁配置",
    tone: "#4f46e5",
    source: "数据生产 · 专家标注（任务分层与派发）",
  },
  {
    key: "annot",
    name: "标注模板",
    desc: "引用专家标注模板库中的标注形态（矩形框 / 多边形 / 关键点 / 轨迹 / 转写），决定标注产物的结构与字段",
    tone: "#14b8a6",
    source: "数据生产 · 专家标注（标注模板库，32 个模板）",
  },
  {
    key: "proc",
    name: "数据处理",
    desc: "引用数据清洗与数据增强算子，定义帧级处理、去重、脱敏与样本扩充方式，算子参数随产线版本固化",
    tone: "#8b5cf6",
    source: "数据生产 · 数据清洗 / 数据增强（算子库，181 + 15 个算子）",
  },
  {
    key: "qc",
    name: "质检规则",
    desc: "引用数据质量管理中的规则模块，按完整性 / 唯一性 / 一致性 / 及时性 / 准确性 / 规范性六维校验",
    tone: "#f97316",
    source: "数据质量管理 · 规则模块",
  },
  {
    key: "deliver",
    name: "交付标准",
    desc: "交付格式、字段规范、划分比例与随附材料，作为数据集验收与发布的依据",
    tone: "#16a34a",
    source: "数据流通 · 受管数据集发布",
  },
];

export type RuleTemplate = {
  id: string;
  stage: string;
  name: string;
  type: "阈值" | "范围" | "枚举" | "脚本" | "模板" | "算子";
  summary: string;
  params: { k: string; v: string }[];
  applies: string;
  version: string;
  owner: string;
  usedBy: string[];
  on: boolean;
};

export const RULE_TEMPLATES: RuleTemplate[] = [
  // ---------- 1. 数据筛选 ----------
  {
    id: "RUL-FL-001",
    stage: "filter",
    name: "视频源合规白名单",
    type: "枚举",
    summary: "只允许交警支队已登记的卡口视频接入，未授权来源在接入环节直接阻断并留痕。",
    params: [{ k: "授权来源", v: "交警支队卡口" }, { k: "接入协议", v: "RTSP / 离线 MP4" }],
    applies: "视频接入 / 文件接入",
    version: "v1.2",
    owner: "王工 · 数据治理",
    usedBy: ["PL-2011 · 城市道路视频接入", "PL-1008 · 样本接入"],
    on: true,
  },
  {
    id: "RUL-FL-002",
    stage: "filter",
    name: "片段时长下限",
    type: "阈值",
    summary: "单片段短于 30 秒直接剔除，避免抽帧后缺少事件前后文。",
    params: [{ k: "时长", v: ">= 30 s" }],
    applies: "视频接入",
    version: "v1.1",
    owner: "王工 · 数据治理",
    usedBy: ["PL-2011 · 城市道路视频接入"],
    on: true,
  },
  {
    id: "RUL-FL-003",
    stage: "filter",
    name: "接入码率区间",
    type: "范围",
    summary: "码率低于 2 Mbps 的流判定为劣质源，转人工确认后再入线。",
    params: [{ k: "码率", v: "2 - 20 Mbps" }],
    applies: "视频接入",
    version: "v1.0",
    owner: "刘工 · 运维",
    usedBy: ["PL-2011 · 城市道路视频接入"],
    on: true,
  },
  {
    id: "RUL-FL-004",
    stage: "filter",
    name: "分辨率下限",
    type: "阈值",
    summary: "低于 1080p 的画面不进入检测流程，防止小目标无法标注。",
    params: [{ k: "分辨率", v: ">= 1920 x 1080" }],
    applies: "视频接入 / 图像接入",
    version: "v1.2",
    owner: "李工 · 数据质量",
    usedBy: ["PL-1003 · 图像清洗", "PL-1015 · 视频清洗"],
    on: true,
  },
  {
    id: "RUL-FL-005",
    stage: "filter",
    name: "抽帧清晰度准入",
    type: "阈值",
    summary: "Laplacian 方差低于 100 的帧判为模糊，抽帧阶段直接丢弃，避免下游重复标注。",
    params: [{ k: "Laplacian", v: "< 100 剔除" }],
    applies: "关键帧抽帧 / 图像清洗",
    version: "v1.2",
    owner: "李工 · 数据质量",
    usedBy: ["PL-2011 · 关键帧抽帧"],
    on: true,
  },
  {
    id: "RUL-FL-006",
    stage: "filter",
    name: "重复片段剔除",
    type: "阈值",
    summary: "同一卡口 10 分钟内画面相似度达到 0.98 视为重复片段，只保留最早一段。",
    params: [{ k: "相似度", v: ">= 0.98" }, { k: "时间窗", v: "10 min" }],
    applies: "视频清洗",
    version: "v1.1",
    owner: "李工 · 数据质量",
    usedBy: ["PL-2011 · 视频清洗"],
    on: true,
  },
  // ---------- 2. 任务分层 ----------
  {
    id: "RUL-TL-001",
    stage: "layer",
    name: "难度分级规则",
    type: "枚举",
    summary: "按目标密度、遮挡比例与光照条件把样本分为简单 / 中等 / 困难三级，分级结果决定派发队列。",
    params: [{ k: "分级", v: "简单 / 中等 / 困难" }, { k: "判据", v: "密度 + 遮挡 + 光照" }],
    applies: "任务分层 / 数据集构建",
    version: "v1.3",
    owner: "张工 · 标注运营",
    usedBy: ["PL-2011 · 高质量数据集构建", "PL-1008 · 任务分层"],
    on: true,
  },
  {
    id: "RUL-TL-002",
    stage: "layer",
    name: "分层抽检比例",
    type: "枚举",
    summary: "困难样本 100% 复核、中等 30%、简单 10%，在保证质量的前提下控制人工成本。",
    params: [{ k: "困难", v: "100%" }, { k: "中等", v: "30%" }, { k: "简单", v: "10%" }],
    applies: "任务分层 / 质量检验",
    version: "v1.2",
    owner: "李工 · 数据质量",
    usedBy: ["PL-2011 · 高质量数据集构建", "PL-1008 · 抽检"],
    on: true,
  },
  {
    id: "RUL-TL-003",
    stage: "layer",
    name: "高价值样本优先",
    type: "脚本",
    summary: "稀有类别与重度事件样本自动提级派发，优先占用标注产能，避免长尾类别长期不足。",
    params: [{ k: "提级条件", v: "稀有类别 / 重度事件" }, { k: "提级幅度", v: "+1 级" }],
    applies: "任务分层 / 事件识别与融合",
    version: "v1.1",
    owner: "赵工 · 算法",
    usedBy: ["PL-2011 · 事件识别与融合"],
    on: true,
  },
  {
    id: "RUL-TL-004",
    stage: "layer",
    name: "标注员技能匹配",
    type: "枚举",
    summary: "按技能标签匹配派单，交通场景图像标注任务只派给通过对应考核的标注员。",
    params: [{ k: "技能标签", v: "交通场景 · 图像标注" }, { k: "准入门槛", v: "考核 ≥ 90 分" }],
    applies: "人员分配",
    version: "v1.2",
    owner: "张工 · 标注运营",
    usedBy: ["PL-1008 · 人员分配"],
    on: true,
  },
  {
    id: "RUL-TL-005",
    stage: "layer",
    name: "单人日工时上限",
    type: "阈值",
    summary: "单个标注员每日标注工时不超过 6 小时，超出后自动停止派单，防止疲劳导致质量下滑。",
    params: [{ k: "上限", v: "6 h / 天" }],
    applies: "人员分配",
    version: "v1.0",
    owner: "张工 · 标注运营",
    usedBy: ["PL-1008 · 人员分配"],
    on: true,
  },
  {
    id: "RUL-TL-006",
    stage: "layer",
    name: "双盲与仲裁配置",
    type: "枚举",
    summary: "关键类别采用双人独立标注，分歧样本进入仲裁；每 10 名标注员配置 1 名仲裁员。",
    params: [{ k: "标注模式", v: "双盲" }, { k: "仲裁比例", v: "1 : 10" }],
    applies: "专家标注 / 仲裁复核",
    version: "v1.2",
    owner: "李工 · 数据质量",
    usedBy: ["PL-1008 · 专家标注", "PL-2011 · 质量检验"],
    on: true,
  },
  // ---------- 3. 标注模板（对齐专家标注模板库）----------
  {
    id: "RUL-AN-001",
    stage: "annot",
    name: "图像目标检测模板",
    type: "模板",
    summary: "矩形框标注，覆盖 Car / Bus / Truck / Pedestrian / Cyclist 等 12 类交通目标，输出 COCO bbox。",
    params: [{ k: "标注形态", v: "矩形框" }, { k: "类别数", v: "12" }, { k: "输出", v: "COCO bbox" }],
    applies: "目标检测预标注 / 专家标注",
    version: "v2.0",
    owner: "张工 · 算法",
    usedBy: ["PL-2011 · 目标检测预标注", "PL-1008 · 专家标注"],
    on: true,
  },
  {
    id: "RUL-AN-002",
    stage: "annot",
    name: "视频事件片段模板",
    type: "模板",
    summary: "以「起止时间 + 事件类别 + 事件等级」描述一段事件，支持前后各 5 秒上下文切片。",
    params: [{ k: "标注形态", v: "时间区间" }, { k: "上下文", v: "前后 5 s" }, { k: "等级", v: "轻 / 中 / 重" }],
    applies: "交通行为识别 / 事件融合",
    version: "v1.6",
    owner: "赵工 · 算法",
    usedBy: ["PL-2011 · 交通行为识别", "PL-2011 · 事件识别与融合"],
    on: true,
  },
  {
    id: "RUL-AN-003",
    stage: "annot",
    name: "多目标跟踪模板",
    type: "模板",
    summary: "为每个目标分配 track_id 并跨帧关联，标注轨迹起止帧、遮挡标记与 ID 切换点。",
    params: [{ k: "标注形态", v: "轨迹 + ID" }, { k: "最短轨迹", v: "15 帧" }],
    applies: "多目标跟踪 / 专家复核",
    version: "v1.4",
    owner: "张工 · 算法",
    usedBy: ["PL-2011 · 多目标跟踪"],
    on: true,
  },
  {
    id: "RUL-AN-004",
    stage: "annot",
    name: "语义分割模板（多边形）",
    type: "模板",
    summary: "多边形勾勒可行驶区域、车道线与积水区，输出掩码 PNG + 多边形坐标两套结果。",
    params: [{ k: "标注形态", v: "多边形" }, { k: "输出", v: "Mask + Polygon" }],
    applies: "专家标注 / 预标注",
    version: "v1.3",
    owner: "陈工 · 平台",
    usedBy: [],
    on: true,
  },
  {
    id: "RUL-AN-005",
    stage: "annot",
    name: "关键点骨架模板",
    type: "模板",
    summary: "行人 17 关键点骨架标注，用于摔倒、翻越护栏等行为的细粒度判定。",
    params: [{ k: "关键点数", v: "17" }, { k: "对称校验", v: "开启" }],
    applies: "专家标注",
    version: "v1.1",
    owner: "陈工 · 平台",
    usedBy: [],
    on: true,
  },
  {
    id: "RUL-AN-006",
    stage: "annot",
    name: "OCR 文本行模板",
    type: "模板",
    summary: "车牌、交通标志牌文本行标注，四点框定位 + 文本内容 + 置信度，支持倾斜文本框。",
    params: [{ k: "标注形态", v: "四点框" }, { k: "字段", v: "文本 / 置信度" }],
    applies: "专家标注 / 审核",
    version: "v1.2",
    owner: "陈工 · 平台",
    usedBy: [],
    on: true,
  },
  {
    id: "RUL-AN-007",
    stage: "annot",
    name: "语音转写模板",
    type: "模板",
    summary: "接警录音逐句转写，标注说话人、时间戳与关键要素（地点 / 事件 / 车辆），用于事件文本对齐。",
    params: [{ k: "标注形态", v: "逐句转写" }, { k: "字段", v: "说话人 / 时间戳 / 要素" }],
    applies: "专家标注 · 语音",
    version: "v1.0",
    owner: "周工 · 标注运营",
    usedBy: [],
    on: true,
  },
  {
    id: "RUL-AN-008",
    stage: "annot",
    name: "3D 点云框模板",
    type: "模板",
    summary: "激光雷达 8 维框（中心点 / 尺寸 / 朝向）标注，与视频目标做时空对齐后联合入集。",
    params: [{ k: "标注形态", v: "3D Box" }, { k: "维度", v: "8 维" }],
    applies: "专家标注 · 点云",
    version: "v1.1",
    owner: "赵工 · 算法",
    usedBy: [],
    on: true,
  },
  // ---------- 4. 数据处理（对齐清洗 / 增强算子库）----------
  {
    id: "RUL-DP-001",
    stage: "proc",
    name: "关键帧抽帧算子",
    type: "算子",
    summary: "按固定间隔抽帧并叠加场景切换补抽，输出帧序列与原始时间戳映射。",
    params: [{ k: "算子", v: "video_frame_extract" }, { k: "间隔", v: "每 25 帧" }, { k: "补抽", v: "直方图差 > 0.35" }],
    applies: "关键帧抽帧",
    version: "v1.3",
    owner: "王工 · 数据生产",
    usedBy: ["PL-2011 · 关键帧抽帧", "PL-1015 · 视频抽帧"],
    on: true,
  },
  {
    id: "RUL-DP-002",
    stage: "proc",
    name: "视频去水印算子",
    type: "算子",
    summary: "裁剪固定水印与角标区域，避免台标、时间戳被误检为交通目标。",
    params: [{ k: "算子", v: "video_watermark_remover" }, { k: "区域", v: "底部 12% / 右上角" }],
    applies: "视频清洗",
    version: "v1.1",
    owner: "李工 · 数据质量",
    usedBy: ["PL-2011 · 视频清洗"],
    on: true,
  },
  {
    id: "RUL-DP-003",
    stage: "proc",
    name: "分辨率归一算子",
    type: "算子",
    summary: "统一缩放到 1920x1080 并保持宽高比，避免不同卡口分辨率差异影响检测效果。",
    params: [{ k: "算子", v: "video_resize_resolution_mapper" }, { k: "目标", v: "1920 x 1080" }],
    applies: "视频清洗",
    version: "v1.2",
    owner: "李工 · 数据质量",
    usedBy: ["PL-2011 · 视频清洗"],
    on: true,
  },
  {
    id: "RUL-DP-004",
    stage: "proc",
    name: "图像去重算子",
    type: "算子",
    summary: "感知哈希比对近重复图像，相似度达到阈值只保留最早一帧，降低训练集冗余。",
    params: [{ k: "算子", v: "image_deduplicator" }, { k: "相似度", v: ">= 0.95" }],
    applies: "数据集构建",
    version: "v1.4",
    owner: "李工 · 数据质量",
    usedBy: ["PL-2011 · 高质量数据集构建", "PL-1003 · 去重"],
    on: true,
  },
  {
    id: "RUL-DP-005",
    stage: "proc",
    name: "敏感信息脱敏算子",
    type: "算子",
    summary: "自动检测并模糊人脸与车牌，输出脱敏映射表，满足数据出域前的合规要求。",
    params: [{ k: "算子", v: "image_face_blur_mapper + plate_blur" }, { k: "映射表", v: "随数据集归档" }],
    applies: "视频清洗 / 数据集构建",
    version: "v1.2",
    owner: "刘工 · 合规",
    usedBy: ["PL-2011 · 视频清洗"],
    on: true,
  },
  {
    id: "RUL-DP-006",
    stage: "proc",
    name: "图像几何增强算子",
    type: "算子",
    summary: "随机旋转、裁切与水平翻转，标注框随变换同步重算，用于扩充小样本场景。",
    params: [{ k: "算子", v: "image_rotate / image_crop / image_flip" }, { k: "旋转", v: "±15°" }],
    applies: "数据增强 / 数据集构建",
    version: "v1.3",
    owner: "赵工 · 算法",
    usedBy: ["PL-2011 · 高质量数据集构建"],
    on: true,
  },
  {
    id: "RUL-DP-007",
    stage: "proc",
    name: "色彩光照增强算子",
    type: "算子",
    summary: "亮度、对比度与色彩抖动组合增强，提升模型对逆光与夜间场景的适应能力。",
    params: [{ k: "算子", v: "image_brightness / image_contrast" }, { k: "强度", v: "0.8 - 1.2" }],
    applies: "数据增强",
    version: "v1.1",
    owner: "赵工 · 算法",
    usedBy: [],
    on: true,
  },
  {
    id: "RUL-DP-008",
    stage: "proc",
    name: "恶劣天气模拟算子",
    type: "算子",
    summary: "叠加雨、雾与夜间光照效果，定向补足低照度与恶劣天气样本。",
    params: [{ k: "算子", v: "weather_simulate" }, { k: "类型", v: "雨 / 雾 / 夜间" }],
    applies: "数据增强",
    version: "v0.9",
    owner: "赵工 · 算法",
    usedBy: [],
    on: false,
  },
  {
    id: "RUL-DP-009",
    stage: "proc",
    name: "文本改写扩写算子",
    type: "算子",
    summary: "对事件描述与工单文本做同义改写与扩写，扩充低资源语料，保留事件要素不被改写。",
    params: [{ k: "算子", v: "text_rephrase / text_expand" }, { k: "保真约束", v: "要素不得变更" }],
    applies: "数据增强 · 文本",
    version: "v1.0",
    owner: "周工 · 标注运营",
    usedBy: [],
    on: true,
  },
  {
    id: "RUL-DP-010",
    stage: "proc",
    name: "模态转换算子",
    type: "算子",
    summary: "按需做模态转换（DICOM→JPG、ULog→时序特征），转换后同步更新元数据与标注坐标。",
    params: [{ k: "算子", v: "mapping_converter" }, { k: "元数据", v: "同步更新" }],
    applies: "数据处理 · 多模态",
    version: "v1.0",
    owner: "陈工 · 平台",
    usedBy: [],
    on: false,
  },
  // ---------- 5. 质检规则（对齐质量管理规则模块）----------
  {
    id: "RUL-QC-001",
    stage: "qc",
    name: "完整性校验",
    type: "阈值",
    summary: "必填字段与标注框完整率低于 98% 判该批次不合格，整批退回重标。",
    params: [{ k: "维度", v: "完整性" }, { k: "完整率", v: ">= 98%" }],
    applies: "质量检验",
    version: "v1.5",
    owner: "李工 · 数据质量",
    usedBy: ["PL-2011 · 质量检验", "PL-1008 · 抽检"],
    on: true,
  },
  {
    id: "RUL-QC-002",
    stage: "qc",
    name: "唯一性校验",
    type: "阈值",
    summary: "按 video_id + frame_id 校验主键唯一，重复记录必须为 0 才允许进入发布。",
    params: [{ k: "维度", v: "唯一性" }, { k: "重复记录", v: "= 0" }],
    applies: "质量检验 / 数据集构建",
    version: "v1.4",
    owner: "李工 · 数据质量",
    usedBy: ["PL-2011 · 质量检验"],
    on: true,
  },
  {
    id: "RUL-QC-003",
    stage: "qc",
    name: "一致性校验 IoU",
    type: "阈值",
    summary: "双人标注一致性 IoU 低于 0.85 的样本进入仲裁，仲裁后仍不达标则回流重标。",
    params: [{ k: "维度", v: "一致性" }, { k: "IoU", v: ">= 0.85" }],
    applies: "质量检验",
    version: "v1.5",
    owner: "李工 · 数据质量",
    usedBy: ["PL-2011 · 质量检验", "PL-1008 · 抽检", "PL-1015 · 融合质检"],
    on: true,
  },
  {
    id: "RUL-QC-004",
    stage: "qc",
    name: "准确性抽查",
    type: "阈值",
    summary: "按类别分层抽样核对标注准确率，事件类别准确率不得低于 97%。",
    params: [{ k: "维度", v: "准确性" }, { k: "准确率", v: ">= 97%" }],
    applies: "质量检验",
    version: "v1.3",
    owner: "李工 · 数据质量",
    usedBy: ["PL-2011 · 质量检验", "PL-1008 · 抽检"],
    on: true,
  },
  {
    id: "RUL-QC-005",
    stage: "qc",
    name: "规范性校验",
    type: "脚本",
    summary: "校验 bbox 是否越界、类别是否在字典内、坐标是否为数值，任一不通过即阻断向下游传递。",
    params: [{ k: "维度", v: "规范性" }, { k: "越界框", v: "= 0" }, { k: "类别字典", v: "12 类白名单" }],
    applies: "质量检验 / 目标检测预标注",
    version: "v1.4",
    owner: "陈工 · 平台",
    usedBy: ["PL-2011 · 质量检验", "PL-2011 · 目标检测预标注"],
    on: true,
  },
  {
    id: "RUL-QC-006",
    stage: "qc",
    name: "及时性校验",
    type: "阈值",
    summary: "单批次产出超出 SLA（4 小时）触发超时告警，并按队列优先级重新排期。",
    params: [{ k: "维度", v: "及时性" }, { k: "SLA", v: "<= 4 h" }],
    applies: "质量检验 / 运行监控",
    version: "v1.1",
    owner: "刘工 · 运维",
    usedBy: ["PL-2011 · 质量检验"],
    on: true,
  },
  {
    id: "RUL-QC-007",
    stage: "qc",
    name: "抽检比例",
    type: "枚举",
    summary: "按 10% 随机抽检，重度事件样本 100% 全检，抽检结果回写质量报告。",
    params: [{ k: "抽检", v: "10% 随机" }, { k: "重度事件", v: "100% 全检" }],
    applies: "质量检验",
    version: "v1.4",
    owner: "李工 · 数据质量",
    usedBy: ["PL-2011 · 质量检验", "PL-1008 · 抽检"],
    on: true,
  },
  {
    id: "RUL-QC-008",
    stage: "qc",
    name: "不合格样本回流",
    type: "枚举",
    summary: "不合格样本回流至目标检测预标注，单样本最多重试 2 次，仍不合格转人工处理。",
    params: [{ k: "回流至", v: "目标检测预标注" }, { k: "重试上限", v: "2 次" }],
    applies: "质量检验 / 版本发布",
    version: "v1.3",
    owner: "李工 · 数据质量",
    usedBy: ["PL-2011 · 版本发布"],
    on: true,
  },
  // ---------- 6. 交付标准 ----------
  {
    id: "RUL-DL-001",
    stage: "deliver",
    name: "交付格式",
    type: "枚举",
    summary: "标注走 COCO JSON，视频按事件切片输出 MP4，两者 ID 一一对应。",
    params: [{ k: "标注", v: "COCO JSON" }, { k: "视频", v: "MP4 切片" }],
    applies: "版本发布",
    version: "v1.2",
    owner: "王工 · 数据生产",
    usedBy: ["PL-2011 · 版本发布", "PL-1008 · 发布"],
    on: true,
  },
  {
    id: "RUL-DL-002",
    stage: "deliver",
    name: "字段规范",
    type: "枚举",
    summary: "统一字段命名，保证下游训练侧可直接消费，无需二次转换。",
    params: [{ k: "字段", v: "video_id / frame_id / track_id / category_id / bbox / event_level" }],
    applies: "版本发布",
    version: "v1.2",
    owner: "陈工 · 平台",
    usedBy: ["PL-2011 · 版本发布", "PL-1015 · 融合发布"],
    on: true,
  },
  {
    id: "RUL-DL-003",
    stage: "deliver",
    name: "数据划分比例",
    type: "枚举",
    summary: "按 8:1:1 划分训练 / 验证 / 测试集，固定随机种子保证批次间可复现。",
    params: [{ k: "划分", v: "8 : 1 : 1" }, { k: "随机种子", v: "42" }],
    applies: "数据集构建 / 版本发布",
    version: "v1.2",
    owner: "王工 · 数据生产",
    usedBy: ["PL-2011 · 高质量数据集构建", "PL-1008 · 数据集输出"],
    on: true,
  },
  {
    id: "RUL-DL-004",
    stage: "deliver",
    name: "随附质检报告",
    type: "枚举",
    summary: "每次发布自动生成 PDF 质检报告与指标看板，作为验收依据随数据集归档。",
    params: [{ k: "报告", v: "PDF + 指标看板" }],
    applies: "版本发布",
    version: "v1.1",
    owner: "李工 · 数据质量",
    usedBy: ["PL-2011 · 版本发布", "PL-1015 · 融合发布"],
    on: true,
  },
  {
    id: "RUL-DL-005",
    stage: "deliver",
    name: "版本与校验清单",
    type: "脚本",
    summary: "按语义版本打标，发布时生成文件清单与 SHA256 校验值，支持按版本回溯与增量下发。",
    params: [{ k: "版本规则", v: "主.次.修订" }, { k: "校验", v: "SHA256 manifest" }],
    applies: "版本发布",
    version: "v1.0",
    owner: "陈工 · 平台",
    usedBy: ["PL-2011 · 版本发布"],
    on: true,
  },
  {
    id: "RUL-DL-006",
    stage: "deliver",
    name: "数据集元数据登记",
    type: "枚举",
    summary: "发布时登记数据集卡：来源、许可、规模、更新频率、责任人与联系方式，进入数据目录可检索。",
    params: [{ k: "登记项", v: "来源 / 许可 / 规模 / 频率" }, { k: "目录", v: "数据资产目录" }],
    applies: "版本发布 / 数据流通",
    version: "v1.1",
    owner: "刘工 · 合规",
    usedBy: ["PL-2011 · 版本发布"],
    on: true,
  },
];
