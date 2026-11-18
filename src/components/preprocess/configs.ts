import { EyeOff, Split, FileType2, Film, Boxes, Route } from "lucide-react";
import type { ModuleConfig } from "./ModulePage";

// ================================================================
// 数据脱敏
// ================================================================
export const MASKING: ModuleConfig = {
  key: "pp-masking",
  title: "数据脱敏",
  subtitle: "在数据进入标注与训练前完成个人信息与敏感字段处理，脱敏后仍保留可训练的结构特征",
  accent: "#7c3aed",
  accentDeep: "#6d28d9",
  icon: EyeOff,
  metrics: [
    { label: "脱敏任务", value: "5", unit: "个", hint: "运行中 1 · 排队 1" },
    { label: "已处理记录", value: "148.2", unit: "万", hint: "近 30 天累计" },
    { label: "识别 PII 实体", value: "3.7", unit: "万", hint: "证件 / 手机 / 人脸 / 车牌", tone: "#dc2626" },
    { label: "脱敏成功率", value: "99.2", unit: "%", hint: "人工抽检 2,000 条", tone: "#16a34a" },
  ],
  categories: {
    mask: { label: "掩码替换", color: "#7c3aed", bg: "#f5f3ff" },
    blur: { label: "图像模糊", color: "#db2777", bg: "#fdf2f8" },
    generalize: { label: "泛化截断", color: "#0891b2", bg: "#ecfeff" },
    pseudo: { label: "假名化", color: "#2563eb", bg: "#eff6ff" },
    noise: { label: "加噪扰动", color: "#d97706", bg: "#fffbeb" },
  },
  ops: [
    { id: "mk-id", name: "证件号掩码", cat: "mask", modality: "文本", used: 12, effect: "脱敏 100%", desc: "识别身份证、护照、统一社会信用代码，保留前三后四位，其余以 * 替换，并校验校验位是否合法。" },
    { id: "mk-phone", name: "手机号与邮箱脱敏", cat: "mask", modality: "文本", used: 14, effect: "脱敏 100%", desc: "按正则命中手机号、座机、邮箱，中间位替换；保留号段分布，避免破坏下游的地域统计特征。" },
    { id: "mk-face", name: "人脸与车牌模糊", cat: "blur", modality: "图像", used: 9, effect: "漏检率 0.3%", desc: "YOLOv8 检出人脸与车牌区域后做高斯模糊，仅处理目标框内像素，画面其余结构不变。" },
    { id: "mk-video-face", name: "视频逐帧人脸脱敏", cat: "blur", modality: "视频", used: 6, effect: "漏检率 0.8%", desc: "帧间跟踪 + 逐帧模糊，避免同一人物在不同帧出现漏脱敏；断轨时回退到单帧检测。" },
    { id: "mk-addr", name: "地址泛化截断", cat: "generalize", modality: "文本", used: 8, effect: "泛化到区县", desc: "将详细地址截断到区县一级，门牌号与楼栋信息整体丢弃，满足 k-匿名（k≥5）要求。" },
    { id: "mk-name", name: "姓名占位替换", cat: "pseudo", modality: "文本", used: 11, effect: "一致假名", desc: "NER 识别姓名后替换为「张某」「李某」等占位符，同一实体内保持一致，便于保持对话指代关系。" },
    { id: "mk-hmac", name: "HMAC 稳定假名化", cat: "pseudo", modality: "多模态", used: 7, effect: "可逆映射表", desc: "以 HMAC-SHA256 生成稳定假名，同一 ID 跨批次映射结果一致，支撑跨数据集关联分析。" },
    { id: "mk-dicom", name: "DICOM 去标识化", cat: "mask", modality: "图像", used: 5, effect: "符合 HIPAA", desc: "按 HIPAA 18 项清理 DICOM 标签（姓名、病历号、检查日期偏移），像素内烧录文字同步擦除。" },
    { id: "mk-audio", name: "声纹与音高扰动", cat: "noise", modality: "音频", used: 4, effect: "识别率降 62%", desc: "对说话人音高做 ±2 半音偏移并叠加轻微共振峰扰动，保留语义可听度，削弱声纹识别可用性。" },
    { id: "mk-dp", name: "差分隐私加噪", cat: "noise", modality: "时序", used: 3, effect: "ε=1.0", desc: "对数值型统计列注入拉普拉斯噪声，按敏感度与 ε 预算分配，输出可直接对外发布的聚合表。" },
  ],
  jobs: [
    { id: "MK-2026-014", name: "医疗影像 DICOM 去标识化", dataset: "医疗影像标注数据集", ops: ["DICOM 去标识化", "证件号掩码"], input: "12,480 例", output: "12,480 例", status: "已完成", startedAt: "2026-11-17 09:24", owner: "admin" },
    { id: "MK-2026-013", name: "城市治理工单个人信息脱敏", dataset: "城市治理工单文本数据集", ops: ["手机号与邮箱脱敏", "姓名占位替换", "地址泛化截断"], input: "48.6 万条", output: "48.6 万条", status: "已完成", startedAt: "2026-11-16 14:02", owner: "admin" },
    { id: "MK-2026-012", name: "交通视频人脸车牌模糊", dataset: "交通视频行为识别数据集", ops: ["视频逐帧人脸脱敏", "人脸与车牌模糊"], input: "86,420 段", output: "84,900 段", status: "运行中", startedAt: "2026-11-17 10:15", owner: "admin" },
    { id: "MK-2026-011", name: "语音转写声纹扰动", dataset: "语音转写校对数据集", ops: ["声纹与音高扰动"], input: "2.3 万条", output: "2.3 万条", status: "已完成", startedAt: "2026-11-15 16:40", owner: "admin" },
    { id: "MK-2026-015", name: "应急事件多模态隐私处理", dataset: "应急多模态事件数据集", ops: ["HMAC 稳定假名化", "人脸与车牌模糊", "地址泛化截断"], input: "6,200 条", output: "计算中", status: "排队中", startedAt: "2026-11-17 11:08", owner: "admin" },
  ],
  jobLabel: "脱敏任务",
  opLabel: "脱敏算子",
  jobDesc: "脱敏任务清单",
  opDesc: "按数据类型与脱敏强度选用，算子可串行组合，前一步输出即后一步输入",
  newLabel: "新建脱敏任务",
};

