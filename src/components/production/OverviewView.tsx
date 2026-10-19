"use client";

import React, { useState } from "react";
import { Activity, AlertTriangle, Clock, Cpu, Layers, TrendingUp, Timer } from "lucide-react";
import {
  C,
  Metric,
  Panel,
  Grid,
  Segmented,
  LineChart,
  Donut,
  Legend,
  Columns,
  Table,
  Tag,
  Dot,
  Bar,
  scrollArea,
  PIPE_STATUS,
} from "./ui";
import { KPI, OUTPUT_TREND, CAPACITY_PLAN, PIPELINE_TYPE_DIST, PIPELINES } from "./mock";

export default function OverviewView() {
  const [dim, setDim] = useState<"byBusiness" | "byPipelineType">("byBusiness");
  const trend = dim === "byBusiness" ? OUTPUT_TREND.byBusiness : OUTPUT_TREND.byPipelineType;
  const reachPct = Math.round((CAPACITY_PLAN.monthActual / CAPACITY_PLAN.monthTarget) * 100);

  return (
    <div style={scrollArea}>
      <Grid cols={6} gap={12}>
        <Metric
          icon={<Layers size={15} />}
          label="在行产线"
          value={KPI.runningPipelines}
          unit={`/ ${KPI.totalPipelines} 条`}
          tone={C.primary}
          hint="其中 1 条异常、1 条排队"
        />
        <Metric
          icon={<Clock size={15} />}
          label="待处理任务"
          value={KPI.pendingTasks}
          unit="个"
          tone={C.warn}
          hint="排队 4 个·待执行 43 个"
        />
        <Metric
          icon={<TrendingUp size={15} />}
          label="今日产出量"
          value={KPI.todayOutput}
          unit={KPI.todayOutputUnit}
          tone={C.success}
          delta={{ text: "12.4%", up: true }}
          hint="同比增长，达成日目标 92%"
        />
        <Metric
          icon={<Timer size={15} />}
          label="平均生产周期"
          value={KPI.avgCycle}
          unit={KPI.avgCycleUnit}
          tone={C.info}
          hint="较上周缩短 18 分钟"
        />
        <Metric
          icon={<Cpu size={15} />}
          label="资源利用率"
          value={KPI.resourceUsage}
          unit="%"
          tone={C.purple}
          hint="GPU 63%·CPU 58%·内存 61%"
        />
        <Metric
          icon={<AlertTriangle size={15} />}
          label="告警数"
          value={KPI.alertCount}
          unit="条"
          tone={C.danger}
          hint="严重 2·告警 3·提示 2"
        />
      </Grid>

      <Grid cols="minmax(0,1.55fr) minmax(0,1fr)" gap={12} style={{ marginTop: 12 }}>
        <Panel
          title="产出趋势"
          desc="近 14 天每日数据产出量（万条）"
          extra={
            <Segmented
              items={[
                { key: "byBusiness", label: "按业务线" },
                { key: "byPipelineType", label: "按产线类型" },
              ]}
              value={dim}
              onChange={(k) => setDim(k)}
            />
          }
        >
          <LineChart series={trend} labels={OUTPUT_TREND.labels} height={228} yUnit="万条" />
          <div style={{ display: "flex", gap: 18, marginTop: 10, paddingLeft: 44 }}>
            {trend.map((s) => (
              <span key={s.name} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: C.sub }}>
                <Dot tone={s.color} />
                {s.name}
                <b style={{ color: C.text }}>{s.data[s.data.length - 1]}</b>
              </span>
            ))}
          </div>
        </Panel>

        <Panel title="产能规划" desc="月度目标达成与周度节奏">
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <Donut
              data={[
                { label: "已完成", value: CAPACITY_PLAN.monthActual, color: C.primary },
                { label: "待完成", value: CAPACITY_PLAN.monthTarget - CAPACITY_PLAN.monthActual, color: C.borderSoft },
              ]}
              centerValue={`${reachPct}%`}
              centerLabel="月度达成"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: C.sub, lineHeight: 2 }}>
                <div>
                  月度目标：
                  <b style={{ color: C.text }}>
                    {CAPACITY_PLAN.monthTarget} {CAPACITY_PLAN.unit}
                  </b>
                </div>
                <div>
                  已完成：
                  <b style={{ color: C.text }}>
                    {CAPACITY_PLAN.monthActual} {CAPACITY_PLAN.unit}
                  </b>
                </div>
                <div>
                  剩余天数：<b style={{ color: C.text }}>21 天</b> · 日均需{" "}
                  <b style={{ color: C.text }}>38.9 {CAPACITY_PLAN.unit}</b>
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.sub, marginBottom: 5 }}>
                  <span>当前产能利用</span>
                  <span>{reachPct}%</span>
                </div>
                <Bar pct={reachPct} tone={C.primary} h={7} />
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.borderSoft}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: C.sub }}>近 5 周产出（实际）</span>
              <span style={{ fontSize: 11, color: C.faint }}>目标基准线 150 {CAPACITY_PLAN.unit}/周</span>
            </div>
            <Columns
              data={CAPACITY_PLAN.weekActual.map((v, i) => ({
                label: CAPACITY_PLAN.weekLabels[i],
                value: v,
                tone: v >= 150 ? C.success : C.warn,
              }))}
              height={140}
            />
          </div>
        </Panel>
      </Grid>

      <Grid cols="minmax(0,340px) minmax(0,1fr)" gap={12} style={{ marginTop: 12 }}>
        <Panel title="产线类型分布" desc="共 6 条产线">
          <div style={{ display: "flex", gap: 20, alignItems: "center", justifyContent: "center" }}>
            <Donut data={PIPELINE_TYPE_DIST} centerValue="6" centerLabel="产线总数" size={124} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Legend data={PIPELINE_TYPE_DIST} />
            </div>
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.borderSoft}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
              <span style={{ color: C.sub }}>业务线占比</span>
            </div>
            <Legend
              data={[
                { label: "交通出行", value: 3, color: C.primary },
                { label: "医疗健康", value: 1, color: C.info },
                { label: "自然资源", value: 2, color: C.teal },
              ]}
            />
          </div>
        </Panel>

        <Panel title="产线健康度" desc="实时状态与今日产出" bodyStyle={{ padding: 0 }}>
          <Table
            head={["产线", "类型", "状态", "进度", "今日产出", "周期", "资源占用", "告警"]}
            widths={["26%", "13%", "10%", "14%", "11%", "10%", "10%", "6%"]}
            rows={PIPELINES.map((p) => {
              const st = PIPE_STATUS[p.status];
              return [
                <div key="n">
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>
                    {p.id} · {p.business}
                  </div>
                </div>,
                <span key="t" style={{ fontSize: 12, color: C.sub }}>
                  {p.type}
                </span>,
                <Tag key="s" tone={st.tone} soft={st.soft}>
                  <Dot tone={st.tone} pulse={p.status === "running"} />
                  {st.label}
                </Tag>,
                <div key="p" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Bar pct={p.progress} tone={st.tone} h={5} />
                  <span style={{ fontSize: 11, color: C.sub, width: 30 }}>{p.progress}%</span>
                </div>,
                <span key="o" style={{ fontSize: 12 }}>
                  {p.output ? p.output + " 万" : "--"}
                </span>,
                <span key="c" style={{ fontSize: 12, color: C.sub }}>
                  {p.cycle}
                </span>,
                <span key="u" style={{ fontSize: 12, color: p.usage > 80 ? C.danger : C.sub }}>
                  {p.usage}%
                </span>,
                p.alerts ? (
                  <Tag key="a" tone={C.danger} soft={C.dangerSoft}>
                    {p.alerts}
                  </Tag>
                ) : (
                  <span key="a" style={{ color: C.faint, fontSize: 12 }}>
                    --
                  </span>
                ),
              ];
            })}
          />
        </Panel>
      </Grid>
    </div>
  );
}
