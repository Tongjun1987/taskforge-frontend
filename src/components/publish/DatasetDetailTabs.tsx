"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package, FileJson, FileCheck2, FolderTree, GitBranch, Lock, GitCommitVertical,
  ArrowRight, Link2, History, Undo2, Ban, Eye, Download, Shield, Search,
  ChevronRight, FileText, Database, Layers, Clock, User, Tag as TagIcon,
  CheckCircle2, AlertTriangle, RotateCcw, Check, X,
} from "lucide-react";

import {
  C, Panel, Metric, Table, Tag, Btn, IconBtn, Bar, BarList, Kv, scrollArea,
} from "@/components/production/ui";
import {
  type Dataset, type PermLog, type RolePerm, type PermCode, type Level, LEVEL_TONE, STEP_TONE,
  PACK_TEMPLATES, PERMISSION_ROLES, PERM_CODES, PERM_WEIGHT, permLabel,
  COMMON_META_FIELDS, tplFieldCount,
  qualityDimStats, qualityIssueDist, qualityHistory, dirTree, fileList,
} from "./publishData";

const scoreTone = (s: number) =>
  s >= 93 ? C.success : s >= 88 ? C.info : s >= 84 ? C.warn : C.danger;

const STATUS_TONE: Record<string, string> = {
  已发布: C.success,
  审核中: C.warn,
  已下线: C.faint,
};

const VER_TONE: Record<string, string> = {
  生效中: C.success,
  历史版本: C.sub,
  已下线: C.faint,
};

const PERM_TONE: Record<string, string> = {
  授权: "#7c3aed",
  使用: "#0ea5e9",
  下载: "#16a34a",
  查看: "#64748b",
  无权限: "#cbd5e1",
};

