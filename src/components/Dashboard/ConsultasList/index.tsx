"use client";

import { LuCalendar, LuClock, LuStethoscope, LuUser } from "react-icons/lu";

type TConsulta = {
    id: string;
    beneficiario: string;
    profissional: string;
    modulo: string;
    data: string;
    hora: string;
    status: string;
};

type TProps = {
    title: string;
    icon: React.ReactNode;
    consultas: TConsulta[];
    accentColor: string;
    emptyMsg: string;
};

const statusStyle = (s: string) => {
    const map: Record<string, { bg: string; color: string }> = {
        "Concluído":   { bg: "rgba(102,204,153,.12)", color: "#3a9e72" },
        "Agendado":    { bg: "rgba(59,130,246,.10)",  color: "#2563eb" },
        "Cancelado":   { bg: "rgba(239,68,68,.10)",   color: "#dc2626" },
        "Em andamento":{ bg: "rgba(245,158,11,.12)",  color: "#d97706" },
    };
    return map[s] ?? { bg: "var(--surface-border)", color: "var(--text-muted)" };
};

const initials = (name: string) => {
    const parts = name.trim().split(" ");
    return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();
};

export const ConsultasList = ({ title, icon, consultas, accentColor, emptyMsg }: TProps) => (
    <div
        className="col-span-6 relative rounded-2xl border bg-[var(--surface-card)] shadow-sm overflow-hidden"
        style={{ borderColor: "var(--surface-border)" }}
    >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: accentColor }} />

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-6 pb-4">
            <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${accentColor}18`, color: accentColor }}
            >
                {icon}
            </div>
            <p className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide">{title}</p>
            <span
                className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${accentColor}18`, color: accentColor }}
            >
                {consultas.length}
            </span>
        </div>

        {/* Lista */}
        <ul className="divide-y" style={{ borderColor: "var(--surface-border)" }}>
            {consultas.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">{emptyMsg}</li>
            )}

            {consultas.map((c) => {
                const st = statusStyle(c.status);
                return (
                    <li key={c.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--surface-bg)] transition-colors">
                        {/* Avatar */}
                        <div
                            className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: accentColor }}
                        >
                            {c.beneficiario !== "—" ? initials(c.beneficiario) : "?"}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{c.beneficiario}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                                <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                                    <LuUser size={11} /> {c.profissional}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                                    <LuStethoscope size={11} /> {c.modulo}
                                </span>
                            </div>
                        </div>

                        {/* Data/hora + status */}
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                                <LuCalendar size={11} /> {c.data}
                                <LuClock size={11} className="ml-1" /> {c.hora || "—"}
                            </div>
                            <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: st.bg, color: st.color }}
                            >
                                {c.status || "—"}
                            </span>
                        </div>
                    </li>
                );
            })}
        </ul>
    </div>
);
