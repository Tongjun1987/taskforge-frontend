import TrackDetailClient from "./TrackDetailClient";

// 静态导出需预生成所有运行批次页面（数据与 TASK_RUNS 对齐）
export async function generateStaticParams() {
  return [
    { runId: "RUN-2001" },
    { runId: "RUN-2002" },
    { runId: "RUN-2003" },
    { runId: "RUN-2004" },
    { runId: "RUN-2005" },
    { runId: "RUN-2006" },
    { runId: "RUN-2007" },
  ];
}

export default function Page({ params }: { params: { runId: string } }) {
  return <TrackDetailClient runId={params.runId} />;
}
