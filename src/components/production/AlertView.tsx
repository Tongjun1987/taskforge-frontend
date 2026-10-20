"use client";

import React, { useState } from "react";
import { AlertTriangle, Bell, CheckCircle2, Mail, Power, Shield, Smartphone, Sliders } from "lucide-react";
import { C, Metric, Panel, Grid, Table, Tag, Dot, Btn, IconBtn, scrollArea, Segmented, LineChart, ALERT_LEVEL } from "./ui";
import { ALERTS, ALERT_RULES, ALERT_TREND, NOTIFY_CHANNELS } from "./mock";

type Level = "critical" | "warning" | "info";
type AlertTab = "list" | "rules" | "trend" | "channels";

const TABS: { key: AlertTab; label: string }[] = [
  { key: "list", label: "告警列表" },
  { key: "rules", label: "告警规则" },
  { key: "trend", label: "趋势分析" },
  { key: "channels", label: "通知渠道" },
];

const TAB_DESC: Record<AlertTab, string> = {
  list: "按级别筛选，定位产线与问题来源",
  rules: "阈值类 / 业务类 / 代码类三类规则，支持分级与启停",
  trend: "近 7 天告警分级趋势",
  channels: "站内 / 企微 / 邮件多通道触达",
};

const LEVEL_TABS: { key: "all" | Level; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "critical", label: "严重" },
  { key: "warning", label: "告警" },
  { key: "info", label: "提示" },
];

