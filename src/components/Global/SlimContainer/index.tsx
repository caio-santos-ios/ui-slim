"use client";

import "./style.css";
import { useAtom } from "jotai";
import { iconAtom } from "@/jotai/global/icons.jotai";
import { ReactNode } from "react";

type TProp = {
    children: ReactNode;
    buttons?: ReactNode;
    inputSearch?: ReactNode;
    breadcrump: string;
    breadcrumpIcon: string;
}

export const SlimContainer = ({children, buttons, inputSearch, breadcrump, breadcrumpIcon}: TProp) => {
    const [icons] = useAtom<any>(iconAtom);
    const IconComponent = breadcrumpIcon ? icons[breadcrumpIcon] : null;
    
    return (
        <div className="slim-container">
            <div className="container-breadcrump">
                <div className="breadcrump">
                    {IconComponent && <IconComponent size={18} />}
                    <p>{breadcrump}</p>
                </div>

                <div>
                    {inputSearch}
                </div>

                <div className="buttons">
                    {buttons}
                </div>
            </div>

            <div className="slim-container-main">
                {children}
            </div>
        </div>
    )
}