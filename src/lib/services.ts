import api from "./api";

// ===== 认证 =====
export const login = (username: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);
  return api.post("/auth/login", formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
};

export const getMe = () => api.get("/auth/me");

// ===== 控制台 =====
export const getDashboardStats = () => api.get("/dashboard/stats");

// ===== 业务场景 =====
export const listScenes = (projectId: string) =>
  api.get(`/scenes?project_id=${projectId}`);
export const getScene = (id: string) => api.get(`/scenes/${id}`);
export const createScene = (data: any) => api.post("/scenes", data);
export const updateScene = (id: string, data: any) =>
  api.put(`/scenes/${id}`, data);
export const deleteScene = (id: string) => api.delete(`/scenes/${id}`);
export const recommendTasks = (sceneId: string, data: any) =>
  api.post(`/scenes/${sceneId}/recommend-tasks`, data);

// ===== 模型任务 =====
export const listTasks = (sceneId: string) =>
  api.get(`/tasks?scene_id=${sceneId}`);
export const getTask = (id: string) => api.get(`/tasks/${id}`);
export const createTask = (data: any) => api.post("/tasks", data);
export const updateTask = (id: string, data: any) =>
  api.put(`/tasks/${id}`, data);
export const exportLabelStudioXml = (taskId: string) =>
  api.get(`/tasks/${taskId}/label-schema/export`);
export const getTaskQualityGates = (taskId: string) =>
  api.get(`/tasks/${taskId}/quality-gates`);

// ===== 数据集 =====
export const listDatasets = (taskId?: string, qualityStatus?: string) => {
  const params = new URLSearchParams();
  if (taskId) params.append("task_id", taskId);
  if (qualityStatus) params.append("quality_status", qualityStatus);
  return api.get(`/datasets?${params.toString()}`);
};
export const getDataset = (id: string) => api.get(`/datasets/${id}`);
export const createDataset = (data: any) => api.post("/datasets", data);
export const uploadDataFile = (datasetId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`/datasets/${datasetId}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const getDatasetItems = (datasetId: string, page = 1, pageSize = 20) =>
  api.get(`/datasets/${datasetId}/items?page=${page}&page_size=${pageSize}`);
export const getDatasetStats = (datasetId: string) =>
  api.get(`/datasets/${datasetId}/statistics`);

// ===== 标注 =====
export const listAnnotationJobs = (datasetId?: string) =>
  api.get(`/annotation/jobs${datasetId ? `?dataset_id=${datasetId}` : ""}`);
export const createAnnotationJob = (data: any) =>
  api.post("/annotation/jobs", data);
export const getNextItem = (jobId: string) =>
  api.get(`/annotation/jobs/${jobId}/next-item`);
export const submitAnnotation = (jobId: string, itemId: string, result: any) =>
  api.post(`/annotation/jobs/${jobId}/submit?item_id=${itemId}`, result);
export const calculateKappa = (jobId: string) =>
  api.post(`/annotation/jobs/${jobId}/calculate-kappa`);

// ===== 质量控制 =====
export const getQualityGates = (taskId: string) =>
  api.get(`/quality/gates/${taskId}`);
export const runQualityGate = (gateId: string, datasetId: string) =>
  api.post(`/quality/gates/${gateId}/run?dataset_id=${datasetId}`);
export const overrideGate = (gateId: string, datasetId: string, reason: string) =>
  api.post(`/quality/gates/${gateId}/override?dataset_id=${datasetId}&reason=${encodeURIComponent(reason)}`);
export const getQualityReport = (datasetId: string) =>
  api.get(`/quality/reports/${datasetId}`);
export const generateQualityReport = (datasetId: string) =>
  api.post(`/quality/reports/${datasetId}/generate`);
export const getGoldSets = (taskId: string) =>
  api.get(`/quality/gold-sets/${taskId}`);

// ===== 评测 =====
export const createEvalJob = (data: any) => api.post("/eval/jobs", data);
export const getEvalJob = (id: string) => api.get(`/eval/jobs/${id}`);
export const getEvalResults = (jobId: string) =>
  api.get(`/eval/jobs/${jobId}/results`);
export const generateAcceptancePackage = (data: any) =>
  api.post("/eval/acceptance-packages", null, { params: data });
export const createRelease = (data: any) =>
  api.post("/eval/releases", null, { params: data });

// ===== 发布运营 =====
export const listPublishJobs = (env?: string, status?: string, artifactType?: string) => {
  const params = new URLSearchParams();
  if (env) params.append("env", env);
  if (status) params.append("status", status);
  if (artifactType) params.append("artifact_type", artifactType);
  return api.get(`/publish/jobs?${params.toString()}`);
};
export const getPublishJob = (id: string) => api.get(`/publish/jobs/${id}`);
export const createPublishJob = (data: any) => api.post("/publish/jobs", data);
export const updatePublishJob = (id: string, data: any) => api.put(`/publish/jobs/${id}`, data);
export const deletePublishJob = (id: string) => api.delete(`/publish/jobs/${id}`);
export const deployPublishJob = (id: string) => api.post(`/publish/jobs/${id}/deploy`);
export const getDeployLogs = (id: string, deployId?: string) =>
  api.get(`/publish/jobs/${id}/logs${deployId ? `?deploy_id=${deployId}` : ""}`);
export const rollbackPublishJob = (id: string, targetVersion?: string) =>
  api.post(`/publish/jobs/${id}/rollback${targetVersion ? `?target_version=${targetVersion}` : ""}`);
export const listEnvironments = () => api.get("/publish/environments");
export const createEnvironment = (data: any) => api.post("/publish/environments", data);
export const listArtifacts = (jobId?: string, artifactType?: string) => {
  const params = new URLSearchParams();
  if (jobId) params.append("job_id", jobId);
  if (artifactType) params.append("artifact_type", artifactType);
  return api.get(`/publish/artifacts?${params.toString()}`);
};
export const uploadArtifact = (file: File, artifactType: string, jobId?: string) => {
  const formData = new FormData();
  formData.append("file", file);
  if (jobId) formData.append("job_id", jobId);
  const params = new URLSearchParams();
  params.append("artifact_type", artifactType);
  return api.post(`/publish/artifacts?${params.toString()}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const getPublishStats = () => api.get("/publish/stats");
