// ============================================================
// 共享 Mock 数据 - 数据标注
// 12 个标注模板，每模板 1 条 Mock，共 12 条
// ============================================================

export interface AnnotationJob {
  id: string;
  name: string;
  dataset_id: string;
  dataset_name: string;
  annotators: string[];
  annotator_team?: string;
  label_template: string;           // 模板ID: text_annotation / image_annotation ...
  total_items: number;
  completed_items: number;
  kappa_score?: number;
  status: string;
  task_type: string;
  annotation_type: string;           // 子类型: ner / rect / track ...
  created_at: string;
}

// ============================================================
// ① 标注模板字典（12个模板，中文名称）
// ============================================================
export const LABEL_TEMPLATES: Record<string, { label: string; group: string; color: string; bg: string; icon: string }> = {
  text_annotation:    { label: "文本标注",          group: "基础素材", color: "#2563eb", bg: "#dbeafe",  icon: "FileText" },
  image_annotation:  { label: "图像标注",          group: "基础素材", color: "#7c3aed", bg: "#f3e8ff",  icon: "Eye" },
  video_annotation:   { label: "视频标注",          group: "基础素材", color: "#dc2626", bg: "#fee2e2",  icon: "Video" },
  audio_annotation:   { label: "音频标注",          group: "基础素材", color: "#d97706", bg: "#fef3c7",  icon: "Mic" },
  pointcloud_anno:    { label: "点云三维标注",      group: "基础素材", color: "#059669", bg: "#d1fae5",  icon: "Box" },
  multimodal_anno:    { label: "多模态对齐标注",    group: "基础素材", color: "#db2777", bg: "#fce7f3",  icon: "GitMerge" },
  sft_annotation:     { label: "SFT监督微调标注",   group: "对齐推理", color: "#0284c7", bg: "#e0f2fe",  icon: "BookOpen" },
  dpo_annotation:     { label: "DPO偏好优化标注",   group: "对齐推理", color: "#7c3aed", bg: "#f5f3ff",  icon: "Zap" },
  ppo_annotation:     { label: "PPO/RLHF样本构建",  group: "对齐推理", color: "#ea580c", bg: "#fff7ed",  icon: "TrendingUp" },
  cot_annotation:     { label: "CoT思维链推理标注",  group: "对齐推理", color: "#16a34a", bg: "#dcfce7",  icon: "Brain" },
  tot_annotation:     { label: "ToT树状推理标注",    group: "对齐推理", color: "#d97706", bg: "#fef3c7",  icon: "TreePine" },
  got_annotation:     { label: "GoT图状推理标注",    group: "对齐推理", color: "#be185d", bg: "#fce7f3",  icon: "Network" },
};

