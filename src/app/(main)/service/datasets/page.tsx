"use client";
import { useState } from "react";
import {
  Search, Filter, Download, Heart, Star, Eye, ChevronDown,
  Database, Brain, Sparkles, Image, Mic, Video, Code, Zap,
  ArrowUpDown, Grid3X3, List, SlidersHorizontal, RefreshCw,
  BookOpen, Box, Globe, MessageSquare, Layers, FileText,
  Table, BarChart3, GitBranch, HardDrive
} from "lucide-react";

// ── 数据集类型筛选 ──
const DATA_CATEGORIES = [
  { key: "all", label: "全部", icon: Grid3X3 },
  { key: "nlp", label: "自然语言", icon: MessageSquare },
  { key: "cv", label: "计算机视觉", icon: Image },
  { key: "audio", label: "语音音频", icon: Mic },
  { key: "multimodal", label: "多模态", icon: Layers },
  { key: "tabular", label: "表格数据", icon: Table },
  { key: "timeseries", label: "时序数据", icon: BarChart3 },
  { key: "graph", label: "图数据", icon: GitBranch },
];

// ── Mock 数据集 ──
const MOCK_DATASETS = [
  {
    id: "d1", name: "COIG-CQIA 中文高质量指令数据集", org: "COIG",
    desc: "涵盖多个领域的高质量中文指令微调数据集，包含问答、摘要、翻译、代码等任务",
    category: "nlp", subCategory: "指令微调",
    size: "3.2GB", samples: 68420, license: "CC BY 4.0",
    downloads: 89230, likes: 2340, stars: 3670,
    tags: ["中文", "指令微调", "多领域"],
    format: "JSON", updated: "3天前",
    hot: true,
  },
  {
    id: "d2", name: "COCO-2024 图像描述与检测数据集", org: "Microsoft",
    desc: "COCO数据集2024版扩展，包含33万张图像，支持目标检测、分割和图像描述",
    category: "cv", subCategory: "目标检测",
    size: "25.6GB", samples: 330000, license: "CC BY 4.0",
    downloads: 234560, likes: 6780, stars: 9120,
    tags: ["图像描述", "目标检测", "分割"],
    format: "JSON + Images", updated: "1周前",
    hot: true,
  },
  {
    id: "d3", name: "AIShell-2 中文语音识别数据集", org: "AIShell",
    desc: "1000小时中文语音识别训练数据，覆盖多方言和多场景",
    category: "audio", subCategory: "语音识别",
    size: "18.4GB", samples: 500000, license: "CC BY-SA 4.0",
    downloads: 56780, likes: 1890, stars: 2560,
    tags: ["中文语音", "ASR", "多方言"],
    format: "WAV + JSON", updated: "2周前",
    hot: false,
  },
  {
    id: "d4", name: "MME 多模态评估基准", org: "OpenGVLab",
    desc: "综合多模态模型评估基准，涵盖感知和认知两大维度14个子任务",
    category: "multimodal", subCategory: "评估基准",
    size: "1.8GB", samples: 2860, license: "Apache 2.0",
    downloads: 45230, likes: 1560, stars: 2340,
    tags: ["评估基准", "多模态", "感知认知"],
    format: "JSON + Images", updated: "5天前",
    hot: true,
  },
  {
    id: "d5", name: "Waymo Open Dataset", org: "Waymo",
    desc: "自动驾驶场景数据集，包含激光雷达点云、摄像头图像和3D标注",
    category: "cv", subCategory: "自动驾驶",
    size: "120GB", samples: 200000, license: "Custom",
    downloads: 78900, likes: 3450, stars: 5670,
    tags: ["自动驾驶", "3D标注", "点云"],
    format: "TFRecord", updated: "1月前",
    hot: false,
  },
  {
    id: "d6", name: "Alpaca-GPT4 中文指令数据集", org: "Stanford",
    desc: "基于GPT-4生成的中文指令数据集，包含5.2万条高质量指令-回复对",
    category: "nlp", subCategory: "指令微调",
    size: "890MB", samples: 52000, license: "MIT",
    downloads: 156780, likes: 4560, stars: 6890,
    tags: ["GPT-4", "中文指令", "SFT"],
    format: "JSON", updated: "3周前",
    hot: false,
  },
  {
    id: "d7", name: "ETTh1 电力负荷时序数据", org: "THUML",
    desc: "电力变压器温度数据集，多变量时序预测常用基准，7个特征维度",
    category: "timeseries", subCategory: "时序预测",
    size: "45MB", samples: 17420, license: "MIT",
    downloads: 34560, likes: 890, stars: 1340,
    tags: ["时序预测", "电力", "多变量"],
    format: "CSV", updated: "2月前",
    hot: false,
  },
  {
    id: "d8", name: "OpenKG 中文知识图谱数据集", org: "OpenKG",
    desc: "大规模中文知识图谱，涵盖百科、医疗、金融等领域实体与关系",
    category: "graph", subCategory: "知识图谱",
    size: "5.6GB", samples: 1200000, license: "CC BY-SA 4.0",
    downloads: 23450, likes: 670, stars: 980,
    tags: ["知识图谱", "中文", "多领域"],
    format: "RDF/N-Triples", updated: "1月前",
    hot: false,
  },
  {
    id: "d9", name: "MMLU-Pro 大规模多任务语言理解", org: "Hendrycks Lab",
    desc: "MMLU增强版，涵盖57个学科14K问题，适合大模型知识能力评估",
    category: "nlp", subCategory: "评估基准",
    size: "320MB", samples: 14000, license: "MIT",
    downloads: 67890, likes: 2890, stars: 4120,
    tags: ["评估基准", "多学科", "知识推理"],
    format: "JSON", updated: "4天前",
    hot: true,
  },
  {
    id: "d10", name: "UrbanScene3D 城市三维场景数据集", org: "WHU",
    desc: "大规模城市三维场景数据集，包含建筑、道路、植被等语义标注",
    category: "cv", subCategory: "3D场景",
    size: "48GB", samples: 15000, license: "CC BY 4.0",
    downloads: 12340, likes: 560, stars: 780,
    tags: ["3D场景", "城市", "语义分割"],
    format: "PLY + JSON", updated: "3周前",
    hot: false,
  },
  {
    id: "d11", name: "LIBERO 机器人操作基准", org: "Stanford",
    desc: "机器人操作任务基准，包含130个长时序操作任务和仿真环境",
    category: "multimodal", subCategory: "机器人操作",
    size: "12GB", samples: 130, license: "MIT",
    downloads: 8760, likes: 340, stars: 520,
    tags: ["机器人", "操作任务", "仿真"],
    format: "HDF5", updated: "2周前",
    hot: false,
  },
  {
    id: "d12", name: "UCI Adult 人口普查表格数据", org: "UCI",
    desc: "经典表格分类数据集，含48842条人口普查记录，14个属性特征",
    category: "tabular", subCategory: "分类",
    size: "4MB", samples: 48842, license: "CC BY 4.0",
    downloads: 198760, likes: 1230, stars: 1890,
    tags: ["表格数据", "分类", "经典数据集"],
    format: "CSV", updated: "6月前",
    hot: false,
  },
];

