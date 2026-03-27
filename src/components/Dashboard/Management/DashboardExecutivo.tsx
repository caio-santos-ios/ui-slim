"use client";

import { useEffect, useState } from "react";
import { api } from "@/service/api.service";
import { configApi } from "@/service/config.service";
import { useAtom } from "jotai";
import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { Autorization } from "@/components/Global/Autorization";
import { Header } from "@/components/Global/Header";
import { SideMenu } from "@/components/Global/SideMenu";
import { SlimContainer } from "@/components/Global/SlimContainer";

// ─── Constantes da planilha ───────────────────────────────────────────────────
const ISO_THRESHOLD = 40;

const ISO_CLASSIFICATION = (iso: number) => {
  if (iso >= 81) return { label: "Excelente", color: "#22c55e", risk: "1 - Trivial",     perception: "Ambiente Seguro e Controlado" };
  if (iso >= 61) return { label: "Bom",       color: "#84cc16", risk: "2 - Baixo",       perception: "Risco Monitorado" };
  if (iso >= 41) return { label: "Moderado",  color: "#f59e0b", risk: "3 - Médio",       perception: "Início do Alerta de Desconformidade" };
  if (iso >= 21) return { label: "Crítico",   color: "#ef4444", risk: "4 - Alto",        perception: "Risco Iminente de Afastamento" };
  return           { label: "Severo",          color: "#7f1d1d", risk: "5 - Crítico",     perception: "Perigo de Acidente/Interdição" };
};

