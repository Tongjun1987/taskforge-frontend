"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft, Database, FileText, Copy, Check, ExternalLink, HardDrive,
  Link2, Download, ShieldCheck, FolderTree,
  Table2, RefreshCw, Clock, Gauge,
} from "lucide-react";
import {
  type Dataset, fullName, s3Path, consolePath, objectUrl,
} from "./datasetCatalog";

const C = {
  primary: "#059669",
  primarySoft: "#ecfdf5",
  bg: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  text: "#1e293b",
  sub: "#64748b",
  faint: "#94a3b8",
  code: "#0f172a",
  codeBg: "#f8fafc",
};

type TabKey = "publish" | "preview" | "usage";

const TABS: { key: TabKey; label: string; icon: typeof FileText }[] = [
  { key: "publish", label: "发布信息", icon: FileText },
  { key: "preview", label: "数据预览", icon: Table2 },
  { key: "usage", label: "数据使用", icon: HardDrive },
];

/** 确定性伪随机串：同一数据集每次生成的演示凭证/签名一致，且看起来无明显规律 */
function randStr(len: number, alphabet: string, seedText: string) {
  let x = Array.from(seedText).reduce(
    (a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) | 0,
    2166136261,
  );
  const next = () => {
    x = (x + 0x6d2b79f5) | 0;
    let t = x;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(next() * alphabet.length)];
  return out;
}

function copy(text: string, okMsg = "已复制") {  const done = () => toast.success(okMsg);
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text: string, done: () => void) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    done();
  } catch {
    toast.error("复制失败，请手动选择文本");
  }
  document.body.removeChild(ta);
}

// ── 复制按钮 ──
function CopyBtn({ text, label = "复制", size = 11 }: { text: string; label?: string; size?: number }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => {
        copy(text);
        setOk(true);
        setTimeout(() => setOk(false), 1500);
      }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "3px 8px", borderRadius: 5, border: `1px solid ${C.border}`,
        background: "#fff", color: ok ? C.primary : C.sub,
        fontSize: size, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
      }}
    >
      {ok ? <Check size={size} /> : <Copy size={size} />}
      {ok ? "已复制" : label}
    </button>
  );
}

// ── 代码块 ──
function CodeBlock({ title, lang, code }: { title?: string; lang?: string; code: string }) {
  return (
    <div style={{
      border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden",
      background: C.codeBg,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "6px 10px", borderBottom: `1px solid ${C.border}`, background: "#fff",
      }}>
        <span style={{ fontSize: 11, color: C.faint, fontWeight: 500 }}>
          {title || "命令"}{lang ? ` · ${lang}` : ""}
        </span>
        <CopyBtn text={code} />
      </div>
      <pre style={{
        margin: 0, padding: "10px 12px", fontSize: 11.5, lineHeight: 1.75,
        color: "#0f172a", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        overflowX: "auto", whiteSpace: "pre",
      }}>{code}</pre>
    </div>
  );
}

