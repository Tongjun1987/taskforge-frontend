import { C } from "./ui";
import { PIPELINES } from "./mock";

export type Pipe = (typeof PIPELINES)[number];
export type PipeNode = Pipe["nodes"][number];
export type MetricKey = "throughput" | "latency" | "backlog" | "resource" | "errorRate";

export const METRIC_TABS: { key: MetricKey; label: string }[] = [
  { key: "throughput", label: "数据吞吐" },
  { key: "latency", label: "处理延迟" },
  { key: "backlog", label: "队列积压" },
  { key: "resource", label: "资源占用" },
  { key: "errorRate", label: "错误率" },
];

export const METRIC_META: Record<MetricKey, { unit: string; tone: string; digits: number }> = {
  throughput: { unit: "条 / 秒", tone: C.success, digits: 1 },
  latency: { unit: "ms · P95", tone: C.info, digits: 0 },
  backlog: { unit: "条", tone: C.warn, digits: 0 },
  resource: { unit: "%", tone: C.primary, digits: 0 },
  errorRate: { unit: "%", tone: C.danger, digits: 2 },
};

// Stable pseudo random: same pipeline / node always yields the same numbers,
// so the list row and the detail page can never disagree.
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

export const rnd = (k: string, i: number) => hash(`${k}#${i}`);

export const nodeSeed = (p: Pipe, n: PipeNode, i: number) => `${p.id}|${n.name}|${i}`;

export function nodeMetric(p: Pipe, n: PipeNode, i: number): Record<MetricKey, number> {
  const k = nodeSeed(p, n, i);
  const a = rnd(k, 1);
  const b = rnd(k, 2);
  const c = rnd(k, 3);
  const d = rnd(k, 4);
  const done = n.status === "done";
  const running = n.status === "running";
  const waiting = n.status === "waiting";
  const failed = n.status === "error";

  const throughput = waiting || failed ? 0 : Math.round((done ? 160 + a * 340 : 60 + a * 240) * 10) / 10;
  const latency = waiting
    ? 0
    : failed
      ? Math.round(2600 + b * 3400)
      : Math.round(done ? 90 + b * 380 : 280 + b * 900);
  const backlog = waiting ? Math.round(220 + c * 2600) : running ? Math.round(c * 260) : 0;
  const resource = running ? p.usage : 0;
  const errorRate = failed
    ? Math.round((3 + b * 6) * 10) / 10
    : done
      ? Math.round((0.02 + a * 0.22) * 10) / 10
      : running
        ? Math.round((0.1 + d * 0.8) * 10) / 10
        : 0;

  return { throughput, latency, backlog, resource, errorRate };
}

const PART_DEFS = [
  { label: "排队等待", tone: C.faint, desc: "上游产出后进入算子队列" },
  { label: "数据加载", tone: C.info, desc: "对象存储读取与解码" },
  { label: "算子计算", tone: C.primary, desc: "算子自身执行耗时" },
  { label: "结果写回", tone: C.teal, desc: "产物落盘与元数据登记" },
];

export const PART_LEGEND = PART_DEFS.map((p) => ({ label: p.label, tone: p.tone }));

export type Part = { label: string; v: number; pct: number; tone: string; desc: string };

// Split one node duration into four segments. Percentages are rounded on a
// running total so the four segments always add up to exactly 100.
export function splitParts(seconds: number, seed: string): Part[] | null {
  if (!seconds) return null;
  const queue = Math.round(seconds * (0.05 + rnd(seed, 11) * 0.07));
  const load = Math.round(seconds * (0.1 + rnd(seed, 12) * 0.09));
  const compute = Math.round(seconds * (0.52 + rnd(seed, 13) * 0.12));
  const write = Math.max(0, seconds - queue - load - compute);
  const raw = [queue, load, compute, write];

  let acc = 0;
  return PART_DEFS.map((p, i) => {
    const pct = i === PART_DEFS.length - 1 ? Math.max(0, 100 - acc) : Math.round((raw[i] / seconds) * 100);
    acc += pct;
    return { ...p, v: raw[i], pct };
  });
}

export function bottleneckOf(parts: Part[]): Part {
  return parts.reduce((m, p) => (p.v > m.v ? p : m), parts[0]);
}

export { nodeIdOf, parseNodeId, ALL_NODE_PARAMS } from "./monitorKeys";

// 12 sampling points; the last point equals the current value so the headline
// number always sits on the curve.
export function buildTrend(cur: number, digits: number, seed: string): number[] {
  return Array.from({ length: 12 }, (_, i) => {
    if (i === 11) return cur;
    const w = 0.72 + 0.55 * rnd(seed, i);
    return Number((cur * w).toFixed(digits));
  });
}

export function trendLabels(): string[] {
  return Array.from({ length: 12 }, (_, i) => `09:${String(33 + i).padStart(2, "0")}`);
}
