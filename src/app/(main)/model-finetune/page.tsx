"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Sparkles, Plus, Eye, ArrowLeft, Download, Search, RotateCcw, Layers,
  TrendingUp, Target, Clock, FileCheck2, Database, CheckCircle2, Trash2,
  BookOpen, ArrowRight, AlertTriangle, Wand2, Gauge,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  C, Panel, Metric, Table, Tag, Btn, IconBtn, Bar, Grid, Columns, Spark,
} from "@/components/production/ui";
import {
  FINETUNE_EXPS, EXP_DATASETS, BASE_MODELS, FINETUNE_METHODS, FINETUNE_TASKS, WHAT_TO_EVAL,
  MIX_COMPARE, expDataset, avg, finetuneGain, mixLabel, type FinetuneExp,
} from "@/components/model-exp/expData";
import {
  ExpHeader, Tabs, StatusTag, Field, Sel, NumInput, TextInput, Chips, SectionTitle, Empty,
} from "@/components/model-exp/ui";

type TabKey = "list" | "mix" | "new";

const pct = (v: number, d = 1) => `${v.toFixed(d)}%`;
const signed = (v: number, d = 1) => `${v >= 0 ? "+" : ""}${v.toFixed(d)}`;
const gainTone = (v: number) => (v >= 10 ? C.success : v >= 5 ? C.info : v > 0 ? C.warn : C.danger);
const forgetTone = (v: number) => (v <= 1 ? C.success : v <= 2 ? C.warn : C.danger);

// ================================================================
// 列表
// ================================================================
function FinetuneList({
  exps, onOpen, onStop,
}: {
  exps: FinetuneExp[];
  onOpen: (id: string) => void;
  onStop: (id: string) => void;
}) {
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("");
  const [kw, setKw] = useState("");

  const rows = useMemo(
    () =>
      exps.filter(
        (e) =>
          (!status || e.status === status) &&
          (!method || e.method === method) &&
          (!kw || e.name.includes(kw) || e.baseModel.includes(kw) || e.id.includes(kw))
      ),
    [exps, status, method, kw]
  );

  return (
    <Panel
      title="微调评估试验"
      desc="面向大模型微调场景，验证数据集在大模型适配场景下的效果"
      extra={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sel value={status} onChange={setStatus} options={["运行中", "已完成", "排队中", "已终止"]} placeholder="全部状态" />
          <Sel value={method} onChange={setMethod} options={[...FINETUNE_METHODS]} placeholder="全部微调方式" />
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: C.faint }} />
            <input
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              placeholder="搜索试验 / 基础模型"
              style={{
                width: 190, height: 34, paddingLeft: 28, paddingRight: 10, fontSize: 12.5,
                border: `1px solid ${C.border}`, borderRadius: 6, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      }
      bodyStyle={{ padding: 0 }}
    >
      <Table
        head={["试验", "基础模型 / 微调方式", "数据配方", "状态", "下游任务提升", "通用能力回落", "领域知识注入", "开始时间", "操作"]}
        widths={["206px", "176px", "224px", "86px", "110px", "112px", "112px", "118px", "86px"]}
        rowKey={(i) => rows[i].id}
        rows={rows.map((e) => {
          const gain = finetuneGain(e);
          const domainGain = avg(e.domain.map((d) => d.after - d.before));
          return [
            <div key="n">
              <div style={{ fontSize: 12.5, fontWeight: 500, color: C.text, lineHeight: 1.45 }}>{e.name}</div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{e.id} · {e.gpu}</div>
            </div>,
            <div key="m">
              <div style={{ fontSize: 12.5, color: C.text }}>{e.baseModel}</div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{e.method} · {e.duration}</div>
            </div>,
            <div key="mix">
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
                {e.mix.map((m) => (
                  <Tag key={m.datasetId} tone={C.primary}>{m.ratio}%</Tag>
                ))}
              </div>
              <div style={{ fontSize: 11, color: C.faint, lineHeight: 1.5 }}>
                {e.mix.map((m) => expDataset(m.datasetId)?.name).join(" / ")}
              </div>
            </div>,
            <div key="s">
              <StatusTag status={e.status} />
              {e.status === "运行中" && (
                <div style={{ marginTop: 5, width: 62 }}><Bar pct={e.progress} tone={C.info} h={4} /></div>
              )}
            </div>,
            <div key="g">
              {e.status === "已完成" ? (
                <>
                  <div style={{ fontSize: 15, fontWeight: 700, color: gainTone(gain), lineHeight: 1.1 }}>{signed(gain)}pt</div>
                  <div style={{ fontSize: 10.5, color: C.faint, marginTop: 2 }}>下游任务均值</div>
                </>
              ) : (
                <span style={{ color: C.faint }}>--</span>
              )}
            </div>,
            <div key="f" style={{ fontSize: 12 }}>
              {e.status === "已完成" ? (
                <Tag tone={forgetTone(e.forget)}>{e.forget.toFixed(1)}pt</Tag>
              ) : (
                <span style={{ color: C.faint }}>--</span>
              )}
            </div>,
            <div key="d" style={{ fontSize: 12 }}>
              {e.status === "已完成" ? (
                <span style={{ color: C.text, fontWeight: 600 }}>{signed(domainGain)}pt</span>
              ) : (
                <span style={{ color: C.faint }}>--</span>
              )}
            </div>,
            <div key="t" style={{ fontSize: 11.5, color: C.sub, whiteSpace: "nowrap" }}>{e.startedAt}</div>,
            <div key="a" style={{ display: "flex", gap: 5 }}>
              <IconBtn size="sm" tone="primary" icon={<Eye size={13} />} label="查看评估报告" onClick={() => onOpen(e.id)} />
              {e.status === "运行中" && (
                <IconBtn size="sm" tone="danger" icon={<Trash2 size={13} />} label="终止试验" onClick={() => onStop(e.id)} />
              )}
            </div>,
          ];
        })}
      />
      {rows.length === 0 && <Empty text="没有符合条件的微调试验" />}
    </Panel>
  );
}

