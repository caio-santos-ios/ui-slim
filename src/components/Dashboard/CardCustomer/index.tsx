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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Active */}
            <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 rounded-2xl" style={{ background: "linear-gradient(135deg, #3C50E0, #10B981)" }} />
                <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" className="w-5 h-5">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                        <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2.5 py-1 rounded-full">
                            {pct(active, total)}%
                        </span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] font-medium mb-1">Beneficiários Ativos</p>
                    <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{active}</p>
                    {/* Mini progress bar */}
                    <div className="mt-4 h-1.5 rounded-full bg-[var(--surface-border)]">
                        <div className="h-full rounded-full bg-green-500 transition-all duration-700" style={{ width: `${pct(active, total)}%` }} />
                    </div>
                </div>
            </div>

            {/* Inactive */}
            <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 rounded-2xl" style={{ background: "linear-gradient(135deg, #EF4444, #F59E0B)" }} />
                <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" className="w-5 h-5">
                                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                            </svg>
                        </div>
                        <span className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-2.5 py-1 rounded-full">
                            {pct(inactive, total)}%
                        </span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] font-medium mb-1">Beneficiários Inativos</p>
                    <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{inactive}</p>
                    <div className="mt-4 h-1.5 rounded-full bg-[var(--surface-border)]">
                        <div className="h-full rounded-full bg-red-500 transition-all duration-700" style={{ width: `${pct(inactive, total)}%` }} />
                    </div>
                </div>
            </div>
        </div>
    );
};
