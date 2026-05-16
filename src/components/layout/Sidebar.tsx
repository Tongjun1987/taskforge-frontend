"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, Target, Database, Tag, Shield, BarChart3, Rocket,
  ChevronLeft, ChevronRight, LogOut, Settings, Bell,
  ChevronDown, Layers, Star, GitBranch, HardDrive,
  Users, FileText, Clock, Search, Sparkles, Brain,
  Route, Download, Upload
} from "lucide-react";

type NavItem = {
  key?: string;
  href?: string;
  icon: React.ComponentType<any>;
  label: string;
  single?: boolean;
  badge?: string;
  children?: NavItem[];
};

const NAV_ITEMS: NavItem[] = [
  {
    key: "dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "系统首页",
    single: true,
  },
  // ── 数据生产中心 ──────────────────────────────
  {
    key: "data-production",
    icon: Database,
    label: "数据生产中心",
    children: [
      { href: "/task-modeling", icon: Target, label: "任务建模" },
      {
        key: "data-access",
        icon: Database,
        label: "数据接入",
        children: [
          { href: "/data-asset/data-access", icon: Upload, label: "数据采集" },
          { href: "/data-asset/data-access/convergence", icon: Layers, label: "数据汇聚" },
          { href: "/data-asset/data-access/trace", icon: Route, label: "数据溯源" },
        ],
      },
      {
        key: "data-processing",
        icon: Layers,
        label: "数据处理",
        children: [
          { href: "/data-cleaning", icon: Sparkles, label: "数据清洗" },
          { href: "/data-augmentation", icon: Sparkles, label: "数据增强", badge: "即将上线" },
          { href: "/data-synthesis", icon: Sparkles, label: "数据合成", badge: "即将上线" },
        ],
      },
      {
        key: "annotation",
        icon: Tag,
        label: "数据标注",
        children: [
          { href: "/annotation", icon: Tag, label: "专家标注" },
          { href: "/smart-annotation", icon: Brain, label: "智能标注" },
        ],
      },
      {
        key: "data-mgmt",
        icon: Shield,
        label: "数据管理",
        children: [
          { href: "/quality", icon: Shield, label: "数据质检" },
          { href: "/data-asset/dataset", icon: Database, label: "数据集管理" },
        ],
      },
    ],
  },
  // ── 模型生产中心 ──────────────────────────────
  {
    key: "model-production",
    icon: HardDrive,
    label: "模型生产中心",
    children: [
      {
        key: "llm-mgmt",
        icon: Brain,
        label: "大模型管理",
        children: [
          { href: "/model-repo", icon: Database, label: "模型仓库" },
          { href: "/model-deploy", icon: Rocket, label: "模型部署", badge: "即将上线" },
          { href: "/api-key", icon: FileText, label: "API密钥", badge: "即将上线" },
        ],
      },
      {
        key: "model-training",
        icon: GitBranch,
        label: "模型训练",
        children: [
          { href: "/model-training", icon: FileText, label: "训练任务" },
          { href: "/exp-monitor", icon: BarChart3, label: "实验监控", badge: "即将上线" },
          { href: "/model-export", icon: Rocket, label: "导出发布", badge: "即将上线" },
        ],
      },
      {
        key: "eval-mgmt",
        icon: BarChart3,
        label: "评测管理",
        children: [
          { href: "/eval", icon: BarChart3, label: "评测任务" },
          { href: "/eval-benchmark", icon: BarChart3, label: "Benchmark" },
          { href: "/eval-report", icon: FileText, label: "评测报告", badge: "即将上线" },
        ],
      },
      { href: "/prompt-engineering", icon: Sparkles, label: "提示词工程", badge: "即将上线" },
    ],
  },
  // ── 智能应用层 ──────────────────────────────
  {
    key: "ai-app",
    icon: Rocket,
    label: "智能应用",
    children: [
      { href: "/ai-app", icon: Rocket, label: "AI应用中心", badge: "即将上线" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "data-production": true,
    "data-access": true,
    "model-production": false,
    "ai-app": false,
  });

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) {
      try { setUser(JSON.parse(u)); } catch {}
    }
  }, []);

  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = (process.env.NEXT_PUBLIC_BASE_PATH || '') + "/login";
  };

  const isActive = (href?: string) => href && (pathname === href || pathname.startsWith(href + "/"));
  const isGroupActive = (item: any) => item.children?.some((c: any) => isActive(c.href));

  const sidebarBg = "#1e293b";      // slate-800
  const sidebarBorder = "#334155";  // slate-700
  const activeBg = "#2563eb";       // brand-600
  const hoverBg = "#334155";        // slate-700

  return (
    <aside
      style={{
        width: collapsed ? 56 : 220,
        minWidth: collapsed ? 56 : 220,
        background: sidebarBg,
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        flexShrink: 0,
        transition: "width 0.25s ease",
        overflow: "hidden",
        borderRight: `1px solid ${sidebarBorder}`,
      }}
    >
      {/* Logo 区域 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: collapsed ? "16px 0" : "14px 16px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderBottom: `1px solid ${sidebarBorder}`,
        flexShrink: 0,
      }}>
        <Image src={(process.env.NEXT_PUBLIC_BASE_PATH || '') + "/logo.png"} alt="logo" width={32} height={32} style={{ borderRadius: 8, flexShrink: 0, objectFit: 'contain' }} />
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2, letterSpacing: "-0.3px" }}>
              零数数智工厂
            </div>
            <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.2, marginTop: 1 }}>
              v1.0.6 · 菜单重构
            </div>
          </div>
        )}
      </div>

      {/* 通知提示 */}
      {!collapsed && (
        <div style={{ padding: "8px 10px", borderBottom: `1px solid ${sidebarBorder}`, flexShrink: 0 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 10px", borderRadius: 6,
            background: "rgba(239,68,68,0.1)",
            cursor: "pointer",
          }}>
            <Bell size={13} style={{ color: "#f87171", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#fca5a5" }}>3 条待处理任务</span>
          </div>
        </div>
      )}

      {/* 导航 */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "8px 0" }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          if (item.single) {
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href || "#"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: collapsed ? "9px 0" : "9px 14px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  margin: "1px 6px",
                  borderRadius: 6,
                  textDecoration: "none",
                  color: active ? "#fff" : "#94a3b8",
                  background: active ? activeBg : "transparent",
                  fontWeight: active ? 600 : 400,
                  fontSize: 13,
                  transition: "all 0.15s",
                  boxShadow: active ? "0 2px 8px rgba(37,99,235,0.3)" : "none",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = hoverBg;
                    (e.currentTarget as HTMLElement).style.color = "#fff";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#94a3b8";
                  }
                }}
              >
                <Icon size={15} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>}
                {!collapsed && item.badge && typeof item.badge === "string" && (
                  <span style={{
                    fontSize: 9, padding: "1px 5px", borderRadius: 4, marginLeft: 4,
                    background: "rgba(245,158,11,0.2)", color: "#fbbf24", fontWeight: 600,
                    whiteSpace: "nowrap", flexShrink: 0,
                  }}>{item.badge}</span>
                )}
              </Link>
            );
          }

          // 有子项的分组
          const isOpen = openGroups[item.key] ?? false;
          const groupActive = isGroupActive(item);

          return (
            <div key={item.key}>
              {/* 分组标题行 */}
              <button
                onClick={() => !collapsed && toggleGroup(item.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: collapsed ? "9px 0" : "9px 14px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  margin: "1px 6px",
                  borderRadius: 6,
                  color: groupActive ? "#93c5fd" : "#94a3b8",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  width: "calc(100% - 12px)",
                  fontSize: 13,
                  fontWeight: groupActive ? 600 : 400,
                  transition: "all 0.15s",
                  textAlign: "left",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = hoverBg;
                  (e.currentTarget as HTMLElement).style.color = "#fff";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = groupActive ? "#93c5fd" : "#94a3b8";
                }}
              >
                <Icon size={15} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <>
                    <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                    {item.badge && typeof item.badge === "string" && (
                      <span style={{
                        fontSize: 9, padding: "1px 5px", borderRadius: 4, marginLeft: 4,
                        background: "rgba(245,158,11,0.2)", color: "#fbbf24", fontWeight: 600,
                        whiteSpace: "nowrap", flexShrink: 0,
                      }}>{item.badge}</span>
                    )}
                    {item.badge && typeof item.badge === "number" && (
                      <span style={{
                        minWidth: 16, height: 16, borderRadius: 8, padding: "0 4px",
                        background: "#ef4444", color: "#fff",
                        fontSize: 10, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{item.badge}</span>
                    )}
                    <ChevronDown
                      size={13}
                      style={{
                        color: "#475569",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                        transition: "transform 0.2s",
                      }}
                    />
                  </>
                )}
              </button>

              {/* 子项列表 */}
              {!collapsed && isOpen && (
                <div style={{ paddingLeft: 14, paddingBottom: 2 }}>
                  {item.children?.map((child: any) => {
                    // 三级菜单：子项本身有 children
                    if (child.children) {
                      const grandActive = child.children.some((g: any) => isActive(g.href));
                      return (
                        <div key={child.key || child.label}>
                          <button
                            onClick={() => toggleGroup(child.key)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "6px 10px",
                              margin: "1px 6px 1px 4px",
                              borderRadius: 5,
                              border: "none",
                              background: "transparent",
                              color: grandActive ? "#93c5fd" : "#64748b",
                              fontSize: 12,
                              fontWeight: grandActive ? 600 : 400,
                              cursor: "pointer",
                              width: "calc(100% - 10px)",
                              textAlign: "left",
                              transition: "all 0.15s",
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.background = "rgba(51,65,85,0.5)";
                              (e.currentTarget as HTMLElement).style.color = "#cbd5e1";
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.background = "transparent";
                              (e.currentTarget as HTMLElement).style.color = grandActive ? "#93c5fd" : "#64748b";
                            }}
                          >
                            {child.icon && <child.icon size={13} style={{ flexShrink: 0 }} />}
                            <span style={{ flex: 1 }}>{child.label}</span>
                            <ChevronDown size={11} style={{
                              transform: openGroups[child.key] ? "rotate(180deg)" : "rotate(0)",
                              transition: "transform 0.2s",
                              opacity: 0.6,
                            }} />
                          </button>
                          {(openGroups[child.key] ?? false) && (
                            <div style={{ paddingLeft: 20, paddingBottom: 2 }}>
                              {child.children.map((grandchild: any) => {
                                const gIcon = grandchild.icon as any;
                                const gActive = isActive(grandchild.href);
                                return (
                                  <Link
                                    key={grandchild.href}
                                    href={grandchild.href || "#"}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                      padding: "5px 8px",
                                      margin: "1px 6px 1px 0",
                                      borderRadius: 4,
                                      textDecoration: "none",
                                      color: gActive ? "#fff" : "#475569",
                                      background: gActive ? "rgba(37,99,235,0.8)" : "transparent",
                                      fontSize: 11,
                                      fontWeight: gActive ? 600 : 400,
                                      transition: "all 0.15s",
                                    }}
                                    onMouseEnter={e => {
                                      if (!gActive) {
                                        (e.currentTarget as HTMLElement).style.background = "rgba(51,65,85,0.5)";
                                        (e.currentTarget as HTMLElement).style.color = "#94a3b8";
                                      }
                                    }}
                                    onMouseLeave={e => {
                                      if (!gActive) {
                                        (e.currentTarget as HTMLElement).style.background = "transparent";
                                        (e.currentTarget as HTMLElement).style.color = "#475569";
                                      }
                                    }}
                                  >
                                    {gIcon && React.createElement(gIcon, { size: 11, style: { flexShrink: 0, opacity: 0.7 } })}
                                    <span style={{ flex: 1 }}>{grandchild.label}</span>
                                    {grandchild.badge && (
                                      <span style={{
                                        fontSize: 9, padding: "1px 4px", borderRadius: 3,
                                        background: "rgba(245,158,11,0.15)", color: "#f59e0b",
                                        fontWeight: 600, flexShrink: 0,
                                      }}>{grandchild.badge}</span>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // 二级菜单：普通链接
                    const ChildIcon = child.icon;
                    const childActive = isActive(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href || "#"}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "7px 10px",
                          margin: "1px 6px 1px 0",
                          borderRadius: 5,
                          textDecoration: "none",
                          color: childActive ? "#fff" : "#64748b",
                          background: childActive ? "rgba(37,99,235,0.85)" : "transparent",
                          fontSize: 12,
                          fontWeight: childActive ? 600 : 400,
                          transition: "all 0.15s",
                          boxShadow: childActive ? "0 1px 4px rgba(37,99,235,0.25)" : "none",
                        }}
                        onMouseEnter={e => {
                          if (!childActive) {
                            (e.currentTarget as HTMLElement).style.background = "rgba(51,65,85,0.7)";
                            (e.currentTarget as HTMLElement).style.color = "#cbd5e1";
                          }
                        }}
                        onMouseLeave={e => {
                          if (!childActive) {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "#64748b";
                          }
                        }}
                      >
                        <ChildIcon size={13} style={{ flexShrink: 0, opacity: 0.7 }} />
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {child.label}
                          </span>
                        </span>
                        {child.badge && (
                          <span style={{
                            fontSize: 9, padding: "1px 4px", borderRadius: 3,
                            background: "rgba(245,158,11,0.15)", color: "#f59e0b", fontWeight: 600,
                            whiteSpace: "nowrap", marginLeft: 4, flexShrink: 0,
                          }}>{child.badge}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 底部区域 */}
      <div style={{
        borderTop: `1px solid ${sidebarBorder}`,
        padding: "8px 6px",
        flexShrink: 0,
      }}>
        {!collapsed && user && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 10px", borderRadius: 6, marginBottom: 4,
            cursor: "pointer",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hoverBg}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
          >
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}>
              {(user.full_name || user.username || "U")[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.full_name || user.username}
              </div>
              <div style={{ fontSize: 10, color: "#64748b" }}>{user.role || "管理员"}</div>
            </div>
          </div>
        )}

        {/* 退出登录 */}
        <button
          onClick={handleLogout}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: collapsed ? "7px 0" : "7px 10px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: 6, border: "none", background: "transparent",
            color: "#64748b", cursor: "pointer", width: "100%",
            fontSize: 12, transition: "all 0.15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = hoverBg;
            (e.currentTarget as HTMLElement).style.color = "#fff";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#64748b";
          }}
          title="退出登录"
        >
          <LogOut size={14} style={{ flexShrink: 0 }} />
          {!collapsed && <span>退出登录</span>}
        </button>

        {/* 折叠按钮 */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: collapsed ? "7px 0" : "7px 10px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: 6, border: "none", background: "transparent",
            color: "#64748b", cursor: "pointer", width: "100%",
            fontSize: 12, transition: "all 0.15s", marginTop: 2,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = hoverBg;
            (e.currentTarget as HTMLElement).style.color = "#fff";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#64748b";
          }}
        >
          {collapsed
            ? <ChevronRight size={14} style={{ flexShrink: 0 }} />
            : <><ChevronLeft size={14} style={{ flexShrink: 0 }} /><span>收起侧栏</span></>
          }
        </button>
      </div>
    </aside>
  );
}

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header style={{
      height: 52,
      background: "#fff",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      flexShrink: 0,
    }}>
      <div>
        <h1 style={{ fontWeight: 600, fontSize: 15, color: "#1e293b", margin: 0, lineHeight: 1.3 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.2 }}>{subtitle}</p>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ position: "relative" }}>
          <Search size={13} style={{
            position: "absolute", left: 9, top: "50%",
            transform: "translateY(-50%)", color: "#94a3b8",
          }} />
          <input
            type="text"
            placeholder="搜索功能、数据..."
            style={{
              width: 200, height: 32,
              paddingLeft: 28, paddingRight: 12,
              borderRadius: 6,
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              fontSize: 12, color: "#334155",
              outline: "none",
            }}
            onFocus={e => {
              e.target.style.borderColor = "#3b82f6";
              e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
              e.target.style.background = "#fff";
            }}
            onBlur={e => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.boxShadow = "none";
              e.target.style.background = "#f8fafc";
            }}
          />
        </div>
        <button style={{
          width: 32, height: 32, borderRadius: 6, border: "1px solid #e2e8f0",
          background: "#f8fafc", display: "flex", alignItems: "center",
          justifyContent: "center", cursor: "pointer", position: "relative",
        }}>
          <Bell size={14} style={{ color: "#64748b" }} />
          <span style={{
            position: "absolute", top: 6, right: 6,
            width: 6, height: 6, borderRadius: "50%",
            background: "#ef4444",
          }} />
        </button>
        <button style={{
          width: 32, height: 32, borderRadius: 6, border: "1px solid #e2e8f0",
          background: "#f8fafc", display: "flex", alignItems: "center",
          justifyContent: "center", cursor: "pointer",
        }}>
          <Settings size={14} style={{ color: "#64748b" }} />
        </button>
      </div>
    </header>
  );
}