// ================================================================
// 数据配比对比
// ================================================================
function MixCompare() {
  const best = [...MIX_COMPARE.rows].sort((a, b) => b.score - a.score)[0];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Panel
        title="数据配比对照实验"
        desc={`基础模型 ${MIX_COMPARE.baseModel} · 评测集：${MIX_COMPARE.evalSet}`}
        extra={<Tag tone={C.primary}>3 组配方</Tag>}
      >
        <Table
          head={["配方（领域 : 通用）", "试验", "领域数据占比", "下游平均提升", "最佳单项", "通用能力回落", "综合得分", "训练时长", "结论"]}
          widths={["140px", "116px", "112px", "112px", "150px", "112px", "96px", "88px", "84px"]}
          rowKey={(i) => MIX_COMPARE.rows[i].id}
          rows={MIX_COMPARE.rows.map((r) => [
            <span key="m" style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.mix}</span>,
            <span key="i" style={{ fontSize: 12, color: C.sub }}>{r.id}</span>,
            <div key="r">
              <div style={{ fontSize: 11.5, color: C.text, marginBottom: 4 }}>{r.domainRatio}%</div>
              <Bar pct={r.domainRatio} tone={C.primary} h={4} />
            </div>,
            <span key="g" style={{ fontSize: 13, fontWeight: 600, color: gainTone(r.avgGain) }}>{signed(r.avgGain)}pt</span>,
            <span key="b" style={{ fontSize: 12, color: C.text }}>{r.best}</span>,
            <Tag key="f" tone={forgetTone(r.forget)}>{r.forget.toFixed(1)}pt</Tag>,
            <div key="s" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: r.id === best.id ? C.success : C.text }}>{r.score}</span>
              {r.id === best.id && <Tag tone={C.success}>最优</Tag>}
            </div>,
            <span key="c" style={{ fontSize: 12, color: C.sub }}>{r.cost}</span>,
            <IconBtn key="a" size="sm" icon={<Eye size={13} />} label="查看该配方详情" onClick={() => toast(`配方 ${r.mix}：综合得分 ${r.score}`)} />,
          ])}
        />
      </Panel>

      <Grid cols="1.3fr 1fr">
        <Panel title="综合得分对比" desc="结合下游提升与通用能力回落加权计算">
          <Columns
            data={MIX_COMPARE.rows.map((r) => ({
              label: r.mix,
              value: r.score,
              tone: r.id === best.id ? C.success : C.primary,
            }))}
            height={186}
          />
        </Panel>
        <Panel title="配比结论" extra={<Btn size="sm" tone="success" icon={<CheckCircle2 size={13} />} onClick={() => toast.success("已设为医疗场景推荐配方模板")}>设为推荐配方</Btn>}>
          <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.9 }}>{MIX_COMPARE.conclusion}</div>
          <div style={{ marginTop: 12, padding: "10px 12px", background: C.successSoft, borderRadius: 6, fontSize: 12, color: "#166534", lineHeight: 1.8 }}>
            推荐配方：<strong>{best.mix}</strong>（领域数据 {best.domainRatio}%），下游平均提升 {signed(best.avgGain)}pt，通用能力回落 {best.forget.toFixed(1)}pt。
          </div>
        </Panel>
      </Grid>
    </div>
  );
}

