"use client";

import "./style.css";
import { useAtom } from "jotai";
import { iconAtom } from "@/jotai/global/icons.jotai";
import { ReactNode } from "react";
import Link from "next/link";

type TProp = {
    children: ReactNode;
    buttons?: ReactNode;
    inputSearch?: ReactNode;
    breadcrump: string;
    breadcrumpIcon: string;
    className?: string;
}

export const SlimContainer = ({ children, buttons, inputSearch, breadcrump, breadcrumpIcon, className }: TProp) => {
    const [icons] = useAtom<any>(iconAtom);
    const IconComponent = breadcrumpIcon ? icons[breadcrumpIcon] : null;

    return (
        <div className={`slim-container ${className ?? ""}`}>

            {/* ── Breadcrumb trail ── */}
            <nav className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-3">
                <Link href="/dashboard" className="hover:text-[var(--primary-color)] transition-colors">Dashboard</Link>
                <span>/</span>
                <span className="text-[var(--primary-color)] font-semibold">{breadcrump}</span>
            </nav>

            {/* ── Page header ── */}
            <div className="container-breadcrump mb-5">
                <div className="breadcrump">
                    {IconComponent && (
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "rgba(60,80,224,.1)" }}>
                            <IconComponent size={20} className="text-[var(--primary-color)]" />
                        </div>
                    )}
                    <p>{breadcrump}</p>
                </div>

                {/* Search + actions on the right */}
                <div className="flex items-end gap-3 flex-wrap">
                    {inputSearch && (
                        <div className="flex items-end gap-2 flex-wrap">
                            {inputSearch}
                        </div>
                    )}
                    <div className="buttons">{buttons}</div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="slim-container-main">
                {children}
            </div>
        </div>
    );
};
