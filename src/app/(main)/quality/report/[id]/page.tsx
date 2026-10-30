import ReportDetailClient from "@/components/quality/ReportDetailClient";
import { QC_REPORTS } from "@/components/quality/qcData";

// 静态导出需预生成全部报告详情页
export async function generateStaticParams() {
  return QC_REPORTS.map((r) => ({ id: r.id }));
}

export default function Page({ params }: { params: { id: string } }) {
  return <ReportDetailClient reportId={params.id} />;
}
