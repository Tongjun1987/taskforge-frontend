"use client";

// 数据中试中心 · 模型试验三页共用 UI 基件
// 与数据发布中心同一套设计令牌（production/ui.tsx），保持全站一致。

import React from "react";
import { X } from "lucide-react";
import { C, Tag } from "@/components/production/ui";
import { type ExpStatus, EXP_STATUS_TONE } from "./expData";

export function ExpHeader({
  icon,
  title,
  subtitle,
  gradient = "linear-gradient(135deg, #f59e0b, #f97316)",
  right,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradient?: string;
  right?: React.ReactNode;
}) {
  return (
    <header
      style={{
        height: 56, background: "#fff", borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", padding: "0 20px", gap: 16, flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <span
          style={{
            width: 32, height: 32, borderRadius: 8, background: gradient,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {icon}
        </span>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: 0, lineHeight: 1.25 }}>{title}</h1>
          <p style={{ fontSize: 11, color: C.sub, margin: 0 }}>{subtitle}</p>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      {right}
    </header>
  );
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { key: T; label: string; icon?: React.ReactNode; count?: number }[];
  value: T;
  onChange: (k: T) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${C.border}`, marginBottom: 14 }}>
      {items.map((it) => {
        const on = it.key === value;
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 14px", border: "none", background: "transparent",
              borderBottom: `2px solid ${on ? C.primary : "transparent"}`,
              color: on ? C.primary : C.sub,
              fontSize: 13, fontWeight: on ? 600 : 400,
              cursor: "pointer", marginBottom: -1,
            }}
          >
            {it.icon}
            {it.label}
            {it.count !== undefined && (
              <span style={{ fontSize: 11, color: on ? C.primary : C.faint }}>{it.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function StatusTag({ status }: { status: ExpStatus }) {
  const t = EXP_STATUS_TONE[status];
  return <Tag tone={t.tone} soft={t.soft}>{status}</Tag>;
}

export function Field({
  label,
  required,
  hint,
  children,
  span,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  span?: boolean;
}) {
  return (
    <div style={{ gridColumn: span ? "1 / -1" : undefined }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.sub, marginBottom: 5 }}>
        {label}
        {required && <span style={{ color: C.danger, marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", height: 34, padding: "0 10px", fontSize: 12.5, color: C.text,
  background: "#fff", border: `1px solid ${C.border}`, borderRadius: 6,
  outline: "none", boxSizing: "border-box",
};

export function TextInput({
  value, onChange, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
    />
  );
}

export function NumInput({
  value, onChange, min, max, step,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      style={inputStyle}
    />
  );
}

export function Sel({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[] | string[];
  placeholder?: string;
}) {
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, color: value ? C.text : C.faint, cursor: "pointer" }}
    >
      <option value="">{placeholder || "请选择"}</option>
      {opts.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function Chips({
  options, value, onChange, multi = false,
}: {
  options: string[];
  value: string | string[];
  onChange: (v: any) => void;
  multi?: boolean;
}) {
  const has = (o: string) => (multi ? (value as string[]).includes(o) : value === o);
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map((o) => {
        const on = has(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => {
              if (!multi) return onChange(o);
              const cur = value as string[];
              onChange(cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o]);
            }}
            style={{
              padding: "5px 11px", fontSize: 12, borderRadius: 5, cursor: "pointer",
              border: `1px solid ${on ? C.primary : C.border}`,
              background: on ? C.primarySoft : "#fff",
              color: on ? C.primary : C.sub,
              fontWeight: on ? 600 : 400,
            }}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function SectionTitle({
  step, title, desc, extra,
}: {
  step?: string;
  title: string;
  desc?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      {step && (
        <span
          style={{
            width: 20, height: 20, borderRadius: "50%", background: C.primarySoft,
            color: C.primary, fontSize: 11, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          {step}
        </span>
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{title}</div>
        {desc && <div style={{ fontSize: 11.5, color: C.faint, marginTop: 1 }}>{desc}</div>}
      </div>
      <div style={{ flex: 1 }} />
      {extra}
    </div>
  );
}

export function Modal({
  title, desc, width = 720, onClose, footer, children,
}: {
  title: string;
  desc?: string;
  width?: number;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1200, background: "rgba(15,23,42,.45)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width, maxWidth: "100%", maxHeight: "88vh", background: "#fff",
          borderRadius: 10, boxShadow: "0 24px 64px rgba(15,23,42,.28)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
            borderBottom: `1px solid ${C.border}`, flexShrink: 0,
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{title}</div>
            {desc && <div style={{ fontSize: 11.5, color: C.faint, marginTop: 2 }}>{desc}</div>}
          </div>
          <button
            onClick={onClose}
            aria-label="关闭"
            style={{
              width: 28, height: 28, borderRadius: 6, border: "none", background: "transparent",
              color: C.sub, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "16px 18px" }}>{children}</div>
        {footer && (
          <div
            style={{
              display: "flex", justifyContent: "flex-end", gap: 8,
              padding: "12px 18px", borderTop: `1px solid ${C.border}`, background: C.bg, flexShrink: 0,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <div style={{ padding: "48px 0", textAlign: "center", fontSize: 13, color: C.faint }}>{text}</div>
  );
}

// 混淆矩阵热力格
export function heatColor(v: number, max: number) {
  const t = max > 0 ? v / max : 0;
  // 单色系（靛蓝）深浅，避免彩虹色
  if (t > 0.66) return { bg: "#c7d2fe", fg: "#312e81" };
  if (t > 0.33) return { bg: "#dbeafe", fg: "#1e40af" };
  if (t > 0.12) return { bg: "#eff6ff", fg: "#1e40af" };
  return { bg: "#f8fafc", fg: "#64748b" };
}
