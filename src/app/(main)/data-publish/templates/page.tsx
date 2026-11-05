"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package, Search, RotateCcw, ChevronLeft, Layers, FileJson,
  FileCheck2, Eye, ArrowRight, CheckCircle2,
} from "lucide-react";

import { C, Panel, Metric, Table, Tag, Btn, IconBtn } from "@/components/production/ui";
import {
  PACK_TEMPLATES, INDUSTRIES, DATA_TYPES, tplFieldCount, type PackTemplate,
} from "@/components/publish/publishData";
import PackDatasetModal from "@/components/publish/PackDatasetModal";

function Sel({
  label, value, onChange, options, w = 128,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  w?: number;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.sub }}>
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: w, padding: "6px 8px", fontSize: 12, color: C.text,
          background: "#fff", border: `1px solid ${C.border}`, borderRadius: 6, outline: "none",
        }}
      >
        <option value="">全部</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const [industry, setIndustry] = useState("");
  const [dataType, setDataType] = useState("");
  const [kw, setKw] = useState("");
  const [refreshed, setRefreshed] = useState(false);
  // 用此模板封装：弹窗态 + 提交后本地累加使用次数 + 提示
  const [packTpl, setPackTpl] = useState<PackTemplate | null>(null);
  const [usedDelta, setUsedDelta] = useState<Record<string, number>>({});
  const [toast, setToast] = useState("");

  const rows = useMemo(
    () =>
      PACK_TEMPLATES.filter(
        (t) =>
          (!industry || t.industry === industry) &&
          (!dataType || t.dataType === dataType) &&
          (!kw || t.name.includes(kw) || t.scene.includes(kw))
      ),
    [industry, dataType, kw]
  );

  const totalUsed = PACK_TEMPLATES.reduce((s, t) => s + t.used + (usedDelta[t.id] || 0), 0);
  const avgFields = Math.round(
    PACK_TEMPLATES.reduce((s, t) => s + tplFieldCount(t), 0) / PACK_TEMPLATES.length
  );

  const submitPack = (name: string) => {
    if (!packTpl) return;
    const id = packTpl.id;
    setUsedDelta((d) => ({ ...d, [id]: (d[id] || 0) + 1 }));
    setPackTpl(null);
    setToast(`已按 ${id} 重新封装「${name}」，元数据已按模板规范校验并进入发布审核`);
    window.setTimeout(() => setToast(""), 3600);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg }}>
      <header
        style={{
          height: 56, background: "#fff", borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", padding: "0 20px", gap: 12, flexShrink: 0,
        }}
      >
        <Link
          href="/data-publish"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`,
            color: C.sub, flexShrink: 0,
          }}
          aria-label="返回数据集管理"
        >
          <ChevronLeft size={16} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #10b981, #0ea5e9)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Package size={17} style={{ color: "#fff" }} />
          </span>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", margin: 0, lineHeight: 1.25 }}>封装模板</h1>
            <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
              数据发布中心 · 数据集封装 · 按行业 / 场景 / 类型预置标准化封装规范
            </p>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <span
          style={{
            display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
            fontSize: 11.5, color: C.sub, background: C.bg,
            border: `1px solid ${C.border}`, borderRadius: 6, flexShrink: 0,
          }}
          title="模板随发布中心版本预置下发，不支持自行新增或删除"
        >
          <Layers size={12} /> 平台预置模板
        </span>
        <button
          onClick={() => {
            setRefreshed(true);
            window.setTimeout(() => setRefreshed(false), 1500);
          }}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
            fontSize: 13, color: "#1e293b", background: "#fff",
            border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", flexShrink: 0,
          }}
        >
          <RotateCcw size={14} />
          {refreshed ? "已刷新" : "刷新"}
        </button>
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <Metric icon={<Package size={15} />} label="预置模板" value={PACK_TEMPLATES.length} unit="套" hint="随发布中心版本预置下发，可直接引用" />
          <Metric icon={<Layers size={15} />} label="覆盖行业" value={new Set(PACK_TEMPLATES.map((t) => t.industry)).size} unit="个" tone={C.purple} hint="按行业 / 场景 / 类型三维预置" />
          <Metric icon={<FileCheck2 size={15} />} label="累计使用" value={totalUsed} unit="次" tone={C.info} hint="基于预置模板完成的数据集封装" />
          <Metric icon={<FileJson size={15} />} label="元数据字段均值" value={avgFields} unit="个" tone={C.teal} hint="通用 21 项 + 模板按数据类型扩展" />
        </div>

        <div
          style={{
            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
            padding: "10px 14px", background: "#fff",
            border: `1px solid ${C.border}`, borderRadius: 8, marginTop: 12,
          }}
        >
          <Sel label="行业" value={industry} onChange={setIndustry} options={INDUSTRIES} w={112} />
          <Sel label="数据类型" value={dataType} onChange={setDataType} options={DATA_TYPES} w={100} />
          <label
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "5px 10px",
              border: `1px solid ${C.border}`, borderRadius: 6, background: "#fff",
            }}
          >
            <Search size={13} style={{ color: C.faint }} />
            <input
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              placeholder="模板名称 / 场景"
              style={{ border: "none", outline: "none", fontSize: 12, width: 150, color: C.text }}
            />
          </label>
          <div style={{ flex: 1 }} />
          <Btn size="sm" icon={<RotateCcw size={13} />} onClick={() => { setIndustry(""); setDataType(""); setKw(""); }}>重置</Btn>
        </div>

        <Panel
          title="预置模板清单"
          desc={`共 ${rows.length} 套 · 点击行进入模板详情；模板定义目录结构、元数据字段、质量报告格式与说明文档`}
          style={{ marginTop: 12 }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            head={["模板名称", "行业 / 场景", "类型", "封装内容", "元数据字段", "使用", "更新", "操作"]}
            widths={["27%", "15%", "8%", "22%", "9%", "7%", "9%", "7%"]}
            onRowClick={(i) => router.push(`/data-publish/templates/${rows[i].id}`)}
            rowKey={(i) => rows[i].id}
            rows={rows.map((t) => [
              <div key="n">
                <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                  <span
                    style={{
                      fontWeight: 500, color: C.text, overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}
                  >
                    {t.name}
                  </span>
                  <span
                    style={{
                      fontSize: 10, color: C.success, background: `${C.success}14`,
                      border: `1px solid ${C.success}33`, borderRadius: 3,
                      padding: "0 4px", flexShrink: 0, lineHeight: "15px",
                    }}
                  >
                    预置
                  </span>
                </div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{t.id} · {t.owner}</div>
              </div>,
              <div key="i">
                <div style={{ fontSize: 12 }}>{t.industry}</div>
                <div style={{ fontSize: 11, color: C.faint }}>{t.scene}</div>
              </div>,
              <Tag key="t" tone={C.info}>{t.dataType}</Tag>,
              <div key="p" style={{ display: "flex", gap: 4, flexWrap: "nowrap", overflow: "hidden" }}>
                {t.parts.slice(0, 2).map((p) => (
                  <Tag key={p} tone={C.sub}>{p}</Tag>
                ))}
                {t.parts.length > 2 && <Tag tone={C.faint}>+{t.parts.length - 2}</Tag>}
              </div>,
              <div key="f">
                <div style={{ fontSize: 12, fontWeight: 500 }}>{tplFieldCount(t)} 项</div>
                <div style={{ fontSize: 10.5, color: C.faint }}>通用 21 + 扩展 {tplFieldCount(t) - 21}</div>
              </div>,
              <span key="u" style={{ fontSize: 12 }}>{t.used + (usedDelta[t.id] || 0)} 次</span>,
              <span key="d" style={{ fontSize: 12, color: C.sub, whiteSpace: "nowrap" }}>{t.updatedAt}</span>,
              <div key="a" style={{ display: "flex", gap: 6 }}>
                <Link href={`/data-publish/templates/${t.id}`} onClick={(e) => e.stopPropagation()}>
                  <IconBtn icon={<Eye size={13} />} label="查看模板详情" size="sm" />
                </Link>
                <IconBtn
                  icon={<ArrowRight size={13} />}
                  label="用此模板封装数据集"
                  size="sm"
                  tone="primary"
                  onClick={() => setPackTpl(t)}
                />
              </div>,
            ])}
          />
        </Panel>
      </div>

      {packTpl && (
        <PackDatasetModal tpl={packTpl} onClose={() => setPackTpl(null)} onSubmit={submitPack} />
      )}

      {toast && (
        <div
          style={{
            position: "fixed", left: "50%", bottom: 34, transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 7, padding: "9px 16px",
            fontSize: 12.5, color: C.success, background: "#fff",
            border: `1px solid ${C.success}55`, borderRadius: 8,
            boxShadow: "0 10px 30px rgba(15,23,42,.14)", zIndex: 1300,
          }}
        >
          <CheckCircle2 size={14} /> {toast}
        </div>
      )}
    </div>
  );
}
