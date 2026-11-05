"use client";

import React from "react";
import { Cpu, Server, Zap, Gauge, RotateCcw, Plus } from "lucide-react";
import {
  C,
  Panel,
  Metric,
  Table,
  Tag,
  Bar,
  BarList,
  Grid,
  Btn,
  Spark,
  Dot,
} from "@/components/production/ui";
import { CenterHead, CenterBody } from "@/components/centers/CenterShell";

const POOLS = [
  { name: "pool-train-01", type: "训练池", card: "A100 80G", nodes: 8, cards: 48, used: 46, util: 95.8, status: "运行中" },
  { name: "pool-infer-01", type: "推理池", card: "H800", nodes: 4, cards: 32, used: 24, util: 75.0, status: "运行中" },
  { name: "pool-tune-01", type: "微调池", card: "RTX 4090", nodes: 12, cards: 48, used: 26, util: 54.2, status: "运行中" },
  { name: "pool-eval-01", type: "评测池", card: "A100 40G", nodes: 2, cards: 8, used: 3, util: 37.5, status: "空闲" },
];

const QUEUE = [
  { id: "Q-2041", task: "交通事件识别 · 全量重训", pri: "高", wait: "12 分钟", cards: 8 },
  { id: "Q-2042", task: "多目标跟踪 · 增量微调", pri: "中", wait: "6 分钟", cards: 4 },
  { id: "Q-2043", task: "视频抽帧转码 · 批次 B-1123", pri: "低", wait: "31 分钟", cards: 2 },
  { id: "Q-2044", task: "数据合成 · 扩散生成", pri: "中", wait: "4 分钟", cards: 4 },
  { id: "Q-2045", task: "模型评估 · benchmark 套件", pri: "低", wait: "52 分钟", cards: 2 },
  { id: "Q-2046", task: "语义分割标注回流", pri: "中", wait: "2 分钟", cards: 8 },
];

const CARD_TYPES = [
  { label: "A100 80G", value: 48, tone: C.primary },
  { label: "RTX 4090", value: 40, tone: C.info },
  { label: "H800", value: 32, tone: C.purple },
  { label: "A100 40G", value: 8, tone: C.warn },
];

const TENANT_QUOTA = [
  { label: "智慧交通事业部", value: 32, sub: "/ 48 卡" },
  { label: "应急管理事业部", value: 18, sub: "/ 24 卡" },
  { label: "城市治理实验室", value: 14, sub: "/ 16 卡" },
  { label: "智能制造事业部", value: 12, sub: "/ 24 卡" },
  { label: "联合创新中心", value: 8, sub: "/ 16 卡" },
];

const UTIL_TREND = [62, 68, 71, 66, 74, 81, 78];

const PRI_TONE: Record<string, { tone: string; soft: string }> = {
  高: { tone: C.danger, soft: C.dangerSoft },
  中: { tone: "#b45309", soft: C.warnSoft },
  低: { tone: C.sub, soft: C.borderSoft },
};

