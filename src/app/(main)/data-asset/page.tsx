"use client";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/Sidebar";
import { listDatasets, createDataset, uploadDataFile } from "@/lib/services";
import { Plus, Search, RefreshCw, Eye, Pencil, Trash2, Upload, Database, X, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

interface Dataset {
  id: string;
  name: string;
  type: string;
  format: string;
  item_count: number;
  quality_status: string;
  task_id?: string;
  task_name?: string;
  created_at: string;
}

const TYPE_OPTIONS = ["全部类型", "图像", "文本", "音频", "视频"];
const QUALITY_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "passed", label: "已通过" },
  { value: "failed", label: "未通过" },
  { value: "pending", label: "检测中" },
  { value: "unchecked", label: "未检测" },
];

const MOCK_DATASETS: Dataset[] = Array.from({ length: 15 }, (_, i) => ({
  id: `ds-${i + 1}`,
  name: ["多模态数据集", "图像分类集", "文本语料库", "语音识别集", "目标检测集"][i % 5] + `_v${Math.floor(i / 5) + 1}`,
  type: ["图像", "文本", "音频", "图像", "文本"][i % 5],
  format: ["json", "csv", "zip", "json", "csv"][i % 5],
  item_count: [1200, 3400, 800, 2100, 560][i % 5] + i * 100,
  quality_status: ["passed", "passed", "pending", "failed", "unchecked"][i % 5],
  task_name: ["车辆分类", "意图识别", "情感分析", "噪声检测", "违章检测"][i % 5],
  created_at: new Date(Date.now() - i * 86400000 * 3).toISOString(),
}));

function QualityBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    passed:   { bg: "#dcfce7", color: "#15803d", label: "已通过" },
    failed:   { bg: "#fee2e2", color: "#dc2626", label: "未通过" },
    pending:  { bg: "#fef9c3", color: "#ca8a04", label: "检测中" },
    unchecked:{ bg: "#f1f5f9", color: "#64748b", label: "未检测" },
  };
  const s = map[status] || map.unchecked;
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 4,
      fontSize: 12, fontWeight: 500,
      background: s.bg, color: s.color,
    }}>{s.label}</span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    "图像": "#dbeafe", "文本": "#f3e8ff", "音频": "#dcfce7", "视频": "#fef3c7",
  };
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 4,
      fontSize: 12, background: map[type] || "#f1f5f9", color: "#374151",
    }}>{type}</span>
  );
}

