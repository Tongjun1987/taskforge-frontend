"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Boxes,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Cpu,
  GitBranch,
  HardDrive,
  Layers,
  Link2,
  Plus,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { C, Panel, Grid, Btn, Tag, Dot, Kv, scrollArea } from "./ui";
import {
  OP_COMPONENTS,
  PIPELINE_TEMPLATES,
  RULE_STAGES,
  RULE_TEMPLATES,
  TRAFFIC_PIPELINE,
  type PipeNode,
  type PipelineTemplate,
} from "./mock";

const CARD_W = 176;
const CARD_H = 96;
const COL_STEP = 216;
const ROW_STEP = 134;
const PER_ROW = 3;

const DRAFT_KEY = "tf_pipe_draft";
const TPL_KEY = "tf_tpl_custom";
const PENDING_KEY = "tf_pipe_pending";

// 节点分组 -> 规则类别（决定引用规则时的默认分类，仅作默认视角，可跨类别引用）
const GROUP_STAGE: Record<string, string> = {
  数据接入: "filter",
  抽帧与清洗: "proc",
  检测与跟踪: "annot",
  语义识别: "annot",
  数据集构建: "proc",
  质量检验: "qc",
  交付发布: "deliver",
  融合与输出: "deliver",
};

const RULE_MAP: Record<string, (typeof RULE_TEMPLATES)[number]> = RULE_TEMPLATES.reduce(
  (acc, r) => ({ ...acc, [r.id]: r }),
  {} as Record<string, (typeof RULE_TEMPLATES)[number]>
);

type CanvasNode = PipeNode & { x: number; y: number };

function autoLayout(list: PipeNode[]): CanvasNode[] {
  return list.map((n, i) => ({
    ...n,
    x: 24 + (i % PER_ROW) * COL_STEP,
    y: 24 + Math.floor(i / PER_ROW) * ROW_STEP,
  }));
}

function bumpVersion(v: string) {
  const m = v.match(/v(\d+)\.(\d+)/);
  if (!m) return "v1.0";
  return `v${m[1]}.${Number(m[2]) + 1}`;
}