export default function Page() {
  return (
    <>
      <CenterHead
        icon={<Cpu size={18} />}
        title="算力管理中心"
        sub="算力资源池 · 配额与排队 · 卡时计量 · 调度策略"
        color="#0ea5e9"
        right={
          <>
            <Btn tone="ghost" size="sm" icon={<RotateCcw size={13} />}>刷新</Btn>
            <Btn tone="primary" size="sm" icon={<Plus size={13} />}>新增资源池</Btn>
          </>
        }
      />
      <CenterBody>
        <Grid cols={4}>
          <Metric icon={<Server size={14} />} label="加速卡总数" value="128" unit="卡" hint="A100×56 · H800×32 · 4090×40" tone={C.info} />
          <Metric icon={<Cpu size={14} />} label="在用卡数" value="99" unit="卡" hint="占用率 77.3%" tone={C.primary} delta={{ text: "8 卡", up: true }} />
          <Metric icon={<Gauge size={14} />} label="平均利用率" value="78.4" unit="%" hint="近 1 小时滑动均值" tone={C.success} delta={{ text: "3.2pt", up: true }} />
          <Metric icon={<Zap size={14} />} label="本月卡时消耗" value="24,816" unit="卡时" hint="折算费用 ¥186.3 万" tone={C.warn} />
        </Grid>

        <Grid cols="1.55fr 1fr">
          <Panel
            title="算力资源池"
            desc="按池统计卡数、在用量与实时利用率"
            extra={<Tag tone={C.success} soft={C.successSoft}>4 个池 · 正常</Tag>}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              head={["资源池", "类型", "卡型", "节点", "卡数", "在用", "利用率", "状态"]}
              widths={["22%", "12%", "14%", "8%", "8%", "8%", "18%", "10%"]}
              rows={POOLS.map((p) => [
                <span key="n" style={{ fontWeight: 600, color: C.text }}>{p.name}</span>,
                <span key="t" style={{ color: C.sub, fontSize: 12 }}>{p.type}</span>,
                <span key="c" style={{ color: C.sub, fontSize: 12 }}>{p.card}</span>,
                <span key="nd" style={{ color: C.sub }}>{p.nodes}</span>,
                <span key="cd" style={{ color: C.text }}>{p.cards}</span>,
                <span key="u" style={{ color: C.text, fontWeight: 600 }}>{p.used}</span>,
                <div key="ut" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 60 }}>
                    <Bar pct={p.util} tone={p.util > 90 ? C.danger : p.util > 70 ? C.warn : C.success} h={6} />
                  </div>
                  <span style={{ fontSize: 12, color: C.sub, width: 42, textAlign: "right" }}>{p.util}%</span>
                </div>,
                <Tag key="s" tone={p.status === "运行中" ? C.success : C.sub} soft={p.status === "运行中" ? C.successSoft : C.borderSoft}>
                  {p.status}
                </Tag>,
              ])}
            />
          </Panel>

          <Panel title="调度队列" desc="等待分配算力的任务" extra={<Tag tone="#b45309" soft={C.warnSoft}>排队 6</Tag>} bodyStyle={{ padding: "8px 0 0" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {QUEUE.map((q) => (
                <div
                  key={q.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 16px",
                    borderBottom: `1px solid ${C.borderSoft}`,
                  }}
                >
                  <Dot tone={PRI_TONE[q.pri].tone} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {q.task}
                    </div>
                    <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>
                      {q.id} · 已等待 {q.wait}
                    </div>
                  </div>
                  <Tag tone={PRI_TONE[q.pri].tone} soft={PRI_TONE[q.pri].soft}>{q.pri}</Tag>
                  <span style={{ fontSize: 11, color: C.sub, width: 42, textAlign: "right" }}>{q.cards} 卡</span>
                </div>
              ))}
            </div>
          </Panel>
        </Grid>

        <Grid cols="1fr 1fr 1fr">
          <Panel title="卡型分布" desc="按 GPU 型号统计在册卡数">
            <BarList data={CARD_TYPES} unit=" 卡" />
          </Panel>
          <Panel title="租户配额使用" desc="已分配 / 配额上限">
            <BarList data={TENANT_QUOTA} unit=" 卡" tone={C.purple} />
          </Panel>
          <Panel title="近 7 日利用率" desc="集群整体 GPU 平均利用率">
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: C.text, lineHeight: 1 }}>78.4%</div>
                <div style={{ fontSize: 12, color: C.faint, marginTop: 4 }}>较上周 +4.6pt</div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Spark data={UTIL_TREND} color={C.success} w={150} h={44} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: C.faint }}>
              {["23", "24", "25", "26", "27", "28", "29"].map((d) => (
                <span key={d}>10/{d}</span>
              ))}
            </div>
          </Panel>
        </Grid>
      </CenterBody>
    </>
  );
}