export default function DataAssetPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [typeFilter, setTypeFilter] = useState("全部类型");
  const [qualityFilter, setQualityFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailRow, setShowDetailRow] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({ name: "", type: "图像", format: "json" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchDatasets(); }, []);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const res = await listDatasets();
      const items = res.data?.items || [];
      setDatasets(items.length > 0 ? items : MOCK_DATASETS);
    } catch {
      setDatasets(MOCK_DATASETS);
    } finally {
      setLoading(false);
    }
  };

  const filtered = datasets.filter(d => {
    const nameMatch = !searchName || d.name.includes(searchName);
    const typeMatch = typeFilter === "全部类型" || d.type === typeFilter;
    const qualityMatch = !qualityFilter || d.quality_status === qualityFilter;
    return nameMatch && typeMatch && qualityMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = () => setPage(1);
  const handleReset = () => { setSearchName(""); setTypeFilter("全部类型"); setQualityFilter(""); setPage(1); };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      if (selectedFile) {
        const res = await createDataset({ name: uploadForm.name, type: uploadForm.type, format: uploadForm.format });
        await uploadDataFile(res.data.id, selectedFile);
        toast.success("数据集上传成功");
      } else {
        // 无文件时直接创建
        await createDataset({ name: uploadForm.name, type: uploadForm.type, format: uploadForm.format });
        toast.success("数据集创建成功");
      }
      setShowUploadModal(false);
      setUploadForm({ name: "", type: "图像", format: "json" });
      setSelectedFile(null);
      fetchDatasets();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "操作失败");
    } finally {
      setUploading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    height: 32, padding: "0 10px", border: "1px solid #e2e8f0",
    borderRadius: 5, fontSize: 13, color: "#374151", outline: "none",
    background: "#fff",
  };

  const btnPrimary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 5,
    height: 32, padding: "0 14px", borderRadius: 5,
    background: "#2563eb", color: "#fff", border: "none",
    fontSize: 13, fontWeight: 500, cursor: "pointer",
  };

  const btnDefault: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 5,
    height: 32, padding: "0 14px", borderRadius: 5,
    background: "#fff", color: "#374151",
    border: "1px solid #e2e8f0",
    fontSize: 13, cursor: "pointer",
  };

  const btnIcon: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 28, height: 28, borderRadius: 4, border: "none",
    cursor: "pointer", background: "transparent",
  };

  return (
    <>
      <TopBar title="数据管理" subtitle="数据源管理 · 数据集导入与质量追踪" />
      <main style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: "#f8fafc" }}>

        {/* 面包屑 */}
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16, display: "flex", gap: 4 }}>
          <span>系统首页</span><span>/</span>
          <span>数据管理</span><span>/</span>
          <span style={{ color: "#374151" }}>数据源</span>
        </div>

        {/* 搜索过滤栏 */}
        <div style={{
          background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 8, padding: "14px 16px", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        }}>
          <label style={{ fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>数据源名称</label>
          <input
            style={{ ...inputStyle, width: 160 }}
            placeholder="输入数据源名称"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          <label style={{ fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>数据源类型</label>
          <select
            style={{ ...inputStyle, width: 140 }}
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            {TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
          <select
            style={{ ...inputStyle, width: 120 }}
            value={qualityFilter}
            onChange={e => setQualityFilter(e.target.value)}
          >
            {QUALITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button style={btnPrimary} onClick={handleSearch}>
            <Search size={13} /> 查询
          </button>
          <button style={btnDefault} onClick={handleReset}>
            <RefreshCw size={13} /> 重置
          </button>
          <div style={{ flex: 1 }} />
          <button style={btnPrimary} onClick={() => setShowUploadModal(true)}>
            <Plus size={13} /> 新增
          </button>
          <button style={btnDefault}>
            <RefreshCw size={13} /> 刷新
          </button>
        </div>

        {/* 表格 */}
        <div style={{
          background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 8, overflow: "hidden",
        }}>
          {/* 表格标题栏 */}
          <div style={{
            padding: "12px 16px", borderBottom: "1px solid #e2e8f0",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{
              width: 4, height: 16, borderRadius: 2,
              background: "#2563eb", flexShrink: 0,
            }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
              数据源列表
            </span>
            <span style={{
              marginLeft: 4, fontSize: 12, color: "#94a3b8",
              background: "#f1f5f9", padding: "1px 7px", borderRadius: 10,
            }}>{filtered.length}</span>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
              <RefreshCw size={20} style={{ margin: "0 auto 8px", animation: "spin 1s linear infinite" }} />
              <div style={{ fontSize: 13 }}>加载中...</div>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["数据源名称", "数据源类型", "描述信息", "创建时间", "操作"].map((h, i) => (
                    <th key={h} style={{
                      textAlign: "left", padding: "10px 14px",
                      fontSize: 12, fontWeight: 600, color: "#64748b",
                      borderBottom: "1px solid #e2e8f0",
                      width: i === 4 ? 120 : undefined,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>
                      <Database size={36} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
                      <div>暂无数据，点击「新增」添加数据源</div>
                    </td>
                  </tr>
                ) : paged.map((ds, idx) => (
                  <>
                    <tr
                      key={ds.id}
                      style={{
                        background: showDetailRow === ds.id ? "#eff6ff" : idx % 2 === 1 ? "#fafafa" : "#fff",
                        cursor: "pointer",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={e => { if (showDetailRow !== ds.id) (e.currentTarget as HTMLElement).style.background = "#f0f9ff"; }}
                      onMouseLeave={e => { if (showDetailRow !== ds.id) (e.currentTarget as HTMLElement).style.background = idx % 2 === 1 ? "#fafafa" : "#fff"; }}
                    >
                      <td style={{ padding: "11px 14px", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ fontWeight: 500, color: "#1e293b" }}>{ds.name}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{ds.format.toUpperCase()}</div>
                      </td>
                      <td style={{ padding: "11px 14px", borderBottom: "1px solid #f1f5f9" }}>
                        <TypeBadge type={ds.type} />
                      </td>
                      <td style={{ padding: "11px 14px", borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <QualityBadge status={ds.quality_status} />
                          <span style={{ color: "#94a3b8" }}>{ds.item_count.toLocaleString()} 条</span>
                        </div>
                        {ds.task_name && (
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>关联任务：{ds.task_name}</div>
                        )}
                      </td>
                      <td style={{ padding: "11px 14px", borderBottom: "1px solid #f1f5f9", color: "#64748b", fontSize: 12 }}>
                        {new Date(ds.created_at).toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td style={{ padding: "11px 14px", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            style={{ ...btnIcon, color: "#2563eb" }}
                            title="查看"
                            onClick={() => setShowDetailRow(showDetailRow === ds.id ? null : ds.id)}
                          >
                            <Eye size={14} />
                          </button>
                          <button style={{ ...btnIcon, color: "#64748b" }} title="编辑">
                            <Pencil size={14} />
                          </button>
                          <button
                            style={{ ...btnIcon, color: "#ef4444" }}
                            title="删除"
                            onClick={() => {
                              if (confirm(`确认删除「${ds.name}」？`)) {
                                setDatasets(prev => prev.filter(d => d.id !== ds.id));
                                toast.success("已删除");
                              }
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* 行内展开详情 */}
                    {showDetailRow === ds.id && (
                      <tr key={`${ds.id}-detail`}>
                        <td colSpan={5} style={{ background: "#eff6ff", borderBottom: "1px solid #bfdbfe", padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                            {[
                              { label: "数据集 ID", value: ds.id },
                              { label: "数据类型", value: ds.type },
                              { label: "文件格式", value: ds.format.toUpperCase() },
                              { label: "数据量", value: `${ds.item_count.toLocaleString()} 条` },
                              { label: "质量状态", value: ds.quality_status === "passed" ? "已通过" : ds.quality_status === "failed" ? "未通过" : "未检测" },
                              { label: "关联任务", value: ds.task_name || "—" },
                            ].map(item => (
                              <div key={item.label} style={{ minWidth: 140 }}>
                                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>{item.label}</div>
                                <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{item.value}</div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}

          {/* 分页 */}
          {!loading && filtered.length > 0 && (
            <div style={{
              padding: "12px 16px", borderTop: "1px solid #f1f5f9",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              fontSize: 13, color: "#64748b",
            }}>
              <span>共 {filtered.length} 条记录</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  style={{ ...btnDefault, width: 32, padding: 0, justifyContent: "center" }}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    style={{
                      width: 32, height: 32, border: "none", borderRadius: 5,
                      background: p === page ? "#2563eb" : "transparent",
                      color: p === page ? "#fff" : "#64748b",
                      cursor: "pointer", fontSize: 13, fontWeight: p === page ? 600 : 400,
                    }}
                    onClick={() => setPage(p)}
                  >{p}</button>
                ))}
                <button
                  style={{ ...btnDefault, width: 32, padding: 0, justifyContent: "center" }}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 新增弹窗 */}
      {showUploadModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
        }}>
          <div style={{
            background: "#fff", borderRadius: 10, width: 480, padding: 24,
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", margin: 0 }}>新增数据源</h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 5 }}>数据源名称 <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  type="text" required
                  value={uploadForm.name}
                  onChange={e => setUploadForm({ ...uploadForm, name: e.target.value })}
                  style={{ ...inputStyle, width: "100%", height: 36, boxSizing: "border-box" }}
                  placeholder="例如：多模态日志数据集_v1"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 5 }}>数据类型</label>
                  <select
                    value={uploadForm.type}
                    onChange={e => setUploadForm({ ...uploadForm, type: e.target.value })}
                    style={{ ...inputStyle, width: "100%", height: 36 }}
                  >
                    <option>图像</option><option>文本</option><option>音频</option><option>视频</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 5 }}>文件格式</label>
                  <select
                    value={uploadForm.format}
                    onChange={e => setUploadForm({ ...uploadForm, format: e.target.value })}
                    style={{ ...inputStyle, width: "100%", height: 36 }}
                  >
                    <option value="json">JSON</option><option value="csv">CSV</option><option value="zip">ZIP</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 5 }}>上传文件（可选）</label>
                <label style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  height: 80, border: "1.5px dashed #cbd5e1", borderRadius: 6, cursor: "pointer",
                  background: "#f8fafc", color: "#94a3b8", fontSize: 13,
                  transition: "border-color 0.15s",
                }}>
                  <Upload size={18} style={{ marginBottom: 4 }} />
                  {selectedFile ? selectedFile.name : "点击选择文件或拖拽上传"}
                  <input type="file" style={{ display: "none" }} onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button type="button" onClick={() => setShowUploadModal(false)} style={btnDefault}>取消</button>
                <button type="submit" style={{ ...btnPrimary, opacity: uploading ? 0.7 : 1 }} disabled={uploading}>
                  {uploading ? "提交中..." : "确认新增"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
