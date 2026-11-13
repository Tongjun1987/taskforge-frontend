// 数据服务中心 —— 高质量数据集目录（纯前端演示数据）
// 详情页字段口径对齐「发布信息 / 数据预览 / 数据使用」三段式：
//   · 发布信息：登记类元数据（唯一标识码、模态、分类、行业、主体、领域、规模、场景说明、使用限制…）
//   · 数据预览：目录结构 + 样本记录 + 标注示例
//   · 数据使用：MinIO 对象存储的访问路径与三种取数方式（控制台预签名 / mc / S3 SDK）

export type StorageFile = {
  path: string;
  size: string;
  kind: "目录" | "清单" | "数据" | "标注" | "文档";
  note?: string;
};

export type DataSample = {
  columns: string[];
  rows: string[][];
};

export type DatasetStorage = {
  /** 对象存储类型，当前统一为 MinIO */
  provider: string;
  /** S3 兼容端点，SDK / mc 都用它 */
  endpoint: string;
  /** 控制台地址 */
  consoleUrl: string;
  bucket: string;
  /** bucket 内的对象前缀，不带首尾斜杠 */
  prefix: string;
  region: string;
  objectCount: number;
  totalSize: string;
  /** 访问级别：公开可读 / 授权后访问 */
  accessLevel: string;
  /** 预签名下载链接有效期 */
  presignTtl: string;
  /** 调用配额说明 */
  quota: string;
  files: StorageFile[];
};

export type Dataset = {
  id: string;
  name: string;
  /** 资源版本，列表标题后带 V1 / V2 */
  version: string;
  subtitle: string;
  /** 头部标签：模态 / 分类 / 任务 / 领域 / 行业 */
  chips: string[];

  // —— 列表字段 ——
  category: "nlp" | "cv" | "audio" | "multimodal" | "tabular" | "timeseries" | "graph";
  subCategory: string;
  org: string;
  desc: string;
  size: string;
  samples: number;
  license: string;
  downloads: number;
  likes: number;
  stars: number;
  tags: string[];
  format: string;
  updated: string;
  hot: boolean;

  // —— 发布信息（对照截图字段） ——
  publishAt: string;
  publisher: string;
  /** 数据集唯一标识码 */
  uid: string;
  /** 数据集模态 */
  modality: string;
  /** 数据集分类 */
  dataCategory: string;
  /** 数据集所属行业 */
  industry: string;
  /** 数据主体 */
  subject: string;
  /** 数据集领域 */
  domain: string;
  /** 数据集规模（展示口径） */
  scaleText: string;
  /** 数据集应用场景说明 */
  sceneDesc: string;
  /** 数据集使用限制 */
  usageLimit: string;
  hasPii: "是" | "否";
  needAuth: "是" | "否";
  docs: string;
  attachments: string;

  // —— 存储与使用 ——
  storage: DatasetStorage;
  sample: DataSample | null;
  /** 样本之外的补充说明，例如标注类别清单 */
  sampleNote?: string;
};

/** 对象存储统一端点（演示环境） */
export const MINIO_ENDPOINT = "https://minio.lingshu-data.cn";
export const MINIO_CONSOLE = "https://minio.lingshu-data.cn/browser";
export const MINIO_BUCKET = "lingshu-datasets";

/** 拼出 s3://bucket/prefix/ 形式的规范路径 */
export function s3Path(d: Dataset): string {
  return `s3://${d.storage.bucket}/${d.storage.prefix}/`;
}

/** 拼出控制台浏览地址 */
export function consolePath(d: Dataset): string {
  return `${d.storage.consoleUrl}/${d.storage.bucket}/${d.storage.prefix}/`;
}

/** 拼出对象完整 HTTP 路径（SDK / curl 用） */
export function objectUrl(d: Dataset, key = ""): string {
  return `${d.storage.endpoint}/${d.storage.bucket}/${d.storage.prefix}/${key}`;
}

const DIR = (path: string, note?: string): StorageFile => ({ path, size: "—", kind: "目录", note });
const MANIFEST: StorageFile = { path: "manifest.json", size: "12 KB", kind: "清单", note: "对象清单与校验值" };
const README: StorageFile = { path: "README.md", size: "6 KB", kind: "文档", note: "字段说明与取数示例" };
const LICENSE: StorageFile = { path: "LICENSE.txt", size: "3 KB", kind: "文档", note: "许可与使用限制" };

