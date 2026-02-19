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
    menu: string;
    breadcrumpIcon: string;
    className?: string;
}

export const SlimContainer = ({ children, buttons, inputSearch, breadcrump, menu, breadcrumpIcon, className }: TProp) => {
    const [icons] = useAtom<any>(iconAtom);
    const IconComponent = breadcrumpIcon ? icons[breadcrumpIcon] : null;

    return (
        <div className={`slim-container ${className ?? ""}`}>
            <nav className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-3.5">
                {
                    menu && (
                        <>
                            <p className="hover:text-[var(--accent-color)] transition-colors font-medium">
                                {menu}
                            </p>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-50">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </>
                    )
                }
                <span className="text-[var(--primary-color)] font-semibold">{breadcrump}</span>
            </nav>

            <div className="container-breadcrump">
                <div className="breadcrump">
                    {IconComponent && (
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "var(--accent-color-light)" }}>
                            <IconComponent size={20} className="text-[var(--accent-color)]" />
                        </div>
                    )}
                    <p>{breadcrump}</p>
                </div>

                <div className="flex items-end gap-3 flex-wrap">
                    {inputSearch && (
                        <div className="flex items-end gap-2 flex-wrap">
                            {inputSearch}
                        </div>
                    )}
                    <div className="buttons">{buttons}</div>
                </div>
            </div>

            {/* Divider */}
            <div className="mb-5 h-px bg-gradient-to-r from-[var(--surface-border)] via-[var(--accent-color)]/20 to-transparent" />

            {/* Content */}
            <div className="slim-container-main">
                {children}
            </div>
        </div>
    );
};
