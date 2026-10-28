// 任务 ID 清单（纯数据，无 "use client"，可供 server 侧 generateStaticParams 使用）。
// 必须与 mock 数据保持一致：生产任务页 page.tsx 的 MOCK_TASKS、任务详情页
// TaskDetailClient.tsx 的 MOCK_TASKS 用的是同一批 id（task-1 ~ task-9）。
// 静态导出（GitHub Pages）只会生成下面列出的路径，其它 id 在线上会 404。
export const TASK_IDS = [
  "task-1",
  "task-2",
  "task-3",
  "task-4",
  "task-5",
  "task-6",
  "task-7",
  "task-8",
  "task-9",
];