export const DATASETS: Dataset[] = [
  {
    id: "d13",
    name: "UAV航拍影像标注",
    version: "V1",
    subtitle: "UAV航拍影像标注结果集，5张航拍影像共7个目标框（桥梁/采砂船/漂浮物/岸坡违建/排汊口/岸线侵蚀）",
    chips: ["图像数据", "行业专识", "目标检测", "低空经济", "水利、环境和公共设施管理业"],
    category: "cv",
    subCategory: "目标检测",
    org: "零数科技 · 城市数据空间部",
    desc: "面向河道巡查与水利执法业务的无人机航拍影像标注集，覆盖桥梁、采砂船、漂浮物、岸坡违建等目标",
    size: "1 MB",
    samples: 5,
    license: "受限使用（需授权）",
    downloads: 126,
    likes: 18,
    stars: 24,
    tags: ["航拍影像", "河道巡查", "目标检测"],
    format: "JPG + COCO JSON",
    updated: "9月22日",
    hot: true,
    publishAt: "2026-09-22 18:32:50",
    publisher: "jun.tong@lingshu.net",
    uid: "035586407LLSINSIFC3TJJFEJOUGCGV",
    modality: "目标检测",
    dataCategory: "行业专识",
    industry: "水利、环境和公共设施管理业",
    subject: "公共数据",
    domain: "低空经济",
    scaleText: "1 MB",
    sceneDesc:
      "面向河道巡查与水利执法业务：基于无人机航拍影像自动识别桥梁、采砂船、水面漂浮物、岸坡违建、排汊口、岸线侵蚀等目标，支撑河道乱占、乱采、乱堆、乱建问题的智能发现、河湖长制巡查取证与整改闭环。可直接用于河道目标检测模型（YOLOv8 等）的训练、微调与效果评测。",
    usageLimit:
      "数据来源于河道巡查航拍影像，含地理空间信息，仅限模型训练与算法验证使用，不得对外提供原始影像或用于商业转售。涉及河湖管理敏感区域，使用时应遵守水利行业与测绘地理信息相关管理规定。",
    hasPii: "否",
    needAuth: "是",
    docs: "—",
    attachments: "—",
    storage: {
      provider: "MinIO",
      endpoint: MINIO_ENDPOINT,
      consoleUrl: MINIO_CONSOLE,
      bucket: MINIO_BUCKET,
      prefix: "datasets/uav-aerial-annotation/v1",
      region: "cn-east-1",
      objectCount: 9,
      totalSize: "1.02 MB",
      accessLevel: "授权后访问",
      presignTtl: "24 小时",
      quota: "单账号 100 次/分钟，日下行流量 5 GB",
      files: [
        DIR("images/", "5 张原始航拍影像"),
        { path: "images/uav_river_001.jpg", size: "236 KB", kind: "数据" },
        { path: "images/uav_river_002.jpg", size: "214 KB", kind: "数据" },
        { path: "images/uav_river_003.jpg", size: "208 KB", kind: "数据" },
        { path: "images/uav_river_004.jpg", size: "196 KB", kind: "数据" },
        { path: "images/uav_river_005.jpg", size: "188 KB", kind: "数据" },
        DIR("annotations/", "COCO 格式标注"),
        { path: "annotations/instances_default.json", size: "8 KB", kind: "标注", note: "7 个目标框 / 6 类" },
        { path: "splits/train.txt", size: "1 KB", kind: "清单", note: "训练集划分（5 张全量）" },
        MANIFEST,
        README,
        LICENSE,
      ],
    },
    sample: {
      columns: ["image_id", "file_name", "width", "height", "boxes", "classes"],
      rows: [
        ["1", "uav_river_001.jpg", "1920", "1080", "2", "bridge, floating_debris"],
        ["2", "uav_river_002.jpg", "1920", "1080", "1", "sand_dredger"],
        ["3", "uav_river_003.jpg", "1920", "1080", "2", "slope_illegal_build, bank_erosion"],
        ["4", "uav_river_004.jpg", "1920", "1080", "1", "outfall"],
        ["5", "uav_river_005.jpg", "1920", "1080", "1", "bridge"],
      ],
    },
    sampleNote: "标注类别：bridge（桥梁）、sand_dredger（采砂船）、floating_debris（水面漂浮物）、slope_illegal_build（岸坡违建）、outfall（排汊口）、bank_erosion（岸线侵蚀）",
  },
  {
    id: "d1",
    name: "COIG-CQIA 中文高质量指令数据集",
    version: "V2",
    subtitle: "多领域中文指令微调数据集，含问答、摘要、翻译、代码等任务，适合 SFT 阶段使用",
    chips: ["文本数据", "公开数据", "指令微调", "通用人工智能", "信息传输、软件和信息技术服务业"],
    category: "nlp",
    subCategory: "指令微调",
    org: "COIG",
    desc: "涵盖多个领域的高质量中文指令微调数据集，包含问答、摘要、翻译、代码等任务",
    size: "3.2GB",
    samples: 68420,
    license: "CC BY 4.0",
    downloads: 89230,
    likes: 2340,
    stars: 3670,
    tags: ["中文", "指令微调", "多领域"],
    format: "JSON",
    updated: "3天前",
    hot: true,
    publishAt: "2026-08-14 10:12:04",
    publisher: "wang.qian@lingshu.net",
    uid: "035586407LLSIN582K7RQXMDTFA3HWPN",
    modality: "文本",
    dataCategory: "公开数据",
    industry: "信息传输、软件和信息技术服务业",
    subject: "公开数据",
    domain: "通用人工智能",
    scaleText: "3.2 GB",
    sceneDesc:
      "面向中文大模型的指令微调（SFT）阶段：直接作为指令-回复对语料，训练模型的任务理解、指令跟随与格式遵从能力。也可按子任务切分，用于对话、摘要、翻译、代码生成等单项能力的定向评测。",
    usageLimit: "遵循 CC BY 4.0 许可，可商用，需保留原始出处与署名；不得用于生成违法违规内容或训练有害模型。",
    hasPii: "否",
    needAuth: "否",
    docs: "COIG-CQIA 数据说明.pdf",
    attachments: "—",
    storage: {
      provider: "MinIO",
      endpoint: MINIO_ENDPOINT,
      consoleUrl: MINIO_CONSOLE,
      bucket: MINIO_BUCKET,
      prefix: "datasets/coig-cqia-zh-instruction/v2",
      region: "cn-east-1",
      objectCount: 6,
      totalSize: "3.21 GB",
      accessLevel: "公开可读",
      presignTtl: "24 小时",
      quota: "单账号 200 次/分钟，日下行流量 20 GB",
      files: [
        DIR("data/", "按子任务切分的指令集"),
        { path: "data/coig_cqia_train.jsonl", size: "2.8 GB", kind: "数据", note: "62,140 条" },
        { path: "data/coig_cqia_dev.jsonl", size: "410 MB", kind: "数据", note: "6,280 条" },
        { path: "schema/instruction_schema.json", size: "9 KB", kind: "清单", note: "字段结构定义" },
        MANIFEST,
        README,
        LICENSE,
      ],
    },
    sample: {
      columns: ["id", "task_type", "instruction", "input", "output", "tokens"],
      rows: [
        ["100241", "问答", "解释什么是数据要素市场化配置", "", "数据要素市场化配置是指…", "386"],
        ["100242", "摘要", "为下面的新闻拟一条标题", "近日，某市发布…", "某市发布公共数据授权运营细则", "212"],
        ["100243", "翻译", "将下列句子译成英文", "河道巡查采用无人机航拍手段。", "River patrols use UAV aerial imagery.", "96"],
        ["100244", "代码", "写一个函数判断回文字符串", "", "def is_pal(s): …", "148"],
        ["100245", "问答", "简述河湖长制的主要职责", "", "河湖长制由各级党政领导…", "524"],
      ],
    },
  },
  {
    id: "d2",
    name: "COCO-2024 图像描述与检测数据集",
    version: "V3",
    subtitle: "33 万张图像，支持目标检测、实例分割与图像描述三项任务",
    chips: ["图像数据", "公开数据", "目标检测", "通用人工智能", "信息传输、软件和信息技术服务业"],
    category: "cv",
    subCategory: "目标检测",
    org: "Microsoft",
    desc: "COCO数据集2024版扩展，包含33万张图像，支持目标检测、分割和图像描述",
    size: "25.6GB",
    samples: 330000,
    license: "CC BY 4.0",
    downloads: 234560,
    likes: 6780,
    stars: 9120,
    tags: ["图像描述", "目标检测", "分割"],
    format: "JSON + Images",
    updated: "1周前",
    hot: true,
    publishAt: "2026-07-02 09:30:11",
    publisher: "chen.li@lingshu.net",
    uid: "035586407LLSIN7BQ4WDX8YMRT2KGHCVN",
    modality: "目标检测",
    dataCategory: "公开数据",
    industry: "信息传输、软件和信息技术服务业",
    subject: "公开数据",
    domain: "计算机视觉",
    scaleText: "25.6 GB",
    sceneDesc:
      "通用视觉预训练与检测/分割任务的基准数据：可用于 YOLO、DETR、Mask R-CNN 等检测与分割模型的训练与横向对比，也可作为图文对齐与图像描述模型的监督数据。",
    usageLimit: "遵循 CC BY 4.0，图像版权归原作者所有；不得用于人脸识别等生物特征识别场景。",
    hasPii: "否",
    needAuth: "否",
    docs: "COCO-2024 标注规范.pdf",
    attachments: "instances_val2017.json",
    storage: {
      provider: "MinIO",
      endpoint: MINIO_ENDPOINT,
      consoleUrl: MINIO_CONSOLE,
      bucket: MINIO_BUCKET,
      prefix: "datasets/coco-2024/v3",
      region: "cn-east-1",
      objectCount: 330004,
      totalSize: "25.63 GB",
      accessLevel: "公开可读",
      presignTtl: "24 小时",
      quota: "单账号 200 次/分钟，日下行流量 50 GB",
      files: [
        DIR("images/train2017/", "118,287 张"),
        DIR("images/val2017/", "5,000 张"),
        DIR("annotations/", "检测/分割/描述标注"),
        { path: "annotations/instances_train2017.json", size: "468 MB", kind: "标注" },
        { path: "annotations/captions_train2017.json", size: "92 MB", kind: "标注" },
        MANIFEST,
        README,
        LICENSE,
      ],
    },
    sample: {
      columns: ["image_id", "file_name", "objects", "categories", "captions"],
      rows: [
        ["000000039769", "000000039769.jpg", "4", "cat, remote", "2"],
        ["000000259640", "000000259640.jpg", "2", "person, bicycle", "3"],
        ["000000127517", "000000127517.jpg", "7", "car, person, traffic light", "4"],
        ["000000424194", "000000424194.jpg", "1", "dog", "2"],
        ["000000073333", "000000073333.jpg", "3", "pizza, dining table", "5"],
      ],
    },
  },
  {
    id: "d3",
    name: "AIShell-2 中文语音识别数据集",
    version: "V1",
    subtitle: "1000 小时中文语音识别训练数据，覆盖多方言与多录制场景",
    chips: ["音频数据", "公开数据", "语音识别", "通用人工智能", "信息传输、软件和信息技术服务业"],
    category: "audio",
    subCategory: "语音识别",
    org: "AIShell",
    desc: "1000小时中文语音识别训练数据，覆盖多方言和多场景",
    size: "18.4GB",
    samples: 500000,
    license: "CC BY-SA 4.0",
    downloads: 56780,
    likes: 1890,
    stars: 2560,
    tags: ["中文语音", "ASR", "多方言"],
    format: "WAV + JSON",
    updated: "2周前",
    hot: false,
    publishAt: "2026-06-18 14:05:37",
    publisher: "li.wenbo@lingshu.net",
    uid: "035586407LLSIN9C4TZPK2XVNRB7YQFMA",
    modality: "音频",
    dataCategory: "公开数据",
    industry: "信息传输、软件和信息技术服务业",
    subject: "公开数据",
    domain: "智能语音",
    scaleText: "18.4 GB",
    sceneDesc:
      "中文语音识别（ASR）模型的训练与评测：16kHz 单声道录音配逐字转写，可直接用于 Conformer、Whisper 等模型的微调；方言子集可用于口音鲁棒性测试。",
    usageLimit: "遵循 CC BY-SA 4.0，衍生作品需同许可共享；说话人已脱敏，不得尝试重识别。",
    hasPii: "否",
    needAuth: "否",
    docs: "AIShell-2 转写规范.pdf",
    attachments: "—",
    storage: {
      provider: "MinIO",
      endpoint: MINIO_ENDPOINT,
      consoleUrl: MINIO_CONSOLE,
      bucket: MINIO_BUCKET,
      prefix: "datasets/aishell-2/v1",
      region: "cn-east-1",
      objectCount: 500002,
      totalSize: "18.42 GB",
      accessLevel: "公开可读",
      presignTtl: "24 小时",
      quota: "单账号 200 次/分钟，日下行流量 30 GB",
      files: [
        DIR("wav/train/", "456,000 条 16kHz 单声道"),
        DIR("wav/dev/", "22,000 条"),
        DIR("wav/test/", "22,000 条"),
        { path: "transcript/train.jsonl", size: "64 MB", kind: "标注", note: "逐字转写 + 时长" },
        { path: "transcript/dev.jsonl", size: "3 MB", kind: "标注" },
        MANIFEST,
        README,
        LICENSE,
      ],
    },
    sample: {
      columns: ["utt_id", "wav", "duration", "text", "dialect"],
      rows: [
        ["S0002", "wav/train/S0002.wav", "4.82", "河湖长制巡查覆盖全部河段", "普通话"],
        ["S0017", "wav/train/S0017.wav", "6.10", "无人机航拍发现一处岸坡违建", "普通话"],
        ["S0043", "wav/train/S0043.wav", "3.55", "采砂船不得在禁采区作业", "江淮官话"],
        ["S0088", "wav/train/S0088.wav", "5.27", "排汊口水质监测数据已上报", "西南官话"],
        ["S0121", "wav/train/S0121.wav", "4.03", "水面漂浮物需当日清理完毕", "粤语"],
      ],
    },
  },
  {
    id: "d4",
    name: "MME 多模态评估基准",
    version: "V1",
    subtitle: "多模态模型评估基准，覆盖感知与认知两大维度共 14 个子任务",
    chips: ["多模态数据", "公开数据", "评估基准", "通用人工智能", "信息传输、软件和信息技术服务业"],
    category: "multimodal",
    subCategory: "评估基准",
    org: "OpenGVLab",
    desc: "综合多模态模型评估基准，涵盖感知和认知两大维度14个子任务",
    size: "1.8GB",
    samples: 2860,
    license: "Apache 2.0",
    downloads: 45230,
    likes: 1560,
    stars: 2340,
    tags: ["评估基准", "多模态", "感知认知"],
    format: "JSON + Images",
    updated: "5天前",
    hot: true,
    publishAt: "2026-09-08 16:44:22",
    publisher: "zhou.min@lingshu.net",
    uid: "035586407LLSIN3F8WMQK6DTPJX2NBYVR",
    modality: "多模态",
    dataCategory: "公开数据",
    industry: "信息传输、软件和信息技术服务业",
    subject: "公开数据",
    domain: "多模态大模型",
    scaleText: "1.8 GB",
    sceneDesc:
      "多模态大模型的能力测评：按感知（存在性、数量、位置、颜色等）与认知（常识推理、文本理解、数值计算等）两类维度打分，输出分项准确率，适合作为模型选型与迭代回归的统一基线。",
    usageLimit: "遵循 Apache 2.0；评测题目不得用于模型训练，避免数据泄漏导致分数失真。",
    hasPii: "否",
    needAuth: "否",
    docs: "MME 评测说明.pdf",
    attachments: "—",
    storage: {
      provider: "MinIO",
      endpoint: MINIO_ENDPOINT,
      consoleUrl: MINIO_CONSOLE,
      bucket: MINIO_BUCKET,
      prefix: "datasets/mme-benchmark/v1",
      region: "cn-east-1",
      objectCount: 2863,
      totalSize: "1.81 GB",
      accessLevel: "公开可读",
      presignTtl: "24 小时",
      quota: "单账号 200 次/分钟，日下行流量 10 GB",
      files: [
        DIR("images/", "2,860 张评测图"),
        { path: "questions/perception.json", size: "1.2 MB", kind: "数据", note: "1,430 题" },
        { path: "questions/cognition.json", size: "1.1 MB", kind: "数据" },
        { path: "answers/ground_truth.json", size: "860 KB", kind: "标注" },
        MANIFEST,
        README,
        LICENSE,
      ],
    },
    sample: {
      columns: ["question_id", "dimension", "sub_task", "question", "answer"],
      rows: [
        ["P0101", "感知", "目标存在性", "图中是否有一艘船？", "是"],
        ["P0233", "感知", "目标计数", "图中有几处水面漂浮物？", "3"],
        ["P0418", "感知", "位置判断", "桥梁位于图像的上半部分吗？", "否"],
        ["C0077", "认知", "常识推理", "图中场景最可能发生在哪个季节？", "夏季"],
        ["C0152", "认知", "文本理解", "图中告示牌的文字含义是什么？", "禁止采砂"],
      ],
    },
  },
  {
    id: "d5",
    name: "Waymo Open Dataset",
    version: "V1",
    subtitle: "自动驾驶场景数据，含激光雷达点云、摄像头图像与 3D 标注",
    chips: ["点云数据", "公开数据", "3D 检测", "自动驾驶", "交通运输、仓储和邮政业"],
    category: "cv",
    subCategory: "自动驾驶",
    org: "Waymo",
    desc: "自动驾驶场景数据集，包含激光雷达点云、摄像头图像和3D标注",
    size: "120GB",
    samples: 200000,
    license: "Custom",
    downloads: 78900,
    likes: 3450,
    stars: 5670,
    tags: ["自动驾驶", "3D标注", "点云"],
    format: "TFRecord",
    updated: "1月前",
    hot: false,
    publishAt: "2026-05-21 11:20:48",
    publisher: "zhao.qiming@lingshu.net",
    uid: "035586407LLSIN6M2RYHXV9QDWFK3TZBN",
    modality: "点云",
    dataCategory: "公开数据",
    industry: "交通运输、仓储和邮政业",
    subject: "公开数据",
    domain: "自动驾驶",
    scaleText: "120 GB",
    sceneDesc:
      "自动驾驶感知模型的训练与评测：激光雷达点云 + 多路摄像头图像 + 3D 框标注，可用于 PointPillars、CenterPoint 等 3D 检测模型，以及多传感器融合实验。",
    usageLimit: "遵循 Waymo 非商业许可，仅限研究与学术用途；不得用于商业产品，不得再分发原始数据。",
    hasPii: "否",
    needAuth: "是",
    docs: "Waymo 许可条款.pdf",
    attachments: "—",
    storage: {
      provider: "MinIO",
      endpoint: MINIO_ENDPOINT,
      consoleUrl: MINIO_CONSOLE,
      bucket: MINIO_BUCKET,
      prefix: "datasets/waymo-open/v1",
      region: "cn-east-1",
      objectCount: 1000,
      totalSize: "120.4 GB",
      accessLevel: "授权后访问",
      presignTtl: "12 小时",
      quota: "单账号 50 次/分钟，日下行流量 200 GB",
      files: [
        DIR("training/", "798 段连续场景"),
        DIR("validation/", "202 段连续场景"),
        { path: "training/segment-10023947602400723454_1120_000_1140_000_with_camera_labels.tfrecord", size: "1.2 GB", kind: "数据" },
        { path: "training/segment-10203656353524179475_7625_000_7645_000_with_camera_labels.tfrecord", size: "1.1 GB", kind: "数据" },
        { path: "annotations/box3d_train.json", size: "2.4 GB", kind: "标注" },
        MANIFEST,
        README,
        LICENSE,
      ],
    },
    sample: {
      columns: ["segment", "frames", "lidar_points", "cameras", "boxes_3d"],
      rows: [
        ["10023947602400723454_1120_000", "200", "3,842,110", "5", "412"],
        ["10203656353524179475_7625_000", "200", "3,791,480", "5", "386"],
        ["10247954040621004675_2180_000", "200", "4,012,760", "5", "455"],
        ["11379231979797797538_1240_000", "200", "3,688,920", "5", "341"],
        ["13023908795159297347_3560_000", "200", "3,905,330", "5", "398"],
      ],
    },
  },
  {
    id: "d6",
    name: "Alpaca-GPT4 中文指令数据集",
    version: "V1",
    subtitle: "基于 GPT-4 生成的 5.2 万条中文指令-回复对，适合轻量 SFT",
    chips: ["文本数据", "公开数据", "指令微调", "通用人工智能", "信息传输、软件和信息技术服务业"],
    category: "nlp",
    subCategory: "指令微调",
    org: "Stanford",
    desc: "基于GPT-4生成的中文指令数据集，包含5.2万条高质量指令-回复对",
    size: "890MB",
    samples: 52000,
    license: "MIT",
    downloads: 156780,
    likes: 4560,
    stars: 6890,
    tags: ["GPT-4", "中文指令", "SFT"],
    format: "JSON",
    updated: "3周前",
    hot: false,
    publishAt: "2026-04-09 15:58:02",
    publisher: "wang.qian@lingshu.net",
    uid: "035586407LLSIN8P4VCXZ7KQWRHT2MNDY",
    modality: "文本",
    dataCategory: "公开数据",
    industry: "信息传输、软件和信息技术服务业",
    subject: "公开数据",
    domain: "通用人工智能",
    scaleText: "890 MB",
    sceneDesc:
      "小参数模型（1B~7B）的指令微调基线语料：单轮指令-回复对，长度分布集中，适合做快速 SFT 实验与对照基线，也可作为自建数据配方的通用能力配比来源。",
    usageLimit: "遵循 MIT 许可，可商用；由模型生成的内容需自行承担合规审查责任。",
    hasPii: "否",
    needAuth: "否",
    docs: "—",
    attachments: "—",
    storage: {
      provider: "MinIO",
      endpoint: MINIO_ENDPOINT,
      consoleUrl: MINIO_CONSOLE,
      bucket: MINIO_BUCKET,
      prefix: "datasets/alpaca-gpt4-zh/v1",
      region: "cn-east-1",
      objectCount: 4,
      totalSize: "892 MB",
      accessLevel: "公开可读",
      presignTtl: "24 小时",
      quota: "单账号 200 次/分钟，日下行流量 20 GB",
      files: [
        { path: "alpaca_gpt4_zh.json", size: "890 MB", kind: "数据", note: "52,000 条" },
        { path: "alpaca_gpt4_zh_1k.json", size: "17 MB", kind: "数据", note: "抽样 1,000 条，便于快速验证" },
        MANIFEST,
        README,
        LICENSE,
      ],
    },
    sample: {
      columns: ["id", "instruction", "input", "output"],
      rows: [
        ["1", "给出三条提升数据标注一致性的建议", "", "1) 明确标注规范并对齐边界案例；2) 双人交叉标注…"],
        ["2", "把下面的句子改写成公文语体", "我们下周去检查河道", "拟定于下周开展河道巡查工作。"],
        ["3", "解释什么是数据血缘", "", "数据血缘描述数据从源头到消费端的流转路径…"],
        ["4", "列出一个 YOLOv8 训练的配置文件关键字段", "", "model, data, epochs, imgsz, batch, lr0…"],
        ["5", "判断下面说法是否正确：预签名 URL 泄露不影响安全", "", "错误。预签名 URL 在有效期内等价于凭证…"],
      ],
    },
  },
  {
    id: "d7",
    name: "ETTh1 电力负荷时序数据",
    version: "V1",
    subtitle: "电力变压器温度多变量时序，7 个特征维度，长序列预测常用基准",
    chips: ["时序数据", "公开数据", "时序预测", "能源电力", "电力、热力、燃气及水生产和供应业"],
    category: "timeseries",
    subCategory: "时序预测",
    org: "THUML",
    desc: "电力变压器温度数据集，多变量时序预测常用基准，7个特征维度",
    size: "45MB",
    samples: 17420,
    license: "MIT",
    downloads: 34560,
    likes: 890,
    stars: 1340,
    tags: ["时序预测", "电力", "多变量"],
    format: "CSV",
    updated: "2月前",
    hot: false,
    publishAt: "2026-03-12 09:41:15",
    publisher: "sun.hao@lingshu.net",
    uid: "035586407LLSIN5Q7TBMK3XWZRYH9CPNV",
    modality: "时序",
    dataCategory: "公开数据",
    industry: "电力、热力、燃气及水生产和供应业",
    subject: "公开数据",
    domain: "能源电力",
    scaleText: "45 MB",
    sceneDesc:
      "电力负荷与油温的中长期预测：以 7 个变量的小时级序列训练 Informer、PatchTST 等时序模型，评估不同预测步长（96/192/336/720）下的误差表现。",
    usageLimit: "遵循 MIT 许可，可商用；数据已去标识化，不代表真实电网运行状态，不得用于生产调度决策。",
    hasPii: "否",
    needAuth: "否",
    docs: "—",
    attachments: "—",
    storage: {
      provider: "MinIO",
      endpoint: MINIO_ENDPOINT,
      consoleUrl: MINIO_CONSOLE,
      bucket: MINIO_BUCKET,
      prefix: "datasets/etth1/v1",
      region: "cn-east-1",
      objectCount: 5,
      totalSize: "46 MB",
      accessLevel: "公开可读",
      presignTtl: "24 小时",
      quota: "单账号 200 次/分钟，日下行流量 5 GB",
      files: [
        { path: "ETTh1.csv", size: "2.6 MB", kind: "数据", note: "17,420 行 × 7 列" },
        { path: "ETTh1_train.csv", size: "1.8 MB", kind: "数据" },
        { path: "ETTh1_test.csv", size: "420 KB", kind: "数据" },
        MANIFEST,
        README,
        LICENSE,
      ],
    },
    sample: {
      columns: ["date", "HUFL", "HULL", "MUFL", "MULL", "LUFL", "LULL", "OT"],
      rows: [
        ["2016-07-01 00:00:00", "5.827", "2.009", "1.599", "0.462", "4.203", "1.340", "30.531"],
        ["2016-07-01 01:00:00", "5.693", "2.076", "1.492", "0.426", "4.142", "1.371", "27.787"],
        ["2016-07-01 02:00:00", "5.157", "1.741", "1.279", "0.355", "3.777", "1.218", "25.103"],
        ["2016-07-01 03:00:00", "4.836", "1.648", "1.164", "0.323", "3.565", "1.134", "22.948"],
        ["2016-07-01 04:00:00", "4.612", "1.566", "1.092", "0.302", "3.412", "1.076", "21.146"],
      ],
    },
  },
  {
    id: "d8",
    name: "OpenKG 中文知识图谱数据集",
    version: "V2",
    subtitle: "大规模中文知识图谱，覆盖百科、医疗、金融领域实体与关系",
    chips: ["图数据", "公开数据", "知识图谱", "通用人工智能", "信息传输、软件和信息技术服务业"],
    category: "graph",
    subCategory: "知识图谱",
    org: "OpenKG",
    desc: "大规模中文知识图谱，涵盖百科、医疗、金融等领域实体与关系",
    size: "5.6GB",
    samples: 1200000,
    license: "CC BY-SA 4.0",
    downloads: 23450,
    likes: 670,
    stars: 980,
    tags: ["知识图谱", "中文", "多领域"],
    format: "RDF/N-Triples",
    updated: "1月前",
    hot: false,
    publishAt: "2026-02-26 17:12:33",
    publisher: "li.wenbo@lingshu.net",
    uid: "035586407LLSIN2D8QKXRT7VNWZH5BYMC",
    modality: "图",
    dataCategory: "公开数据",
    industry: "信息传输、软件和信息技术服务业",
    subject: "公开数据",
    domain: "知识图谱",
    scaleText: "5.6 GB",
    sceneDesc:
      "知识图谱补全与检索增强（RAG）的底层知识库：以三元组形式提供实体-关系-实体结构，可导入 NebulaGraph、Neo4j 做图查询，也可切分为子图作为 RAG 的召回证据。",
    usageLimit: "遵循 CC BY-SA 4.0，衍生图谱需同许可开放；实体描述含第三方百科内容，引用需保留出处。",
    hasPii: "是",
    needAuth: "否",
    docs: "OpenKG 本体规范.pdf",
    attachments: "schema.ttl",
    storage: {
      provider: "MinIO",
      endpoint: MINIO_ENDPOINT,
      consoleUrl: MINIO_CONSOLE,
      bucket: MINIO_BUCKET,
      prefix: "datasets/openkg-zh/v2",
      region: "cn-east-1",
      objectCount: 8,
      totalSize: "5.62 GB",
      accessLevel: "公开可读",
      presignTtl: "24 小时",
      quota: "单账号 100 次/分钟，日下行流量 15 GB",
      files: [
        DIR("triples/", "分领域三元组"),
        { path: "triples/baike.nt", size: "3.4 GB", kind: "数据", note: "约 78 万三元组" },
        { path: "triples/medical.nt", size: "1.6 GB", kind: "数据" },
        { path: "triples/finance.nt", size: "620 MB", kind: "数据" },
        { path: "schema/schema.ttl", size: "180 KB", kind: "清单", note: "本体与关系定义" },
        MANIFEST,
        README,
        LICENSE,
      ],
    },
    sample: {
      columns: ["subject", "predicate", "object", "domain", "confidence"],
      rows: [
        ["河湖长制", "主管部门", "水利部", "百科", "0.98"],
        ["无人机", "用途", "河道巡查", "百科", "0.91"],
        ["2 型糖尿病", "常用检查", "糖化血红蛋白", "医疗", "0.95"],
        ["数据要素", "相关政策", "数据二十条", "金融", "0.93"],
        ["可信数据空间", "组成", "连接器", "百科", "0.88"],
      ],
    },
  },
  {
    id: "d9",
    name: "MMLU-Pro 大规模多任务语言理解",
    version: "V1",
    subtitle: "57 个学科 1.4 万题，适合大模型知识能力的统一测评",
    chips: ["文本数据", "公开数据", "评估基准", "通用人工智能", "信息传输、软件和信息技术服务业"],
    category: "nlp",
    subCategory: "评估基准",
    org: "Hendrycks Lab",
    desc: "MMLU增强版，涵盖57个学科14K问题，适合大模型知识能力评估",
    size: "320MB",
    samples: 14000,
    license: "MIT",
    downloads: 67890,
    likes: 2890,
    stars: 4120,
    tags: ["评估基准", "多学科", "知识推理"],
    format: "JSON",
    updated: "4天前",
    hot: true,
    publishAt: "2026-09-19 10:03:56",
    publisher: "zhou.min@lingshu.net",
    uid: "035586407LLSIN4R6WKVQ9XZTPM3BHYDN",
    modality: "文本",
    dataCategory: "公开数据",
    industry: "信息传输、软件和信息技术服务业",
    subject: "公开数据",
    domain: "通用人工智能",
    scaleText: "320 MB",
    sceneDesc:
      "大模型知识能力基线测评：57 个学科、四选一单选，考察知识与推理的广度，适合作为模型上线前的准入评测与版本间回归对比。",
    usageLimit: "遵循 MIT 许可；题库不得进入训练集，评测时需固定提示模板以保证可比性。",
    hasPii: "否",
    needAuth: "否",
    docs: "MMLU-Pro 评测说明.pdf",
    attachments: "—",
    storage: {
      provider: "MinIO",
      endpoint: MINIO_ENDPOINT,
      consoleUrl: MINIO_CONSOLE,
      bucket: MINIO_BUCKET,
      prefix: "datasets/mmlu-pro/v1",
      region: "cn-east-1",
      objectCount: 4,
      totalSize: "318 MB",
      accessLevel: "公开可读",
      presignTtl: "24 小时",
      quota: "单账号 200 次/分钟，日下行流量 10 GB",
      files: [
        { path: "mmlu_pro_test.json", size: "286 MB", kind: "数据", note: "12,032 题" },
        { path: "mmlu_pro_val.json", size: "32 MB", kind: "数据", note: "70 题/学科" },
        MANIFEST,
        README,
        LICENSE,
      ],
    },
    sample: {
      columns: ["question_id", "subject", "question", "options", "answer"],
      rows: [
        ["10001", "数据科学", "下列哪项不属于数据质量维度？", "完整性 / 唯一性 / 及时性 / 加密强度", "D"],
        ["10002", "计算机科学", "S3 兼容对象存储的最小寻址单位是？", "文件 / 对象 / 块 / 页", "B"],
        ["10003", "水利工程", "河湖长制的第一责任人是？", "河湖长 / 巡查员 / 保洁员 / 监理", "A"],
        ["10004", "统计学", "样本量增大时，标准误如何变化？", "增大 / 减小 / 不变 / 无规律", "B"],
        ["10005", "法学", "公共数据授权运营的授权主体通常是？", "数据主管部门 / 企业 / 个人 / 行业协会", "A"],
      ],
    },
  },
  {
    id: "d10",
    name: "UrbanScene3D 城市三维场景数据集",
    version: "V1",
    subtitle: "城市三维场景数据，含建筑、道路、植被语义标注",
    chips: ["点云数据", "行业专识", "语义分割", "城市治理", "建筑业"],
    category: "cv",
    subCategory: "3D场景",
    org: "WHU",
    desc: "大规模城市三维场景数据集，包含建筑、道路、植被等语义标注",
    size: "48GB",
    samples: 15000,
    license: "CC BY 4.0",
    downloads: 12340,
    likes: 560,
    stars: 780,
    tags: ["3D场景", "城市", "语义分割"],
    format: "PLY + JSON",
    updated: "3周前",
    hot: false,
    publishAt: "2026-08-30 13:27:41",
    publisher: "sun.hao@lingshu.net",
    uid: "035586407LLSIN8V3QNXK6TRWZP4BYHMC",
    modality: "点云",
    dataCategory: "行业专识",
    industry: "建筑业",
    subject: "公共数据",
    domain: "城市治理",
    scaleText: "48 GB",
    sceneDesc:
      "城市实景三维建模与语义分割：点云配影像，可用于建筑轮廓提取、道路要素识别、绿地率测算，支撑城市体检与违建监测场景。",
    usageLimit: "含城市空间位置信息，仅限内部建模与算法验证，不得对外发布原始点云；成果发布需做位置脱敏。",
    hasPii: "否",
    needAuth: "是",
    docs: "UrbanScene3D 采集说明.pdf",
    attachments: "—",
    storage: {
      provider: "MinIO",
      endpoint: MINIO_ENDPOINT,
      consoleUrl: MINIO_CONSOLE,
      bucket: MINIO_BUCKET,
      prefix: "datasets/urbanscene3d/v1",
      region: "cn-east-1",
      objectCount: 15004,
      totalSize: "48.2 GB",
      accessLevel: "授权后访问",
      presignTtl: "12 小时",
      quota: "单账号 50 次/分钟，日下行流量 100 GB",
      files: [
        DIR("pointcloud/", "15,000 个场景块"),
        { path: "pointcloud/tile_0021.ply", size: "3.2 MB", kind: "数据" },
        { path: "pointcloud/tile_0022.ply", size: "3.4 MB", kind: "数据" },
        { path: "labels/semantic_labels.json", size: "86 MB", kind: "标注", note: "6 类语义" },
        MANIFEST,
        README,
        LICENSE,
      ],
    },
    sample: {
      columns: ["tile", "points", "classes", "bbox_extent", "crs"],
      rows: [
        ["tile_0021", "1,842,660", "building, road, vegetation", "120×96 m", "CGCS2000"],
        ["tile_0022", "1,905,420", "building, road, water", "120×96 m", "CGCS2000"],
        ["tile_0023", "1,776,310", "building, vegetation, ground", "120×96 m", "CGCS2000"],
        ["tile_0024", "1,958,740", "road, vegetation, vehicle", "120×96 m", "CGCS2000"],
        ["tile_0025", "1,689,220", "building, ground, water", "120×96 m", "CGCS2000"],
      ],
    },
  },
  {
    id: "d11",
    name: "LIBERO 机器人操作基准",
    version: "V1",
    subtitle: "130 个长时序操作任务与仿真环境，用于策略学习评测",
    chips: ["多模态数据", "公开数据", "机器人操作", "具身智能", "科学研究和技术服务业"],
    category: "multimodal",
    subCategory: "机器人操作",
    org: "Stanford",
    desc: "机器人操作任务基准，包含130个长时序操作任务和仿真环境",
    size: "12GB",
    samples: 130,
    license: "MIT",
    downloads: 8760,
    likes: 340,
    stars: 520,
    tags: ["机器人", "操作任务", "仿真"],
    format: "HDF5",
    updated: "2周前",
    hot: false,
    publishAt: "2026-09-01 08:55:19",
    publisher: "zhao.qiming@lingshu.net",
    uid: "035586407LLSIN5T9WQKX2VNRZP8BYMHD",
    modality: "多模态",
    dataCategory: "公开数据",
    industry: "科学研究和技术服务业",
    subject: "公开数据",
    domain: "具身智能",
    scaleText: "12 GB",
    sceneDesc:
      "机器人操作策略的模仿学习与评测：每条轨迹含多视角图像、机械臂状态与动作序列，可用于 Diffusion Policy、ACT 等方法的训练与成功率对比。",
    usageLimit: "遵循 MIT 许可；仿真数据不等价于真机表现，落地前需在真机做二次标定与安全验证。",
    hasPii: "否",
    needAuth: "否",
    docs: "LIBERO 任务说明.pdf",
    attachments: "—",
    storage: {
      provider: "MinIO",
      endpoint: MINIO_ENDPOINT,
      consoleUrl: MINIO_CONSOLE,
      bucket: MINIO_BUCKET,
      prefix: "datasets/libero/v1",
      region: "cn-east-1",
      objectCount: 132,
      totalSize: "12.1 GB",
      accessLevel: "公开可读",
      presignTtl: "24 小时",
      quota: "单账号 100 次/分钟，日下行流量 20 GB",
      files: [
        DIR("demonstrations/", "130 个任务的示范轨迹"),
        { path: "demonstrations/LIBERO_OBJECT_0.hdf5", size: "486 MB", kind: "数据", note: "50 条轨迹" },
        { path: "demonstrations/LIBERO_GOAL_0.hdf5", size: "512 MB", kind: "数据" },
        { path: "meta/task_suite.json", size: "64 KB", kind: "清单" },
        MANIFEST,
        README,
        LICENSE,
      ],
    },
    sample: {
      columns: ["task_id", "suite", "trajectories", "steps", "cameras"],
      rows: [
        ["LIBERO_OBJECT_0", "object", "50", "142", "agentview, wrist"],
        ["LIBERO_OBJECT_1", "object", "50", "156", "agentview, wrist"],
        ["LIBERO_GOAL_0", "goal", "50", "188", "agentview, wrist"],
        ["LIBERO_GOAL_1", "goal", "50", "204", "agentview, wrist"],
        ["LIBERO_LONG_0", "long", "50", "312", "agentview, wrist"],
      ],
    },
  },
  {
    id: "d12",
    name: "UCI Adult 人口普查表格数据",
    version: "V1",
    subtitle: "经典表格分类数据集，4.8 万条记录 14 个属性特征",
    chips: ["表格数据", "公开数据", "分类", "通用人工智能", "公共管理、社会保障和社会组织"],
    category: "tabular",
    subCategory: "分类",
    org: "UCI",
    desc: "经典表格分类数据集，含48842条人口普查记录，14个属性特征",
    size: "4MB",
    samples: 48842,
    license: "CC BY 4.0",
    downloads: 198760,
    likes: 1230,
    stars: 1890,
    tags: ["表格数据", "分类", "经典数据集"],
    format: "CSV",
    updated: "6月前",
    hot: false,
    publishAt: "2026-01-15 11:08:26",
    publisher: "chen.li@lingshu.net",
    uid: "035586407LLSIN3X7QWKZ6VNRTPB9HYMC",
    modality: "表格",
    dataCategory: "公开数据",
    industry: "公共管理、社会保障和社会组织",
    subject: "公开数据",
    domain: "通用人工智能",
    scaleText: "4 MB",
    sceneDesc:
      "结构化数据分类的入门基准与公平性研究样本：以 14 个属性预测收入区间，适合做特征工程、树模型与表格深度模型的横向对比。",
    usageLimit: "遵循 CC BY 4.0；含性别、种族等敏感属性，仅可用于公平性算法研究，不得用于个人征信或营销定向。",
    hasPii: "是",
    needAuth: "否",
    docs: "—",
    attachments: "adult.names",
    storage: {
      provider: "MinIO",
      endpoint: MINIO_ENDPOINT,
      consoleUrl: MINIO_CONSOLE,
      bucket: MINIO_BUCKET,
      prefix: "datasets/uci-adult/v1",
      region: "cn-east-1",
      objectCount: 5,
      totalSize: "4.1 MB",
      accessLevel: "公开可读",
      presignTtl: "24 小时",
      quota: "单账号 200 次/分钟，日下行流量 5 GB",
      files: [
        { path: "adult.data.csv", size: "3.8 MB", kind: "数据", note: "48,842 行 × 15 列" },
        { path: "adult.test.csv", size: "1.2 MB", kind: "数据" },
        { path: "adult.names", size: "18 KB", kind: "文档", note: "字段与取值说明" },
        MANIFEST,
        README,
      ],
    },
    sample: {
      columns: ["age", "workclass", "education", "marital_status", "occupation", "hours", "income"],
      rows: [
        ["39", "State-gov", "Bachelors", "Never-married", "Adm-clerical", "40", "<=50K"],
        ["50", "Self-emp-not-inc", "Bachelors", "Married-civ-spouse", "Exec-managerial", "13", "<=50K"],
        ["38", "Private", "HS-grad", "Divorced", "Handlers-cleaners", "40", "<=50K"],
        ["53", "Private", "11th", "Married-civ-spouse", "Handlers-cleaners", "40", "<=50K"],
        ["28", "Private", "Bachelors", "Married-civ-spouse", "Prof-specialty", "40", ">50K"],
      ],
    },
  },
];

export const CATEGORY_KEYS = Array.from(new Set(DATASETS.map((d) => d.category)));

export function getDataset(id: string): Dataset | undefined {
  return DATASETS.find((d) => d.id === id);
}

/** 卡片/详情标题用的完整名称，版本单列展示，避免标题里重复 V1 */
export function fullName(d: Dataset): string {
  return `${d.name}${d.version}`;
}
