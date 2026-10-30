import { PIPELINES, RUN_PIPELINE, TASK_RUNS } from "./mock";

/**
 * 运行批次的产线快照模型。
 *
 * 定位：任务追踪详情页「产线快照」tab 的数据层。
 * 与 monitorModel 的区别 —— 监控页看「正在跑」，这里看「跑过的那一次」：
 * 数据由 runId 派生、带当时的产线版本、全程只读，用于回放与审计。
 *
 * 所有数字用稳定哈希派生，保证同一批次刷新前后完全一致，
 * 也保证漏斗里上一节点的输出等于下一节点的输入。
 */

type Run = (typeof TASK_RUNS)[number];
type Pipe = (typeof PIPELINES)[number];
type PipeNode = Pipe["nodes"][number];

// 与 monitorModel 同源的 FNV-1a：同一 key 永远得到同一个 0~1 的数
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}
const rnd = (k: string, i: number) => hash(`${k}#${i}`);

const NODE_TONES = ["#0ea5e9", "#4f46e5", "#8b5cf6", "#14b8a6", "#f59e0b", "#16a34a"];

export type SnapshotNodeState = "done" | "running" | "waiting" | "error";

export type SnapshotNode = {
  index: number;
  name: string;
  tone: string;
  state: SnapshotNodeState;
  seconds: number;
  input: number;
  output: number;
  dropped: number;
  ops: number;
  rules: number;
  rulesHit: number;
  log: { t: string; text: string }[];
};

export type Snapshot = {
  run: Run;
  pipe: Pipe;
  /** 该批次实际使用的产线版本 */
  version: string;
  /** 产线当前版本是否已高于该批次版本 */
  stale: boolean;
  /** 产线当前版本（stale 时可对比展示） */
  currentVersion: string;
  nodes: SnapshotNode[];
  totals: {
    nodes: number;
    done: number;
    ops: number;
    rules: number;
    seconds: number;
    input: number;
    output: number;
    dropped: number;
  };
};

/** 按批次推导每个节点的执行态：已完成的判 done，当前节点按批次状态判 running / error */
function stateOf(run: Run, i: number): SnapshotNodeState {
  if (run.status === "queued") return "waiting";
  if (run.status === "success") return "done";
  if (i < run.nodesDone) return "done";
  if (i === run.nodesDone) return run.status === "failed" ? "error" : "running";
  return "waiting";
}

const ERRORS = [
  "输入样本存在缺失标注，校验未通过",
  "算子执行超时，已触发批次中止",
  "上游输出表结构与节点声明不一致",
];

/** 把列表里的「4 小时 51 分」「48 分（已暂停 22 分）」解析成秒 */
function parseElapsed(s: string): number {
  const h = /(\d+)\s*小时/.exec(s);
  const m = /(\d+)\s*分/.exec(s);
  return (h ? Number(h[1]) * 3600 : 0) + (m ? Number(m[1]) * 60 : 0);
}

