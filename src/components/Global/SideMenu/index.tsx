"use client";

import "./style.css";
import { SideMenuRecursive } from "../SideMenuRecursive";
import { useAtom } from "jotai";
import { menuOpenAtom, menuRoutinesAtom } from "@/jotai/global/menu.jotai";
import { TMenuRoutine } from "@/types/global/menu.type";

export const SideMenu = () => {
    const [isOpenMenu] = useAtom<boolean>(menuOpenAtom);
    const [menu] = useAtom<TMenuRoutine[]>(menuRoutinesAtom);

    return (
        <div className={`side-bar slim-bg-side-bar py-8 text-lg font-semibold absolute open-menu ${isOpenMenu ? 'translate-x-0' : '-translate-x-108'} lg:translate-0 lg:relative lg:block`}>
            <SideMenuRecursive menu={menu} />
        </div>
    )
}