// ── 键值对 ──
function Field({ label, value, span = 1 }: { label: string; value: React.ReactNode; span?: 1 | 2 }) {
  return (
    <div style={{ gridColumn: span === 2 ? "1 / -1" : "auto", minWidth: 0 }}>
      <div style={{ fontSize: 11, color: C.faint, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.7, wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}

function Panel({
  title, desc, extra, children,
}: { title?: string; desc?: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
      padding: "14px 16px",
    }}>
      {(title || extra) && (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: desc ? 4 : 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{title}</div>
            {desc && <div style={{ fontSize: 11.5, color: C.faint, marginTop: 3 }}>{desc}</div>}
          </div>
          {extra}
        </div>
      )}
      {!title && desc && <div style={{ fontSize: 11.5, color: C.faint, marginBottom: 12 }}>{desc}</div>}
      <div style={title ? { marginTop: 12 } : undefined}>{children}</div>
    </section>
  );
}

/** 随包材料：演示环境不提供真实文件，点击给出明确提示 */
function DocLink({ name }: { name: string }) {
  return (
    <button
      onClick={() => toast("随包材料：申请使用权限后可下载", { icon: "📄" })}
      style={{
        border: "none", background: "transparent", padding: 0, cursor: "pointer",
        color: C.primary, fontSize: 12.5, textDecoration: "underline", textUnderlineOffset: 3,
      }}
    >
      {name}
    </button>
  );
}

// ================================================================
// 发布信息
// ================================================================
function PublishTab({ d }: { d: Dataset }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Panel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 40, rowGap: 18 }}>
          <Field label="发布时间" value={d.publishAt} />
          <Field label="发布人" value={d.publisher} />

          <Field
            label="数据集唯一标识码"
            value={
              <span style={{ fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: 11.5, letterSpacing: 0.4 }}>
                {d.uid}
              </span>
            }
          />
          <Field label="数据集模态" value={d.modality} />

          <Field label="数据集分类" value={d.dataCategory} />
          <Field label="数据集所属行业" value={d.industry} />

          <Field label="数据集主体" value={d.subject} />
          <Field label="数据集领域" value={d.domain} />

          <Field label="数据集规模" value={d.scaleText} />
          <Field label="当前版本" value={d.version} />

          <Field label="数据集应用场景说明" span={2} value={d.sceneDesc} />
          <Field label="数据集使用限制" span={2} value={d.usageLimit} />

          <Field label="是否涉及个人信息" value={d.hasPii} />
          <Field label="是否需要授权使用" value={d.needAuth} />

          <Field label="说明文档" value={d.docs === "—" ? "—" : <DocLink name={d.docs} />} />
          <Field label="其他文件" value={d.attachments === "—" ? "—" : <DocLink name={d.attachments} />} />
        </div>
      </Panel>
    </div>
  );
}

