// 共享 Mock 数据 - 数据集管理
export interface DatasetVersion {
  version: string;
  date: string;
  item_count: number;
  uploader: string;
  note: string;
}

export interface Dataset {
  id: string;
  name: string;
  type: string; // 数据类型
  modality?: string; // 数据模态
  source_type: string;
  source_name: string;
  item_count: number;
  quality_score?: number; // 质量分
  quality_status: string;
  task_name: string; // 关联任务名称
  task_type?: string; // 任务类型
  versions: DatasetVersion[];
  created_at: string;
  has_smart_annotation?: boolean;
  smart_annotation_count?: number;
  scene_name?: string; // 关联场景
  annotation_type?: string; // 标注类型（Label Studio 控件）
}

// 数据类型字典
export const DATA_TYPES = [
  { value: "image", label: "图像", description: "单张图像数据", ls_control: "Image" },
  { value: "video", label: "视频", description: "视频流或视频片段", ls_control: "Video" },
  { value: "text", label: "文本", description: "纯文本或文档", ls_control: "Text" },
  { value: "audio", label: "音频", description: "语音或声音数据", ls_control: "Audio" },
  { value: "timeseries", label: "时序数据", description: "时间序列信号数据", ls_control: "TimeSeries" },
  { value: "multimodal", label: "多模态", description: "多种数据类型组合", ls_control: "HyperText" },
  { value: "pointcloud", label: "点云", description: "3D 点云数据", ls_control: "PointCloud" },
];

// 数据质量状态字典
export const QUALITY_STATUS = [
  { value: "passed", label: "通过", color: "#10b981" },
  { value: "pending", label: "待检测", color: "#f59e0b" },
  { value: "failed", label: "未通过", color: "#ef4444" },
  { value: "unchecked", label: "未检测", color: "#94a3b8" },
];

// 数据集来源字典
export const DATA_SOURCES = [
  { value: "cloud", label: "云存储", description: "OSS/S3/COS 等对象存储" },
  { value: "local", label: "本地上传", description: "本地文件直接上传" },
  { value: "api", label: "API 接入", description: "通过 API 实时拉取" },
  { value: "database", label: "数据库", description: "关系型或非关系型数据库" },
  { value: "stream", label: "实时流", description: "Kafka/RTSP 等流媒体" },
  { value: "platform", label: "平台数据", description: "平台已有数据" },
  { value: "public", label: "公开数据集", description: "第三方公开数据集" },
];

// 交通事件识别相关数据集（基于 V2 仿真）
export const TRAFFIC_SCENE_DATASETS: Dataset[] = [
  {
    id: "traffic-ds-1",
    name: "交通事故检测数据集",
    type: "video",
    modality: "video",
    source_type: "cloud",
    source_name: "高速公路监控中心",
    item_count: 8500,
    quality_status: "passed",
    task_name: "交通事故检测",
    scene_name: "交通事件识别",
    has_smart_annotation: true,
    smart_annotation_count: 2,
    versions: [
      { version: "v2.1", date: "2026-04-10", item_count: 3500, uploader: "王强", note: "新增雨天事故场景" },
      { version: "v2.0", date: "2026-04-05", item_count: 5000, uploader: "李明", note: "扩充夜间事故样本" },
      { version: "v1.0", date: "2026-04-01", item_count: 3000, uploader: "张伟", note: "初始版本" },
    ],
    created_at: "2026-04-01",
  },
  {
    id: "traffic-ds-2",
    name: "交通事件分类数据集",
    type: "image",
    modality: "image",
    source_type: "cloud",
    source_name: "城市道路监控",
    item_count: 12000,
    quality_status: "passed",
    task_name: "事件类型分类",
    scene_name: "交通事件识别",
    has_smart_annotation: true,
    smart_annotation_count: 1,
    versions: [
      { version: "v1.2", date: "2026-04-08", item_count: 5000, uploader: "赵磊", note: "新增7类事件标注" },
      { version: "v1.1", date: "2026-04-03", item_count: 4000, uploader: "张伟", note: "扩充拥堵类样本" },
      { version: "v1.0", date: "2026-04-01", item_count: 3000, uploader: "李娜", note: "初始版本" },
    ],
    created_at: "2026-04-01",
  },
  {
    id: "traffic-ds-3",
    name: "车辆轨迹跟踪数据集",
    type: "video",
    modality: "video",
    source_type: "cloud",
    source_name: "高速收费卡口",
    item_count: 4200,
    quality_status: "pending",
    task_name: "车辆轨迹跟踪",
    scene_name: "交通事件识别",
    has_smart_annotation: true,
    smart_annotation_count: 1,
    versions: [
      { version: "v1.0", date: "2026-04-09", item_count: 4200, uploader: "王芳", note: "初始版本" },
    ],
    created_at: "2026-04-09",
  },
  {
    id: "traffic-ds-4",
    name: "事故严重程度评估数据集",
    type: "image",
    modality: "image",
    source_type: "local",
    source_name: "事故档案室",
    item_count: 2800,
    quality_status: "unchecked",
    task_name: "事故严重程度评估",
    scene_name: "交通事件识别",
    has_smart_annotation: false,
    smart_annotation_count: 0,
    versions: [
      { version: "v1.0", date: "2026-04-11", item_count: 2800, uploader: "张伟", note: "历史事故照片整理" },
    ],
    created_at: "2026-04-11",
  },
];

