"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  RotateCcw,
  UserCheck,
  Clock,
  Timer,
  GitBranch,
  Lightbulb,
  FileText,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { C, Panel, Table, Tag, Btn, IconBtn, scrollArea, Kv, Bar } from "@/components/production/ui";
import {
  TICKET_MAP,
  TICKET_STATUS,
  QC_LEVEL_META,
  QC_DIM_MAP,
  QC_TICKET_OWNERS,
  slaHours,
  type QcTicket,
  type TicketStatus,
} from "./qcData";

export default function TicketDetailClient({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const init = TICKET_MAP[ticketId];
  const [t, setT] = useState<QcTicket | undefined>(init);
  const [assignOpen, setAssignOpen] = useState(false);
  const [picked, setPicked] = useState(QC_TICKET_OWNERS[0]);

  if (!t) {
    return (
      <div style={{ ...scrollArea, textAlign: "center", paddingTop: 80, color: C.sub }}>
        <div style={{ fontSize: 15, marginBottom: 12 }}>未找到该工单：{ticketId}</div>
        <Btn tone="primary" onClick={() => router.push("/quality?view=ticket")}>返回工单列表</Btn>
      </div>
    );
  }

  const st = TICKET_STATUS[t.status];
  const lv = QC_LEVEL_META[t.level];
  const dim = QC_DIM_MAP[t.dim];
  const sla = slaHours(t.dueAt);

  const patch = (next: Partial<QcTicket>, ev?: { action: string; actor: string; note?: string }) => {
    setT((cur) =>
      cur
        ? {
            ...cur,
            ...next,
            timeline: ev ? [...cur.timeline, { time: "2026-10-20 17:58", actor: ev.actor, action: ev.action, note: ev.note }] : cur.timeline,
          }
        : cur
    );
  };

  const doAssign = () => {
    patch({ owner: picked, status: "processing" as TicketStatus }, { action: "分派", actor: "李工 · 数据质量", note: `指派给 ${picked}` });
    setAssignOpen(false);
    toast.success(`已分派给 ${picked}`);
  };

  const submit = () => {
    patch({ status: "review" as TicketStatus }, { action: "提交处理", actor: t.owner, note: "已按建议方式处理，等待复检" });
    toast.success("已提交处理，进入待复检");
  };

  const recheck = () => {
    const pass = t.level !== "critical" || t.timeline.filter((e) => e.action === "提交处理").length > 1;
    if (pass) {
      patch(
        { status: "closed" as TicketStatus },
        { action: "复检通过", actor: "系统", note: `重跑 ${t.ruleId}，命中 0 条` }
      );
      toast.success("复检通过，工单已关闭");
    } else {
      patch(
        { status: "processing" as TicketStatus },
        { action: "复检未通过", actor: "系统", note: `重跑 ${t.ruleId}，仍命中 2 条，退回处理中` }
      );
      toast.error("复检未通过，已退回处理中");
    }
  };

  return (
    <div style={scrollArea}>
      {/* 页头 */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <IconBtn icon={<ArrowLeft size={14} />} label="返回工单列表" onClick={() => router.push("/quality?view=ticket")} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 17, fontWeight: 600, color: C.text, margin: 0 }}>{t.title}</h1>
            <Tag tone={lv.tone} soft={lv.soft}>{lv.label}</Tag>
            <Tag tone={st.tone} soft={st.soft}>{st.label}</Tag>
          </div>
          <div style={{ fontSize: 12, color: C.faint, marginTop: 4 }}>
            {t.id} · 来源报告 {t.reportId} · {t.dataset} / {t.batch} · 创建于 {t.createdAt}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {t.status === "pending" && (
            <Btn tone="warn" icon={<UserCheck size={13} />} onClick={() => setAssignOpen(true)}>分派责任人</Btn>
          )}
          {t.status === "processing" && (
            <Btn tone="primary" icon={<Send size={13} />} onClick={submit}>提交处理</Btn>
          )}
          {t.status === "review" && (
            <Btn tone="success" icon={<CheckCircle2 size={13} />} onClick={recheck}>执行复检</Btn>
          )}
          {t.status === "closed" && (
            <Btn icon={<RotateCcw size={13} />} onClick={() => toast("如需重新处理，请从来源报告重新开单")}>已闭环</Btn>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 12 }}>
        {/* 左列 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Panel title="问题描述" desc={`命中规则 ${t.ruleId} · ${t.ruleName}`}>
            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.75 }}>{t.desc}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <Tag tone={dim.tone} soft={dim.soft}>{dim.label}</Tag>
              <Tag tone={C.faint}>{t.batch}</Tag>
              <Tag tone={C.faint}>{t.dataset}</Tag>
            </div>
          </Panel>

          <Panel title="问题数据样例" desc={`展示 ${t.samples.length} 条代表性样本，完整明细见来源报告`} bodyStyle={{ padding: 0 }}>
            <Table
              head={["样本编号", "字段", "实际值", "期望值"]}
              widths={["26%", "14%", "30%", "auto"]}
              rows={t.samples.map((s) => [
                <code key="i" style={{ fontSize: 11, color: C.text }}>{s.sampleId}</code>,
                <code key="f" style={{ fontSize: 11, color: "#4338ca" }}>{s.field}</code>,
                <code key="v" style={{ fontSize: 11, color: C.danger }}>{s.value}</code>,
                <span key="e" style={{ fontSize: 11, color: C.sub }}>{s.expect}</span>,
              ])}
            />
          </Panel>

          <Panel title="建议处理方式" desc="由规则定义与历史处置记录生成">
            <div style={{ display: "flex", gap: 10, background: C.infoSoft, border: `1px solid ${C.info}33`, borderRadius: 8, padding: "11px 13px" }}>
              <Lightbulb size={15} style={{ color: C.info, flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{t.suggestion}</div>
            </div>
            <div style={{ marginTop: 16, paddingTop: 13, borderTop: `1px dashed ${C.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 9 }}>影响范围</div>
              <div style={{ display: "flex", gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: C.faint, marginBottom: 4 }}>影响行数</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.text }}>{t.impact.rows}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: C.faint, marginBottom: 4 }}>影响批次</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.text }}>{t.impact.batches}</div>
                </div>
                <div style={{ flex: 2 }}>
                  <div style={{ fontSize: 11, color: C.faint, marginBottom: 4 }}>影响下游</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {t.impact.downstream.map((d) => (
                      <Tag key={d} tone={C.purple} soft={C.purpleSoft}>
                        <GitBranch size={10} /> {d}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="溯源定位" desc="从问题样本回溯到批次、字段与规则">
            <Kv k="数据集" v={t.dataset} w={72} />
            <Kv k="批次" v={<code style={{ fontSize: 12 }}>{t.batch}</code>} w={72} />
            <Kv k="字段" v={<code style={{ fontSize: 12, color: "#4338ca" }}>{t.samples[0]?.field ?? "—"}</code>} w={72} />
            <Kv k="命中规则" v={`${t.ruleId} · ${t.ruleName}`} w={72} />
            <Kv
              k="来源报告"
              w={72}
              v={
                <button
                  onClick={() => router.push(`/quality/report/${t.reportId}`)}
                  style={{ border: "none", background: "none", padding: 0, fontSize: 12, color: C.primary, cursor: "pointer" }}
                >
                  {t.reportId} →
                </button>
              }
            />
          </Panel>
        </div>

        {/* 右列 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Panel title="工单信息">
            <Kv k="工单号" v={<code style={{ fontSize: 12 }}>{t.id}</code>} w={64} />
            <Kv k="来源报告" v={<span style={{ color: C.primary, cursor: "pointer" }} onClick={() => router.push(`/quality/report/${t.reportId}`)}>{t.reportId}</span>} w={64} />
            <Kv k="命中规则" v={`${t.ruleId} ${t.ruleName}`} w={64} />
            <Kv k="责任人" v={t.owner} w={64} />
            <Kv k="状 态" v={<Tag tone={st.tone} soft={st.soft}>{st.label}</Tag>} w={64} />
            <Kv k="创建时间" v={t.createdAt} w={64} />
            <Kv k="SLA 截止" v={t.dueAt} w={64} />
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                <span style={{ color: C.faint }}>SLA 进度</span>
                <span style={{ color: t.status === "closed" ? C.success : sla < 0 ? C.danger : C.sub, fontWeight: 600 }}>
                  {t.status === "closed" ? "已完成" : sla < 0 ? `超时 ${Math.abs(sla).toFixed(1)}h` : `剩余 ${sla.toFixed(1)}h`}
                </span>
              </div>
              <Bar pct={t.status === "closed" ? 100 : Math.max(0, Math.min(100, (1 - sla / 24) * 100))} tone={sla < 0 ? C.danger : sla < 8 ? C.warn : C.success} h={5} />
            </div>
          </Panel>

          <Panel title="处理记录" desc={`${t.timeline.length} 条流转记录`}>
            <div style={{ position: "relative", paddingLeft: 18 }}>
              <div style={{ position: "absolute", left: 4, top: 6, bottom: 6, width: 1, background: C.border }} />
              {t.timeline.map((e, i) => {
                const last = i === t.timeline.length - 1;
                const tone = e.action.includes("通过") ? C.success : e.action.includes("未通过") ? C.danger : e.action === "关闭工单" ? C.success : last ? C.primary : C.faint;
                return (
                  <div key={i} style={{ position: "relative", paddingBottom: i === t.timeline.length - 1 ? 0 : 14 }}>
                    <span
                      style={{
                        position: "absolute",
                        left: -18,
                        top: 4,
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: "#fff",
                        border: `2px solid ${tone}`,
                        boxSizing: "border-box",
                      }}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{e.action}</span>
                      <span style={{ fontSize: 11, color: C.faint }}>{e.time}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>{e.actor}</div>
                    {e.note && <div style={{ fontSize: 11, color: C.faint, marginTop: 3, lineHeight: 1.55 }}>{e.note}</div>}
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="闭环校验" desc="复检通过才允许关闭，确保问题真被解决">
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {[
                { label: "问题已确认", done: t.timeline.some((e) => e.action === "自动开单" || e.action === "分派"), icon: <FileText size={12} /> },
                { label: "责任人已分派", done: t.timeline.some((e) => e.action === "分派" || e.action === "接单"), icon: <UserCheck size={12} /> },
                { label: "处理已反馈", done: t.timeline.some((e) => e.action === "提交处理"), icon: <Send size={12} /> },
                { label: "复检已通过", done: t.timeline.some((e) => e.action === "复检通过"), icon: <ShieldCheck size={12} /> },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: s.done ? C.successSoft : C.bg,
                      color: s.done ? C.success : C.faint,
                      border: `1px solid ${s.done ? C.success + "44" : C.border}`,
                      flexShrink: 0,
                    }}
                  >
                    {s.done ? <CheckCircle2 size={11} /> : s.icon}
                  </span>
                  <span style={{ color: s.done ? C.text : C.faint }}>{s.label}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.faint, marginTop: 12 }}>
              <Clock size={11} />
              {sla < 0 && t.status !== "closed" ? `已超时 ${Math.abs(sla).toFixed(1)} 小时` : `SLA 剩余 ${Math.max(0, sla).toFixed(1)} 小时`}
              <span style={{ flex: 1 }} />
              <Timer size={11} /> {t.dueAt}
            </div>
          </Panel>
        </div>
      </div>

      {assignOpen && (
        <div
          onClick={() => setAssignOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.42)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: 400, background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 20px 48px rgba(15,23,42,.25)" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, fontSize: 15, fontWeight: 600, color: C.text }}>分派责任人</div>
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 6 }}>
              {QC_TICKET_OWNERS.map((o) => {
                const on = picked === o;
                return (
                  <button
                    key={o}
                    onClick={() => setPicked(o)}
                    style={{
                      textAlign: "left",
                      padding: "9px 11px",
                      borderRadius: 7,
                      cursor: "pointer",
                      fontSize: 13,
                      border: `1px solid ${on ? C.primary : C.border}`,
                      background: on ? C.primarySoft : "#fff",
                      color: on ? C.primary : C.text,
                      fontWeight: on ? 600 : 400,
                    }}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 16px", borderTop: `1px solid ${C.border}` }}>
              <Btn onClick={() => setAssignOpen(false)}>取消</Btn>
              <Btn tone="primary" onClick={doAssign}>确认分派</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