// ============================================================
// ② 标注类型字典（覆盖12模板下所有子类型）
// ============================================================
export const ANNOTATION_TYPES: Record<string, { label: string; description: string; template: string; bg: string; color: string }> = {
  // ── 文本标注 ──────────────────────────────────────────
  text_classify:     { label: "文本分类",     description: "新闻/评论/文档的主题分类",           template: "text_annotation",  bg: "#dbeafe",  color: "#2563eb" },
  ner:               { label: "命名实体识别", description: "文本中人名/地名/机构名等实体抽取",     template: "text_annotation",  bg: "#dcfce7",  color: "#16a34a" },
  relation_extract:  { label: "关系抽取",     description: "实体间关系三元组抽取",               template: "text_annotation",  bg: "#fef9c3",  color: "#ca8a04" },
  sentiment:         { label: "情感分析",     description: "文本情感倾向（正/负/中性）分析",      template: "text_annotation",  bg: "#fdf4ff",  color: "#c026d3" },
  qa:                { label: "问答标注",     description: "问答对抽取、答案区间标注",            template: "text_annotation",  bg: "#e0f2fe",  color: "#0284c7" },
  // ── 图像标注 ──────────────────────────────────────────
  rect:              { label: "矩形框标注",   description: "目标检测、边界框标注",               template: "image_annotation", bg: "#dbeafe",  color: "#1d4ed8" },
  polygon:           { label: "多边形标注",   description: "语义分割、实例分割",                 template: "image_annotation", bg: "#f3e8ff",  color: "#7c3aed" },
  keypoint:          { label: "关键点标注",   description: "人体/物体关键点地标检测",            template: "image_annotation", bg: "#fef3c7",  color: "#d97706" },
  ocr:               { label: "OCR识别标注",  description: "图像文字识别标注",                 template: "image_annotation", bg: "#f1f5f9",  color: "#64748b" },
  image_classify:    { label: "图像分类",     description: "图像类别标签标注",                   template: "image_annotation", bg: "#fce7f3",  color: "#db2777" },
  // ── 视频标注 ──────────────────────────────────────────
  track:             { label: "目标跟踪标注", description: "多目标跟踪、轨迹ID关联",             template: "video_annotation", bg: "#d1fae5",  color: "#059669" },
  segment:           { label: "时序行为标注", description: "视频片段行为片段标注",               template: "video_annotation", bg: "#e0e7ff",  color: "#4f46e5" },
  event:             { label: "事件分类标注", description: "交通/安防事件类型分类",             template: "video_annotation", bg: "#fee2e2",  color: "#dc2626" },
  // ── 音频标注 ──────────────────────────────────────────
  audio_classify:    { label: "音频分类标注", description: "语音/音效/音乐片段分类",            template: "audio_annotation", bg: "#fef9c3",  color: "#ca8a04" },
  // ── 点云三维标注 ──────────────────────────────────────
  pointcloud_det:    { label: "3D点云目标检测", description: "激光雷达点云目标边界框标注",        template: "pointcloud_anno",   bg: "#ccfbf1",  color: "#0d9488" },
  // ── 多模态对齐标注 ─────────────────────────────────────
  image_text_align:  { label: "图文对齐标注", description: "图像与描述文本的关联对齐标注",       template: "multimodal_anno",   bg: "#fce7f3",  color: "#db2777" },
  // ── SFT监督微调标注 ───────────────────────────────────
  sft:               { label: "SFT样本构建",  description: "Instruction-Input-Output 高质量样本", template: "sft_annotation",   bg: "#e0f2fe",  color: "#0284c7" },
  // ── DPO偏好优化标注 ───────────────────────────────────
  dpo:               { label: "DPO偏好对标注", description: "Chosen / Rejected 偏好对比标注",   template: "dpo_annotation",   bg: "#f5f3ff",  color: "#7c3aed" },
  // ── PPO/RLHF样本构建 ──────────────────────────────────
  ppo:               { label: "PPO奖励打分",   description: "多维度奖励模型打分标注",            template: "ppo_annotation",    bg: "#fff7ed",  color: "#ea580c" },
  // ── CoT思维链推理标注 ─────────────────────────────────
  cot:               { label: "CoT思维链标注", description: "中间推理步骤、因果链标注",          template: "cot_annotation",   bg: "#dcfce7",  color: "#16a34a" },
  // ── ToT树状推理标注 ───────────────────────────────────
  tot:               { label: "ToT树状推理标注", description: "多分支推理路径、决策树标注",      template: "tot_annotation",   bg: "#fef3c7",  color: "#d97706" },
  // ── GoT图状推理标注 ───────────────────────────────────
  got:               { label: "GoT图状推理标注", description: "图结构推理过程、节点关系标注",   template: "got_annotation",   bg: "#fce7f3",  color: "#be185d" },
};

// ============================================================
// ③ 标注任务状态字典
// ============================================================
export const ANNOTATION_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  pending:     { label: "待开始", bg: "#fef9c3", color: "#ca8a04" },
  in_progress: { label: "标注中", bg: "#dbeafe", color: "#1d4ed8" },
  reviewing:   { label: "审核中", bg: "#e0e7ff", color: "#4338ca" },
  completed:   { label: "已完成", bg: "#dcfce7", color: "#15803d" },
  paused:      { label: "已暂停", bg: "#fee2e2", color: "#dc2626" },
  rejected:    { label: "已驳回", bg: "#fef2f2", color: "#b91c1c" },
};