// ================================================================
// 数据拆分
// ================================================================
export const SPLIT: ModuleConfig = {
  key: "pp-split",
  title: "数据拆分",
  subtitle: "把数据集切成训练 / 验证 / 测试子集，控制泄漏与分布偏移，产出可直接用于模型试验的版本",
  accent: "#2563eb",
  accentDeep: "#1d4ed8",
  icon: Split,
  metrics: [
    { label: "拆分任务", value: "5", unit: "个", hint: "覆盖 12 个数据集" },
    { label: "产出子集", value: "18", unit: "个", hint: "训练 / 验证 / 测试" },
    { label: "泄漏检查", value: "0", unit: "处", hint: "同源样本已隔离", tone: "#16a34a" },
    { label: "标签分布偏差", value: "≤1.2", unit: "%", hint: "相对训练集", tone: "#0891b2" },
  ],
  categories: {
    split: { label: "随机切分", color: "#2563eb", bg: "#eff6ff" },
    stratify: { label: "分层抽样", color: "#7c3aed", bg: "#f5f3ff" },
    temporal: { label: "时序切分", color: "#0891b2", bg: "#ecfeff" },
    chunk: { label: "分块切分", color: "#d97706", bg: "#fffbeb" },
    dedup: { label: "去泄漏切分", color: "#db2777", bg: "#fdf2f8" },
  },
  ops: [
    { id: "sp-random", name: "随机切分 8:1:1", cat: "split", modality: "多模态", used: 15, effect: "训练 80% / 验证 10% / 测试 10%", desc: "按固定随机种子切分，种子可复现；产出三个子集并写入同一版本的子版本记录。" },
    { id: "sp-stratify", name: "分层抽样切分", cat: "stratify", modality: "图像", used: 11, effect: "偏差 ≤1.0%", desc: "按类别标签比例分层，类别不均衡时保障每个子集内长尾类别都有样本，避免小类在测试集缺失。" },
    { id: "sp-temporal", name: "时序切分", cat: "temporal", modality: "时序", used: 7, effect: "无未来信息泄漏", desc: "按时间窗口切分，训练集严格早于验证集、验证集早于测试集，杜绝用未来数据预测过去。" },
    { id: "sp-kfold", name: "K 折交叉验证切分", cat: "split", modality: "多模态", used: 5, effect: "K=5 轮", desc: "生成 5 组互斥的留出折，供模型试验做交叉验证，报告各折均值与方差。" },
    { id: "sp-domain", name: "按场景切分", cat: "split", modality: "多模态", used: 6, effect: "域外测试集", desc: "按采集场景 / 城市 / 设备切分，测试集与训练集不同域，用于评估泛化能力。" },
    { id: "sp-noleak", name: "同源去泄漏切分", cat: "dedup", modality: "文本", used: 9, effect: "泄漏 0 处", desc: "以 source、URL、指令模板指纹聚类，同一来源的样本只能落在同一个子集，杜绝训练/测试重叠。" },
    { id: "sp-chunk", name: "长文本语义分块", cat: "chunk", modality: "文本", used: 8, effect: "512 token / 重叠 64", desc: "按语义边界切块并保留滑动窗口重叠，避免关键信息被切断，同时控制单样本长度上限。" },
    { id: "sp-video", name: "视频片段切分", cat: "chunk", modality: "视频", used: 6, effect: "按镜头边界", desc: "以镜头边界检测结果切段，同一事件的动作不跨段，段内保留完整时序。" },
    { id: "sp-tile", name: "点云场景切分", cat: "chunk", modality: "点云", used: 4, effect: "100m × 100m 瓦片", desc: "按平面网格切瓦片并对跨瓦片目标做完整度判定，只保留主体目标落入瓦片的样本。" },
    { id: "sp-weight", name: "不均衡重采样", cat: "stratify", modality: "多模态", used: 5, effect: "长尾召回 +18pt", desc: "对长尾类别过采样并对头部降采样，切分前后都保持原始比例记录，便于回溯。" },
  ],
  jobs: [
    { id: "SP-2026-009", name: "交通行为识别训练集切分", dataset: "交通视频行为识别数据集", ops: ["分层抽样切分", "视频片段切分"], input: "86,420 段", output: "69,136/8,642/8,642", status: "已完成", startedAt: "2026-11-16 09:10", owner: "admin" },
    { id: "SP-2026-008", name: "指令数据去泄漏切分", dataset: "文本指令微调数据集", ops: ["同源去泄漏切分", "长文本语义分块"], input: "12.4 万条", output: "99,200/12,400/12,400", status: "已完成", startedAt: "2026-11-15 15:36", owner: "admin" },
    { id: "SP-2026-007", name: "医疗影像分层切分", dataset: "医疗影像标注数据集", ops: ["分层抽样切分"], input: "12,480 例", output: "9,984/1,248/1,248", status: "已完成", startedAt: "2026-11-14 11:02", owner: "admin" },
    { id: "SP-2026-010", name: "路网流量时序切分", dataset: "交通路网时序流量数据集", ops: ["时序切分"], input: "1,096 万点", output: "876万/110万/110万", status: "运行中", startedAt: "2026-11-17 09:45", owner: "admin" },
    { id: "SP-2026-011", name: "城市点云瓦片切分", dataset: "城市三维点云数据集", ops: ["点云场景切分", "按场景切分"], input: "3.6 亿点", output: "计算中", status: "排队中", startedAt: "2026-11-17 10:52", owner: "admin" },
  ],
  jobLabel: "拆分任务",
  opLabel: "拆分策略",
  jobDesc: "拆分任务清单",
  opDesc: "切分策略决定模型评估的可信度，去泄漏与时序切分是默认必选项",
  newLabel: "新建拆分任务",
};

