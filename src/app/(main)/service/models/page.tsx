"use client";
import { useState } from "react";
import {
  Search, Filter, Download, Heart, Star, Eye, ChevronDown,
  Cpu, Brain, Sparkles, Image, Mic, Video, Code, Zap,
  ArrowUpDown, Grid3X3, List, SlidersHorizontal, RefreshCw,
  BookOpen, Box, Globe, MessageSquare, Layers
} from "lucide-react";

// ── 任务类型筛选 ──
const TASK_CATEGORIES = [
  { key: "all", label: "全部", icon: Grid3X3 },
  { key: "nlp", label: "自然语言处理", icon: MessageSquare },
  { key: "cv", label: "计算机视觉", icon: Image },
  { key: "audio", label: "语音识别", icon: Mic },
  { key: "multimodal", label: "多模态", icon: Layers },
  { key: "rl", label: "强化学习", icon: Zap },
  { key: "kg", label: "知识图谱", icon: Globe },
  { key: "3d", label: "3D生成", icon: Box },
];

// ── Mock 模型数据 ──
const MOCK_MODELS = [
  {
    id: "m1", name: "Qwen2.5-72B-Instruct", org: "Qwen",
    desc: "通义千问2.5系列720亿参数指令微调模型，支持长上下文、工具调用和代码生成",
    taskType: "nlp", subTask: "文本生成",
    framework: "PyTorch", license: "Apache 2.0",
    downloads: 186420, likes: 3256, stars: 4820,
    tags: ["大语言模型", "指令微调", "长上下文"],
    updated: "2天前", size: "140GB",
    trending: true,
  },
  {
    id: "m2", name: "DeepSeek-R1-Distill-Qwen-32B", org: "DeepSeek",
    desc: "DeepSeek-R1推理模型蒸馏版，在数学推理、代码生成等任务上表现优异",
    taskType: "nlp", subTask: "推理",
    framework: "PyTorch", license: "MIT",
    downloads: 92340, likes: 2180, stars: 3560,
    tags: ["推理模型", "数学", "代码"],
    updated: "5天前", size: "62GB",
    trending: true,
  },
  {
    id: "m3", name: "InternVL3-78B", org: "OpenGVLab",
    desc: "书生视觉大模型3代，多模态理解与生成，支持图文对话和视觉推理",
    taskType: "multimodal", subTask: "视觉语言",
    framework: "PyTorch", license: "Apache 2.0",
    downloads: 56230, likes: 1560, stars: 2340,
    tags: ["多模态", "视觉语言", "图文理解"],
    updated: "1周前", size: "155GB",
    trending: true,
  },
  {
    id: "m4", name: "Whisper-Large-V3", org: "OpenAI",
    desc: "Whisper语音识别大模型V3版本，支持99种语言的语音转文本",
    taskType: "audio", subTask: "语音识别",
    framework: "PyTorch", license: "MIT",
    downloads: 145670, likes: 4890, stars: 6720,
    tags: ["语音识别", "多语言", "ASR"],
    updated: "3周前", size: "3GB",
    trending: false,
  },
  {
    id: "m5", name: "StableDiffusion-XL-1.0", org: "StabilityAI",
    desc: "SDXL图像生成模型，高质量文生图，支持多种风格和精细化控制",
    taskType: "cv", subTask: "图像生成",
    framework: "PyTorch", license: "CreativeML",
    downloads: 234560, likes: 8920, stars: 12340,
    tags: ["图像生成", "文生图", "扩散模型"],
    updated: "1月前", size: "6.9GB",
    trending: false,
  },
  {
    id: "m6", name: "ChatGLM4-9B", org: "ZhipuAI",
    desc: "智谱GLM-4系列90亿参数对话模型，中英双语，支持工具调用",
    taskType: "nlp", subTask: "对话生成",
    framework: "PyTorch", license: "Apache 2.0",
    downloads: 67890, likes: 2340, stars: 3450,
    tags: ["对话模型", "双语", "工具调用"],
    updated: "3天前", size: "18GB",
    trending: false,
  },
  {
    id: "m7", name: "YOLOv8-X", org: "Ultralytics",
    desc: "YOLOv8超大模型，目标检测、实例分割、姿态估计三合一",
    taskType: "cv", subTask: "目标检测",
    framework: "PyTorch", license: "AGPL-3.0",
    downloads: 312450, likes: 5670, stars: 8900,
    tags: ["目标检测", "实例分割", "实时推理"],
    updated: "2周前", size: "700MB",
    trending: true,
  },
  {
    id: "m8", name: "Bark", org: "Suno",
    desc: "文本转语音模型，支持多语言、音乐生成和音效合成",
    taskType: "audio", subTask: "语音合成",
    framework: "PyTorch", license: "MIT",
    downloads: 89010, likes: 3450, stars: 5120,
    tags: ["语音合成", "TTS", "音乐"],
    updated: "1月前", size: "3GB",
    trending: false,
  },
  {
    id: "m9", name: "Point-E", org: "OpenAI",
    desc: "文本转3D点云模型，快速生成3D资产，适合游戏和虚拟场景",
    taskType: "3d", subTask: "3D生成",
    framework: "PyTorch", license: "MIT",
    downloads: 34560, likes: 1230, stars: 1980,
    tags: ["3D生成", "点云", "文本到3D"],
    updated: "2月前", size: "1.2GB",
    trending: false,
  },
  {
    id: "m10", name: "Baichuan2-13B-Chat", org: "Baichuan",
    desc: "百川2代130亿参数对话模型，中文能力突出，支持长文本对话",
    taskType: "nlp", subTask: "对话生成",
    framework: "PyTorch", license: "Apache 2.0",
    downloads: 45670, likes: 1890, stars: 2670,
    tags: ["对话模型", "中文优化", "长文本"],
    updated: "1周前", size: "26GB",
    trending: false,
  },
  {
    id: "m11", name: "SAM2-Large", org: "Meta",
    desc: "Segment Anything Model 2，支持图像和视频的通用分割",
    taskType: "cv", subTask: "图像分割",
    framework: "PyTorch", license: "Apache 2.0",
    downloads: 128900, likes: 4560, stars: 7230,
    tags: ["图像分割", "视频分割", "零样本"],
    updated: "4天前", size: "2.4GB",
    trending: true,
  },
  {
    id: "m12", name: "ERINE-4.5-21B", org: "Baidu",
    desc: "文心4.5系列210亿参数模型，知识增强+多模态理解",
    taskType: "multimodal", subTask: "知识增强",
    framework: "PaddlePaddle", license: "Apache 2.0",
    downloads: 38900, likes: 1340, stars: 2100,
    tags: ["知识增强", "多模态", "中文"],
    updated: "6天前", size: "42GB",
    trending: false,
  },
];