// ============================================================
// ④ Mock 数据（12条，每模板一条）
// ============================================================
export const MOCK_ANNOTATION_JOBS: AnnotationJob[] = [
  // ── ① 文本标注 ──────────────────────────────────────
  {
    id: "mock_text_classify_001",
    name: "新闻主题分类-文本标注",
    dataset_id: "ds_textcls_001",
    dataset_name: "NewsTopic-2026",
    annotators: ["张三", "李四", "王五"],
    annotator_team: "NLP标注组A",
    label_template: "text_annotation",
    total_items: 30000,
    completed_items: 18000,
    kappa_score: 0.89,
    status: "in_progress",
    task_type: "新闻主题分类",
    annotation_type: "text_classify",
    created_at: "2026-05-02T08:00:00Z",
  },
  {
    id: "mock_ner_001",
    name: "医疗文书命名实体识别-文本标注",
    dataset_id: "ds_ner_001",
    dataset_name: "MedicalNER-2026",
    annotators: ["李明", "王芳", "赵强"],
    annotator_team: "NLP标注组B",
    label_template: "text_annotation",
    total_items: 8500,
    completed_items: 5100,
    kappa_score: 0.84,
    status: "in_progress",
    task_type: "医疗实体识别",
    annotation_type: "ner",
    created_at: "2026-05-08T08:00:00Z",
  },
  {
    id: "mock_relation_001",
    name: "法律文书关系抽取-文本标注",
    dataset_id: "ds_rel_001",
    dataset_name: "LegalRelation-2026",
    annotators: ["周法律", "陈律师"],
    annotator_team: "NLP标注组C",
    label_template: "text_annotation",
    total_items: 6000,
    completed_items: 2400,
    kappa_score: 0.81,
    status: "in_progress",
    task_type: "法律关系抽取",
    annotation_type: "relation_extract",
    created_at: "2026-05-12T09:00:00Z",
  },
  {
    id: "mock_sentiment_001",
    name: "电商评论情感分析-文本标注",
    dataset_id: "ds_sentiment_001",
    dataset_name: "EcomSentiment-2026",
    annotators: ["刘客服", "吴运营"],
    annotator_team: "NLP标注组D",
    label_template: "text_annotation",
    total_items: 20000,
    completed_items: 20000,
    kappa_score: 0.91,
    status: "completed",
    task_type: "电商评论情感分析",
    annotation_type: "sentiment",
    created_at: "2026-03-20T09:00:00Z",
  },
  {
    id: "mock_qa_001",
    name: "客服问答对抽取-文本标注",
    dataset_id: "ds_qa_001",
    dataset_name: "QAExtract-2026",
    annotators: ["张客服", "刘助理"],
    annotator_team: "NLP标注组E",
    label_template: "text_annotation",
    total_items: 12000,
    completed_items: 7200,
    kappa_score: 0.86,
    status: "in_progress",
    task_type: "客服问答标注",
    annotation_type: "qa",
    created_at: "2026-05-06T10:00:00Z",
  },

  // ── ② 图像标注 ──────────────────────────────────────
  {
    id: "mock_rect_001",
    name: "交通目标检测-矩形框标注",
    dataset_id: "ds_rect_001",
    dataset_name: "TrafficDet-2026",
    annotators: ["张明远", "李晓峰"],
    annotator_team: "CV标注组A",
    label_template: "image_annotation",
    total_items: 12000,
    completed_items: 7800,
    kappa_score: 0.92,
    status: "in_progress",
    task_type: "交通目标检测",
    annotation_type: "rect",
    created_at: "2026-05-01T08:00:00Z",
  },
  {
    id: "mock_polygon_001",
    name: "道路场景语义分割-多边形标注",
    dataset_id: "ds_polygon_001",
    dataset_name: "RoadSeg-2026",
    annotators: ["王雪梅", "陈志远"],
    annotator_team: "CV标注组B",
    label_template: "image_annotation",
    total_items: 8000,
    completed_items: 8000,
    kappa_score: 0.95,
    status: "completed",
    task_type: "道路语义分割",
    annotation_type: "polygon",
    created_at: "2026-04-20T09:00:00Z",
  },
  {
    id: "mock_keypoint_001",
    name: "行人姿态估计-关键点标注",
    dataset_id: "ds_keypoint_001",
    dataset_name: "PedestrianPose-2026",
    annotators: ["刘宇轩", "赵敏"],
    annotator_team: "CV标注组C",
    label_template: "image_annotation",
    total_items: 6000,
    completed_items: 2400,
    kappa_score: 0.88,
    status: "in_progress",
    task_type: "行人姿态估计",
    annotation_type: "keypoint",
    created_at: "2026-05-05T10:00:00Z",
  },
  {
    id: "mock_ocr_001",
    name: "证件文字OCR识别-图像标注",
    dataset_id: "ds_ocr_001",
    dataset_name: "IDCard-OCR-2026",
    annotators: ["王五", "赵敏"],
    annotator_team: "OCR标注组",
    label_template: "image_annotation",
    total_items: 10000,
    completed_items: 10000,
    kappa_score: 0.96,
    status: "completed",
    task_type: "证件OCR识别",
    annotation_type: "ocr",
    created_at: "2026-03-15T08:00:00Z",
  },
  {
    id: "mock_imgcls_001",
    name: "场景图像分类-图像标注",
    dataset_id: "ds_imgcls_001",
    dataset_name: "SceneClassify-2026",
    annotators: ["张明远", "陈志远"],
    annotator_team: "CV标注组D",
    label_template: "image_annotation",
    total_items: 25000,
    completed_items: 25000,
    kappa_score: 0.94,
    status: "completed",
    task_type: "场景图像分类",
    annotation_type: "image_classify",
    created_at: "2026-03-10T09:00:00Z",
  },

  // ── ③ 视频标注 ──────────────────────────────────────
  {
    id: "mock_track_001",
    name: "多目标跟踪-轨迹标注",
    dataset_id: "ds_track_001",
    dataset_name: "MOT17-Traffic",
    annotators: ["李晓峰", "刘宇轩", "陈志远"],
    annotator_team: "CV标注组A",
    label_template: "video_annotation",
    total_items: 12400,
    completed_items: 4960,
    kappa_score: 0.86,
    status: "in_progress",
    task_type: "多目标跟踪",
    annotation_type: "track",
    created_at: "2026-04-19T09:30:00Z",
  },
  {
    id: "mock_segment_001",
    name: "驾驶行为片段-时序标注",
    dataset_id: "ds_segment_001",
    dataset_name: "DriverBehavior-V3",
    annotators: ["王雪梅", "赵敏"],
    annotator_team: "CV标注组B",
    label_template: "video_annotation",
    total_items: 9800,
    completed_items: 7350,
    kappa_score: 0.91,
    status: "in_progress",
    task_type: "驾驶行为识别",
    annotation_type: "segment",
    created_at: "2026-04-18T10:00:00Z",
  },
  {
    id: "mock_event_001",
    name: "交通事件分类-视频标注",
    dataset_id: "ds_event_001",
    dataset_name: "TrafficEvent-2026",
    annotators: ["交警专家(2)", "张明远"],
    annotator_team: "交通事件标注组",
    label_template: "video_annotation",
    total_items: 5280,
    completed_items: 5280,
    kappa_score: 0.93,
    status: "completed",
    task_type: "交通事件识别",
    annotation_type: "event",
    created_at: "2026-04-03T08:30:00Z",
  },

  // ── ④ 音频标注 ──────────────────────────────────────
  {
    id: "mock_audio_001",
    name: "语音指令分类-音频标注",
    dataset_id: "ds_audio_001",
    dataset_name: "VoiceCommand-2026",
    annotators: ["周杰", "吴音"],
    annotator_team: "语音标注组",
    label_template: "audio_annotation",
    total_items: 15000,
    completed_items: 6000,
    kappa_score: 0.87,
    status: "in_progress",
    task_type: "语音指令识别",
    annotation_type: "audio_classify",
    created_at: "2026-05-10T08:30:00Z",
  },

  // ── ⑤ 点云三维标注 ──────────────────────────────────
  {
    id: "mock_pointcloud_001",
    name: "激光雷达3D目标检测-点云标注",
    dataset_id: "ds_pc_001",
    dataset_name: "LiDAR-Det-2026",
    annotators: ["赵工", "钱工", "孙工"],
    annotator_team: "3D标注组A",
    label_template: "pointcloud_anno",
    total_items: 8000,
    completed_items: 3200,
    kappa_score: 0.83,
    status: "in_progress",
    task_type: "3D点云目标检测",
    annotation_type: "pointcloud_det",
    created_at: "2026-05-04T08:00:00Z",
  },

  // ── ⑥ 多模态对齐标注 ────────────────────────────────
  {
    id: "mock_multimodal_001",
    name: "图文对齐标注-多模态",
    dataset_id: "ds_mm_001",
    dataset_name: "ImageTextAlign-2026",
    annotators: ["内容审核员A", "内容审核员B"],
    annotator_team: "多模态标注组",
    label_template: "multimodal_anno",
    total_items: 18000,
    completed_items: 18000,
    kappa_score: 0.90,
    status: "completed",
    task_type: "图文对齐",
    annotation_type: "image_text_align",
    created_at: "2026-04-10T09:00:00Z",
  },

  // ── ⑦ SFT监督微调标注 ────────────────────────────────
  {
    id: "mock_sft_001",
    name: "通用助手SFT样本构建-监督微调",
    dataset_id: "ds_sft_001",
    dataset_name: "SFT-General-2026",
    annotators: ["AI训练师(3)"],
    annotator_team: "LLM标注组A",
    label_template: "sft_annotation",
    total_items: 5000,
    completed_items: 3500,
    kappa_score: 0.88,
    status: "in_progress",
    task_type: "SFT样本构建",
    annotation_type: "sft",
    created_at: "2026-05-03T08:30:00Z",
  },

  // ── ⑧ DPO偏好优化标注 ────────────────────────────────
  {
    id: "mock_dpo_001",
    name: "对话助手DPO偏好对标注",
    dataset_id: "ds_dpo_001",
    dataset_name: "DPO-Chatbot-2026",
    annotators: ["标注员P", "标注员Q"],
    annotator_team: "LLM标注组B",
    label_template: "dpo_annotation",
    total_items: 3000,
    completed_items: 1200,
    kappa_score: 0.82,
    status: "in_progress",
    task_type: "DPO偏好优化",
    annotation_type: "dpo",
    created_at: "2026-05-07T09:00:00Z",
  },

  // ── ⑨ PPO/RLHF样本构建 ──────────────────────────────
  {
    id: "mock_ppo_001",
    name: "回答质量PPO多维打分-RLHF",
    dataset_id: "ds_ppo_001",
    dataset_name: "PPO-Reward-2026",
    annotators: ["专家评审A", "专家评审B"],
    annotator_team: "LLM标注组C",
    label_template: "ppo_annotation",
    total_items: 4000,
    completed_items: 4000,
    kappa_score: 0.91,
    status: "completed",
    task_type: "PPO奖励打分",
    annotation_type: "ppo",
    created_at: "2026-04-25T10:00:00Z",
  },

  // ── ⑩ CoT思维链推理标注 ─────────────────────────────
  {
    id: "mock_cot_001",
    name: "数学推理CoT思维链标注",
    dataset_id: "ds_cot_001",
    dataset_name: "Math-CoT-2026",
    annotators: ["数学教师(2)", "标注员R"],
    annotator_team: "推理标注组A",
    label_template: "cot_annotation",
    total_items: 6000,
    completed_items: 2400,
    kappa_score: 0.85,
    status: "in_progress",
    task_type: "CoT思维链",
    annotation_type: "cot",
    created_at: "2026-05-09T08:00:00Z",
  },

  // ── ⑪ ToT树状推理标注 ───────────────────────────────
  {
    id: "mock_tot_001",
    name: "决策推理ToT树状路径标注",
    dataset_id: "ds_tot_001",
    dataset_name: "Decision-ToT-2026",
    annotators: ["决策专家(2)"],
    annotator_team: "推理标注组B",
    label_template: "tot_annotation",
    total_items: 3500,
    completed_items: 1400,
    kappa_score: 0.79,
    status: "in_progress",
    task_type: "ToT树状推理",
    annotation_type: "tot",
    created_at: "2026-05-11T09:30:00Z",
  },

  // ── ⑫ GoT图状推理标注 ───────────────────────────────
  {
    id: "mock_got_001",
    name: "知识问答GoT图结构推理标注",
    dataset_id: "ds_got_001",
    dataset_name: "KG-GoT-2026",
    annotators: ["知识图谱专家(2)", "标注员S"],
    annotator_team: "推理标注组C",
    label_template: "got_annotation",
    total_items: 4500,
    completed_items: 1800,
    kappa_score: 0.81,
    status: "in_progress",
    task_type: "GoT图状推理",
    annotation_type: "got",
    created_at: "2026-05-13T08:00:00Z",
  },
];

export const STORAGE_KEY = "taskforge_annotation_jobs";
export const MOCK_JOBS = MOCK_ANNOTATION_JOBS;