// ================================================================
// Tab 1 · 概览
// ================================================================
export function DatasetOverview({ ds }: { ds: Dataset }) {
  const tree = dirTree(ds);
  const files = fileList(ds);
  const tpl = PACK_TEMPLATES.find((t) => t.id === ds.templateId);
  const [jsonOpen, setJsonOpen] = useState(true);

  return (
    <div style={scrollArea}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {/* 左：描述 + 基本信息 */}
        <div style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          <Panel title="数据描述" desc={`${ds.domain} · ${ds.scene}`}>
            <p style={{ margin: 0, fontSize: 12.5, color: C.sub, lineHeight: 1.85 }}>{ds.summary}</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
              {ds.tags.map((t) => (
                <Tag key={t} tone={C.purple} soft={C.purpleSoft}>{t}</Tag>
              ))}
            </div>
          </Panel>

          <Panel title="基本信息">
            <Kv k="数据集编号" v={<span style={{ fontFamily: "monospace", fontSize: 11.5 }}>{ds.id}</span>} w={78} />
            <Kv k="业务领域" v={ds.domain} w={78} />
            <Kv k="数据类型" v={ds.dataType} w={78} />
            <Kv k="应用场景" v={ds.scene} w={78} />
            <Kv k="数据规模" v={`${ds.scale} / ${ds.fileCount}`} w={78} />
            <Kv k="当前版本" v={<span style={{ fontWeight: 600 }}>{ds.version}</span>} w={78} />
            <Kv k="数据等级" v={<Tag tone={LEVEL_TONE[ds.level]}>{ds.level}</Tag>} w={78} />
            <Kv k="使用许可" v={ds.license} w={78} />
            <Kv k="建设部门" v={ds.owner} w={78} />
            <Kv k="发布时间" v={ds.status === "审核中" ? "待审核" : ds.publishedAt} w={78} />
            <Kv
              k="发布状态"
              v={<Tag tone={STATUS_TONE[ds.status]}>{ds.status}</Tag>}
              w={78}
            />
            <Kv k="累计下载" v={`${ds.downloads.toLocaleString()} 次`} w={78} />
          </Panel>

          <Panel title="封装模板" desc="引用的标准化封装规范">
            {tpl ? (
              <>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span
                    style={{
                      width: 28, height: 28, borderRadius: 7, background: C.primarySoft,
                      color: C.primary, display: "flex", alignItems: "center",
                      justifyContent: "center", flexShrink: 0,
                    }}
                  >
                    <Package size={14} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: C.text, lineHeight: 1.4 }}>{tpl.name}</div>
                    <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>
                      {tpl.id} · 元数据 {tplFieldCount(tpl)} 项（通用 {COMMON_META_FIELDS.length} + 扩展 {tplFieldCount(tpl) - COMMON_META_FIELDS.length}）
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 10 }}>
                  {tpl.parts.map((p) => (
                    <Tag key={p} tone={C.sub}>{p}</Tag>
                  ))}
                </div>
                <Link
                  href={`/data-publish/templates/${tpl.id}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: 11.5, color: C.primary, marginTop: 10,
                  }}
                >
                  查看模板元数据规范 <ArrowRight size={12} />
                </Link>
              </>
            ) : (
              <span style={{ fontSize: 12, color: C.faint }}>未引用模板</span>
            )}
          </Panel>
        </div>

        {/* 右：元信息 + 目录结构 + 文件清单 */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          <Panel
            title="元信息封装"
            desc={`遵循 ${ds.meta.standard} · ${ds.meta.items} 个元数据项`}
            extra={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Tag tone={ds.meta.status === "已封装" ? C.success : C.warn}>{ds.meta.status}</Tag>
                {ds.meta.exports.map((e) => (
                  <Tag key={e} tone={C.info}>{e}</Tag>
                ))}
              </div>
            }
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: C.sub }}>元信息完整度</span>
                  <span style={{ fontWeight: 600, color: scoreTone(ds.meta.completeness) }}>{ds.meta.completeness}%</span>
                </div>
                <Bar pct={ds.meta.completeness} tone={scoreTone(ds.meta.completeness)} h={7} />
              </div>
              <span style={{ fontSize: 11.5, color: C.faint, flexShrink: 0 }}>更新于 {ds.meta.updatedAt}</span>
            </div>

            <div
              style={{
                border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden",
              }}
            >
              <button
                onClick={() => setJsonOpen((v) => !v)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 12px", background: C.bg, border: "none",
                  borderBottom: jsonOpen ? `1px solid ${C.border}` : "none",
                  cursor: "pointer", fontSize: 12, color: C.text, textAlign: "left",
                }}
              >
                <ChevronRight
                  size={13}
                  style={{ transform: jsonOpen ? "rotate(90deg)" : "none", transition: "transform .15s", color: C.faint }}
                />
                <FileJson size={13} style={{ color: C.info }} />
                JSON-LD 元信息片段
              </button>
              {jsonOpen && (
                <div style={{ padding: "10px 12px", background: "#0f172a", overflowX: "auto" }}>
                  <pre
                    style={{
                      margin: 0, fontSize: 11, lineHeight: 1.75, color: "#cbd5e1",
                      fontFamily: "Consolas, Monaco, monospace",
                    }}
                  >
{`{
${Object.entries(ds.meta.sample)
  .map(([k, v]) => `  "${k}": "${v}"`)
  .join(",\n")}
}`}
                  </pre>
                </div>
              )}
            </div>
          </Panel>

          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Panel
              title="封装目录结构"
              desc="按模板规范生成的出厂目录"
              style={{ flex: 1, minWidth: 0 }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {tree.map((node) => (
                  <div key={node.name}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 0", fontSize: 12 }}>
                      {node.children ? <FolderTree size={13} style={{ color: C.warn }} /> : <FileText size={13} style={{ color: C.info }} />}
                      <span style={{ fontFamily: "monospace", color: C.text, fontWeight: 500 }}>{node.name}</span>
                      <span style={{ fontSize: 11, color: C.faint }}>{node.note}</span>
                    </div>
                    {node.children?.map((ch) => (
                      <div
                        key={ch.name}
                        style={{ display: "flex", alignItems: "center", gap: 7, padding: "3px 0 3px 22px", fontSize: 11.5 }}
                      >
                        <FileText size={12} style={{ color: C.faint }} />
                        <span style={{ fontFamily: "monospace", color: C.sub }}>{ch.name}</span>
                        <span style={{ fontSize: 10.5, color: C.faint }}>{ch.note}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="文件清单" desc="随包文件与体量" style={{ width: 340, flexShrink: 0 }} bodyStyle={{ padding: 0 }}>
              <Table
                head={["文件 / 目录", "类型", "体量"]}
                widths={["54%", "18%", "28%"]}
                rows={files.map((f) => [
                  <span
                    key="n"
                    title={f.name}
                    style={{
                      fontFamily: "monospace", fontSize: 11.5, color: C.text,
                      display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}
                  >
                    {f.name}
                  </span>,
                  <Tag key="t" tone={C.sub}>{f.type}</Tag>,
                  <div key="s">
                    <div style={{ fontSize: 11.5 }}>{f.size}</div>
                    {f.count !== "—" && <div style={{ fontSize: 10.5, color: C.faint }}>{f.count}</div>}
                  </div>,
                ])}
              />
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// Tab 2 · 质量报告
// ================================================================
export function DatasetQualityTab({ ds }: { ds: Dataset }) {
  const q = ds.quality;
  const dimStats = qualityDimStats(ds);
  const issues = qualityIssueDist(ds);
  const history = qualityHistory(ds);
  const maxIssue = Math.max(...issues.map((i) => i.count), 1);

  return (
    <div style={scrollArea}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <Metric
          icon={<FileCheck2 size={15} />}
          label="质量总分"
          value={q.score}
          unit="分"
          tone={scoreTone(q.score)}
          hint={`${q.reportId} · ${q.version}`}
        />
        <Metric
          icon={<AlertTriangle size={15} />}
          label="检出问题"
          value={q.issues}
          unit="处"
          tone={C.warn}
          hint="已随报告记录明细"
        />
        <Metric
          icon={<Layers size={15} />}
          label="覆盖检测维度"
          value={q.dims.length}
          unit="维"
          tone={C.purple}
          hint="完整性 / 准确性 / 一致性 / 标注质量 / 规范性 / 及时性"
        />
        <Metric
          icon={<CheckCircle2 size={15} />}
          label="报告状态"
          value={q.status}
          tone={q.status === "已随包发布" ? C.success : C.warn}
          hint={`生成于 ${q.publishedAt}`}
        />
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "flex-start" }}>
        <Panel
          title="六维质量评估"
          desc="随数据集一同发布的正式质量报告"
          style={{ width: 400, flexShrink: 0 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 16 }}>
            <DonutScore score={q.score} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
              {q.dims.map((d) => (
                <div key={d.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 3 }}>
                    <span style={{ color: C.sub }}>{d.label}</span>
                    <span style={{ color: scoreTone(d.score), fontWeight: 600 }}>{d.score}</span>
                  </div>
                  <Bar pct={d.score} tone={scoreTone(d.score)} h={5} />
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              padding: "9px 11px", background: C.bg, borderRadius: 6,
              fontSize: 11.5, color: C.sub, lineHeight: 1.7,
            }}
          >
            报告编号 <b style={{ color: C.text }}>{q.reportId}</b>，覆盖 <b style={{ color: C.text }}>{ds.fileCount}</b> 数据的
            抽样与全量校验，共检出 <b style={{ color: C.warn }}>{q.issues}</b> 处问题，均已记录字段级明细。
          </div>
        </Panel>

        <Panel
          title="各维度检测情况"
          desc="检测规则命中与通过率"
          style={{ flex: 1, minWidth: 0 }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            head={["检测维度", "启用规则", "命中问题", "通过率", "达标情况"]}
            widths={["20%", "16%", "16%", "26%", "22%"]}
            rows={dimStats.map((d) => [
              <span key="d" style={{ fontSize: 12.5, fontWeight: 500 }}>{d.dim}</span>,
              <span key="r" style={{ fontSize: 12, color: C.sub }}>{d.rules} 条</span>,
              <span key="h" style={{ fontSize: 12, color: d.hits > 5 ? C.warn : C.text }}>{d.hits} 处</span>,
              <div key="p" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 40 }}>
                  <Bar pct={d.passRate} tone={scoreTone(d.passRate)} h={5} />
                </div>
                <span style={{ fontSize: 11.5, color: scoreTone(d.passRate), width: 34, textAlign: "right" }}>{d.passRate}</span>
              </div>,
              d.passRate >= 93
                ? <Tag key="s" tone={C.success}>优于阈值</Tag>
                : d.passRate >= 88
                  ? <Tag key="s" tone={C.info}>达标</Tag>
                  : <Tag key="s" tone={C.warn}>需整改</Tag>,
            ])}
          />
        </Panel>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "flex-start" }}>
        <Panel
          title="问题分布"
          desc="按字段与维度定位主要问题来源"
          style={{ flex: 1, minWidth: 0 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {issues.map((i, idx) => {
              const firstOfField = issues.findIndex((x) => x.field === i.field) === idx;
              return (
              <div
                key={`${i.field}-${i.dim}`}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "4px 0",
                  marginTop: firstOfField && idx > 0 ? 6 : 0,
                  borderTop: firstOfField && idx > 0 ? `1px dashed ${C.borderSoft}` : "none",
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace", fontSize: 11.5,
                    color: firstOfField ? C.text : C.faint,
                    width: 120, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}
                >
                  {firstOfField ? i.field : "↳"}
                </span>
                <Tag tone={C.sub}>{i.dim}</Tag>
                <div style={{ flex: 1, minWidth: 60 }}>
                  <Bar pct={(i.count / maxIssue) * 100} tone={C.warn} h={6} />
                </div>
                <span style={{ fontSize: 11.5, color: C.sub, width: 34, textAlign: "right", flexShrink: 0 }}>{i.count}</span>
              </div>
              );
            })}
          </div>
        </Panel>

        <Panel
          title="历史批次趋势"
          desc="同数据集各版本质量总分变化"
          style={{ width: 380, flexShrink: 0 }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 110, padding: "0 4px" }}>
            {history.map((h) => {
              const min = 78;
              const hgt = Math.max(10, ((h.value - min) / (100 - min)) * 92);
              return (
                <div key={h.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: scoreTone(h.value) }}>{h.value}</span>
                  <div
                    style={{
                      width: "100%", maxWidth: 44, height: hgt, borderRadius: "3px 3px 0 0",
                      background: `linear-gradient(180deg, ${scoreTone(h.value)}, ${scoreTone(h.value)}88)`,
                    }}
                  />
                  <span style={{ fontSize: 11, color: C.text }}>{h.label}</span>
                  <span style={{ fontSize: 10, color: C.faint, whiteSpace: "nowrap" }}>{h.date}</span>
                </div>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.borderSoft}`,
              fontSize: 11.5, color: C.sub, lineHeight: 1.7,
            }}
          >
            {history.length > 1
              ? `较上一版本 ${history[history.length - 2].value} 分，本版本提升 ${(ds.quality.score - history[history.length - 2].value).toFixed(1)} 分。`
              : "该数据集暂无历史版本可比对。"}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function DonutScore({ score }: { score: number }) {
  const tone = scoreTone(score);
  const r = 34;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div style={{ position: "relative", width: 92, height: 92, flexShrink: 0 }}>
      <svg width="92" height="92" viewBox="0 0 92 92">
        <circle cx="46" cy="46" r={r} fill="none" stroke={C.borderSoft} strokeWidth="8" />
        <circle
          cx="46" cy="46" r={r} fill="none" stroke={tone} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`}
          transform="rotate(-90 46 46)"
        />
      </svg>
      <div
        style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 700, color: tone, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 10, color: C.faint, marginTop: 3 }}>质量总分</span>
      </div>
    </div>
  );
}

// ================================================================
// Tab 3 · 数据血缘
// ================================================================
export function DatasetLineageTab({ ds }: { ds: Dataset }) {
  const lg = ds.lineage;
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const step = activeStep === null ? null : lg.steps[activeStep];

  return (
    <div style={scrollArea}>
      <Panel
        title="全链路血缘"
        desc={`从原始数据源到最终数据产品的加工路径 · ${lg.id}`}
        extra={<Tag tone={C.info}>{lg.steps.length} 个加工节点</Tag>}
      >
        <div style={{ overflowX: "auto", paddingBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", minWidth: 880 }}>
            {lg.steps.map((s, i) => (
              <React.Fragment key={s.name}>
                <button
                  onClick={() => setActiveStep(activeStep === i ? null : i)}
                  style={{
                    width: 118, flexShrink: 0, padding: "10px 10px", borderRadius: 8, textAlign: "left",
                    background: activeStep === i ? `${STEP_TONE[s.type]}1f` : `${STEP_TONE[s.type]}0f`,
                    border: `1px solid ${activeStep === i ? STEP_TONE[s.type] : `${STEP_TONE[s.type]}33`}`,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: STEP_TONE[s.type] }} />
                    <span style={{ fontSize: 10, color: STEP_TONE[s.type], fontWeight: 600 }}>{s.type}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, lineHeight: 1.35 }}>{s.name}</div>
                  <div style={{ fontSize: 10.5, color: C.faint, marginTop: 4, lineHeight: 1.4 }}>{s.detail}</div>
                </button>
                {i < lg.steps.length - 1 && (
                  <ArrowRight size={14} style={{ color: C.faint, flexShrink: 0, margin: "0 3px" }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.borderSoft}`,
            display: "flex", gap: 24, flexWrap: "wrap", fontSize: 12, color: C.sub,
          }}
        >
          <span>数据来源：<b style={{ color: C.text }}>{lg.source}</b></span>
          <span>加工工序：<b style={{ color: C.text }}>{lg.steps.length}</b> 步</span>
          <span>命中规则：<b style={{ color: C.text }}>{lg.rules}</b> 条</span>
          <span>质检总分：<b style={{ color: C.success }}>{lg.qcScore}</b></span>
          <span>发布时间：<b style={{ color: C.text }}>{lg.publishedAt}</b></span>
        </div>

        {step && (
          <div
            style={{
              marginTop: 12, padding: 12, background: C.primarySoft,
              border: `1px solid ${C.primary}22`, borderRadius: 6, fontSize: 12,
            }}
          >
            <div style={{ fontWeight: 600, color: C.text, marginBottom: 4 }}>
              {step.name} <span style={{ fontWeight: 400, color: C.faint }}>（{step.type}）</span>
            </div>
            <div style={{ color: C.sub, lineHeight: 1.7 }}>{step.detail}</div>
          </div>
        )}
      </Panel>

      <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "flex-start" }}>
        <Panel
          title="加工环节明细"
          desc="记录每一环节的处理动作与产出"
          style={{ flex: 1, minWidth: 0 }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            head={["序号", "节点名称", "环节类型", "处理说明", "状态"]}
            widths={["8%", "22%", "12%", "40%", "18%"]}
            rows={lg.steps.map((s, i) => [
              <span key="i" style={{ fontSize: 12, color: C.faint }}>{String(i + 1).padStart(2, "0")}</span>,
              <span key="n" style={{ fontSize: 12.5, fontWeight: 500 }}>{s.name}</span>,
              <Tag key="t" tone={STEP_TONE[s.type]}>{s.type}</Tag>,
              <span key="d" style={{ fontSize: 12, color: C.sub }}>{s.detail}</span>,
              <Tag key="s" tone={C.success}>已完成</Tag>,
            ])}
          />
        </Panel>

        <Panel
          title="下游影响分析"
          desc={`${lg.consumers.length} 个对象引用该数据集`}
          style={{ width: 320, flexShrink: 0 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 2 }}>
              变更或下线该数据集将影响以下对象：
            </div>
            {lg.consumers.map((c) => (
              <div
                key={c}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "9px 10px",
                  border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, color: C.text,
                }}
              >
                <Link2 size={13} style={{ color: C.info, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{c}</span>
              </div>
            ))}
            <div
              style={{
                marginTop: 4, padding: 10, background: C.warnSoft, border: `1px solid ${C.warn}33`,
                borderRadius: 6, fontSize: 11.5, color: "#b45309", lineHeight: 1.6,
              }}
            >
              提示：发布新版本前建议先核对下游引用，避免加工口径变更导致模型指标漂移。
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ================================================================
// Tab 4 · 版本管理
// ================================================================
export function DatasetVersionTab({ ds }: { ds: Dataset }) {
  const [selected, setSelected] = useState(ds.versions[0]?.id || "");
  const cur = ds.versions.find((v) => v.id === selected) || ds.versions[0];
  const timeline = [...ds.versions].reverse();

  return (
    <div style={scrollArea}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Panel
          title="版本演进"
          desc="每次更新迭代自动生成新版本号，支持多版本并存"
          style={{ width: 300, flexShrink: 0 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {timeline.map((v, i) => (
              <div key={v.id} style={{ display: "flex", gap: 10 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 14, flexShrink: 0 }}>
                  <span
                    style={{
                      width: 9, height: 9, borderRadius: "50%", marginTop: 5,
                      background: v.status === "生效中" ? C.success : v.status === "已下线" ? C.faint : C.sub,
                      boxShadow: v.status === "生效中" ? `0 0 0 3px ${C.success}22` : "none",
                    }}
                  />
                  {i < timeline.length - 1 && (
                    <span style={{ width: 1, flex: 1, background: C.border, marginTop: 4, marginBottom: 4 }} />
                  )}
                </div>
                <button
                  onClick={() => setSelected(v.id)}
                  style={{
                    flex: 1, textAlign: "left", padding: "5px 8px 11px",
                    background: selected === v.id ? C.primarySoft : "transparent",
                    borderRadius: 5, border: "none", cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        fontSize: 12.5, fontWeight: 600,
                        color: selected === v.id ? C.primary : v.status === "生效中" ? C.success : C.text,
                      }}
                    >
                      {v.version}
                    </span>
                    <Tag tone={VER_TONE[v.status]}>{v.status}</Tag>
                  </div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 3 }}>{v.releasedAt} · {v.operator}</div>
                </button>
              </div>
            ))}
          </div>
        </Panel>

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          <Panel
            title={`版本 ${cur.version}`}
            desc={`发布人 ${cur.operator} · ${cur.releasedAt}`}
            extra={
              <div style={{ display: "flex", gap: 8 }}>
                {cur.status === "生效中" ? (
                  <>
                    <Btn size="sm" tone="danger" icon={<Ban size={13} />}>下线版本</Btn>
                  </>
                ) : (
                  <Btn size="sm" tone="warn" icon={<Undo2 size={13} />}>回滚到此版本</Btn>
                )}
              </div>
            }
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 14 }}>
              {[
                { k: "数据增量", v: cur.delta, tone: cur.delta.startsWith("-") ? C.warn : C.success },
                { k: "质量变化", v: `${cur.qualityFrom} → ${cur.qualityTo}`, tone: cur.qualityTo >= cur.qualityFrom ? C.success : C.danger },
                { k: "适用范围", v: cur.scope, tone: C.text },
                { k: "版本状态", v: cur.status, tone: VER_TONE[cur.status] },
              ].map((x) => (
                <div key={x.k} style={{ padding: "10px 12px", background: C.bg, borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: C.faint, marginBottom: 4 }}>{x.k}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: x.tone }}>{x.v}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.8 }}>
              <b style={{ color: C.text }}>变更内容：</b>{cur.changes}
            </div>
          </Panel>

          <Panel
            title="版本清单"
            desc="版本信息包含变更内容、数据增量、质量变化、适用范围调整"
            bodyStyle={{ padding: 0 }}
          >
            <Table
              head={["版本", "变更内容", "数据增量", "质量变化", "适用范围", "状态", "发布日期", "操作"]}
              widths={["8%", "30%", "9%", "13%", "10%", "9%", "11%", "10%"]}
              onRowClick={(i) => setSelected(ds.versions[i].id)}
              rows={ds.versions.map((v) => [
                <span key="v" style={{ fontSize: 12, fontWeight: 600, color: v.status === "生效中" ? C.success : C.text }}>{v.version}</span>,
                <span key="c" style={{ fontSize: 12, color: C.sub }}>{v.changes}</span>,
                <span key="d" style={{ fontSize: 12, color: v.delta.startsWith("-") ? C.warn : C.success }}>{v.delta}</span>,
                <span key="q" style={{ fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {v.qualityFrom} → {v.qualityTo}
                  <span style={{ color: v.qualityTo >= v.qualityFrom ? C.success : C.danger, fontSize: 11 }}>
                    {v.qualityTo >= v.qualityFrom ? "↑" : "↓"}
                  </span>
                </span>,
                <span key="s" style={{ fontSize: 12, color: C.sub }}>{v.scope}</span>,
                <Tag key="st" tone={VER_TONE[v.status]}>{v.status}</Tag>,
                <span key="t" style={{ fontSize: 12, color: C.sub, whiteSpace: "nowrap" }}>{v.releasedAt}</span>,
                <div key="a" style={{ display: "flex", gap: 6 }}>
                  <IconBtn icon={<Eye size={13} />} label="查看版本" size="sm" />
                  {v.status !== "生效中" && <IconBtn icon={<Undo2 size={13} />} label="回滚到此版本" tone="warn" size="sm" />}
                </div>,
              ])}
            />
          </Panel>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// Tab 5 · 权限管理
// ================================================================
const ACCESS_LEVELS: Level[] = ["公开", "内部", "受限", "核心"];
const OPERATOR = "admin";

/** 角色权限强度：取已选权限项中的最高权重 */
const permPct = (perms: PermCode[]) =>
  perms.length === 0 ? 4 : Math.max(...perms.map((p) => PERM_WEIGHT[p]));

/** 取已选权限项中的最高层级色调 */
const permTone = (perms: PermCode[]) => {
  if (perms.length === 0) return PERM_TONE["无权限"];
  const top = PERM_CODES.filter((p) => perms.includes(p)).pop() as PermCode;
  return PERM_TONE[top];
};

const fmtNow = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

function PermSelect({
  value, options, tone, onChange, w = 92,
}: {
  value: string;
  options: readonly string[];
  tone: string;
  onChange: (v: string) => void;
  w?: number;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: w, padding: "4px 6px", fontSize: 12, fontWeight: 500,
        color: tone, background: `${tone}12`, border: `1px solid ${tone}66`,
        borderRadius: 5, outline: "none", cursor: "pointer", flexShrink: 0,
      }}
    >
      {options.map((o) => (
        <option key={o} value={o} style={{ color: C.text }}>{o}</option>
      ))}
    </select>
  );
}