function formatNum(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(1) + "万";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function getCatColor(cat: string) {
  const map: Record<string, string> = {
    nlp: "#3b82f6", cv: "#10b981", audio: "#f59e0b",
    multimodal: "#8b5cf6", tabular: "#06b6d4", timeseries: "#ec4899", graph: "#f97316",
  };
  return map[cat] || "#64748b";
}

export default function DatasetServicePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"downloads" | "likes" | "samples">("downloads");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredDatasets = MOCK_DATASETS
    .filter(d => activeCategory === "all" || d.category === activeCategory)
    .filter(d =>
      !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.org.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.desc.includes(searchQuery) ||
      d.tags.some(t => t.includes(searchQuery))
    )
    .sort((a, b) => {
      if (sortBy === "downloads") return b.downloads - a.downloads;
      if (sortBy === "likes") return b.likes - a.likes;
      if (sortBy === "samples") return b.samples - a.samples;
      return 0;
    });

  return (
    <div style={{ padding: 24, background: "#f8fafc", minHeight: "100vh" }}>
      {/* 页面头部 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Database size={18} style={{ color: "#fff" }} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>高质量数据集</h1>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
              发现和使用高质量数据集 · 共 {MOCK_DATASETS.length} 个数据集
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
            placeholder="搜索数据集名称、机构、标签..."
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
            { key: "samples", label: "样本最多" },
          ] as const).map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              style={{
                padding: "5px 12px", borderRadius: 6, border: "none",
                background: sortBy === opt.key ? "#fff" : "transparent",
                color: sortBy === opt.key ? "#059669" : "#64748b",
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
              color: viewMode === "grid" ? "#059669" : "#64748b",
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
              color: viewMode === "list" ? "#059669" : "#64748b",
              cursor: "pointer", display: "flex", alignItems: "center",
              boxShadow: viewMode === "list" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            }}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* 类型筛选 Tab */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 20, overflowX: "auto",
        padding: "10px 14px", background: "#fff", borderRadius: 12,
        border: "1px solid #e2e8f0",
      }}>
        {DATA_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8, border: "none",
                background: isActive ? "linear-gradient(135deg, #10b981, #059669)" : "#f1f5f9",
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
          找到 <b style={{ color: "#059669" }}>{filteredDatasets.length}</b> 个数据集
        </span>
      </div>

      {/* 数据集卡片网格 */}
      {viewMode === "grid" ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 16,
        }}>
          {filteredDatasets.map(ds => (
            <DatasetCard key={ds.id} dataset={ds} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredDatasets.map(ds => (
            <DatasetListItem key={ds.id} dataset={ds} />
          ))}
        </div>
      )}

      {/* 空状态 */}
      {filteredDatasets.length === 0 && (
        <div style={{
          textAlign: "center", padding: "80px 20px",
          color: "#94a3b8",
        }}>
          <Search size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p style={{ fontSize: 14, fontWeight: 500 }}>未找到匹配的数据集</p>
          <p style={{ fontSize: 12 }}>试试调整搜索条件或切换分类</p>
        </div>
      )}
    </div>
  );
}

