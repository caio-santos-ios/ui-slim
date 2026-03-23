"use client";

import "./style.css";
import { useAtom } from "jotai";
import { menuOpenAtom, menuRoutinesAtom } from "@/jotai/global/menu.jotai";
import { sidebarAtom } from "@/jotai/global/sidebar.jotai";
import { TMenuRoutine } from "@/types/global/menu.type";
import { iconAtom } from "@/jotai/global/icons.jotai";
import { roleUserAtom, sincAtom } from "@/jotai/auth/auth.jotai";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IoChevronDownOutline } from "react-icons/io5";
import { LuLogOut, LuPanelLeftClose } from "react-icons/lu";

interface NavItemProps {
    item: TMenuRoutine;
    depth: number;
    expanded: boolean;
    admin: boolean;
}

function NavItem({ item, depth, expanded, admin }: NavItemProps) {
    const [icons] = useAtom(iconAtom);
    const [role, setRole] = useAtom(roleUserAtom);

    const pathname = usePathname();
    const router = useRouter();
    const hasChildren = item.subMenu?.length > 0;
    const Icon = item.icon ? (icons as any)[item.icon] : null;

    const isActive = (link: string) => !!link && pathname === `/${link}`;
    const hasActiveChild = (i: TMenuRoutine): boolean =>
        i.subMenu?.some((s) => isActive(s.link) || hasActiveChild(s));

    const active = isActive(item.link);
    const childActive = hasActiveChild(item);

    const [open, setOpen] = useState(childActive);
    useEffect(() => { if (childActive) setOpen(true); }, [childActive]);

    if(role == "Manager") {
        if (!['4', 'D01', 'D02', 'D03', 'D04', 'D05'].includes(item.code)) return null;
    } else {
        if (!item.authorized && !admin) return null;
    }

    if (depth === 0 && hasChildren) {
        return (
            <li>
                { expanded ? <span className="nav-group-label">{item.description}</span> : <div className="nav-group-divider" /> }
                <ul className="space-y-px">
                    {item.subMenu.map((sub) => (
                        <NavItem key={sub.code} item={sub} depth={1} expanded={expanded} admin={admin} />
                    ))}
                </ul>
            </li>
        );
    }

    if (hasChildren) {
        return (
            <li>
                <button
                    className={`nav-item-btn ${childActive ? "child-active" : ""}`}
                    onClick={() => setOpen((p) => !p)}
                >
                    {Icon && <Icon className="nav-item-icon" />}
                    <span className="nav-item-label">{item.description}</span>
                    <IoChevronDownOutline
                        size={13}
                        className={`nav-item-chevron ${open ? "open" : ""}`}
                    />
                    {!expanded && <span className="nav-item-tooltip">{item.description}</span>}
                </button>

                <div className={`nav-submenu-tree ${open && expanded ? "open" : "closed"}`}>
                    <ul className="nav-submenu-list">
                        {item.subMenu.map((sub) => (
                            <NavItem key={sub.code} item={sub} depth={depth + 1} expanded={expanded} admin={admin} />
                        ))}
                    </ul>
                </div>
            </li>
        );
    }

    return (
        <li>
            <button
                className={`nav-item-btn ${active ? "active" : ""}`}
                onClick={() => item.link && router.push(`/${item.link}`)}
            >
                {depth === 1 && Icon && <Icon className="nav-item-icon" />}
                {depth > 1 && <span className="nav-subitem-dot" />}
                <span className="nav-item-label">{item.description}</span>
                {!expanded && depth === 1 && <span className="nav-item-tooltip">{item.description}</span>}
            </button>
        </li>
    );
}

interface SidebarBodyProps {
    expanded: boolean;
    isMobile?: boolean;
    onToggle?: () => void;
    onClose?: () => void;
    menu: TMenuRoutine[];
    admin: boolean;
}

