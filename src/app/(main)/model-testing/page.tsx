"use client";
import React, { useState } from "react";
import {
  Cpu, Send, MessageSquare, Image, Mic, RefreshCw,
  Settings, ChevronDown, Database, Zap, Brain, Trash2,
  Copy, Download, Sparkles, Play
} from "lucide-react";
import toast from "react-hot-toast";

const ENGINES = [
  { value: "transformers", label: "Transformers", desc: "HuggingFace官方推理引擎，兼容性最好" },
  { value: "vllm", label: "vLLM", desc: "PagedAttention，高吞吐，低延迟" },
];

const MODELS = [
  { value: "Qwen2.5-7B-Instruct", label: "Qwen2.5-7B-Instruct", type: "text" },
  { value: "DeepSeek-V2.5", label: "DeepSeek-V2.5", type: "text" },
  { value: "LLaMA-3-8B", label: "LLaMA-3-8B", type: "text" },
  { value: "Qwen2-VL-72B", label: "Qwen2-VL-72B", type: "image" },
  { value: "LLaVA-1.6-34B", label: "LLaVA-1.6-34B", type: "image" },
  { value: "Whisper-Large-V3", label: "Whisper-Large-V3", type: "audio" },
];

const PRESET_PROMPTS = [
  "请介绍一下人工智能的发展历史",
  "用Python写一个快速排序算法",
  "解释一下什么是大语言模型",
  "写一首关于春天的七言绝句",
];

interface Message {
  role: "user" | "assistant";
  content: string;
  time: string;
}

interface ChatSession {
  id: string;
  name: string;
  model: string;
  engine: string;
  messages: Message[];
  created_at: string;
}

const MOCK_RESPONSES: Record<string, string[]> = {
  default: [
    "好的，我来为您解答。这是一个复杂的问题，让我从多个角度来分析：\n\n1. 首先，从技术层面看...\n2. 其次，从应用层面看...\n3. 最后，从发展趋势看...\n\n总体而言，这是一个充满机遇的领域。",
    "这是一个很好的问题！让我为您详细解答。\n\n根据最新的研究和发展趋势，我认为主要有以下几个方面值得关注：\n\n**核心技术**\n- Transformer架构\n- RLHF对齐技术\n- 模型压缩与加速\n\n**应用场景**\n- 智能客服\n- 内容生成\n- 代码辅助",
  ],
};

