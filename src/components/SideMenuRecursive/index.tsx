"use client";

import "./style.css";
import "@/styles/slim.css";
import { iconAtom } from "@/jotai/global/icons.jotai";
import { useAtom } from "jotai";
import { IoChevronDownOutline } from "react-icons/io5";
import { useState } from "react";
import { LuLogOut } from "react-icons/lu";
import { useRouter } from "next/navigation";

type TProps = {
    menu: any[]
};

export const SideMenuRecursive = ({menu}: TProps) => {
    const [icons] = useAtom(iconAtom);
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({"1": true, });
    const router = useRouter();
    

    const toggle = (item: any) => {
        setOpenItems(prev => ({
        ...prev,
        [item.code]: !prev[item.code]
        }));
    };

    const isOpen = (item: any) => openItems[item.code];

    const navigated = (link: string) => {
        if(!link) return;

        router.push(`/${link}`)
    }

    const logout = async () => {
        localStorage.removeItem("token");   
        router.push("/login");
    };

    return (
        <ul className="px-1">
            {menu.map((x: any) => {
                const IconComponent = x.icon ? icons[x.icon] : null;

                return (
                    <div key={x.code}>
                    {
                        x.code != "0" ?
                        <li onClick={() => navigated(x.link)} key={x.code}>
                            <div onClick={() => toggle(x)} className={`flex items-center gap-4 rounded-md py-2 cursor-pointer slim-bg-primary-hover ${x.padding}`}>
                                {IconComponent && <IconComponent size={15} />}
                                <span className="text-sm">{x.description}</span>

                                {x.subMenu.length > 0 && (
                                    <span className={`transition-transform duration-200 ${isOpen(x) ? "rotate-180" : "rotate-0"}`}>
                                        <IoChevronDownOutline />
                                    </span>
                                )}
                            </div>

                            {x.subMenu.length > 0 && isOpen(x) && (
                                <div className="pl-4">
                                    <SideMenuRecursive menu={x.subMenu} />
                                </div>
                            )}
                        </li>
                        :
                        <li key={x.code}>
                            <div onClick={logout} className={`flex items-center gap-4 rounded-md py-2 cursor-pointer px-2`}>
                                <LuLogOut />
                                <span className="text-sm">{x.description}</span>
                            </div>
                        </li>
                    }
                    </div>
                );
                
            })}
            {

            }
    </ul>
    )
}