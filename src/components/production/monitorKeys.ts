// Pure data helpers (no React, no client-only module) so server components can
// import them for generateStaticParams.
import { PIPELINES } from "./mock";

export function nodeIdOf(pipelineId: string, idx: number) {
  return `${pipelineId}-N${idx + 1}`;
}

export function parseNodeId(nodeId: string): { pipelineId: string; idx: number } | null {
  const m = /^(.+)-N(\d+)$/.exec(nodeId);
  if (!m) return null;
  const idx = Number(m[2]) - 1;
  const pipe = PIPELINES.find((p) => p.id === m[1]);
  if (!pipe || idx < 0 || idx >= pipe.nodes.length) return null;
  return { pipelineId: m[1], idx };
}

// Every node of every pipeline, used by generateStaticParams for the static export.
export const ALL_NODE_PARAMS = PIPELINES.flatMap((p) => p.nodes.map((_, i) => ({ nodeId: nodeIdOf(p.id, i) })));