export default function AlertView() {
  const [filter, setFilter] = useState<"all" | Level>("all");
  const [channels, setChannels] = useState(NOTIFY_CHANNELS);
  const [tab, setTab] = useState<AlertTab>("list");
  const alerts = ALERTS;

  const list = alerts.filter((a) => filter === "all" || a.level === filter);
  const cnt = (lv: Level) => alerts.filter((a) => a.level === lv).length;
  const openCnt = alerts.filter((a) => a.status === "待处理").length;
  const closedCnt = alerts.filter((a) => a.status === "已闭环").length;

  return (
    <div style={scrollArea}>
      <Grid cols={4} gap={12}>
        <Metric icon={<AlertTriangle size={15} />} label="严重告警" value={cnt("critical")} unit="条" tone={C.danger} hint="需立即介入，已推送企微" />
        <Metric icon={<Bell size={15} />} label="告警" value={cnt("warning")} unit="条" tone="#b45309" hint="关注趋势，24h 内处理" />
        <Metric icon={<Bell size={15} />} label="提示" value={cnt("info")} unit="条" tone={C.info} hint="仅站内通知" />
        <Metric icon={<CheckCircle2 size={15} />} label="待处理 / 已闭环" value={`${openCnt} / ${closedCnt}`} tone={C.success} hint="闭环率 42.9%，平均处理 46 分钟" />
      </Grid>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
        <Segmented items={TABS} value={tab} onChange={(k) => setTab(k)} />
        <span style={{ fontSize: 12, color: C.faint }}>{TAB_DESC[tab]}</span>
      </div>

      {tab === "list" && (
        <Panel
          title="告警列表"
          desc={`共 ${list.length} 条 · 严重 ${list.filter((a) => a.level === "critical").length} 条、告警 ${list.filter((a) => a.level === "warning").length} 条、提示 ${list.filter((a) => a.level === "info").length} 条`}
          style={{ marginTop: 12 }}
          extra={<Segmented items={LEVEL_TABS} value={filter} onChange={(k) => setFilter(k)} />}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            head={["级别", "告警内容", "来源", "所属产线", "时间"]}
            widths={["9%", "42%", "17%", "16%", "16%"]}
            rows={list.map((a) => {
              const lv = ALERT_LEVEL[a.level];
              return [
                <Tag key="l" tone={lv.tone} soft={lv.soft}>
                  <Shield size={10} style={{ marginRight: 3 }} />
                  {lv.label}
                </Tag>,
                <span key="c" style={{ fontSize: 13 }}>{a.content}</span>,
                <span key="s" style={{ fontSize: 12, color: C.sub }}>{a.source}</span>,
                <span key="p" style={{ fontSize: 12, color: C.sub }}>{a.pipeline}</span>,
                <span key="t" style={{ fontSize: 12, color: C.faint }}>{a.time}</span>,
              ];
            })}
            rowKey={(i) => "alert" + i}
          />
        </Panel>
      )}

      {tab === "rules" && (
        <Panel
          title="多级告警规则引擎"
          desc={`${ALERT_RULES.filter((r) => r.on).length} / ${ALERT_RULES.length} 条规则启用`}
          style={{ marginTop: 12 }}
          extra={
            <Btn size="sm" icon={<Sliders size={12} />}>
              规则配置
            </Btn>
          }
          bodyStyle={{ padding: 0 }}
        >
          <Table
            head={["规则", "类型", "级别", "作用对象", "今日命中", "状态"]}
            widths={["30%", "11%", "11%", "20%", "12%", "16%"]}
            rows={ALERT_RULES.map((r) => {
              const lv = ALERT_LEVEL[r.level];
              return [
                <div key="n">
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{r.id}</div>
                </div>,
                <Tag key="k" tone={r.kind === "阈值类" ? C.info : r.kind === "业务类" ? C.purple : C.teal}>
                  {r.kind}
                </Tag>,
                <Tag key="l" tone={lv.tone} soft={lv.soft}>
                  {lv.label}
                </Tag>,
                <span key="t" style={{ fontSize: 12, color: C.sub }}>{r.target}</span>,
                <span key="h" style={{ fontSize: 12, color: r.hits > 10 ? C.danger : C.text }}>{r.hits} 次</span>,
                <Tag key="s" tone={r.on ? C.success : C.faint} soft={r.on ? C.successSoft : C.borderSoft}>
                  <Dot tone={r.on ? C.success : C.faint} />
                  {r.on ? "已启用" : "已停用"}
                </Tag>,
              ];
            })}
            rowKey={(i) => "rule" + i}
          />
        </Panel>
      )}

      {tab === "trend" && (
        <Panel
          title="告警趋势"
          desc="近 7 天分级告警数量变化"
          style={{ marginTop: 12 }}
          extra={<Tag tone={C.danger} soft={C.dangerSoft}>严重 {cnt("critical")} 条</Tag>}
        >
          <LineChart
            series={[
              { name: "严重", color: C.danger, data: ALERT_TREND.map((d) => d.severe) },
              { name: "告警", color: "#f59e0b", data: ALERT_TREND.map((d) => d.warn) },
              { name: "提示", color: C.info, data: ALERT_TREND.map((d) => d.info) },
            ]}
            labels={ALERT_TREND.map((d) => d.label)}
            height={260}
          />
          <div style={{ display: "flex", gap: 16, marginTop: 10, paddingLeft: 44 }}>
            {[
              { n: "严重", c: C.danger },
              { n: "告警", c: "#f59e0b" },
              { n: "提示", c: C.info },
            ].map((s) => (
              <span key={s.n} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: C.sub }}>
                <Dot tone={s.c} />
                {s.n}
              </span>
            ))}
          </div>
        </Panel>
      )}

      {tab === "channels" && (
        <Panel
          title="通知渠道"
          desc={`${channels.filter((c) => c.on).length} / ${channels.length} 个渠道启用`}
          style={{ marginTop: 12 }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            head={["渠道", "说明", "通知范围", "状态", "操作"]}
            widths={["22%", "36%", "20%", "12%", "10%"]}
            rows={channels.map((ch) => [
              <div key="n" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: ch.on ? C.successSoft : C.bg,
                    color: ch.on ? C.success : C.faint,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {ch.id === "c1" ? <Bell size={12} /> : ch.id === "c2" ? <Smartphone size={12} /> : <Mail size={12} />}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{ch.name}</span>
              </div>,
              <span key="d" style={{ fontSize: 12, color: C.sub }}>{ch.desc}</span>,
              <Tag key="s" tone={C.sub} soft={C.borderSoft}>
                {ch.scope}
              </Tag>,
              <Tag key="st" tone={ch.on ? C.success : C.faint} soft={ch.on ? C.successSoft : C.borderSoft}>
                <Dot tone={ch.on ? C.success : C.faint} />
                {ch.on ? "已启用" : "已停用"}
              </Tag>,
              <span key="a">
                <IconBtn
                  size="sm"
                  tone={ch.on ? "ghost" : "primary"}
                  icon={<Power size={13} />}
                  label={ch.on ? "停用渠道" : "启用渠道"}
                  onClick={() => setChannels((p) => p.map((x) => (x.id === ch.id ? { ...x, on: !x.on } : x)))}
                />
              </span>,
            ])}
            rowKey={(i) => "ch" + i}
          />
        </Panel>
      )}
    </div>
  );
}
