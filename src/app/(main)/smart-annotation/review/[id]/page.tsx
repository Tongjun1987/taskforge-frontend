"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Check, X, AlertCircle, CheckCircle2,
  ChevronLeft, ChevronRight, ClipboardList,
  ThumbsUp, ThumbsDown, RefreshCw, Filter, CheckCheck
} from "lucide-react";
import toast from "react-hot-toast";
import { getSmartJobs, saveSmartJobs, SmartAnnotationJob } from "../../_mock";

// 待审核数据类型
interface ReviewItem {
  id: string;
  content: string;
  type: "image" | "text";
  aiLabel: string;
  aiConfidence: number;
  humanLabel?: string;
  status: "pending" | "approved" | "rejected";
  reason?: string; // 驳回原因
}

// 生成 Mock 待审核数据
function generateMockItems(job: SmartAnnotationJob): ReviewItem[] {
  const items: ReviewItem[] = [];
  const count = Math.min(job.pending_review, 30);

  const imageLabels = ["交通事故", "车辆违章", "道路拥堵", "行人闯红灯", "违章停车", "逆行", "闯红灯"];
  const textLabels = [
    "前方发生交通事故，请减速慢行",
    "道路存在异常物体，请注意绕行",
    "车辆行驶异常，请保持车距",
    "交通信号灯故障，请谨慎通行",
    "道路施工，请绕行",
    "前方拥堵，建议提前变道",
  ];

  for (let i = 0; i < count; i++) {
    const isImage = job.strategy.includes("prelabel") || i % 3 !== 0;
    const labels = isImage ? imageLabels : textLabels;
    const label = labels[Math.floor(Math.random() * labels.length)];
    const confidence = Math.round((0.5 + Math.random() * 0.45) * 100) / 100;

    items.push({
      id: `${job.id}-item-${i}`,
      content: isImage ? `https://picsum.photos/seed/${job.id}${i}/400/300` : label,
      type: isImage ? "image" : "text",
      aiLabel: label,
      aiConfidence: confidence,
      status: "pending",
    });
  }

  return items;
}

// 驳回原因选项
const REJECT_REASONS = [
  "标注类别错误",
  "标注区域不准确",
  "漏标目标",
  "重复标注",
  "置信度过低",
  "其他",
];

function SmartAnnotationReviewContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [job, setJob] = useState<SmartAnnotationJob | null>(null);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");

  useEffect(() => {
    const jobs = getSmartJobs();
    const found = jobs.find((j) => j.id === id);
    if (found) {
      setJob(found);
      setItems(generateMockItems(found));
    }
    setLoading(false);
  }, [id]);

  // 键盘快捷键
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showRejectModal) return;
      if (e.key === "Enter") handleApprove();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const handleApprove = () => {
    const updated = [...items];
    if (updated[currentIndex] && updated[currentIndex].status === "pending") {
      updated[currentIndex] = {
        ...updated[currentIndex],
        status: "approved",
        humanLabel: updated[currentIndex].aiLabel,
      };
      setItems(updated);
      setReviewedCount(prev => prev + 1);
      setApprovedCount(prev => prev + 1);
      if (currentIndex < updated.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }
  };

  const handleReject = () => {
    if (!rejectReason) {
      toast.error("请选择驳回原因");
      return;
    }
    const updated = [...items];
    if (updated[currentIndex]) {
      updated[currentIndex] = {
        ...updated[currentIndex],
        status: "rejected",
        humanLabel: "",
        reason: rejectReason,
      };
      setItems(updated);
      setReviewedCount(prev => prev + 1);
      setRejectedCount(prev => prev + 1);
      setShowRejectModal(false);
      setRejectReason("");
      if (currentIndex < updated.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }
  };

  const handleSkip = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleFinish = () => {
    const jobs = getSmartJobs();
    const idx = jobs.findIndex((j) => j.id === id);
    if (idx !== -1) {
      jobs[idx] = {
        ...jobs[idx],
        pending_review: Math.max(0, jobs[idx].pending_review - reviewedCount),
        auto_approved: jobs[idx].auto_approved + approvedCount,
      };
      saveSmartJobs(jobs);
    }
    toast.success(`审核完成：通过 ${approvedCount}，驳回 ${rejectedCount}`);
    router.push("/smart-annotation");
  };

  if (loading) {
    return (
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 8 }}>
          <RefreshCw size={16} className="animate-spin" /> 加载中...
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", flexDirection: "column", gap: 16 }}>
        <AlertCircle size={48} color="#dc2626" />
        <div style={{ fontSize: 16, color: "#1e293b", fontWeight: 600 }}>智能标注任务不存在</div>
        <button onClick={() => router.push("/smart-annotation")} style={{ padding: "10px 20px", background: "#8b5cf6", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          返回列表
        </button>
      </main>
    );
  }

  // 过滤项目
  const filteredItems = items.filter(item => {
    if (filterStatus === "all") return true;
    return item.status === filterStatus;
  });

  // 显示当前过滤后的项目
  const displayItems = filterStatus === "all" ? items : filteredItems;
  const displayIndex = filterStatus === "all" ? currentIndex : Math.min(currentIndex, displayItems.length - 1);
  const currentDisplayItem = displayItems[displayIndex];
  const pendingItems = items.filter(i => i.status === "pending").length;
  const reviewedItems = items.filter(i => i.status !== "pending").length;

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.85) return "#16a34a";
    if (conf >= 0.7) return "#d97706";
    return "#dc2626";
  };

  const getConfidenceBg = (conf: number) => {
    if (conf >= 0.85) return "#dcfce7";
    if (conf >= 0.7) return "#fef3c7";
    return "#fee2e2";
  };

  return (
    <main style={{ flex: 1, overflowY: "auto", background: "#f8fafc", minHeight: "100vh" }}>
      {/* 顶部导航 */}
      <div style={{ padding: "16px 32px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.push("/smart-annotation")} style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", textDecoration: "none", fontSize: 13, background: "none", border: "none", cursor: "pointer" }}>
            <ArrowLeft size={16} /> 返回智能标注
          </button>
          <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
          <ClipboardList size={18} color="#4f46e5" />
          <h1 style={{ fontSize: 17, fontWeight: 700, color: "#1e293b", margin: 0 }}>人工审核</h1>
          <span style={{ padding: "3px 10px", borderRadius: 5, fontSize: 12, background: "#f5f3ff", color: "#4f46e5", fontWeight: 600 }}>
            {job.name}
          </span>
        </div>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>
        {/* 审核进度 */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 20, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>审核进度</span>
              {/* 状态筛选 */}
              <div style={{ display: "flex", gap: 4, marginLeft: 16 }}>
                {([
                  { key: "all", label: `全部 (${items.length})` },
                  { key: "pending", label: `待审核 (${pendingItems})` },
                  { key: "approved", label: `已通过 (${approvedCount})` },
                  { key: "rejected", label: `已驳回 (${rejectedCount})` },
                ] as const).map(f => (
                  <button key={f.key} onClick={() => { setFilterStatus(f.key); setCurrentIndex(0); }}
                    style={{
                      padding: "3px 10px", borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: "pointer",
                      border: "1px solid",
                      borderColor: filterStatus === f.key ? "#8b5cf6" : "#e2e8f0",
                      background: filterStatus === f.key ? "#f5f3ff" : "#fff",
                      color: filterStatus === f.key ? "#4f46e5" : "#64748b",
                    }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <span style={{ fontSize: 14, color: "#64748b" }}>{displayIndex + 1} / {displayItems.length}</span>
          </div>
          {/* 进度条 */}
          <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${reviewedItems > 0 ? (reviewedItems / items.length) * 100 : 0}%`, background: "linear-gradient(90deg, #8b5cf6, #6366f1)", borderRadius: 3, transition: "width 0.3s" }} />
          </div>
          {/* 统计 */}
          <div style={{ display: "flex", gap: 24, marginTop: 12, fontSize: 13 }}>
            <span style={{ color: "#64748b" }}>待审核: <strong style={{ color: "#d97706" }}>{pendingItems}</strong></span>
            <span style={{ color: "#64748b" }}>已通过: <strong style={{ color: "#16a34a" }}>{approvedCount}</strong></span>
            <span style={{ color: "#64748b" }}>已驳回: <strong style={{ color: "#dc2626" }}>{rejectedCount}</strong></span>
            <span style={{ color: "#64748b" }}>快捷键: <kbd style={{ padding: "1px 5px", background: "#f1f5f9", borderRadius: 3, fontSize: 11 }}>Enter</kbd> 通过 <kbd style={{ padding: "1px 5px", background: "#f1f5f9", borderRadius: 3, fontSize: 11 }}>←→</kbd> 切换</span>
          </div>
        </div>

        {currentDisplayItem ? (
          <>
            {/* 当前审核卡片 */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 20 }}>
              {/* 头部 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #f1f5f9", background: "#fafafc" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    padding: "3px 12px", borderRadius: 5, fontSize: 12, fontWeight: 700,
                    background: currentDisplayItem.status === "pending" ? "#fef3c7" : currentDisplayItem.status === "approved" ? "#dcfce7" : "#fee2e2",
                    color: currentDisplayItem.status === "pending" ? "#d97706" : currentDisplayItem.status === "approved" ? "#16a34a" : "#dc2626",
                  }}>
                    {currentDisplayItem.status === "pending" ? "待审核" : currentDisplayItem.status === "approved" ? "已通过" : "已驳回"}
                  </span>
                  <span style={{ fontSize: 13, color: "#64748b" }}>
                    AI 置信度:
                    <span style={{
                      marginLeft: 6, padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700,
                      background: getConfidenceBg(currentDisplayItem.aiConfidence),
                      color: getConfidenceColor(currentDisplayItem.aiConfidence),
                    }}>
                      {Math.round(currentDisplayItem.aiConfidence * 100)}%
                    </span>
                  </span>
                  {currentDisplayItem.status !== "pending" && (
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      {currentDisplayItem.status === "approved" ? "人工确认" : `驳回原因: ${currentDisplayItem.reason || "-"}`}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>#{currentDisplayItem.id.split("-item-")[1]}</span>
              </div>

              {/* 数据内容 */}
              <div style={{ padding: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                  {/* AI 预标注 */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <span style={{ padding: "2px 8px", background: "#ede9fe", color: "#7c3aed", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>AI 预标注结果</span>
                    </div>
                    {currentDisplayItem.type === "image" ? (
                      <div style={{ borderRadius: 10, overflow: "hidden", border: "2px solid #ddd6fe", background: "#f5f3ff" }}>
                        <img
                          src={currentDisplayItem.content}
                          alt="AI预标注"
                          style={{ width: "100%", maxHeight: 240, objectFit: "contain", display: "block" }}
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <div style={{ padding: "10px 14px", background: "#fff", fontSize: 14, fontWeight: 700, color: "#4f46e5", borderTop: "1px solid #ede9fe" }}>
                          📌 {currentDisplayItem.aiLabel}
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: 16, background: "#f5f3ff", borderRadius: 10, border: "2px solid #ddd6fe", fontSize: 15, color: "#1e293b", minHeight: 80, display: "flex", alignItems: "center" }}>
                        <span style={{ fontWeight: 600, color: "#4f46e5", marginRight: 8 }}>📌</span>
                        {currentDisplayItem.content}
                      </div>
                    )}
                    <div style={{ marginTop: 8, padding: "6px 12px", background: "#ede9fe", borderRadius: 6, fontSize: 13, color: "#7c3aed", fontWeight: 600 }}>
                      预测类别: {currentDisplayItem.aiLabel}
                    </div>
                  </div>

                  {/* 人工标注（审核后显示） */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <span style={{ padding: "2px 8px", background: "#e0e7ff", color: "#1d4ed8", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>人工标注</span>
                    </div>
                    <div style={{ padding: "16px 20px", background: "#f8fafc", borderRadius: 10, border: "2px dashed #e2e8f0", minHeight: 160, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                      {currentDisplayItem.status === "pending" ? (
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 24, marginBottom: 8 }}>✍️</div>
                          <div style={{ fontSize: 13, color: "#94a3b8" }}>审核后显示人工标注结果</div>
                        </div>
                      ) : currentDisplayItem.status === "approved" ? (
                        <div style={{ width: "100%" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                            <CheckCircle2 size={16} color="#16a34a" />
                            <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>确认通过</span>
                          </div>
                          <div style={{ padding: "8px 12px", background: "#dcfce7", borderRadius: 6, fontSize: 14, fontWeight: 700, color: "#16a34a" }}>
                            {currentDisplayItem.humanLabel}
                          </div>
                        </div>
                      ) : (
                        <div style={{ width: "100%" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                            <X size={16} color="#dc2626" />
                            <span style={{ fontSize: 13, color: "#dc2626", fontWeight: 600 }}>已驳回</span>
                          </div>
                          <div style={{ padding: "8px 12px", background: "#fee2e2", borderRadius: 6, fontSize: 13, color: "#dc2626" }}>
                            驳回原因: {currentDisplayItem.reason}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 操作区 */}
                {currentDisplayItem.status === "pending" && (
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", padding: "16px 0 0", borderTop: "1px solid #f1f5f9" }}>
                    <button onClick={() => setShowRejectModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", fontSize: 14, fontWeight: 700, color: "#dc2626", background: "#fef2f2", border: "2px solid #fecaca", borderRadius: 10, cursor: "pointer" }}>
                      <ThumbsDown size={18} /> 驳回
                    </button>
                    <button onClick={handleSkip} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", fontSize: 14, fontWeight: 600, color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, cursor: "pointer" }}>
                      <ChevronRight size={18} /> 跳过
                    </button>
                    <button onClick={handleApprove} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", fontSize: 14, fontWeight: 700, color: "#fff", background: "#16a34a", border: "2px solid #86efac", borderRadius: 10, cursor: "pointer", boxShadow: "0 2px 8px rgba(22,163,74,0.3)" }}>
                      <ThumbsUp size={18} /> 通过 (Enter)
                    </button>
                  </div>
                )}

                {currentDisplayItem.status !== "pending" && (
                  <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
                    <button onClick={() => {
                      const updated = [...items];
                      const originalIndex = items.findIndex(i => i.id === currentDisplayItem.id);
                      if (originalIndex !== -1) {
                        updated[originalIndex] = { ...updated[originalIndex], status: "pending", humanLabel: undefined, reason: undefined };
                        setItems(updated);
                        if (currentDisplayItem.status === "approved") {
                          setApprovedCount(p => p - 1);
                          setReviewedCount(p => p - 1);
                        } else {
                          setRejectedCount(p => p - 1);
                          setReviewedCount(p => p - 1);
                        }
                      }
                    }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: 13, color: "#64748b", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer" }}>
                      <RefreshCw size={14} /> 重新审核
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 导航 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={handlePrev} disabled={displayIndex === 0} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", fontSize: 13, color: "#64748b", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, cursor: displayIndex === 0 ? "not-allowed" : "pointer", opacity: displayIndex === 0 ? 0.4 : 1 }}>
                <ChevronLeft size={16} /> 上一条
              </button>
              {pendingItems === 0 ? (
                <button onClick={handleFinish} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 32px", fontSize: 14, fontWeight: 700, color: "#fff", background: "#4f46e5", border: "none", borderRadius: 10, cursor: "pointer", boxShadow: "0 2px 8px rgba(79,70,229,0.3)" }}>
                  <CheckCheck size={18} /> 完成审核，返回列表
                </button>
              ) : null}
              <button onClick={handleNext} disabled={displayIndex >= displayItems.length - 1} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", fontSize: 13, color: "#64748b", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, cursor: displayIndex >= displayItems.length - 1 ? "not-allowed" : "pointer", opacity: displayIndex >= displayItems.length - 1 ? 0.4 : 1 }}>
                下一条 <ChevronRight size={16} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ background: "#fff", borderRadius: 12, padding: 60, border: "1px solid #e2e8f0", textAlign: "center" }}>
            <CheckCircle2 size={64} color="#16a34a" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>该分类下无数据</h2>
            <button onClick={() => { setFilterStatus("all"); setCurrentIndex(0); }} style={{ padding: "10px 24px", fontSize: 13, fontWeight: 600, color: "#4f46e5", background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 8, cursor: "pointer" }}>
              查看全部
            </button>
          </div>
        )}
      </div>

      {/* 驳回弹窗 */}
      {showRejectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, background: "#fee2e2", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={18} color="#dc2626" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>驳回此标注</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>请选择驳回原因</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {REJECT_REASONS.map(reason => (
                <button key={reason} onClick={() => setRejectReason(reason)} style={{
                  padding: "10px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
                  border: "1px solid", borderColor: rejectReason === reason ? "#8b5cf6" : "#e2e8f0",
                  background: rejectReason === reason ? "#f5f3ff" : "#fff",
                  color: rejectReason === reason ? "#4f46e5" : "#475569",
                }}>
                  {reason}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setShowRejectModal(false); setRejectReason(""); }} style={{ flex: 1, padding: "11px", fontSize: 14, fontWeight: 600, color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer" }}>
                取消
              </button>
              <button onClick={handleReject} disabled={!rejectReason} style={{ flex: 1, padding: "11px", fontSize: 14, fontWeight: 700, color: "#fff", background: "#dc2626", border: "none", borderRadius: 8, cursor: "pointer", opacity: rejectReason ? 1 : 0.5 }}>
                确认驳回
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function SmartAnnotationReviewPage() {
  return (
    <Suspense fallback={
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ color: "#94a3b8" }}>加载中...</div>
      </main>
    }>
      <SmartAnnotationReviewContent />
    </Suspense>
  );
}
