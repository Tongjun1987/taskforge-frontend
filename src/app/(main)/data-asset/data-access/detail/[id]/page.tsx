import TaskDetailClient from "./TaskDetailClient";

export async function generateStaticParams() {
  return [];
}

export default function TaskDetailPage() {
  return <TaskDetailClient />;
}