function SidebarBody({ expanded, isMobile, onToggle, onClose, menu, admin }: SidebarBodyProps) {
    const router = useRouter();
    const navItems = menu.filter((m) => m.code !== "0");
    const logoutItem = menu.find((m) => m.code === "0");

    const logout = () => {
        ["token", "name", "admin", "photo", "modules"].forEach((k) => localStorage.removeItem(k));
        router.push("/");
    };

    return (
        <>
            <div className="side-bar-logo slim-bg-side-bar">
                {(expanded || isMobile) && (
                    <div className="flex-1 min-w-0 overflow-hidden"></div>
                )}

                {!isMobile && (
                    <button
                        className="sidebar-toggle-btn"
                        onClick={onToggle}
                        title={expanded ? "Recolher menu" : "Expandir menu"}
                    >
                        <LuPanelLeftClose size={15} />
                    </button>
                )}

                {isMobile && (
                    <button
                        className="sidebar-toggle-btn"
                        onClick={onClose}
                        title="Fechar menu"
                        style={{ marginLeft: "auto" }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                )}
            </div>

            <nav className="side-bar-nav slim-bg-side-bar">
                <div className={`py-3 ${expanded || isMobile ? "px-3" : "px-2"}`}>
                    <ul className="space-y-px">
                        {navItems.map((item) => (
                            <NavItem
                                key={item.code}
                                item={item}
                                depth={0}
                                expanded={expanded || !!isMobile}
                                admin={admin}
                            />
                        ))}
                    </ul>
                </div>
            </nav>

            <div className="side-bar-footer slim-bg-side-bar">
                <button
                    className="nav-logout-btn"
                    onClick={logout}
                    title={!(expanded || isMobile) ? (logoutItem?.description ?? "Sair") : undefined}
                >
                    <LuLogOut size={16} className="shrink-0" style={{ minWidth: "1rem" }} />
                    <span className="nav-logout-label">{logoutItem?.description ?? "Sair"}</span>
                    {!(expanded || isMobile) && (
                        <span className="nav-item-tooltip">{logoutItem?.description ?? "Sair"}</span>
                    )}
                </button>
            </div>
        </>
    );
}

export const SideMenu = () => {
    const [isExpanded, setIsExpanded] = useAtom(sidebarAtom);
    const [isMobileOpen, setIsMobileOpen] = useAtom(menuOpenAtom);
    const [menu] = useAtom<TMenuRoutine[]>(menuRoutinesAtom);
    const [sinc] = useAtom(sincAtom);
    const [admin, setAdmin] = useState(false);

    useEffect(() => {
        const a = localStorage.getItem("admin");
        if (a) setAdmin(a === "true");
    }, []);
    
    useEffect(() => {
        const modulesStr = localStorage.getItem("modules");
        const r = localStorage.getItem("role");
        if(r != "Manager") {
            if (modulesStr) {
                const modules: any[] = JSON.parse(modulesStr);
                menu.forEach((x: TMenuRoutine) => {
                    if (x.subMenu.length > 0) {
                        x.authorized = false;
                        const idx = modules.findIndex((m: any) => m.code == x.code);
                        if (idx >= 0) {
                            const routines = modules[idx].routines as any[];
                            if (routines.length > 0) {
                                x.authorized = true;
                                x.subMenu.forEach((sub: TMenuRoutine) => {
                                    if (routines.find((r: any) => r.code == sub.code)) sub.authorized = true;
                                });
                            }
                        }
                    }
                });
            }
        }
    }, [sinc]);

    const pathname = usePathname();
    const prevPath = useRef(pathname);
    useEffect(() => {
        if (pathname !== prevPath.current) {
            prevPath.current = pathname;
            setIsMobileOpen(false);
        }
    }, [pathname]);

    const sharedProps = { menu, admin };

    return (
        <>
            <aside
                className={`side-bar slim-bg-side-bar hidden lg:flex flex-col ${isExpanded ? "expanded" : "collapsed"}`}
            >
                <SidebarBody
                    {...sharedProps}
                    expanded={isExpanded}
                    onToggle={() => setIsExpanded((p) => !p)}
                />
            </aside>

            <div className="lg:hidden">
                {isMobileOpen && (
                    <div
                        className="sidebar-overlay"
                        onClick={() => setIsMobileOpen(false)}
                    />
                )}
                <aside
                    className={`side-bar slim-bg-side-bar flex flex-col ${isMobileOpen ? "mobile-open" : "mobile-closed"}`}
                >
                    <SidebarBody
                        {...sharedProps}
                        expanded={true}
                        isMobile
                        onClose={() => setIsMobileOpen(false)}
                    />
                </aside>
            </div>
        </>
    );
};