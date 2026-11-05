// 数据发布中心 —— 演示数据（纯前端，刷新不变）
// 数据模型以「数据集」为聚合根：元信息、质量报告、血缘、版本、权限均挂在该数据集下，
// 对应界面为 数据集管理（列表）→ 数据集详情（多 Tab）+ 封装模板（平台预置资产库）。

export const INDUSTRIES = ["智慧交通", "应急管理", "医疗健康", "智能制造", "城市治理", "通用"];
export const DATA_TYPES = ["视频", "图像", "文本", "音频", "多模态", "点云", "时序"];

// ---------------------------------------------------------------- 封装模板
export type PackTemplate = {
  id: string;
  name: string;
  industry: string;
  scene: string;
  dataType: string;
  parts: string[];
  used: number;
  updatedAt: string;
  status: "启用" | "草稿";
  owner: string;
};

export const PACK_TEMPLATES: PackTemplate[] = [
  {
    id: "TPL-2026-01",
    name: "交通视频行为识别数据集标准封装",
    industry: "智慧交通",
    scene: "行为识别",
    dataType: "视频",
    parts: ["目录结构", "元数据字段", "质量报告", "说明文档", "标注规范"],
    used: 12,
    updatedAt: "2026-10-26",
    status: "启用",
    owner: "陈立",
  },
  {
    id: "TPL-2026-02",
    name: "应急多模态事件数据集封装",
    industry: "应急管理",
    scene: "事件研判",
    dataType: "多模态",
    parts: ["目录结构", "元数据字段", "质量报告", "说明文档"],
    used: 7,
    updatedAt: "2026-10-21",
    status: "启用",
    owner: "周敏",
  },
  {
    id: "TPL-2026-03",
    name: "医疗影像标注数据集封装",
    industry: "医疗健康",
    scene: "影像诊断",
    dataType: "图像",
    parts: ["目录结构", "元数据字段", "质量报告", "说明文档", "脱敏声明"],
    used: 9,
    updatedAt: "2026-10-18",
    status: "启用",
    owner: "李文博",
  },
  {
    id: "TPL-2026-04",
    name: "文本指令微调数据集封装",
    industry: "通用",
    scene: "大模型微调",
    dataType: "文本",
    parts: ["目录结构", "元数据字段", "质量报告", "许可协议"],
    used: 21,
    updatedAt: "2026-10-14",
    status: "启用",
    owner: "王倩",
  },
  {
    id: "TPL-2026-05",
    name: "工业图像缺陷检测数据集封装",
    industry: "智能制造",
    scene: "缺陷检测",
    dataType: "图像",
    parts: ["目录结构", "元数据字段", "质量报告", "说明文档"],
    used: 5,
    updatedAt: "2026-09-30",
    status: "启用",
    owner: "赵启明",
  },
  {
    id: "TPL-2026-06",
    name: "城市治理点云数据集封装",
    industry: "城市治理",
    scene: "三维建模",
    dataType: "点云",
    parts: ["目录结构", "元数据字段", "质量报告"],
    used: 0,
    updatedAt: "2026-10-29",
    status: "启用",
    owner: "孙浩",
  },
];

// ---------------------------------------------------------------- 统一元数据字典
// 全平台只用这一套定义，避免「数据集管理登记的元数据」与「模板带的元数据字段」两套口径：
//   · 通用元数据（21 项）：数据集管理里每个数据集都必须具备的登记项，对应列表 / 概览字段
//   · 模板扩展元数据（按数据类型追加）：由封装模板带入的领域字段
// 模板的「元数据字段数」= 通用 21 + 该数据类型扩展字段数，不再手工维护数字。
export type MetaFieldType = "标识" | "文本" | "长文本" | "枚举" | "数值" | "日期" | "列表" | "派生";
export type MetaScope = "通用" | "模板";

export type MetaField = {
  /** 写入 dataset.jsonld 的归一化字段名 */
  key: string;
  /** 界面展示名 */
  label: string;
  group: string;
  type: MetaFieldType;
  required: boolean;
  scope: MetaScope;
  example: string;
  /** 通用元数据对应的数据集字段，用于选择数据集对象后自动带入 */
  field?: string;
};

export const COMMON_META_FIELDS: MetaField[] = [
  // —— 标识与登记
  { key: "dct:identifier", label: "数据集编号", group: "标识与登记", type: "标识", required: true, scope: "通用", example: "DS-2026-101", field: "id" },
  { key: "dct:title", label: "数据集名称", group: "标识与登记", type: "文本", required: true, scope: "通用", example: "交通视频行为识别数据集", field: "name" },
  { key: "lshu:category", label: "数据集分类", group: "标识与登记", type: "枚举", required: true, scope: "通用", example: "训练数据集" },
  { key: "dct:hasVersion", label: "当前版本", group: "标识与登记", type: "文本", required: true, scope: "通用", example: "v3.2", field: "version" },
  { key: "dct:issued", label: "发布日期", group: "标识与登记", type: "日期", required: false, scope: "通用", example: "2026-10-26", field: "publishedAt" },
  { key: "lshu:packTemplate", label: "封装模板", group: "标识与登记", type: "标识", required: false, scope: "通用", example: "TPL-2026-01", field: "templateId" },
  // —— 内容与场景
  { key: "dcat:mediaType", label: "数据模态", group: "内容与场景", type: "枚举", required: true, scope: "通用", example: "视频", field: "dataType" },
  { key: "lshu:industry", label: "所属行业", group: "内容与场景", type: "枚举", required: true, scope: "通用", example: "智慧交通" },
  { key: "dcat:theme", label: "业务领域", group: "内容与场景", type: "枚举", required: true, scope: "通用", example: "智慧交通", field: "domain" },
  { key: "lshu:scene", label: "应用场景", group: "内容与场景", type: "文本", required: false, scope: "通用", example: "行为识别", field: "scene" },
  { key: "lshu:subject", label: "数据主体", group: "内容与场景", type: "枚举", required: true, scope: "通用", example: "企业主体" },
  { key: "dct:description", label: "数据集摘要", group: "内容与场景", type: "长文本", required: true, scope: "通用", example: "面向城市道路场景的车辆与行人行为识别数据集", field: "summary" },
  { key: "dcat:keyword", label: "标签", group: "内容与场景", type: "列表", required: false, scope: "通用", example: "行为识别 / 复杂光照", field: "tags" },
  // —— 权属与许可
  { key: "dct:publisher", label: "数据所有者", group: "权属与许可", type: "文本", required: true, scope: "通用", example: "智慧交通事业部", field: "owner" },
  { key: "lshu:dataLevel", label: "数据等级", group: "权属与许可", type: "枚举", required: true, scope: "通用", example: "受限", field: "level" },
  { key: "dct:license", label: "许可协议", group: "权属与许可", type: "文本", required: true, scope: "通用", example: "受限使用（需授权）", field: "license" },
  { key: "lshu:hasPii", label: "是否涉个人信息", group: "权属与许可", type: "枚举", required: true, scope: "通用", example: "否" },
  { key: "lshu:usageLimit", label: "使用限制", group: "权属与许可", type: "长文本", required: true, scope: "通用", example: "限内部模型训练，不对外分发" },
  // —— 规模与质量
  { key: "dct:extent", label: "数据规模", group: "规模与质量", type: "文本", required: true, scope: "通用", example: "1.24 TB", field: "scale" },
  { key: "lshu:recordCount", label: "数据量", group: "规模与质量", type: "文本", required: false, scope: "通用", example: "86,420 段", field: "fileCount" },
  { key: "dqv:hasQualityMeasurement", label: "质量总分", group: "规模与质量", type: "派生", required: false, scope: "通用", example: "94.6", field: "quality" },
];