// ── 卡片组件 ──
function DatasetCard({ dataset }: { dataset: typeof MOCK_DATASETS[0] }) {
  const catColor = getCatColor(dataset.category);
  const [liked, setLiked] = useState(false);

  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      border: "1px solid #e2e8f0", padding: 18,
      transition: "all 0.2s", cursor: "pointer",
      position: "relative",
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
      (e.currentTarget as HTMLElement).style.borderColor = "#a7f3d0";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.boxShadow = "none";
      (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
    }}
    >
      {/* Hot 标识 */}
      {dataset.hot && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          padding: "2px 8px", borderRadius: 4,
          background: "linear-gradient(135deg, #10b981, #059669)",
          color: "#fff", fontSize: 9, fontWeight: 700,
        }}>
          🔥 热门
        </div>
      )}

      {/* 头部 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: `${catColor}15`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Database size={16} style={{ color: catColor }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: "#1e293b",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {dataset.name}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            {dataset.org} · {dataset.size}
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
        {dataset.desc}
      </p>

      {/* 标签 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
        {dataset.tags.map(tag => (
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
          background: `${catColor}10`, color: catColor,
          fontSize: 10, fontWeight: 600,
        }}>
          {dataset.subCategory}
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
            <span style={{ fontSize: 11, color: "#64748b" }}>{formatNum(dataset.downloads)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 3, cursor: "pointer" }}
            onClick={e => { e.stopPropagation(); setLiked(!liked); }}
          >
            <Heart size={11} style={{ color: liked ? "#ef4444" : "#94a3b8", fill: liked ? "#ef4444" : "none" }} />
            <span style={{ fontSize: 11, color: liked ? "#ef4444" : "#64748b" }}>{formatNum(dataset.likes + (liked ? 1 : 0))}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <FileText size={11} style={{ color: "#94a3b8" }} />
            <span style={{ fontSize: 11, color: "#64748b" }}>{formatNum(dataset.samples)}条</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            padding: "2px 6px", borderRadius: 3,
            background: "#f1f5f9", color: "#64748b",
            fontSize: 9, fontWeight: 500,
          }}>
            {dataset.format}
          </span>
          <span style={{ fontSize: 10, color: "#cbd5e1" }}>{dataset.updated}</span>
        </div>
      </div>
    </div>
  );
}

// ── 列表项组件 ──
function DatasetListItem({ dataset }: { dataset: typeof MOCK_DATASETS[0] }) {
  const catColor = getCatColor(dataset.category);
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
      (e.currentTarget as HTMLElement).style.borderColor = "#a7f3d0";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.boxShadow = "none";
      (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
    }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: `${catColor}15`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Database size={18} style={{ color: catColor }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{dataset.name}</span>
          {dataset.hot && (
            <span style={{
              padding: "1px 6px", borderRadius: 3,
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff", fontSize: 9, fontWeight: 700,
            }}>🔥 热门</span>
          )}
          <span style={{ fontSize: 11, color: "#94a3b8" }}>{dataset.org}</span>
        </div>
        <p style={{ fontSize: 12, color: "#64748b", margin: "3px 0 0", lineHeight: 1.4,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {dataset.desc}
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 200 }}>
        {dataset.tags.slice(0, 2).map(tag => (
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
          <span style={{ fontSize: 11, color: "#64748b" }}>{formatNum(dataset.downloads)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 3, cursor: "pointer" }}
          onClick={e => { e.stopPropagation(); setLiked(!liked); }}
        >
          <Heart size={12} style={{ color: liked ? "#ef4444" : "#94a3b8", fill: liked ? "#ef4444" : "none" }} />
          <span style={{ fontSize: 11, color: liked ? "#ef4444" : "#64748b" }}>{formatNum(dataset.likes + (liked ? 1 : 0))}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <FileText size={12} style={{ color: "#94a3b8" }} />
          <span style={{ fontSize: 11, color: "#64748b" }}>{formatNum(dataset.samples)}条</span>
        </div>
      </div>

      <div style={{ flexShrink: 0, textAlign: "right", minWidth: 60 }}>
        <span style={{ fontSize: 10, color: "#cbd5e1" }}>{dataset.size}</span>
      </div>
    </div>
  );
}
