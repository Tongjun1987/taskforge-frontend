"use client";

import React, { Suspense, useMemo, useState } from "react";
import {
  Library, RotateCcw, Search, Plus, Eye, Download, Upload,
  CheckCircle2, Layers3, Database, RefreshCw,
} from "lucide-react";

import { C, Panel, Metric, Table, Tag, Btn, IconBtn, Bar, scrollArea } from "@/components/production/ui";
import {
  CORPUS_LIST, CORPUS_DOMAINS, CORPUS_ANNO_TYPES, CORPUS_FORMATS, corpusDist,
  type CorpusItem,
} from "@/components/publish/publishData";

const STATUS_TONE: Record<string, string> = {
  已入库: "#16a34a",
  同步中: "#f59e0b",
  已归档: "#94a3b8",
};

function Sel({
  label, value, onChange, options, w = 140,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; w?: number;
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

function CorpusBody() {
  const [task, setTask] = useState("");
  const [domain, setDomain] = useState("");
  const [annoType, setAnnoType] = useState("");
  const [format, setFormat] = useState("");
  const [kw, setKw] = useState("");
  const [active, setActive] = useState<CorpusItem | null>(CORPUS_LIST[0]);

  const tasks = Array.from(new Set(CORPUS_LIST.map((c) => c.task)));

  const rows = useMemo(
    () =>
      CORPUS_LIST.filter(
        (c) =>
          (!task || c.task === task) &&
          (!domain || c.domain === domain) &&
          (!annoType || c.annoType === annoType) &&
          (!format || c.format === format) &&
          (!kw || c.name.includes(kw))
      ),
    [task, domain, annoType, format, kw]
  );

  const totalEntries = CORPUS_LIST.reduce((s, c) => s + c.entries, 0);
  const domains = new Set(CORPUS_LIST.map((c) => c.domain)).size;
  const dist = active ? corpusDist(active) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f8fafc" }}>
      <header
        style={{
          height: 56, background: "#fff", borderBottom: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", padding: "0 20px", gap: 16, flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            }}
          >
            <Library size={17} />
          </span>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", margin: 0, lineHeight: 1.25 }}>语料库管理</h1>
            <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
              数据生产中心 · 数据标注 · 统一沉淀标注产出的数据集资源
            </p>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <Btn size="sm" icon={<Upload size={13} />}>导入语料</Btn>
        <Btn size="sm" tone="primary" icon={<Plus size={13} />}>新建语料库</Btn>
      </header>

      <div style={{ ...scrollArea, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <Metric icon={<Library size={15} />} label="语料库总数" value={CORPUS_LIST.length} unit="个" hint="按任务 / 领域 / 标注类型组织" />
          <Metric icon={<Database size={15} />} label="入库语料条目" value={totalEntries.toLocaleString()} unit="条" tone={C.purple} hint="近 7 日新增 1.2 万条" />
          <Metric icon={<Layers3 size={15} />} label="覆盖业务领域" value={domains} unit="个" tone={C.info} hint="支持按领域快速圈选语料" />
          <Metric icon={<CheckCircle2 size={15} />} label="人工复核通过率" value={84} unit="%" tone={C.success} hint="未通过项已回退标注任务" />
        </div>

        <div
          style={{
            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
            padding: "10px 14px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8,
          }}
        >
          <Sel label="所属任务" value={task} onChange={setTask} options={tasks} w={190} />
          <Sel label="领域" value={domain} onChange={setDomain} options={CORPUS_DOMAINS} w={110} />
          <Sel label="标注类型" value={annoType} onChange={setAnnoType} options={CORPUS_ANNO_TYPES} w={110} />
          <Sel label="数据格式" value={format} onChange={setFormat} options={CORPUS_FORMATS} w={96} />
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
              placeholder="语料库名称"
              style={{ border: "none", outline: "none", fontSize: 12, width: 150, color: C.text }}
            />
          </label>
          <div style={{ flex: 1 }} />
          <Btn size="sm" icon={<RotateCcw size={13} />} onClick={() => { setTask(""); setDomain(""); setAnnoType(""); setFormat(""); setKw(""); }}>
            重置
          </Btn>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Panel
            title="语料库清单"
            desc="构建统一标注语料库，对标注产出的数据集资源统一管理与沉淀"
            style={{ flex: 1, minWidth: 0 }}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              head={["语料库", "所属任务", "领域 / 标注类型", "格式", "条目数", "规模", "更新", "状态", "操作"]}
              widths={["20%", "20%", "14%", "8%", "8%", "8%", "10%", "8%", "10%"]}
              onRowClick={(i) => setActive(rows[i])}
              rows={rows.map((c) => [
                <div key="n">
                  <div style={{ fontWeight: 500, color: C.text }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{c.id} · {c.owner}</div>
                </div>,
                <span key="t" style={{ fontSize: 12, color: C.sub }}>{c.task}</span>,
                <div key="d">
                  <div style={{ fontSize: 12 }}>{c.domain}</div>
                  <div style={{ fontSize: 11, color: C.faint }}>{c.annoType}</div>
                </div>,
                <Tag key="f" tone={C.info}>{c.format}</Tag>,
                <span key="e" style={{ fontSize: 12 }}>{c.entries.toLocaleString()}</span>,
                <span key="s" style={{ fontSize: 12, color: C.sub }}>{c.size}</span>,
                <span key="u" style={{ fontSize: 12, color: C.sub }}>{c.updatedAt}</span>,
                <Tag key="st" tone={STATUS_TONE[c.status]}>{c.status}</Tag>,
                <div key="a" style={{ display: "flex", gap: 6 }}>
                  <IconBtn icon={<Eye size={13} />} label="详情" />
                  <IconBtn icon={<Download size={13} />} label="导出" tone="primary" />
                </div>,
              ])}
            />
          </Panel>

          <Panel
            title="语料库概览"
            desc={active ? active.name : "选择左侧语料库"}
            style={{ width: 310, flexShrink: 0 }}
          >
            {active && dist && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    ["条目数", active.entries.toLocaleString()],
                    ["数据规模", active.size],
                    ["平均长度", active.avgLen],
                    ["数据格式", active.format],
                  ].map(([k, v]) => (
                    <div key={k} style={{ padding: "8px 10px", background: C.bg, borderRadius: 6 }}>
                      <div style={{ fontSize: 11, color: C.faint }}>{k}</div>
                      <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginTop: 3 }}>{v}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>领域构成</div>
                  {dist.domain.map((d) => (
                    <div key={d.label} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
                        <span style={{ color: C.sub }}>{d.label}</span>
                        <span style={{ color: C.text }}>{d.value.toLocaleString()} 条</span>
                      </div>
                      <Bar pct={(d.value / active.entries) * 100} tone={d.color} />
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>质量复核分布</div>
                  {dist.quality.map((d) => (
                    <div key={d.label} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
                        <span style={{ color: C.sub }}>{d.label}</span>
                        <span style={{ color: C.text }}>{d.value.toLocaleString()} 条</span>
                      </div>
                      <Bar pct={(d.value / active.entries) * 100} tone={d.color} />
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: `1px solid ${C.borderSoft}`, paddingTop: 10, fontSize: 11.5, color: C.sub, lineHeight: 1.7 }}>
                  语料库按任务、领域、标注类型、数据格式四维编目，可直接作为数据集生产的输入，也可按条件圈选后发布为数据集。
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <Btn size="sm" tone="primary" icon={<RefreshCw size={13} />}>同步语料</Btn>
                  <Btn size="sm" icon={<Download size={13} />}>导出清单</Btn>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

export default function CorpusPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: "#64748b" }}>加载中...</div>}>
      <CorpusBody />
    </Suspense>
  );
}
