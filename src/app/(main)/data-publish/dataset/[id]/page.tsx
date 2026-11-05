import { DATASETS } from "@/components/publish/publishData";
import DatasetDetailClient from "@/components/publish/DatasetDetailClient";

// 静态导出需预生成全部数据集详情页
export async function generateStaticParams() {
  return DATASETS.map((d) => ({ id: d.id }));
}

export default function Page({ params }: { params: { id: string } }) {
  return <DatasetDetailClient datasetId={params.id} />;
}
