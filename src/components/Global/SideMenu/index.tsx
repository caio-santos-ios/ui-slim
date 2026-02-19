"use client";

import "./style.css";
import { SideMenuRecursive } from "../SideMenuRecursive";
import { useAtom } from "jotai";
import { menuOpenAtom, menuRoutinesAtom } from "@/jotai/global/menu.jotai";
import { TMenuRoutine } from "@/types/global/menu.type";
import { useEffect } from "react";
import { sincAtom } from "@/jotai/auth/auth.jotai";
import { Logo } from "../logo";

export const SideMenu = () => {
    const [isOpenMenu] = useAtom<boolean>(menuOpenAtom);
    const [menu] = useAtom<TMenuRoutine[]>(menuRoutinesAtom);
    const [sinc] = useAtom(sincAtom);

    useEffect(() => {
        const modulesStr = localStorage.getItem("modules");
        if (modulesStr) {
            const modules: any[] = JSON.parse(modulesStr);
            menu.forEach((x: TMenuRoutine) => {
                if (x.subMenu.length > 0) {
                    x.authorized = false;
                    const idx = modules.findIndex((m: any) => m.code == x.code);
                    if (idx >= 0) {
                        const routines: any[] = modules[idx].routines;
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
    }, [sinc]);

    return (
        <>
            {/* Overlay mobile */}
            {isOpenMenu && (
                <div className="lg:hidden fixed inset-0 bg-black/40 z-30 backdrop-blur-sm" />
            )}

            <aside
                className={`
                    side-bar slim-bg-side-bar
                    open-menu
                    ${isOpenMenu ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0 lg:relative lg:block
                `}
                style={{ minHeight: "100%" }}
            >
                {/* Logo area — visible on mobile sidebar */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10 lg:hidden">
                    <Logo className="h-9 brightness-0 invert" />
                </div>

                {/* Nav */}
                <nav className="px-3 py-4">
                    <SideMenuRecursive menu={menu} />
                </nav>
            </aside>
        </>
    );
};
