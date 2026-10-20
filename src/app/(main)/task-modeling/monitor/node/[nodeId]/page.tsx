import NodeDetailClient from "./NodeDetailClient";
import { ALL_NODE_PARAMS } from "@/components/production/monitorKeys";

// 静态导出需预生成所有产线节点页面（与 PIPELINES 节点一一对应）
export async function generateStaticParams() {
  return ALL_NODE_PARAMS;
}

export default function Page({ params }: { params: { nodeId: string } }) {
  return <NodeDetailClient nodeId={params.nodeId} />;
}
