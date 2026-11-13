"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Download, Heart, ChevronRight,
  Database, Image, Mic, Code, Layers, FileText,
  Table, BarChart3, GitBranch, Grid3X3, List, MessageSquare,
} from "lucide-react";
import { DATASETS, type Dataset } from "@/components/service/datasetCatalog";

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
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"downloads" | "likes" | "samples">("downloads");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const open = (id: string) => router.push(`/service/datasets/${id}`);

  const filteredDatasets = DATASETS
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
              发现和使用高质量数据集 · 共 {DATASETS.length} 个数据集
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
        <span style={{ fontSize: 11.5, color: "#cbd5e1" }}>点击卡片查看发布信息与数据使用方式</span>
      </div>

      {/* 数据集卡片网格 */}
      {viewMode === "grid" ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 16,
        }}>
          {filteredDatasets.map(ds => (
            <DatasetCard key={ds.id} dataset={ds} onOpen={() => open(ds.id)} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredDatasets.map(ds => (
            <DatasetListItem key={ds.id} dataset={ds} onOpen={() => open(ds.id)} />
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
function DatasetCard({ dataset, onOpen }: { dataset: Dataset; onOpen: () => void }) {
  const catColor = getCatColor(dataset.category);
  const [liked, setLiked] = useState(false);

  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      border: "1px solid #e2e8f0", padding: 18,
      transition: "all 0.2s", cursor: "pointer",
      position: "relative",
    }}
    onClick={onOpen}
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
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginLeft: 3 }}>{dataset.version}</span>
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
          <ChevronRight size={13} style={{ color: "#cbd5e1" }} />
        </div>
      </div>
    </div>
  );
}

// ── 列表项组件 ──
function DatasetListItem({ dataset, onOpen }: { dataset: Dataset; onOpen: () => void }) {
  const catColor = getCatColor(dataset.category);
  const [liked, setLiked] = useState(false);

  return (
    <div style={{
      background: "#fff", borderRadius: 10,
      border: "1px solid #e2e8f0", padding: "14px 18px",
      display: "flex", alignItems: "center", gap: 16,
      transition: "all 0.15s", cursor: "pointer",
    }}
    onClick={onOpen}
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
          <span style={{ fontSize: 11, color: "#94a3b8" }}>{dataset.version}</span>
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
      <ChevronRight size={14} style={{ color: "#cbd5e1", flexShrink: 0 }} />
    </div>
  );
}