/** 模板按数据类型追加的扩展元数据字段 */
export const TEMPLATE_META_FIELDS: Record<string, MetaField[]> = {
  视频: [
    { key: "lshu:frameRate", label: "抽帧频率", group: "模板扩展", type: "文本", required: true, scope: "模板", example: "5 fps" },
    { key: "lshu:resolution", label: "视频分辨率", group: "模板扩展", type: "文本", required: true, scope: "模板", example: "1920×1080" },
    { key: "lshu:totalDuration", label: "总时长", group: "模板扩展", type: "文本", required: false, scope: "模板", example: "1,284 小时" },
    { key: "lshu:lightCondition", label: "光照条件", group: "模板扩展", type: "列表", required: false, scope: "模板", example: "白天 / 夜间 / 雨雾" },
    { key: "lshu:behaviorClasses", label: "行为类别数", group: "模板扩展", type: "数值", required: true, scope: "模板", example: "12" },
    { key: "lshu:trackFormat", label: "跟踪轨迹格式", group: "模板扩展", type: "文本", required: false, scope: "模板", example: "MOT / JSON" },
  ],
  图像: [
    { key: "lshu:resolution", label: "图像分辨率", group: "模板扩展", type: "文本", required: true, scope: "模板", example: "2048×1536" },
    { key: "lshu:colorSpace", label: "色彩空间", group: "模板扩展", type: "枚举", required: false, scope: "模板", example: "RGB" },
    { key: "lshu:annoFormat", label: "标注格式", group: "模板扩展", type: "枚举", required: true, scope: "模板", example: "COCO JSON" },
    { key: "lshu:classCount", label: "类别数", group: "模板扩展", type: "数值", required: true, scope: "模板", example: "6" },
    { key: "lshu:splitRatio", label: "数据划分比例", group: "模板扩展", type: "文本", required: false, scope: "模板", example: "8:1:1" },
  ],
  文本: [
    { key: "dcat:language", label: "语种", group: "模板扩展", type: "枚举", required: true, scope: "模板", example: "中文" },
    { key: "lshu:avgLength", label: "平均长度", group: "模板扩展", type: "文本", required: false, scope: "模板", example: "268 字" },
    { key: "lshu:taskType", label: "任务类型", group: "模板扩展", type: "枚举", required: true, scope: "模板", example: "指令微调" },
    { key: "lshu:tokenizeMode", label: "分词 / 编码方式", group: "模板扩展", type: "文本", required: false, scope: "模板", example: "BPE / UTF-8" },
    { key: "lshu:dedupRate", label: "去重率", group: "模板扩展", type: "文本", required: false, scope: "模板", example: "8.4%" },
  ],
  音频: [
    { key: "lshu:sampleRate", label: "采样率", group: "模板扩展", type: "数值", required: true, scope: "模板", example: "16000" },
    { key: "lshu:channels", label: "声道数", group: "模板扩展", type: "数值", required: false, scope: "模板", example: "1" },
    { key: "lshu:snr", label: "信噪比", group: "模板扩展", type: "文本", required: false, scope: "模板", example: "≥ 18 dB" },
    { key: "lshu:speakerCount", label: "说话人数", group: "模板扩展", type: "数值", required: false, scope: "模板", example: "1240" },
    { key: "lshu:transcriptLevel", label: "转写粒度", group: "模板扩展", type: "枚举", required: true, scope: "模板", example: "逐字 + 时间戳" },
  ],
  多模态: [
    { key: "lshu:modalities", label: "模态组成", group: "模板扩展", type: "列表", required: true, scope: "模板", example: "图像 / 文本" },
    { key: "lshu:alignFormat", label: "对齐格式", group: "模板扩展", type: "文本", required: true, scope: "模板", example: "pairs.jsonl" },
    { key: "lshu:pairCount", label: "对齐组数", group: "模板扩展", type: "数值", required: false, scope: "模板", example: "41860" },
    { key: "lshu:elementSchema", label: "要素结构", group: "模板扩展", type: "文本", required: false, scope: "模板", example: "事件类型 + 要素标签" },
  ],
  点云: [
    { key: "lshu:lidarLines", label: "激光线数", group: "模板扩展", type: "数值", required: true, scope: "模板", example: "32" },
    { key: "lshu:pointDensity", label: "点云密度", group: "模板扩展", type: "文本", required: false, scope: "模板", example: "1,240 点/㎡" },
    { key: "lshu:coordinateSystem", label: "坐标系", group: "模板扩展", type: "文本", required: true, scope: "模板", example: "WGS84 / UTM" },
    { key: "lshu:classCount", label: "要素类别数", group: "模板扩展", type: "数值", required: false, scope: "模板", example: "8" },
  ],
  时序: [
    { key: "lshu:granularity", label: "采集粒度", group: "模板扩展", type: "文本", required: true, scope: "模板", example: "5 分钟" },
    { key: "lshu:timeSpan", label: "时间跨度", group: "模板扩展", type: "文本", required: true, scope: "模板", example: "18 个月" },
    { key: "lshu:missingRate", label: "缺失率", group: "模板扩展", type: "文本", required: false, scope: "模板", example: "4.2%" },
    { key: "lshu:deviceCount", label: "设备 / 点位数量", group: "模板扩展", type: "数值", required: false, scope: "模板", example: "1240" },
  ],
};

/** 元数据分组顺序（模板详情、概览均按此顺序展示） */
export const META_GROUPS = ["标识与登记", "内容与场景", "权属与许可", "规模与质量", "模板扩展"];

/** 某个模板的完整元数据字段清单（通用 + 模板扩展） */
export function tplMetaFields(tpl: PackTemplate): MetaField[] {
  return [...COMMON_META_FIELDS, ...(TEMPLATE_META_FIELDS[tpl.dataType] || [])];
}

/** 模板元数据字段总数，替代原先手工维护的 fieldCount */
export function tplFieldCount(tpl: PackTemplate): number {
  return tplMetaFields(tpl).length;
}

/** 通用元数据按分组归并，供概览 / 详情按组渲染 */
export function metaByGroup(fields: MetaField[]) {
  return META_GROUPS.map((g) => ({ group: g, fields: fields.filter((f) => f.group === g) })).filter(
    (x) => x.fields.length > 0
  );
}

// ---------------------------------------------------------------- 数据集（聚合根）
export type Level = "公开" | "内部" | "受限" | "核心";

export const LEVEL_TONE: Record<string, string> = {
  公开: "#16a34a",
  内部: "#0ea5e9",
  受限: "#f59e0b",
  核心: "#dc2626",
};

export const STEP_TONE: Record<string, string> = {
  源: "#0ea5e9",
  加工: "#8b5cf6",
  规则: "#f59e0b",
  质检: "#14b8a6",
  发布: "#16a34a",
};

// —— 元信息封装（数据集详情 · 概览）
export type DatasetMeta = {
  standard: string;
  completeness: number;
  items: number;
  exports: string[];
  updatedAt: string;
  status: "已封装" | "待完善";
  sample: Record<string, string>;
};

// —— 质量报告（数据集详情 · 质量报告）
export type DatasetDim = { label: string; score: number };

export type DatasetQuality = {
  reportId: string;
  version: string;
  score: number;
  dims: DatasetDim[];
  issues: number;
  status: "已随包发布" | "待生成";
  publishedAt: string;
};

// —— 数据血缘（数据集详情 · 数据血缘）
export type LineageStep = { name: string; type: "源" | "加工" | "规则" | "质检" | "发布"; detail: string };

export type DatasetLineage = {
  id: string;
  source: string;
  steps: LineageStep[];
  rules: number;
  qcScore: number;
  publishedAt: string;
  consumers: string[];
};

// —— 权限（数据集详情 · 权限管理）
// 权限项可多选：同一角色可同时拥有查看 / 下载 / 使用 / 授权中的多项，空数组即无权限。
export type PermCode = "查看" | "下载" | "使用" | "授权";

/** 权限项按从低到高排列，多选时按此顺序展示 */
export const PERM_CODES: PermCode[] = ["查看", "下载", "使用", "授权"];

/** 用于权限强度条展示 */
export const PERM_WEIGHT: Record<PermCode, number> = { 查看: 28, 下载: 55, 使用: 78, 授权: 100 };

export type RolePerm = { role: string; perms: PermCode[] };

export const PERMISSION_ROLES = ["平台管理员", "数据管理员", "标注工程师", "算法工程师", "外部访客"];