// ================================================================
// 新建微调评估
// ================================================================
function FinetuneCreate({
  onDone, onCancel,
}: {
  onDone: (e: FinetuneExp) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [baseModel, setBaseModel] = useState("");
  const [method, setMethod] = useState<string>("LoRA");
  const [mix, setMix] = useState<{ datasetId: string; ratio: number }[]>([
    { datasetId: "DS-2026-109", ratio: 60 },
    { datasetId: "DS-2026-104", ratio: 40 },
  ]);
  const [tasks, setTasks] = useState<string[]>(["医疗问答准确率", "通用指令跟随"]);
  const [evalWhat, setEvalWhat] = useState<string[]>(["下游任务准确率", "领域术语命中率"]);
  const [epochs, setEpochs] = useState(3);
  const [lr, setLr] = useState("2e-4");

  const total = mix.reduce((s, m) => s + m.ratio, 0) || 1;

  const update = (i: number, key: "datasetId" | "ratio", v: any) =>
    setMix((prev) => prev.map((m, j) => (j === i ? { ...m, [key]: v } : m)));

  const submit = () => {
    const miss: string[] = [];
    if (!name.trim()) miss.push("试验名称");
    if (!baseModel) miss.push("基础模型");
    if (!mix.length) miss.push("数据配方");
    if (!tasks.length) miss.push("下游任务");
    if (miss.length) {
      toast.error(`请完善：${miss.join("、")}`);
      return;
    }
    const id = `FT-2026-${String(9 + FINETUNE_EXPS.length).padStart(3, "0")}`;
    onDone({
      id,
      name: name.trim(),
      baseModel,
      method: method as FinetuneExp["method"],
      mix: mix.map((m) => ({ ...m })),
      status: "运行中",
      progress: 3,
      gpu: "4 × A100 80G",
      startedAt: "刚刚",
      duration: "0m",
      tasks: [],
      domain: [],
      forget: 0,
      loss: [],
      conclusion: "试验已提交，平台正在按配方构建训练集并配置微调环境。",
      feedback: [],
    });
  };

  return (
    <Panel
      title="新建微调评估"
      desc="选定基础模型与数据配方，平台自动完成配比采样、微调训练与下游任务评估"
      extra={<Btn size="sm" onClick={onCancel}>取消</Btn>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Grid cols={3}>
          <Field label="试验名称" required span>
            <TextInput value={name} onChange={setName} placeholder="例如：医疗问答指令微调 · 6:4 配方" />
          </Field>
          <Field label="基础模型" required>
            <Sel value={baseModel} onChange={setBaseModel} options={BASE_MODELS} placeholder="请选择基础模型" />
          </Field>
          <Field label="微调方式" required>
            <Sel value={method} onChange={setMethod} options={[...FINETUNE_METHODS]} />
          </Field>
          <Field label="微调轮次">
            <NumInput value={epochs} onChange={setEpochs} min={1} />
          </Field>
        </Grid>

        <SectionTitle
          step="1"
          title="数据配方"
          desc="多个数据集按比例混合，比例自动归一；配方差异是微调对比实验的核心变量"
          extra={<Tag tone={total === 100 ? C.success : C.warn}>合计 {total}%</Tag>}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {mix.map((m, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 130px 88px 32px", gap: 8, alignItems: "center" }}>
              <Sel
                value={m.datasetId}
                onChange={(v) => update(i, "datasetId", v)}
                options={EXP_DATASETS.map((d) => ({ value: d.id, label: `${d.id} · ${d.name}` }))}
                placeholder="选择数据集"
              />
              <NumInput value={m.ratio} onChange={(v) => update(i, "ratio", v)} min={0} max={100} />
              <div style={{ fontSize: 12, color: C.sub, textAlign: "right" }}>
                归一后 <strong style={{ color: C.text }}>{Math.round((m.ratio / total) * 100)}%</strong>
              </div>
              <IconBtn
                size="sm"
                tone="danger"
                icon={<Trash2 size={13} />}
                label="移除该数据集"
                onClick={() => setMix((prev) => prev.filter((_, j) => j !== i))}
              />
            </div>
          ))}
          <div>
            <Btn size="sm" icon={<Plus size={13} />} onClick={() => setMix((prev) => [...prev, { datasetId: "", ratio: 20 }])}>
              添加数据集
            </Btn>
          </div>
        </div>

        <SectionTitle step="2" title="评估维度" desc="下游任务性能提升 + 领域知识注入效果" />
        <Field label="下游任务" required>
          <Chips options={FINETUNE_TASKS} value={tasks} onChange={setTasks} multi />
        </Field>
        <Field label="评估维度">
          <Chips options={WHAT_TO_EVAL} value={evalWhat} onChange={setEvalWhat} multi />
        </Field>

        <SectionTitle step="3" title="训练参数" desc="LoRA 系默认 r=16 / alpha=32，可按需调整学习率" />
        <Grid cols={3}>
          <Field label="学习率"><TextInput value={lr} onChange={setLr} /></Field>
          <Field label="LoRA Rank">
            <div style={{ display: "flex", alignItems: "center", height: 34, fontSize: 12.5, color: C.sub }}>r=16, alpha=32（默认）</div>
          </Field>
          <Field label="计算资源">
            <div style={{ display: "flex", alignItems: "center", height: 34, fontSize: 12.5, color: C.sub }}>4 × A100 80G（自动分配）</div>
          </Field>
        </Grid>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
          <Btn onClick={onCancel}>取消</Btn>
          <Btn tone="primary" icon={<Wand2 size={13} />} onClick={submit}>提交微调评估</Btn>
        </div>
      </div>
    </Panel>
  );
}

// 正负混合的提升幅度条：宽度按绝对值，颜色按正负（避免负值柱子画不出来）
function GainBars({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(...items.map((i) => Math.abs(i.value)), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {items.map((i) => {
        const neg = i.value < 0;
        const tone = neg ? C.danger : i.value >= 10 ? C.success : C.primary;
        return (
          <div key={i.label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: C.text }}>{i.label}</span>
              <span style={{ color: tone, fontWeight: 600 }}>{signed(i.value)}pt</span>
            </div>
            <div style={{ height: 6, background: C.borderSoft, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${(Math.abs(i.value) / max) * 100}%`, height: "100%", background: tone, borderRadius: 3 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ================================================================
// 详情
// ================================================================
function FinetuneDetail({ exp, onBack }: { exp: FinetuneExp; onBack: () => void }) {
  const gain = finetuneGain(exp);
  const domainGain = avg(exp.domain.map((d) => d.after - d.before));
  const maxTask = Math.max(...exp.tasks.map((t) => Math.max(t.before, t.after)), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Panel bodyStyle={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <IconBtn icon={<ArrowLeft size={15} />} label="返回试验列表" onClick={onBack} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{exp.name}</span>
              <StatusTag status={exp.status} />
              <Tag tone={C.sub}>{exp.id}</Tag>
              <Tag tone={C.primary}>{exp.method}</Tag>
            </div>
            <div style={{ fontSize: 11.5, color: C.faint, marginTop: 4 }}>
              {exp.baseModel} ｜ {exp.gpu} ｜ 开始 {exp.startedAt} ｜ 耗时 {exp.duration}
            </div>
          </div>
          <Btn
            size="sm"
            icon={<Download size={13} />}
            disabled={exp.status !== "已完成"}
            onClick={() => toast.success("微调评估报告（PDF）已开始下载")}
          >
            下载评估报告
          </Btn>
        </div>
      </Panel>

      <Grid cols={4}>
        <Metric icon={<TrendingUp size={15} />} label="下游任务平均提升" value={exp.tasks.length ? `${signed(gain)}pt` : "--"} tone={gainTone(gain)} hint="不含通用能力项" />
        <Metric icon={<BookOpen size={15} />} label="领域知识注入" value={exp.domain.length ? `${signed(domainGain)}pt` : "--"} tone={C.purple} hint="术语命中 / 知识问答均值" />
        <Metric icon={<Gauge size={15} />} label="通用能力回落" value={exp.tasks.length ? `${exp.forget.toFixed(1)}pt` : "--"} tone={forgetTone(exp.forget)} hint="≤2pt 为可接受" />
        <Metric icon={<Clock size={15} />} label="训练耗时" value={exp.duration} tone={C.info} hint={`${exp.method} · ${exp.gpu}`} />
      </Grid>

      <Grid cols="1.15fr 1fr">
        <Panel title="下游任务：微调前 / 微调后" desc="同一评测集，基线为未微调的基础模型">
          {exp.tasks.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {exp.tasks.map((t) => {
                const d = t.after - t.before;
                const generic = t.task.includes("通用");
                return (
                  <div key={t.task}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 12.5, color: C.text, flex: 1 }}>{t.task}</span>
                      <Tag tone={generic ? forgetTone(Math.abs(d)) : gainTone(d)}>{signed(d)}pt</Tag>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10.5, color: C.faint, width: 32 }}>基线</span>
                        <div style={{ flex: 1 }}><Bar pct={(t.before / maxTask) * 100} tone={C.faint} h={6} /></div>
                        <span style={{ fontSize: 11.5, color: C.sub, width: 46, textAlign: "right" }}>{pct(t.before)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10.5, color: C.faint, width: 32 }}>微调后</span>
                        <div style={{ flex: 1 }}><Bar pct={(t.after / maxTask) * 100} tone={generic ? C.warn : C.primary} h={6} /></div>
                        <span style={{ fontSize: 11.5, color: C.text, fontWeight: 600, width: 46, textAlign: "right" }}>{pct(t.after)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty text="评估尚未完成" />
          )}
        </Panel>

        <Panel title="数据配方" desc={mixLabel(exp.mix)}>
          <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", marginBottom: 12 }}>
            {exp.mix.map((m, i) => (
              <div
                key={m.datasetId + i}
                style={{
                  width: `${m.ratio}%`,
                  background: [C.primary, C.teal, C.purple, C.warn][i % 4],
                }}
              />
            ))}
          </div>
          {exp.mix.map((m, i) => {
            const d = expDataset(m.datasetId);
            return (
              <div key={m.datasetId + i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: [C.primary, C.teal, C.purple, C.warn][i % 4], flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: C.text, flex: 1 }}>{d?.name || m.datasetId}</span>
                <span style={{ fontSize: 11.5, color: C.faint }}>{d?.dataType} · {d?.scale}</span>
                <span style={{ fontSize: 12, color: C.text, fontWeight: 600, width: 40, textAlign: "right" }}>{m.ratio}%</span>
              </div>
            );
          })}
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.borderSoft}` }}>
            <div style={{ fontSize: 11.5, color: C.faint, marginBottom: 6 }}>微调 loss 曲线</div>
            {exp.loss.length ? <Spark data={exp.loss} color={C.primary} w={286} h={40} /> : <span style={{ fontSize: 12, color: C.faint }}>训练中</span>}
          </div>
        </Panel>
      </Grid>

      <Grid cols={2}>
        <Panel title="领域知识注入效果" desc="验证数据集在领域适配场景下的知识注入程度">
          {exp.domain.length ? (
            <Table
              head={["指标", "基线", "微调后", "提升", "评测口径"]}
              widths={["136px", "72px", "80px", "68px", "auto"]}
              rowKey={(i) => exp.domain[i].metric}
              rows={exp.domain.map((d) => [
                <span key="m" style={{ fontSize: 12.5, color: C.text }}>{d.metric}</span>,
                <span key="b" style={{ fontSize: 12, color: C.sub }}>{pct(d.before)}</span>,
                <span key="a" style={{ fontSize: 12.5, color: C.text, fontWeight: 600 }}>{pct(d.after)}</span>,
                <Tag key="g" tone={gainTone(d.after - d.before)}>{signed(d.after - d.before)}pt</Tag>,
                <span key="n" style={{ fontSize: 11.5, color: C.faint }}>{d.note}</span>,
              ])}
            />
          ) : (
            <Empty text="评估尚未完成" />
          )}
        </Panel>

        <Panel title="各任务提升幅度" desc="正向提升为蓝/绿，能力回落为红色">
          {exp.tasks.length ? (
            <GainBars
              items={exp.tasks.map((t) => ({ label: t.task, value: +(t.after - t.before).toFixed(1) }))}
            />
          ) : (
            <Empty text="评估尚未完成" />
          )}
          <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.85, marginTop: 12 }}>{exp.conclusion}</div>
        </Panel>
      </Grid>

      <Panel
        title="结果反哺数据生产"
        desc="评估结果回流至数据生产与发布环节，形成数据与模型的协同优化闭环"
        extra={<Tag tone={C.purple}>闭环建议</Tag>}
      >
        {exp.feedback.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {exp.feedback.map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  border: `1px solid ${C.border}`, borderRadius: 6,
                }}
              >
                <Tag tone={C.purple}>{f.target}</Tag>
                <span style={{ flex: 1, fontSize: 12.5, color: C.text, lineHeight: 1.7 }}>{f.text}</span>
                <Link
                  href={f.href}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12,
                    color: C.primary, textDecoration: "none", whiteSpace: "nowrap",
                  }}
                >
                  前往处理 <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="评估完成后自动生成反哺建议" />
        )}
      </Panel>
    </div>
  );
}