const GLOBAL_ACTIONS: Record<string, string> = {
  Excelente: "Manter programas de incentivo e realizar auditoria de manutenção semestral.",
  Bom:       "Reforçar treinamentos preventivos e monitorar indicadores de declínio mensal.",
  Moderado:  "Revisão de Processos: Realizar diagnóstico setorial e ajustar fluxos críticos em 30 dias.",
  Crítico:   "Intervenção Imediata: Força-tarefa para correção de riscos e revisão da liderança.",
  Severo:    "Paralisação/Reestruturação: Auditoria externa e revisão total das normas de saúde.",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const MONTHS_BR = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function calcISO(vitals: any[]): number {
  if (!vitals.length) return 0;
  // ISO = (soma ponderada inversa dos riscos / soma pesos * 3) * 100
  // Pesos: P1=1,P2=2,P3=1,P4=1,P5=1,P6=1,P7=1,P8=1,P9=1,P10=1,P11=3,P12=1
  const totalPontos = vitals.reduce((sum, v) => sum + (v.chekinISOPoint ?? 0), 0);
  const maxPontos   = vitals.length * 31; // 31 = máximo teórico (soma pesos * 3)
  if (!maxPontos) return 0;
  return Math.max(0, Math.min(100, ((maxPontos - totalPontos) / maxPontos) * 100));
}

// ─── Mini gráfico de linha (SVG puro) ─────────────────────────────────────────
function LineChart({ data, threshold }: { data: { month: string; iso: number }[]; threshold: number }) {
  const W = 600, H = 200, PAD = 40;
  const vals = data.map(d => d.iso);
  const max = 100, min = 0;
  const scaleY = (v: number) => PAD + (H - PAD * 2) * (1 - (v - min) / (max - min));
  const scaleX = (i: number) => PAD + (i / Math.max(1, data.length - 1)) * (W - PAD * 2);
  const thY = scaleY(threshold);

  const points = data.map((d, i) => `${scaleX(i)},${scaleY(d.iso)}`).join(" ");
  const fillPath = data.length > 1
    ? `M${scaleX(0)},${scaleY(data[0].iso)} ${data.map((d, i) => `L${scaleX(i)},${scaleY(d.iso)}`).join(" ")} L${scaleX(data.length - 1)},${H - PAD} L${scaleX(0)},${H - PAD} Z`
    : "";

  const belowThreshold = vals.some(v => v < threshold);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="isoGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={belowThreshold ? "#ef4444" : "#003366"} stopOpacity="0.3" />
          <stop offset="100%" stopColor={belowThreshold ? "#ef4444" : "#003366"} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Fundo vermelho se abaixo do threshold */}
      {belowThreshold && (
        <rect x={PAD} y={thY} width={W - PAD * 2} height={H - PAD - thY}
          fill="#ef4444" fillOpacity="0.08" rx="4" />
      )}

      {/* Linha de corte */}
      <line x1={PAD} y1={thY} x2={W - PAD} y2={thY}
        stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6 4" />
      <text x={W - PAD + 4} y={thY + 4} fontSize="10" fill="#ef4444">40</text>

      {/* Área preenchida */}
      {fillPath && <path d={fillPath} fill="url(#isoGrad)" />}

      {/* Linha principal */}
      {data.length > 1 && (
        <polyline points={points} fill="none"
          stroke={belowThreshold ? "#ef4444" : "#003366"} strokeWidth="2.5" strokeLinejoin="round" />
      )}

      {/* Pontos e labels */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={scaleX(i)} cy={scaleY(d.iso)} r="5"
            fill={d.iso < threshold ? "#ef4444" : "#003366"} stroke="#fff" strokeWidth="2" />
          <text x={scaleX(i)} y={scaleY(d.iso) - 10} textAnchor="middle"
            fontSize="11" fontWeight="700" fill={d.iso < threshold ? "#ef4444" : "#003366"}>
            {d.iso.toFixed(0)}
          </text>
          <text x={scaleX(i)} y={H - PAD + 16} textAnchor="middle"
            fontSize="10" fill="#6b7280">{d.month}</text>
        </g>
      ))}

      {/* Linhas de grade */}
      {[0, 25, 50, 75, 100].map(v => (
        <g key={v}>
          <line x1={PAD} y1={scaleY(v)} x2={W - PAD} y2={scaleY(v)}
            stroke="#e5e7eb" strokeWidth="1" />
          <text x={PAD - 6} y={scaleY(v) + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{v}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Econômetro ───────────────────────────────────────────────────────────────
function Econometro({ valor, breakdown, expanded, onToggle }: {
  valor: number;
  breakdown: { fap: number; produtividade: number; juridico: number };
  expanded: boolean;
  onToggle: () => void;
}) {
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const pct = Math.min(100, (valor / 100000) * 100);

  return (
    <div className="rounded-2xl p-5 cursor-pointer select-none transition-all"
      style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)" }}
      onClick={onToggle}>

      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-[var(--text-muted)] font-medium">Econômetro de Compliance</p>
          <p className="text-2xl font-black" style={{ color: "#22c55e" }}>
            {fmt(valor)}
          </p>
          <p className="text-xs text-[var(--text-muted)]">protegidos este mês</p>
        </div>
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
          style={{ background: "rgba(34,197,94,.1)", border: "2px solid #22c55e" }}>
          💰
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="h-3 rounded-full mb-1 overflow-hidden" style={{ background: "var(--surface-bg)" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg, #22c55e, #84cc16)" }} />
      </div>
      <p className="text-xs text-[var(--text-muted)] mb-3">
        {expanded ? "▲ Fechar detalhes" : "▼ Clique para ver o breakdown"}
      </p>

      {/* Breakdown */}
      {expanded && (
        <div className="grid grid-cols-3 gap-3 mt-3 pt-3" style={{ borderTop: "1px solid var(--surface-border)" }}>
          {[
            { label: "FAP/RAT",        value: breakdown.fap,          color: "#3b82f6" },
            { label: "Produtividade",  value: breakdown.produtividade,color: "#8b5cf6" },
            { label: "Risco Jurídico", value: breakdown.juridico,     color: "#f59e0b" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl p-3 text-center"
              style={{ background: "var(--surface-bg)", border: `1px solid ${item.color}30` }}>
              <p className="text-xs text-[var(--text-muted)] mb-1">{item.label}</p>
              <p className="text-sm font-bold" style={{ color: item.color }}>{fmt(item.value)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function DashboardExecutivo() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [userLogger]    = useAtom(userLoggerAtom);

  const [isoHistory, setIsoHistory]         = useState<{ month: string; iso: number }[]>([]);
  const [currentISO, setCurrentISO]         = useState(0);
  const [econExpanded, setEconExpanded]     = useState(false);
  const [econValor, setEconValor]           = useState(0);
  const [econBreakdown, setEconBreakdown]   = useState({ fap: 0, produtividade: 0, juridico: 0 });
  const [alertas, setAlertas]               = useState<string[]>([]);

  const classification = ISO_CLASSIFICATION(currentISO);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const idLocal = localStorage.getItem("contractorId") ?? "";

      // Busca vitals dos últimos 6 meses
      const now    = new Date();
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return { year: d.getFullYear(), month: d.getMonth() + 1, label: MONTHS_BR[d.getMonth()] };
      });

      const history: { month: string; iso: number }[] = [];

      for (const m of months) {
        const { data } = await api.get(
          `/vitals?deleted=false&contractorId=${idLocal}&chekinISO=true&referenceMonth=${m.month}&referenceYear=${m.year}&pageSize=999&pageNumber=1`,
          configApi()
        );
        const vitals = data.result?.data ?? [];
        history.push({ month: m.label, iso: Math.round(calcISO(vitals)) });
      }

      setIsoHistory(history);
      setCurrentISO(history[history.length - 1]?.iso ?? 0);

      // Econômetro: baseado no risco jurídico evitado (R$ 20.000 padrão planilha)
      // + eficiência estimada (66,67% = R$ 66,67 / colaborador por mês)
      const totalRecipients = await api.get(
        `/customer-recipients/manager-panel?deleted=false&active=true&pageSize=1&pageNumber=1`,
        configApi()
      );
      const nColaboradores = totalRecipients.data.result?.totalCount ?? 0;
      const juridico       = 20000;
      const fap            = nColaboradores * 120;  // estimativa FAP/RAT por colaborador
      const produtividade  = nColaboradores * 66.67;
      const total          = juridico + fap + produtividade;

      setEconValor(Math.round(total));
      setEconBreakdown({ fap: Math.round(fap), produtividade: Math.round(produtividade), juridico });

      // Alertas críticos: vitals com chekinISOPoint alto (P11 = nota 3 = 9 pontos)
      const { data: alertData } = await api.get(
        `/vitals?deleted=false&contractorId=${idLocal}&chekinISO=true&pageSize=10&pageNumber=1`,
        configApi()
      );
      const alertVitals: any[] = alertData.result?.data ?? [];
      const msgs: string[] = [];
      if (alertVitals.some((v: any) => (v.chekinISOPoint ?? 0) >= 9))
        msgs.push("P11 crítico detectado: Realizar auditoria imediata de conformidade e reciclar treinamentos de NR obrigatórios.");
      if (currentISO < ISO_THRESHOLD)
        msgs.push(`ISO abaixo do limite de segurança (${currentISO.toFixed(0)} pts): ${GLOBAL_ACTIONS[classification.label]}`);
      setAlertas(msgs);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Autorization />
      {userLogger ? (
        <>
          <Header />
          <main className="slim-bg-main">
            <SideMenu />
            <div className="slim-container-customer h-[calc(100dvh-5rem)] w-full">
              <SlimContainer menu="Dashboards" breadcrump="Visão Executiva — ISO" breadcrumpIcon="MdBarChart">

                {/* ── Banner de alerta crítico ───────────────────────────── */}
                {alertas.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl mb-3 text-sm"
                    style={{ background: "#fef2f2", border: "1px solid #fca5a5" }}>
                    <span className="text-lg">🚨</span>
                    <div>
                      <p className="font-bold text-red-700 text-xs">ALERTA CRÍTICO</p>
                      <p className="text-red-600 text-xs mt-0.5">{a}</p>
                    </div>
                  </div>
                ))}

                {/* ── Cards de métricas ──────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: "ISO Atual",         value: `${currentISO.toFixed(0)}`,       unit: "pts",   color: classification.color },
                    { label: "Classificação",      value: classification.label,              unit: "",      color: classification.color },
                    { label: "Nível de Risco",     value: classification.risk,               unit: "",      color: "#f59e0b" },
                    { label: "Percepção",          value: classification.perception,         unit: "",      color: "#6b7280", small: true },
                  ].map((c) => (
                    <div key={c.label} className="rounded-xl p-4 flex flex-col gap-1"
                      style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)" }}>
                      <span className="text-xs text-[var(--text-muted)] font-medium">{c.label}</span>
                      <span className={`font-bold ${c.small ? "text-xs" : "text-xl"}`} style={{ color: c.color }}>
                        {c.value} {c.unit}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ── Grid principal ────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

                  {/* Gráfico ISO histórico */}
                  <div className="lg:col-span-2 rounded-2xl p-5"
                    style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)" }}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-bold text-[var(--primary-color)]">Evolução ISO — Últimos 6 Meses</p>
                        <p className="text-xs text-[var(--text-muted)]">Linha de corte: 40 pts (abaixo = zona de risco)</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full font-semibold"
                        style={{ background: `${classification.color}20`, color: classification.color }}>
                        {classification.label}
                      </span>
                    </div>
                    {isoHistory.length > 0
                      ? <LineChart data={isoHistory} threshold={ISO_THRESHOLD} />
                      : <div className="flex items-center justify-center h-40 text-sm text-[var(--text-muted)]">Carregando dados...</div>
                    }
                  </div>

                  {/* Econômetro */}
                  <div className="flex flex-col gap-3">
                    <Econometro
                      valor={econValor}
                      breakdown={econBreakdown}
                      expanded={econExpanded}
                      onToggle={() => setEconExpanded(v => !v)}
                    />

                    {/* Ação global recomendada */}
                    <div className="rounded-2xl p-4"
                      style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)" }}>
                      <p className="text-xs font-bold text-[var(--primary-color)] mb-2">Diretriz Estratégica</p>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        {GLOBAL_ACTIONS[classification.label]}
                      </p>
                    </div>
                  </div>
                </div>

              </SlimContainer>
            </div>
          </main>
        </>
      ) : <></>}
    </>
  );
}
