"use client";

import React from "react";
import { ChartBar, Users, TrendingUp, ShieldCheck, RotateCcw, Download } from "lucide-react";
import {
  C,
  Panel,
  Metric,
  Table,
  Tag,
  BarList,
  Grid,
  Btn,
  Donut,
  Legend,
} from "@/components/production/ui";
import { CenterHead, CenterBody } from "@/components/centers/CenterShell";

const REVENUE_TREND = [
  { m: "5 月", v: 86.2 },
  { m: "6 月", v: 94.5 },
  { m: "7 月", v: 102.8 },
  { m: "8 月", v: 110.4 },
  { m: "9 月", v: 116.9 },
  { m: "10 月", v: 128.6 },
];

const REVENUE_MIX = [
  { label: "算力租赁", value: 59.2, color: C.primary },
  { label: "数据服务", value: 36.0, color: C.info },
  { label: "模型服务", value: 23.2, color: C.purple },
  { label: "增值服务", value: 10.2, color: C.warn },
];

const TOP_TENANTS = [
  { label: "智慧交通事业部", value: 38.6, sub: "占 30.0%" },
  { label: "应急管理事业部", value: 26.4, sub: "占 20.5%" },
  { label: "城市治理实验室", value: 22.1, sub: "占 17.2%" },
  { label: "智能制造事业部", value: 18.3, sub: "占 14.2%" },
  { label: "联合创新中心", value: 12.8, sub: "占 10.0%" },
];

const ORDERS = [
  { id: "SO-20261029-041", tenant: "智慧交通事业部", item: "GPU 卡时包（A100）", period: "2026-10", amount: "¥186,400", status: "已结算" },
  { id: "SO-20261029-038", tenant: "应急管理事业部", item: "高质量数据集订阅", period: "2026-10", amount: "¥92,000", status: "已结算" },
  { id: "SO-20261028-112", tenant: "城市治理实验室", item: "模型推理服务（按调用）", period: "2026-10", amount: "¥64,800", status: "待结算" },
  { id: "SO-20261028-076", tenant: "智能制造事业部", item: "标注产能包（专家标注）", period: "2026-10", amount: "¥48,200", status: "待结算" },
  { id: "SO-20261027-019", tenant: "联合创新中心", item: "模型微调服务", period: "2026-09", amount: "¥31,600", status: "已结算" },
];

const STATUS_TONE: Record<string, { tone: string; soft: string }> = {
  已结算: { tone: C.success, soft: C.successSoft },
  待结算: { tone: "#b45309", soft: C.warnSoft },
};

export default function Page() {
  const maxRev = Math.max(...REVENUE_TREND.map((r) => r.v));
  return (
    <>
      <CenterHead
        icon={<ChartBar size={18} />}
        title="运营管理中心"
        sub="租户经营 · 计费账单 · 服务目录 · 运营指标"
        color="#f59e0b"
        right={
          <>
            <Btn tone="ghost" size="sm" icon={<RotateCcw size={13} />}>刷新</Btn>
            <Btn tone="primary" size="sm" icon={<Download size={13} />}>导出月报</Btn>
          </>
        }
      />
      <CenterBody>
        <Grid cols={4}>
          <Metric icon={<TrendingUp size={14} />} label="本月收入" value="¥128.6" unit="万" hint="环比上月 +10.0%" tone={C.warn} delta={{ text: "10.0%", up: true }} />
          <Metric icon={<Users size={14} />} label="活跃租户" value="42" unit="家" hint="本月新增 3 家" tone={C.primary} delta={{ text: "3 家", up: true }} />
          <Metric icon={<ChartBar size={14} />} label="服务调用量" value="3.24" unit="亿次" hint="日均 1,080 万次" tone={C.info} delta={{ text: "8.2%", up: true }} />
          <Metric icon={<ShieldCheck size={14} />} label="SLA 达成率" value="99.92" unit="%" hint="目标 99.90% · 本月无违约" tone={C.success} />
        </Grid>

        <Grid cols="1.6fr 1fr">
          <Panel title="月度收入趋势" desc="近 6 个月平台营业收入（万元）" extra={<Tag tone={C.success} soft={C.successSoft}>连续 6 个月增长</Tag>}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 172, padding: "8px 4px 0" }}>
              {REVENUE_TREND.map((r, i) => {
                const h = (r.v / maxRev) * 132;
                const isLast = i === REVENUE_TREND.length - 1;
                return (
                  <div key={r.m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: isLast ? 700 : 500, color: isLast ? C.text : C.sub }}>{r.v}</span>
                    <div
                      style={{
                        width: "100%",
                        maxWidth: 46,
                        height: h,
                        borderRadius: "5px 5px 0 0",
                        background: isLast ? C.primary : `${C.primary}45`,
                      }}
                    />
                    <span style={{ fontSize: 11, color: C.faint }}>{r.m}</span>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="收入构成" desc="按业务线拆分（万元）">
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Donut data={REVENUE_MIX} size={120} thickness={13} centerValue="128.6" centerLabel="本月合计" />
              <div style={{ flex: 1 }}>
                <Legend data={REVENUE_MIX.map((r) => ({ label: r.label, value: r.value, color: r.color }))} />
              </div>
            </div>
          </Panel>
        </Grid>

        <Grid cols="1fr 1.55fr">
          <Panel title="TOP 租户消费" desc="本月消费金额（万元）">
            <BarList data={TOP_TENANTS} unit=" 万" tone={C.warn} />
          </Panel>

          <Panel title="最近订单" desc="订单与结算状态" bodyStyle={{ padding: 0 }} extra={<Btn tone="plain" size="sm">全部订单</Btn>}>
            <Table
              head={["订单号", "租户", "服务项", "账期", "金额", "状态"]}
              widths={["19%", "20%", "26%", "10%", "14%", "11%"]}
              rows={ORDERS.map((o) => [
                <span key="i" style={{ fontSize: 12, color: C.sub }}>{o.id}</span>,
                <span key="t" style={{ fontSize: 12.5, color: C.text }}>{o.tenant}</span>,
                <span key="it" style={{ fontSize: 12.5, color: C.sub }}>{o.item}</span>,
                <span key="p" style={{ fontSize: 12, color: C.faint }}>{o.period}</span>,
                <span key="a" style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{o.amount}</span>,
                <Tag key="s" tone={STATUS_TONE[o.status].tone} soft={STATUS_TONE[o.status].soft}>{o.status}</Tag>,
              ])}
            />
          </Panel>
        </Grid>
      </CenterBody>
    </>
  );
}