export default function ModelTestingPage() {
  const [engine, setEngine] = useState("vllm");
  const [model, setModel] = useState("Qwen2.5-7B-Instruct");
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: "s1", name: "Qwen对话测试", model: "Qwen2.5-7B-Instruct", engine: "vllm",
      messages: [
        { role: "user", content: "请介绍一下量子计算的基本原理", time: "10:00" },
        { role: "assistant", content: "量子计算是一种基于量子力学原理的计算方式。与传统计算机使用比特（0或1）不同，量子计算机使用量子比特（Qubit），它可以同时处于0和1的叠加态。这种特性使得量子计算机在处理某些特定问题时具有指数级的速度优势。", time: "10:01" },
        { role: "user", content: "量子纠缠是什么？", time: "10:02" },
        { role: "assistant", content: "量子纠缠是量子力学中最神奇的现象之一。当两个量子比特处于纠缠态时，无论它们相距多远，对其中一个粒子的测量会立即影响另一个粒子的状态。爱因斯坦称之为「鬼魅般的超距作用」。", time: "10:03" },
      ],
      created_at: "2025-04-18",
    },
  ]);
  const [activeSession, setActiveSession] = useState("s1");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({ temperature: 0.7, max_tokens: 2048, top_p: 0.9, top_k: 50 });

  const currentSession = sessions.find(s => s.id === activeSession) || sessions[0];

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input.trim(), time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) };
    setSessions(prev => prev.map(s => s.id === activeSession ? { ...s, messages: [...s.messages, userMsg] } : s));
    setInput("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const responses = MOCK_RESPONSES.default;
    const resp: Message = { role: "assistant", content: responses[Math.floor(Math.random() * responses.length)], time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) };
    setSessions(prev => prev.map(s => s.id === activeSession ? { ...s, messages: [...s.messages, resp] } : s));
    setLoading(false);
  };

  const newSession = () => {
    const id = "s" + Date.now();
    const newS: ChatSession = { id, name: `测试会话 ${sessions.length + 1}`, model, engine, messages: [], created_at: new Date().toLocaleDateString("zh-CN") };
    setSessions(prev => [...prev, newS]);
    setActiveSession(id);
  };

  const deleteSession = (id: string) => {
    if (sessions.length === 1) { toast.error("至少保留一个会话"); return; }
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSession === id) setActiveSession(sessions[0]?.id);
    toast.success("会话已删除");
  };

  return (
    <main style={{ flex: 1, overflowY: "auto", background: "#f8fafc", minHeight: "100vh", display: "flex" }}>
      {/* 左侧边栏：会话列表 */}
      <div style={{ width: 240, borderRight: "1px solid #e2e8f0", background: "#fff", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #e2e8f0" }}>
          <button onClick={newSession} style={{ width: "100%", height: 36, borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <Sparkles size={13} />新建会话
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {sessions.map(s => (
            <div key={s.id} onClick={() => setActiveSession(s.id)}
              style={{ padding: "8px 10px", borderRadius: 6, cursor: "pointer", background: activeSession === s.id ? "#fffbeb" : "transparent", border: `1px solid ${activeSession === s.id ? "#f59e0b" : "transparent"}`, marginBottom: 4 }}>
              <div style={{ fontSize: 12, fontWeight: activeSession === s.id ? 600 : 400, color: activeSession === s.id ? "#d97706" : "#334155", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>{s.messages.length} 条消息 · {s.created_at}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧主内容 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* 顶部标题 */}
        <div style={{ padding: "20px 24px 0", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f59e0b15", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Brain size={18} color="#f59e0b" />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>模型测试</h2>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0 0" }}>对话交互 · 效果验证 · 推理引擎对比</p>
            </div>
          </div>
          {/* 引擎和模型选择 */}
          <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 160px" }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>推理引擎</label>
              <select value={engine} onChange={e => setEngine(e.target.value)}
                style={{ width: "100%", height: 32, padding: "0 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", background: "#fff" }}>
                {ENGINES.map(e => <option key={e.value}>{e.label}</option>)}
              </select>
            </div>
            <div style={{ flex: "2 1 280px" }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>测试模型</label>
              <select value={model} onChange={e => setModel(e.target.value)}
                style={{ width: "100%", height: 32, padding: "0 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", background: "#fff" }}>
                {MODELS.map(m => <option key={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div style={{ flex: "1 1 140px" }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Temperature</label>
              <input type="number" value={params.temperature} step={0.1} min={0} max={2}
                onChange={e => setParams(p => ({ ...p, temperature: Number(e.target.value) }))}
                style={{ width: "100%", height: 32, padding: "0 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", background: "#f8fafc" }} />
            </div>
            <div style={{ flex: "1 1 140px" }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Max Tokens</label>
              <input type="number" value={params.max_tokens} step={1}
                onChange={e => setParams(p => ({ ...p, max_tokens: Number(e.target.value) }))}
                style={{ width: "100%", height: 32, padding: "0 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", background: "#f8fafc" }} />
            </div>
          </div>
        </div>

        {/* 消息区域 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {currentSession.messages.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
              <MessageSquare size={40} style={{ display: "block", margin: "0 auto 12px", opacity: 0.5 }} />
              <div style={{ fontSize: 14, marginBottom: 16 }}>开始与模型对话</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {PRESET_PROMPTS.map(p => (
                  <button key={p} onClick={() => { setInput(p); }}
                    style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid #e2e8f0", background: "#fff", fontSize: 11, color: "#64748b", cursor: "pointer" }}>
                    {p.slice(0, 12)}...
                  </button>
                ))}
              </div>
            </div>
          )}
          {currentSession.messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: msg.role === "user" ? "#eff6ff" : "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {msg.role === "user" ? <MessageSquare size={15} color="#3b82f6" /> : <Brain size={15} color="#f59e0b" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{msg.role === "user" ? "你" : model.split("-")[0]}</span>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>{msg.time}</span>
                </div>
                <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.7, background: msg.role === "user" ? "#eff6ff" : "#fff", border: "1px solid #e2e8f0", borderRadius: "0 10px 10px 10px", padding: "12px 16px", whiteSpace: "pre-wrap" }}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Brain size={15} color="#f59e0b" />
              </div>
              <div style={{ padding: "12px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0 10px 10px 10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: 13 }}>
                  <RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} />正在生成回复...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 输入框 */}
        <div style={{ padding: "12px 24px 20px", background: "#fff", borderTop: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="输入消息，Enter发送，Shift+Enter换行..."
              rows={2}
              style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, color: "#334155", outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}
              style={{ height: 44, padding: "0 18px", borderRadius: 8, border: "none", background: loading || !input.trim() ? "#e2e8f0" : "#f59e0b", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
              <Send size={14} />发送
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
