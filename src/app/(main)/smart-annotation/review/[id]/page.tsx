import { Suspense } from "react";
import SmartAnnotationReviewClient from "./SmartAnnotationReviewClient";
export async function generateStaticParams() { return []; }
export default function SmartAnnotationReviewPage() {
  return (
    <Suspense fallback={<main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}><div style={{ color: "#94a3b8" }}>加载中...</div></main>}>
      <SmartAnnotationReviewClient />
    </Suspense>
  );
}