export default function PipelineView({ tab = "editor" }: { tab?: "editor" | "templates" }) {
  const router = useRouter();
  const [nodes, setNodes] = useState<CanvasNode[]>(() => autoLayout(TRAFFIC_PIPELINE.nodes));
  const [name, setName] = useState(TRAFFIC_PIPELINE.name);
  const [version, setVersion] = useState(TRAFFIC_PIPELINE.version);
  const [resource, setResource] = useState(TRAFFIC_PIPELINE.resource);
  const [selected, setSelected] = useState<string>(TRAFFIC_PIPELINE.nodes[3].id);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    数据接入: true,
    抽帧与清洗: true,
    检测与跟踪: true,
    语义识别: true,
    数据集构建: true,
    质量检验: true,
    交付发布: true,
    融合与输出: true,
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // 规则引用弹窗
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerStage, setPickerStage] = useState("annot");
  const [picked, setPicked] = useState<string[]>([]);
  const [pickerQ, setPickerQ] = useState("");

  // 另存为模板 / 资源声明 弹窗
  const [tplOpen, setTplOpen] = useState(false);
  const [tplForm, setTplForm] = useState({ name: "", scene: TRAFFIC_PIPELINE.scene, desc: "" });
  const [resOpen, setResOpen] = useState(false);
  const [templates, setTemplates] = useState<PipelineTemplate[]>(PIPELINE_TEMPLATES);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const toastTimer = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  // 首次挂载读取草稿与自定义模板
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (Array.isArray(d.nodes) && d.nodes.length) {
          setNodes(autoLayout(d.nodes));
          if (d.version) setVersion(d.version);
          if (d.name) setName(d.name);
          if (d.resource) setResource(d.resource);
          if (d.nodes[0]?.id) setSelected(d.nodes[0].id);
        }
      }
      const t = localStorage.getItem(TPL_KEY);
      if (t) {
        const arr = JSON.parse(t);
        if (Array.isArray(arr) && arr.length) setTemplates([...arr, ...PIPELINE_TEMPLATES]);
      }
    } catch {
      /* 忽略损坏的本地缓存 */
    }
  }, []);

  // 从模板库「使用模板」跳回编排时，加载刚写入的草稿
  useEffect(() => {
    if (tab !== "editor") return;
    try {
      if (sessionStorage.getItem(PENDING_KEY) !== "1") return;
      sessionStorage.removeItem(PENDING_KEY);
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (Array.isArray(d.nodes) && d.nodes.length) {
        setNodes(autoLayout(d.nodes));
        setVersion(d.version || version);
        setName(d.name || name);
        if (d.resource) setResource(d.resource);
        setSelected(d.nodes[0].id);
        showToast(`已载入模板「${d.name}」，可直接在此基础上调整`);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const d = dragRef.current;
      const box = canvasRef.current;
      if (!d || !box) return;
      const rect = box.getBoundingClientRect();
      const nx = Math.max(6, Math.min(rect.width - CARD_W - 6, e.clientX - rect.left - d.dx));
      const ny = Math.max(6, Math.min(rect.height - CARD_H - 6, e.clientY - rect.top - d.dy));
      setNodes((prev) => prev.map((n) => (n.id === d.id ? { ...n, x: nx, y: ny } : n)));
    };
    const up = () => {
      dragRef.current = null;
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  const sel = nodes.find((n) => n.id === selected) || null;
  const ruleTotal = nodes.reduce((a, n) => a + n.rules.length, 0);
  const canvasH = Math.max(
    380,
    24 + (Math.ceil(nodes.length / PER_ROW) - 1) * ROW_STEP + CARD_H + 28
  );

  const addNode = (group: string, tone: string, item: { name: string; ops: number; desc: string }) => {
    const id = "n" + Date.now().toString().slice(-6);
    setNodes((prev) =>
      autoLayout([
        ...prev,
        { id, name: item.name, group, tone, ops: item.ops, desc: item.desc, rules: [], res: { gpu: 0, mem: 8, prio: "中" } },
      ])
    );
    setSelected(id);
    showToast(`已添加节点「${item.name}」，可继续引用规则模板`);
  };

  const removeNode = (id: string) => {
    setNodes((prev) => autoLayout(prev.filter((n) => n.id !== id)));
    if (selected === id) setSelected("");
  };

  const updateNode = (id: string, patch: Partial<PipeNode>) =>
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));

  const openPicker = () => {
    if (!sel) return;
    setPickerStage(GROUP_STAGE[sel.group] || "filter");
    setPicked([]);
    setPickerQ("");
    setPickerOpen(true);
  };

  const confirmPick = () => {
    if (!sel || picked.length === 0) {
      setPickerOpen(false);
      return;
    }
    updateNode(sel.id, { rules: Array.from(new Set([...sel.rules, ...picked])) });
    showToast(`已为「${sel.name}」引用 ${picked.length} 条规则模板`);
    setPickerOpen(false);
  };

  const removeRule = (nodeId: string, ruleId: string) =>
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, rules: n.rules.filter((r) => r !== ruleId) } : n))
    );

  const savePipeline = () => {
    const nextV = bumpVersion(version);
    setVersion(nextV);
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ nodes, version: nextV, name, resource }));
    } catch {
      /* ignore */
    }
    setSavedAt(new Date().toTimeString().slice(0, 5));
    showToast(`产线已保存 ${nextV} · ${nodes.length} 个节点 / ${ruleTotal} 条规则引用`);
  };

  const saveTemplate = () => {
    const tplName = tplForm.name.trim() || `${name} 模板`;
    const tpl: PipelineTemplate = {
      id: "pt-c-" + Date.now().toString().slice(-6),
      name: tplName,
      desc: tplForm.desc.trim() || `${nodes.length} 个工序节点，引用 ${ruleTotal} 条规则模板`,
      scene: tplForm.scene.trim() || TRAFFIC_PIPELINE.scene,
      version,
      owner: TRAFFIC_PIPELINE.owner.split(" ")[0],
      updatedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      nodes: nodes.length,
      ruleCount: ruleTotal,
      used: 0,
      tone: "#4f46e5",
      chain: nodes.map((n) => n.name.replace(/城市道路|高质量/g, "").slice(0, 6)),
      nodeList: nodes,
      source: TRAFFIC_PIPELINE.id,
    };
    const next = [tpl, ...templates.filter((t) => t.id.startsWith("pt-c-"))];
    setTemplates([...next, ...PIPELINE_TEMPLATES]);
    try {
      localStorage.setItem(
        TPL_KEY,
        JSON.stringify(next.filter((t) => t.id.startsWith("pt-c-")))
      );
    } catch {
      /* ignore */
    }
    setTplOpen(false);
    setTplForm({ name: "", scene: TRAFFIC_PIPELINE.scene, desc: "" });
    showToast(`已保存为模板「${tplName}」，可在产线模板库中复用`);
  };

  const useTemplate = (t: PipelineTemplate) => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ nodes: t.nodeList, version: t.version, name: t.name, resource })
      );
      sessionStorage.setItem(PENDING_KEY, "1");
    } catch {
      /* ignore */
    }
    router.push("/task-modeling?view=pipeline");
  };

  const stageRules = useMemo(() => {
    const kw = pickerQ.trim();
    return RULE_TEMPLATES.filter(
      (r) =>
        r.stage === pickerStage &&
        (!kw || r.name.includes(kw) || r.id.toLowerCase().includes(kw.toLowerCase()))
    );
  }, [pickerStage, pickerQ]);

  const pickerStageInfo = RULE_STAGES.find((s) => s.key === pickerStage) || RULE_STAGES[0];

  return (
    <div style={{ ...scrollArea, display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
      {/* 顶部：产线标识与操作（模板库页不再重复展示统计与新建入口） */}
      {tab === "editor" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Tag tone={C.primary} soft={C.primarySoft}>
              <GitBranch size={11} /> {TRAFFIC_PIPELINE.id}
            </Tag>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{name}</span>
            <Tag
              tone={version === TRAFFIC_PIPELINE.version ? C.success : C.warn}
              soft={version === TRAFFIC_PIPELINE.version ? C.successSoft : C.warnSoft}
            >
              {version}
            </Tag>
            <span style={{ fontSize: 11, color: C.faint }}>
              {TRAFFIC_PIPELINE.scene} · {nodes.length} 节点 · {ruleTotal} 条规则
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn icon={<Layers size={14} />} onClick={() => setNodes(autoLayout(nodes))}>
              自动布局
            </Btn>
            <Btn
              icon={<Copy size={14} />}
              onClick={() => {
                setTplForm({ name: `${name} 模板`, scene: TRAFFIC_PIPELINE.scene, desc: "" });
                setTplOpen(true);
              }}
            >
              另存为模板
            </Btn>
            <Btn icon={<Save size={14} />} onClick={savePipeline}>
              {savedAt ? `已保存 ${savedAt}` : "保存产线"}
            </Btn>
          </div>
        </div>
      )}

      {tab === "editor" ? (
        <Grid cols="224px minmax(0,1fr) 296px" gap={12} style={{ alignItems: "start" }}>
          {/* 工序组件库 */}
          <Panel title="工序组件库" desc="点击添加到画布" bodyStyle={{ padding: 10 }}>
            <div style={{ maxHeight: 560, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {OP_COMPONENTS.map((g) => {
                const open = openGroups[g.group];
                return (
                  <div key={g.group}>
                    <button
                      onClick={() => setOpenGroups((p) => ({ ...p, [g.group]: !p[g.group] }))}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 4px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.text,
                      }}
                    >
                      {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      <span style={{ width: 6, height: 6, borderRadius: 2, background: g.tone }} />
                      {g.group}
                      <span style={{ marginLeft: "auto", color: C.faint, fontWeight: 400 }}>{g.items.length}</span>
                    </button>
                    {open && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 10, marginTop: 4 }}>
                        {g.items.map((it) => (
                          <button
                            key={it.id}
                            onClick={() => addNode(g.group, g.tone, it)}
                            title={it.desc}
                            style={{
                              textAlign: "left",
                              padding: "7px 9px",
                              border: `1px solid ${C.border}`,
                              borderRadius: 6,
                              background: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            <div style={{ fontSize: 12, color: C.text, display: "flex", alignItems: "center", gap: 5 }}>
                              <Plus size={11} style={{ color: g.tone, flexShrink: 0 }} />
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {it.name}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: C.faint, marginTop: 3, paddingLeft: 16 }}>
                              {it.ops} 算子 · {it.desc}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* 画布 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Panel
              title="可视化编排画布"
              desc={`${TRAFFIC_PIPELINE.scene} · ${TRAFFIC_PIPELINE.dataset}`}
              extra={<span style={{ fontSize: 11, color: C.faint }}>{nodes.length} 个工序节点</span>}
              bodyStyle={{ padding: 0 }}
            >
              <div
                ref={canvasRef}
                style={{
                  position: "relative",
                  height: canvasH,
                  background:
                    "linear-gradient(#f1f5f9 1px, transparent 1px) 0 0 / 24px 24px, linear-gradient(90deg, #f1f5f9 1px, transparent 1px) 0 0 / 24px 24px",
                  backgroundColor: "#fcfdff",
                  overflow: "hidden",
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 8,
                }}
              >
                <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                  {nodes.map((n, i) => {
                    if (i === nodes.length - 1) return null;
                    const a = nodes[i];
                    const b = nodes[i + 1];
                    const x1 = a.x + CARD_W;
                    const y1 = a.y + CARD_H / 2;
                    const x2 = b.x;
                    const y2 = b.y + CARD_H / 2;
                    const mx = (x1 + x2) / 2;
                    return (
                      <path
                        key={a.id + "-" + b.id}
                        d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke="#c7d2fe"
                        strokeWidth="2"
                        markerEnd="url(#arrow)"
                      />
                    );
                  })}
                  <defs>
                    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" fill="#a5b4fc" />
                    </marker>
                  </defs>
                </svg>

                {nodes.map((n, i) => {
                  const on = n.id === selected;
                  return (
                    <div
                      key={n.id}
                      onMouseDown={(e) => {
                        dragRef.current = {
                          id: n.id,
                          dx: e.clientX - (canvasRef.current!.getBoundingClientRect().left + n.x),
                          dy: e.clientY - (canvasRef.current!.getBoundingClientRect().top + n.y),
                        };
                        setSelected(n.id);
                      }}
                      onClick={() => setSelected(n.id)}
                      style={{
                        position: "absolute",
                        left: n.x,
                        top: n.y,
                        width: CARD_W,
                        height: CARD_H,
                        background: "#fff",
                        border: on ? `2px solid ${C.primary}` : `1px solid ${C.border}`,
                        borderRadius: 8,
                        padding: "9px 11px",
                        cursor: "grab",
                        boxShadow: on ? "0 4px 14px rgba(79,70,229,.16)" : "0 1px 3px rgba(15,23,42,.06)",
                        userSelect: "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                        <span
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 5,
                            background: `${n.tone}18`,
                            color: n.tone,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Boxes size={11} />
                        </span>
                        <span style={{ fontSize: 10, color: C.faint }}>第 {i + 1} 步</span>
                        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                          {n.res.gpu > 0 && (
                            <span style={{ fontSize: 9, color: "#7c3aed", background: "#7c3aed14", padding: "1px 4px", borderRadius: 3 }}>
                              GPU x{n.res.gpu}
                            </span>
                          )}
                          <Dot tone={i < 3 ? C.success : C.faint} />
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: C.text,
                          lineHeight: 1.3,
                          height: 31,
                          overflow: "hidden",
                        }}
                      >
                        {n.name}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 3 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ fontSize: 10, color: n.tone, background: `${n.tone}12`, padding: "1px 5px", borderRadius: 3 }}>
                            {n.ops} 算子
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              color: n.rules.length ? C.primary : C.faint,
                              background: n.rules.length ? C.primarySoft : "transparent",
                              padding: "1px 5px",
                              borderRadius: 3,
                            }}
                          >
                            {n.rules.length} 规则
                          </span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNode(n.id);
                          }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: C.faint, padding: 0, display: "flex" }}
                          title="移除节点"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>

            {/* 产线级资源需求声明 */}
            <Panel
              title="资源需求声明"
              desc="装配期声明产线所需资源，运行期由调度器按声明分配，不由产线直接占用"
              extra={<Btn size="sm" icon={<Cpu size={12} />} onClick={() => setResOpen(true)}>编辑声明</Btn>}
              bodyStyle={{ padding: "10px 14px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: 12 }}>
                {[
                  { k: "GPU", v: `${resource.gpu} x ${resource.gpuType}` },
                  { k: "CPU", v: `${resource.cpu} 核` },
                  { k: "内存", v: `${resource.mem} GB` },
                  { k: "资源池", v: resource.pool },
                  { k: "占用模式", v: resource.exclusive ? "独占" : "共享" },
                  { k: "SLA", v: TRAFFIC_PIPELINE.sla },
                ].map((it, idx) => (
                  <span key={it.k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {idx > 0 && <span style={{ color: C.border }}>|</span>}
                    <span style={{ color: C.faint }}>{it.k}</span>
                    <span style={{ color: C.text, fontWeight: 500 }}>{it.v}</span>
                  </span>
                ))}
              </div>
            </Panel>
          </div>

          {/* 节点配置 */}
          <Panel title="节点配置" desc={sel ? sel.name : "未选中节点"} bodyStyle={{ padding: 14 }}>
            {sel ? (
              <div style={{ maxHeight: 640, overflowY: "auto", paddingRight: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: `${sel.tone}18`,
                      color: sel.tone,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Settings size={14} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{sel.name}</div>
                    <div style={{ fontSize: 11, color: C.faint }}>{sel.group}</div>
                  </div>
                </div>
                <Kv k="可用算子" v={`${sel.ops} 个`} w={72} />
                <Kv k="说明" v={sel.desc} w={72} />

                <div style={{ borderTop: `1px solid ${C.borderSoft}`, margin: "12px 0", paddingTop: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
                      已引用规则 <span style={{ color: C.primary }}>{sel.rules.length}</span>
                    </span>
                    <button
                      onClick={openPicker}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "3px 8px",
                        fontSize: 11,
                        borderRadius: 4,
                        border: `1px solid ${C.primary}44`,
                        background: C.primarySoft,
                        color: C.primary,
                        cursor: "pointer",
                      }}
                    >
                      <Link2 size={11} /> 引用规则模板
                    </button>
                  </div>
                  {sel.rules.length === 0 ? (
                    <div
                      style={{
                        fontSize: 11,
                        color: C.faint,
                        padding: "10px 0",
                        textAlign: "center",
                        border: `1px dashed ${C.border}`,
                        borderRadius: 6,
                      }}
                    >
                      尚未引用规则，节点将按默认参数运行
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {sel.rules.map((rid) => {
                        const r = RULE_MAP[rid];
                        if (!r) return null;
                        return (
                          <div
                            key={rid}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 6,
                              padding: "7px 8px",
                              border: `1px solid ${C.borderSoft}`,
                              borderRadius: 6,
                              background: C.bg,
                            }}
                          >
                            <ShieldCheck size={12} style={{ color: C.primary, marginTop: 2, flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.4 }}>{r.name}</div>
                              <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>
                                {r.id} · {r.version} · {r.params.map((p) => `${p.k} ${p.v}`).join(" / ")}
                              </div>
                            </div>
                            <button
                              onClick={() => removeRule(sel.id, rid)}
                              title="取消引用"
                              style={{ background: "none", border: "none", cursor: "pointer", color: C.faint, padding: 0, display: "flex" }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div style={{ borderTop: `1px solid ${C.borderSoft}`, paddingTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>节点资源需求</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: C.sub, marginBottom: 4 }}>GPU 卡数</div>
                      <input
                        type="number"
                        min={0}
                        value={sel.res.gpu}
                        onChange={(e) => updateNode(sel.id, { res: { ...sel.res, gpu: Number(e.target.value) || 0 } })}
                        style={{ width: "100%", padding: "6px 8px", fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6, outline: "none" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: C.sub, marginBottom: 4 }}>内存 GB</div>
                      <input
                        type="number"
                        min={0}
                        value={sel.res.mem}
                        onChange={(e) => updateNode(sel.id, { res: { ...sel.res, mem: Number(e.target.value) || 0 } })}
                        style={{ width: "100%", padding: "6px 8px", fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6, outline: "none" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: C.sub, marginBottom: 4 }}>优先级</div>
                      <select
                        value={sel.res.prio}
                        onChange={(e) => updateNode(sel.id, { res: { ...sel.res, prio: e.target.value as "高" | "中" | "低" } })}
                        style={{ width: "100%", padding: "6px 6px", fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6, outline: "none", background: "#fff" }}
                      >
                        <option value="高">高</option>
                        <option value="中">中</option>
                        <option value="低">低</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${C.borderSoft}`, marginTop: 12, paddingTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>运行参数</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { k: "并发数", v: sel.res.gpu > 0 ? "4" : "8" },
                      { k: "批大小", v: "128" },
                      { k: "超时（s）", v: "600" },
                    ].map((f) => (
                      <div key={f.k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: C.sub, width: 66 }}>{f.k}</span>
                        <input
                          defaultValue={f.v}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: "6px 9px",
                            fontSize: 12,
                            border: `1px solid ${C.border}`,
                            borderRadius: 6,
                            outline: "none",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <Btn tone="primary" icon={<Check size={14} />} onClick={() => showToast(`「${sel.name}」配置已应用（未保存到产线版本）`)}>
                    应用配置
                  </Btn>
                  <Btn icon={<Save size={14} />} onClick={savePipeline}>
                    保存并生效
                  </Btn>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: C.faint, padding: "20px 0", textAlign: "center" }}>
                在画布中选中一个节点后配置算子、规则与资源
              </div>
            )}
          </Panel>
        </Grid>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Grid cols={2} gap={12}>
            {templates.map((t) => {
              const open = previewId === t.id;
              return (
                <Panel key={t.id} style={{ display: "flex", flexDirection: "column" }}>
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
                        flexShrink: 0,
                      }}
                    >
                      <Sparkles size={15} />
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{t.name}</span>
                        <Tag tone={C.primary} soft={C.primarySoft}>
                          {t.version}
                        </Tag>
                      </div>
                      <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>
                        {t.scene} · 来源产线 {t.source}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: C.sub, lineHeight: 1.7, margin: "10px 0 8px" }}>{t.desc}</p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                    {t.chain.map((c, i) => (
                      <span key={c + i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {i > 0 && <ChevronRight size={10} style={{ color: C.faint }} />}
                        <span
                          style={{
                            fontSize: 10,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: C.bg,
                            border: `1px solid ${C.borderSoft}`,
                            color: C.sub,
                          }}
                        >
                          {c}
                        </span>
                      </span>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 14, fontSize: 11, color: C.faint, marginBottom: 10 }}>
                    <span>{t.nodes} 个节点</span>
                    <span>{t.ruleCount} 条规则</span>
                    <span>已复用 {t.used} 次</span>
                    <span style={{ marginLeft: "auto" }}>{t.owner} · {t.updatedAt}</span>
                  </div>

                  {open && (
                    <div
                      style={{
                        marginBottom: 10,
                        padding: "8px 10px",
                        borderRadius: 6,
                        background: C.bg,
                        border: `1px solid ${C.borderSoft}`,
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      {t.nodeList.map((n, i) => (
                        <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.sub }}>
                          <span style={{ width: 16, color: C.faint }}>{i + 1}</span>
                          <span style={{ color: C.text }}>{n.name}</span>
                          <span style={{ color: C.faint }}>{n.ops} 算子</span>
                          <span style={{ marginLeft: "auto", color: n.rules.length ? C.primary : C.faint }}>
                            {n.rules.length} 规则
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                    <Btn size="sm" tone="primary" icon={<Copy size={12} />} onClick={() => useTemplate(t)}>
                      使用模板
                    </Btn>
                    <Btn size="sm" icon={open ? <ChevronDown size={12} /> : <ChevronRight size={12} />} onClick={() => setPreviewId(open ? null : t.id)}>
                      {open ? "收起节点" : "预览节点"}
                    </Btn>
                    <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.faint }}>
                      <HardDrive size={12} /> 规则引用随模板保存
                    </span>
                  </div>
                </Panel>
              );
            })}
          </Grid>

        </div>
      )}

      {/* 规则引用弹窗 */}
      {pickerOpen && sel && (
        <div
          onClick={() => setPickerOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,.42)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 80,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: 760, maxHeight: "80vh", background: "#fff", borderRadius: 10, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", gap: 10 }}>
              <ShieldCheck size={16} style={{ color: C.primary }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>引用规则模板</div>
                <div style={{ fontSize: 11, color: C.faint }}>目标节点：{sel.name} · 当前已引用 {sel.rules.length} 条</div>
              </div>
              <div style={{ marginLeft: "auto", position: "relative" }}>
                <Search size={12} style={{ position: "absolute", left: 8, top: 7, color: C.faint }} />
                <input
                  value={pickerQ}
                  onChange={(e) => setPickerQ(e.target.value)}
                  placeholder="搜索规则"
                  style={{ width: 160, padding: "5px 8px 5px 24px", fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6, outline: "none" }}
                />
              </div>
              <button onClick={() => setPickerOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.faint, display: "flex" }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
              <div style={{ width: 168, borderRight: `1px solid ${C.borderSoft}`, padding: 8, overflowY: "auto" }}>
                {RULE_STAGES.map((s) => {
                  const on = s.key === pickerStage;
                  const n = RULE_TEMPLATES.filter((r) => r.stage === s.key).length;
                  return (
                    <button
                      key={s.key}
                      onClick={() => setPickerStage(s.key)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 9px",
                        borderRadius: 6,
                        border: "none",
                        background: on ? C.primarySoft : "transparent",
                        color: on ? C.primary : C.sub,
                        fontSize: 12,
                        fontWeight: on ? 600 : 400,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: 3, background: s.tone }} />
                      {s.name}
                      <span style={{ marginLeft: "auto", color: C.faint }}>{n}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
                <div style={{ fontSize: 11, color: C.sub, marginBottom: 8 }}>
                  {pickerStageInfo.name} · {pickerStageInfo.desc}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {stageRules.map((r) => {
                    const already = sel.rules.includes(r.id);
                    const checked = picked.includes(r.id) || already;
                    return (
                      <button
                        key={r.id}
                        disabled={already}
                        onClick={() =>
                          setPicked((prev) => (prev.includes(r.id) ? prev.filter((x) => x !== r.id) : [...prev, r.id]))
                        }
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 9,
                          padding: "9px 10px",
                          borderRadius: 7,
                          border: `1px solid ${checked ? C.primary + "55" : C.borderSoft}`,
                          background: already ? C.bg : checked ? C.primarySoft : "#fff",
                          cursor: already ? "default" : "pointer",
                          textAlign: "left",
                          opacity: already ? 0.72 : 1,
                        }}
                      >
                        <span
                          style={{
                            width: 15,
                            height: 15,
                            borderRadius: 4,
                            border: `1px solid ${checked ? C.primary : C.border}`,
                            background: checked ? C.primary : "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: 1,
                          }}
                        >
                          {checked && <Check size={11} style={{ color: "#fff" }} />}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{r.name}</span>
                            <span style={{ fontSize: 10, color: C.faint }}>{r.id}</span>
                            <span style={{ fontSize: 10, color: C.faint }}>{r.version}</span>
                            {already && <span style={{ fontSize: 10, color: C.success }}>已引用</span>}
                          </div>
                          <div style={{ fontSize: 11, color: C.sub, marginTop: 3, lineHeight: 1.5 }}>{r.summary}</div>
                          <div style={{ fontSize: 10, color: C.faint, marginTop: 3 }}>
                            {r.params.map((p) => `${p.k} ${p.v}`).join(" · ")}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {stageRules.length === 0 && (
                    <div style={{ padding: "24px 0", textAlign: "center", fontSize: 12, color: C.faint }}>没有匹配的规则模板</div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ padding: "12px 18px", borderTop: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: C.sub }}>已选 {picked.length} 条</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <Btn onClick={() => setPickerOpen(false)}>取消</Btn>
                <Btn tone="primary" icon={<Check size={14} />} disabled={picked.length === 0} onClick={confirmPick}>
                  确认引用
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 资源声明弹窗 */}
      {resOpen && (
        <div
          onClick={() => setResOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,.42)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 80,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: 520, background: "#fff", borderRadius: 10, padding: 18 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Cpu size={16} style={{ color: C.primary }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>产线资源需求声明</span>
              <button
                onClick={() => setResOpen(false)}
                style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: C.faint, display: "flex" }}
              >
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: 11, color: C.sub, margin: "0 0 14px", lineHeight: 1.7 }}>
              这里只声明产线运行所需的资源规格，实际分配与排队由「生产运行监管 · 计算资源调度」在运行时决定。
            </p>
            <Grid cols={2} gap={10}>
              {[
                { k: "GPU 卡数", v: String(resource.gpu), key: "gpu" },
                { k: "GPU 型号", v: resource.gpuType, key: "gpuType" },
                { k: "CPU 核数", v: String(resource.cpu), key: "cpu" },
                { k: "内存 GB", v: String(resource.mem), key: "mem" },
                { k: "资源池", v: resource.pool, key: "pool" },
              ].map((f) => (
                <div key={f.key}>
                  <div style={{ fontSize: 11, color: C.sub, marginBottom: 4 }}>{f.k}</div>
                  <input
                    value={f.v}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setResource((prev) => {
                        if (f.key === "gpu") return { ...prev, gpu: Number(raw) || 0 };
                        if (f.key === "cpu") return { ...prev, cpu: Number(raw) || 0 };
                        if (f.key === "mem") return { ...prev, mem: Number(raw) || 0 };
                        if (f.key === "gpuType") return { ...prev, gpuType: raw };
                        return { ...prev, pool: raw };
                      });
                    }}
                    style={{ width: "100%", padding: "7px 9px", fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6, outline: "none" }}
                  />
                </div>
              ))}
              <div>
                <div style={{ fontSize: 11, color: C.sub, marginBottom: 4 }}>占用模式</div>
                <select
                  value={resource.exclusive ? "独占" : "共享"}
                  onChange={(e) => setResource({ ...resource, exclusive: e.target.value === "独占" })}
                  style={{ width: "100%", padding: "7px 9px", fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6, outline: "none", background: "#fff" }}
                >
                  <option value="共享">共享</option>
                  <option value="独占">独占</option>
                </select>
              </div>
            </Grid>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <Btn onClick={() => setResOpen(false)}>取消</Btn>
              <Btn
                tone="primary"
                icon={<Check size={14} />}
                onClick={() => {
                  setResOpen(false);
                  showToast("资源需求声明已更新，保存产线后随版本生效");
                }}
              >
                确认
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* 另存为模板弹窗 */}
      {tplOpen && (
        <div
          onClick={() => setTplOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,.42)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 80,
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: 540, background: "#fff", borderRadius: 10, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Copy size={16} style={{ color: C.primary }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>另存为产线模板</span>
              <button
                onClick={() => setTplOpen(false)}
                style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: C.faint, display: "flex" }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: C.sub, marginBottom: 5 }}>模板名称</div>
                <input
                  value={tplForm.name}
                  onChange={(e) => setTplForm({ ...tplForm, name: e.target.value })}
                  placeholder={`${name} 模板`}
                  style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: `1px solid ${C.border}`, borderRadius: 6, outline: "none" }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, color: C.sub, marginBottom: 5 }}>适用场景</div>
                <input
                  value={tplForm.scene}
                  onChange={(e) => setTplForm({ ...tplForm, scene: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: `1px solid ${C.border}`, borderRadius: 6, outline: "none" }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, color: C.sub, marginBottom: 5 }}>模板说明</div>
                <input
                  value={tplForm.desc}
                  onChange={(e) => setTplForm({ ...tplForm, desc: e.target.value })}
                  placeholder={`${nodes.length} 个节点，引用 ${ruleTotal} 条规则模板`}
                  style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: `1px solid ${C.border}`, borderRadius: 6, outline: "none" }}
                />
              </div>
            </div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 10 }}>
              将保存 {nodes.length} 个节点、{ruleTotal} 条规则引用，版本 {version}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
              <Btn onClick={() => setTplOpen(false)}>取消</Btn>
              <Btn tone="primary" icon={<Save size={14} />} onClick={saveTemplate}>
                保存为模板
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* 轻提示 */}
      {toast && (
        <div
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,
            zIndex: 90,
            padding: "10px 14px",
            borderRadius: 8,
            background: "#1e293b",
            color: "#fff",
            fontSize: 12,
            boxShadow: "0 8px 24px rgba(15,23,42,.24)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            maxWidth: 460,
          }}
        >
          <Check size={14} style={{ color: "#4ade80", flexShrink: 0 }} />
          {toast}
        </div>
      )}
    </div>
  );
}