// ================================================================
// 主页面
// ================================================================
export default function ModelFinetuneEvalPage() {
  const [exps, setExps] = useState<FinetuneExp[]>(FINETUNE_EXPS);
  const [tab, setTab] = useState<TabKey>("list");
  const [detailId, setDetailId] = useState<string | null>(null);

  const done = exps.filter((e) => e.status === "已完成");
  const running = exps.filter((e) => e.status === "运行中");
  const avgGain = avg(done.map((e) => finetuneGain(e)));
  const avgForget = avg(done.map((e) => e.forget));

  const stop = (id: string) => {
    setExps((prev) => prev.map((e) => (e.id === id ? { ...e, status: "已终止" } : e)));
    toast.success("微调试验已终止");
  };

  const detail = exps.find((e) => e.id === detailId) || null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg }}>
      <ExpHeader
        icon={<Sparkles size={17} color="#fff" />}
        title="模型微调评估"
        subtitle="数据中试中心 · 模型试验 ｜ 面向大模型微调的专项评估，验证数据配方与微调策略"
        gradient="linear-gradient(135deg, #8b5cf6, #6366f1)"
        right={
          <>
            <Btn size="sm" onClick={() => setTab("mix")} icon={<Layers size={13} />}>数据配比对比</Btn>
            <Btn size="sm" tone="primary" icon={<Plus size={13} />} onClick={() => { setDetailId(null); setTab("new"); }}>
              新建微调评估
            </Btn>
          </>
        }
      />

      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        {detail ? (
          <FinetuneDetail exp={detail} onBack={() => setDetailId(null)} />
        ) : (
          <>
            <Grid cols={4} style={{ marginBottom: 12 }}>
              <Metric icon={<Database size={15} />} label="微调评估试验" value={exps.length} unit="个" hint={`已完成 ${done.length} · 运行中 ${running.length}`} />
              <Metric icon={<TrendingUp size={15} />} label="平均下游提升" value={avgGain ? `${signed(avgGain)}pt` : "--"} tone={C.success} hint="不含通用能力项" />
              <Metric icon={<BookOpen size={15} />} label="领域知识注入" value={`${signed(avg(done.map((e) => avg(e.domain.map((d) => d.after - d.before)))))}pt`} tone={C.purple} hint="术语命中 / 知识问答" />
              <Metric icon={<Gauge size={15} />} label="平均能力回落" value={`${avgForget.toFixed(1)}pt`} tone={forgetTone(avgForget)} hint="警戒线 2.0pt" />
            </Grid>

            <Tabs<TabKey>
              value={tab}
              onChange={setTab}
              items={[
                { key: "list", label: "微调试验", icon: <Layers size={13} />, count: exps.length },
                { key: "mix", label: "数据配比对比", icon: <TrendingUp size={13} /> },
                { key: "new", label: "新建微调评估", icon: <Plus size={13} /> },
              ]}
            />

            {tab === "list" && <FinetuneList exps={exps} onOpen={setDetailId} onStop={stop} />}
            {tab === "mix" && <MixCompare />}
            {tab === "new" && (
              <FinetuneCreate
                onCancel={() => setTab("list")}
                onDone={(e) => {
                  setExps((prev) => [e, ...prev]);
                  setTab("list");
                  toast.success(`微调试验「${e.name}」已提交，正在构建训练配方`);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
