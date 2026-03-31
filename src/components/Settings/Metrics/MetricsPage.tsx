"use client";

import { api } from "@/service/api.service";
import { configApi } from "@/service/config.service";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { SlimContainer } from "@/components/Global/SlimContainer";
import { TMetricsSummary, TTopFeature, TTopUser, TTimelineEntry } from "@/types/settings/metrics.type";
import { MdBarChart } from "react-icons/md";
import { FiActivity, FiCalendar, FiUsers, FiZap } from "react-icons/fi";

// ─── helpers ──────────────────────────────────────────────────────────────────

function pct(value: number, max: number) {
  if (max === 0) return 0;
  return Math.round((value / max) * 100);
}

const FEATURE_LABELS: Record<string, string> = {
  users: "Usuários",
  customers: "Clientes",
  professionals: "Profissionais",
  plans: "Programas",
  procedures: "Procedimentos",
  billings: "Faturamento",
  sellers: "Vendedores",
  commissions: "Comissões",
  "accredited-networks": "Rede Credenciada",
  "generic-tables": "Tabelas Genéricas",
  suppliers: "Fornecedores",
  "accounts-receivable": "Contas a Receber",
  "accounts-payable": "Contas a Pagar",
  "in-person": "Presencial",
  forwardings: "Encaminhamentos",
  appointments: "Agendamentos",
  historics: "Histórico",
  "permission-profiles": "Perfis de Permissão",
};

const ACTION_COLORS: Record<string, string> = {
  create: "var(--accent-color)",
  update: "#F59E0B",
  delete: "#EF4444",
  read:   "var(--primary-color)",
};

function featureLabel(raw: string) {
  return FEATURE_LABELS[raw] ?? raw;
}

function actionLabel(raw: string) {
  const map: Record<string, string> = {
    create: "Criação", update: "Edição", delete: "Exclusão", read: "Leitura",
  };
  return map[raw?.toLowerCase()] ?? raw;
}

// ─── subcomponents ────────────────────────────────────────────────────────────

function SummaryCard({
  title, value, sub, icon, color, bg,
}: {
  title: string; value: string | number; sub?: string;
  icon: React.ReactNode; color: string; bg: string;
}) {
  return (
    <div
      className="relative flex flex-col gap-2 rounded-2xl border bg-[var(--surface-card)] shadow-sm p-5 overflow-hidden"
      style={{ borderColor: "var(--surface-border)" }}
    >
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: color }} />
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{title}</p>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: bg, color }}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-extrabold text-[var(--text-primary)]">{value}</p>
      {sub && <p className="text-xs text-[var(--text-muted)]">{sub}</p>}
    </div>
  );
}

function BarRow({
  label, sublabel, value, max, color,
}: {
  label: string; sublabel?: string; value: number; max: number; color: string;
}) {
  const w = pct(value, max);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
          {sublabel && (
            <span
              className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: ACTION_COLORS[sublabel?.toLowerCase()] + "22", color: ACTION_COLORS[sublabel?.toLowerCase()] ?? "var(--text-muted)" }}
            >
              {sublabel}
            </span>
          )}
        </div>
        <span className="text-xs font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--surface-border)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${w}%`, background: color }}
        />
      </div>
    </div>
  );
}

