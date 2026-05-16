import { Suspense } from "react";
import SmartAnnotationReviewClient from "./SmartAnnotationReviewClient";

export async function generateStaticParams() {
  return [
    { id: 'sa_det_001' },
    { id: 'ds_det_001' },
    { id: 'sa_track_001' },
    { id: 'ds_track_001' },
    { id: 'sa_beh_001' },
    { id: 'ds_beh_001' },
    { id: 'sa_event_001' },
    { id: 'ds_event_001' },
  ];
}

export default function SmartAnnotationReviewPage() {
  return (
    <Suspense fallback={<main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}><div style={{ color: "#94a3b8" }}>加载中...</div></main>}>
      <SmartAnnotationReviewClient />
    </Suspense>
  );
}
