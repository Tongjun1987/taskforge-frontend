// 模型仓库 Mock 数据
export interface Model {
  id: string;
  name: string;
  org: string;
  description: string;
  license: string;
  task_type: string;
  task_name?: string; // 关联任务名称
  category: string;
  domain_tags: string[];
  downloads: number;
  likes: number;
  size: string;
  params_m?: number; // 参数量（百万）
  flops_g?: number; // 计算量（GFLOPs）
  precision: string[];
  framework: string[];
  last_updated: string;
  accuracy?: number; // 准确率
  status?: string; // serving/training/pending
  serving_url?: string; // 推理地址
  is_favorited?: boolean;
}

export interface ModelFile {
  id: string;
  name: string;
  path: string;
  size: string;
  format: string;
  worker: string;
  uploaded_at: string;
  status: "ready" | "deploying" | "error";
  version: string;
}

export interface DeployConfig {
  model_name: string;
  model_source: string;
  model_type: string;
  backend: string;
  replicas: number;
  description: string;
  model_category: string;
  scheduling: "auto" | "manual";
  placement: "auto" | "spread" | "packed";
  worker_selector: string;
  inference_max_tokens: number;
  inference_temperature: number;
  env_vars: Record<string, string>;
}

// 任务类型字典
export const TASK_TYPES = [
  { value: "目标检测", label: "目标检测", description: "YOLO/RCNN等", ls_control: "RectangleLabels" },
  { value: "多目标跟踪", label: "多目标跟踪", description: "ByteTrack/DeepSORT等", ls_control: "VideoRectangle + Relations" },
  { value: "图像分类", label: "图像分类", description: "ResNet/EfficientNet等", ls_control: "Choices" },
  { value: "语义分割", label: "语义分割", description: "U-Net/MaskRCNN等", ls_control: "PolygonLabels" },
  { value: "行为识别", label: "行为识别", description: "SlowFast/I3D等", ls_control: "VideoTimeline" },
  { value: "事件检测", label: "事件检测", description: "时空推理模型", ls_control: "Taxonomy" },
  { value: "时序分析", label: "时序分析", description: "Transformer/LSTM等", ls_control: "TimeSeries" },
  { value: "文本生成", label: "文本生成", description: "LLM模型", ls_control: "TextArea" },
  { value: "视觉问答", label: "视觉问答", description: "VLM模型", ls_control: "Image + TextArea" },
  { value: "语音识别", label: "语音识别", description: "ASR模型", ls_control: "AudioText" },
  { value: "文本嵌入", label: "文本嵌入", description: "Embedding模型", ls_control: "TextArea" },
];

