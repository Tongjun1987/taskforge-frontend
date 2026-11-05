"use client";

import React from "react";
import { Share2, Server, Bell, Activity, RotateCcw, Settings2 } from "lucide-react";
import {
  C,
  Panel,
  Metric,
  Table,
  Tag,
  Bar,
  Grid,
  Btn,
  Donut,
  Legend,
} from "@/components/production/ui";
import { CenterHead, CenterBody } from "@/components/centers/CenterShell";

const SERVICES = [
  { name: "api-gateway", desc: "统一网关", inst: 3, cpu: 42, mem: 58, qps: "1,240", p99: "86 ms", status: "正常" },
  { name: "taskforge-api", desc: "业务服务", inst: 4, cpu: 62, mem: 71, qps: "860", p99: "142 ms", status: "正常" },
  { name: "pipeline-engine", desc: "产线引擎", inst: 6, cpu: 78, mem: 66, qps: "320", p99: "218 ms", status: "正常" },
  { name: "quality-infer", desc: "质检推理", inst: 2, cpu: 88, mem: 82, qps: "96", p99: "640 ms", status: "繁忙" },
  { name: "model-serving", desc: "模型服务", inst: 4, cpu: 55, mem: 63, qps: "410", p99: "178 ms", status: "正常" },
  { name: "storage-gateway", desc: "存储网关", inst: 2, cpu: 34, mem: 45, qps: "210", p99: "96 ms", status: "正常" },
];

const ALERT_MIX = [
  { label: "严重", value: 2, color: C.danger },
  { label: "警告", value: 5, color: C.warn },
  { label: "提示", value: 14, color: C.info },
];

const ALERTS = [
  { time: "10-30 14:52", level: "严重", target: "quality-infer / 实例 #2", msg: "GPU 显存占用 96%，推理排队超过阈值", state: "处理中" },
  { time: "10-30 13:20", level: "警告", target: "pipeline-engine / 节点 N3", msg: "产线节点持续 15 分钟高负载", state: "已确认" },
  { time: "10-30 11:08", level: "警告", target: "taskforge-api", msg: "P99 延迟 142ms，超过 120ms 基线", state: "已恢复" },
  { time: "10-30 09:31", level: "提示", target: "storage-gateway", msg: "对象存储桶容量达到 80%", state: "待处理" },
  { time: "10-29 22:14", level: "提示", target: "model-serving", msg: "模型权重缓存命中率下降至 71%", state: "已恢复" },
];

const LEVEL_TONE: Record<string, { tone: string; soft: string }> = {
  严重: { tone: C.danger, soft: C.dangerSoft },
  警告: { tone: "#b45309", soft: C.warnSoft },
  提示: { tone: C.info, soft: C.infoSoft },
};

const STATE_TONE: Record<string, { tone: string; soft: string }> = {
  处理中: { tone: C.danger, soft: C.dangerSoft },
  待处理: { tone: "#b45309", soft: C.warnSoft },
  已确认: { tone: C.info, soft: C.infoSoft },
  已恢复: { tone: C.success, soft: C.successSoft },
};

