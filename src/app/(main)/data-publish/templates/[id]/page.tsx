import { PACK_TEMPLATES } from "@/components/publish/publishData";
import TemplateDetailClient from "@/components/publish/TemplateDetailClient";

// 静态导出需预生成全部模板详情页
export async function generateStaticParams() {
  return PACK_TEMPLATES.map((t) => ({ id: t.id }));
}

export default function Page({ params }: { params: { id: string } }) {
  return <TemplateDetailClient templateId={params.id} />;
}