// 五核心任务模型 Mock 数据（基于 V2 仿真）
export const MOCK_MODELS: Model[] = [
  // ========== 交通事件识别场景 - 五核心任务模型 ==========
  {
    id: "model_det_001",
    name: "YOLOv8-Traffic-v2.1",
    org: "TrafficAI Lab",
    description: "基于改进 YOLOv8 的交通目标检测，支持车辆/行人/非机动车/交通设施等 12 类目标识别。",
    license: "AGPL-3.0",
    task_type: "目标检测",
    task_name: "交通目标检测",
    category: "视觉检测模型",
    domain_tags: ["交通", "目标检测", "实时推理", "YOLOv8"],
    downloads: 3420,
    likes: 186,
    size: "165.2 MB",
    params_m: 43.7,
    flops_g: 165.2,
    precision: ["FP16", "INT8", "INT4"],
    framework: ["PyTorch", "Ultralytics"],
    last_updated: "2026-04-18",
    accuracy: 91.2,
    status: "serving",
    serving_url: "http://10.0.1.21:8001/v1/detect",
  },
  {
    id: "model_track_001",
    name: "ByteTrack-Traffic-v1.3",
    org: "TrafficAI Lab",
    description: "结合检测结果的 ByteTrack 多目标跟踪，保持跨帧目标 ID 一致性，支持遮挡恢复与轨迹平滑。",
    license: "AGPL-3.0",
    task_type: "多目标跟踪",
    task_name: "多目标跟踪",
    category: "视频分析模型",
    domain_tags: ["交通", "多目标跟踪", "ByteTrack", "ReID"],
    downloads: 1280,
    likes: 92,
    size: "89.6 MB",
    params_m: 28.4,
    flops_g: 89.6,
    precision: ["FP16", "FP32"],
    framework: ["PyTorch", "ByteTrack"],
    last_updated: "2026-04-19",
    accuracy: 78.3,
    status: "training",
  },
  {
    id: "model_beh_001",
    name: "SlowFast-Traffic-v1.0",
    org: "TrafficAI Lab",
    description: "基于 SlowFast 双流网络的交通行为识别，覆盖变道/超速/逆行/占道/急刹等 15 类行为。",
    license: "AGPL-3.0",
    task_type: "行为识别",
    task_name: "交通行为识别",
    category: "视频分析模型",
    domain_tags: ["交通", "行为识别", "SlowFast", "双流网络"],
    downloads: 890,
    likes: 67,
    size: "213.8 MB",
    params_m: 59.2,
    flops_g: 213.8,
    precision: ["FP16", "FP32"],
    framework: ["PyTorch", "SlowFast"],
    last_updated: "2026-04-20",
    accuracy: 85.6,
    status: "training",
  },
  {
    id: "model_event_001",
    name: "EventNet-Traffic-v0.8",
    org: "TrafficAI Lab",
    description: "综合目标检测与行为识别结果的交通事件识别模块，覆盖交通事故/道路拥堵/违章停车/路面异物等 8 类事件。",
    license: "AGPL-3.0",
    task_type: "事件检测",
    task_name: "交通事件识别",
    category: "视频分析模型",
    domain_tags: ["交通", "事件检测", "事故分析", "异常告警"],
    downloads: 560,
    likes: 45,
    size: "241.5 MB",
    params_m: 67.3,
    flops_g: 241.5,
    precision: ["FP16", "FP32"],
    framework: ["PyTorch", "Custom"],
    last_updated: "2026-04-21",
    accuracy: 88.2,
    status: "evaluating",
  },
  {
    id: "model_ts_001",
    name: "TransAD-Traffic-v0.4",
    org: "TrafficAI Lab",
    description: "基于 Transformer 的交通流时序建模，实现流量趋势预测与异常模式早期预警，提前 3 分钟预判拥堵。",
    license: "AGPL-3.0",
    task_type: "时序分析",
    task_name: "时序建模与异常分析",
    category: "时序模型",
    domain_tags: ["交通", "时序建模", "异常检测", "Transformer"],
    downloads: 320,
    likes: 28,
    size: "52.3 MB",
    params_m: 24.1,
    flops_g: 52.3,
    precision: ["FP16", "FP32"],
    framework: ["PyTorch", "PyTorch-Ignite"],
    last_updated: "2026-04-21",
    status: "pending",
  },
  // ========== 通用大模型 ==========
  {
    id: "m1",
    name: "Qwen2.5-7B-Instruct",
    org: "Alibaba",
    description: "阿里通义千问2.5系列，擅长中文对话、代码生成，数学推理，支持128K上下文",
    license: "Apache-2.0",
    task_type: "文本生成",
    category: "大语言模型",
    domain_tags: ["对话", "代码", "数学", "中文"],
    downloads: 128400,
    likes: 3420,
    size: "14.2 GB",
    precision: ["FP16", "INT8", "INT4"],
    framework: ["PyTorch", "vLLM", "Transformers"],
    last_updated: "2025-01-15",
  },
  {
    id: "m2",
    name: "DeepSeek-V2.5",
    org: "DeepSeek",
    description: "DeepSeek最新开源模型，超强推理能力，长上下文支持，性价比极高",
    license: "MIT",
    task_type: "文本生成",
    category: "大语言模型",
    domain_tags: ["推理", "代码", "数学", "中文"],
    downloads: 89600,
    likes: 2180,
    size: "21.8 GB",
    precision: ["FP16", "BF16", "INT8"],
    framework: ["PyTorch", "vLLM", "SGLang"],
    last_updated: "2025-02-20",
  },
  {
    id: "m3",
    name: "Qwen2-VL-72B-Instruct",
    org: "Alibaba",
    description: "通义千问2.0视觉语言模型，支持图像理解、视频理解、多模态对话",
    license: "Apache-2.0",
    task_type: "视觉问答",
    category: "视觉语言模型",
    domain_tags: ["视觉", "多模态", "图像理解", "视频"],
    downloads: 45200,
    likes: 1560,
    size: "144 GB",
    precision: ["FP16", "BF16"],
    framework: ["PyTorch", "Transformers"],
    last_updated: "2025-03-01",
  },
  {
    id: "m4",
    name: "ChatGLM4-9B-Chat",
    org: "ZhipuAI",
    description: "智谱AI最新ChatGLM4系列，对话流畅，支持百万级上下文窗口",
    license: "Apache-2.0",
    task_type: "文本生成",
    category: "大语言模型",
    domain_tags: ["对话", "中文", "长上下文"],
    downloads: 67500,
    likes: 1890,
    size: "18.4 GB",
    precision: ["FP16", "INT8", "INT4"],
    framework: ["PyTorch", "vLLM"],
    last_updated: "2025-01-28",
  },
  {
    id: "m5",
    name: "InternLM2.5-7B-Chat",
    org: "Shanghai AI Lab",
    description: "上海人工智能实验室开源，支持超长上下文，强推理能力",
    license: "Apache-2.0",
    task_type: "文本生成",
    category: "大语言模型",
    domain_tags: ["推理", "中文", "长上下文", "代码"],
    downloads: 38900,
    likes: 980,
    size: "14.7 GB",
    precision: ["FP16", "INT8", "INT4"],
    framework: ["PyTorch", "vLLM", "Transformers"],
    last_updated: "2025-02-10",
  },
  {
    id: "m6",
    name: "LLaVA-1.6-34B",
    org: "LLaVA Project",
    description: "开源多模态大模型，支持图像描述、视觉问答、图文推理",
    license: "LLaMA-2",
    task_type: "视觉问答",
    category: "视觉语言模型",
    domain_tags: ["视觉", "多模态", "图像理解"],
    downloads: 22100,
    likes: 670,
    size: "68 GB",
    precision: ["FP16", "INT8"],
    framework: ["PyTorch", "Transformers"],
    last_updated: "2024-12-15",
  },
  {
    id: "m7",
    name: "Whisper-Large-V3",
    org: "OpenAI",
    description: "OpenAI开源语音识别模型，支持99种语言，高精度语音转文本",
    license: "MIT",
    task_type: "语音识别",
    category: "语音模型",
    domain_tags: ["语音", "ASR", "多语言"],
    downloads: 94300,
    likes: 4100,
    size: "3.1 GB",
    precision: ["FP16", "INT8"],
    framework: ["PyTorch", "Transformers"],
    last_updated: "2025-01-05",
  },
  {
    id: "m8",
    name: "BGE-M3",
    org: "BAAI",
    description: "智源开源多语言向量化模型，支持100+语言，稠密+稀疏+多vela混合检索",
    license: "MIT",
    task_type: "文本嵌入",
    category: "嵌入模型",
    domain_tags: ["Embedding", "检索", "多语言"],
    downloads: 55200,
    likes: 2200,
    size: "2.4 GB",
    precision: ["FP16", "INT8"],
    framework: ["PyTorch", "Transformers"],
    last_updated: "2025-02-28",
  },
];