// ================================================================
// 数据预览
// ================================================================
function PreviewTab({ d }: { d: Dataset }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Panel
        title="对象目录结构"
        desc={`共 ${d.storage.objectCount.toLocaleString()} 个对象，合计 ${d.storage.totalSize}`}
        extra={<a href={consolePath(d)} target="_blank" rel="noreferrer" style={{ fontSize: 11.5, color: C.primary, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}>在 MinIO 控制台打开 <ExternalLink size={11} /></a>}
      >
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 96px 72px",
            background: C.bg, padding: "7px 12px", fontSize: 11, color: C.faint, fontWeight: 500,
            borderBottom: `1px solid ${C.border}`,
          }}>
            <span>对象路径</span><span>大小</span><span>类型</span>
          </div>
          {d.storage.files.map((f) => (
            <div key={f.path} style={{
              display: "grid", gridTemplateColumns: "1fr 96px 72px",
              padding: "7px 12px", fontSize: 11.5, borderTop: `1px solid #f1f5f9`,
              alignItems: "center",
            }}>
              <span style={{
                fontFamily: "ui-monospace, Menlo, Consolas, monospace",
                color: f.kind === "目录" ? C.text : C.sub, fontWeight: f.kind === "目录" ? 600 : 400,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {f.path}
                {f.note && <span style={{ marginLeft: 8, fontFamily: "inherit", color: C.faint, fontSize: 10.5 }}>{f.note}</span>}
              </span>
              <span style={{ color: C.sub, fontSize: 11 }}>{f.size}</span>
              <span style={{
                fontSize: 10, color: f.kind === "标注" ? "#7c3aed" : f.kind === "数据" ? C.primary : C.faint,
                background: f.kind === "标注" ? "#f5f3ff" : f.kind === "数据" ? C.primarySoft : "#f1f5f9",
                padding: "1px 6px", borderRadius: 3, justifySelf: "start",
              }}>{f.kind}</span>
            </div>
          ))}
        </div>
      </Panel>

      {d.sample && (
        <Panel title="样本记录" desc="随机抽取 5 条，完整数据请按「数据使用」取数">
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
              <thead>
                <tr>
                  {d.sample.columns.map((c) => (
                    <th key={c} style={{
                      textAlign: "left", padding: "7px 12px", background: C.bg,
                      color: C.faint, fontWeight: 500, fontSize: 11, whiteSpace: "nowrap",
                      borderBottom: `1px solid ${C.border}`,
                    }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.sample.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} style={{
                        padding: "7px 12px", borderTop: i ? `1px solid #f1f5f9` : "none",
                        color: C.sub, whiteSpace: "nowrap",
                        fontFamily: j === 0 ? "ui-monospace, Menlo, Consolas, monospace" : "inherit",
                      }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {d.sampleNote && (
            <div style={{ marginTop: 10, fontSize: 11.5, color: C.sub, lineHeight: 1.8 }}>{d.sampleNote}</div>
          )}
        </Panel>
      )}
    </div>
  );
}

// ================================================================
// 数据使用（MinIO 访问路径 + 取数方式）
// ================================================================
function UsageTab({ d }: { d: Dataset }) {
  const [ttl, setTtl] = useState("24h");
  const [presign, setPresign] = useState<string | null>(null);

  const st = d.storage;
  const s3 = s3Path(d);
  const https = objectUrl(d) + "/";
  const consoleUrl = consolePath(d);

  const expires = ttl === "1h" ? 3600 : ttl === "7d" ? 604800 : 86400;

  const makePresign = () => {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const sig = randStr(64, "0123456789abcdef", `${d.id}:${ttl}:presign`);
    setPresign(
      `${st.endpoint}/${st.bucket}/${st.prefix}/manifest.json` +
      `?X-Amz-Algorithm=AWS4-HMAC-SHA256` +
      `&X-Amz-Credential=LTAI5TQ8N2XK7ZP4%2F20261113%2F${st.region}%2Fs3%2Faws4_request` +
      `&X-Amz-Date=${stamp}&X-Amz-Expires=${expires}&X-Amz-SignedHeaders=host` +
      `&X-Amz-Signature=${sig}`
    );
    toast.success(`已生成 ${ttl} 有效期的预签名链接`);
  };

  /** 本地落盘目录名取对象前缀的业务段，例如 datasets/uav-aerial-annotation/v1 → uav-aerial-annotation */
  const folder = st.prefix.split("/")[1] || d.id;

  const mcCmds = [
    `# 1. 配置别名（AK/SK 由数据授权模块签发）`,
    `mc alias set lingshu ${st.endpoint} <ACCESS_KEY> <SECRET_KEY>`,
    ``,
    `# 2. 查看对象前缀下的内容`,
    `mc ls --recursive lingshu/${st.bucket}/${st.prefix}/`,
    ``,
    `# 3. 整目录拉取到本地`,
    `mc cp --recursive lingshu/${st.bucket}/${st.prefix}/ ./${folder}-${d.version.toLowerCase()}/`,
  ].join("\n");

  const pyCode = [
    `import boto3`,
    ``,
    `s3 = boto3.client(`,
    `    "s3",`,
    `    endpoint_url="${st.endpoint}",`,
    `    region_name="${st.region}",`,
    `    aws_access_key_id="<ACCESS_KEY>",`,
    `    aws_secret_access_key="<SECRET_KEY>",`,
    `)`,
    ``,
    `# 列目录`,
    `resp = s3.list_objects_v2(Bucket="${st.bucket}", Prefix="${st.prefix}/")`,
    `for o in resp.get("Contents", []):`,
    `    print(o["Key"], o["Size"])`,
    ``,
    `# 下载单个对象`,
    `s3.download_file(`,
    `    "${st.bucket}",`,
    `    "${st.prefix}/manifest.json",`,
    `    "./manifest.json",`,
    `)`,
  ].join("\n");

  const pathRows: { label: string; value: string; icon: typeof Link2; hint: string }[] = [
    { label: "S3 路径", value: s3, icon: Link2, hint: "mc / S3 SDK / 任何兼容 S3 的客户端都可用这个地址" },
    { label: "HTTPS 端点", value: https, icon: ExternalLink, hint: "浏览器或 curl 直接访问（需预签名或在控制台已登录）" },
    { label: "控制台浏览", value: consoleUrl, icon: FolderTree, hint: "在线预览目录、查看对象元信息、批量勾选下载" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* 存储概况 */}
      <Panel
        title="存储位置"
        desc={`数据托管在 ${st.provider} 对象存储，S3 协议兼容，不直接暴露物理文件路径`}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
          {[
            { k: "Bucket", v: st.bucket },
            { k: "区域 Region", v: st.region },
            { k: "对象数", v: st.objectCount.toLocaleString() },
            { k: "总容量", v: st.totalSize },
          ].map((x) => (
            <div key={x.k} style={{ background: C.bg, borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 10.5, color: C.faint, marginBottom: 4 }}>{x.k}</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text, fontFamily: "ui-monospace, Menlo, Consolas, monospace" }}>{x.v}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pathRows.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.label} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <Icon size={12} style={{ color: C.primary }} />
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: C.text }}>{r.label}</span>
                  <span style={{ fontSize: 10.5, color: C.faint }}>{r.hint}</span>
                  <span style={{ marginLeft: "auto" }}><CopyBtn text={r.value} /></span>
                </div>
                <div style={{
                  fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: 11.5,
                  color: C.sub, wordBreak: "break-all", lineHeight: 1.6,
                }}>{r.value}</div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* 方式一：预签名 */}
      <Panel title="方式一 · 预签名链接下载" desc="无需配置客户端，生成一个带签名的临时地址即可直接下载或分享给协作方">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <span style={{ fontSize: 11.5, color: C.sub }}>有效期</span>
          {[
            { k: "1h", t: "1 小时" },
            { k: "24h", t: "24 小时" },
            { k: "7d", t: "7 天" },
          ].map((o) => (
            <button key={o.k} onClick={() => { setTtl(o.k); setPresign(null); }} style={{
              padding: "4px 10px", borderRadius: 5, cursor: "pointer",
              border: `1px solid ${ttl === o.k ? C.primary : C.border}`,
              background: ttl === o.k ? C.primarySoft : "#fff",
              color: ttl === o.k ? C.primary : C.sub,
              fontSize: 11.5, fontWeight: ttl === o.k ? 600 : 400,
            }}>{o.t}</button>
          ))}
          <button onClick={makePresign} style={{
            marginLeft: 4, display: "inline-flex", alignItems: "center", gap: 5,
            padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, #10b981, #059669)`, color: "#fff",
            fontSize: 11.5, fontWeight: 600,
          }}>
            <RefreshCw size={12} />生成下载链接
          </button>
        </div>

        <div style={{
          border: `1px dashed ${C.border}`, borderRadius: 8, padding: "10px 12px",
          background: presign ? C.primarySoft : C.bg,
        }}>
          {presign ? (
            <>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <code style={{
                  flex: 1, fontFamily: "ui-monospace, Menlo, Consolas, monospace",
                  fontSize: 11, color: C.text, wordBreak: "break-all", lineHeight: 1.7,
                }}>{presign}</code>
                <CopyBtn text={presign} label="复制链接" />
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: C.sub, display: "flex", alignItems: "center", gap: 5 }}>
                <Clock size={11} />链接 {ttl} 后自动失效；泄露后请立即在控制台撤销该对象的临时授权。
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: C.faint }}>
              <Download size={12} />选择有效期后点击「生成下载链接」，将对 manifest.json 签发临时地址
            </div>
          )}
        </div>

        <div style={{ marginTop: 8, fontSize: 11, color: C.faint, lineHeight: 1.7 }}>
          整目录下载请改用方式二或方式三；预签名适合单文件、临时取用与对外协作。
        </div>
      </Panel>

      {/* 方式二：mc */}
      <Panel title="方式二 · MinIO 客户端（mc）" desc="适合批量拉取整个目录，命令行可直接脚本化">
        <CodeBlock title="minio client" lang="bash" code={mcCmds} />
        <div style={{ marginTop: 8, fontSize: 11, color: C.faint, lineHeight: 1.7 }}>
          未安装客户端时可执行 <code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 3 }}>brew install minio/stable/mc</code>（macOS）
          或下载 <code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 3 }}>mc.exe</code>（Windows）。
        </div>
      </Panel>

      {/* 方式三：SDK */}
      <Panel title="方式三 · S3 SDK（Python boto3）" desc="把取数逻辑嵌入训练脚本，配合训练任务自动装载数据">
        <CodeBlock title="boto3" lang="python" code={pyCode} />
      </Panel>

      {/* 凭证与配额 */}
      <Panel
        title="访问凭证与配额"
        desc="凭证由数据授权模块签发，按最小权限发放，到期自动失效"
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div style={{ background: C.bg, borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 10.5, color: C.faint, marginBottom: 4 }}>Access Key</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: 12, color: C.text }}>
                LTAI5TQ8****
              </span>
            </div>
          </div>
          <div style={{ background: C.bg, borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 10.5, color: C.faint, marginBottom: 4 }}>Secret Key</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: 12, color: C.text }}>
                ****************
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[
            { icon: Clock, k: "有效期", v: "签发后 7 天" },
            { icon: Gauge, k: "调用配额", v: st.quota },
            { icon: ShieldCheck, k: "权限范围", v: `仅 ${st.bucket}/${st.prefix.split("/")[0]}/ 只读` },
          ].map((x) => {
            const Icon = x.icon;
            return (
              <div key={x.k} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <Icon size={13} style={{ color: C.faint, marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 10.5, color: C.faint, marginBottom: 3 }}>{x.k}</div>
                  <div style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.6 }}>{x.v}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

// ================================================================
// 详情主体
// ================================================================
export default function DatasetDetailView({ dataset }: { dataset: Dataset }) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("publish");

  return (
    <div style={{ padding: "16px 24px 32px", background: C.bg, minHeight: "100vh" }}>
      {/* 返回 */}
      <button
        onClick={() => router.push("/service/datasets")}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12,
          border: "none", background: "transparent", color: C.sub, fontSize: 12.5,
          cursor: "pointer", padding: 0,
        }}
      >
        <ArrowLeft size={14} />返回数据集列表
      </button>

      {/* 头部 */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
        padding: "18px 20px 0", marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Database size={20} style={{ color: "#fff" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 19, fontWeight: 700, color: C.text, margin: 0 }}>{fullName(dataset)}</h1>
              <span style={{ fontSize: 11, color: C.faint }}>{dataset.org}</span>
            </div>
            <p style={{ fontSize: 12, color: C.sub, margin: "5px 0 8px", lineHeight: 1.6 }}>{dataset.subtitle}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {dataset.chips.map((c, i) => (
                <span key={c} style={{
                  fontSize: 10.5, padding: "2px 8px", borderRadius: 4,
                  background: i === 0 ? C.primarySoft : i === 2 ? "#eff6ff" : "#f1f5f9",
                  color: i === 0 ? C.primary : i === 2 ? "#1d4ed8" : C.sub,
                  fontWeight: 500,
                }}>{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Tab 条 */}
        <div style={{ display: "flex", gap: 4, borderTop: `1px solid #f1f5f9`, marginTop: 2 }}>
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "11px 16px", border: "none", background: "transparent",
                  color: active ? C.primary : C.sub, fontSize: 12.5,
                  fontWeight: active ? 600 : 400, cursor: "pointer",
                  borderBottom: `2px solid ${active ? C.primary : "transparent"}`,
                  marginBottom: -1,
                }}
              >
                <Icon size={13} />{t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 内容 */}
      <div data-view="dataset-detail-tab" data-tab={tab}>
        {tab === "publish" && <PublishTab d={dataset} />}
        {tab === "preview" && <PreviewTab d={dataset} />}
        {tab === "usage" && <UsageTab d={dataset} />}
      </div>
    </div>
  );
}