export default function Page() {
  return (
    <>
      <CenterHead
        icon={<Share2 size={18} />}
        title="系统运行中心"
        sub="服务健康 · 集群节点 · 告警值守 · 变更记录"
        color="#10b981"
        right={
          <>
            <Btn tone="ghost" size="sm" icon={<RotateCcw size={13} />}>刷新</Btn>
            <Btn tone="primary" size="sm" icon={<Settings2 size={13} />}>运维配置</Btn>
          </>
        }
      />
      <CenterBody>
        <Grid cols={4}>
          <Metric icon={<Activity size={14} />} label="服务可用性" value="99.96" unit="%" hint="近 30 天 · 目标 99.9%" tone={C.success} />
          <Metric icon={<Server size={14} />} label="在线节点" value="24" unit="/ 24" hint="跨 3 个可用区" tone={C.primary} />
          <Metric icon={<Bell size={14} />} label="今日告警" value="7" unit="条" hint="严重 2 · 警告 5" tone={C.danger} delta={{ text: "3 条", up: true }} />
          <Metric icon={<Activity size={14} />} label="平均响应" value="86" unit="ms" hint="P99 218ms" tone={C.info} delta={{ text: "12ms", up: false }} />
        </Grid>

        <Grid cols="1.7fr 1fr">
          <Panel
            title="服务健康"
            desc="核心服务实例、资源占用与延迟"
            bodyStyle={{ padding: 0 }}
            extra={<Tag tone={C.success} soft={C.successSoft}>6 个服务 · 5 正常</Tag>}
          >
            <Table
              head={["服务", "实例", "CPU", "内存", "QPS", "P99", "状态"]}
              widths={["24%", "8%", "16%", "16%", "10%", "12%", "10%"]}
              rows={SERVICES.map((s) => [
                <div key="n">
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 1 }}>{s.desc}</div>
                </div>,
                <span key="i" style={{ fontSize: 12, color: C.sub }}>{s.inst}</span>,
                <div key="c" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ flex: 1, minWidth: 34 }}>
                    <Bar pct={s.cpu} tone={s.cpu > 80 ? C.danger : s.cpu > 65 ? C.warn : C.success} h={5} />
                  </div>
                  <span style={{ fontSize: 11, color: C.sub, width: 30, textAlign: "right" }}>{s.cpu}%</span>
                </div>,
                <div key="m" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ flex: 1, minWidth: 34 }}>
                    <Bar pct={s.mem} tone={s.mem > 80 ? C.danger : s.mem > 65 ? C.warn : C.info} h={5} />
                  </div>
                  <span style={{ fontSize: 11, color: C.sub, width: 30, textAlign: "right" }}>{s.mem}%</span>
                </div>,
                <span key="q" style={{ fontSize: 12, color: C.text }}>{s.qps}</span>,
                <span key="p" style={{ fontSize: 12, color: C.sub }}>{s.p99}</span>,
                <Tag key="s" tone={s.status === "正常" ? C.success : "#b45309"} soft={s.status === "正常" ? C.successSoft : C.warnSoft}>
                  {s.status}
                </Tag>,
              ])}
            />
          </Panel>

          <Panel title="告警分级" desc="今日告警按级别统计">
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Donut data={ALERT_MIX} size={120} thickness={13} centerValue="21" centerLabel="今日总数" />
              <div style={{ flex: 1 }}>
                <Legend data={ALERT_MIX} />
              </div>
            </div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.borderSoft}` }}>
              <div style={{ fontSize: 12, color: C.sub, marginBottom: 8 }}>近 7 日告警</div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 6, height: 46 }}>
                {[6, 9, 4, 11, 8, 5, 7].map((v, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 10, color: i === 6 ? C.text : C.faint, fontWeight: i === 6 ? 600 : 400 }}>{v}</span>
                    <div style={{ width: 20, height: (v / 11) * 26, borderRadius: "3px 3px 0 0", background: i === 6 ? C.primary : `${C.primary}30` }} />
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </Grid>

        <Panel
          title="最近告警"
          desc="按时间倒序，含处理状态"
          bodyStyle={{ padding: 0 }}
          extra={<Btn tone="plain" size="sm">告警历史</Btn>}
        >
          <Table
            head={["时间", "级别", "告警对象", "告警内容", "状态"]}
            widths={["13%", "8%", "24%", "40%", "10%"]}
            rows={ALERTS.map((a) => [
              <span key="t" style={{ fontSize: 12, color: C.sub }}>{a.time}</span>,
              <Tag key="l" tone={LEVEL_TONE[a.level].tone} soft={LEVEL_TONE[a.level].soft}>{a.level}</Tag>,
              <span key="o" style={{ fontSize: 12.5, color: C.text }}>{a.target}</span>,
              <span key="m" style={{ fontSize: 12.5, color: C.sub }}>{a.msg}</span>,
              <Tag key="s" tone={STATE_TONE[a.state].tone} soft={STATE_TONE[a.state].soft}>{a.state}</Tag>,
            ])}
          />
        </Panel>
      </CenterBody>
    </>
  );
}