function formatNum(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(1) + "万";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function getTaskColor(type: string) {
  const map: Record<string, string> = {
    nlp: "#3b82f6", cv: "#10b981", audio: "#f59e0b",
    multimodal: "#8b5cf6", rl: "#ef4444", kg: "#06b6d4", "3d": "#ec4899",
  };
  return map[type] || "#64748b";
}

export default function ModelServicePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"downloads" | "likes" | "updated">("downloads");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // 筛选 + 排序
  const filteredModels = MOCK_MODELS
    .filter(m => activeCategory === "all" || m.taskType === activeCategory)
    .filter(m =>
      !searchQuery ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.org.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.desc.includes(searchQuery) ||
      m.tags.some(t => t.includes(searchQuery))
    )
    .sort((a, b) => {
      if (sortBy === "downloads") return b.downloads - a.downloads;
      if (sortBy === "likes") return b.likes - a.likes;
      return 0; // updated 排序用字符串不精确，保持原序
    });

  return (
    <div style={{ padding: 24, background: "#f8fafc", minHeight: "100vh" }}>
      {/* 页面头部 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Brain size={18} style={{ color: "#fff" }} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>模型服务</h1>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
              发现和使用高质量 AI 模型 · 共 {MOCK_MODELS.length} 个模型
            </p>
          </div>
        </div>
      </div>

      {/* 搜索栏 + 排序/视图 */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
        background: "#fff", padding: "14px 18px", borderRadius: 12,
        border: "1px solid #e2e8f0",
      }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={15} style={{
            position: "absolute", left: 12, top: "50%",
            transform: "translateY(-50%)", color: "#94a3b8",
          }} />
          <input
            type="text"
            placeholder="搜索模型名称、机构、标签..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: "100%", height: 36, paddingLeft: 36, paddingRight: 12,
              borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc",
              fontSize: 13, color: "#334155", outline: "none",
            }}
          />
        </div>

        {/* 排序 */}
        <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
          {([
            { key: "downloads", label: "最多下载" },
            { key: "likes", label: "最多收藏" },
            { key: "updated", label: "最近更新" },
          ] as const).map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              style={{
                padding: "5px 12px", borderRadius: 6, border: "none",
                background: sortBy === opt.key ? "#fff" : "transparent",
                color: sortBy === opt.key ? "#6366f1" : "#64748b",
                fontSize: 12, fontWeight: sortBy === opt.key ? 600 : 400,
                cursor: "pointer", boxShadow: sortBy === opt.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 视图切换 */}
        <div style={{ display: "flex", gap: 2, background: "#f1f5f9", borderRadius: 6, padding: 2 }}>
          <button
            onClick={() => setViewMode("grid")}
            style={{
              padding: "5px 8px", borderRadius: 4, border: "none",
              background: viewMode === "grid" ? "#fff" : "transparent",
              color: viewMode === "grid" ? "#6366f1" : "#64748b",
              cursor: "pointer", display: "flex", alignItems: "center",
              boxShadow: viewMode === "grid" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            }}
          >
            <Grid3X3 size={14} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            style={{
              padding: "5px 8px", borderRadius: 4, border: "none",
              background: viewMode === "list" ? "#fff" : "transparent",
              color: viewMode === "list" ? "#6366f1" : "#64748b",
              cursor: "pointer", display: "flex", alignItems: "center",
              boxShadow: viewMode === "list" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            }}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* 任务类型筛选 Tab */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 20, overflowX: "auto",
        padding: "10px 14px", background: "#fff", borderRadius: 12,
        border: "1px solid #e2e8f0",
      }}>
        {TASK_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8, border: "none",
                background: isActive ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#f1f5f9",
                color: isActive ? "#fff" : "#475569",
                fontSize: 12, fontWeight: isActive ? 600 : 400,
                cursor: "pointer", whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              <Icon size={13} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 结果统计 */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 14, padding: "0 2px",
      }}>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>
          找到 <b style={{ color: "#6366f1" }}>{filteredModels.length}</b> 个模型
        </span>
      </div>

      {/* 模型卡片网格 */}
      {viewMode === "grid" ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 16,
        }}>
          {filteredModels.map(model => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredModels.map(model => (
            <ModelListItem key={model.id} model={model} />
          ))}
        </div>
      )}

      {/* 空状态 */}
      {filteredModels.length === 0 && (
        <div style={{
          textAlign: "center", padding: "80px 20px",
          color: "#94a3b8",
        }}>
          <Search size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p style={{ fontSize: 14, fontWeight: 500 }}>未找到匹配的模型</p>
          <p style={{ fontSize: 12 }}>试试调整搜索条件或切换分类</p>
        </div>
      )}
    </div>
  );
}

