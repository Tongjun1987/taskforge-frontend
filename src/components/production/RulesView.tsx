"use client";

import React, { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Layers,
  Link2,
  Search,
  ShieldCheck,
  Sparkles,
  Tag as TagIcon,
} from "lucide-react";
import { C, Panel, Grid, Btn, Tag, Metric, scrollArea } from "./ui";
import { RULE_STAGES, RULE_TEMPLATES } from "./mock";

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={on ? "停用规则" : "启用规则"}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        border: "none",
        padding: 0,
        cursor: "pointer",
        background: on ? C.primary : "#cbd5e1",
        position: "relative",
        flexShrink: 0,
        transition: "background .2s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: 8,
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,.2)",
          transition: "left .2s",
        }}
      />
    </button>
  );
}

const TYPE_TONE: Record<string, string> = {
  阈值: "#4f46e5",
  范围: "#0ea5e9",
  枚举: "#14b8a6",
  脚本: "#f59e0b",
  模板: "#0d9488",
  算子: "#8b5cf6",
};

export default function RulesView() {
  const [rules, setRules] = useState(RULE_TEMPLATES);
  const [active, setActive] = useState(RULE_STAGES[0].key);
  const [q, setQ] = useState("");
  const [onlyRef, setOnlyRef] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const stage = RULE_STAGES.find((s) => s.key === active) || RULE_STAGES[0];

  const list = useMemo(
    () =>
      rules.filter(
        (r) =>
          r.stage === active &&
          (!onlyRef || r.usedBy.length > 0) &&
          (!q ||
            r.name.includes(q) ||
            r.id.toLowerCase().includes(q.toLowerCase()) ||
            r.summary.includes(q))
      ),
    [rules, active, q, onlyRef]
  );

  const total = rules.length;
  const onCount = rules.filter((r) => r.on).length;
  const refCount = rules.filter((r) => r.usedBy.length > 0).length;

  const toggle = (id: string) =>
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, on: !r.on } : r)));

  return (
    <div style={{ ...scrollArea, display: "flex", flexDirection: "column", gap: 12 }}>
      <Grid cols={4} gap={12}>
        <Metric icon={<ShieldCheck size={15} />} label="规则模板" value={String(total)} unit="条" tone={C.primary} />
        <Metric icon={<Check size={15} />} label="已启用" value={String(onCount)} unit="条" tone={C.success} />
        <Metric icon={<Link2 size={15} />} label="已被产线引用" value={String(refCount)} unit="条" tone="#0ea5e9" />
        <Metric icon={<Layers size={15} />} label="规则类别" value={String(RULE_STAGES.length)} unit="类" tone="#8b5cf6" />
      </Grid>

      <Panel
        title="规则模板库"
        desc="按能力类别组织的预置规则，标注模板 / 数据处理 / 质检规则取自平台已有能力；节点引用后随产线版本生效"
        extra={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Tag tone={C.primary} soft={C.primarySoft}>
              <Sparkles size={11} /> 预置模板 · 可直接引用
            </Tag>
            <div style={{ position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: 9, top: 8, color: C.faint }} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="搜索规则名称 / 编号"
                style={{
                  width: 210,
                  padding: "6px 10px 6px 28px",
                  fontSize: 12,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  outline: "none",
                  color: C.text,
                }}
              />
            </div>
          </div>
        }
        bodyStyle={{ padding: 0 }}
      >
        <Grid cols="248px minmax(0,1fr)" gap={0} style={{ alignItems: "stretch" }}>
          {/* 左侧：产线环节 */}
          <div
            style={{
              borderRight: `1px solid ${C.borderSoft}`,
              padding: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {RULE_STAGES.map((g, i) => {
              const on = g.key === active;
              const count = rules.filter((r) => r.stage === g.key).length;
              const refs = rules.filter((r) => r.stage === g.key && r.usedBy.length > 0).length;
              return (
                <button
                  key={g.key}
                  onClick={() => setActive(g.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 11px",
                    borderRadius: 8,
                    border: `1px solid ${on ? C.primary + "44" : "transparent"}`,
                    background: on ? C.primarySoft : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: `${g.tone}18`,
                      color: g.tone,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: on ? 600 : 500,
                        color: on ? C.primary : C.text,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {g.name}
                    </div>
                    <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>
                      {count} 条 · 已引用 {refs}
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ color: on ? C.primary : C.faint, flexShrink: 0 }} />
                </button>
              );
            })}
            <div
              style={{
                marginTop: "auto",
                padding: "10px 8px 2px",
                borderTop: `1px solid ${C.borderSoft}`,
                fontSize: 11,
                color: C.faint,
                lineHeight: 1.7,
              }}
            >
              规则按能力类别组织，可跨工序引用；引用关系记录在产线版本里，改规则需发布新版本。
            </div>
          </div>

          {/* 右侧：规则明细 */}
          <div style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  background: `${stage.tone}18`,
                  color: stage.tone,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TagIcon size={14} />
              </span>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>{stage.name}</h3>
              <Tag tone={stage.tone} soft={`${stage.tone}14`}>
                {list.length} 条模板
              </Tag>
              <button
                onClick={() => setOnlyRef((v) => !v)}
                style={{
                  marginLeft: "auto",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 9px",
                  fontSize: 11,
                  borderRadius: 5,
                  border: `1px solid ${onlyRef ? C.primary : C.border}`,
                  background: onlyRef ? C.primarySoft : "#fff",
                  color: onlyRef ? C.primary : C.sub,
                  cursor: "pointer",
                }}
              >
                <Link2 size={11} /> {onlyRef ? "仅看已引用" : "全部规则"}
              </button>
            </div>
            <p style={{ margin: "0 0 6px", fontSize: 12, color: C.sub, lineHeight: 1.7 }}>{stage.desc}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, fontSize: 11, color: C.faint }}>
              来源
              <span
                style={{
                  padding: "1px 7px",
                  borderRadius: 4,
                  border: `1px solid ${C.borderSoft}`,
                  background: C.bg,
                  color: C.sub,
                }}
              >
                {stage.source}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {list.map((r) => {
                const open = openId === r.id;
                return (
                  <div
                    key={r.id}
                    style={{
                      border: `1px solid ${open ? C.primary + "44" : C.borderSoft}`,
                      borderRadius: 8,
                      background: r.on ? "#fff" : C.bg,
                      padding: "11px 14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: r.on ? C.text : C.faint }}>
                            {r.name}
                          </span>
                          <span style={{ fontSize: 11, color: C.faint, fontFamily: "ui-monospace, monospace" }}>
                            {r.id}
                          </span>
                          <Tag tone={TYPE_TONE[r.type]} soft={`${TYPE_TONE[r.type]}14`}>
                            {r.type}
                          </Tag>
                          <span style={{ fontSize: 11, color: C.faint }}>{r.version}</span>
                        </div>
                        <div style={{ fontSize: 12, color: C.sub, marginTop: 4, lineHeight: 1.6 }}>{r.summary}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: r.on ? C.success : C.faint, whiteSpace: "nowrap" }}>
                          {r.on ? "已启用" : "已停用"}
                        </span>
                        <Switch on={r.on} onClick={() => toggle(r.id)} />
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 9, flexWrap: "wrap" }}>
                      {r.params.map((p) => (
                        <span
                          key={p.k}
                          style={{
                            fontSize: 11,
                            padding: "2px 7px",
                            borderRadius: 4,
                            background: C.bg,
                            border: `1px solid ${C.borderSoft}`,
                            color: C.sub,
                          }}
                        >
                          <span style={{ color: C.faint }}>{p.k}</span> {p.v}
                        </span>
                      ))}
                      <span style={{ fontSize: 11, color: C.faint, marginLeft: 4 }}>适用：{r.applies}</span>
                      <button
                        onClick={() => setOpenId(open ? null : r.id)}
                        style={{
                          marginLeft: "auto",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 11,
                          color: r.usedBy.length ? C.primary : C.faint,
                          padding: 0,
                        }}
                      >
                        <Link2 size={11} /> 被 {r.usedBy.length} 处引用
                        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                      </button>
                    </div>

                    {open && (
                      <div
                        style={{
                          marginTop: 9,
                          padding: "8px 10px",
                          borderRadius: 6,
                          background: C.primarySoft,
                          fontSize: 11,
                          color: C.sub,
                          lineHeight: 1.9,
                        }}
                      >
                        {r.usedBy.length === 0 ? (
                          <span style={{ color: C.faint }}>尚未被任何产线引用</span>
                        ) : (
                          r.usedBy.map((u) => (
                            <div key={u} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ width: 4, height: 4, borderRadius: 2, background: C.primary }} />
                              {u}
                            </div>
                          ))
                        )}
                        <div style={{ marginTop: 4, color: C.faint }}>
                          维护人：{r.owner} · 模板版本 {r.version}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {list.length === 0 && (
                <div style={{ padding: "28px 0", textAlign: "center", fontSize: 12, color: C.faint }}>
                  当前环节没有符合条件的规则模板
                </div>
              )}
            </div>
          </div>
        </Grid>
      </Panel>
    </div>
  );
}
