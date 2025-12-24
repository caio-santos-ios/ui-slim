"use client";

import "./style.css";
import { SideMenuRecursive } from "../SideMenuRecursive";
import { useAtom } from "jotai";
import { menuOpenAtom, menuRoutinesAtom } from "@/jotai/global/menu.jotai";
import { TMenuRoutine } from "@/types/global/menu.type";
import { useEffect } from "react";
import { sincAtom } from "@/jotai/auth/auth.jotai";

export const SideMenu = () => {
    const [isOpenMenu] = useAtom<boolean>(menuOpenAtom);
    const [menu] = useAtom<TMenuRoutine[]>(menuRoutinesAtom);
    const [sinc] = useAtom(sincAtom);

    useEffect(() => {
        const modulesStr = localStorage.getItem("modules");
        if(modulesStr) {
            const modules: any[] = JSON.parse(modulesStr);
            menu.map((x: TMenuRoutine) => {
                if(x.subMenu.length > 0) {
                    x.authorized = false;

                    const indexModule = modules.findIndex((m: any) => m.code == x.code);
                    if(indexModule >= 0) {
                        const routines: any[] = modules[indexModule].routines;
                        if(routines.length > 0) {
                            x.authorized = true;

                            x.subMenu.map((sub: TMenuRoutine) => {
                                if(routines.find((r: any) => r.code == sub.code)) {
                                    sub.authorized = true;
                                };
                                
                                return sub;
                            })
                        };                      
                    };

                    return x;
                } else {
                    return x;
                }
            });
        }
    }, [sinc]);

    return (
        <div className={`side-bar slim-bg-side-bar py-8 text-lg font-semibold absolute open-menu ${isOpenMenu ? 'translate-x-0' : '-translate-x-108'} lg:translate-0 lg:relative lg:block`}>
            <SideMenuRecursive menu={menu} />
        </div>
    )
}