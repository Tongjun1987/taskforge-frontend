"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ticket,
  Send,
  CheckCircle2,
  RotateCcw,
  Clock,
  Timer,
  AlertTriangle,
  Search,
  Eye,
  UserCheck,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { C, Panel, Metric, Grid, Table, Tag, Btn, IconBtn, scrollArea, Segmented } from "@/components/production/ui";
import {
  QC_TICKETS,
  QC_TICKET_OWNERS,
  QC_LEVEL_META,
  TICKET_STATUS,
  QC_DIM_MAP,
  slaHours,
  ticketStats,
  type QcTicket,
  type TicketStatus,
} from "./qcData";

const FIELD_STYLE: React.CSSProperties = {
  height: 32,
  padding: "0 10px",
  fontSize: 13,
  color: C.text,
  background: "#fff",
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  outline: "none",
  boxSizing: "border-box",
};

type TabKey = "all" | TicketStatus;

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待分派" },
  { key: "processing", label: "处理中" },
  { key: "review", label: "待复检" },
  { key: "closed", label: "已关闭" },
];

function SlaCell({ t }: { t: QcTicket }) {
  if (t.status === "closed") return <span style={{ fontSize: 12, color: C.faint }}>已关闭</span>;
  const h = slaHours(t.dueAt);
  const over = h < 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: over ? C.danger : h < 8 ? "#b45309" : C.sub }}>
      <Timer size={12} />
      {over ? `超时 ${Math.abs(h).toFixed(1)}h` : `剩 ${h.toFixed(1)}h`}
    </div>
  );
}

