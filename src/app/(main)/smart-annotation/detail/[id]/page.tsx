import { Suspense } from "react";
import SmartAnnotationDetailClient from "./SmartAnnotationDetailClient";
export async function generateStaticParams() { return []; }
export default function SmartAnnotationDetailPage() {
  return (
    <Suspense fallback={<main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}><div style={{ color: "#94a3b8" }}>加载中...</div></main>}>
      <SmartAnnotationDetailClient />
    </Suspense>
  );
}
