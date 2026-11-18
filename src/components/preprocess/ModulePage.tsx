"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Plus, Search, Eye, RotateCcw, X, CheckCircle2, Clock,
  AlertCircle, Loader2, Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  C, Panel, Metric, Table, Tag, Btn, IconBtn, Segmented, Grid,
} from "@/components/production/ui";
import { DATASETS } from "@/components/publish/publishData";

export type JobStatus = "已完成" | "运行中" | "排队中" | "失败";

export interface OpItem {
  id: string;
  name: string;
  cat: string;
  modality: string;
  desc: string;
  used: number;
  effect: string;
}

export interface JobItem {
  id: string;
  name: string;
  dataset: string;
  ops: string[];
  input: string;
  output: string;
  status: JobStatus;
  startedAt: string;
  owner: string;
}

export interface ModuleConfig {
  /** localStorage 命名空间，同时用于默认任务编号前缀 */
  key: string;
  title: string;
  subtitle: string;
  accent: string;
  accentDeep: string;
  icon: LucideIcon;
  metrics: { label: string; value: string; unit?: string; hint?: string; tone?: string }[];
  categories: Record<string, { label: string; color: string; bg: string }>;
  ops: OpItem[];
  jobs: JobItem[];
  jobLabel: string;
  opLabel: string;
  jobDesc: string;
  opDesc: string;
  newLabel: string;
}

const STATUS: Record<JobStatus, { tone: string; soft: string }> = {
  已完成: { tone: C.success, soft: C.successSoft },
  运行中: { tone: C.primary, soft: C.primarySoft },
  排队中: { tone: C.warn, soft: C.warnSoft },
  失败: { tone: C.danger, soft: C.dangerSoft },
};

const MODALITY_TONE: Record<string, string> = {
  文本: "#2563eb",
  图像: "#7c3aed",
  视频: "#db2777",
  音频: "#d97706",
  点云: "#0d9488",
  时序: "#0891b2",
  多模态: "#4f46e5",
};

/** 详情抽屉里的算子执行明细：确定性推导，不用随机数，避免刷新后跳变 */
function opTrace(job: JobItem, idx: number) {
  const seed = job.id.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0) + idx * 37;
  const sec = 40 + ((seed * 13) % 260);
  const pass = 92 + ((seed * 7) % 80) / 10;
  return {
    sec: sec >= 60 ? `${Math.floor(sec / 60)} 分 ${sec % 60} 秒` : `${sec} 秒`,
    pass: `${pass.toFixed(1)}%`,
  };
}