export default function QualityTicketView() {
  const router = useRouter();
  const [tickets, setTickets] = useState<QcTicket[]>(QC_TICKETS);
  const [tab, setTab] = useState<TabKey>("all");
  const [level, setLevel] = useState("all");
  const [owner, setOwner] = useState("all");
  const [kw, setKw] = useState("");
  const [assignTo, setAssignTo] = useState<{ id: string } | null>(null);
  const [pickedOwner, setPickedOwner] = useState(QC_TICKET_OWNERS[0]);

  const stats = ticketStats();

  const list = tickets.filter((t) => {
    if (tab !== "all" && t.status !== tab) return false;
    if (level !== "all" && t.level !== level) return false;
    if (owner !== "all" && t.owner !== owner) return false;
    if (kw && !(t.id + t.title + t.dataset + t.ruleName).toLowerCase().includes(kw.toLowerCase())) return false;
    return true;
  });

  const advance = (t: QcTicket) => {
    if (t.status === "processing") {
      setTickets((prev) =>
        prev.map((x) =>
          x.id === t.id
            ? {
                ...x,
                status: "review" as TicketStatus,
                timeline: [...x.timeline, { time: "2026-10-20 17:55", actor: x.owner, action: "提交处理", note: "已按建议方式处理，等待复检" }],
              }
            : x
        )
      );
      toast.success("已提交处理，进入待复检");
      return;
    }
    if (t.status === "review") {
      // 复检：重跑原规则。用确定性方式决定通过与否（严重工单首轮多为通过）
      const pass = t.level !== "critical" || t.timeline.filter((e) => e.action === "提交处理").length > 1;
      setTickets((prev) =>
        prev.map((x) =>
          x.id === t.id
            ? {
                ...x,
                status: (pass ? "closed" : "processing") as TicketStatus,
                timeline: [
                  ...x.timeline,
                  {
                    time: "2026-10-20 17:56",
                    actor: "系统",
                    action: pass ? "复检通过" : "复检未通过",
                    note: pass ? `重跑 ${x.ruleId}，命中 0 条` : `重跑 ${x.ruleId}，仍命中 2 条，退回处理中`,
                  },
                  ...(pass ? [{ time: "2026-10-20 17:56", actor: "李工 · 数据质量", action: "关闭工单" }] : []),
                ],
              }
            : x
        )
      );
      toast[pass ? "success" : "error"](pass ? "复检通过，工单已关闭" : "复检未通过，已退回处理中");
    }
  };

  const doAssign = () => {
    if (!assignTo) return;
    setTickets((prev) =>
      prev.map((x) =>
        x.id === assignTo.id
          ? {
              ...x,
              owner: pickedOwner,
              status: "processing" as TicketStatus,
              timeline: [...x.timeline, { time: "2026-10-20 17:54", actor: "李工 · 数据质量", action: "分派", note: `指派给 ${pickedOwner}` }],
            }
          : x
      )
    );
    toast.success(`已分派给 ${pickedOwner}`);
    setAssignTo(null);
  };

  return (
    <div style={scrollArea}>
      <Grid cols={5} gap={12}>
        <Metric icon={<Clock size={15} />} label="待分派" value={stats.pending} unit="张" tone={C.warn} hint="需指定责任人" />
        <Metric icon={<RotateCcw size={15} />} label="处理中" value={stats.processing} unit="张" tone={C.primary} hint="责任人处理中" />
        <Metric icon={<Send size={15} />} label="待复检" value={stats.review} unit="张" tone={C.purple} hint="等待重跑规则验证" />
        <Metric icon={<CheckCircle2 size={15} />} label="已关闭" value={stats.closed} unit="张" tone={C.success} hint="复检通过后关闭" />
        <Metric icon={<AlertTriangle size={15} />} label="超 SLA" value={stats.overdue} unit="张" tone={C.danger} hint="按严重级别倒排" />
      </Grid>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <Segmented items={TABS} value={tab} onChange={(k) => setTab(k)} />

        <div style={{ position: "relative", width: 220 }}>
          <Search size={13} style={{ position: "absolute", left: 9, top: 9, color: C.faint }} />
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder="工单号 / 标题 / 数据集"
            style={{ ...FIELD_STYLE, width: "100%", paddingLeft: 28 }}
          />
        </div>

        <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ ...FIELD_STYLE, width: 110 }}>
          <option value="all">全部级别</option>
          <option value="critical">严重</option>
          <option value="major">一般</option>
          <option value="minor">提示</option>
        </select>

        <select value={owner} onChange={(e) => setOwner(e.target.value)} style={{ ...FIELD_STYLE, width: 160 }}>
          <option value="all">全部责任人</option>
          {QC_TICKET_OWNERS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>

        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: C.faint }}>共 {list.length} 张</span>
      </div>

      <Panel style={{ marginTop: 12 }} bodyStyle={{ padding: 0 }}>
        <Table
          head={["工单", "来源报告", "数据集 / 批次", "维度", "级别", "责任人", "状态", "SLA", "操作"]}
          widths={["26%", "12%", "17%", "8%", "7%", "13%", "9%", "8%", "auto"]}
          onRowClick={(i) => router.push(`/quality/ticket/${list[i].id}`)}
          rows={list.map((t) => {
            const st = TICKET_STATUS[t.status];
            const lv = QC_LEVEL_META[t.level];
            const d = QC_DIM_MAP[t.dim];
            return [
              <div key="t">
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.4 }}>{t.title}</div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>
                  {t.id} · {t.ruleName}
                </div>
              </div>,
              <code key="r" style={{ fontSize: 11, color: C.sub }}>{t.reportId}</code>,
              <div key="d">
                <div style={{ fontSize: 12, color: C.text }}>{t.dataset}</div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 1 }}>{t.batch}</div>
              </div>,
              <Tag key="dm" tone={d.tone} soft={d.soft}>{d.label}</Tag>,
              <Tag key="l" tone={lv.tone} soft={lv.soft}>{lv.label}</Tag>,
              <span key="o" style={{ fontSize: 12, color: C.sub }}>{t.owner}</span>,
              <Tag key="s" tone={st.tone} soft={st.soft}>{st.label}</Tag>,
              <SlaCell key="sla" t={t} />,
              <div key="a" style={{ display: "flex", gap: 4 }}>
                <IconBtn icon={<Eye size={13} />} label="查看工单" tone="primary" onClick={() => router.push(`/quality/ticket/${t.id}`)} />
                {t.status === "pending" && (
                  <IconBtn
                    icon={<UserCheck size={13} />}
                    label="分派责任人"
                    tone="warn"
                    onClick={() => {
                      setAssignTo({ id: t.id });
                      setPickedOwner(QC_TICKET_OWNERS[0]);
                    }}
                  />
                )}
                {(t.status === "processing" || t.status === "review") && (
                  <IconBtn
                    icon={t.status === "processing" ? <Send size={13} /> : <CheckCircle2 size={13} />}
                    label={t.status === "processing" ? "提交处理" : "复检并关闭"}
                    tone="success"
                    onClick={() => advance(t)}
                  />
                )}
              </div>,
            ];
          })}
        />
      </Panel>

      <div style={{ fontSize: 11, color: C.faint, marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
        <Ticket size={12} /> 问题工单由质检报告命中规则自动生成；复检即重跑原规则，命中为 0 才允许关闭。
      </div>

      {/* 分派弹窗 */}
      {assignTo && (
        <div
          onClick={() => setAssignTo(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.42)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: 420, background: "#fff", borderRadius: 10, boxShadow: "0 20px 48px rgba(15,23,42,.25)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>分派责任人</div>
                <div style={{ fontSize: 12, color: C.faint, marginTop: 2 }}>{assignTo.id}</div>
              </div>
              <IconBtn icon={<X size={14} />} label="关闭" onClick={() => setAssignTo(null)} />
            </div>
            <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 6 }}>
              {QC_TICKET_OWNERS.map((o) => {
                const on = pickedOwner === o;
                return (
                  <button
                    key={o}
                    onClick={() => setPickedOwner(o)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "9px 11px",
                      borderRadius: 7,
                      cursor: "pointer",
                      textAlign: "left",
                      border: `1px solid ${on ? C.primary : C.border}`,
                      background: on ? C.primarySoft : "#fff",
                    }}
                  >
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: `1px solid ${on ? C.primary : C.border}`,
                        background: on ? C.primary : "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {on && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }} />}
                    </span>
                    <span style={{ fontSize: 13, color: on ? C.primary : C.text, fontWeight: on ? 600 : 400 }}>{o}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 18px", borderTop: `1px solid ${C.border}` }}>
              <Btn onClick={() => setAssignTo(null)}>取消</Btn>
              <Btn tone="primary" icon={<UserCheck size={13} />} onClick={doAssign}>确认分派</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
