"use client";

import { convertNumberMoney } from "@/utils/convert.util";

type TMes = {
    mes: string;
    receita: number;
    despesa: number;
};

type TProps = {
    data: TMes[];
};

export const RevenueChart = ({ data }: TProps) => {
    const maxVal = Math.max(...data.flatMap(d => [d.receita, d.despesa]), 1);
    const pct    = (v: number) => Math.round((v / maxVal) * 100);

    const totalReceita = data.reduce((a, b) => a + b.receita, 0);
    const totalDespesa = data.reduce((a, b) => a + b.despesa, 0);
    const lucro        = totalReceita - totalDespesa;

    return (
        <div
            className="relative rounded-2xl border bg-[var(--surface-card)] shadow-sm overflow-hidden"
            style={{ borderColor: "var(--surface-border)" }}
        >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "var(--primary-color)" }} />

            {/* Header */}
            <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-0.5">
                            Receita vs Despesa
                        </p>
                        <p className="text-lg font-extrabold text-[var(--text-primary)]">Últimos 6 meses</p>
                    </div>

                    {/* KPI badges */}
                    <div className="flex gap-3">
                        <div className="text-center">
                            <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">Receita</p>
                            <p className="text-sm font-bold" style={{ color: "var(--accent-color)" }}>
                                R$ {convertNumberMoney(totalReceita)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">Despesa</p>
                            <p className="text-sm font-bold text-red-500">R$ {convertNumberMoney(totalDespesa)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">Resultado</p>
                            <p
                                className="text-sm font-bold"
                                style={{ color: lucro >= 0 ? "var(--accent-color)" : "#ef4444" }}
                            >
                                R$ {convertNumberMoney(Math.abs(lucro))}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Legenda */}
                <div className="flex gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                        <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "var(--accent-color)" }} />
                        Receita
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                        <span className="w-3 h-3 rounded-sm inline-block bg-red-400" />
                        Despesa
                    </span>
                </div>
            </div>

            {/* Gráfico de barras */}
            <div className="px-6 pb-6">
                <div className="flex items-end justify-between gap-2 h-44">
                    {data.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            {/* Barras lado a lado */}
                            <div className="w-full flex items-end gap-0.5 h-36">
                                {/* Receita */}
                                <div
                                    className="flex-1 rounded-t-md transition-all duration-700"
                                    style={{
                                        height: `${pct(d.receita)}%`,
                                        minHeight: "4px",
                                        background: "var(--accent-color)",
                                        opacity: 0.85,
                                    }}
                                    title={`Receita: R$ ${convertNumberMoney(d.receita)}`}
                                />
                                {/* Despesa */}
                                <div
                                    className="flex-1 rounded-t-md transition-all duration-700"
                                    style={{
                                        height: `${pct(d.despesa)}%`,
                                        minHeight: "4px",
                                        background: "#f87171",
                                        opacity: 0.85,
                                    }}
                                    title={`Despesa: R$ ${convertNumberMoney(d.despesa)}`}
                                />
                            </div>
                            {/* Mês */}
                            <p className="text-[10px] font-semibold text-[var(--text-muted)] capitalize">{d.mes}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
