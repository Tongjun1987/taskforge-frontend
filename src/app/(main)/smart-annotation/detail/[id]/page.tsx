import { Suspense } from "react";
import SmartAnnotationDetailClient from "./SmartAnnotationDetailClient";

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

export default function SmartAnnotationDetailPage() {
  return (
    <Suspense fallback={<main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}><div style={{ color: "#94a3b8" }}>加载中...</div></main>}>
      <SmartAnnotationDetailClient />
    </Suspense>
  );
}
