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
        color: "var(--primary-color)",
        accentBg: "rgba(0,51,102,.08)",
        borderColor: "var(--primary-color)",
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
        color: "var(--accent-color)",
        accentBg: "rgba(102,204,153,.10)",
        borderColor: "var(--accent-color)",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
        ),
    },
    // {
    //     title: "Contas a Receber (Mês)",
    //     value: `R$ ${convertNumberMoney(d.accountReceivableMonth ?? 0)}`,
    //     delta: d.percentageChangeMonth ?? null,
    //     sub: `${new Date().getUTCMonth() + 1}/${new Date().getUTCFullYear()}`,
    //     color: "#F59E0B",
    //     accentBg: "rgba(245,158,11,.08)",
    //     borderColor: "#F59E0B",
    //     icon: (
    //         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
    //             <line x1="12" y1="1" x2="12" y2="23"/>
    //             <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    //         </svg>
    //     ),
    // },
    // {
    //     title: "Contas a Receber (Ano)",
    //     value: `R$ ${convertNumberMoney(d.accountReceivableYear ?? 0)}`,
    //     delta: d.percentageChangeYear ?? null,
    //     sub: `${new Date().getUTCFullYear()}`,
    //     color: "#EF4444",
    //     accentBg: "rgba(239,68,68,.08)",
    //     borderColor: "#EF4444",
    //     icon: (
    //         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
    //             <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    //         </svg>
    //     ),
    // },
];

export const FirstCard = ({ cardFirst }: TProps) => (
    <ul className="grid grid-cols-12 gap-5">
        {cards(cardFirst).map((c, i) => (
            <li
                key={i}
                className="h-52 col-span-3 relative rounded-2xl border bg-[var(--surface-card)] p-6 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-default"
                style={{ borderColor: "var(--surface-border)" }}>
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl transition-all duration-300"
                    style={{ background: c.borderColor }} />
                <div className="absolute top-0 left-0 bottom-0 w-0 group-hover:w-[3px] transition-all duration-300 rounded-l-2xl"
                    style={{ background: c.borderColor }} />

                <div className="flex items-start justify-between mb-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                        style={{ background: c.accentBg, color: c.color }}>
                        {c.icon}
                    </div>

                    {/* Delta badge */}
                    {c.delta != null && (
                        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${c.delta >= 0 ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400"}`}>
                            {c.delta >= 0 ? <FaArrowTrendUp size={9} /> : <FaArrowTrendDown size={9} />}
                            {Math.abs(c.delta)}%
                        </span>
                    )}
                </div>

                <p className="text-xs text-[var(--text-muted)] mb-1 font-semibold uppercase tracking-wider">{c.title}</p>
                <p className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">{c.value}</p>
                {/* {c.sub && <p className="text-xs text-[var(--text-muted)] mt-1">{c.sub}</p>} */}

                {/* Bottom accent bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(90deg, ${c.borderColor}, transparent)` }} />
            </li>
        ))}
    </ul>
);
