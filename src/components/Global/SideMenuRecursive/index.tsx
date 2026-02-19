"use client";

import "./style.css";
import { iconAtom } from "@/jotai/global/icons.jotai";
import { useAtom } from "jotai";
import { IoChevronDownOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import { LuLogOut } from "react-icons/lu";
import { usePathname, useRouter } from "next/navigation";
import { TMenuRoutine } from "@/types/global/menu.type";

type TProps = { menu: any[]; depth?: number };

export const SideMenuRecursive = ({ menu, depth = 0 }: TProps) => {
    const [icons] = useAtom(iconAtom);
    const [admin, setAdmin] = useState(false);
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({ "1": true, "2": true, "3": true });
    const pathname = usePathname();
    const router = useRouter();

    const toggle = (item: any) => setOpenItems(p => ({ ...p, [item.code]: !p[item.code] }));
    const isOpen = (item: any) => !!openItems[item.code];

    const navigated = (link: string) => { if (!link) return; router.push(`/${link}`); };

    const logout = () => {
        ["token","name","admin","photo","modules"].forEach(k => localStorage.removeItem(k));
        router.push("/");
    };

    useEffect(() => {
        const a = localStorage.getItem("admin");
        if (a) setAdmin(a === "true");
    }, []);

    // Check if a route is active
    const isActive = (link: string) => link && pathname === `/${link}`;
    const hasActiveChild = (item: any): boolean =>
        item.subMenu?.some((s: any) => isActive(s.link) || hasActiveChild(s));

    return (
        <ul className="space-y-0.5">
            {menu.map((x: TMenuRoutine) => {
                const Icon = x.icon ? (icons as any)[x.icon] : null;
                const active = isActive(x.link);
                const childActive = hasActiveChild(x);
                const hasChildren = x.subMenu?.length > 0;

                return (
                    <div key={x.code}>
                        {x.code !== "0" ? (
                            <>
                                {(x.authorized || admin) && (
                                    <li>
                                        {/* Group label for top-level sections */}
                                        {depth === 0 && hasChildren && (
                                            <span className="nav-group-label">{x.description}</span>
                                        )}

                                        {/* Item button */}
                                        {(!hasChildren || depth > 0) && (
                                            <button
                                                onClick={() => { toggle(x); if (!hasChildren) navigated(x.link); }}
                                                className={`
                                                    w-full flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-150 text-left
                                                    ${active
                                                        ? "bg-[var(--primary-color)] text-white shadow-sm shadow-[var(--primary-color)]/30"
                                                        : childActive
                                                            ? "bg-white/8 text-white"
                                                            : "text-[#8D99A8] hover:bg-white/6 hover:text-white"
                                                    }
                                                `}
                                                style={{ border: "none", height: "auto", borderRadius: "0.5rem", justifyContent: "flex-start" }}
                                            >
                                                {Icon && (
                                                    <Icon size={17} className={`flex-shrink-0 ${active ? "text-white" : childActive ? "text-[var(--primary-color)]" : "text-[#8D99A8]"}`} />
                                                )}
                                                <span className="flex-1 truncate">{x.description}</span>
                                                {hasChildren && (
                                                    <IoChevronDownOutline size={14} className={`flex-shrink-0 transition-transform duration-200 ${isOpen(x) ? "rotate-180" : ""}`} />
                                                )}
                                            </button>
                                        )}

                                        {/* Parent with children (depth 0 with group label) */}
                                        {hasChildren && depth === 0 && (
                                            <div className={`overflow-hidden transition-all duration-200 ${isOpen(x) ? "max-h-screen" : "max-h-0"}`}>
                                                <ul className="space-y-0.5 border-l border-white/10 ml-4 pl-2 my-1">
                                                    {x.subMenu.map((sub: any) => (
                                                        (sub.authorized || admin) && (
                                                            <li key={sub.code}>
                                                                <button
                                                                    onClick={() => navigated(sub.link)}
                                                                    className={`
                                                                        w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 text-left
                                                                        ${isActive(sub.link)
                                                                            ? "text-white bg-white/10"
                                                                            : "text-[#6C7B8B] hover:text-white hover:bg-white/6"
                                                                        }
                                                                    `}
                                                                    style={{ border: "none", height: "auto", borderRadius: "0.5rem", justifyContent: "flex-start" }}
                                                                >
                                                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${isActive(sub.link) ? "bg-[var(--primary-color)]" : "bg-[#4B5967]"}`} />
                                                                    <span className="truncate">{sub.description}</span>
                                                                </button>
                                                            </li>
                                                        )
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </li>
                                )}
                            </>
                        ) : (
                            /* Logout item */
                            <li className="mt-4 pt-4 border-t border-white/10">
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#8D99A8] hover:bg-white/6 hover:text-white transition-all duration-150 text-left"
                                    style={{ border: "none", height: "auto", borderRadius: "0.5rem", justifyContent: "flex-start" }}
                                >
                                    <LuLogOut size={17} className="flex-shrink-0" />
                                    <span>{x.description}</span>
                                </button>
                            </li>
                        )}
                    </div>
                );
            })}
        </ul>
    );
};
