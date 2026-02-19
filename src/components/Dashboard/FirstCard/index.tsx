"use client";

import "./style.css";
import { convertNumberMoney } from "@/utils/convert.util";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";

type TProps = { cardFirst: any }

const cards = (d: any) => [
    {
        title: "Total de Clientes",
        value: d.customer ?? "—",
        delta: null,
        color: "#3C50E0",
        lightBg: "rgba(60,80,224,.08)",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
        ),
    },
    {
        title: "Total de Beneficiários",
        value: d.recipient ?? "—",
        delta: null,
        color: "#10B981",
        lightBg: "rgba(16,185,129,.08)",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
        ),
    },
    {
        title: "Contas a Receber (Mês)",
        value: `R$ ${convertNumberMoney(d.accountReceivableMonth ?? 0)}`,
        delta: d.percentageChangeMonth ?? null,
        sub: `${new Date().getUTCMonth() + 1}/${new Date().getUTCFullYear()}`,
        color: "#F59E0B",
        lightBg: "rgba(245,158,11,.08)",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
        ),
    },
    {
        title: "Contas a Receber (Ano)",
        value: `R$ ${convertNumberMoney(d.accountReceivableYear ?? 0)}`,
        delta: d.percentageChangeYear ?? null,
        sub: `${new Date().getUTCFullYear()}`,
        color: "#EF4444",
        lightBg: "rgba(239,68,68,.08)",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
        ),
    },
];

export const FirstCard = ({ cardFirst }: TProps) => (
    <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        {cards(cardFirst).map((c, i) => (
            <li
                key={i}
                className="relative rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-6 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
            >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: c.color }} />

                <div className="flex items-start justify-between mb-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: c.lightBg, color: c.color }}>
                        {c.icon}
                    </div>

                    {/* Delta badge */}
                    {c.delta != null && (
                        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${c.delta >= 0 ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400"}`}>
                            {c.delta >= 0 ? <FaArrowTrendUp size={9} /> : <FaArrowTrendDown size={9} />}
                            {Math.abs(c.delta)}%
                        </span>
                    )}
                </div>

                <p className="text-sm text-[var(--text-muted)] mb-1 font-medium">{c.title}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{c.value}</p>
                {c.sub && <p className="text-xs text-[var(--text-muted)] mt-1">{c.sub}</p>}
            </li>
        ))}
    </ul>
);