export function buildSnapshot(runIdOrTaskId: string): Snapshot | null {
  const run =
    TASK_RUNS.find((r) => r.id === runIdOrTaskId) ?? TASK_RUNS.find((r) => r.taskId === runIdOrTaskId);
  if (!run) return null;

  const map = RUN_PIPELINE[run.id];
  const pipe = map ? PIPELINES.find((p) => p.id === map.pipelineId) : undefined;
  if (!map || !pipe) return null;

  const base = Math.round(180000 + rnd(`${run.id}|base`, 1) * 220000);
  let carryIn = base;
  let carryOut = base;

  // 批次墙钟耗时是硬事实，节点之间按产线定义的相对权重分摊，
  // 这样「各节点耗时之和 = 批次耗时」，不会出现列表写 4 小时、详情算出 11 分钟。
  const elapsedTotal = parseElapsed(run.elapsed);
  const reachedIdx = pipe.nodes
    .map((_, i) => (stateOf(run, i) === "waiting" ? -1 : i))
    .filter((i) => i >= 0);
  // 待启动产线的节点耗时声明为 0，用稳定权重兜底，避免所有节点被均分成同一个数字
  const weightOf = (i: number) => pipe.nodes[i].seconds || 30 + rnd(`${run.id}|w|${i}`, 7) * 90;
  const weightSum = reachedIdx.reduce((s, i) => s + weightOf(i), 0);

  const nodes: SnapshotNode[] = pipe.nodes.map((n: PipeNode, i) => {
    const seed = `${run.id}|${n.name}|${i}`;
    const state = stateOf(run, i);
    const input = carryIn;

    const ratio = 0.88 + rnd(seed, 2) * 0.11;
    // 失败节点是「跑到一半中止」，只留下约三分之一的中间结果，不该按正常比例产出
    const output =
      state === "waiting" ? 0 : Math.round(input * (state === "error" ? ratio * 0.34 : ratio));
    carryIn = output || carryIn;
    if (output) carryOut = output;

    let seconds = 0;
    if (state !== "waiting") {
      if (elapsedTotal > 0) {
        const share = weightSum > 0 ? weightOf(i) / weightSum : 1 / reachedIdx.length;
        seconds = Math.round(elapsedTotal * share);
      } else {
        seconds = Math.round(40 + rnd(seed, 3) * 130);
      }
    }

    const rulesHit =
      state === "done"
        ? Math.round(n.rules * (0.7 + rnd(seed, 4) * 0.3))
        : state === "running"
          ? Math.round(n.rules * rnd(seed, 5) * 0.5)
          : 0;

    const stamp = (m: number) => {
      const d = new Date(`${run.startedAt.replace(/-/g, "/")}`.replace(/\//g, "/"));
      const mins = Number.isNaN(d.getTime()) ? m : d.getHours() * 60 + d.getMinutes() + m;
      const hh = String(Math.floor(mins / 60) % 24).padStart(2, "0");
      const mm = String(mins % 60).padStart(2, "0");
      const ss = String(Math.floor(rnd(seed, m) * 60)).padStart(2, "0");
      return `${hh}:${mm}:${ss}`;
    };

    const log: { t: string; text: string }[] = [];
    if (state === "waiting") {
      log.push({ t: "--:--:--", text: "等待上游节点输出，尚未调度" });
    } else if (state === "error") {
      log.push({ t: stamp(0), text: "节点启动，加载算子配置" });
      log.push({ t: stamp(1), text: ERRORS[Math.floor(rnd(seed, 6) * ERRORS.length)] });
      log.push({ t: stamp(2), text: "批次中止，节点保留中间结果待重跑" });
    } else {
      log.push({ t: stamp(0), text: "节点启动，加载 " + n.ops + " 个算子" });
      log.push({ t: stamp(1), text: "读取输入 " + input.toLocaleString() + " 条" });
      log.push({
        t: stamp(2),
        text:
          state === "running"
            ? "处理中，已写出 " + output.toLocaleString() + " 条"
            : "完成，写出 " + output.toLocaleString() + " 条，规则命中 " + rulesHit + "/" + n.rules,
      });
    }

    return {
      index: i,
      name: n.name,
      tone: NODE_TONES[i % NODE_TONES.length],
      state,
      seconds,
      input,
      output,
      dropped: state === "waiting" ? 0 : input - output,
      ops: n.ops,
      rules: n.rules,
      rulesHit,
      log,
    };
  });

  // 逐节点取整会让总和与批次耗时差几秒，把差额补到最后一个已达节点，保证加总严格一致
  if (elapsedTotal > 0) {
    const diff = elapsedTotal - nodes.reduce((s, n) => s + n.seconds, 0);
    const lastIdx = reachedIdx[reachedIdx.length - 1];
    if (diff !== 0 && lastIdx !== undefined) nodes[lastIdx].seconds += diff;
  }

  const reached = nodes.filter((n) => n.state !== "waiting");

  return {
    run,
    pipe,
    version: map.version,
    currentVersion: pipe.version,
    stale: map.version !== pipe.version,
    nodes,
    totals: {
      nodes: nodes.length,
      done: nodes.filter((n) => n.state === "done").length,
      ops: nodes.reduce((s, n) => s + n.ops, 0),
      rules: nodes.reduce((s, n) => s + n.rules, 0),
      seconds: nodes.reduce((s, n) => s + n.seconds, 0),
      input: base,
      output: reached.length ? reached[reached.length - 1].output : 0,
      dropped: base - carryOut,
    },
  };
}
