"use client";

import "./style.css";
import { menuOpenAtom } from "@/jotai/global/menu.jotai";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { HiMenuAlt2 } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import { api, uriBase } from "@/service/api.service";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { configApi, resolveResponse } from "@/service/config.service";
import { ButtonTheme } from "@/components/button-theme/ButtonTheme";
import { Logo } from "../logo";
import { BsBellFill } from "react-icons/bs";

export const Header = () => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [isOpenMenu, setIsOpenMenu] = useAtom(menuOpenAtom);
    const [name, setName] = useState<string>("");
    const [photo, setPhoto] = useState<string>("");
    const [dropOpen, setDropOpen] = useState(false);

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
        if (n) setName(n);
        if (p) setPhoto(p);
    }, []);

    return (
        <header>
            {/* Hamburger (mobile) */}
            {/* <button
                className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                onClick={() => setIsOpenMenu(!isOpenMenu)}
                style={{ padding: 0, height: "auto", background: "transparent", border: "none", boxShadow: "none" }}
            >
                {isOpenMenu ? <IoMdClose size={22} /> : <HiMenuAlt2 size={22} />}
            </button> */}

            {/* Logo */}
            <a href="/dashboard" className="flex-shrink-0">
                <Logo className="h-15" />
            </a>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Theme toggle */}
                <div className="flex items-center justify-center w-9 h-9 rounded-full border border-[var(--surface-border)] hover:border-[var(--primary-color)] transition-colors cursor-pointer bg-[var(--surface-card)]">
                    <ButtonTheme />
                </div>

                {/* Bell */}
                {/* <button
                    className="relative w-9 h-9 rounded-full border border-[var(--surface-border)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-all"
                    style={{ padding: 0, minWidth: "2.25rem" }}
                >
                    <BsBellFill size={15} className="mx-auto" />
                    <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-[var(--primary-color)] border-2 border-[var(--surface-card)]" />
                </button> */}

                {/* Divider */}
                <div className="hidden sm:block w-px h-6 bg-[var(--surface-border)] mx-1" />

                {/* User */}
                <div className="relative">
                    <div
                        className="flex items-center gap-2.5 cursor-pointer group select-none"
                        onClick={() => setDropOpen(!dropOpen)}
                    >
                        {photo ? (
                            <img
                                className="w-9 h-9 rounded-full object-cover border-2 border-[var(--surface-border)] group-hover:border-[var(--primary-color)] transition-colors"
                                src={`${uriBase}/${photo}`}
                                alt={name}
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--color-brand-300)] flex items-center justify-center text-white font-bold text-sm border-2 border-[var(--surface-border)] group-hover:border-[var(--primary-color)] transition-colors">
                                {name ? name.charAt(0).toUpperCase() : <FaUserCircle size={18} />}
                            </div>
                        )}
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">{name || "Usuário"}</p>
                            <p className="text-xs text-[var(--text-muted)]">Administrador</p>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-[var(--text-muted)] hidden md:block transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}>
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>

                    {dropOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
                            <div className="absolute right-0 top-12 z-50 w-44 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] shadow-lg py-1 overflow-hidden">
                                <div className="px-4 py-2.5 border-b border-[var(--surface-border)]">
                                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{name}</p>
                                    <p className="text-xs text-[var(--text-muted)]">Administrador</p>
                                </div>
                                <button
                                    onClick={sincLogged}
                                    className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--primary-color)] transition-colors"
                                    style={{ height: "auto", borderRadius: 0, justifyContent: "flex-start", boxShadow: "none", border: "none" }}
                                >
                                    Sincronizar dados
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};
