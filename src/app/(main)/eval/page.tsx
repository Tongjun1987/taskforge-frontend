"use client";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/Sidebar";
import { createEvalJob, getEvalResults, generateAcceptancePackage } from "@/lib/services";
import { Plus, BarChart3, TrendingUp, Package, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

interface EvalJob {
  id: string;
  name: string;
  eval_type: string;
  status: string;
  results?: { benchmark_scores?: Record<string, number> };
  created_at: string;
}

const MOCK_BENCHMARK = {
  accuracy: 0.87, f1_macro: 0.85, precision: 0.86, recall: 0.84, auc: 0.91,
};

export default function EvalPage() {
  const [jobs, setJobs] = useState<EvalJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<EvalJob | null>(null);
  const [results, setResults] = useState<any>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [generatingPkg, setGeneratingPkg] = useState(false);
  const [form, setForm] = useState({ name: "", task_id: "", eval_type: "benchmark" });

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const mockJobs: EvalJob[] = [
        { id: "eval-001", name: "客服意图识别 v1.2.0 评测", eval_type: "benchmark", status: "completed", results: { benchmark_scores: MOCK_BENCHMARK }, created_at: "2026-04-05T12:00:00Z" },
        { id: "eval-002", name: "产品分类 v0.9.0-beta 评测", eval_type: "benchmark", status: "running", created_at: "2026-04-07T10:00:00Z" },
        { id: "eval-003", name: "情感分析 v1.0.0 评测", eval_type: "biz_value", status: "pending", created_at: "2026-04-07T08:00:00Z" },
      ];
      setJobs(mockJobs);
    } catch (err: any) {
      setError(err.response?.data?.detail || "加载失败");
      toast.error("评测任务加载失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEvalJob({ task_id: form.task_id || undefined, eval_type: form.eval_type });
      toast.success("评测任务创建成功");
      setShowModal(false);
      setForm({ name: "", task_id: "", eval_type: "benchmark" });
      fetchJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "创建失败");
    }
  };

  const handleViewResults = async (job: EvalJob) => {
    setSelectedJob(job);
    setLoadingResults(true);
    try {
      const res = await getEvalResults(job.id);
      setResults(res.data);
    } catch {
      toast.error("加载结果失败");
    } finally {
      setLoadingResults(false);
    }
  };

  const handleGeneratePkg = async () => {
    if (!selectedJob) return;
    setGeneratingPkg(true);
    try {
      await generateAcceptancePackage({ eval_job_id: selectedJob.id, dataset_id: "ds-001" });
      toast.success("验收材料包生成成功");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "生成失败");
    } finally {
      setGeneratingPkg(false);
    }
  };

  const barData = results?.results?.benchmark_scores
    ? Object.entries(results.results.benchmark_scores).map(([name, value]) => ({ name, value: Math.round((value as number) * 100) }))
    : [];
  const radarData = barData.map((d) => ({ metric: d.name.toUpperCase(), score: d.value }));

  const getStatusBadge = (status: string) => {
    const cfg: Record<string, { cls: string; label: string }> = {
      completed: { cls: "bg-emerald-100 text-emerald-700", label: "已完成" },
      running: { cls: "bg-blue-100 text-blue-700", label: "进行中" },
      pending: { cls: "bg-slate-100 text-slate-600", label: "待开始" },
    };
    const c = cfg[status] || cfg.pending;
    return <span className={`badge ${c.cls}`}>{c.label}</span>;
  };

  return (
    <>
      <TopBar title="AI 评测中心" subtitle="Benchmark + 业务价值转译，验收材料包一键生成" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-slate-500">共 <strong>{jobs.length}</strong> 个评测任务 · <span className="text-emerald-600">{jobs.filter(j => j.status === "completed").length} 已完成</span></span>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus className="w-4 h-4" />新建评测任务
          </button>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error} <button onClick={fetchJobs} className="ml-2 underline">重试</button></div>}

        {loading ? (
          <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="card p-5 animate-pulse"><div className="h-4 bg-slate-100 rounded w-1/3" /></div>)}</div>
        ) : jobs.length === 0 ? (
          <div className="card p-12 text-center">
            <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-800 font-medium mb-1">暂无评测任务</h3>
            <button onClick={() => setShowModal(true)} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm mt-4">新建评测任务</button>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{job.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span>类型: {job.eval_type}</span>
                        <span>{new Date(job.created_at).toLocaleDateString()}</span>
                        {job.results?.benchmark_scores && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <TrendingUp className="w-3 h-3" />
                            {(job.results.benchmark_scores.accuracy * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(job.status)}
                    {job.status === "completed" && (
                      <button onClick={() => handleViewResults(job)} className="text-sm text-blue-600 hover:text-blue-700">查看结果</button>
                    )}
                    {job.status === "running" && <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 结果弹窗 */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl w-full max-w-4xl mx-4">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold">{selectedJob.name}</h3>
                <p className="text-sm text-slate-500">评测结果详情</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <div className="p-6">
              {loadingResults ? (
                <div className="text-center py-12 text-slate-500">加载中...</div>
              ) : results ? (
                <>
                  {barData.length > 0 && (
                    <div className="mb-8">
                      <h4 className="font-medium text-slate-800 mb-4">Benchmark 评测结果</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={barData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(v) => [`${v}%`, "得分"]} />
                          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {radarData.length > 0 && (
                    <div className="mb-8">
                      <h4 className="font-medium text-slate-800 mb-4">能力雷达图</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                          <Radar name="模型表现" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {results.results?.baseline_comparison && (
                    <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium text-slate-800 mb-3">基线对比</h4>
                      <div className="flex items-center gap-6">
                        <div>
                          <div className="text-2xl font-bold text-slate-400">{(results.results.baseline_comparison.baseline_accuracy * 100).toFixed(1)}%</div>
                          <div className="text-xs text-slate-500">基线准确率</div>
                        </div>
                        <div className="text-slate-300 text-2xl">→</div>
                        <div>
                          <div className="text-2xl font-bold text-emerald-600">{(results.results.benchmark_scores.accuracy * 100).toFixed(1)}%</div>
                          <div className="text-xs text-slate-500">当前准确率</div>
                        </div>
                        <div className="ml-4 px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full">
                          +{((results.results.benchmark_scores.accuracy - results.results.baseline_comparison.baseline_accuracy) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-sm text-slate-500">生成验收材料包后可一键打包：场景描述 + 质量证明 + 评测结果 + 业务价值</span>
                    <button onClick={handleGeneratePkg} disabled={generatingPkg} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
                      <Package className="w-4 h-4" />{generatingPkg ? "生成中..." : "生成验收材料包"}
                    </button>
                  </div>
                </>
              ) : <div className="text-center py-12 text-slate-500">暂无评测数据</div>}
            </div>
          </div>
        </div>
      )}

      {/* 新建弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">新建评测任务</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">评测名称</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="例如：v1.2.0 性能评测" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">评测类型</label>
                <select value={form.eval_type} onChange={(e) => setForm({ ...form, eval_type: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="benchmark">Benchmark 评测</option>
                  <option value="custom">自定义评测</option>
                  <option value="llm_judge">LLM 评测</option>
                  <option value="biz_value">业务价值评测</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-lg">创建</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
