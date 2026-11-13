import { notFound } from "next/navigation";
import { DATASETS, getDataset } from "@/components/service/datasetCatalog";
import DatasetDetailView from "@/components/service/DatasetDetailView";

// 静态导出需预生成全部数据集详情页
export async function generateStaticParams() {
  return DATASETS.map((d) => ({ id: d.id }));
}

export default function Page({ params }: { params: { id: string } }) {
  const ds = getDataset(params.id);
  if (!ds) notFound();
  return <DatasetDetailView dataset={ds} />;
}
