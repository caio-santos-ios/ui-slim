"use client";

import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useEffect, useState } from "react";

export const CardCustomer = () => {
    const [active, setActive] = useState<number>(0);
    const [inactive, setInactive] = useState<number>(0);

    const pct = (v: number, t: number) => (!t ? 0 : parseFloat(((v / t) * 100).toFixed(1)));

    const getAll = async () => {
        try {
            const { data } = await api.get(`/customer-recipients?deleted=false&orderBy=createdAt&sort=asc&pageSize=10&pageNumber=1`, configApi());
            const list = data.result.data;
            setActive(list.filter((i: any) => i.active).length);
            setInactive(list.filter((i: any) => !i.active).length);
        } catch (e) { resolveResponse(e); }
    };

    useEffect(() => { getAll(); }, []);

    const total = active + inactive;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
            {/* Active card */}
            <div className="relative rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-6 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--accent-color)] rounded-t-2xl" />
                {/* Bg tint */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/[0.03] to-transparent rounded-2xl" />

                <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                            style={{ background: "rgba(102,204,153,.12)" }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="#66CC99" strokeWidth="2" className="w-5 h-5">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{ background: "rgba(102,204,153,.12)", color: "#3a9e72" }}>
                            {pct(active, total)}%
                        </span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] font-medium mb-1">Beneficiários Ativos</p>
                    <p className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">{active}</p>
                    <div className="mt-4 h-1.5 rounded-full bg-[var(--surface-border)]">
                        <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct(active, total)}%`, background: "var(--accent-color)" }} />
                    </div>
                </div>
            </div>

            {/* Inactive card */}
            <div className="relative rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-6 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--color-danger)] rounded-t-2xl" />
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-danger)]/[0.03] to-transparent rounded-2xl" />

                <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" className="w-5 h-5">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                        </div>
                        <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-2.5 py-1 rounded-full">
                            {pct(inactive, total)}%
                        </span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] font-medium mb-1">Beneficiários Inativos</p>
                    <p className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">{inactive}</p>
                    <div className="mt-4 h-1.5 rounded-full bg-[var(--surface-border)]">
                        <div className="h-full rounded-full bg-red-500 transition-all duration-700" style={{ width: `${pct(inactive, total)}%` }} />
                    </div>
                </div>
            </div>
        </div>
    );
};