// ── 卡片组件 ──
function ModelCard({ model }: { model: typeof MOCK_MODELS[0] }) {
  const taskColor = getTaskColor(model.taskType);
  const [liked, setLiked] = useState(false);

  return (
    <div style={{
      background: "#fff",
      borderRadius: 12,
      border: "1px solid #e2e8f0",
      padding: 18,
      transition: "all 0.2s",
      cursor: "pointer",
      position: "relative",
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
      (e.currentTarget as HTMLElement).style.borderColor = "#c7d2fe";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.boxShadow = "none";
      (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
    }}
    >
      {/* Trending 标识 */}
      {model.trending && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          padding: "2px 8px", borderRadius: 4,
          background: "linear-gradient(135deg, #f59e0b, #f97316)",
          color: "#fff", fontSize: 9, fontWeight: 700,
        }}>
          🔥 热门
        </div>
      )}

      {/* 头部：机构 + 名称 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: `${taskColor}15`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Brain size={16} style={{ color: taskColor }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: "#1e293b",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {model.name}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            {model.org} · {model.size}
          </div>
        </div>
      </div>

      {/* 描述 */}
      <p style={{
        fontSize: 12, color: "#64748b", lineHeight: 1.5,
        marginBottom: 12, display: "-webkit-box",
        WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>
        {model.desc}
      </p>

      {/* 标签 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
        {model.tags.map(tag => (
          <span key={tag} style={{
            padding: "2px 8px", borderRadius: 4,
            background: "#f1f5f9", color: "#475569",
            fontSize: 10, fontWeight: 500,
          }}>
            {tag}
          </span>
        ))}
        <span style={{
          padding: "2px 8px", borderRadius: 4,
          background: `${taskColor}10`, color: taskColor,
          fontSize: 10, fontWeight: 600,
        }}>
          {model.subTask}
        </span>
      </div>

      {/* 底部统计 */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: "1px solid #f1f5f9", paddingTop: 10,
      }}>
        <div style={{ display: "flex", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Download size={11} style={{ color: "#94a3b8" }} />
            <span style={{ fontSize: 11, color: "#64748b" }}>{formatNum(model.downloads)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 3, cursor: "pointer" }}
            onClick={e => { e.stopPropagation(); setLiked(!liked); }}
          >
            <Heart size={11} style={{ color: liked ? "#ef4444" : "#94a3b8", fill: liked ? "#ef4444" : "none" }} />
            <span style={{ fontSize: 11, color: liked ? "#ef4444" : "#64748b" }}>{formatNum(model.likes + (liked ? 1 : 0))}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Star size={11} style={{ color: "#94a3b8" }} />
            <span style={{ fontSize: 11, color: "#64748b" }}>{formatNum(model.stars)}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            padding: "2px 6px", borderRadius: 3,
            background: "#f1f5f9", color: "#64748b",
            fontSize: 9, fontWeight: 500,
          }}>
            {model.framework}
          </span>
          <span style={{ fontSize: 10, color: "#cbd5e1" }}>{model.updated}</span>
        </div>
      </div>
    </div>
  );
}