// ================================================================
// 格式转换
// ================================================================
export const FORMAT: ModuleConfig = {
  key: "pp-format",
  title: "格式转换",
  subtitle: "按训练框架与标注工具的格式要求统一数据形态，转换同时做完整性校验，失败对象单独回传",
  accent: "#0891b2",
  accentDeep: "#0e7490",
  icon: FileType2,
  metrics: [
    { label: "转换任务", value: "5", unit: "个", hint: "标注 / 文件 / 媒体编码" },
    { label: "转换对象", value: "21.6", unit: "万", hint: "近 30 天累计" },
    { label: "平均耗时", value: "6.4", unit: "分钟", hint: "单任务中位数" },
    { label: "校验通过率", value: "99.6", unit: "%", hint: "失败对象已单独回传", tone: "#16a34a" },
  ],
  categories: {
    annot: { label: "标注格式", color: "#7c3aed", bg: "#f5f3ff" },
    file: { label: "文件格式", color: "#2563eb", bg: "#eff6ff" },
    media: { label: "媒体编码", color: "#db2777", bg: "#fdf2f8" },
    pack: { label: "训练打包", color: "#d97706", bg: "#fffbeb" },
  },
  ops: [
    { id: "ft-coco2yolo", name: "COCO → YOLO", cat: "annot", modality: "图像", used: 13, effect: "框贴合度 100%", desc: "将 COCO 的 xywh 绝对坐标转为 YOLO 归一化中心点格式，同步生成 classes.txt 与数据划分清单。" },
    { id: "ft-voc2coco", name: "VOC → COCO", cat: "annot", modality: "图像", used: 8, effect: "字段完整率 100%", desc: "解析 XML 标注并按子集归并为单个 COCO json，保留 original_filename 便于反查。" },
    { id: "ft-labelme", name: "LabelMe → COCO", cat: "annot", modality: "图像", used: 6, effect: "多边形无损", desc: "保留多边形顶点顺序与 group_id，支持实例分割任务的 masks 字段生成。" },
    { id: "ft-jsonl2pq", name: "JSONL ↔ Parquet", cat: "file", modality: "文本", used: 11, effect: "体积降 68%", desc: "按 schema 推断列类型后转列式存储，长文本走字典编码；异常行单独落 error.jsonl。" },
    { id: "ft-image", name: "图像编码转换", cat: "media", modality: "图像", used: 10, effect: "体积降 42%", desc: "PNG 转 JPEG / WebP（质量 90），保留原始尺寸与 EXIF 方向标记，转换后做像素差异校验。" },
    { id: "ft-video", name: "视频转封装与编码", cat: "media", modality: "视频", used: 7, effect: "H.265 / CRF 23", desc: "MP4(H.264) 转 H.265 并重新封装，按 GOP 切分分片，保证时间戳连续、音画同步。" },
    { id: "ft-audio", name: "音频重采样", cat: "media", modality: "音频", used: 9, effect: "16kHz 单声道", desc: "统一为 16kHz、16bit、单声道 WAV，重采样使用 soxr 高质量算法，避免混叠失真。" },
    { id: "ft-pointcloud", name: "点云格式转换", cat: "file", modality: "点云", used: 5, effect: "PCD / PLY / LAS", desc: "在 PCD、PLY、LAS 之间互转，保留 intensity、ring、时间戳等自定义字段。" },
    { id: "ft-tfrecord", name: "WebDataset 分片打包", cat: "pack", modality: "多模态", used: 7, effect: "1GB / 片", desc: "按 1GB 分片打包成 tar 并生成 index.json，样本以 key 对齐，支持流式顺序读取。" },
    { id: "ft-csv2jsonl", name: "CSV → JSONL 映射", cat: "file", modality: "文本", used: 6, effect: "字段映射校验", desc: "按字段映射规则把宽表转为 JSONL，缺失字段补 null，类型冲突的列单独记入校验报告。" },
  ],
  jobs: [
    { id: "FT-2026-021", name: "交通视频转 H.265 分片", dataset: "交通视频行为识别数据集", ops: ["视频转封装与编码"], input: "86,420 段 / 1.24 TB", output: "H.265 · 468 GB", status: "已完成", startedAt: "2026-11-16 20:10", owner: "admin" },
    { id: "FT-2026-020", name: "工业缺陷图像编码统一", dataset: "工业图像缺陷数据集", ops: ["图像编码转换", "COCO → YOLO"], input: "14.2 万张", output: "JPEG q90 + YOLO 标签", status: "已完成", startedAt: "2026-11-16 11:35", owner: "admin" },
    { id: "FT-2026-019", name: "城市点云 PCD 转 LAS", dataset: "城市三维点云数据集", ops: ["点云格式转换"], input: "3.6 亿点", output: "LAS 1.4 · 62 GB", status: "已完成", startedAt: "2026-11-15 09:20", owner: "admin" },
    { id: "FT-2026-022", name: "指令数据 JSONL 转 Parquet", dataset: "文本指令微调数据集", ops: ["JSONL ↔ Parquet"], input: "12.4 万条", output: "计算中", status: "运行中", startedAt: "2026-11-17 10:40", owner: "admin" },
    { id: "FT-2026-023", name: "语音语料重采样", dataset: "语音转写校对数据集", ops: ["音频重采样"], input: "2.3 万条", output: "计算中", status: "排队中", startedAt: "2026-11-17 11:15", owner: "admin" },
  ],
  jobLabel: "转换任务",
  opLabel: "转换算子",
  jobDesc: "转换任务清单",
  opDesc: "标注格式对齐训练框架，媒体编码影响加载速度与存储成本，转换后统一做完整性校验",
  newLabel: "新建转换任务",
};