/** 多权限渲染文案：无选中项时展示“无权限” */
export function permLabel(perms: PermCode[]): string {
  return perms.length === 0 ? "无权限" : PERM_CODES.filter((p) => perms.includes(p)).join("、");
}

export type PermLog = { time: string; operator: string; action: string; before: string; after: string };

export type DatasetPermission = {
  roles: RolePerm[];
  updatedAt: string;
  logs: PermLog[];
};

// —— 版本（数据集详情 · 版本管理）
export type DatasetVersion = {
  id: string;
  version: string;
  changes: string;
  delta: string;
  qualityFrom: number;
  qualityTo: number;
  scope: string;
  status: "生效中" | "历史版本" | "已下线";
  releasedAt: string;
  operator: string;
};

export type Dataset = {
  id: string;
  name: string;
  domain: string;
  dataType: string;
  scene: string;
  level: Level;
  scale: string;
  fileCount: string;
  version: string;
  publishedAt: string;
  downloads: number;
  owner: string;
  status: "已发布" | "审核中" | "已下线";
  summary: string;
  tags: string[];
  license: string;
  templateId: string;
  meta: DatasetMeta;
  quality: DatasetQuality;
  lineage: DatasetLineage;
  permission: DatasetPermission;
  versions: DatasetVersion[];
};

const dims = (a: number, b: number, c: number, d: number, e: number, f: number): DatasetDim[] => [
  { label: "完整性", score: a },
  { label: "准确性", score: b },
  { label: "一致性", score: c },
  { label: "标注质量", score: d },
  { label: "规范性", score: e },
  { label: "及时性", score: f },
];

const STD: Record<string, RolePerm[]> = {
  公开: [
    { role: "平台管理员", perms: ["查看", "下载", "使用", "授权"] },
    { role: "数据管理员", perms: ["查看", "下载", "使用", "授权"] },
    { role: "标注工程师", perms: ["查看", "下载"] },
    { role: "算法工程师", perms: ["查看", "下载"] },
    { role: "外部访客", perms: ["查看", "下载"] },
  ],
  内部: [
    { role: "平台管理员", perms: ["查看", "下载", "使用", "授权"] },
    { role: "数据管理员", perms: ["查看", "下载", "使用", "授权"] },
    { role: "标注工程师", perms: ["查看", "下载", "使用"] },
    { role: "算法工程师", perms: ["查看", "下载"] },
    { role: "外部访客", perms: [] },
  ],
  受限: [
    { role: "平台管理员", perms: ["查看", "下载", "使用", "授权"] },
    { role: "数据管理员", perms: ["查看", "下载", "使用", "授权"] },
    { role: "标注工程师", perms: ["查看"] },
    { role: "算法工程师", perms: ["查看", "下载"] },
    { role: "外部访客", perms: [] },
  ],
  核心: [
    { role: "平台管理员", perms: ["查看", "下载", "使用", "授权"] },
    { role: "数据管理员", perms: ["查看", "使用", "授权"] },
    { role: "标注工程师", perms: ["查看"] },
    { role: "算法工程师", perms: ["查看"] },
    { role: "外部访客", perms: [] },
  ],
};

