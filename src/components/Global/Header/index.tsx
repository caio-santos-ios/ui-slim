"use client";

import "./style.css";
import { menuOpenAtom } from "@/jotai/global/menu.jotai";
import { sidebarAtom } from "@/jotai/global/sidebar.jotai";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { HiMenuAlt2 } from "react-icons/hi";
import { api, uriBase } from "@/service/api.service";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { configApi, resolveResponse } from "@/service/config.service";
import { ButtonTheme } from "@/components/button-theme/ButtonTheme";
import { Logo } from "../logo";
import { HiArrowPathRoundedSquare } from "react-icons/hi2";
import { roleUserAtom } from "@/jotai/auth/auth.jotai";

export const Header = () => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [isMobileOpen, setIsMobileOpen] = useAtom(menuOpenAtom);
    const [isExpanded] = useAtom(sidebarAtom);
    const [name, setName] = useState<string>("");
    const [photo, setPhoto] = useState<string>("");
    const [dropOpen, setDropOpen] = useState(false);
    const [role, setRole] = useAtom(roleUserAtom);
    const [subTitle, setSubTitle] = useState("Administrador");
    
    const sincLogged = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/users/logged`, configApi());
            const result = data.result;
            localStorage.setItem("photo", result.data.photo);
            localStorage.setItem("admin", result.data.admin);
            localStorage.setItem("modules", JSON.stringify(result.data.modules));
            setDropOpen(false);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const n = localStorage.getItem("name");
        const p = localStorage.getItem("photo");
        const r = localStorage.getItem("role");
        const a = localStorage.getItem("admin");
        
        if(r == "Manager") setSubTitle("Gestora");
        
        if(a) {
            if(a == "true") {
                setSubTitle("Administrador");
            } else {
                const permissionProfileName = localStorage.getItem("permissionProfileName");
                setSubTitle(permissionProfileName ? permissionProfileName : "");
            }
        }
        
        if (n) setName(n);
        if (p) setPhoto(p);
        if (r) setRole(r);
    }, []);

    return (
        <header>
            {/* ── Logo ── */}
            <a href="/erp/dashboard" className="shrink-0">
                <Logo className="h-14" />
            </a>

            {/* ── Spacer ── */}
            <div className="flex-1" />

            {/* ── Actions ── */}
            <div className="flex items-center gap-1.5">
                {/* Theme toggle */}
                <div className="flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--surface-border)] hover:border-[var(--accent-color)] hover:bg-[var(--accent-color-light)] transition-all cursor-pointer bg-[var(--surface-card)]">
                    <ButtonTheme />
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-6 bg-[var(--surface-border)] mx-1.5" />

                {/* User dropdown */}
                <div className="relative">
                    <div
                        className="flex items-center gap-2.5 cursor-pointer group select-none px-2 py-1.5 rounded-xl hover:bg-[var(--surface-hover)] transition-all"
                        onClick={() => setDropOpen(!dropOpen)}
                    >
                        {photo ? (
                            <img
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-[var(--surface-border)] group-hover:ring-[var(--accent-color)] transition-all"
                                src={`${uriBase}/${photo}`}
                                alt={name}
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] flex items-center justify-center text-white font-bold text-sm ring-2 ring-[var(--surface-border)] group-hover:ring-[var(--accent-color)] transition-all">
                                {name ? name.charAt(0).toUpperCase() : <FaUserCircle size={16} />}
                            </div>
                        )}
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">{name || "Usuário"}</p>
                            <p className="text-xs text-[var(--text-muted)]">{subTitle}</p>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-[var(--text-muted)] hidden md:block transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}>
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>

                    {dropOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
                            <div className="absolute right-0 top-13 z-50 w-52 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] shadow-lg overflow-hidden">
                                <div className="px-4 py-3 border-b border-[var(--surface-border)] bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color-light)]">
                                    <p className="text-xs font-bold text-white truncate">{name}</p>
                                    <p className="text-[0.7rem] text-[rgba(255,255,255,.6)]">{subTitle}</p>
                                </div>
                                <div className="py-1">
                                    <button
                                        onClick={sincLogged}
                                        className="w-full text-left px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--color-brand-25)] hover:text-[var(--primary-color)] transition-colors flex items-center gap-2.5"
                                        style={{ height: "auto", borderRadius: 0, boxShadow: "none", border: "none" }}
                                    >
                                        <HiArrowPathRoundedSquare size={15} />
                                        Sincronizar dados
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};