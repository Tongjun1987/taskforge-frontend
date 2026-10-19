"use client";

import React from "react";
import { createPortal } from "react-dom";

// Design tokens aligned with the existing task-modeling page
export const C = {
  primary: "#4f46e5",
  primaryDeep: "#4338ca",
  primarySoft: "#f5f3ff",
  text: "#1e293b",
  sub: "#64748b",
  faint: "#94a3b8",
  border: "#e2e8f0",
  borderSoft: "#f1f5f9",
  bg: "#f8fafc",
  white: "#ffffff",
  success: "#16a34a",
  successSoft: "#f0fdf4",
  warn: "#f59e0b",
  warnSoft: "#fffbeb",
  danger: "#dc2626",
  dangerSoft: "#fef2f2",
  info: "#0ea5e9",
  infoSoft: "#f0f9ff",
  purple: "#8b5cf6",
  purpleSoft: "#faf5ff",
  teal: "#14b8a6",
  tealSoft: "#f0fdfa",
};

export const panel: React.CSSProperties = {
  background: C.white,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
};

export const scrollArea: React.CSSProperties = {
  flex: 1,
  overflow: "auto",
  padding: 16,
};

// ---------------------------------------------------------------- Panel
export function Panel({
  title,
  desc,
  extra,
  children,
  bodyStyle,
  style,
}: {
  title?: React.ReactNode;
  desc?: React.ReactNode;
  extra?: React.ReactNode;
  children?: React.ReactNode;
  bodyStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}) {
  const hasHead = Boolean(title || extra);
  return (
    <section style={{ ...panel, ...style }}>
      {hasHead && (
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "12px 16px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>{title}</h3>
            {desc && <p style={{ margin: "4px 0 0", fontSize: 12, color: C.sub }}>{desc}</p>}
          </div>
          {extra}
        </header>
      )}
      <div style={{ padding: hasHead ? 16 : 16, ...bodyStyle }}>{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------- Metric tile
export function Metric({
  icon,
  label,
  value,
  unit,
  hint,
  tone = C.primary,
  delta,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  unit?: string;
  hint?: React.ReactNode;
  tone?: string;
  delta?: { text: string; up: boolean };
}) {
  return (
    <div style={{ ...panel, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon && (
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: `${tone}14`,
              color: tone,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </span>
        )}
        <span style={{ fontSize: 13, color: C.sub }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 10 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: C.text, lineHeight: 1 }}>{value}</span>
        {unit && <span style={{ fontSize: 12, color: C.faint }}>{unit}</span>}
        {delta && (
          <span
            style={{
              fontSize: 11,
              marginLeft: 4,
              color: delta.up ? C.success : C.danger,
            }}
          >
            {delta.up ? "↑" : "↓"} {delta.text}
          </span>
        )}
      </div>
      {hint && <div style={{ fontSize: 12, color: C.faint, marginTop: 6 }}>{hint}</div>}
    </div>
  );
}

// ---------------------------------------------------------------- Tag / Dot
export function Tag({
  children,
  tone = C.sub,
  soft,
}: {
  children: React.ReactNode;
  tone?: string;
  soft?: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 11,
        lineHeight: "18px",
        color: tone,
        background: soft || `${tone}12`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function Dot({ tone = C.success, pulse }: { tone?: string; pulse?: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: tone,
        boxShadow: pulse ? `0 0 0 3px ${tone}22` : "none",
        flexShrink: 0,
      }}
    />
  );
}

// ---------------------------------------------------------------- Progress bar
export function Bar({
  pct,
  tone = C.primary,
  h = 6,
  bg = C.borderSoft,
}: {
  pct: number;
  tone?: string;
  h?: number;
  bg?: string;
}) {
  return (
    <div style={{ height: h, borderRadius: h, background: bg, overflow: "hidden", width: "100%" }}>
      <div
        style={{
          width: `${Math.max(0, Math.min(100, pct))}%`,
          height: "100%",
          background: tone,
          borderRadius: h,
          transition: "width .3s",
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------- Donut
export function Donut({
  data,
  size = 132,
  thickness = 14,
  centerLabel,
  centerValue,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.borderSoft} strokeWidth={thickness} />
          {data.map((d) => {
            const len = (d.value / total) * circ;
            const el = (
              <circle
                key={d.label}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${circ - len}`}
                strokeDashoffset={-acc}
              />
            );
            acc += len;
            return el;
          })}
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{centerValue}</span>
        <span style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{centerLabel}</span>
      </div>
    </div>
  );
}

export function Legend({ data }: { data: { label: string; value: number; color: string }[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.map((d) => (
        <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          <Dot tone={d.color} />
          <span style={{ color: C.sub, flex: 1 }}>{d.label}</span>
          <span style={{ color: C.text, fontWeight: 600 }}>{d.value}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- Sparkline
export function Spark({
  data,
  color = C.primary,
  w = 110,
  h = 32,
  fill = true,
}: {
  data: number[];
  color?: string;
  w?: number;
  h?: number;
  fill?: boolean;
}) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const step = data.length > 1 ? w / (data.length - 1) : w;
  const pts = data.map((v, i) => [i * step, h - 3 - ((v - min) / span) * (h - 8)]);
  const line = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const gid = `sp-${color.replace("#", "")}-${data.length}`;
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      {fill && (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={area} fill={`url(#${gid})`} />
        </>
      )}
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------- Line chart (multi series)
export function LineChart({
  series,
  labels,
  height = 220,
  yUnit,
}: {
  series: { name: string; color: string; data: number[] }[];
  labels: string[];
  height?: number;
  yUnit?: string;
}) {
  const w = 1000;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const innerW = w - padL - padR;
  const innerH = height - padT - padB;
  const all = series.flatMap((s) => s.data);
  const max = Math.max(...all, 1);
  const niceMax = Math.ceil(max / 10) * 10 || 10;
  const n = labels.length;
  const xAt = (i: number) => padL + (n > 1 ? (i / (n - 1)) * innerW : innerW / 2);
  const yAt = (v: number) => padT + innerH - (v / niceMax) * innerH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(niceMax * f));

  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ display: "block" }}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} y1={yAt(t)} x2={w - padR} y2={yAt(t)} stroke={C.borderSoft} strokeWidth="1" />
          <text x={padL - 8} y={yAt(t) + 4} textAnchor="end" fontSize="11" fill={C.faint}>
            {t}
          </text>
        </g>
      ))}
      {labels.map((lb, i) => (
        <text key={lb + i} x={xAt(i)} y={height - 8} textAnchor="middle" fontSize="11" fill={C.faint}>
          {lb}
        </text>
      ))}
      {series.map((s) => {
        const line = s.data.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(" ");
        return (
          <g key={s.name}>
            <polyline points={line} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {s.data.map((v, i) => (
              <circle key={i} cx={xAt(i)} cy={yAt(v)} r="3" fill="#fff" stroke={s.color} strokeWidth="2" />
            ))}
          </g>
        );
      })}
      {yUnit && (
        <text x={8} y={padT + 4} fontSize="11" fill={C.faint}>
          {yUnit}
        </text>
      )}
    </svg>
  );
}

// ---------------------------------------------------------------- Column chart
export function Columns({
  data,
  height = 160,
  tone = C.primary,
}: {
  data: { label: string; value: number; tone?: string }[];
  height?: number;
  tone?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height }}>
      {data.map((d) => (
        <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: C.sub }}>{d.value}</span>
          <div
            style={{
              width: "100%",
              maxWidth: 34,
              height: `${(d.value / max) * (height - 42)}px`,
              background: d.tone || tone,
              borderRadius: "4px 4px 0 0",
              minHeight: 4,
            }}
          />
          <span style={{ fontSize: 11, color: C.faint, whiteSpace: "nowrap" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- Horizontal bar list
export function BarList({
  data,
  unit,
  tone = C.primary,
  max,
}: {
  data: { label: string; value: number; tone?: string; sub?: string }[];
  unit?: string;
  tone?: string;
  max?: number;
}) {
  const top = max || Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {data.map((d) => (
        <div key={d.label}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
            <span style={{ color: C.text }}>
              {d.label}
              {d.sub && <span style={{ color: C.faint, marginLeft: 6 }}>{d.sub}</span>}
            </span>
            <span style={{ color: C.sub }}>
              {d.value}
              {unit}
            </span>
          </div>
          <Bar pct={(d.value / top) * 100} tone={d.tone || tone} h={6} />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- Table
export function Table({
  head,
  rows,
  widths,
  onRowClick,
  rowKey,
}: {
  head: React.ReactNode[];
  rows: React.ReactNode[][];
  widths?: string[];
  onRowClick?: (i: number) => void;
  rowKey?: (i: number) => string;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: C.sub,
                  background: C.bg,
                  borderBottom: `1px solid ${C.border}`,
                  whiteSpace: "nowrap",
                  width: widths?.[i],
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr
              key={rowKey ? rowKey(ri) : ri}
              onClick={() => onRowClick && onRowClick(ri)}
              style={{ cursor: onRowClick ? "pointer" : "default" }}
            >
              {r.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    padding: "11px 12px",
                    borderBottom: `1px solid ${C.borderSoft}`,
                    color: C.text,
                    verticalAlign: "middle",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------- Button
export function Btn({
  children,
  icon,
  tone = "ghost",
  onClick,
  size = "md",
  disabled,
  title,
}: {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "primary" | "ghost" | "danger" | "success" | "warn" | "plain";
  onClick?: () => void;
  size?: "sm" | "md";
  disabled?: boolean;
  title?: string;
}) {
  const map: Record<string, React.CSSProperties> = {
    primary: { background: C.primary, color: "#fff", border: "1px solid " + C.primary },
    ghost: { background: "#fff", color: C.text, border: `1px solid ${C.border}` },
    plain: { background: "transparent", color: C.sub, border: "1px solid transparent" },
    danger: { background: C.dangerSoft, color: C.danger, border: `1px solid ${C.danger}33` },
    success: { background: C.successSoft, color: C.success, border: `1px solid ${C.success}33` },
    warn: { background: C.warnSoft, color: "#b45309", border: `1px solid ${C.warn}33` },
  };
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: size === "sm" ? "4px 10px" : "7px 14px",
        fontSize: size === "sm" ? 12 : 13,
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        whiteSpace: "nowrap",
        ...map[tone],
      }}
    >
      {icon}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------- Icon button (list row actions)
// 列表操作列统一形态：只显示图标，鼠标移入后浮出文字说明。
const ICON_TONES: Record<string, { bg: string; bgHover: string; border: string; color: string }> = {
  plain: { bg: "transparent", bgHover: C.bg, border: "transparent", color: C.sub },
  ghost: { bg: "#fff", bgHover: C.bg, border: C.border, color: C.sub },
  primary: { bg: "#eff6ff", bgHover: "#dbeafe", border: "#dbeafe", color: "#2563eb" },
  success: { bg: C.successSoft, bgHover: "#dcfce7", border: "#bbf7d0", color: C.success },
  warn: { bg: C.warnSoft, bgHover: "#fef3c7", border: "#fde68a", color: "#d97706" },
  danger: { bg: C.dangerSoft, bgHover: "#fee2e2", border: "#fecaca", color: C.danger },
  purple: { bg: "#ede9fe", bgHover: "#e9d5ff", border: "#ddd6fe", color: "#7c3aed" },
};

export function IconBtn({
  icon,
  label,
  tone = "ghost",
  onClick,
  disabled,
  size = "md",
  stopPropagation = true,
}: {
  icon: React.ReactNode;
  /** 悬浮提示文字，同时作为 aria-label */
  label: string;
  tone?: "plain" | "ghost" | "primary" | "success" | "warn" | "danger" | "purple";
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
  stopPropagation?: boolean;
}) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [hover, setHover] = React.useState(false);
  const [tip, setTip] = React.useState<{ top: number; left: number; below: boolean } | null>(null);
  const t = ICON_TONES[tone] || ICON_TONES.ghost;
  const box = size === "sm" ? 26 : 30;

  const showTip = () => {
    if (disabled) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const below = r.top < 48;
    setHover(true);
    setTip({ top: below ? r.bottom + 7 : r.top - 7, left: r.left + r.width / 2, below });
  };
  const hideTip = () => {
    setHover(false);
    setTip(null);
  };

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-label={label}
        disabled={disabled}
        onMouseEnter={showTip}
        onMouseLeave={hideTip}
        onFocus={showTip}
        onBlur={hideTip}
        onClick={(e) => {
          if (stopPropagation) e.stopPropagation();
          if (!disabled) onClick?.();
        }}
        style={{
          width: box,
          height: box,
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          borderRadius: 6,
          border: `1px solid ${t.border}`,
          background: hover && !disabled ? t.bgHover : t.bg,
          color: t.color,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.45 : 1,
          transition: "background .12s, border-color .12s",
        }}
      >
        {icon}
      </button>
      {tip &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: "fixed",
              top: tip.top,
              left: tip.left,
              transform: tip.below ? "translate(-50%, 0)" : "translate(-50%, -100%)",
              padding: "5px 9px",
              borderRadius: 5,
              background: "#1e293b",
              color: "#fff",
              fontSize: 12,
              lineHeight: "16px",
              whiteSpace: "nowrap",
              boxShadow: "0 6px 16px rgba(15,23,42,.18)",
              pointerEvents: "none",
              zIndex: 9999,
            }}
          >
            {label}
            <span
              style={{
                position: "absolute",
                left: "50%",
                bottom: tip.below ? undefined : -3,
                top: tip.below ? -3 : undefined,
                width: 6,
                height: 6,
                marginLeft: -3,
                background: "#1e293b",
                transform: "rotate(45deg)",
              }}
            />
          </div>,
          document.body
        )}
    </>
  );
}

// ---------------------------------------------------------------- Segmented control
export function Segmented<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { key: T; label: string }[];
  value: T;
  onChange: (k: T) => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        padding: 2,
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 7,
      }}
    >
      {items.map((it) => {
        const on = it.key === value;
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            style={{
              padding: "5px 12px",
              fontSize: 12,
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
              background: on ? "#fff" : "transparent",
              color: on ? C.primary : C.sub,
              fontWeight: on ? 600 : 400,
              boxShadow: on ? "0 1px 2px rgba(15,23,42,.08)" : "none",
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- KV row
export function Kv({ k, v, w = 96 }: { k: React.ReactNode; v: React.ReactNode; w?: number }) {
  return (
    <div style={{ display: "flex", gap: 10, fontSize: 12, padding: "5px 0" }}>
      <span style={{ width: w, color: C.faint, flexShrink: 0 }}>{k}</span>
      <span style={{ color: C.text, flex: 1, minWidth: 0 }}>{v}</span>
    </div>
  );
}

// ---------------------------------------------------------------- Grid helper
export function Grid({
  cols,
  gap = 12,
  children,
  style,
}: {
  cols: number | string;
  gap?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: typeof cols === "number" ? `repeat(${cols}, minmax(0,1fr))` : cols,
        gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------- Status maps
export const PIPE_STATUS: Record<string, { label: string; tone: string; soft: string }> = {
  running: { label: "运行中", tone: C.success, soft: C.successSoft },
  queued: { label: "排队中", tone: "#b45309", soft: C.warnSoft },
  idle: { label: "待启动", tone: C.sub, soft: C.borderSoft },
  error: { label: "异常", tone: C.danger, soft: C.dangerSoft },
};

export const NODE_STATUS: Record<string, { label: string; tone: string }> = {
  done: { label: "已完成", tone: C.success },
  running: { label: "运行中", tone: C.primary },
  waiting: { label: "等待", tone: C.faint },
  error: { label: "失败", tone: C.danger },
};

export const ALERT_LEVEL: Record<string, { label: string; tone: string; soft: string }> = {
  critical: { label: "严重", tone: C.danger, soft: C.dangerSoft },
  warning: { label: "告警", tone: "#b45309", soft: C.warnSoft },
  info: { label: "提示", tone: C.info, soft: C.infoSoft },
};

export function fmtSec(s: number) {
  if (!s) return "--";
  if (s < 60) return s + "s";
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? m + "m " + r + "s" : m + "m";
}