export const DATASETS: Dataset[] = [
  {
    id: "DS-2026-101",
    name: "交通视频行为识别数据集",
    domain: "智慧交通",
    dataType: "视频",
    scene: "行为识别",
    level: "受限",
    scale: "1.24 TB",
    fileCount: "86,420 段",
    version: "v3.2",
    publishedAt: "2026-10-26",
    downloads: 342,
    owner: "智慧交通事业部",
    status: "已发布",
    summary:
      "面向城市道路场景的车辆与行人行为识别数据集，覆盖白天、夜间、雨雾等复杂光照条件，标注 12 类交通行为（变道、逆行、违停、闯红灯等），可直接用于行为识别模型的训练与评测。",
    tags: ["行为识别", "复杂光照", "12 类行为", "路侧视角"],
    license: "受限使用（需授权）",
    templateId: "TPL-2026-01",
    meta: {
      standard: "DCAT-AP 2.1",
      completeness: 96,
      items: 32,
      exports: ["JSON-LD", "RDF/XML", "Excel"],
      updatedAt: "2026-10-26",
      status: "已封装",
      sample: {
        "dct:title": "交通视频行为识别数据集",
        "dct:publisher": "零数科技 · 智慧交通事业部",
        "dct:issued": "2026-10-26",
        "dcat:theme": "智慧交通 / 行为识别",
        "dct:license": "受限使用（需授权）",
        "dqv:hasQualityMeasurement": "总分 94.6 / 完整性 98.2",
      },
    },
    quality: {
      reportId: "QRP-2026-018",
      version: "v3.2",
      score: 94.6,
      dims: dims(98.2, 95.1, 93.4, 94.8, 96.0, 90.1),
      issues: 42,
      status: "已随包发布",
      publishedAt: "2026-10-26",
    },
    lineage: {
      id: "LG-2026-101",
      source: "路侧摄像机视频流（48 路）",
      steps: [
        { name: "视频接入", type: "源", detail: "Kafka 流式接入 · 48 路" },
        { name: "抽帧清洗", type: "加工", detail: "5fps 抽帧 · 去重 3.2 万帧" },
        { name: "数据增强", type: "加工", detail: "夜间亮度均衡 · 4 类变换" },
        { name: "数据标注", type: "加工", detail: "专家标注 + 智能预标" },
        { name: "质检规则", type: "规则", detail: "命中 19 条规则" },
        { name: "数据集封装", type: "质检", detail: "总分 94.6" },
        { name: "发布上架", type: "发布", detail: "受限 · 需授权" },
      ],
      rules: 19,
      qcScore: 94.6,
      publishedAt: "2026-10-26",
      consumers: ["交通行为识别模型 v2.4", "应急事件研判智能体", "城市交通流量预测模型"],
    },
    permission: {
      roles: STD["受限"],
      updatedAt: "2026-10-26",
      logs: [
        { time: "2026-10-26 15:42", operator: "陈立", action: "调整角色权限", before: "算法工程师：查看、下载", after: "算法工程师：查看、下载、使用" },
        { time: "2026-09-18 10:20", operator: "陈立", action: "发布新版本授权", before: "v3.1 授权范围", after: "v3.2 授权范围" },
      ],
    },
    versions: [
      { id: "V-101-32", version: "v3.2", changes: "新增夜间场景 1.2 万段，修正误标 3,420 处", delta: "+8.4%", qualityFrom: 92.1, qualityTo: 94.6, scope: "全场景", status: "生效中", releasedAt: "2026-10-26", operator: "陈立" },
      { id: "V-101-31", version: "v3.1", changes: "补充雨天场景 6,800 段", delta: "+5.1%", qualityFrom: 90.4, qualityTo: 92.1, scope: "全场景", status: "历史版本", releasedAt: "2026-09-18", operator: "陈立" },
      { id: "V-101-30", version: "v3.0", changes: "行为类别从 8 类扩展至 12 类，全量重标", delta: "+16.2%", qualityFrom: 86.8, qualityTo: 90.4, scope: "全场景", status: "历史版本", releasedAt: "2026-07-30", operator: "周敏" },
    ],
  },
  {
    id: "DS-2026-102",
    name: "应急多模态事件数据集",
    domain: "应急管理",
    dataType: "多模态",
    scene: "事件研判",
    level: "内部",
    scale: "620 GB",
    fileCount: "41,860 条",
    version: "v1.8",
    publishedAt: "2026-10-21",
    downloads: 168,
    owner: "应急管理事业部",
    status: "已发布",
    summary:
      "面向突发事件研判的图文多模态数据集，每组样本包含现场影像、事件记录文本与结构化要素标签，覆盖自然灾害、事故灾难、公共卫生三类事件，用于事件分类与要素抽取模型训练。",
    tags: ["图文对齐", "事件研判", "要素抽取", "应急指挥"],
    license: "内部使用",
    templateId: "TPL-2026-02",
    meta: {
      standard: "DCAT-AP 2.1",
      completeness: 91,
      items: 28,
      exports: ["JSON-LD", "Excel"],
      updatedAt: "2026-10-21",
      status: "已封装",
      sample: {
        "dct:title": "应急多模态事件数据集",
        "dct:publisher": "零数科技 · 应急管理事业部",
        "dct:issued": "2026-10-21",
        "dcat:theme": "应急管理 / 事件研判",
        "dct:license": "内部使用",
        "dqv:hasQualityMeasurement": "总分 91.2 / 一致性 89.4",
      },
    },
    quality: {
      reportId: "QRP-2026-016",
      version: "v1.8",
      score: 91.2,
      dims: dims(93.0, 90.4, 89.4, 92.1, 91.6, 90.8),
      issues: 76,
      status: "已随包发布",
      publishedAt: "2026-10-21",
    },
    lineage: {
      id: "LG-2026-102",
      source: "应急指挥平台事件记录 + 现场影像",
      steps: [
        { name: "多源接入", type: "源", detail: "API + 对象存储" },
        { name: "格式标准化", type: "加工", detail: "图文对齐 4.1 万组" },
        { name: "数据标注", type: "加工", detail: "事件要素抽取" },
        { name: "质检规则", type: "规则", detail: "命中 14 条规则" },
        { name: "数据集封装", type: "质检", detail: "总分 91.2" },
        { name: "发布上架", type: "发布", detail: "内部使用" },
      ],
      rules: 14,
      qcScore: 91.2,
      publishedAt: "2026-10-21",
      consumers: ["应急事件研判智能体", "多模态事件分类模型"],
    },
    permission: {
      roles: STD["内部"],
      updatedAt: "2026-10-21",
      logs: [
        { time: "2026-10-21 09:06", operator: "周敏", action: "新增外部访客限制", before: "未限制", after: "无权限" },
      ],
    },
    versions: [
      { id: "V-102-18", version: "v1.8", changes: "图文对齐校验，剔除错配 1,240 组", delta: "+2.6%", qualityFrom: 88.0, qualityTo: 91.2, scope: "事件研判", status: "生效中", releasedAt: "2026-10-21", operator: "周敏" },
      { id: "V-102-17", version: "v1.7", changes: "新增公共卫生类事件 3,600 组", delta: "+9.4%", qualityFrom: 87.2, qualityTo: 88.0, scope: "事件研判", status: "历史版本", releasedAt: "2026-08-28", operator: "周敏" },
    ],
  },
  {
    id: "DS-2026-103",
    name: "医疗影像标注数据集",
    domain: "医疗健康",
    dataType: "图像",
    scene: "影像诊断",
    level: "核心",
    scale: "486 GB",
    fileCount: "32,140 例",
    version: "v2.0",
    publishedAt: "2026-10-18",
    downloads: 96,
    owner: "医疗健康事业部",
    status: "已发布",
    summary:
      "脱敏后的胸部 CT 影像标注数据集，包含结节位置、大小、密度分型等标注信息，由 3 位影像科专家交叉标注并复核，适用于肺结节检测与分型模型的训练和验证。",
    tags: ["医学影像", "DICOM", "专家交叉标注", "隐私脱敏"],
    license: "核心数据（需审批）",
    templateId: "TPL-2026-03",
    meta: {
      standard: "GB/T 36344",
      completeness: 94,
      items: 36,
      exports: ["JSON-LD", "XML", "Excel"],
      updatedAt: "2026-10-18",
      status: "已封装",
      sample: {
        "dct:title": "医疗影像标注数据集",
        "dct:publisher": "零数科技 · 医疗健康事业部",
        "dct:issued": "2026-10-18",
        "dcat:theme": "医疗健康 / 影像诊断",
        "dct:license": "核心数据（需审批）",
        "dqv:hasQualityMeasurement": "总分 96.1 / 准确性 95.8",
      },
    },
    quality: {
      reportId: "QRP-2026-017",
      version: "v2.0",
      score: 96.1,
      dims: dims(97.4, 95.8, 96.2, 95.6, 97.0, 94.0),
      issues: 18,
      status: "已随包发布",
      publishedAt: "2026-10-18",
    },
    lineage: {
      id: "LG-2026-103",
      source: "合作医院 PACS 影像（脱敏后）",
      steps: [
        { name: "影像接入", type: "源", detail: "DICOM 批量导入" },
        { name: "脱敏处理", type: "加工", detail: "12 项隐私字段擦除" },
        { name: "数据标注", type: "加工", detail: "3 位专家交叉标注" },
        { name: "质检规则", type: "规则", detail: "命中 22 条规则" },
        { name: "数据集封装", type: "质检", detail: "总分 96.1" },
        { name: "发布上架", type: "发布", detail: "核心 · 需审批" },
      ],
      rules: 22,
      qcScore: 96.1,
      publishedAt: "2026-10-18",
      consumers: ["肺结节检测模型 v3.1", "华佗医学问答智能体"],
    },
    permission: {
      roles: STD["核心"],
      updatedAt: "2026-10-18",
      logs: [
        { time: "2026-10-18 16:33", operator: "李文博", action: "收紧下载权限", before: "算法工程师：查看、下载", after: "算法工程师：查看" },
      ],
    },
    versions: [
      { id: "V-103-20", version: "v2.0", changes: "新增 6,400 例，专家交叉复核标注", delta: "+12.8%", qualityFrom: 93.2, qualityTo: 96.1, scope: "影像诊断", status: "生效中", releasedAt: "2026-10-18", operator: "李文博" },
      { id: "V-103-19", version: "v1.9", changes: "脱敏规则升级，重跑全量", delta: "0%", qualityFrom: 92.8, qualityTo: 93.2, scope: "影像诊断", status: "历史版本", releasedAt: "2026-08-30", operator: "李文博" },
    ],
  },
  {
    id: "DS-2026-104",
    name: "文本指令微调数据集",
    domain: "通用",
    dataType: "文本",
    scene: "大模型微调",
    level: "公开",
    scale: "12.8 GB",
    fileCount: "1,286,400 条",
    version: "v4.1",
    publishedAt: "2026-10-14",
    downloads: 2140,
    owner: "数据生产中心",
    status: "已发布",
    summary:
      "面向行业大模型指令微调的中文指令数据集，覆盖问答、摘要、抽取、推理四类任务，含单轮与多轮对话样本，已完成去重、去噪与安全过滤，可直接用于 SFT 训练。",
    tags: ["指令微调", "多轮对话", "SFT", "对外公开"],
    license: "公开（CC BY-NC 4.0）",
    templateId: "TPL-2026-04",
    meta: {
      standard: "Schema.org / Dataset",
      completeness: 88,
      items: 18,
      exports: ["JSON-LD", "Excel"],
      updatedAt: "2026-10-14",
      status: "已封装",
      sample: {
        "dct:title": "文本指令微调数据集",
        "dct:publisher": "零数科技 · 数据生产中心",
        "dct:issued": "2026-10-14",
        "dcat:theme": "通用 / 大模型微调",
        "dct:license": "公开（CC BY-NC 4.0）",
        "dqv:hasQualityMeasurement": "总分 89.7 / 规范性 92.3",
      },
    },
    quality: {
      reportId: "QRP-2026-015",
      version: "v4.1",
      score: 89.7,
      dims: dims(91.2, 88.6, 87.0, 90.4, 92.3, 88.9),
      issues: 113,
      status: "已随包发布",
      publishedAt: "2026-10-14",
    },
    lineage: {
      id: "LG-2026-104",
      source: "公开语料 + 内部业务问答沉淀",
      steps: [
        { name: "语料采集", type: "源", detail: "公开数据 + 内部沉淀" },
        { name: "语料库管理", type: "加工", detail: "入库 128.6 万条" },
        { name: "清洗去重", type: "加工", detail: "去重率 8.4%" },
        { name: "质检规则", type: "规则", detail: "命中 11 条规则" },
        { name: "数据集封装", type: "质检", detail: "总分 89.7" },
        { name: "发布上架", type: "发布", detail: "公开 · CC BY-NC" },
      ],
      rules: 11,
      qcScore: 89.7,
      publishedAt: "2026-10-14",
      consumers: ["行业大模型微调任务", "知识问答智能体", "外部开发者（2,140 次下载）"],
    },
    permission: {
      roles: STD["公开"],
      updatedAt: "2026-10-14",
      logs: [
        { time: "2026-10-14 11:20", operator: "王倩", action: "开放公开下载", before: "外部访客：无权限", after: "外部访客：查看、下载" },
      ],
    },
    versions: [
      { id: "V-104-41", version: "v4.1", changes: "清洗去重，剔除低质样本 11.2 万条", delta: "-8.4%", qualityFrom: 86.5, qualityTo: 89.7, scope: "通用微调", status: "生效中", releasedAt: "2026-10-14", operator: "王倩" },
      { id: "V-104-40", version: "v4.0", changes: "新增多轮对话 24 万条", delta: "+18.2%", qualityFrom: 84.1, qualityTo: 86.5, scope: "通用微调", status: "历史版本", releasedAt: "2026-07-22", operator: "王倩" },
      { id: "V-104-39", version: "v3.9", changes: "补齐摘要任务样本", delta: "+6.3%", qualityFrom: 83.2, qualityTo: 84.1, scope: "通用微调", status: "历史版本", releasedAt: "2026-05-16", operator: "王倩" },
    ],
  },
  {
    id: "DS-2026-105",
    name: "工业图像缺陷数据集",
    domain: "智能制造",
    dataType: "图像",
    scene: "缺陷检测",
    level: "内部",
    scale: "214 GB",
    fileCount: "58,600 张",
    version: "v1.3",
    publishedAt: "2026-09-30",
    downloads: 274,
    owner: "智能制造事业部",
    status: "已发布",
    summary:
      "产线工业相机采集的表面缺陷图像数据集，覆盖划痕、凹坑、污渍、裂纹等 6 类缺陷，图像分辨率统一为 2048×1536，含缺陷框与类别标签，用于表面缺陷检测模型训练。",
    tags: ["缺陷检测", "工业相机", "6 类缺陷", "高分辨率"],
    license: "内部使用",
    templateId: "TPL-2026-05",
    meta: {
      standard: "DCAT-AP 2.1",
      completeness: 82,
      items: 26,
      exports: ["JSON-LD"],
      updatedAt: "2026-09-30",
      status: "待完善",
      sample: {
        "dct:title": "工业图像缺陷数据集",
        "dct:publisher": "零数科技 · 智能制造事业部",
        "dct:issued": "2026-09-30",
        "dcat:theme": "智能制造 / 缺陷检测",
        "dct:license": "内部使用",
        "dqv:hasQualityMeasurement": "总分 87.4 / 标注质量 84.1",
      },
    },
    quality: {
      reportId: "QRP-2026-014",
      version: "v1.3",
      score: 87.4,
      dims: dims(89.0, 88.2, 86.4, 84.1, 88.0, 88.7),
      issues: 152,
      status: "待生成",
      publishedAt: "2026-09-30",
    },
    lineage: {
      id: "LG-2026-105",
      source: "产线工业相机采集图像",
      steps: [
        { name: "图像接入", type: "源", detail: "产线相机批量导入" },
        { name: "缺陷标注", type: "加工", detail: "6 类缺陷框标注" },
        { name: "数据增强", type: "加工", detail: "旋转 · 对比度扰动" },
        { name: "质检规则", type: "规则", detail: "命中 9 条规则" },
        { name: "数据集封装", type: "质检", detail: "总分 87.4" },
        { name: "发布上架", type: "发布", detail: "内部使用" },
      ],
      rules: 9,
      qcScore: 87.4,
      publishedAt: "2026-09-30",
      consumers: ["表面缺陷检测模型 v1.6"],
    },
    permission: {
      roles: STD["内部"],
      updatedAt: "2026-09-30",
      logs: [
        { time: "2026-09-30 14:05", operator: "赵启明", action: "调整角色权限", before: "标注工程师：查看", after: "标注工程师：查看、下载、使用" },
      ],
    },
    versions: [
      { id: "V-105-13", version: "v1.3", changes: "补充划痕类缺陷 8,200 张", delta: "+16.3%", qualityFrom: 85.0, qualityTo: 87.4, scope: "缺陷检测", status: "生效中", releasedAt: "2026-09-30", operator: "赵启明" },
      { id: "V-105-12", version: "v1.2", changes: "统一图像分辨率与色彩空间", delta: "0%", qualityFrom: 84.2, qualityTo: 85.0, scope: "缺陷检测", status: "历史版本", releasedAt: "2026-08-12", operator: "赵启明" },
    ],
  },
  {
    id: "DS-2026-106",
    name: "城市治理工单文本数据集",
    domain: "城市治理",
    dataType: "文本",
    scene: "文本分类",
    level: "内部",
    scale: "3.2 GB",
    fileCount: "428,900 条",
    version: "v2.6",
    publishedAt: "2026-09-22",
    downloads: 512,
    owner: "城市治理实验室",
    status: "已发布",
    summary:
      "城市热线工单文本数据集，包含工单标题、正文、处置结果与 18 类业务标签，已完成去噪与个人信息脱敏，用于工单智能分派与城市治理态势分析。",
    tags: ["工单分类", "18 类标签", "文本脱敏", "热线数据"],
    license: "内部使用",
    templateId: "TPL-2026-04",
    meta: {
      standard: "GB/T 36344",
      completeness: 90,
      items: 24,
      exports: ["JSON-LD", "XML"],
      updatedAt: "2026-09-22",
      status: "已封装",
      sample: {
        "dct:title": "城市治理工单文本数据集",
        "dct:publisher": "零数科技 · 城市治理实验室",
        "dct:issued": "2026-09-22",
        "dcat:theme": "城市治理 / 文本分类",
        "dct:license": "内部使用",
        "dqv:hasQualityMeasurement": "总分 92.0 / 及时性 94.6",
      },
    },
    quality: {
      reportId: "QRP-2026-013",
      version: "v2.6",
      score: 92.0,
      dims: dims(94.0, 91.4, 90.2, 92.8, 92.6, 94.6),
      issues: 61,
      status: "已随包发布",
      publishedAt: "2026-09-22",
    },
    lineage: {
      id: "LG-2026-106",
      source: "城市热线工单系统",
      steps: [
        { name: "工单接入", type: "源", detail: "API 增量同步" },
        { name: "文本清洗", type: "加工", detail: "去噪 · 脱敏" },
        { name: "分类标注", type: "加工", detail: "18 类工单标签" },
        { name: "质检规则", type: "规则", detail: "命中 12 条规则" },
        { name: "数据集封装", type: "质检", detail: "总分 92.0" },
        { name: "发布上架", type: "发布", detail: "内部使用" },
      ],
      rules: 12,
      qcScore: 92.0,
      publishedAt: "2026-09-22",
      consumers: ["工单智能分派模型", "城市治理研判看板"],
    },
    permission: {
      roles: STD["内部"],
      updatedAt: "2026-09-22",
      logs: [
        { time: "2026-09-22 10:12", operator: "孙浩", action: "初始授权", before: "—", after: "内部使用" },
      ],
    },
    versions: [
      { id: "V-106-26", version: "v2.6", changes: "标签体系从 12 类扩展至 18 类", delta: "+6.7%", qualityFrom: 89.4, qualityTo: 92.0, scope: "文本分类", status: "生效中", releasedAt: "2026-09-22", operator: "孙浩" },
    ],
  },
  {
    id: "DS-2026-107",
    name: "交通路网时序流量数据集",
    domain: "智慧交通",
    dataType: "时序",
    scene: "流量预测",
    level: "公开",
    scale: "1.6 GB",
    fileCount: "7,200 万点",
    version: "v1.1",
    publishedAt: "2026-09-15",
    downloads: 884,
    owner: "智慧交通事业部",
    status: "已发布",
    summary:
      "覆盖城市 1,240 个路段的 5 分钟粒度流量与速度数据，时间跨度 18 个月，含节假日与天气标记，适用于交通流量预测、拥堵态势分析等时序建模任务。",
    tags: ["时序数据", "流量预测", "5分钟粒度", "18个月跨度"],
    license: "公开（CC BY 4.0）",
    templateId: "TPL-2026-01",
    meta: {
      standard: "DCAT-AP 2.1",
      completeness: 93,
      items: 22,
      exports: ["JSON-LD", "Excel"],
      updatedAt: "2026-09-15",
      status: "已封装",
      sample: {
        "dct:title": "交通路网时序流量数据集",
        "dct:publisher": "零数科技 · 智慧交通事业部",
        "dct:issued": "2026-09-15",
        "dcat:theme": "智慧交通 / 流量预测",
        "dct:license": "公开（CC BY 4.0）",
        "dqv:hasQualityMeasurement": "总分 88.6 / 完整性 92.4",
      },
    },
    quality: {
      reportId: "QRP-2026-012",
      version: "v1.1",
      score: 88.6,
      dims: dims(92.4, 87.8, 86.2, 85.0, 90.6, 89.4),
      issues: 187,
      status: "已随包发布",
      publishedAt: "2026-09-15",
    },
    lineage: {
      id: "LG-2026-107",
      source: "路网检测器 + 浮动车 GPS",
      steps: [
        { name: "数据接入", type: "源", detail: "检测器 5min 上报" },
        { name: "时空对齐", type: "加工", detail: "路段 ID 标准化" },
        { name: "缺失填补", type: "加工", detail: "线性插值补 4.2% 空值" },
        { name: "质检规则", type: "规则", detail: "命中 8 条规则" },
        { name: "数据集封装", type: "质检", detail: "总分 88.6" },
        { name: "发布上架", type: "发布", detail: "公开 · CC BY" },
      ],
      rules: 8,
      qcScore: 88.6,
      publishedAt: "2026-09-15",
      consumers: ["城市交通流量预测模型", "拥堵态势研判看板"],
    },
    permission: {
      roles: STD["公开"],
      updatedAt: "2026-09-15",
      logs: [
        { time: "2026-09-15 09:30", operator: "陈立", action: "开放公开下载", before: "内部", after: "公开" },
      ],
    },
    versions: [
      { id: "V-107-11", version: "v1.1", changes: "补齐 60 个新增路段，重跑缺失填补", delta: "+11.4%", qualityFrom: 86.2, qualityTo: 88.6, scope: "全路网", status: "生效中", releasedAt: "2026-09-15", operator: "陈立" },
      { id: "V-107-10", version: "v1.0", changes: "首次发布 1,180 个路段", delta: "—", qualityFrom: 0, qualityTo: 86.2, scope: "核心路网", status: "历史版本", releasedAt: "2026-06-20", operator: "陈立" },
    ],
  },
  {
    id: "DS-2026-108",
    name: "城市三维点云数据集",
    domain: "城市治理",
    dataType: "点云",
    scene: "三维建模",
    level: "受限",
    scale: "2.8 TB",
    fileCount: "6,240 帧",
    version: "v0.9",
    publishedAt: "2026-10-29",
    downloads: 0,
    owner: "城市治理实验室",
    status: "审核中",
    summary:
      "车载激光雷达采集的城市街区三维点云数据，含建筑立面、道路设施、行道树等要素分类标签，用于城市三维重建、自动驾驶仿真场景构建。当前版本处于发布审核中。",
    tags: ["激光点云", "三维重建", "要素分类", "仿真场景"],
    license: "受限使用（需授权）",
    templateId: "TPL-2026-06",
    meta: {
      standard: "DCAT-AP 2.1",
      completeness: 76,
      items: 22,
      exports: ["JSON-LD"],
      updatedAt: "2026-10-29",
      status: "待完善",
      sample: {
        "dct:title": "城市三维点云数据集",
        "dct:publisher": "零数科技 · 城市治理实验室",
        "dct:issued": "2026-10-29",
        "dcat:theme": "城市治理 / 三维建模",
        "dct:license": "受限使用（需授权）",
        "dqv:hasQualityMeasurement": "总分 84.2 / 标注质量 81.6",
      },
    },
    quality: {
      reportId: "QRP-2026-011",
      version: "v0.9",
      score: 84.2,
      dims: dims(88.6, 85.4, 83.2, 81.6, 84.0, 82.4),
      issues: 234,
      status: "待生成",
      publishedAt: "2026-10-29",
    },
    lineage: {
      id: "LG-2026-108",
      source: "车载激光雷达（32 线）",
      steps: [
        { name: "点云接入", type: "源", detail: "PCD 批量导入" },
        { name: "配准拼接", type: "加工", detail: "SLAM 拼接 6,240 帧" },
        { name: "要素分类", type: "加工", detail: "8 类要素人工标注" },
        { name: "质检规则", type: "规则", detail: "命中 6 条规则" },
        { name: "数据集封装", type: "质检", detail: "总分 84.2" },
        { name: "待审核", type: "发布", detail: "受限 · 审核中" },
      ],
      rules: 6,
      qcScore: 84.2,
      publishedAt: "—",
      consumers: ["城市三维重建项目", "自动驾驶仿真场景库"],
    },
    permission: {
      roles: STD["受限"],
      updatedAt: "2026-10-29",
      logs: [
        { time: "2026-10-24 10:18", operator: "孙浩", action: "设置访问级别", before: "内部", after: "受限" },
      ],
    },
    versions: [
      { id: "V-108-09", version: "v0.9", changes: "补充老城区街区 1,240 帧，待审核发布", delta: "+24.8%", qualityFrom: 80.4, qualityTo: 84.2, scope: "老城区", status: "生效中", releasedAt: "2026-10-29", operator: "孙浩" },
    ],
  },
  {
    id: "DS-2026-109",
    name: "医疗问答指令语料数据集",
    domain: "医疗健康",
    dataType: "文本",
    scene: "智能问答",
    level: "受限",
    scale: "640 MB",
    fileCount: "82,400 条",
    version: "v1.4",
    publishedAt: "2026-09-08",
    downloads: 421,
    owner: "医疗健康事业部",
    status: "已发布",
    summary:
      "面向医学问答智能体的指令语料数据集，来源于医学百科与临床问答沉淀，覆盖内科、外科、儿科等 12 个科室，已完成敏感信息过滤与医学事实核查。",
    tags: ["医学问答", "指令语料", "12 个科室", "事实核查"],
    license: "受限使用（需授权）",
    templateId: "TPL-2026-04",
    meta: {
      standard: "GB/T 36344",
      completeness: 89,
      items: 20,
      exports: ["JSON-LD", "Excel"],
      updatedAt: "2026-09-08",
      status: "已封装",
      sample: {
        "dct:title": "医疗问答指令语料数据集",
        "dct:publisher": "零数科技 · 医疗健康事业部",
        "dct:issued": "2026-09-08",
        "dcat:theme": "医疗健康 / 智能问答",
        "dct:license": "受限使用（需授权）",
        "dqv:hasQualityMeasurement": "总分 93.1 / 准确性 94.2",
      },
    },
    quality: {
      reportId: "QRP-2026-010",
      version: "v1.4",
      score: 93.1,
      dims: dims(94.8, 94.2, 91.6, 92.4, 93.0, 92.6),
      issues: 48,
      status: "已随包发布",
      publishedAt: "2026-09-08",
    },
    lineage: {
      id: "LG-2026-109",
      source: "医学百科 + 临床问答沉淀",
      steps: [
        { name: "语料接入", type: "源", detail: "百科开放数据 + 内部沉淀" },
        { name: "语料库管理", type: "加工", detail: "入库 8.24 万条" },
        { name: "事实核查", type: "加工", detail: "医师复核 12 个科室" },
        { name: "质检规则", type: "规则", detail: "命中 15 条规则" },
        { name: "数据集封装", type: "质检", detail: "总分 93.1" },
        { name: "发布上架", type: "发布", detail: "受限 · 需授权" },
      ],
      rules: 15,
      qcScore: 93.1,
      publishedAt: "2026-09-08",
      consumers: ["华佗医学问答智能体", "分诊辅助模型"],
    },
    permission: {
      roles: STD["受限"],
      updatedAt: "2026-09-08",
      logs: [
        { time: "2026-09-08 11:40", operator: "李文博", action: "初始授权", before: "—", after: "受限使用" },
      ],
    },
    versions: [
      { id: "V-109-14", version: "v1.4", changes: "新增儿科、皮肤科语料 2.1 万条", delta: "+13.6%", qualityFrom: 91.0, qualityTo: 93.1, scope: "12 个科室", status: "生效中", releasedAt: "2026-09-08", operator: "李文博" },
      { id: "V-109-13", version: "v1.3", changes: "事实核查整改 860 条", delta: "+3.2%", qualityFrom: 90.2, qualityTo: 91.0, scope: "8 个科室", status: "历史版本", releasedAt: "2026-07-14", operator: "李文博" },
    ],
  },
  {
    id: "DS-2026-110",
    name: "语音转写校对数据集",
    domain: "通用",
    dataType: "音频",
    scene: "语音识别",
    level: "公开",
    scale: "88 GB",
    fileCount: "37,600 条",
    version: "v2.2",
    publishedAt: "2026-08-26",
    downloads: 1268,
    owner: "数据生产中心",
    status: "已下线",
    summary:
      "中文语音转写校对数据集，包含客服通话、会议录音等场景的音频与逐字转写文本，已完成噪声标注与说话人分离。因抽样复核不达标已下线，引导用户迁移至新版本。",
    tags: ["语音识别", "逐字转写", "说话人分离", "已下线"],
    license: "公开（CC BY-NC 4.0）",
    templateId: "TPL-2026-04",
    meta: {
      standard: "Schema.org / Dataset",
      completeness: 84,
      items: 19,
      exports: ["JSON-LD"],
      updatedAt: "2026-08-26",
      status: "待完善",
      sample: {
        "dct:title": "语音转写校对数据集",
        "dct:publisher": "零数科技 · 数据生产中心",
        "dct:issued": "2026-08-26",
        "dcat:theme": "通用 / 语音识别",
        "dct:license": "公开（CC BY-NC 4.0）",
        "dqv:hasQualityMeasurement": "总分 88.2 / 及时性 86.4",
      },
    },
    quality: {
      reportId: "QRP-2026-009",
      version: "v2.2",
      score: 88.2,
      dims: dims(90.2, 87.6, 86.4, 88.8, 89.0, 86.4),
      issues: 264,
      status: "已随包发布",
      publishedAt: "2026-08-26",
    },
    lineage: {
      id: "LG-2026-110",
      source: "客服通话 + 会议录音",
      steps: [
        { name: "音频接入", type: "源", detail: "对象存储批量导入" },
        { name: "降噪分段", type: "加工", detail: "VAD 切分 3.76 万段" },
        { name: "转写校对", type: "加工", detail: "ASR 初转 + 人工校对" },
        { name: "质检规则", type: "规则", detail: "命中 10 条规则" },
        { name: "数据集封装", type: "质检", detail: "总分 88.2" },
        { name: "已下线", type: "发布", detail: "复核未达标" },
      ],
      rules: 10,
      qcScore: 88.2,
      publishedAt: "2026-08-26",
      consumers: ["语音识别模型 v1.8（已迁移）"],
    },
    permission: {
      roles: STD["公开"],
      updatedAt: "2026-08-26",
      logs: [
        { time: "2026-08-26 17:05", operator: "王倩", action: "版本下线", before: "生效中", after: "已下线" },
      ],
    },
    versions: [
      { id: "V-110-22", version: "v2.2", changes: "未通过复核，暂停对外提供", delta: "-2.1%", qualityFrom: 90.6, qualityTo: 88.2, scope: "语音识别", status: "已下线", releasedAt: "2026-08-26", operator: "王倩" },
      { id: "V-110-21", version: "v2.1", changes: "新增会议场景 8,400 段", delta: "+14.2%", qualityFrom: 89.4, qualityTo: 90.6, scope: "语音识别", status: "历史版本", releasedAt: "2026-06-18", operator: "王倩" },
    ],
  },
];

