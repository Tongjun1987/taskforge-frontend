"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Target, Database, Layers, Tag, Shield, BarChart3, Rocket,
  Settings, Bell, Search, ChevronDown, LogOut,
  Sparkles, Users, Star, FileText, CheckCircle2,
  Activity, Cpu, Gauge, FolderOpen, ChevronRight,
  Wrench, ClipboardList, Layers3, ArrowUpDown, TrendingUp,
  History, Route, Upload
} from "lucide-react";

// ============================================================
// 三大一级菜单 + 子菜单定义
// ============================================================
const TOP_MENUS = [
  {
    key: "task-modeling",
    label: "首页",
    icon: Target,
    href: "/task-modeling",
    color: "#3b82f6",
    desc: "场景定义 · 任务拆解 · 标签Schema",
    subItems: [],
  },
  {
    key: "data-production",
    label: "数据生产中心",
    icon: Database,
    href: "/data-production",
    color: "#8b5cf6",
    desc: "数据采集 · 数据处理 · 数据标注 · 数据管理",
    subItems: [
      // 数据接入（二级菜单，带三级子菜单）
      {
        label: "数据接入",
        desc: "数据采集 · 数据汇聚 · 数据溯源",
        icon: Upload,
        children: [
          { label: "数据采集", href: "/data-asset/data-access", badge: null },
          { label: "数据汇聚", href: "/data-asset/data-access/convergence", badge: null },
          { label: "数据溯源", href: "/data-asset/data-access/trace", badge: null },
        ],
      },
      {
        label: "数据处理",
        desc: "数据清洗 · 数据增强 · 数据合成",
        icon: Layers3,
        children: [
          { label: "数据清洗", href: "/data-cleaning", badge: null },
          { label: "数据增强", href: "/data-augmentation", badge: null },
          { label: "数据合成", href: "/data-synthesis", badge: null },
        ],
      },
      {
        label: "数据标注",
        desc: "专家标注 · 智能标注",
        icon: Tag,
        children: [
          { label: "专家标注", href: "/annotation", badge: null },
          { label: "智能标注", href: "/smart-annotation", badge: "AI", color: "#10b981" },
        ],
      },
      {
        label: "数据管理",
        desc: "数据集划分 · 发布 · 测评 · 跨项目共享",
        icon: Shield,
        children: [
          { label: "数据质检", href: "/quality", badge: null },
          { label: "数据集管理", href: "/data-asset/dataset", badge: null },
        ],
      },
    ],
  },
  {
    key: "model-production",
    label: "模型生产中心",
    icon: Cpu,
    href: "/model-production",
    color: "#f59e0b",
    desc: "模型管理 · 训练评估 · 应用发布",
    subItems: [
      {
        label: "模型管理",
        desc: "模型仓库 · 版本管理",
        icon: FolderOpen,
        children: [
          { label: "模型仓库", href: "/model-repo", badge: null },
        ],
      },
      {
        label: "训练管理",
        desc: "模型训练 · 模型评估 · 模型测试",
        icon: ArrowUpDown,
        children: [
          { label: "模型训练", href: "/model-training", badge: null },
          { label: "模型评估", href: "/model-evaluation", badge: null },
          { label: "模型测试", href: "/model-testing", badge: null },
        ],
      },
      {
        label: "评测管理",
        desc: "评测任务 · Benchmark · 指标看板",
        icon: Gauge,
        children: [
          { label: "模型评测", href: "/model-eval", badge: null },
        ],
      },
      {
        label: "应用管理",
        desc: "知识库 · Prompt管理 · 智能体管理",
        icon: Layers3,
        children: [
          { label: "知识库", href: "/knowledge-base", badge: null },
          { label: "Prompt管理", href: "/prompt-management", badge: null },
          { label: "智能体管理", href: "/agent-management", badge: null },
        ],
      },
    ],
  },
];

