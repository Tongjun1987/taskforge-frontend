import { Suspense } from "react";
import TaskDetailClient from "./TaskDetailClient";

export async function generateStaticParams() {
  return [
    { id: 'scene-1' },
    { id: 'scene-2' },
    { id: 'scene-3' },
  ];
}

export default function TaskDetailPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#64748b", fontSize: 14 }}>加载中...</p>
        </div>
      </div>
    }>
      <TaskDetailClient />
    </Suspense>
  );
}