function TimelineChart({ data }: { data: TTimelineEntry[] }) {
  const max = Math.max(...data.map(d => d.total), 1);

  const formatDate = (iso: string) => {
    const [, m, d] = iso.split("-");
    return `${d}/${m}`;
  };

  // show every nth label to avoid clutter
  const step = data.length > 20 ? 5 : data.length > 10 ? 3 : 1;

  return (
    <div className="flex flex-col gap-3">
      {/* bars */}
      <div className="flex items-end gap-[3px] h-36">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className="w-full rounded-t-sm transition-all duration-300"
              style={{
                height: `${pct(d.total, max)}%`,
                minHeight: d.total > 0 ? "4px" : "0",
                background: "var(--primary-color)",
                opacity: 0.75,
              }}
            />
            {/* tooltip on hover */}
            <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
              <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-lg px-2 py-1 shadow-lg text-xs whitespace-nowrap">
                <span className="font-bold text-[var(--text-primary)]">{d.total}</span>
                <span className="text-[var(--text-muted)] ml-1">ações</span>
                <div className="text-[var(--text-muted)] text-[10px]">{formatDate(d.date)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* x axis labels */}
      <div className="flex items-end gap-[3px]">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            {i % step === 0 && (
              <span className="text-[9px] text-[var(--text-muted)]">{formatDate(d.date)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function MetricsPage() {
  const [, setLoading] = useAtom(loadingAtom);

  const [summary,  setSummary]  = useState<TMetricsSummary | null>(null);
  const [users,    setUsers]    = useState<TTopUser[]>([]);
  const [features, setFeatures] = useState<TTopFeature[]>([]);
  const [timeline, setTimeline] = useState<TTimelineEntry[]>([]);
  const [period,   setPeriod]   = useState<7 | 14 | 30>(30);

  const loadAll = async (days: 7 | 14 | 30 = 30) => {
    try {
      setLoading(true);
      const [s, u, f, t] = await Promise.all([
        api.get("/metrics/summary",      configApi()),
        api.get("/metrics/top-users?limit=10",    configApi()),
        api.get("/metrics/top-features?limit=10", configApi()),
        api.get(`/metrics/timeline?days=${days}`, configApi()),
      ]);
      setSummary(s.data.result.data);
      setUsers(u.data.result.data   ?? []);
      setFeatures(f.data.result.data ?? []);
      setTimeline(t.data.result.data ?? []);
    } catch {
      // silent – tokens de expiração são tratados no interceptor global
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(period); }, [period]);

  const maxUser    = Math.max(...users.map(u => u.total), 1);
  const maxFeature = Math.max(...features.map(f => f.total), 1);

  return (
    <SlimContainer
      menu="Configurações"
      breadcrump="Métricas de Uso"
      breadcrumpIcon="MdBarChart"
      buttons={
        <div className="flex gap-2">
          {([7, 14, 30] as const).map(d => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              className={`slim-btn text-xs px-3 py-1.5 ${period === d ? "slim-btn-primary" : "slim-btn-secondary"}`}
            >
              {d}d
            </button>
          ))}
        </div>
      }
    >
      <div className="flex flex-col gap-6 pb-6">

        {/* ── Cards de resumo ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SummaryCard
            title="Ações Hoje"
            value={summary?.actionsToday ?? "—"}
            icon={<FiZap size={18} />}
            color="var(--primary-color)"
            bg="rgba(0,51,102,.08)"
          />
          <SummaryCard
            title="Ações (7 dias)"
            value={summary?.actionsWeek ?? "—"}
            icon={<FiCalendar size={18} />}
            color="#F59E0B"
            bg="rgba(245,158,11,.08)"
          />
          <SummaryCard
            title="Ações (30 dias)"
            value={summary?.actionsMonth ?? "—"}
            icon={<FiActivity size={18} />}
            color="var(--accent-color)"
            bg="rgba(102,204,153,.10)"
          />
          <SummaryCard
            title="Usuários Únicos"
            value={summary?.uniqueUsersMonth ?? "—"}
            sub="Últimos 30 dias"
            icon={<FiUsers size={18} />}
            color="#8B5CF6"
            bg="rgba(139,92,246,.08)"
          />
        </div>

        {/* ── Timeline ────────────────────────────────────────────────────── */}
        <div
          className="relative rounded-2xl border bg-[var(--surface-card)] shadow-sm p-5 overflow-hidden"
          style={{ borderColor: "var(--surface-border)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "var(--primary-color)" }} />
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">
                Atividade
              </p>
              <p className="text-base font-extrabold text-[var(--text-primary)]">
                Ações por Dia — últimos {period} dias
              </p>
            </div>
            <MdBarChart size={22} className="text-[var(--text-muted)]" />
          </div>
          {timeline.length > 0
            ? <TimelineChart data={timeline} />
            : <p className="text-sm text-[var(--text-muted)] text-center py-10">Sem dados neste período.</p>
          }
        </div>

        {/* ── Usuários + Funcionalidades ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Top Usuários */}
          <div
            className="relative rounded-2xl border bg-[var(--surface-card)] shadow-sm p-5 overflow-hidden"
            style={{ borderColor: "var(--surface-border)" }}
          >
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "#8B5CF6" }} />
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">
                  Ranking
                </p>
                <p className="text-base font-extrabold text-[var(--text-primary)]">
                  Usuários Mais Ativos
                </p>
              </div>
              <FiUsers size={18} className="text-[var(--text-muted)]" />
            </div>

            {users.length === 0
              ? <p className="text-sm text-[var(--text-muted)] text-center py-6">Sem dados.</p>
              : (
                <div className="flex flex-col gap-4">
                  {users.map((u, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ background: i === 0 ? "#F59E0B" : i === 1 ? "#9CA3AF" : i === 2 ? "#CD7F32" : "var(--primary-color)" }}
                          >
                            {i + 1}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">{u.userName}</p>
                            {u.userEmail && (
                              <p className="text-[10px] text-[var(--text-muted)]">{u.userEmail}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-bold" style={{ color: "#8B5CF6" }}>{u.total}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--surface-border)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct(u.total, maxUser)}%`, background: "#8B5CF6" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>

          {/* Top Funcionalidades */}
          <div
            className="relative rounded-2xl border bg-[var(--surface-card)] shadow-sm p-5 overflow-hidden"
            style={{ borderColor: "var(--surface-border)" }}
          >
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "var(--accent-color)" }} />
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">
                  Funcionalidades
                </p>
                <p className="text-base font-extrabold text-[var(--text-primary)]">
                  Mais Utilizadas
                </p>
              </div>
              <FiActivity size={18} className="text-[var(--text-muted)]" />
            </div>

            {features.length === 0
              ? <p className="text-sm text-[var(--text-muted)] text-center py-6">Sem dados.</p>
              : (
                <div className="flex flex-col gap-4">
                  {features.map((f, i) => (
                    <BarRow
                      key={i}
                      label={featureLabel(f.feature)}
                      sublabel={actionLabel(f.action)}
                      value={f.total}
                      max={maxFeature}
                      color={ACTION_COLORS[f.action?.toLowerCase()] ?? "var(--accent-color)"}
                    />
                  ))}
                </div>
              )
            }
          </div>
        </div>

        {/* ── Tabela detalhada: Usuários ───────────────────────────────────── */}
        <div
          className="relative rounded-2xl border bg-[var(--surface-card)] shadow-sm overflow-hidden"
          style={{ borderColor: "var(--surface-border)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "var(--primary-color)" }} />
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <p className="text-base font-extrabold text-[var(--text-primary)]">
              Detalhamento — Usuários Ativos (últimos 30 dias)
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="slim-table w-full">
              <thead>
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">#</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Usuário</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">E-mail</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Ações</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">% do Total</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">
                      Sem dados disponíveis.
                    </td>
                  </tr>
                )}
                {users.map((u, i) => {
                  const total = users.reduce((a, b) => a + b.total, 0);
                  const share = total > 0 ? ((u.total / total) * 100).toFixed(1) : "0";
                  return (
                    <tr className="slim-tr" key={i}>
                      <td className="px-5 py-3 text-sm text-[var(--text-muted)]">{i + 1}</td>
                      <td className="px-5 py-3 text-sm font-medium text-[var(--text-primary)]">{u.userName}</td>
                      <td className="px-5 py-3 text-sm text-[var(--text-muted)]">{u.userEmail || "—"}</td>
                      <td className="px-5 py-3 text-sm font-bold text-right" style={{ color: "var(--primary-color)" }}>{u.total}</td>
                      <td className="px-5 py-3 text-sm text-right">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            background: "rgba(0,51,102,.08)",
                            color: "var(--primary-color)",
                          }}
                        >
                          {share}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Tabela detalhada: Funcionalidades ───────────────────────────── */}
        <div
          className="relative rounded-2xl border bg-[var(--surface-card)] shadow-sm overflow-hidden"
          style={{ borderColor: "var(--surface-border)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "var(--accent-color)" }} />
          <div className="px-5 pt-5 pb-3">
            <p className="text-base font-extrabold text-[var(--text-primary)]">
              Detalhamento — Funcionalidades Utilizadas (últimos 30 dias)
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="slim-table w-full">
              <thead>
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">#</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Funcionalidade</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Ação</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Ocorrências</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">% do Total</th>
                </tr>
              </thead>
              <tbody>
                {features.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">
                      Sem dados disponíveis.
                    </td>
                  </tr>
                )}
                {features.map((f, i) => {
                  const total = features.reduce((a, b) => a + b.total, 0);
                  const share = total > 0 ? ((f.total / total) * 100).toFixed(1) : "0";
                  const color = ACTION_COLORS[f.action?.toLowerCase()] ?? "var(--accent-color)";
                  return (
                    <tr className="slim-tr" key={i}>
                      <td className="px-5 py-3 text-sm text-[var(--text-muted)]">{i + 1}</td>
                      <td className="px-5 py-3 text-sm font-medium text-[var(--text-primary)]">{featureLabel(f.feature)}</td>
                      <td className="px-5 py-3 text-sm">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: color + "22", color }}
                        >
                          {actionLabel(f.action)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm font-bold text-right" style={{ color }}>{f.total}</td>
                      <td className="px-5 py-3 text-sm text-right">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: "rgba(102,204,153,.10)", color: "var(--accent-color)" }}
                        >
                          {share}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </SlimContainer>
  );
}