// ============================================================
// 辅助组件：带子项的下拉菜单
// ============================================================
function SubMenuPanel({ item, onClose }: { item: any; onClose: () => void }) {
  const pathname = usePathname();
  // 使用精确匹配，避免子路径误匹配
  const isActive = (href: string) => pathname === href;

  return (
    <div
      onMouseLeave={onClose}
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
        minWidth: 200,
        maxWidth: 260,
        padding: "6px 0",
        animation: "dropdownIn 0.15s ease",
      }}
    >
      {item.subItems.map((sub: any, idx: number) => (
        <div key={sub.label || idx}>
          {/* 分隔线 */}
          {sub.divider ? (
            <div style={{ borderTop: "1px solid #f1f5f9", margin: "6px 0" }} />
          ) : sub.href && !sub.children ? (
            // 单项（无子菜单）
            <Link
              href={sub.href}
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 14px",
                textDecoration: "none",
                color: isActive(sub.href) ? item.color : "#334155",
                background: isActive(sub.href) ? `${item.color}12` : "transparent",
                borderLeft: isActive(sub.href) ? `3px solid ${item.color}` : "3px solid transparent",
                fontSize: 13,
                fontWeight: isActive(sub.href) ? 600 : 400,
                transition: "all 0.1s",
              }}
              onMouseEnter={e => {
                if (!isActive(sub.href)) {
                  (e.currentTarget as HTMLElement).style.background = "#f1f5f9";
                  (e.currentTarget as HTMLElement).style.color = "#1e293b";
                }
              }}
              onMouseLeave={e => {
                if (!isActive(sub.href)) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#334155";
                }
              }}
            >
              <sub.icon size={14} style={{ color: item.color, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{sub.label}</span>
              {sub.badge && (
                <span style={{
                  fontSize: 9, padding: "1px 5px", borderRadius: 4,
                  background: `${item.color}15`, color: item.color, fontWeight: 700,
                }}>{sub.badge}</span>
              )}
            </Link>
          ) : (
            // 带子菜单的分组
            <div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 14px",
                color: "#94a3b8",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                borderTop: idx > 0 ? "1px solid #f1f5f9" : "none",
                marginTop: idx > 0 ? 4 : 0,
              }}>
                <sub.icon size={13} style={{ color: item.color, flexShrink: 0 }} />
                {sub.label}
                {sub.badge && (
                  <span style={{
                    fontSize: 9, padding: "1px 5px", borderRadius: 4,
                    background: `${item.color}15`, color: item.color, fontWeight: 700,
                    marginLeft: "auto",
                  }}>{sub.badge}</span>
                )}
              </div>
              {sub.children?.map((child: any) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onClose}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 14px 7px 36px",
                    textDecoration: "none",
                    color: isActive(child.href) ? item.color : "#475569",
                    background: isActive(child.href) ? `${item.color}10` : "transparent",
                    fontSize: 12,
                    fontWeight: isActive(child.href) ? 600 : 400,
                    transition: "all 0.1s",
                  }}
                  onMouseEnter={e => {
                    if (!isActive(child.href)) {
                      (e.currentTarget as HTMLElement).style.background = "#f1f5f9";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive(child.href)) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
                  }}
                >
                  <span style={{ flex: 1 }}>{child.label}</span>
                  {child.badge && (
                    <span style={{
                      fontSize: 9, padding: "1px 5px", borderRadius: 4,
                      background: child.color ? `${child.color}20` : "#f1f5f9",
                      color: child.color || "#64748b", fontWeight: 700,
                    }}>{child.badge}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 主组件：顶部三栏导航
// ============================================================
export function TopNavBar() {
  const pathname = usePathname();
  // 点击锁定的菜单（用于 toggle 收起）
  const [clickedMenu, setClickedMenu] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  // hover 时的菜单（临时，不用于渲染）
  const [hoverMenu, setHoverMenu] = useState<string | null>(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) { try { setUser(JSON.parse(u)); } catch {} }
  }, []);

  // 判断哪个顶级菜单高亮
  const getActiveMenuKey = () => {
    if (pathname.startsWith("/task-modeling")) return "task-modeling";
    if (pathname.startsWith("/data-asset") || pathname.startsWith("/dataset") ||
        pathname.startsWith("/data-cleaning") || pathname.startsWith("/data-augmentation") ||
        pathname.startsWith("/data-synthesis") ||
        pathname.startsWith("/annotation") ||
        pathname.startsWith("/smart-annotation") || pathname.startsWith("/multi-annotator") ||
        pathname.startsWith("/quality") || pathname.startsWith("/data-ops") ||
        pathname.startsWith("/data-preprocess") || pathname.startsWith("/data-augment") ||
        pathname.startsWith("/data-split") || pathname === "/data-production")
      return "data-production";
    if (pathname.startsWith("/model-training") || pathname.startsWith("/model-evaluation") ||
        pathname.startsWith("/model-testing") || pathname.startsWith("/model-eval") ||
        pathname.startsWith("/model-repo") || pathname.startsWith("/model-service") ||
        pathname.startsWith("/knowledge-base") || pathname.startsWith("/prompt-management") ||
        pathname.startsWith("/agent-management") || pathname === "/model-production")
      return "model-production";
    return null;
  };

  const activeKey = getActiveMenuKey();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <>
      {/* ====== 顶部三栏导航 ====== */}
      <header
        style={{
          height: 52,
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "stretch",
          flexShrink: 0,
          zIndex: 100,
          position: "relative",
        }}
      >
        {/* Logo 区 */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 20px",
          borderRight: "1px solid #e2e8f0",
          minWidth: 200,
          flexShrink: 0,
        }}>
          <Image src="/logo.png" alt="logo" width={30} height={30} style={{ borderRadius: 7, flexShrink: 0, objectFit: 'contain' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", lineHeight: 1.2, letterSpacing: "-0.2px" }}>
              零数数智工厂
            </div>
          </div>
        </div>

        {/* 三栏菜单 - hover + click toggle */}
        <nav style={{ display: "flex", alignItems: "stretch", flex: 1 }} onMouseLeave={() => setHoverMenu(null)}>
          {TOP_MENUS.map((menu) => {
            const Icon = menu.icon;
            const isActive = activeKey === menu.key;
            const isHovered = hoverMenu === menu.key;
            const isClicked = clickedMenu === menu.key;
            const isOpen = isHovered || isClicked;

            return (
              <div
                key={menu.key}
                style={{ position: "relative" }}
                onMouseEnter={() => setHoverMenu(menu.key)}
              >
                {menu.href ? (
                  <Link
                    href={menu.href}
                    onClick={() => { setClickedMenu(null); setHoverMenu(null); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "0 18px",
                      height: "100%",
                      textDecoration: "none",
                      color: isActive ? menu.color : "#475569",
                      borderBottom: `2px solid ${isActive ? menu.color : "transparent"}`,
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Icon size={14} style={{ flexShrink: 0 }} />
                    {menu.label}
                  </Link>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // 点击时设置 clickedMenu（点击外部才清）
                      setClickedMenu(isClicked ? null : menu.key);
                      setHoverMenu(null);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "0 18px",
                      height: "100%",
                      border: "none",
                      background: isOpen ? `${menu.color}0a` : "transparent",
                      color: isActive ? menu.color : "#475569",
                      borderBottom: `2px solid ${isActive ? menu.color : "transparent"}`,
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Icon size={14} style={{ flexShrink: 0 }} />
                    {menu.label}
                    {menu.subItems.length > 0 && (
                      <ChevronDown
                        size={11}
                        style={{
                          transition: "transform 0.2s",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          opacity: 0.6,
                        }}
                      />
                    )}
                  </button>
                )}

                {/* 下拉面板 - 用 CSS :hover 类名控制，JS 只管 click toggle */}
                {menu.subItems.length > 0 && (
                  <div
                    className={`topnav-panel ${isOpen ? "open" : ""}`}
                    onMouseEnter={() => setHoverMenu(menu.key)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SubMenuPanel
                      item={menu}
                      onClose={() => { setClickedMenu(null); setHoverMenu(null); }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* 右侧操作区 */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 16px",
          borderLeft: "1px solid #e2e8f0",
          flexShrink: 0,
        }}>
          {/* 通知 */}
          <button style={{
            width: 30, height: 30, borderRadius: 6,
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer",
            position: "relative",
          }}>
            <Bell size={13} style={{ color: "#64748b" }} />
            <span style={{
              position: "absolute", top: 5, right: 5,
              width: 6, height: 6, borderRadius: "50%",
              background: "#ef4444",
            }} />
          </button>

          {/* 用户头像 */}
          {user && (
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "4px 8px", borderRadius: 6,
              cursor: "pointer",
              border: "1px solid #e2e8f0",
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0,
              }}>
                {(user.full_name || user.username || "U")[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#1e293b", lineHeight: 1.2 }}>
                  {user.full_name || user.username}
                </div>
                <div style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.2 }}>
                  {user.role || "管理员"}
                </div>
              </div>
            </div>
          )}

          {/* 版本迭代 */}
          <Link href="/version-history" style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 6,
            border: "1px solid #e2e8f0",
            background: "#eff6ff",
            textDecoration: "none", cursor: "pointer",
          }}>
            <History size={13} style={{ color: "#2563eb" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#2563eb" }}>迭代历史</span>
          </Link>



          {/* 退出 */}
          <button
            onClick={handleLogout}
            title="退出登录"
            style={{
              width: 30, height: 30, borderRadius: 6,
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer",
            }}
          >
            <LogOut size={13} style={{ color: "#64748b" }} />
          </button>
        </div>
      </header>

      {/* 下拉面板样式 - CSS hover 控制显示/隐藏 */}
      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .topnav-panel {
          display: none;
          position: absolute;
          top: calc(100% + 4px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 200;
          animation: dropdownIn 0.15s ease;
        }
        .topnav-panel.open {
          display: block;
        }
      `}</style>
    </>
  );
}

// 辅助函数
function menuColor(key: string | null) {
  const map: Record<string, string> = {
    "task-modeling": "#3b82f6",
    "data-production": "#8b5cf6",
    "model-production": "#f59e0b",
  };
  return key ? (map[key] || "#3b82f6") : "#3b82f6";
}

// ============================================================
// 侧边栏（重构：仅显示当前模块的子菜单）
// ============================================================
function getSubMenu(key: string) {
  const menu = TOP_MENUS.find(m => m.key === key);
  if (!menu) return [];
  return menu.subItems;
}

function flattenSubItems(subItems: any[]): any[] {
  const result: any[] = [];
  subItems.forEach(item => {
    if (item.href) result.push(item);
    if (item.children) {
      item.children.forEach((c: any) => {
        if (c.href) result.push({ ...c, parentLabel: item.label });
      });
    }
  });
  return result;
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const activeKey = (() => {
    if (pathname.startsWith("/task-modeling")) return "task-modeling";
    if (pathname.startsWith("/data-asset") || pathname.startsWith("/dataset") ||
        pathname.startsWith("/data-cleaning") || pathname.startsWith("/data-augmentation") ||
        pathname.startsWith("/data-synthesis") ||
        pathname.startsWith("/annotation") ||
        pathname.startsWith("/smart-annotation") || pathname.startsWith("/multi-annotator") ||
        pathname.startsWith("/quality") || pathname.startsWith("/data-ops") ||
        pathname.startsWith("/data-preprocess") || pathname.startsWith("/data-augment") ||
        pathname.startsWith("/data-split") || pathname === "/data-production")
      return "data-production";
    if (pathname.startsWith("/model-training") || pathname.startsWith("/model-evaluation") ||
        pathname.startsWith("/model-testing") || pathname.startsWith("/model-eval") ||
        pathname.startsWith("/model-repo") || pathname.startsWith("/model-service") ||
        pathname.startsWith("/knowledge-base") || pathname.startsWith("/prompt-management") ||
        pathname.startsWith("/agent-management") || pathname === "/model-production")
      return "model-production";
    return null;
  })();

  const currentMenu = TOP_MENUS.find(m => m.key === activeKey);
  const subItems = currentMenu ? getSubMenu(activeKey) : [];
  const flatItems = flattenSubItems(subItems);

  const sidebarBg = "#f8fafc";
  const sidebarBorder = "#e2e8f0";
  const activeBg = "#fff";
  const hoverBg = "#eef2f7";
  const activeColor = currentMenu?.color || "#3b82f6";

  const isActive = (href: string) => pathname === href;

  if (!currentMenu || flatItems.length === 0) return null;

  return (
    <aside style={{
      width: collapsed ? 48 : 200,
      minWidth: collapsed ? 48 : 200,
      background: sidebarBg,
      borderRight: `1px solid ${sidebarBorder}`,
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      overflow: "hidden",
      transition: "width 0.2s ease",
    }}>
      {/* 收起按钮 */}
      <div style={{
        padding: "8px 6px",
        borderBottom: `1px solid ${sidebarBorder}`,
        display: "flex",
        justifyContent: collapsed ? "center" : "flex-end",
      }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            padding: 4, borderRadius: 4, color: "#94a3b8",
            display: "flex", alignItems: "center",
          }}
          title={collapsed ? "展开菜单" : "收起菜单"}
        >
          <ChevronRight
            size={14}
            style={{
              transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 0.2s",
            }}
          />
        </button>
      </div>

      {/* 子菜单列表 */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
        {subItems.filter((sub: any) => !sub.divider).map((sub: any) => (
          <div key={sub.label}>
            {/* 分组标题 */}
            <div style={{
              padding: collapsed ? "6px 8px" : "6px 12px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 10,
              fontWeight: 700,
              color: "#cbd5e1",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              justifyContent: collapsed ? "center" : "flex-start",
              marginTop: 4,
            }}>
              {!collapsed && (
                <>
                  <sub.icon size={11} style={{ color: activeColor, flexShrink: 0 }} />
                  {sub.label}
                </>
              )}
              {collapsed && <sub.icon size={13} style={{ color: activeColor }} />}
            </div>

            {/* 子项 */}
            {(sub.children || []).map((child: any) => {
              const childActive = isActive(child.href);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: collapsed ? "8px 0" : "8px 12px",
                    margin: "1px 6px",
                    borderRadius: 6,
                    textDecoration: "none",
                    color: childActive ? activeColor : "#64748b",
                    background: childActive ? `${activeColor}12` : "transparent",
                    borderLeft: childActive ? `3px solid ${activeColor}` : "3px solid transparent",
                    fontSize: 12,
                    fontWeight: childActive ? 600 : 400,
                    justifyContent: collapsed ? "center" : "flex-start",
                    transition: "all 0.1s",
                  }}
                  onMouseEnter={e => {
                    if (!childActive) {
                      (e.currentTarget as HTMLElement).style.background = hoverBg;
                      (e.currentTarget as HTMLElement).style.color = "#334155";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!childActive) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "#64748b";
                    }
                  }}
                  title={collapsed ? child.label : ""}
                >
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: collapsed ? "center" : "left" }}>
                    {collapsed ? "" : child.label}
                  </span>
                  {child.badge && !collapsed && (
                    <span style={{
                      fontSize: 9, padding: "1px 5px", borderRadius: 4,
                      background: `${activeColor}15`, color: activeColor, fontWeight: 700,
                    }}>{child.badge}</span>
                  )}
                </Link>
              );
            })}

            {/* 直接链接的子项（无children） */}
            {sub.href && !sub.children && (
              <Link
                key={sub.href}
                href={sub.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: collapsed ? "8px 0" : "8px 12px",
                  margin: "1px 6px",
                  borderRadius: 6,
                  textDecoration: "none",
                  color: isActive(sub.href) ? activeColor : "#64748b",
                  background: isActive(sub.href) ? `${activeColor}12` : "transparent",
                  borderLeft: isActive(sub.href) ? `3px solid ${activeColor}` : "3px solid transparent",
                  fontSize: 12,
                  fontWeight: isActive(sub.href) ? 600 : 400,
                  justifyContent: collapsed ? "center" : "flex-start",
                  transition: "all 0.1s",
                }}
                onMouseEnter={e => {
                  if (!isActive(sub.href)) {
                    (e.currentTarget as HTMLElement).style.background = hoverBg;
                    (e.currentTarget as HTMLElement).style.color = "#334155";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive(sub.href)) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#64748b";
                  }
                }}
                title={collapsed ? sub.label : ""}
              >
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: collapsed ? "center" : "left" }}>
                  {collapsed ? "" : sub.label}
                </span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}

// TopBar 保留（兼容旧代码）
export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const pathname = usePathname();

  const activeKey = (() => {
    if (pathname.startsWith("/task-modeling")) return "task-modeling";
    if (pathname.startsWith("/data-asset") || pathname.startsWith("/dataset") ||
        pathname.startsWith("/data-cleaning") || pathname.startsWith("/data-augmentation") ||
        pathname.startsWith("/data-synthesis") ||
        pathname.startsWith("/annotation") ||
        pathname.startsWith("/smart-annotation") || pathname.startsWith("/multi-annotator") ||
        pathname.startsWith("/quality") || pathname.startsWith("/data-ops") ||
        pathname.startsWith("/data-preprocess") || pathname === "/data-production")
      return "data-production";
    if (pathname.startsWith("/model-training") || pathname.startsWith("/model-evaluation") ||
        pathname.startsWith("/model-testing") || pathname.startsWith("/model-eval") ||
        pathname.startsWith("/model-repo") || pathname.startsWith("/model-service") ||
        pathname.startsWith("/knowledge-base") || pathname.startsWith("/prompt-management") ||
        pathname.startsWith("/agent-management") || pathname === "/model-production")
      return "model-production";
    return null;
  })();

  const menuColor = (key: string | null) => {
    const map: Record<string, string> = {
      "task-modeling": "#3b82f6",
      "data-production": "#8b5cf6",
      "model-production": "#f59e0b",
    };
    return key ? (map[key] || "#3b82f6") : "#3b82f6";
  };

  return (
    <header style={{
      height: 44,
      background: "#fff",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      flexShrink: 0,
      gap: 8,
    }}>
      <ChevronRight size={13} style={{ color: "#cbd5e1" }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{title || "当前页面"}</span>
      {subtitle && (
        <>
          <span style={{ color: "#cbd5e1", fontSize: 12 }}>/</span>
          <span style={{ fontSize: 12, color: "#64748b" }}>{subtitle}</span>
        </>
      )}
    </header>
  );
}
