"use client";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/Sidebar";
import {
  listPublishJobs,
  getPublishJob,
  createPublishJob,
  deployPublishJob,
  getDeployLogs,
  rollbackPublishJob,
  listEnvironments,
  listArtifacts,
  uploadArtifact,
  getPublishStats,
} from "@/lib/services";
import {
  Plus, Rocket, Server, Package, Upload, Play, RotateCcw,
  ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock, Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

interface PublishJob {
  id: string;
  name: string;
  version: string;
  env: string;
  artifact_type: string;
  status: string;
  description: string;
  tags: string[];
  deployed_at: string | null;
  deployed_by: string | null;
  artifacts: { id: string; name: string; type: string; size: number }[];
  created_at: string;
}

interface Environment {
  id: string;
  name: string;
  env_type: string;
  status: string;
  version: string;
  instance_count: number;
  description: string;
}

interface Artifact {
  id: string;
  name: string;
  artifact_type: string;
  size_formatted: string;
  job_id: string;
  uploaded_by: string;
  uploaded_at: string;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}

export default function PublishPage() {
  const [activeTab, setActiveTab] = useState<"jobs" | "environments" | "artifacts">("jobs");
  const [jobs, setJobs] = useState<PublishJob[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 筛选
  const [envFilter, setEnvFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // 弹窗
  const [showJobModal, setShowJobModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState<string | null>(null);
  const [deployingJob, setDeployingJob] = useState<string | null>(null);
  const [rollingBack, setRollingBack] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // 新建发布任务表单
  const [jobForm, setJobForm] = useState({
    name: "", version: "", env: "test", artifact_type: "dataset", description: "",
  });

  // 上传制品
  const [uploadType, setUploadType] = useState("dataset");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchAll(); }, [activeTab]);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "jobs") {
        const res = await listPublishJobs(envFilter || undefined, statusFilter || undefined);
        setJobs(res.data.jobs || []);
      } else if (activeTab === "environments") {
        const res = await listEnvironments();
        setEnvironments(res.data.environments || []);
      } else {
        const res = await listArtifacts();
        setArtifacts(res.data.artifacts || []);
      }
      // 统计
      if (!stats) {
        const statsRes = await getPublishStats();
        setStats(statsRes.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "加载失败");
      toast.error("数据加载失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPublishJob({
        ...jobForm,
        tags: [],
        dataset_id: undefined,
        checkpoint_id: undefined,
      });
      toast.success("发布任务创建成功");
      setShowJobModal(false);
      setJobForm({ name: "", version: "", env: "test", artifact_type: "dataset", description: "" });
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "创建失败");
    }
  };

  const handleDeploy = async (jobId: string) => {
    setDeployingJob(jobId);
    try {
      const res = await deployPublishJob(jobId);
      toast.success("部署已触发：" + res.data.message);
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "部署失败");
    } finally {
      setDeployingJob(null);
    }
  };

  const handleViewLogs = async (jobId: string) => {
    setShowLogsModal(jobId);
    setLoadingLogs(true);
    try {
      const res = await getDeployLogs(jobId);
      setLogs(res.data.logs || []);
    } catch {
      toast.error("加载日志失败");
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleRollback = async (jobId: string) => {
    setRollingBack(jobId);
    try {
      await rollbackPublishJob(jobId);
      toast.success("回滚成功");
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "回滚失败");
    } finally {
      setRollingBack(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) { toast.error("请选择文件"); return; }
    setUploading(true);
    try {
      await uploadArtifact(selectedFile, uploadType);
      toast.success("制品上传成功");
      setSelectedFile(null);
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "上传失败");
    } finally {
      setUploading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const map: Record<string, { cls: string; label: string; icon: any }> = {
      deployed: { cls: "bg-emerald-100 text-emerald-700", label: "已部署", icon: CheckCircle2 },
      deploying: { cls: "bg-blue-100 text-blue-700", label: "部署中", icon: Loader2 },
      draft: { cls: "bg-slate-100 text-slate-600", label: "草稿", icon: Clock },
      failed: { cls: "bg-red-100 text-red-700", label: "失败", icon: XCircle },
      running: { cls: "bg-blue-100 text-blue-700", label: "运行中", icon: Loader2 },
    };
    return map[status] || { cls: "bg-slate-100 text-slate-600", label: status, icon: Clock };
  };

  const getEnvColor = (env: string) => {
    return env === "production" ? "text-red-600" : env === "staging" ? "text-amber-600" : "text-emerald-600";
  };

  const logLevelColor = (level: string) => {
    if (level === "SUCCESS") return "text-emerald-600 font-bold";
    if (level === "ERROR") return "text-red-600";
    if (level === "WARN") return "text-amber-600";
    return "text-slate-600";
  };

  return (
    <>
      <TopBar title="发布运营中心" subtitle="发布任务 · 环境管理 · 制品管理" />
      <main className="flex-1 overflow-y-auto p-6">
        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "累计发布", value: stats.total_releases, icon: Rocket },
              { label: "活跃环境", value: stats.active_environments, icon: Server },
              { label: "制品总数", value: stats.total_artifacts, icon: Package },
              { label: "部署成功率", value: `${(stats.deploy_success_rate * 100).toFixed(0)}%`, icon: CheckCircle2 },
            ].map((item, i) => (
              <div key={i} className="card p-4 text-center">
                <item.icon className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800">{item.value}</div>
                <div className="text-xs text-slate-500">{item.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 切换 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(["jobs", "environments", "artifacts"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-800"
                }`}
              >
                {tab === "jobs" ? "发布任务" : tab === "environments" ? "环境管理" : "制品管理"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "jobs" && (
              <>
                <select value={envFilter} onChange={(e) => { setEnvFilter(e.target.value); }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                  <option value="">所有环境</option>
                  <option value="test">测试</option>
                  <option value="staging">预发</option>
                  <option value="production">生产</option>
                </select>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                  <option value="">所有状态</option>
                  <option value="draft">草稿</option>
                  <option value="deployed">已部署</option>
                  <option value="deploying">部署中</option>
                </select>
              </>
            )}
            {activeTab === "jobs" && (
              <button onClick={() => setShowJobModal(true)} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                <Plus className="w-4 h-4" />新建发布任务
              </button>
            )}
            {activeTab === "artifacts" && (
              <label className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer">
                <Upload className="w-4 h-4" />上传制品
                <input type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              </label>
            )}
          </div>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error} <button onClick={fetchAll} className="ml-2 underline">重试</button></div>}

        {/* 发布任务列表 */}
        {activeTab === "jobs" && (
          loading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="card p-5 animate-pulse"><div className="h-4 bg-slate-100 rounded w-1/3" /></div>)}</div>
          ) : jobs.length === 0 ? (
            <div className="card p-12 text-center">
              <Rocket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-slate-800 font-medium mb-1">暂无发布任务</h3>
              <button onClick={() => setShowJobModal(true)} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm mt-4">新建发布任务</button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => {
                const statusCfg = getStatusConfig(job.status);
                const StatusIcon = statusCfg.icon;
                return (
                  <div key={job.id} className="card p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Rocket className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{job.name}</h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="bg-slate-100 px-2 py-0.5 rounded">{job.version}</span>
                            <span className={getEnvColor(job.env)}>{job.env === "production" ? "生产" : job.env === "staging" ? "预发" : "测试"}</span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded">{job.artifact_type}</span>
                            {job.deployed_at && <span>部署于 {new Date(job.deployed_at).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${statusCfg.cls}`}>
                          <StatusIcon className={`w-3 h-3 mr-1 ${job.status === "deploying" || job.status === "running" ? "animate-spin" : ""}`} />
                          {statusCfg.label}
                        </span>
                      </div>
                    </div>

                    {/* 制品列表 */}
                    {job.artifacts.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.artifacts.map((art) => (
                          <span key={art.id} className="text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-200">
                            {art.name} ({(art.size / 1024 / 1024).toFixed(1)} MB)
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="mt-3 flex items-center gap-2">
                      {(job.status === "draft" || job.status === "failed") && (
                        <button onClick={() => handleDeploy(job.id)} disabled={deployingJob === job.id}
                          className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 disabled:opacity-50">
                          <Play className="w-3.5 h-3.5" />{deployingJob === job.id ? "部署中..." : "部署"}
                        </button>
                      )}
                      <button onClick={() => handleViewLogs(job.id)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
                        部署日志
                      </button>
                      {job.status === "deployed" && (
                        <button onClick={() => handleRollback(job.id)} disabled={rollingBack === job.id}
                          className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 disabled:opacity-50">
                          <RotateCcw className="w-3.5 h-3.5" />{rollingBack === job.id ? "回滚中..." : "回滚"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* 环境列表 */}
        {activeTab === "environments" && (
          loading ? (
            <div className="grid grid-cols-3 gap-4">{Array(3).fill(0).map((_, i) => <div key={i} className="card p-5 animate-pulse"><div className="h-4 bg-slate-100 rounded w-1/2" /></div>)}</div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {environments.map((env) => {
                const envColor = env.env_type === "production" ? "text-red-600" : env.env_type === "staging" ? "text-amber-600" : "text-emerald-600";
                return (
                  <div key={env.id} className="card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                        <Server className="w-5 h-5 text-slate-500" />
                      </div>
                      <span className={`badge ${env.status === "running" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {env.status === "running" ? "运行中" : env.status}
                      </span>
                    </div>
                    <h3 className={`font-semibold ${envColor}`}>{env.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{env.description}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>版本: <strong>{env.version}</strong></span>
                      <span>{env.instance_count} 个实例</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* 制品列表 */}
        {activeTab === "artifacts" && (
          loading ? (
            <div className="space-y-2">{Array(4).fill(0).map((_, i) => <div key={i} className="card p-4 animate-pulse"><div className="h-4 bg-slate-100 rounded w-1/4" /></div>)}</div>
          ) : (
            <div className="card overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>文件名</th>
                    <th>类型</th>
                    <th>大小</th>
                    <th>关联任务</th>
                    <th>上传者</th>
                    <th>上传时间</th>
                  </tr>
                </thead>
                <tbody>
                  {artifacts.map((art) => (
                    <tr key={art.id}>
                      <td className="font-medium">{art.name}</td>
                      <td><span className="badge bg-slate-100 text-slate-600">{art.artifact_type}</span></td>
                      <td className="text-slate-500">{art.size_formatted}</td>
                      <td className="text-slate-500">{art.job_id}</td>
                      <td className="text-slate-500">{art.uploaded_by}</td>
                      <td className="text-slate-400 text-xs">{new Date(art.uploaded_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </main>

      {/* 部署日志弹窗 */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold">部署日志</h3>
              <button onClick={() => setShowLogsModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loadingLogs ? (
                <div className="text-center py-8 text-slate-500">加载中...</div>
              ) : (
                <div className="font-mono text-xs space-y-1 bg-slate-900 text-slate-100 rounded-lg p-4">
                  {logs.map((log, i) => (
                    <div key={i} className={logLevelColor(log.level)}>
                      <span className="text-slate-500">[{log.timestamp.split("T")[1].split("Z")[0]}]</span>{" "}
                      <span>[{log.level}]</span>{" "}
                      {log.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 新建发布任务弹窗 */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">新建发布任务</h3>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">任务名称</label>
                <input type="text" value={jobForm.name} onChange={(e) => setJobForm({ ...jobForm, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="例如：客服意图识别 v1.2.0" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">版本号</label>
                  <input type="text" value={jobForm.version} onChange={(e) => setJobForm({ ...jobForm, version: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="v1.0.0" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">目标环境</label>
                  <select value={jobForm.env} onChange={(e) => setJobForm({ ...jobForm, env: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="test">测试环境</option>
                    <option value="staging">预发环境</option>
                    <option value="production">生产环境</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">制品类型</label>
                <select value={jobForm.artifact_type} onChange={(e) => setJobForm({ ...jobForm, artifact_type: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="dataset">仅数据集</option>
                  <option value="model">仅模型</option>
                  <option value="full">数据集 + 模型</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowJobModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-lg">创建</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