// ---------------------------------------------------------------- 统一元数据 · 数据集取值
/** 数据集在「统一元数据字典」下的实际取值：key 为 MetaField.key，供选择数据集对象后自动带入 */
export function datasetMetaValues(ds: Dataset): Record<string, string> {
  return {
    "dct:identifier": ds.id,
    "dct:title": ds.name,
    "lshu:category": ds.scene.includes("微调")
      ? "微调数据集"
      : ds.scene.includes("问答") || ds.scene.includes("分类")
      ? "语料数据集"
      : "训练数据集",
    "dct:hasVersion": ds.version,
    "dct:issued": ds.publishedAt,
    "lshu:packTemplate": ds.templateId,
    "dcat:mediaType": ds.dataType,
    "lshu:industry": ds.domain,
    "dcat:theme": ds.domain,
    "lshu:scene": ds.scene,
    "lshu:subject": "企业主体",
    "dct:description": ds.summary,
    "dcat:keyword": ds.tags.join(" / "),
    "dct:publisher": ds.owner,
    "lshu:dataLevel": ds.level,
    "dct:license": ds.license,
    "lshu:hasPii": ds.tags.some((t) => /隐私|脱敏/.test(t)) ? "是" : "否",
    "lshu:usageLimit": ds.license.startsWith("公开")
      ? "允许公开使用，需标注数据来源"
      : "限授权范围内使用，禁止对外二次分发",
    "dct:extent": ds.scale,
    "lshu:recordCount": ds.fileCount,
    "dqv:hasQualityMeasurement": String(ds.quality.score),
  };
}

