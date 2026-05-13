"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Brain, ArrowLeft, Cpu, Target, Zap, BarChart3, Save, X, Plus,
  AlertCircle, CheckCircle2, RefreshCw, Clock
} from "lucide-react";
import { MOCK_SMART_JOBS, getSmartJobs, saveSmartJobs, SmartAnnotationJob } from "../../_mock";

const AVAILABLE_MODELS = [
  { id: "m1", name: "意图识别模型-v3.2", type: "text" },
  { id: "m2", name: "情感分析模型-v2.1", type: "text" },
  { id: "m3", name: "BERT-NER-v1.5", type: "text" },
  { id: "m4", name: "图像分类模型-v2.0", type: "image" },
  { id: "m5", name: "目标检测模型-v1.8", type: "image" },
  { id: "m6", name: "语音识别模型-v1.5", type: "audio" },
  { id: "m7", name: "YOLOv8-交通事件检测-v1.0", type: "image" },
  { id: "m8", name: "ResNet-事件分类-v2.1", type: "image" },
  { id: "m9", name: "DeepSort-轨迹跟踪-v1.2", type: "image" },
];

function SmartAnnotationEditContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [job, setJob] = useState<SmartAnnotationJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    strategy: "active_learning",
    model_name: "",
    confidence_threshold: 0.9,
    sampling_rate: 0.2,
    auto_pass_threshold: 0.92,
  });

  useEffect(() => {
    // 同步 localStorage，确保数据一致
    const stored = getSmartJobs();
    if (stored.length === 0) {
      saveSmartJobs(MOCK_SMART_JOBS);
    }
    const jobs = stored.length > 0 ? stored : MOCK_SMART_JOBS;
    const found = jobs.find(j => j.id === id);
    if (found) {
      setJob(found);
      setForm({
        name: found.name,
        strategy: found.strategy,
        model_name: found.model_name,
        confidence_threshold: found.confidence_threshold || 0.9,
        sampling_rate: found.sampling_rate || 0.2,
        auto_pass_threshold: found.auto_pass_threshold || 0.92,
      });
    }
    setLoading(false);
  }, [id]);

  const handleSave = () => {
    if (!form.name || !form.model_name) {
      alert("请填写任务名称和选择预标注模型");
      return;
    }

    const jobs = getSmartJobs();
    const index = jobs.findIndex(j => j.id === id);
    if (index !== -1) {
      jobs[index] = {
        ...jobs[index],
        name: form.name,
        strategy: form.strategy,
        model_name: form.model_name,
        confidence_threshold: form.confidence_threshold,
        sampling_rate: form.sampling_rate,
        auto_pass_threshold: form.auto_pass_threshold,
      };
      saveSmartJobs(jobs);
      router.push("/smart-annotation");
    }
  };

  const selectedModel = AVAILABLE_MODELS.find(m => m.name === form.model_name);

  if (loading) {
    return (
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ color: "#94a3b8" }}>加载中...</div>
      </main>
    );
  }

  if (!job) {
    return (
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", flexDirection: "column", gap: 16 }}>
        <AlertCircle size={48} color="#dc2626" />
        <div style={{ fontSize: 16, color: "#1e293b", fontWeight: 600 }}>智能标注任务不存在</div>
        <button
          onClick={() => router.push("/smart-annotation")}
          style={{ padding: "10px 20px", background: "#8b5cf6", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          返回列表
        </button>
      </main>
    );
  }

  return (
    <main style={{ flex: 1, overflowY: "auto", background: "#f8fafc", minHeight: "100vh" }}>
      {/* 顶部导航 */}
      <div style={{ padding: "20px 32px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => router.push("/smart-annotation")}
            style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", textDecoration: "none", fontSize: 13, background: "none", border: "none", cursor: "pointer" }}
          >
            <ArrowLeft size={16} />
            返回列表
          </button>
          <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>编辑智能标注任务</h1>
        </div>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 800 }}>
        {/* 基本信息 */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0", marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <Brain size={16} color="#6366f1" />
            基本信息
          </h3>
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>
              任务名称 <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="输入任务名称"
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14 }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>
              关联数据集
            </label>
            <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: 8, fontSize: 14, color: "#64748b" }}>
              {job.dataset_name}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>
              预标注模型 <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {AVAILABLE_MODELS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setForm({ ...form, model_name: m.name })}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 8,
                    border: "2px solid",
                    borderColor: form.model_name === m.name ? "#6366f1" : "#e2e8f0",
                    background: form.model_name === m.name ? "#eef2ff" : "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Cpu size={14} color={form.model_name === m.name ? "#6366f1" : "#94a3b8"} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: form.model_name === m.name ? "#6366f1" : "#1e293b" }}>
                      {m.name}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    类型：{m.type === "text" ? "文本" : m.type === "image" ? "图像" : "音频"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 策略配置 */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0", marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <Target size={16} color="#7c3aed" />
            智能策略
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { value: "active_learning", label: "主动学习", Icon: Target, color: "#7c3aed", desc: "AI筛选高价值样本优先标注" },
              { value: "full_prelabel", label: "全量预标注", Icon: Brain, color: "#2563eb", desc: "AI全量推理后人工审核" },
              { value: "confidence_filter", label: "置信度过滤", Icon: Zap, color: "#d97706", desc: "按置信度分层处理" },
            ].map(s => {
              const Icon = s.Icon;
              return (
                <button
                  key={s.value}
                  onClick={() => setForm({ ...form, strategy: s.value })}
                  style={{
                    padding: 16,
                    borderRadius: 10,
                    border: "2px solid",
                    borderColor: form.strategy === s.value ? s.color : "#e2e8f0",
                    background: form.strategy === s.value ? `${s.color}10` : "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, background: s.color, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={18} color="#fff" />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{s.desc}</div>
                </button>
              );
            })}
          </div>

          {/* 策略参数 */}
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 16 }}>策略参数配置</div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ fontSize: 12, color: "#64748b" }}>置信度阈值</label>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>≥ {form.confidence_threshold}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.05"
                value={form.confidence_threshold}
                onChange={e => setForm({ ...form, confidence_threshold: parseFloat(e.target.value) })}
                style={{ width: "100%", accentColor: "#6366f1" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
                <span>0.5</span>
                <span>0.75</span>
                <span>1.0</span>
              </div>
            </div>

            {form.strategy === "active_learning" && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <label style={{ fontSize: 12, color: "#64748b" }}>采样比例</label>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{form.sampling_rate * 100}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.05"
                  value={form.sampling_rate}
                  onChange={e => setForm({ ...form, sampling_rate: parseFloat(e.target.value) })}
                  style={{ width: "100%", accentColor: "#7c3aed" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
                  <span>5%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>
              </div>
            )}

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ fontSize: 12, color: "#64748b" }}>自动通过阈值</label>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>≥ {form.auto_pass_threshold}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.05"
                value={form.auto_pass_threshold}
                onChange={e => setForm({ ...form, auto_pass_threshold: parseFloat(e.target.value) })}
                style={{ width: "100%", accentColor: "#16a34a" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
                <span>0.5</span>
                <span>0.75</span>
                <span>1.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={() => router.push("/smart-annotation")}
            style={{ padding: "12px 24px", background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            style={{ padding: "12px 24px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
          >
            <Save size={16} />
            保存修改
          </button>
        </div>
      </div>
    </main>
  );
}

// 包装组件：添加 Suspense
export default function SmartAnnotationEditPage() {
  return (
    <Suspense fallback={
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ color: "#94a3b8" }}>加载中...</div>
      </main>
    }>
      <SmartAnnotationEditContent />
    </Suspense>
  );
}
