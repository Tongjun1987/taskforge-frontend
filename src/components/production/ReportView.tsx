"use client";

import React from "react";
import { Activity, Cpu, Shield, FileText, Download, Eye, Calendar, Mail, Bell, Plus, Printer } from "lucide-react";
import { C, Metric, Panel, Grid, Table, Tag, Dot, Btn, IconBtn, scrollArea, Kv, ALERT_LEVEL } from "./ui";
import { REPORT_TEMPLATES, REPORTS, REPORT_SCHEDULES } from "./mock";

const TPL_ICON: Record<string, React.ReactNode> = {
  chart: <Activity size={15} />,
  cpu: <Cpu size={15} />,
  shield: <Shield size={15} />,
  coin: <FileText size={15} />,
};

export default function ReportView() {
  return (
    <div style={scrollArea}>
      <Grid cols={4} gap={12}>
        <Metric icon={<FileText size={15} />} label="报表模板" value="4" unit="类" tone={C.primary} hint="生产 / 资源 / 质量 / 成本" />
        <Metric icon={<FileText size={15} />} label="本月已生成" value="18" unit="份" tone={C.success} hint="自动化生成 17 份 · 手动 1 份" />
        <Metric icon={<Calendar size={15} />} label="定时任务" value={REPORT_SCHEDULES.filter((s) => s.on).length} unit="个" tone={C.info} hint="周期生成并推送责任人" />
        <Metric icon={<Mail size={15} />} label="推送成功率" value="98.6" unit="%" tone={C.purple} hint="站内 + 邮件双通道" />
      </Grid>

      <Grid cols={4} gap={12} style={{ marginTop: 12 }}>
        {REPORT_TEMPLATES.map((t) => (
          <Panel key={t.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: `${t.tone}14`,
                  color: t.tone,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {TPL_ICON[t.icon]}
              </span>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{t.name}</div>
            </div>
            <p style={{ fontSize: 12, color: C.sub, lineHeight: 1.7, margin: "10px 0 12px", minHeight: 56 }}>{t.desc}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn size="sm" tone="primary" icon={<Plus size={12} />}>
                生成报表
              </Btn>
              <Btn size="sm" icon={<Eye size={12} />}>
                预览模板
              </Btn>
            </div>
          </Panel>
        ))}
      </Grid>

      <Panel
        title="报表列表"
        desc="在线查看、Excel / PDF 导出"
        style={{ marginTop: 12 }}
        extra={
          <div style={{ display: "flex", gap: 8 }}>
            <Btn size="sm" icon={<Calendar size={12} />}>按周期筛选</Btn>
            <Btn size="sm" tone="primary" icon={<Plus size={12} />}>新建报表</Btn>
          </div>
        }
        bodyStyle={{ padding: 0 }}
      >
        <Table
          head={["报表名称", "类型", "生成周期", "生成时间", "状态", "大小", "操作"]}
          widths={["28%", "15%", "10%", "16%", "10%", "9%", "12%"]}
          rows={REPORTS.map((r) => [
            <span key="n" style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</span>,
            <span key="t" style={{ fontSize: 12, color: C.sub }}>{r.type}</span>,
            <Tag key="p" tone={C.info} soft={C.infoSoft}>{r.period}</Tag>,
            <span key="g" style={{ fontSize: 12, color: C.sub }}>{r.generated}</span>,
            <Tag key="s" tone={r.status === "已生成" ? C.success : "#b45309"} soft={r.status === "已生成" ? C.successSoft : C.warnSoft}>
              <Dot tone={r.status === "已生成" ? C.success : "#f59e0b"} pulse={r.status !== "已生成"} />
              {r.status}
            </Tag>,
            <span key="z" style={{ fontSize: 12, color: C.faint }}>{r.size}</span>,
            <div key="a" style={{ display: "flex", gap: 6 }}>
              <IconBtn size="sm" tone="primary" icon={<Eye size={13} />} label="查看报表" />
              <IconBtn size="sm" tone="ghost" icon={<Download size={13} />} label="导出 Excel" />
            </div>,
          ])}
          rowKey={(i) => "rep" + i}
        />
      </Panel>

      <Grid cols="minmax(0,1.4fr) minmax(0,1fr)" gap={12} style={{ marginTop: 12 }}>
        <Panel
          title="定时生成与推送"
          desc="按周期自动生成并推送至责任人"
          extra={<Btn size="sm" tone="primary" icon={<Plus size={12} />}>新建定时任务</Btn>}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            head={["报表", "周期", "推送渠道", "接收人", "状态"]}
            widths={["24%", "20%", "20%", "22%", "14%"]}
            rows={REPORT_SCHEDULES.map((s) => [
              <span key="r" style={{ fontSize: 13 }}>{s.report}</span>,
              <span key="p" style={{ fontSize: 12, color: C.sub }}>{s.period}</span>,
              <span key="c" style={{ fontSize: 12, color: C.sub }}>{s.channels}</span>,
              <span key="u" style={{ fontSize: 12, color: C.sub }}>{s.receivers}</span>,
              <Tag key="s" tone={s.on ? C.success : C.faint} soft={s.on ? C.successSoft : C.borderSoft}>
                {s.on ? "已启用" : "已停用"}
              </Tag>,
            ])}
            rowKey={(i) => "sch" + i}
          />
        </Panel>

        <Panel title="导出与推送说明" desc="报表能力边界">
          <Kv k="导出格式" v="Excel（.xlsx）/ PDF / CSV" w={76} />
          <Kv k="在线查看" v="支持表格页与趋势图，可按时间筛选" w={76} />
          <Kv k="推送渠道" v="站内消息 / 邮件（企微可扩展）" w={76} />
          <Kv k="保留策略" v="报表文件保留 12 个月，到期自动归档" w={76} />
          <Kv k="成本核算口径" v="算力成本 + 人工成本 + 存储成本" w={76} />
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.borderSoft}`, display: "flex", gap: 8 }}>
            <Btn size="sm" icon={<Download size={12} />}>批量导出本月</Btn>
            <Btn size="sm" icon={<Printer size={12} />}>打印预览</Btn>
            <Btn size="sm" icon={<Bell size={12} />}>测试推送</Btn>
          </div>
        </Panel>
      </Grid>
    </div>
  );
}
