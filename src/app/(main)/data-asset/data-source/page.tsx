"use client";
import { useState } from "react";
import { Plus, Search, Database, Cloud, HardDrive, Box, Link2, Pencil, Trash2, Eye, X } from "lucide-react";

interface DataSource {
  id: string;
  name: string;
  type: string;
  endpoint: string;
  bucket: string;
  status: string;
  item_count: number;
  created_at: string;
  description: string;
}

const SOURCE_TYPES = [
  { value: "aliyun_oss", label: "阿里OSS", icon: Cloud, color: "#ff6a00" },
  { value: "tencent_cos", label: "腾讯COS", icon: Cloud, color: "#00a1f1" },
  { value: "huawei_obs", label: "华为OBS", icon: Cloud, color: "#ed502e" },
  { value: "baidu_bos", label: "百度BOS", icon: Cloud, color: "#2932e1" },
  { value: "minio", label: "MinIO", icon: HardDrive, color: "#c73e1d" },
];

const MOCK_DATA: DataSource[] = [
  { id: "ds-1", name: "生产环境OSS", type: "aliyun_oss", endpoint: "oss-cn-shanghai.aliyuncs.com", bucket: "taskforge-prod", status: "active", item_count: 125800, created_at: "2026-03-15", description: "生产环境数据存储" },
  { id: "ds-2", name: "测试环境COS", type: "tencent_cos", endpoint: "cos.ap-shanghai.myqcloud.com", bucket: "taskforge-test", status: "active", item_count: 34800, created_at: "2026-03-18", description: "测试环境数据存储" },
  { id: "ds-3", name: "备份OBS", type: "huawei_obs", endpoint: "obs.cn-east-3.myhuaweicloud.com", bucket: "taskforge-backup", status: "active", item_count: 256000, created_at: "2026-02-20", description: "数据备份存储" },
  { id: "ds-4", name: "开发BOS", type: "baidu_bos", endpoint: "sdbc.bcebos.com", bucket: "taskforge-dev", status: "inactive", item_count: 12000, created_at: "2026-04-01", description: "开发测试数据" },
  { id: "ds-5", name: "本地MinIO", type: "minio", endpoint: "minio.shebc.local:9000", bucket: "taskforge-local", status: "active", item_count: 8900, created_at: "2026-04-05", description: "本地开发环境" },
];

function TypeBadge({ type }: { type: string }) {
  const t = SOURCE_TYPES.find(s => s.value === type) || SOURCE_TYPES[0];
  const Icon = t.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 4,
      background: `${t.color}15`, color: t.color,
      fontSize: 11, fontWeight: 600,
    }}>
      <Icon size={12} />
      {t.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    active: { bg: "#dcfce7", color: "#15803d", label: "正常" },
    inactive: { bg: "#f1f5f9", color: "#64748b", label: "停用" },
  };
  const s = map[status] || map.inactive;
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

export default function DataSourcePage() {
  const [data, setData] = useState<DataSource[]>(MOCK_DATA);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DataSource | null>(null);
  const [form, setForm] = useState({ name: "", type: "aliyun_oss", endpoint: "", bucket: "", description: "" });

  const filtered = data.filter(d => {
    const matchSearch = d.name.includes(search) || d.endpoint.includes(search);
    const matchType = !typeFilter || d.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleAdd = () => {
    setEditing(null);
    setForm({ name: "", type: "aliyun_oss", endpoint: "", bucket: "", description: "" });
    setShowModal(true);
  };

  const handleEdit = (d: DataSource) => {
    setEditing(d);
    setForm({ name: d.name, type: d.type, endpoint: d.endpoint, bucket: d.bucket, description: d.description });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.endpoint || !form.bucket) return;
    if (editing) {
      setData(data.map(d => d.id === editing.id ? { ...d, ...form } : d));
    } else {
      setData([{ id: `ds-${Date.now()}`, ...form, status: "active", item_count: 0, created_at: new Date().toISOString().split("T")[0] }, ...data]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("确认删除该数据源？")) setData(data.filter(d => d.id !== id));
  };

  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* 顶部标题 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Database size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>数据源管理</h1>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0 0" }}>管理外部存储数据源</p>
          </div>
        </div>
        <button onClick={handleAdd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 8, background: "#6366f1", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Plus size={16} />
          新增数据源
        </button>
      </div>

      {/* 筛选工具栏 */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索名称或地址..." style={{ width: "100%", padding: "8px 10px 8px 32px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }} />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }}>
          <option value="">全部类型</option>
          {SOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* 数据表格 */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>数据源名称</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>存储类型</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>Endpoint</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>Bucket</th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#64748b" }}>数据量</th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#64748b" }}>状态</th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#64748b" }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr key={d.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none", transition: "background 0.15s" }} onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{d.description}</div>
                </td>
                <td style={{ padding: "14px 16px" }}><TypeBadge type={d.type} /></td>
                <td style={{ padding: "14px 16px", fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>{d.endpoint}</td>
                <td style={{ padding: "14px 16px", fontSize: 12, color: "#64748b" }}>{d.bucket}</td>
                <td style={{ padding: "14px 16px", textAlign: "center", fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{d.item_count.toLocaleString()}</td>
                <td style={{ padding: "14px 16px", textAlign: "center" }}><StatusBadge status={d.status} /></td>
                <td style={{ padding: "14px 16px", textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                    <button title="查看" style={{ padding: 6, border: "none", background: "#f1f5f9", borderRadius: 6, cursor: "pointer" }}><Eye size={14} color="#64748b" /></button>
                    <button onClick={() => handleEdit(d)} title="编辑" style={{ padding: 6, border: "none", background: "#eff6ff", borderRadius: 6, cursor: "pointer" }}><Pencil size={14} color="#2563eb" /></button>
                    <button onClick={() => handleDelete(d.id)} title="删除" style={{ padding: 6, border: "none", background: "#fef2f2", borderRadius: 6, cursor: "pointer" }}><Trash2 size={14} color="#dc2626" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
            <Database size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
            <p>暂无数据源</p>
          </div>
        )}
      </div>

      {/* 新增/编辑弹窗 */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: 480, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>{editing ? "编辑数据源" : "新增数据源"}</h3>
              <button onClick={() => setShowModal(false)} style={{ padding: 4, border: "none", background: "transparent", cursor: "pointer" }}><X size={18} color="#94a3b8" /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>数据源名称 *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="输入数据源名称" style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>存储类型 *</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }}>
                  {SOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Endpoint *</label>
                <input value={form.endpoint} onChange={e => setForm({ ...form, endpoint: e.target.value })} placeholder="如: oss-cn-shanghai.aliyuncs.com" style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Bucket *</label>
                <input value={form.bucket} onChange={e => setForm({ ...form, bucket: e.target.value })} placeholder="输入Bucket名称" style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>描述</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="数据源描述" rows={2} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, resize: "vertical" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "10px 16px", borderRadius: 6, background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", fontSize: 13, cursor: "pointer" }}>取消</button>
              <button onClick={handleSave} style={{ padding: "10px 16px", borderRadius: 6, background: "#6366f1", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>保存</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
