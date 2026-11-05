"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft, Package, Layers, FileJson, FileCheck2, FileText, FolderTree,
  ArrowRight, CheckCircle2, User, Clock, Tag as TagIcon,
} from "lucide-react";

import { C, Panel, Tag, Btn, Kv } from "@/components/production/ui";
import {
  PACK_TEMPLATES, DATASETS, COMMON_META_FIELDS, tplMetaFields, tplFieldCount,
  metaByGroup, type PackTemplate,
} from "./publishData";
import PackDatasetModal from "./PackDatasetModal";

const PART_ICON: Record<string, React.ReactNode> = {
  目录结构: <FolderTree size={13} />,
  元数据字段: <FileJson size={13} />,
  质量报告: <FileCheck2 size={13} />,
  说明文档: <FileText size={13} />,
  标注规范: <Layers size={13} />,
  脱敏声明: <FileText size={13} />,
  许可协议: <FileText size={13} />,
};

const TYPE_TONE: Record<string, string> = {
  标识: C.info,
  文本: C.sub,
  长文本: C.sub,
  枚举: C.purple,
  数值: C.teal,
  日期: C.warn,
  列表: C.purple,
  派生: C.success,
};

export default function TemplateDetailClient({ templateId }: { templateId: string }) {
  const tpl: PackTemplate | undefined = PACK_TEMPLATES.find((t) => t.id === templateId);
  const [packing, setPacking] = useState(false);
  const [usedDelta, setUsedDelta] = useState(0);
  const [toast, setToast] = useState("");

  if (!tpl) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: C.sub, fontSize: 13 }}>未找到该封装模板</p>
          <Link href="/data-publish/templates" style={{ fontSize: 12, color: C.primary }}>返回封装模板</Link>
        </div>
      </div>
    );
  }

  const fields = tplMetaFields(tpl);
  const groups = metaByGroup(fields);
  const extraCount = fields.length - COMMON_META_FIELDS.length;
  const usedBy = DATASETS.filter((d) => d.templateId === tpl.id);

  const submitPack = (name: string) => {
    setUsedDelta((n) => n + 1);
    setPacking(false);
    setToast(`已按 ${tpl.id} 重新封装「${name}」，元数据已按模板规范校验，进入发布审核`);
    window.setTimeout(() => setToast(""), 3600);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg }}>
      {/* 页头 */}
      <header
        style={{
          background: "#fff", borderBottom: `1px solid ${C.border}`,
          padding: "12px 20px", flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <Link
            href="/data-publish/templates"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`,
              color: C.sub, flexShrink: 0, marginTop: 2,
            }}
            aria-label="返回封装模板"
          >
            <ChevronLeft size={16} />
          </Link>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: 0, lineHeight: 1.3 }}>{tpl.name}</h1>
              <span
                style={{
                  padding: "1px 7px", borderRadius: 4, fontSize: 11,
                  color: C.success, background: `${C.success}14`,
                }}
              >
                平台预置
              </span>
              <span
                style={{
                  padding: "1px 7px", borderRadius: 4, fontSize: 11,
                  color: C.info, background: `${C.info}14`,
                }}
              >
                {tpl.dataType}
              </span>
            </div>
            <p style={{ fontSize: 11.5, color: C.faint, margin: "3px 0 0" }}>
              数据发布中心 · 封装模板 · {tpl.id} · {tpl.industry} / {tpl.scene} · 维护人 {tpl.owner}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <Btn size="sm" tone="primary" icon={<ArrowRight size={13} />} onClick={() => setPacking(true)}>
              用此模板封装数据集
            </Btn>
          </div>
        </div>

        {/* 关键指标条 */}
        <div style={{ display: "flex", gap: 28, margin: "12px 0 0 42px", flexWrap: "wrap" }}>
          {[
            { k: "元数据字段", v: `${fields.length} 项` },
            { k: "通用 / 扩展", v: `${COMMON_META_FIELDS.length} + ${extraCount}` },
            { k: "封装内容", v: `${tpl.parts.length} 项` },
            { k: "已使用", v: `${tpl.used + usedDelta} 次` },
            { k: "关联数据集", v: `${usedBy.length} 个` },
            { k: "更新时间", v: tpl.updatedAt },
          ].map((x) => (
            <div key={x.k} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 11, color: C.faint }}>{x.k}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{x.v}</span>
            </div>
          ))}
        </div>
      </header>

      {/* 内容区 */}
      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          {/* 左：元数据规范 + 封装内容 */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <Panel
              title="元数据规范"
              desc={`通用 ${COMMON_META_FIELDS.length} 项 + 模板扩展 ${extraCount} 项 = ${fields.length} 项`}
              extra={
                <div style={{ display: "flex", gap: 5 }}>
                  <Tag tone={C.info}>通用 {COMMON_META_FIELDS.length}</Tag>
                  <Tag tone={C.purple}>模板扩展 {extraCount}</Tag>
                </div>
              }
              bodyStyle={{ padding: 0 }}
            >
              <div
                style={{
                  display: "flex", alignItems: "flex-start", gap: 6, margin: 12,
                  padding: "8px 12px", borderRadius: 6, fontSize: 11.5, lineHeight: 1.7,
                  color: C.info, background: `${C.info}0f`, border: `1px solid ${C.info}26`,
                }}
              >
                <FileJson size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                与「数据集管理」使用同一套元数据字典：通用项对应数据集登记字段，封装时从所选数据集自动带入；模板扩展项由本模板按数据类型追加，须随封装一并填写。
              </div>

              {/* 表头 */}
              <div
                style={{
                  display: "grid", gridTemplateColumns: "150px 1fr 70px 52px 1fr",
                  gap: 10, padding: "7px 14px", background: C.bg,
                  borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
                  fontSize: 11, color: C.faint,
                }}
              >
                <span>字段名称</span>
                <span>元数据标识</span>
                <span>类型</span>
                <span>必填</span>
                <span>示例值</span>
              </div>

              {groups.map((g) => (
                <div key={g.group}>
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: 7, padding: "7px 14px",
                      background: g.group === "模板扩展" ? C.primarySoft : "#fff",
                      borderBottom: `1px solid ${C.borderSoft}`,
                    }}
                  >
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: C.text }}>{g.group}</span>
                    <span style={{ fontSize: 10.5, color: C.faint }}>{g.fields.length} 项</span>
                    {g.group === "模板扩展" && <Tag tone={C.primary}>模板带入</Tag>}
                  </div>
                  {g.fields.map((f) => (
                    <div
                      key={f.key}
                      style={{
                        display: "grid", gridTemplateColumns: "150px 1fr 70px 52px 1fr",
                        gap: 10, padding: "7px 14px", alignItems: "center",
                        borderBottom: `1px solid ${C.borderSoft}`, fontSize: 11.5,
                      }}
                    >
                      <span style={{ color: C.text }}>{f.label}</span>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: C.sub }}>{f.key}</span>
                      <Tag tone={TYPE_TONE[f.type]}>{f.type}</Tag>
                      <span style={{ fontSize: 11, color: f.required ? C.danger : C.faint }}>
                        {f.required ? "必填" : "选填"}
                      </span>
                      <span style={{ color: C.faint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {f.example}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </Panel>

            <Panel
              title="封装内容"
              desc="随数据集一同打包的标准化材料，封装时可按需勾选"
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {tpl.parts.map((p) => (
                  <div
                    key={p}
                    style={{
                      display: "flex", alignItems: "center", gap: 7, padding: "9px 11px",
                      border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, color: C.text,
                    }}
                  >
                    <span style={{ color: C.primary }}>{PART_ICON[p] || <FileText size={13} />}</span>
                    {p}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 14, borderTop: `1px solid ${C.borderSoft}`, paddingTop: 12 }}>
                <div style={{ fontSize: 11, color: C.faint, marginBottom: 6 }}>标准封装目录</div>
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
                    padding: "8px 10px", background: C.bg, borderRadius: 6,
                    fontFamily: "monospace", fontSize: 11.5, color: C.sub,
                  }}
                >
                  {["data/", "annotations/", "metadata/", "quality/", "README.md"].map((d, i, arr) => (
                    <React.Fragment key={d}>
                      <span style={{ color: C.text }}>{d}</span>
                      {i < arr.length - 1 && <span style={{ color: C.faint }}>›</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </Panel>
          </div>

          {/* 右：模板信息 + 关联数据集 */}
          <div style={{ width: 330, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <Panel title="模板信息">
              <Kv k="模板编号" v={<span style={{ fontFamily: "monospace", fontSize: 11.5 }}>{tpl.id}</span>} w={70} />
              <Kv k="来源" v={<Tag tone={C.success}>平台预置（随版本下发）</Tag>} w={70} />
              <Kv k="所属行业" v={tpl.industry} w={70} />
              <Kv k="应用场景" v={tpl.scene} w={70} />
              <Kv k="数据类型" v={tpl.dataType} w={70} />
              <Kv k="元数据项" v={`${fields.length} 项（通用 ${COMMON_META_FIELDS.length}）`} w={70} />
              <Kv k="封装内容" v={`${tpl.parts.length} 项`} w={70} />
              <Kv k="维护人" v={<span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><User size={11} style={{ color: C.faint }} />{tpl.owner}</span>} w={70} />
              <Kv k="更新时间" v={<span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={11} style={{ color: C.faint }} />{tpl.updatedAt}</span>} w={70} />
            </Panel>

            <Panel
              title="已按此模板封装"
              desc={`${usedBy.length} 个数据集引用本模板`}
              bodyStyle={{ padding: usedBy.length ? 12 : 16 }}
            >
              {usedBy.length === 0 ? (
                <div style={{ fontSize: 11.5, color: C.faint }}>暂无数据集引用此模板</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {usedBy.map((d) => (
                    <Link
                      key={d.id}
                      href={`/data-publish/dataset/${d.id}`}
                      style={{
                        display: "flex", alignItems: "center", gap: 7, padding: "7px 9px",
                        border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11.5, color: C.text,
                      }}
                    >
                      <FolderTree size={12} style={{ color: C.warn, flexShrink: 0 }} />
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {d.name}
                      </span>
                      <span style={{ fontSize: 10.5, color: C.faint }}>{d.version}</span>
                    </Link>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="引用说明">
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11.5, color: C.sub, lineHeight: 1.9 }}>
                <li>模板随发布中心版本预置下发，不支持新增或删改</li>
                <li>封装时元数据字段按本规范校验，缺项无法提交</li>
                <li>封装产生的数据集可在「数据集管理」中查看</li>
                <li>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <TagIcon size={11} /> 同一模板可被多个数据集重复引用
                  </span>
                </li>
              </ul>
            </Panel>
          </div>
        </div>
      </div>

      {packing && (
        <PackDatasetModal tpl={tpl} onClose={() => setPacking(false)} onSubmit={submitPack} />
      )}

      {toast && (
        <div
          style={{
            position: "fixed", left: "50%", bottom: 34, transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 7, padding: "9px 16px",
            fontSize: 12.5, color: C.success, background: "#fff",
            border: `1px solid ${C.success}55`, borderRadius: 8,
            boxShadow: "0 10px 30px rgba(15,23,42,.14)", zIndex: 1300,
          }}
        >
          <CheckCircle2 size={14} /> {toast}
        </div>
      )}
    </div>
  );
}
