// SSG: this page is statically exported with empty generateStaticParams
import AnnotationDetailClient from "./ClientPage";

export async function generateStaticParams() {
  return [];
}

export default function AnnotationDetailPage() {
  return <AnnotationDetailClient />;
}
