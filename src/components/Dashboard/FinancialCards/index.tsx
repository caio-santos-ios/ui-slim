"use client";

import { convertNumberMoney } from "@/utils/convert.util";
import { FaMoneyBillWave } from "react-icons/fa";
import {
    LuTrendingDown, LuBadgeAlert, LuTarget,
    LuStethoscope, LuUsers,
} from "react-icons/lu";

type TStatus = { status: string; total: number };

type TProps = {
    contasPagarMes:      number;
    contasReceberAberto: number;
    ticketMedio:         number;
    consultasMes:        number;
    beneficiariosAtivos: number;
    porStatus:           TStatus[];
};

const STATUS_COLOR: Record<string, string> = {
    "Concluído":    "#66CC99",
    "Agendado":     "#3b82f6",
    "Cancelado":    "#ef4444",
    "Em andamento": "#f59e0b",
    "Indefinido":   "#94a3b8",
};

const color = (s: string) => STATUS_COLOR[s] ?? "#94a3b8";

export const FinancialCards = ({
    contasPagarMes,
    contasReceberAberto,
    ticketMedio,
    consultasMes,
    beneficiariosAtivos,
    porStatus,
}: TProps) => {

    const totalStatus = porStatus.reduce((a, b) => a + b.total, 0) || 1;

    // Donut SVG simples
    const SIZE   = 80;
    const STROKE = 10;
    const R      = (SIZE - STROKE) / 2;
    const CIRC   = 2 * Math.PI * R;

    let offset = 0;
    const arcs = porStatus.map(s => {
        const dash  = (s.total / totalStatus) * CIRC;
        const gap   = CIRC - dash;
        const arc   = { status: s.status, total: s.total, dash, gap, offset };
        offset += dash;
        return arc;
    });

    const kpis = [
        // {
        //     label:  "Contas a Pagar (Mês)",
        //     value:  `R$ ${convertNumberMoney(contasPagarMes)}`,
        //     icon:   <LuTrendingDown size={18} />,
        //     color:  "#ef4444",
        //     bg:     "rgba(239,68,68,.08)",
        // },
        // {
        //     label:  "A Receber em Aberto",
        //     value:  `R$ ${convertNumberMoney(contasReceberAberto)}`,
        //     icon:   <FaMoneyBillWave size={18} />,
        //     color:  "#f59e0b",
        //     bg:     "rgba(245,158,11,.08)",
        // },
        // {
        //     label:  "Ticket Médio",
        //     value:  `R$ ${convertNumberMoney(ticketMedio)}`,
        //     icon:   <LuTarget size={18} />,
        //     color:  "var(--accent-color)",
        //     bg:     "rgba(102,204,153,.10)",
        // },
        {
            label:  "Consultas no Mês",
            value:  consultasMes,
            icon:   <LuStethoscope size={18} />,
            color:  "var(--primary-color)",
            bg:     "rgba(0,51,102,.08)",
        },
        {
            label:  "Beneficiários Ativos",
            value:  beneficiariosAtivos,
            icon:   <LuUsers size={18} />,
            color:  "#8b5cf6",
            bg:     "rgba(139,92,246,.08)",
        },
    ];

    return (
        <div className="grid grid-cols-12 gap-4">

            <div className="col-span-6 grid grid-cols-12 gap-4">
                {kpis.map((k, i) => (
                    <div
                        key={i}
                        className="col-span-4 relative rounded-2xl border bg-[var(--surface-card)] p-5 shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-default"
                        style={{ borderColor: "var(--surface-border)" }}
                    >
                        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ background: k.color }} />
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110"
                            style={{ background: k.bg, color: k.color }}
                        >
                            {k.icon}
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-1">{k.label}</p>
                        <p className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">{k.value}</p>
                    </div>
                ))}
            </div>

            <div
                className="col-span-6 relative rounded-2xl border bg-[var(--surface-card)] p-5 shadow-sm overflow-hidden"
                style={{ borderColor: "var(--surface-border)" }}
            >
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "#8b5cf6" }} />
                <p className="text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-1">Consultas por Status</p>
                <p className="text-sm font-bold text-[var(--text-primary)] mb-4">Mês atual</p>

                {/* SVG Donut */}
                <div className="flex items-center gap-5">
                    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="flex-shrink-0 -rotate-90">
                        <circle
                            cx={SIZE / 2} cy={SIZE / 2} r={R}
                            fill="none" stroke="var(--surface-border)" strokeWidth={STROKE}
                        />
                        {arcs.map((a, i) => (
                            <circle
                                key={i}
                                cx={SIZE / 2} cy={SIZE / 2} r={R}
                                fill="none"
                                stroke={color(a.status)}
                                strokeWidth={STROKE}
                                strokeDasharray={`${a.dash} ${a.gap}`}
                                strokeDashoffset={-a.offset}
                                strokeLinecap="butt"
                            />
                        ))}

                        <text
                            x={SIZE / 2} y={SIZE / 2}
                            dominantBaseline="middle" textAnchor="middle"
                            className="rotate-90"
                            style={{ fontSize: 14, fontWeight: 800, fill: "var(--text-primary)", transform: `rotate(90deg) translate(0px, -${SIZE}px)` }}
                        >
                            {totalStatus === 1 && porStatus.length === 0 ? 0 : totalStatus}
                        </text>
                    </svg>

                    <ul className="flex flex-col gap-2 flex-1 min-w-0">
                        {porStatus.length === 0 && (
                            <li className="text-xs text-[var(--text-muted)]">Sem dados</li>
                        )}
                        {porStatus.map((s, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color(s.status) }} />
                                <span className="text-xs text-[var(--text-muted)] truncate flex-1">{s.status}</span>
                                <span className="text-xs font-bold text-[var(--text-primary)]">{s.total}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