export const MOCK_MODEL_FILES: ModelFile[] = [
  {
    id: "f1",
    name: "qwen2.5-7b-chat.gguf",
    path: "/models/llm/qwen2.5-7b/",
    size: "14.2 GB",
    format: "GGUF",
    worker: "worker-gpu-01",
    uploaded_at: "2025-03-10",
    status: "ready",
    version: "v2.5",
  },
  {
    id: "f2",
    name: "deepseek-v2.5-fp16",
    path: "/models/llm/deepseek-v2.5/",
    size: "43.6 GB",
    format: "safetensors",
    worker: "worker-gpu-02",
    uploaded_at: "2025-03-12",
    status: "ready",
    version: "v2.5",
  },
  {
    id: "f3",
    name: "bge-m3-int8",
    path: "/models/embedding/bge-m3/",
    size: "0.9 GB",
    format: "safetensors",
    worker: "worker-cpu-01",
    uploaded_at: "2025-03-05",
    status: "deploying",
    version: "v1.2",
  },
  {
    id: "f4",
    name: "whisper-large-v3",
    path: "/models/audio/whisper/",
    size: "3.1 GB",
    format: "onnx",
    worker: "worker-gpu-01",
    uploaded_at: "2025-02-28",
    status: "ready",
    version: "v3.0",
  },
  {
    id: "f5",
    name: "qwen2-vl-72b-fp16",
    path: "/models/vlm/qwen2-vl-72b/",
    size: "144 GB",
    format: "safetensors",
    worker: "worker-gpu-cluster",
    uploaded_at: "2025-03-01",
    status: "ready",
    version: "v2.0",
  },
  {
    id: "f6",
    name: "chatglm4-9b-chat-int4",
    path: "/models/llm/chatglm4-9b/",
    size: "4.6 GB",
    format: "GGUF",
    worker: "worker-gpu-03",
    uploaded_at: "2025-03-08",
    status: "error",
    version: "v4.0",
  },
  // 五核心任务模型文件
  {
    id: "f_det_001",
    name: "yolov8-traffic-v2.1.pt",
    path: "/models/detection/yolov8-traffic/",
    size: "165.2 MB",
    format: "PyTorch",
    worker: "worker-gpu-01",
    uploaded_at: "2026-04-18",
    status: "ready",
    version: "v2.1",
  },
  {
    id: "f_track_001",
    name: "bytetrack-traffic-v1.3.pth",
    path: "/models/tracking/bytetrack-traffic/",
    size: "89.6 MB",
    format: "PyTorch",
    worker: "worker-gpu-02",
    uploaded_at: "2026-04-19",
    status: "ready",
    version: "v1.3",
  },
  {
    id: "f_beh_001",
    name: "slowfast-traffic-v1.0.pth",
    path: "/models/behavior/slowfast-traffic/",
    size: "213.8 MB",
    format: "PyTorch",
    worker: "worker-gpu-01",
    uploaded_at: "2026-04-20",
    status: "deploying",
    version: "v1.0",
  },
  {
    id: "f_event_001",
    name: "eventnet-traffic-v0.8.pth",
    path: "/models/event/eventnet-traffic/",
    size: "241.5 MB",
    format: "PyTorch",
    worker: "worker-gpu-02",
    uploaded_at: "2026-04-21",
    status: "ready",
    version: "v0.8",
  },
  {
    id: "f_ts_001",
    name: "transad-traffic-v0.4.pth",
    path: "/models/timeseries/transad-traffic/",
    size: "52.3 MB",
    format: "PyTorch",
    worker: "worker-gpu-03",
    uploaded_at: "2026-04-21",
    status: "ready",
    version: "v0.4",
  },
];

export const DEPLOY_DEFAULTS: DeployConfig = {
  model_name: "",
  model_source: "",
  model_type: "text-generation",
  backend: "vLLM",
  replicas: 1,
  description: "",
  model_category: "llm",
  scheduling: "auto",
  placement: "spread",
  worker_selector: "",
  inference_max_tokens: 8192,
  inference_temperature: 0.7,
  env_vars: {},
};