// ================================================================
// 数据融合 · 视频序列处理
// ================================================================
export const VIDEO_SEQ: ModuleConfig = {
  key: "pp-video",
  title: "视频序列处理",
  subtitle: "把多路、长时间的视频对齐成可训练序列，完成抽帧、稳像、镜头切分与低质片段剔除",
  accent: "#db2777",
  accentDeep: "#be185d",
  icon: Film,
  metrics: [
    { label: "处理任务", value: "5", unit: "个", hint: "卡口 / 无人机 / 隧道" },
    { label: "累计处理时长", value: "1,284", unit: "小时", hint: "近 30 天" },
    { label: "关键帧产出", value: "12.8", unit: "万帧", hint: "已回流标注" },
    { label: "多路同步误差", value: "≤40", unit: "ms", hint: "PTP 授时对齐", tone: "#16a34a" },
  ],
  categories: {
    sample: { label: "抽帧采样", color: "#db2777", bg: "#fdf2f8" },
    sync: { label: "时序对齐", color: "#2563eb", bg: "#eff6ff" },
    enhance: { label: "画质增强", color: "#7c3aed", bg: "#f5f3ff" },
    segment: { label: "片段切分", color: "#d97706", bg: "#fffbeb" },
  },
  ops: [
    { id: "vs-keyframe", name: "关键帧提取", cat: "sample", modality: "视频", used: 12, effect: "压缩率 78%", desc: "以帧间结构相似度与运动幅度判定关键帧，保留动作转折点，避免等间隔抽帧漏掉瞬时事件。" },
    { id: "vs-fps", name: "帧率重采样", cat: "sample", modality: "视频", used: 10, effect: "30 → 10 fps", desc: "按目标帧率降采样并做时间戳重写，帧数减少但时间轴保持与原视频一致。" },
    { id: "vs-sync", name: "多路时间同步", cat: "sync", modality: "视频", used: 7, effect: "误差 ≤40ms", desc: "基于 PTP / NTP 授时对齐多路视频，以主路为基准重写各路的 PTS，生成统一时间轴。" },
    { id: "vs-optical", name: "光流与运动补偿", cat: "enhance", modality: "视频", used: 6, effect: "帧间配准 98.7%", desc: "计算稠密光流并对齐相邻帧，用于运动目标的速度估计与后续跟踪初始化。" },
    { id: "vs-stabilize", name: "视频去抖稳像", cat: "enhance", modality: "视频", used: 5, effect: "抖动降 71%", desc: "提取特征点轨迹并做平滑滤波，估计相机运动后反向补偿，保留边缘不裁切的备选策略。" },
    { id: "vs-shot", name: "镜头边界检测", cat: "segment", modality: "视频", used: 9, effect: "切分准确率 96.4%", desc: "结合直方图差异与相邻帧特征距离检测镜头切换，输出片段清单与每个片段的时长。" },
    { id: "vs-lowq", name: "低质片段剔除", cat: "segment", modality: "视频", used: 8, effect: "剔除 9.2%", desc: "以清晰度（Laplacian 方差）、亮度、遮挡比例三项打分，低于阈值的片段整段剔除并记录原因。" },
    { id: "vs-align", name: "视频与轨迹对齐", cat: "sync", modality: "视频", used: 5, effect: "对齐精度 ±2 帧", desc: "把雷达/卡口轨迹的检测时刻映射到视频帧号，生成目标框与轨迹点的一一对应表。" },
  ],
  jobs: [
    { id: "VF-2026-006", name: "卡口四路视频时间同步", dataset: "交通视频行为识别数据集", ops: ["多路时间同步", "视频与轨迹对齐"], input: "4 路 / 386 小时", output: "1 条统一时间轴", status: "已完成", startedAt: "2026-11-15 21:04", owner: "admin" },
    { id: "VF-2026-005", name: "行为识别关键帧提取", dataset: "交通视频行为识别数据集", ops: ["关键帧提取", "镜头边界检测"], input: "86,420 段", output: "12.8 万关键帧", status: "已完成", startedAt: "2026-11-14 10:20", owner: "admin" },
    { id: "VF-2026-004", name: "无人机航拍稳像", dataset: "应急多模态事件数据集", ops: ["视频去抖稳像", "光流与运动补偿"], input: "642 段", output: "612 段", status: "已完成", startedAt: "2026-11-13 15:48", owner: "admin" },
    { id: "VF-2026-007", name: "隧道视频低质片段剔除", dataset: "交通视频行为识别数据集", ops: ["低质片段剔除", "帧率重采样"], input: "1,120 段", output: "计算中", status: "运行中", startedAt: "2026-11-17 09:30", owner: "admin" },
    { id: "VF-2026-008", name: "应急事件多路视频归并", dataset: "应急多模态事件数据集", ops: ["多路时间同步", "镜头边界检测", "关键帧提取"], input: "1,860 段", output: "计算中", status: "排队中", startedAt: "2026-11-17 11:20", owner: "admin" },
  ],
  jobLabel: "序列任务",
  opLabel: "序列算子",
  jobDesc: "视频序列处理任务",
  opDesc: "先对齐时间轴再抽帧切段，顺序反了会导致关键动作跨段丢失",
  newLabel: "新建序列任务",
};

