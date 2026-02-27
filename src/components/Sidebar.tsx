import { NavLink, useLocation } from 'react-router-dom';
import {
    ShieldCheck,
    ClipboardList,
    Network,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

/* ─── Navigation Items ─────────────────────────────────────────────────────── */

interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
    description: string;
}

const NAV_ITEMS: NavItem[] = [
    {
        label: 'SOP Management',
        path: '/',
        icon: <ShieldCheck className="h-[18px] w-[18px]" />,
        description: 'Standard Operating Procedures',
    },
    {
        label: 'Work Inventory',
        path: '/work-inventory',
        icon: <ClipboardList className="h-[18px] w-[18px]" />,
        description: 'Tasks & Modules',
    },
    {
        label: 'Org Structure',
        path: '/org_structure',
        icon: <Network className="h-[18px] w-[18px]" />,
        description: 'Roles & RACI',
    },
];

/* ─── Sidebar Component ────────────────────────────────────────────────────── */

interface SidebarProps {
    collapsed?: boolean;
}

export function Sidebar({ collapsed: controlledCollapsed }: SidebarProps) {
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const collapsed = controlledCollapsed ?? internalCollapsed;
    const location = useLocation();

    return (
        <aside
            className="sidebar"
            style={{
                width: collapsed ? 64 : 240,
                minWidth: collapsed ? 64 : 240,
                transition: 'width 0.2s ease, min-width 0.2s ease',
            }}
        >
            {/* Brand */}
            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <ShieldCheck className="h-5 w-5" />
                </div>
                {!collapsed && (
                    <div className="sidebar-brand-text">
                        <span className="sidebar-brand-name">SOPvault</span>
                        <span className="sidebar-brand-tagline">Enterprise Platform</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {!collapsed && (
                    <div className="sidebar-section-label">MODULES</div>
                )}
                {NAV_ITEMS.map((item) => {
                    const isActive =
                        item.path === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(item.path);

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`sidebar-link ${isActive ? 'active' : ''}`}
                            title={collapsed ? item.label : undefined}
                        >
                            <span className="sidebar-link-icon">{item.icon}</span>
                            {!collapsed && (
                                <div className="sidebar-link-text">
                                    <span className="sidebar-link-label">{item.label}</span>
                                    <span className="sidebar-link-desc">{item.description}</span>
                                </div>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Collapse Toggle */}
            {controlledCollapsed === undefined && (
                <div className="sidebar-footer">
                    <button
                        className="sidebar-toggle"
                        onClick={() => setInternalCollapsed(!internalCollapsed)}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed
                            ? <ChevronRight className="h-4 w-4" />
                            : <ChevronLeft className="h-4 w-4" />
                        }
                        {!collapsed && <span>Collapse</span>}
                    </button>
                </div>
            )}
        </aside>
    );
}
