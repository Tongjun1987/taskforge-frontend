import TaskDetailClient from "./TaskDetailClient";

export async function generateStaticParams() {
  return [
    { id: 'task-1' },
    { id: 'task-2' },
    { id: 'task-3' },
    { id: 'task-4' },
    { id: 'task-5' },
  ];
}

export default function TaskDetailPage() {
  return <TaskDetailClient />;
}