export function DatasetPermissionTab({ ds }: { ds: Dataset }) {
  const p = ds.permission;

  // 权限以本组件的本地副本为准，编辑态先在 draft 上改，保存后才落生效
  const [roles, setRoles] = useState<RolePerm[]>(p.roles);
  const [level, setLevel] = useState<Level>(ds.level);
  const [logs, setLogs] = useState<PermLog[]>(p.logs);
  const [draft, setDraft] = useState<RolePerm[] | null>(null);
  const [draftLevel, setDraftLevel] = useState<Level>(ds.level);
  const [toast, setToast] = useState("");

  // 切换数据集时重置本地副本与编辑态
  useEffect(() => {
    setRoles(p.roles);
    setLevel(ds.level);
    setLogs(p.logs);
    setDraft(null);
    setDraftLevel(ds.level);
    setToast("");
  }, [ds.id, ds.level, p.roles, p.logs]);

  const editing = draft !== null;
  const shown = draft ?? roles;

  const startEdit = () => {
    setDraft(roles.map((r) => ({ ...r })));
    setDraftLevel(level);
    setToast("");
  };

  const cancelEdit = () => {
    setDraft(null);
    setDraftLevel(level);
    setToast("");
  };

  const saveEdit = () => {
    if (!draft) return;
    const now = fmtNow();
    const adds: PermLog[] = [];

    if (draftLevel !== level) {
      adds.push({
        time: now, operator: OPERATOR,
        action: "调整数据集访问级别", before: level, after: draftLevel,
      });
    }
    draft.forEach((d, i) => {
      const before = roles[i]?.perms;
      if (before && permLabel(before) !== permLabel(d.perms)) {
        adds.push({
          time: now, operator: OPERATOR,
          action: `调整「${d.role}」角色权限`,
          before: permLabel(before), after: permLabel(d.perms),
        });
      }
    });

    if (adds.length === 0) {
      setDraft(null);
      setToast("未检测到权限变更");
      window.setTimeout(() => setToast(""), 2000);
      return;
    }

    setRoles(draft.map((r) => ({ ...r })));
    setLevel(draftLevel);
    setLogs([...adds, ...logs]);
    setDraft(null);
    setToast(`已保存 ${adds.length} 项权限变更，并写入变更留痕`);
    window.setTimeout(() => setToast(""), 2600);
  };

  const granted = shown.filter((r) => r.perms.length > 0).length;
  const canDownload = shown.filter((r) => r.perms.includes("下载") || r.perms.includes("授权")).length;

  const togglePerm = (idx: number, code: PermCode) => {
    setDraft((cur) =>
      cur
        ? cur.map((x, j) =>
            j === idx
              ? {
                  ...x,
                  perms: x.perms.includes(code)
                    ? x.perms.filter((p) => p !== code)
                    : PERM_CODES.filter((p) => p === code || x.perms.includes(p)),
                }
              : x
          )
        : cur
    );
  };

  return (
    <div style={scrollArea}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <Metric
          icon={<Lock size={15} />}
          label="访问级别"
          value={level}
          tone={LEVEL_TONE[level]}
          hint={editing ? "编辑中，可同步调整" : "按数据集粒度独立管控"}
        />
        <Metric
          icon={<Shield size={15} />}
          label="已授权角色"
          value={`${granted} / ${PERMISSION_ROLES.length}`}
          unit="个"
          tone={C.purple}
          hint="不同角色可同时拥有多项权限"
        />
        <Metric
          icon={<Download size={15} />}
          label="可下载角色"
          value={canDownload}
          unit="个"
          tone={C.success}
          hint="拥有下载或授权权限的角色"
        />
        <Metric
          icon={<History size={15} />}
          label="变更记录"
          value={logs.length}
          unit="条"
          tone={C.info}
          hint={logs[0] ? `最近 ${logs[0].time}` : "暂无变更"}
        />
      </div>

      {toast && (
        <div
          style={{
            display: "flex", alignItems: "center", gap: 7, marginTop: 12,
            padding: "8px 12px", borderRadius: 6, fontSize: 12,
            color: C.success, background: `${C.success}0f`,
            border: `1px solid ${C.success}44`,
          }}
        >
          <CheckCircle2 size={14} /> {toast}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "flex-start" }}>
        <Panel
          title="角色权限配置"
          desc={editing ? "编辑中：每个角色可多选权限项，保存后写入变更留痕" : "权限项可多选：同一角色可同时拥有查看 / 下载 / 使用 / 授权中的多项，均不选即无权限"}
          style={{ flex: 1, minWidth: 0 }}
          extra={
            editing ? (
              <div style={{ display: "flex", gap: 6 }}>
                <Btn size="sm" icon={<X size={13} />} onClick={cancelEdit}>取消</Btn>
                <Btn size="sm" tone="primary" icon={<Check size={13} />} onClick={saveEdit}>保存</Btn>
              </div>
            ) : (
              <Btn size="sm" tone="primary" icon={<Shield size={13} />} onClick={startEdit}>调整权限</Btn>
            )
          }
        >
          <div
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 10,
            }}
          >
            <Lock size={14} style={{ color: C.sub, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: C.text }}>数据集访问级别</span>
            <span style={{ fontSize: 11, color: C.faint }}>决定对外可见范围与是否需审批</span>
            <div style={{ flex: 1 }} />
            {editing ? (
              <PermSelect
                value={draftLevel}
                options={ACCESS_LEVELS}
                tone={LEVEL_TONE[draftLevel]}
                onChange={(v) => setDraftLevel(v as Level)}
              />
            ) : (
              <Tag tone={LEVEL_TONE[level]}>{level}</Tag>
            )}
          </div>

          {editing && (
            <div
              style={{
                display: "flex", alignItems: "center", gap: 5, marginBottom: 8,
                fontSize: 11, color: C.faint,
              }}
            >
              <Check size={11} />
              每个角色可多选权限项（查看 / 下载 / 使用 / 授权），全部取消即为无权限
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {shown.map((r, i) => (
              <div
                key={r.role}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 6,
                  background: editing ? C.white : "transparent",
                }}
              >
                <span
                  style={{
                    width: 26, height: 26, borderRadius: "50%", background: C.bg,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}
                >
                  <User size={13} style={{ color: C.sub }} />
                </span>
                <span style={{ fontSize: 12.5, color: C.text, width: 96, flexShrink: 0 }}>{r.role}</span>

                {editing ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, flexWrap: "wrap" }}>
                    {PERM_CODES.map((code) => {
                      const on = r.perms.includes(code);
                      const tone = PERM_TONE[code];
                      return (
                        <button
                          key={code}
                          type="button"
                          aria-pressed={on}
                          title={`${on ? "取消" : "授予"}「${r.role}」${code}权限`}
                          onClick={() => togglePerm(i, code)}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "4px 9px", fontSize: 11.5, cursor: "pointer",
                            fontWeight: on ? 600 : 400,
                            color: on ? tone : C.sub,
                            background: on ? `${tone}14` : C.white,
                            border: `1px solid ${on ? `${tone}66` : C.border}`,
                            borderRadius: 5,
                          }}
                        >
                          {on && <Check size={11} />}
                          {code}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, flex: 1, flexWrap: "wrap" }}>
                      {r.perms.length === 0 ? (
                        <Tag tone={C.faint}>无权限</Tag>
                      ) : (
                        PERM_CODES.filter((p) => r.perms.includes(p)).map((p) => (
                          <Tag key={p} tone={PERM_TONE[p]}>{p}</Tag>
                        ))
                      )}
                    </div>
                    <div style={{ width: 96, flexShrink: 0 }}>
                      <Bar pct={permPct(r.perms)} tone={permTone(r.perms)} h={5} />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="访问级别说明"
          desc={editing ? "点击卡片可直接切换该数据集的访问级别" : "结合数据分级分类标准实施管控"}
          style={{ width: 320, flexShrink: 0 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { lv: "公开", d: "外部访客可直接下载，无需申请", tone: "#16a34a" },
              { lv: "内部", d: "仅平台内部角色可用，外部无权限", tone: "#0ea5e9" },
              { lv: "受限", d: "需申请授权后方可使用，全流程留痕", tone: "#f59e0b" },
              { lv: "核心", d: "高敏感数据，需审批且禁止直接下载", tone: "#dc2626" },
            ].map((x) => {
              const current = editing ? draftLevel : level;
              const active = x.lv === current;
              return (
                <div
                  key={x.lv}
                  onClick={() => editing && setDraftLevel(x.lv as Level)}
                  style={{
                    padding: "9px 11px", borderRadius: 6,
                    background: active ? `${x.tone}0f` : C.white,
                    border: `1px solid ${active ? `${x.tone}55` : C.border}`,
                    cursor: editing ? "pointer" : "default",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: x.tone }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: active ? x.tone : C.text }}>{x.lv}</span>
                    {active && <span style={{ fontSize: 10.5, color: x.tone }}>{editing ? "待保存" : "当前级别"}</span>}
                  </div>
                  <div style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.6 }}>{x.d}</div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel
        title="权限变更留痕"
        desc={`所有权限调整记录可追溯、可审计${logs.length > 0 ? ` · 共 ${logs.length} 条` : ""}`}
        style={{ marginTop: 12 }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          head={["时间", "操作人", "变更动作", "变更前", "变更后"]}
          widths={["22%", "14%", "22%", "21%", "21%"]}
          rows={logs.map((l) => [
            <span key="t" style={{ fontSize: 12, color: C.sub }}>{l.time}</span>,
            <span key="o" style={{ fontSize: 12 }}>{l.operator}</span>,
            <span key="a" style={{ fontSize: 12, color: C.text }}>{l.action}</span>,
            <span key="b" style={{ fontSize: 12, color: C.faint }}>{l.before}</span>,
            <span key="af" style={{ fontSize: 12, color: C.success }}>{l.after}</span>,
          ])}
        />
      </Panel>
    </div>
  );
}