// ================================================================
// 数据融合 · 点云融合处理
// ================================================================
export const POINTCLOUD: ModuleConfig = {
  key: "pp-pointcloud",
  title: "点云融合处理",
  subtitle: "多站、多传感器点云的配准与融合，输出带色彩与语义标签的统一点云，供三维重建与目标检测使用",
  accent: "#0d9488",
  accentDeep: "#0f766e",
  icon: Boxes,
  metrics: [
    { label: "融合任务", value: "5", unit: "个", hint: "城市 / 路侧 / 车载" },
    { label: "配准点云", value: "3.6", unit: "亿点", hint: "近 30 天" },
    { label: "平均配准误差", value: "1.8", unit: "cm", hint: "ICP 收敛后 RMSE", tone: "#16a34a" },
    { label: "融合后压缩率", value: "62", unit: "%", hint: "体素下采样 + 去地面" },
  ],
  categories: {
    register: { label: "配准融合", color: "#0d9488", bg: "#f0fdfa" },
    calibrate: { label: "标定对齐", color: "#2563eb", bg: "#eff6ff" },
    filter: { label: "滤波精简", color: "#7c3aed", bg: "#f5f3ff" },
    fuse: { label: "跨模态融合", color: "#db2777", bg: "#fdf2f8" },
  },
  ops: [
    { id: "pc-icp", name: "多视角点云配准", cat: "register", modality: "点云", used: 9, effect: "RMSE 1.8cm", desc: "以 NDT 做粗配准、ICP 做精配准，迭代至收敛阈值 1e-6，输出每站的位姿变换矩阵。" },
    { id: "pc-ndt", name: "NDT 粗配准初始化", cat: "register", modality: "点云", used: 7, effect: "初值偏差降 74%", desc: "将点云体素化为正态分布，在概率密度场中搜索最优位姿，为 ICP 提供稳定初值。" },
    { id: "pc-calib", name: "激光雷达与相机标定", cat: "calibrate", modality: "点云", used: 6, effect: "重投影误差 0.6px", desc: "用标定板做外参求解，联合优化相机内参与雷达到相机的外参，输出可用于像素级融合的矩阵。" },
    { id: "pc-voxel", name: "体素下采样", cat: "filter", modality: "点云", used: 11, effect: "点数降 68%", desc: "按 0.1m 体素保留重心点，保持几何轮廓的同时显著降低后续处理与存储成本。" },
    { id: "pc-ground", name: "地面分割与去噪", cat: "filter", modality: "点云", used: 10, effect: "地面点剔除 92%", desc: "RANSAC 拟合地面并保留非地面点，再以统计离群滤波剔除雨雾噪点，避免虚警。" },
    { id: "pc-complete", name: "点云补全与孔洞修复", cat: "register", modality: "点云", used: 4, effect: "孔洞减少 81%", desc: "基于邻域几何连续性对遮挡造成的孔洞做插值补全，输出补全置信度掩码供下游取舍。" },
    { id: "pc-color", name: "点云-图像融合着色", cat: "fuse", modality: "点云", used: 8, effect: "着色覆盖率 96.8%", desc: "把图像像素按外参投影到点云上着色，遮挡与视域外的点标记为无色，避免错误上色。" },
    { id: "pc-accum", name: "多帧累积去畸变", cat: "register", modality: "点云", used: 6, effect: "密度提升 4.2 倍", desc: "按运动估计把连续帧点云变换到统一坐标系，同时校正运动畸变，提升远处目标点密度。" },
    { id: "pc-vote", name: "语义标签多模型投票", cat: "fuse", modality: "点云", used: 5, effect: "一致率 93.1%", desc: "多个检测模型的语义结果按点级多数投票融合，冲突区域标记为待人工复核。" },
  ],
  jobs: [
    { id: "PC-2026-005", name: "城市三维点云多站配准", dataset: "城市三维点云数据集", ops: ["NDT 粗配准初始化", "多视角点云配准"], input: "12 站 / 3.6 亿点", output: "统一坐标系 2.1 亿点", status: "已完成", startedAt: "2026-11-15 08:40", owner: "admin" },
    { id: "PC-2026-004", name: "路侧雷达相机联合标定", dataset: "交通视频行为识别数据集", ops: ["激光雷达与相机标定", "点云-图像融合着色"], input: "8 组标定板", output: "外参矩阵 8 套", status: "已完成", startedAt: "2026-11-14 13:26", owner: "admin" },
    { id: "PC-2026-003", name: "点云下采样与地面剔除", dataset: "城市三维点云数据集", ops: ["体素下采样", "地面分割与去噪"], input: "2.1 亿点", output: "6,720 万点", status: "已完成", startedAt: "2026-11-13 19:05", owner: "admin" },
    { id: "PC-2026-006", name: "车载多帧累积", dataset: "城市三维点云数据集", ops: ["多帧累积去畸变", "点云补全与孔洞修复"], input: "1,860 帧", output: "计算中", status: "运行中", startedAt: "2026-11-17 10:02", owner: "admin" },
    { id: "PC-2026-007", name: "语义标签融合复核", dataset: "城市治理点云数据集封装", ops: ["语义标签多模型投票"], input: "6,720 万点", output: "计算中", status: "排队中", startedAt: "2026-11-17 11:26", owner: "admin" },
  ],
  jobLabel: "融合任务",
  opLabel: "融合算子",
  jobDesc: "点云融合任务",
  opDesc: "配准精度决定融合质量，标定参数需与采集设备批次对应，换设备要重新标定",
  newLabel: "新建融合任务",
};