// ── 列表项组件 ──
function ModelListItem({ model }: { model: typeof MOCK_MODELS[0] }) {
  const taskColor = getTaskColor(model.taskType);
  const [liked, setLiked] = useState(false);

  return (
    <div style={{
      background: "#fff", borderRadius: 10,
      border: "1px solid #e2e8f0", padding: "14px 18px",
      display: "flex", alignItems: "center", gap: 16,
      transition: "all 0.15s", cursor: "pointer",
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
      (e.currentTarget as HTMLElement).style.borderColor = "#c7d2fe";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.boxShadow = "none";
      (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
    }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: `${taskColor}15`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Brain size={18} style={{ color: taskColor }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{model.name}</span>
          {model.trending && (
            <span style={{
              padding: "1px 6px", borderRadius: 3,
              background: "linear-gradient(135deg, #f59e0b, #f97316)",
              color: "#fff", fontSize: 9, fontWeight: 700,
            }}>🔥 热门</span>
          )}
          <span style={{ fontSize: 11, color: "#94a3b8" }}>{model.org}</span>
        </div>
        <p style={{ fontSize: 12, color: "#64748b", margin: "3px 0 0", lineHeight: 1.4,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {model.desc}
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 200 }}>
        {model.tags.slice(0, 2).map(tag => (
          <span key={tag} style={{
            padding: "2px 6px", borderRadius: 3,
            background: "#f1f5f9", color: "#475569",
            fontSize: 10,
          }}>{tag}</span>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Download size={12} style={{ color: "#94a3b8" }} />
          <span style={{ fontSize: 11, color: "#64748b" }}>{formatNum(model.downloads)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 3, cursor: "pointer" }}
          onClick={e => { e.stopPropagation(); setLiked(!liked); }}
        >
          <Heart size={12} style={{ color: liked ? "#ef4444" : "#94a3b8", fill: liked ? "#ef4444" : "none" }} />
          <span style={{ fontSize: 11, color: liked ? "#ef4444" : "#64748b" }}>{formatNum(model.likes + (liked ? 1 : 0))}</span>
        </div>
      </div>

      <div style={{ flexShrink: 0, textAlign: "right", minWidth: 60 }}>
        <span style={{ fontSize: 10, color: "#cbd5e1" }}>{model.size}</span>
      </div>
    </div>
  );
}