// 数据集登记的元数据项数一律以统一字典为准（原先各写一个数字，容易与模板脱节）
DATASETS.forEach((d) => {
  const tpl = PACK_TEMPLATES.find((t) => t.id === d.templateId);
  d.meta.items = tpl ? tplFieldCount(tpl) : COMMON_META_FIELDS.length;
});

export function datasetById(id: string): Dataset | undefined {
  return DATASETS.find((d) => d.id === id);
}

// ---------------------------------------------------------------- 派生数据
// 质量报告 · 各维度规则命中（由总分与维度得分稳定派生，刷新不变）
const RULE_BASE: Record<string, number> = {
  完整性: 24,
  准确性: 18,
  一致性: 12,
  标注质量: 16,
  规范性: 14,
  及时性: 8,
};

export function qualityDimStats(ds: Dataset) {
  return ds.quality.dims.map((d) => {
    const rules = RULE_BASE[d.label] || 10;
    const passRate = d.score;
    const hits = Math.max(0, Math.round((rules * (100 - passRate)) / 100 + (d.score < 86 ? 3 : 0)));
    return { dim: d.label, rules, hits, passRate };
  });
}

// 质量报告 · 问题分布（字段 × 维度）
const FIELD_BY_TYPE: Record<string, string[]> = {
  视频: ["behavior_label", "track_id", "bbox", "duration", "light_condition"],
  图像: ["lesion_type", "bbox", "image_quality", "modality"],
  文本: ["instruction", "response", "label", "source"],
  音频: ["transcript", "speaker_id", "snr", "duration"],
  多模态: ["image_path", "caption", "event_type", "element_tag"],
  点云: ["class_label", "point_count", "frame_id", "intensity"],
  时序: ["segment_id", "flow", "speed", "timestamp"],
};

