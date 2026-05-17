import TaskDetailClient from "./TaskDetailClient";

export async function generateStaticParams() {
  return [
    { id: "ds-1" }, { id: "ds-2" }, { id: "ds-3" }, { id: "ds-4" }, { id: "ds-5" },
    { id: "ds-6" },
    { id: "sim-access-1" }, { id: "sim-access-2" }, { id: "sim-access-3" },
    { id: "sim-access-4" }, { id: "sim-access-5" }, { id: "sim-access-6" },
    { id: "sim-access-7" }, { id: "sim-access-8" }, { id: "sim-access-9" },
  ];
}

export default function TaskDetailPage() {
  return <TaskDetailClient />;
}