export default function ModulePage({ cfg }: { cfg: ModuleConfig }) {
  const [tab, setTab] = useState<"jobs" | "ops">("jobs");
  const [jobs, setJobs] = useState<JobItem[]>(cfg.jobs);
  const [kw, setKw] = useState("");
  const [statusFilter, setStatusFilter] = useState<"全部" | JobStatus>("全部");
  const [detail, setDetail] = useState<JobItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftDataset, setDraftDataset] = useState("");
  const [draftOps, setDraftOps] = useState<string[]>([]);

  // 新建的任务落到本地，刷新不丢（首帧仍用配置数据，不会有 hydration mismatch）
  const storeKey = `taskforge_pp_${cfg.key}`;
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storeKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as JobItem[];
      if (Array.isArray(saved) && saved.length) setJobs((prev) => [...saved, ...prev]);
    } catch {
      /* 忽略损坏的本地数据 */
    }
  }, [storeKey]);

  const filtered = useMemo(() => {
    const k = kw.trim();
    return jobs.filter((j) => {
      if (statusFilter !== "全部" && j.status !== statusFilter) return false;
      if (!k) return true;
      return (
        j.name.includes(k) || j.dataset.includes(k) ||
        j.ops.some((o) => o.includes(k)) || j.id.includes(k)
      );
    });
  }, [jobs, kw, statusFilter]);

  const opsFiltered = useMemo(() => {
    const k = kw.trim();
    if (!k) return cfg.ops;
    return cfg.ops.filter((o) => o.name.includes(k) || o.desc.includes(k) || o.modality.includes(k));
  }, [cfg.ops, kw]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { 全部: jobs.length };
    jobs.forEach((j) => { m[j.status] = (m[j.status] || 0) + 1; });
    return m;
  }, [jobs]);

  const openCreate = () => {
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    setDraftName(`${cfg.jobLabel}-${stamp}`);
    setDraftDataset(DATASETS[0]?.name || "");
    setDraftOps([]);
    setCreating(true);
  };

  const submit = () => {
    if (!draftName.trim()) return toast.error("请填写任务名称");
    if (!draftDataset) return toast.error("请选择目标数据集");
    if (!draftOps.length) return toast.error("至少选择一个处理算子");
    const ds = DATASETS.find((x) => x.name === draftDataset);
    const job: JobItem = {
      id: `${cfg.key.toUpperCase()}-${String(Date.now()).slice(-5)}`,
      name: draftName.trim(),
      dataset: draftDataset,
      ops: draftOps,
      input: ds?.fileCount || ds?.scale || "—",
      output: "计算中",
      status: "排队中",
      startedAt: new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-"),
      owner: "admin",
    };
    const next = [job, ...jobs];
    setJobs(next);
    try {
      // 只持久化「页面内新建」的任务，配置里的种子任务不落库
      localStorage.setItem(storeKey, JSON.stringify(next.filter((j) => j.output === "计算中")));
    } catch {
      /* 存储不可用时静默降级 */
    }
    setCreating(false);
    setTab("jobs");
    toast.success(`任务「${job.name}」已提交，${draftOps.length} 个算子进入队列`);
  };

  const Icon = cfg.icon;
  const gradient = `linear-gradient(135deg, ${cfg.accent}, ${cfg.accentDeep})`;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "18px 24px 32px" }}>
      {/* 页头 */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 11, flexShrink: 0,
          background: gradient, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={20} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 19, fontWeight: 700, color: C.text, margin: 0 }}>{cfg.title}</h1>
          <p style={{ fontSize: 12, color: C.faint, margin: "3px 0 0" }}>{cfg.subtitle}</p>
        </div>
        <Btn tone="primary" icon={<Plus size={14} />} onClick={openCreate}>{cfg.newLabel}</Btn>
      </div>

      {/* 指标卡 */}
      <Grid cols={4} style={{ marginBottom: 14 }}>
        {cfg.metrics.map((m) => (
          <Metric key={m.label} label={m.label} value={m.value} unit={m.unit} hint={m.hint} tone={m.tone || cfg.accent} />
        ))}
      </Grid>

      {/* 视图切换 + 检索 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <Segmented<"jobs" | "ops">
          items={[{ key: "jobs", label: `${cfg.jobLabel} ${jobs.length}` }, { key: "ops", label: `${cfg.opLabel} ${cfg.ops.length}` }]}
          value={tab}
          onChange={setTab}
        />
        <div style={{ position: "relative", marginLeft: "auto", width: 280 }}>
          <Search size={14} color={C.faint} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder={tab === "jobs" ? "搜索任务、数据集、算子" : "搜索算子、适用模态"}
            style={{
              width: "100%", padding: "7px 10px 7px 30px", borderRadius: 7,
              border: `1px solid ${C.border}`, fontSize: 12, color: C.text, outline: "none", background: "#fff",
            }}
          />
        </div>
        {tab === "jobs" && (
          <div style={{ display: "flex", gap: 4 }}>
            {(["全部", "已完成", "运行中", "排队中"] as const).map((s) => {
              const on = statusFilter === s;
              return (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11.5,
                  border: `1px solid ${on ? cfg.accent : C.border}`,
                  background: on ? `${cfg.accent}12` : "#fff",
                  color: on ? cfg.accent : C.sub, fontWeight: on ? 600 : 400,
                }}>
                  {s}{counts[s] ? ` ${counts[s]}` : ""}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 任务列表 */}
      {tab === "jobs" && (
        <Panel title={cfg.jobDesc} desc={`共 ${filtered.length} 个任务`} bodyStyle={{ padding: 0 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: C.faint, fontSize: 12.5 }}>
              没有符合条件的任务，换个关键词或状态再试
            </div>
          ) : (
            <Table
              head={["任务", "目标数据集", "处理算子", "输入量", "输出量", "状态", "开始时间", "操作"]}
              widths={["210px", "170px", "1fr", "100px", "150px", "82px", "128px", "72px"]}
              rowKey={(i) => filtered[i].id}
              rows={filtered.map((j) => [
                <div key="n">
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{j.name}</div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 2, fontFamily: "ui-monospace, Menlo, Consolas, monospace" }}>{j.id}</div>
                </div>,
                <span key="d" style={{ fontSize: 12, color: C.sub }}>{j.dataset}</span>,
                <div key="o" style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {j.ops.slice(0, 2).map((o) => (
                    <span key={o} style={{
                      fontSize: 10.5, padding: "1px 6px", borderRadius: 4,
                      background: `${cfg.accent}12`, color: cfg.accent,
                    }}>{o}</span>
                  ))}
                  {j.ops.length > 2 && <span style={{ fontSize: 10.5, color: C.faint }}>+{j.ops.length - 2}</span>}
                </div>,
                <span key="i" style={{ fontSize: 12, color: C.sub }}>{j.input}</span>,
                <span key="out" style={{ fontSize: 12, color: j.output === "计算中" ? C.faint : C.text }}>{j.output}</span>,
                <Tag key="s" tone={STATUS[j.status].tone} soft={STATUS[j.status].soft}>{j.status}</Tag>,
                <span key="t" style={{ fontSize: 11.5, color: C.sub, whiteSpace: "nowrap" }}>{j.startedAt}</span>,
                <div key="a" style={{ display: "flex", gap: 4 }}>
                  <IconBtn size="sm" tone="primary" icon={<Eye size={13} />} label="查看执行明细" onClick={() => setDetail(j)} />
                  <IconBtn
                    size="sm" icon={<RotateCcw size={13} />} label="按原配置重跑"
                    onClick={() => toast.success(`已按原算子配置重跑「${j.name}」`)}
                  />
                </div>,
              ])}
            />
          )}
        </Panel>
      )}

      {/* 算子库 */}
      {tab === "ops" && (
        <Panel title={cfg.opLabel} desc={cfg.opDesc} bodyStyle={{ padding: 0 }}>
          <Table
            head={["算子", "类别", "适用模态", "说明", "使用次数", "平均效果"]}
            widths={["168px", "96px", "88px", "1fr", "76px", "96px"]}
            rowKey={(i) => opsFiltered[i].id}
            rows={opsFiltered.map((o) => {
              const cat = cfg.categories[o.cat];
              return [
                <span key="n" style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{o.name}</span>,
                <span key="c" style={{
                  fontSize: 10.5, padding: "2px 7px", borderRadius: 4,
                  background: cat?.bg || "#f1f5f9", color: cat?.color || C.sub, fontWeight: 500,
                }}>{cat?.label || o.cat}</span>,
                <span key="m" style={{ fontSize: 11.5, color: MODALITY_TONE[o.modality] || C.sub }}>{o.modality}</span>,
                <span key="d" style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.6 }}>{o.desc}</span>,
                <span key="u" style={{ fontSize: 11.5, color: C.sub }}>{o.used} 次</span>,
                <span key="e" style={{ fontSize: 11.5, color: C.text }}>{o.effect}</span>,
              ];
            })}
          />
        </Panel>
      )}

      {/* 执行明细抽屉 */}
      {detail && (
        <div
          onClick={() => setDetail(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.32)", zIndex: 900, display: "flex", justifyContent: "flex-end" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: 520, maxWidth: "92vw", height: "100%", background: "#fff", padding: "18px 20px", overflowY: "auto", boxShadow: "-8px 0 28px rgba(0,0,0,0.12)" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{detail.name}</div>
                <div style={{ fontSize: 11.5, color: C.faint, marginTop: 3 }}>{detail.id} · {detail.dataset}</div>
              </div>
              <IconBtn size="sm" icon={<X size={14} />} label="关闭" onClick={() => setDetail(null)} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { k: "状态", v: detail.status },
                { k: "提交人", v: detail.owner },
                { k: "输入量", v: detail.input },
                { k: "输出量", v: detail.output },
                { k: "开始时间", v: detail.startedAt },
                { k: "算子数", v: `${detail.ops.length} 个` },
              ].map((x) => (
                <div key={x.k} style={{ background: C.bg, borderRadius: 8, padding: "9px 11px" }}>
                  <div style={{ fontSize: 10.5, color: C.faint, marginBottom: 3 }}>{x.k}</div>
                  <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{x.v}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text, marginBottom: 8 }}>算子执行明细</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {detail.ops.map((name, i) => {
                const t = opTrace(detail, i);
                const done = detail.status === "已完成";
                return (
                  <div key={name} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 11px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: C.faint, fontFamily: "ui-monospace, Menlo, Consolas, monospace" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span style={{ fontSize: 12.5, color: C.text, fontWeight: 500 }}>{name}</span>
                      <span style={{ marginLeft: "auto" }}>
                        {done ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: C.success }}>
                            <CheckCircle2 size={12} />通过率 {t.pass}
                          </span>
                        ) : detail.status === "失败" && i === detail.ops.length - 1 ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: C.danger }}>
                            <AlertCircle size={12} />执行失败
                          </span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: C.primary }}>
                            <Loader2 size={12} />运行中
                          </span>
                        )}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 11, color: C.faint }}>
                      <Clock size={11} />耗时 {done ? t.sec : "—"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 14, padding: "9px 11px", background: `${cfg.accent}10`, borderRadius: 8, fontSize: 11.5, color: C.sub, lineHeight: 1.75 }}>
              执行明细按算子串行顺序记录，每一步的输入是上一步的输出；产出物已登记到数据集版本，可在数据集管理中查看血缘。
            </div>
          </div>
        </div>
      )}

      {/* 新建任务弹窗 */}
      {creating && (
        <div
          onClick={() => setCreating(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.36)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: 580, maxWidth: "94vw", background: "#fff", borderRadius: 12, padding: "18px 20px", boxShadow: "0 16px 48px rgba(0,0,0,0.18)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Layers size={16} color={cfg.accent} />
              <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{cfg.newLabel}</span>
              <span style={{ marginLeft: "auto" }}>
                <IconBtn size="sm" icon={<X size={14} />} label="关闭" onClick={() => setCreating(false)} />
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: C.faint, marginBottom: 14 }}>
              选择目标数据集与处理算子，提交后进入生产队列，产出物写回数据集新版本
            </div>

            <div style={{ fontSize: 11.5, color: C.sub, marginBottom: 5 }}>任务名称</div>
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              style={{ width: "100%", padding: "8px 11px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 12.5, marginBottom: 12, outline: "none" }}
            />

            <div style={{ fontSize: 11.5, color: C.sub, marginBottom: 5 }}>目标数据集</div>
            <select
              value={draftDataset}
              onChange={(e) => setDraftDataset(e.target.value)}
              style={{ width: "100%", padding: "8px 11px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 12.5, marginBottom: 12, background: "#fff", color: C.text }}
            >
              {DATASETS.map((d) => (
                <option key={d.id} value={d.name}>{d.name}（{d.dataType} · {d.scale}）</option>
              ))}
            </select>

            <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 11.5, color: C.sub }}>处理算子</span>
              <span style={{ marginLeft: 8, fontSize: 11, color: C.faint }}>已选 {draftOps.length} 个，按选择顺序串行执行</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 168, overflowY: "auto", padding: 2 }}>
              {cfg.ops.map((o) => {
                const on = draftOps.includes(o.name);
                return (
                  <button
                    key={o.id}
                    onClick={() => setDraftOps((prev) => (on ? prev.filter((x) => x !== o.name) : [...prev, o.name]))}
                    style={{
                      padding: "4px 9px", borderRadius: 6, cursor: "pointer", fontSize: 11.5,
                      border: `1px solid ${on ? cfg.accent : C.border}`,
                      background: on ? `${cfg.accent}12` : "#fff",
                      color: on ? cfg.accent : C.sub, fontWeight: on ? 600 : 400,
                    }}
                  >{o.name}</button>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
              <Btn onClick={() => setCreating(false)}>取消</Btn>
              <Btn tone="primary" onClick={submit}>提交任务</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