// 五核心任务数据集（基于 V2 仿真）
export const CORE_TASK_DATASETS: Dataset[] = [
  {
    id: "ds_det_001",
    name: "COCO-Traffic-2024",
    type: "image",
    modality: "image",
    source_type: "cloud",
    source_name: "G15高速+城市卡口",
    item_count: 186420,
    quality_score: 94.2,
    quality_status: "passed",
    task_name: "交通目标检测",
    task_type: "目标检测",
    annotation_type: "rect",
    scene_name: "交通事件识别",
    versions: [
      { version: "v3.0", date: "2026-04-18", item_count: 50000, uploader: "张明远", note: "扩充夜间样本" },
      { version: "v2.0", date: "2026-04-10", item_count: 40000, uploader: "李晓峰", note: "新增雨天场景" },
      { version: "v1.0", date: "2026-04-01", item_count: 186420, uploader: "王雪梅", note: "初始版本" },
    ],
    created_at: "2026-04-01",
    has_smart_annotation: true,
    smart_annotation_count: 1,
  },
  {
    id: "ds_track_001",
    name: "MOT17-Traffic",
    type: "video",
    modality: "video",
    source_type: "stream",
    source_name: "无人机俯拍视频",
    item_count: 8640,
    quality_score: 91.7,
    quality_status: "pending",
    task_name: "多目标跟踪",
    task_type: "多目标跟踪",
    annotation_type: "track",
    scene_name: "交通事件识别",
    versions: [
      { version: "v1.1", date: "2026-04-15", item_count: 8640, uploader: "李晓峰", note: "扩充遮挡场景" },
      { version: "v1.0", date: "2026-04-05", item_count: 4800, uploader: "刘宇轩", note: "初始版本" },
    ],
    created_at: "2026-04-05",
    has_smart_annotation: true,
    smart_annotation_count: 1,
  },
  {
    id: "ds_beh_001",
    name: "TrafficBehavior-V3",
    type: "video",
    modality: "video",
    source_type: "cloud",
    source_name: "交通行为语义视频片段",
    item_count: 34200,
    quality_score: 89.5,
    quality_status: "pending",
    task_name: "交通行为识别",
    task_type: "交通行为识别",
    annotation_type: "segment",
    scene_name: "交通事件识别",
    versions: [
      { version: "v1.2", date: "2026-04-18", item_count: 9800, uploader: "王雪梅", note: "新增15类行为" },
      { version: "v1.0", date: "2026-04-08", item_count: 34200, uploader: "陈志远", note: "初始版本" },
    ],
    created_at: "2026-04-08",
    has_smart_annotation: true,
    smart_annotation_count: 1,
  },
  {
    id: "ds_event_001",
    name: "TrafficEvent-Dataset-2026",
    type: "multimodal",
    modality: "multimodal",
    source_type: "cloud",
    source_name: "历史事故案例数据库",
    item_count: 52800,
    quality_score: 92.8,
    quality_status: "pending",
    task_name: "交通事件识别",
    task_type: "交通事件识别",
    annotation_type: "event",
    scene_name: "交通事件识别",
    versions: [
      { version: "v2.1", date: "2026-04-20", item_count: 7980, uploader: "陈志远", note: "扩充8类事件" },
      { version: "v1.0", date: "2026-04-03", item_count: 52800, uploader: "刘宇轩", note: "初始版本" },
    ],
    created_at: "2026-04-03",
    has_smart_annotation: true,
    smart_annotation_count: 1,
  },
  {
    id: "ds_ts_001",
    name: "TrafficTimeSeries-2026",
    type: "timeseries",
    modality: "timeseries",
    source_type: "database",
    source_name: "高德浮动车GPS轨迹流",
    item_count: 2160000,
    quality_score: 96.1,
    quality_status: "passed",
    task_name: "时序建模与异常分析",
    task_type: "时序分析",
    annotation_type: "timeseries",
    scene_name: "交通事件识别",
    versions: [
      { version: "v0.8", date: "2026-04-21", item_count: 480000, uploader: "刘宇轩", note: "扩充节假日数据" },
      { version: "v0.4", date: "2026-04-15", item_count: 2160000, uploader: "李晓峰", note: "初始版本" },
    ],
    created_at: "2026-04-15",
    has_smart_annotation: true,
    smart_annotation_count: 1,
  },
];