export function qualityIssueDist(ds: Dataset) {
  const fields = FIELD_BY_TYPE[ds.dataType] || FIELD_BY_TYPE["文本"];
  const dimsList = ds.quality.dims;
  const total = ds.quality.issues;
  // 按维度失分权重分摊总数，再落到字段上
  const weights = dimsList.map((d) => Math.max(1, 100 - d.score));
  const sumW = weights.reduce((a, b) => a + b, 0);
  const out: { field: string; dim: string; count: number }[] = [];
  fields.forEach((f, fi) => {
    dimsList.forEach((d, di) => {
      if ((fi + di) % 3 === 2) return; // 稀疏化，避免满格
      const c = Math.round((total * weights[di]) / sumW / fields.length) + ((fi + di) % 4);
      if (c > 0) out.push({ field: f, dim: d.label, count: c });
    });
  });
  return out.sort((a, b) => b.count - a.count).slice(0, 8);
}

// 质量报告 · 历史批次趋势（由版本链派生）
export function qualityHistory(ds: Dataset) {
  const vs = [...ds.versions].reverse();
  return vs.map((v) => ({
    label: v.version,
    value: v.qualityTo,
    date: v.releasedAt,
  }));
}

// 概览 · 目录结构（按数据类型给出标准封装结构）
export function dirTree(ds: Dataset): { name: string; note: string; children?: { name: string; note: string }[] }[] {
  const anno: Record<string, { name: string; note: string }[]> = {
    视频: [
      { name: "labels.json", note: "行为标签与时间区间" },
      { name: "tracks.json", note: "目标跟踪轨迹" },
    ],
    图像: [
      { name: "labels.json", note: "类别与检测框" },
      { name: "splits.json", note: "训练 / 验证 / 测试划分" },
    ],
    文本: [
      { name: "corpus.jsonl", note: "指令与回复逐行记录" },
      { name: "schema.json", note: "字段说明与约束" },
    ],
    音频: [
      { name: "transcripts.jsonl", note: "逐字转写与时间戳" },
      { name: "speakers.json", note: "说话人映射" },
    ],
    多模态: [
      { name: "pairs.jsonl", note: "图文对与要素标签" },
      { name: "elements.json", note: "事件要素结构化结果" },
    ],
    点云: [
      { name: "labels.json", note: "要素类别与包围盒" },
      { name: "frames.json", note: "帧序与配准参数" },
    ],
    时序: [
      { name: "series.parquet", note: "路段时序指标" },
      { name: "segments.json", note: "路段与设备映射" },
    ],
  };
  const dataDir: Record<string, string> = {
    视频: "videos/", 图像: "images/", 文本: "texts/", 音频: "audio/",
    多模态: "multimodal/", 点云: "pointcloud/", 时序: "series/",
  };
  return [
    { name: "data/", note: `原始数据 ${ds.fileCount}`, children: [{ name: dataDir[ds.dataType] || "raw/", note: "按采集批次分目录" }] },
    { name: "annotations/", note: "标注结果", children: anno[ds.dataType] || [] },
    {
      name: "metadata/",
      note: "元信息登记",
      children: [
        { name: "dataset.jsonld", note: `${ds.meta.standard} 元信息` },
        { name: "schema.json", note: `${ds.meta.items} 个字段定义` },
      ],
    },
    {
      name: "quality/",
      note: "随包质量材料",
      children: [
        { name: `${ds.quality.reportId}.pdf`, note: "正式质量报告" },
        { name: "dimensions.json", note: "六维评分明细" },
      ],
    },
    { name: "README.md", note: "使用说明与许可声明" },
  ];
}

