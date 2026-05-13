// ========== 共享数据定义 ==========
import { Image, FileText, Video, Music, Box, Brain, Sparkles, Cpu, BookOpen } from "lucide-react";

export const DATA_TYPES = [
  { value: "image",        label: "图像",     icon: Image,     color: "#8b5cf6" },
  { value: "text",         label: "文本",     icon: FileText,  color: "#3b82f6" },
  { value: "video",        label: "视频",     icon: Video,     color: "#ec4899" },
  { value: "audio",        label: "音频",     icon: Music,     color: "#f59e0b" },
  { value: "multimodal",   label: "多模态",   icon: Box,       color: "#10b981" },
  { value: "conversation", label: "对话数据", icon: Brain,     color: "#6366f1" },
  { value: "knowledge",    label: "知识图谱", icon: Sparkles,  color: "#14b8a6" },
  { value: "embedding",    label: "Embedding",icon: Cpu,       color: "#8b5cf6" },
  { value: "instruction",  label: "指令数据", icon: BookOpen,  color: "#f97316" },
];

// 各数据类型的独特属性字段
export const TYPE_SPECIFIC_FIELDS: Record<string, { label: string; name: string; type: string; options?: string[] }[]> = {
  image: [
    { label: "图像分辨率", name: "resolution", type: "select", options: ["任意", "≥224×224", "≥512×512", "≥1024×1024"] },
    { label: "标注格式",   name: "ann_format", type: "select", options: ["COCO", "VOC", "YOLO", "自定义"] },
    { label: "颜色空间",   name: "color_space",type: "select", options: ["RGB", "BGR", "灰度", "RGBA"] },
    { label: "图像类别数", name: "class_num",  type: "text", },
  ],
  text: [
    { label: "最大序列长度", name: "max_len",    type: "select", options: ["128", "256", "512", "1024", "2048", "4096"] },
    { label: "语言类型",     name: "language",   type: "select", options: ["中文", "英文", "中英混合", "其他"] },
    { label: "文本格式",     name: "text_format",type: "select", options: ["纯文本", "JSON", "JSONL", "CSV"] },
    { label: "字符集编码",   name: "encoding",   type: "select", options: ["UTF-8", "GBK", "GB2312"] },
  ],
  video: [
    { label: "视频分辨率", name: "resolution",  type: "select", options: ["720p", "1080p", "4K", "其他"] },
    { label: "帧率(FPS)", name: "fps",          type: "select", options: ["15", "24", "30", "60"] },
    { label: "视频格式",  name: "video_format", type: "select", options: ["MP4", "AVI", "MOV", "MKV"] },
    { label: "时长范围",  name: "duration",     type: "text" },
  ],
  audio: [
    { label: "采样率(Hz)",  name: "sample_rate", type: "select", options: ["8000", "16000", "22050", "44100", "48000"] },
    { label: "音频格式",    name: "audio_format",type: "select", options: ["WAV", "MP3", "FLAC", "AAC"] },
    { label: "声道数",      name: "channels",    type: "select", options: ["单声道", "双声道", "多声道"] },
    { label: "时长(分钟)",  name: "duration",    type: "text" },
  ],
  multimodal: [
    { label: "模态组合",    name: "modalities",  type: "select", options: ["图像+文本", "视频+文本", "音频+文本", "图像+音频+文本"] },
    { label: "对齐方式",    name: "align_type",  type: "select", options: ["时序对齐", "语义对齐", "空间对齐"] },
    { label: "融合策略",    name: "fusion",      type: "select", options: ["早期融合", "晚期融合", "混合融合"] },
    { label: "数据对数量",  name: "pair_count",  type: "text" },
  ],
  conversation: [
    { label: "对话轮数",  name: "turns",       type: "select", options: ["单轮", "2-5轮", "5-10轮", "10轮以上"] },
    { label: "对话场景",  name: "scenario",    type: "select", options: ["客服", "问答", "聊天", "任务型", "混合"] },
    { label: "对话格式",  name: "conv_format", type: "select", options: ["ShareGPT", "Alpaca", "OpenAI", "自定义"] },
    { label: "系统提示词",name: "system_msg",  type: "text" },
  ],
  knowledge: [
    { label: "三元组格式", name: "triple_format",type: "select", options: ["(Subject,Relation,Object)", "RDF", "JSON-LD", "自定义"] },
    { label: "关系类别数", name: "rel_types",    type: "text" },
    { label: "实体类别数", name: "ent_types",    type: "text" },
    { label: "知识领域",   name: "domain",       type: "select", options: ["通用", "金融", "医疗", "法律", "科技", "其他"] },
  ],
  embedding: [
    { label: "向量维度",   name: "dim",         type: "select", options: ["128", "256", "512", "768", "1024", "1536"] },
    { label: "相似度类型", name: "sim_type",    type: "select", options: ["余弦相似度", "点积", "欧式距离"] },
    { label: "数据格式",   name: "data_format", type: "select", options: ["Parquet", "NPY", "CSV", "JSON"] },
    { label: "语料来源",   name: "corpus_src",  type: "text" },
  ],
  instruction: [
    { label: "指令格式",   name: "inst_format", type: "select", options: ["Alpaca", "ShareGPT", "OpenAI", "自定义"] },
    { label: "指令类型",   name: "inst_type",   type: "select", options: ["通用指令", "COT推理", "代码", "数学", "混合"] },
    { label: "语言",       name: "language",    type: "select", options: ["中文", "英文", "中英混合"] },
    { label: "平均回复长度",name: "avg_resp_len",type: "text" },
  ],
};