export const MOCK_DATASETS: Dataset[] = [
  // 五核心任务数据集（优先展示）
  ...CORE_TASK_DATASETS,
  // 原有数据集
  {
    id: "ds-1", name: "客服意图识别数据集", type: "text", source_type: "cloud", source_name: "生产环境OSS",
    item_count: 15800, quality_status: "passed", task_name: "意图识别v2.1",
    versions: [
      { version: "v2.1", date: "2026-04-08", item_count: 5800, uploader: "张伟", note: "新增春季话术数据" },
      { version: "v2.0", date: "2026-03-25", item_count: 10000, uploader: "李娜", note: "扩充意图类别" },
      { version: "v1.0", date: "2026-03-01", item_count: 5000, uploader: "张伟", note: "初始版本" },
    ],
    created_at: "2026-03-01",
  },
  {
    id: "ds-2", name: "产品分类图像集", type: "image", source_type: "local", source_name: "本地文件",
    item_count: 8500, quality_status: "passed", task_name: "商品分类",
    versions: [
      { version: "v1.2", date: "2026-04-05", item_count: 3500, uploader: "王芳", note: "新增家电类目" },
      { version: "v1.1", date: "2026-03-20", item_count: 5000, uploader: "张伟", note: "优化图片质量" },
      { version: "v1.0", date: "2026-03-10", item_count: 3000, uploader: "张伟", note: "初始版本" },
    ],
    created_at: "2026-03-10",
  },
  {
    id: "ds-3", name: "情感分析语料库", type: "text", source_type: "platform", source_name: "平台数据",
    item_count: 12000, quality_status: "pending", task_name: "情感分析v1.0",
    versions: [{ version: "v1.0", date: "2026-04-03", item_count: 12000, uploader: "李娜", note: "初始版本" }],
    created_at: "2026-04-03",
  },
  {
    id: "ds-4", name: "语音指令识别集", type: "audio", source_type: "cloud", source_name: "备份OBS",
    item_count: 4200, quality_status: "failed", task_name: "语音指令",
    versions: [{ version: "v1.0", date: "2026-04-01", item_count: 4200, uploader: "张伟", note: "初始版本" }],
    created_at: "2026-04-01",
  },
  {
    id: "ds-5", name: "产品介绍视频集", type: "video", source_type: "cloud", source_name: "腾讯COS",
    item_count: 620, quality_status: "passed", task_name: "视频理解v1.0",
    versions: [{ version: "v1.0", date: "2026-04-05", item_count: 620, uploader: "赵磊", note: "初始版本" }],
    created_at: "2026-04-05",
  },
  {
    id: "ds-6", name: "图文多模态语料", type: "multimodal", source_type: "public", source_name: "HuggingFace",
    item_count: 32000, quality_status: "pending", task_name: "多模态理解",
    versions: [{ version: "v1.0", date: "2026-04-06", item_count: 32000, uploader: "李娜", note: "公开数据集导入" }],
    created_at: "2026-04-06",
  },
  {
    id: "ds-7", name: "客服多轮对话集", type: "text", source_type: "platform", source_name: "平台数据",
    item_count: 9800, quality_status: "passed", task_name: "对话系统v2.0",
    versions: [
      { version: "v2.0", date: "2026-04-07", item_count: 4800, uploader: "张伟", note: "扩充多轮对话" },
      { version: "v1.0", date: "2026-03-20", item_count: 5000, uploader: "李娜", note: "初始版本" },
    ],
    created_at: "2026-03-20",
  },
  {
    id: "ds-8", name: "知识图谱三元组集", type: "text", source_type: "platform", source_name: "平台数据",
    item_count: 55000, quality_status: "passed", task_name: "知识抽取",
    versions: [{ version: "v1.0", date: "2026-04-02", item_count: 55000, uploader: "王芳", note: "初始版本" }],
    created_at: "2026-04-02",
  },
  {
    id: "ds-9", name: "语义向量训练集", type: "text", source_type: "platform", source_name: "平台数据",
    item_count: 120000, quality_status: "pending", task_name: "语义检索v1.0",
    versions: [{ version: "v1.0", date: "2026-04-08", item_count: 120000, uploader: "赵磊", note: "初始版本" }],
    created_at: "2026-04-08",
  },
  {
    id: "ds-10", name: "通用指令微调集", type: "text", source_type: "public", source_name: "魔搭社区",
    item_count: 48000, quality_status: "passed", task_name: "LLM指令微调",
    versions: [
      { version: "v1.1", date: "2026-04-09", item_count: 18000, uploader: "李娜", note: "新增COT指令数据" },
      { version: "v1.0", date: "2026-03-28", item_count: 30000, uploader: "张伟", note: "初始版本" },
    ],
    created_at: "2026-03-28",
  },
];

export const STORAGE_KEY = "taskforge_datasets";
