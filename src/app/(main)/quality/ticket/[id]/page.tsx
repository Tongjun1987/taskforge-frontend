import TicketDetailClient from "@/components/quality/TicketDetailClient";
import { QC_TICKETS } from "@/components/quality/qcData";

// 静态导出需预生成全部工单详情页
export async function generateStaticParams() {
  return QC_TICKETS.map((t) => ({ id: t.id }));
}

export default function Page({ params }: { params: { id: string } }) {
  return <TicketDetailClient ticketId={params.id} />;
}