// 各数据类型的详情额外展示字段标签
export const TYPE_DETAIL_META: Record<string, { label: string; key: string }[]> = {
  image:        [{ label: "图像分辨率", key: "resolution" }, { label: "标注格式", key: "ann_format" }, { label: "颜色空间", key: "color_space" }, { label: "类别数", key: "class_num" }],
  text:         [{ label: "最大序列长度", key: "max_len" }, { label: "语言类型", key: "language" }, { label: "文本格式", key: "text_format" }, { label: "编码", key: "encoding" }],
  video:        [{ label: "视频分辨率", key: "resolution" }, { label: "帧率", key: "fps" }, { label: "视频格式", key: "video_format" }, { label: "时长范围", key: "duration" }],
  audio:        [{ label: "采样率", key: "sample_rate" }, { label: "音频格式", key: "audio_format" }, { label: "声道数", key: "channels" }, { label: "时长(分钟)", key: "duration" }],
  multimodal:   [{ label: "模态组合", key: "modalities" }, { label: "对齐方式", key: "align_type" }, { label: "融合策略", key: "fusion" }, { label: "数据对数", key: "pair_count" }],
  conversation: [{ label: "对话轮数", key: "turns" }, { label: "对话场景", key: "scenario" }, { label: "对话格式", key: "conv_format" }, { label: "系统提示词", key: "system_msg" }],
  knowledge:    [{ label: "三元组格式", key: "triple_format" }, { label: "关系类别", key: "rel_types" }, { label: "实体类别", key: "ent_types" }, { label: "知识领域", key: "domain" }],
  embedding:    [{ label: "向量维度", key: "dim" }, { label: "相似度类型", key: "sim_type" }, { label: "数据格式", key: "data_format" }, { label: "语料来源", key: "corpus_src" }],
  instruction:  [{ label: "指令格式", key: "inst_format" }, { label: "指令类型", key: "inst_type" }, { label: "语言", key: "language" }, { label: "平均回复长度", key: "avg_resp_len" }],
};

export const SOURCE_TYPES = [
  { value: "local",    label: "本地文件",   color: "#6366f1" },
  { value: "server",   label: "文件服务器", color: "#8b5cf6" },
  { value: "cloud",    label: "云平台",     color: "#3b82f6" },
  { value: "platform", label: "平台数据",   color: "#10b981" },
  { value: "public",   label: "公开数据",   color: "#f59e0b" },
];
