"use client";

import React, { useState } from "react";
import { AlertTriangle, Bell, CheckCircle2, Filter, Mail, Play, Shield, Smartphone } from "lucide-react";
import { C, Metric, Panel, Grid, Table, Tag, Dot, Btn, IconBtn, scrollArea, Segmented, LineChart, ALERT_LEVEL } from "./ui";
import { ALERTS, ALERT_RULES, ALERT_TREND, NOTIFY_CHANNELS } from "./mock";

type Level = "critical" | "warning" | "info";

export default function AlertView() {
  const [alerts, setAlerts] = useState(ALERTS);
  const [filter, setFilter] = useState<"all" | Level>("all");
  const [channels, setChannels] = useState(NOTIFY_CHANNELS);

  const list = alerts.filter((a) => filter === "all" || a.level === filter);
  const cnt = (lv: Level) => alerts.filter((a) => a.level === lv).length;
  const openCnt = alerts.filter((a) => a.status === "待处理").length;
  const closedCnt = alerts.filter((a) => a.status === "已闭环").length;

  const advance = (id: string) =>
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === "待处理" ? "处理中" : "已闭环" } : a)),
    );

  return (
    <div style={scrollArea}>
      <Grid cols={4} gap={12}>
        <Metric icon={<AlertTriangle size={15} />} label="严重告警" value={cnt("critical")} unit="条" tone={C.danger} hint="需立即介入，已推送企微" />
        <Metric icon={<Bell size={15} />} label="告警" value={cnt("warning")} unit="条" tone="#b45309" hint="关注趋势，24h 内处理" />
        <Metric icon={<Bell size={15} />} label="提示" value={cnt("info")} unit="条" tone={C.info} hint="仅站内通知" />
        <Metric icon={<CheckCircle2 size={15} />} label="待处理 / 已闭环" value={`${openCnt} / ${closedCnt}`} tone={C.success} hint="闭环率 42.9%，平均处理 46 分钟" />
      </Grid>

      <Grid cols="minmax(0,1.35fr) minmax(0,1fr)" gap={12} style={{ marginTop: 12 }}>
        <Panel
          title="多级告警规则引擎"
          desc="阈值类 / 业务类 / 代码类三类规则，支持分级与启停"
          extra={<Tag tone={C.primary} soft={C.primarySoft}>{ALERT_RULES.filter((r) => r.on).length} / {ALERT_RULES.length} 条启用</Tag>}
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

        <Panel
          title="告警趋势与通知"
          desc="近 7 天告警分级趋势"
          extra={
            <Segmented
              items={[
                { key: "all", label: "全部" },
                { key: "critical", label: "严重" },
                { key: "warning", label: "告警" },
                { key: "info", label: "提示" },
              ]}
              value={filter}
              onChange={(k) => setFilter(k)}
            />
          }
        >
          <LineChart
            series={[
              { name: "严重", color: C.danger, data: ALERT_TREND.map((d) => d.severe) },
              { name: "告警", color: "#f59e0b", data: ALERT_TREND.map((d) => d.warn) },
              { name: "提示", color: C.info, data: ALERT_TREND.map((d) => d.info) },
            ]}
            labels={ALERT_TREND.map((d) => d.label)}
            height={186}
          />
          <div style={{ display: "flex", gap: 16, marginTop: 8, paddingLeft: 44 }}>
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

          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.borderSoft}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 10 }}>通知渠道</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {channels.map((ch) => (
                <div key={ch.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
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
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: C.text }}>{ch.name}</div>
                    <div style={{ color: C.faint, fontSize: 11 }}>{ch.desc}</div>
                  </div>
                  <Tag tone={C.sub} soft={C.borderSoft}>{ch.scope}</Tag>
                  <button
                    onClick={() => setChannels((p) => p.map((x) => (x.id === ch.id ? { ...x, on: !x.on } : x)))}
                    style={{
                      width: 34,
                      height: 19,
                      borderRadius: 10,
                      border: "none",
                      background: ch.on ? C.primary : C.border,
                      cursor: "pointer",
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 2,
                        left: ch.on ? 17 : 2,
                        width: 15,
                        height: 15,
                        borderRadius: "50%",
                        background: "#fff",
                        transition: "left .2s",
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </Grid>

      <Panel
        title="告警列表与闭环追踪"
        desc="点击操作图标推进状态：待处理 → 处理中 → 已闭环"
        style={{ marginTop: 12 }}
        extra={<Btn size="sm" icon={<Filter size={12} />}>{filter === "all" ? "全部级别" : ALERT_LEVEL[filter].label}</Btn>}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          head={["级别", "告警内容", "来源", "所属产线", "时间", "状态", "操作"]}
          widths={["9%", "34%", "15%", "12%", "9%", "11%", "10%"]}
          rows={list.map((a) => {
            const lv = ALERT_LEVEL[a.level];
            const stTone = a.status === "已闭环" ? C.success : a.status === "处理中" ? C.info : C.danger;
            return [
              <Tag key="l" tone={lv.tone} soft={lv.soft}>
                <Shield size={10} style={{ marginRight: 3 }} />
                {lv.label}
              </Tag>,
              <span key="c" style={{ fontSize: 13 }}>{a.content}</span>,
              <span key="s" style={{ fontSize: 12, color: C.sub }}>{a.source}</span>,
              <span key="p" style={{ fontSize: 12, color: C.sub }}>{a.pipeline}</span>,
              <span key="t" style={{ fontSize: 12, color: C.faint }}>{a.time}</span>,
              <Tag key="st" tone={stTone} soft={`${stTone}12`}>
                <Dot tone={stTone} />
                {a.status}
              </Tag>,
              a.status === "已闭环" ? (
                <span key="a" style={{ fontSize: 12, color: C.faint }}>--</span>
              ) : (
                <IconBtn
                  key="a"
                  size="sm"
                  tone={a.status === "待处理" ? "primary" : "success"}
                  icon={a.status === "待处理" ? <Play size={13} /> : <CheckCircle2 size={13} />}
                  label={a.status === "待处理" ? "开始处理" : "标记闭环"}
                  onClick={() => advance(a.id)}
                />
              ),
            ];
          })}
          rowKey={(i) => "alert" + i}
        />
      </Panel>
    </div>
  );
}