// ================================================================
// 数据融合 · 时空轨迹关联
// ================================================================
export const TRAJECTORY: ModuleConfig = {
  key: "pp-trajectory",
  title: "时空轨迹关联",
  subtitle: "把分散在卡口、GPS、视频里的轨迹按时间与空间关联成完整对象，支撑跨镜追踪与出行分析",
  accent: "#d97706",
  accentDeep: "#b45309",
  icon: Route,
  metrics: [
    { label: "关联任务", value: "5", unit: "个", hint: "卡口 / GPS / 视频" },
    { label: "关联轨迹", value: "248", unit: "万条", hint: "近 30 天" },
    { label: "关联准确率", value: "92.4", unit: "%", hint: "人工抽检 3,000 条", tone: "#16a34a" },
    { label: "索引查询 P95", value: "18", unit: "ms", hint: "H3 六边形索引" },
  ],
  categories: {
    link: { label: "时空关联", color: "#d97706", bg: "#fffbeb" },
    map: { label: "地图匹配", color: "#2563eb", bg: "#eff6ff" },
    clean: { label: "轨迹清洗", color: "#7c3aed", bg: "#f5f3ff" },
    index: { label: "索引构建", color: "#0891b2", bg: "#ecfeff" },
    mine: { label: "关系挖掘", color: "#db2777", bg: "#fdf2f8" },
  },
  ops: [
    { id: "tj-link", name: "多源轨迹时空关联", cat: "link", modality: "时序", used: 12, effect: "准确率 92.4%", desc: "在时间窗与空间距离双阈值内匹配不同来源的轨迹点，超阈值不关联，避免把相近目标拼错。" },
    { id: "tj-reid", name: "跨摄像头 ReID 关联", cat: "link", modality: "视频", used: 8, effect: "mAP 87.6%", desc: "以车辆外观特征做跨镜头检索，结合过车时间与路网拓扑做可达性过滤，剔除物理上不可能的匹配。" },
    { id: "tj-mapmatch", name: "轨迹地图匹配", cat: "map", modality: "时序", used: 10, effect: "吸附率 96.2%", desc: "用 HMM 把 GPS 点吸附到路网，考虑路段限速与连通性，输出带路段 ID 与偏移量的轨迹。" },
    { id: "tj-kalman", name: "轨迹平滑与去漂移", cat: "clean", modality: "时序", used: 11, effect: "漂移点剔除 88%", desc: "卡尔曼滤波估计真实位置并剔除跳变点，速度超过阈值即判为漂移，保留原始点备查。" },
    { id: "tj-stay", name: "停留点与分段识别", cat: "clean", modality: "时序", used: 7, effect: "停留召回 94%", desc: "按邻域半径与停留时长识别停留点，把长轨迹切成出行段，输出每段的起讫点与耗时。" },
    { id: "tj-h3", name: "时空索引构建", cat: "index", modality: "时序", used: 9, effect: "P95 18ms", desc: "以 H3 六边形网格 + 时间分区建索引，支持「某区域某时段」的秒级检索。" },
    { id: "tj-fill", name: "轨迹补全插值", cat: "clean", modality: "时序", used: 5, effect: "缺失段回填 76%", desc: "对采样间隔超过阈值的缺失段按最短路径插值，标注为推断点，与实测点区分展示。" },
    { id: "tj-companion", name: "人车伴随关系挖掘", cat: "mine", modality: "多模态", used: 6, effect: "可疑对 342 组", desc: "统计同现频次与时空间隔，筛出多次共同出行的对象对，结果供研判而非直接定性。" },
  ],
  jobs: [
    { id: "TJ-2026-008", name: "卡口跨镜头轨迹关联", dataset: "交通路网时序流量数据集", ops: ["跨摄像头 ReID 关联", "多源轨迹时空关联"], input: "86,420 段", output: "24.6 万条", status: "已完成", startedAt: "2026-11-16 08:30", owner: "admin" },
    { id: "TJ-2026-007", name: "出租车 GPS 地图匹配", dataset: "交通路网时序流量数据集", ops: ["轨迹地图匹配", "轨迹平滑与去漂移"], input: "1,096 万点", output: "吸附 96.2%", status: "已完成", startedAt: "2026-11-15 17:12", owner: "admin" },
    { id: "TJ-2026-006", name: "轨迹分段与停留识别", dataset: "交通路网时序流量数据集", ops: ["停留点与分段识别", "轨迹补全插值"], input: "248 万条", output: "512 万段", status: "已完成", startedAt: "2026-11-14 09:50", owner: "admin" },
    { id: "TJ-2026-009", name: "全量时空索引重建", dataset: "交通路网时序流量数据集", ops: ["时空索引构建"], input: "1,096 万点", output: "计算中", status: "运行中", startedAt: "2026-11-17 09:18", owner: "admin" },
    { id: "TJ-2026-010", name: "人车伴随关系挖掘", dataset: "交通视频行为识别数据集", ops: ["人车伴随关系挖掘", "多源轨迹时空关联"], input: "24.6 万条", output: "计算中", status: "排队中", startedAt: "2026-11-17 11:32", owner: "admin" },
  ],
  jobLabel: "关联任务",
  opLabel: "关联算子",
  jobDesc: "时空轨迹关联任务",
  opDesc: "先清洗再关联：未去漂移的轨迹会把关联结果带偏，时空阈值需按采样频率调整",
  newLabel: "新建关联任务",
};