// 概览 · 文件清单
export function fileList(ds: Dataset) {
  const total = ds.quality.reportId ? ds.quality.reportId : "—";
  return [
    { name: "data/", type: "目录", size: ds.scale, count: ds.fileCount },
    { name: "annotations/labels.json", type: "JSON", size: "268 MB", count: "—" },
    { name: "metadata/dataset.jsonld", type: "JSON-LD", size: "42 KB", count: "—" },
    { name: "quality/" + total + ".pdf", type: "PDF", size: "1.8 MB", count: "—" },
    { name: "README.md", type: "Markdown", size: "12 KB", count: "—" },
  ];
}

// ---------------------------------------------------------------- 语料库（数据标注 · 语料库管理）
export type CorpusItem = {
  id: string;
  name: string;
  task: string;
  domain: string;
  annoType: string;
  format: string;
  entries: number;
  size: string;
  avgLen: string;
  updatedAt: string;
  status: "已入库" | "同步中" | "已归档";
  owner: string;
};

export const CORPUS_LIST: CorpusItem[] = [
  { id: "COR-2026-001", name: "交通事件描述语料库", task: "交通视频行为识别产线", domain: "智慧交通", annoType: "文本描述", format: "JSONL", entries: 12480, size: "86 MB", avgLen: "142 字", updatedAt: "2026-10-28", status: "已入库", owner: "陈立" },
  { id: "COR-2026-002", name: "应急事件要素抽取语料库", task: "应急多模态事件产线", domain: "应急管理", annoType: "实体抽取", format: "JSON", entries: 6120, size: "42 MB", avgLen: "96 字", updatedAt: "2026-10-27", status: "已入库", owner: "周敏" },
  { id: "COR-2026-003", name: "医疗问答指令语料库", task: "医疗问答智能体产线", domain: "医疗健康", annoType: "指令对话", format: "JSONL", entries: 8240, size: "118 MB", avgLen: "268 字", updatedAt: "2026-10-26", status: "已入库", owner: "李文博" },
  { id: "COR-2026-004", name: "工业缺陷描述语料库", task: "工业缺陷检测产线", domain: "智能制造", annoType: "文本描述", format: "JSONL", entries: 4860, size: "31 MB", avgLen: "78 字", updatedAt: "2026-10-24", status: "已入库", owner: "赵启明" },
  { id: "COR-2026-005", name: "城市治理工单分类语料库", task: "城市工单分派产线", domain: "城市治理", annoType: "文本分类", format: "CSV", entries: 15320, size: "64 MB", avgLen: "54 字", updatedAt: "2026-10-23", status: "已入库", owner: "孙浩" },
  { id: "COR-2026-006", name: "多模态图文对语料库", task: "多模态预训练产线", domain: "通用", annoType: "图文对齐", format: "Parquet", entries: 22400, size: "1.2 GB", avgLen: "—", updatedAt: "2026-10-22", status: "同步中", owner: "王倩" },
  { id: "COR-2026-007", name: "语音转写校对语料库", task: "语音识别产线", domain: "通用", annoType: "语音转写", format: "JSONL", entries: 3760, size: "420 MB", avgLen: "182 字", updatedAt: "2026-10-20", status: "已入库", owner: "王倩" },
  { id: "COR-2026-008", name: "医疗知识三元组语料库", task: "医疗知识图谱产线", domain: "医疗健康", annoType: "关系抽取", format: "TSV", entries: 9640, size: "28 MB", avgLen: "—", updatedAt: "2026-10-18", status: "已入库", owner: "李文博" },
  { id: "COR-2026-009", name: "交通信号配时说明语料库", task: "交通信号优化产线", domain: "智慧交通", annoType: "文本描述", format: "JSONL", entries: 2140, size: "16 MB", avgLen: "126 字", updatedAt: "2026-10-15", status: "已归档", owner: "陈立" },
  { id: "COR-2026-010", name: "应急演练脚本语料库", task: "应急演练推演产线", domain: "应急管理", annoType: "指令对话", format: "JSON", entries: 1580, size: "22 MB", avgLen: "310 字", updatedAt: "2026-10-12", status: "已入库", owner: "周敏" },
];

export const CORPUS_DOMAINS = ["智慧交通", "应急管理", "医疗健康", "智能制造", "城市治理", "通用"];
export const CORPUS_ANNO_TYPES = ["文本描述", "实体抽取", "指令对话", "文本分类", "图文对齐", "语音转写", "关系抽取"];
export const CORPUS_FORMATS = ["JSONL", "JSON", "CSV", "Parquet", "TSV"];

export function corpusDist(c: CorpusItem) {
  const base = c.entries;
  return {
    domain: [
      { label: c.domain, value: Math.round(base * 0.62), color: "#4f46e5" },
      { label: "关联领域", value: Math.round(base * 0.26), color: "#8b5cf6" },
      { label: "跨域泛化", value: base - Math.round(base * 0.62) - Math.round(base * 0.26), color: "#14b8a6" },
    ],
    quality: [
      { label: "人工复核通过", value: Math.round(base * 0.84), color: "#16a34a" },
      { label: "待复核", value: Math.round(base * 0.11), color: "#f59e0b" },
      { label: "已剔除", value: base - Math.round(base * 0.84) - Math.round(base * 0.11), color: "#dc2626" },
    ],
  };
}
