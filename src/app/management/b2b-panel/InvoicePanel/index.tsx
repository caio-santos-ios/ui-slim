"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/service/api.service";
import { configApi } from "@/service/config.service";
import { convertNumberMoney } from "@/utils/convert.util";
import {
  MdLockOutline,
  MdLockOpen,
  MdRefresh,
  MdCalendarMonth,
} from "react-icons/md";
import { FiUsers, FiDollarSign, FiClock } from "react-icons/fi";

// ─── Types ────────────────────────────────────────────────────────────────────

type TInvoiceItem = {
  recipientId: string;
  recipientName: string;
  recipientCpf: string;
  planName: string;
  planValue: number;
  createdAt: string;
};

type TInvoice = {
  id?: string;
  referenceMonth: number;
  referenceYear: number;
  status: "Aberta" | "Fechada" | "Paga" | "Cancelada";
  totalAmount: number;
  beneficiaryCount: number;
  closingDate: string;
  dueDate?: string;
  items: TInvoiceItem[];
  cycleNumber: number;
};

type TProps = {
  contractorId?: string;
  isAdmin?: boolean;
  onSyncComplete?: (invoiceCount: number) => void;
};

const MONTHS_FULL = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function isTodayLastDayOfMonth(): boolean {
  const now = new Date();
  return (
    now.getDate() === lastDayOfMonth(now.getFullYear(), now.getMonth() + 1)
  );
}

export function InvoicePanel({ contractorId, onSyncComplete }: TProps) {
  const [invoices, setInvoices] = useState<TInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [contractorName, setContractorName] = useState<string>("");

  const isSyncing = useRef(false);

  const buildInvoices = useCallback(async () => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    setLoading(true);

    try {
      const adminStr = localStorage.getItem("admin");
      const isAdmin = adminStr === "true";
      const cId =
        contractorId ||
        (isAdmin ? "" : localStorage.getItem("contractorId") || "");
      const cFilter = cId ? `&contractorId=${cId}` : "";

      const [recResp, plansResp, invResp] = await Promise.all([
        api.get(
          `/customer-recipients/manager-panel?deleted=false${cFilter}&orderBy=createdAt&sort=asc&pageSize=99999&pageNumber=1`,
          configApi(),
        ),
        api.get(
          `/plans?deleted=false&orderBy=name&sort=asc&pageSize=999&pageNumber=1`,
          configApi(),
        ),
        api.get(
          `/b2b-invoices?deleted=false${cFilter}&orderBy=referenceYear&sort=asc&pageSize=99999&pageNumber=1`,
          configApi(),
        ),
      ]);

      const recipients: any[] = recResp.data?.result?.data ?? [];
      const allPlans: any[] = plansResp.data?.result?.data ?? [];
      const savedInvoices: any[] = invResp.data?.result?.data ?? [];

      const planPriceMap: Record<string, number> = {};
      const planNameMap: Record<string, string> = {};
      allPlans.forEach((p: any) => {
        planPriceMap[p.id] = Number(p.price ?? 0);
        planNameMap[p.id] = String(p.name ?? "—");
      });

      let vigStart: Date | null = null;
      if (cId) {
        try {
          const cResp = await api.get(`/customers/${cId}`, configApi());
          const c = cResp.data?.result;
          if (c) {
            setContractorName(c.corporateName || c.name || "");
            const raw = c.effectiveDate || c.createdAt;
            if (raw) vigStart = new Date(raw);
          }
        } catch {
          /* silencioso */
        }
      } else {
        setContractorName("");
      }

      const now = new Date();
      if (!vigStart && recipients.length > 0) {
        const sorted = [...recipients]
          .filter((r) => r.createdAt)
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
        if (sorted.length > 0) vigStart = new Date(sorted[0].createdAt);
      }

      const startDate = vigStart ?? now;
      const startMonth = startDate.getMonth() + 1;
      const startYear = startDate.getFullYear();
      const months: { month: number; year: number; cycleNumber: number }[] = [];
      let cy = startYear,
        cm = startMonth,
        cycle = 1;

      while (
        cy < now.getFullYear() ||
        (cy === now.getFullYear() && cm <= now.getMonth() + 1)
      ) {
        months.push({ month: cm, year: cy, cycleNumber: cycle });
        cycle++;
        cm++;
        if (cm > 12) {
          cm = 1;
          cy++;
        }
      }

      if (months.length === 0) {
        months.push({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          cycleNumber: 1,
        });
      }

      const savedKeys = new Set(
        savedInvoices.map(
          (s: any) =>
            `${s.referenceYear}-${String(s.referenceMonth).padStart(2, "0")}`,
        ),
      );

      const built: TInvoice[] = months.map(({ month, year, cycleNumber }) => {
        const isCurrentMonth =
          month === now.getMonth() + 1 && year === now.getFullYear();

        const monthRecipients = recipients.filter((r: any) => {
  const dateRef = r.effectiveDate;
  if (!dateRef) return false;
  const d = new Date(dateRef);
  const cadastradoAntesOuNesteMes =
    d.getFullYear() < year ||
    (d.getFullYear() === year && d.getMonth() + 1 <= month);
  return cadastradoAntesOuNesteMes && r.active;
});

        const items: TInvoiceItem[] = monthRecipients.map((r: any) => ({
          recipientId: String(r.id ?? ""),
          recipientName: String(r.name ?? "—"),
          recipientCpf: String(r.cpf ?? "—"),
          planName: r.planId
            ? (planNameMap[r.planId] ?? r.planName ?? "—")
            : (r.planName ?? "—"),
          planValue: r.planId ? (planPriceMap[r.planId] ?? 0) : 0,
          createdAt: String(r.createdAt ?? ""),
        }));

        const dynamicTotal = items.reduce((acc, it) => acc + it.planValue, 0);

        const saved = savedInvoices.find(
          (s: any) =>
            Number(s.referenceMonth) === month &&
            Number(s.referenceYear) === year,
        );

        let status: TInvoice["status"] = isCurrentMonth ? "Aberta" : "Fechada";
        if (!isCurrentMonth && saved?.status && saved.status !== "Aberta") {
          status = saved.status as TInvoice["status"];
        }

        const lastDay = lastDayOfMonth(year, month);
        const closingDate = `${String(lastDay).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;

        return {
          id: saved?.id,
          referenceMonth: month,
          referenceYear: year,
          status,
          totalAmount: dynamicTotal,
          beneficiaryCount: items.length,
          closingDate,
          dueDate: saved?.dueDate,
          items,
          cycleNumber,
        };
      });

      setInvoices([...built].reverse());

      // ── 7. Sincroniza com backend ─────────────────────────────────────────
      await syncWithBackend(built, cId, savedKeys, now);
    } catch (err) {
      console.error("[InvoicePanel] Erro ao construir faturas:", err);
    } finally {
      setLoading(false);
      isSyncing.current = false;
    }
  }, [contractorId]);

  const syncWithBackend = async (
    built: TInvoice[],
    cId: string,
    savedKeys: Set<string>,
    now: Date
  ): Promise<void> => {
    if (!cId) return;
    setSyncing(true);
    try {
      for (const inv of built) {
        const isCurrentMonth =
          inv.referenceMonth === now.getMonth() + 1 &&
          inv.referenceYear === now.getFullYear();

        const invKey = `${inv.referenceYear}-${String(inv.referenceMonth).padStart(2, "0")}`;

        if (inv.id) {
          if (isCurrentMonth) {
            await api
              .put(
                "/b2b-invoices",
                {
                  id: inv.id,
                  status: "Aberta",
                  totalAmount: inv.totalAmount,
                  beneficiaryCount: inv.beneficiaryCount,
                },
                configApi(),
              )
              .catch(() => {});
          }

          if (!isCurrentMonth && inv.status === "Aberta") {
            await api
              .put(
                "/b2b-invoices",
                { id: inv.id, status: "Fechada" },
                configApi(),
              )
              .catch(() => {});
          }
        } else {
          if (!savedKeys.has(invKey)) {
            const payload: Record<string, unknown> = {
              referenceMonth: inv.referenceMonth,
              referenceYear: inv.referenceYear,
              status: isCurrentMonth ? "Aberta" : "Fechada",
              totalAmount: inv.totalAmount,
              beneficiaryCount: inv.beneficiaryCount,
              cycleStart: `${inv.referenceYear}-${String(inv.referenceMonth).padStart(2, "0")}-01`,
              cycleEnd: `${inv.referenceYear}-${String(inv.referenceMonth).padStart(2, "0")}-${lastDayOfMonth(inv.referenceYear, inv.referenceMonth)}`,
            };
            if (cId) payload.customerId = cId;
            await api
              .post("/b2b-invoices", payload, configApi())
              .catch(() => {});
            savedKeys.add(invKey);
          }
        }
      }

      if (isTodayLastDayOfMonth()) {
        const nextMonth = now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2;
        const nextYear =
          now.getMonth() + 2 > 12 ? now.getFullYear() + 1 : now.getFullYear();
        const nextKey = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;

        if (!savedKeys.has(nextKey)) {
          const payload: Record<string, unknown> = {
            referenceMonth: nextMonth,
            referenceYear: nextYear,
            status: "Aberta",
            totalAmount: 0,
            beneficiaryCount: 0,
            cycleStart: `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`,
            cycleEnd: `${nextYear}-${String(nextMonth).padStart(2, "0")}-${lastDayOfMonth(nextYear, nextMonth)}`,
          };
          if (cId) payload.customerId = cId;
          await api.post("/b2b-invoices", payload, configApi()).catch(() => {});
        }
      }
    } finally {
      setSyncing(false);
       onSyncComplete?.(built.length);
    }
  };

  useEffect(() => {
    buildInvoices();
  }, [buildInvoices]);

  const openInvoice = invoices.find((i) => i.status === "Aberta");
  const closedCount = invoices.filter((i) => i.status === "Fechada").length;
  const totalAllTime = invoices.reduce((acc, i) => acc + i.totalAmount, 0);

  const toggleExpand = (key: string): void =>
    setExpanded((prev) => (prev === key ? null : key));

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-sm font-bold"
            style={{ color: "var(--primary-color)" }}
          >
            Painel de Faturas Mensais
          </h2>
          {contractorName && (
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {contractorName}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            isSyncing.current = false;
            buildInvoices();
          }}
          disabled={loading || syncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: "var(--surface-bg)",
            border: "1px solid var(--surface-border)",
            color: "var(--text-muted)",
          }}
        >
          <MdRefresh
            size={14}
            className={loading || syncing ? "animate-spin" : ""}
          />
          {syncing ? "Sincronizando..." : "Atualizar"}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className="rounded-xl p-4 flex flex-col gap-1"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--surface-border)",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="p-1.5 rounded-lg"
              style={{ background: "rgba(34,197,94,.12)" }}
            >
              <MdLockOpen size={14} className="text-green-600" />
            </div>
            <span
              className="text-xs font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              Fatura Aberta
            </span>
          </div>
          <p
            className="text-lg font-black mt-1"
            style={{ color: "var(--primary-color)" }}
          >
            {openInvoice ? convertNumberMoney(openInvoice.totalAmount) : "—"}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {openInvoice
              ? `${openInvoice.beneficiaryCount} beneficiário(s)`
              : "Sem fatura aberta"}
          </p>
        </div>

        <div
          className="rounded-xl p-4 flex flex-col gap-1"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--surface-border)",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="p-1.5 rounded-lg"
              style={{ background: "rgba(99,102,241,.12)" }}
            >
              <MdLockOutline size={14} className="text-indigo-500" />
            </div>
            <span
              className="text-xs font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              Faturas Fechadas
            </span>
          </div>
          <p
            className="text-lg font-black mt-1"
            style={{ color: "var(--primary-color)" }}
          >
            {closedCount}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            meses encerrados
          </p>
        </div>

        <div
          className="rounded-xl p-4 flex flex-col gap-1"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--surface-border)",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="p-1.5 rounded-lg"
              style={{ background: "rgba(245,158,11,.12)" }}
            >
              <FiDollarSign size={14} className="text-amber-500" />
            </div>
            <span
              className="text-xs font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              Total Acumulado
            </span>
          </div>
          <p
            className="text-lg font-black mt-1"
            style={{ color: "var(--primary-color)" }}
          >
            {convertNumberMoney(totalAllTime)}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            desde o início da vigência
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-2">
            <MdRefresh
              size={24}
              className="animate-spin"
              style={{ color: "var(--primary-color)" }}
            />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Calculando faturas...
            </span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && invoices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <MdCalendarMonth size={32} style={{ color: "var(--text-muted)" }} />
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-muted)" }}
          >
            Nenhuma fatura encontrada
          </p>
          <p
            className="text-xs text-center"
            style={{ color: "var(--text-muted)" }}
          >
            {contractorId
              ? "Verifique a vigência do contratante e os beneficiários cadastrados."
              : "Selecione um contratante no filtro acima para visualizar as faturas."}
          </p>
        </div>
      )}

      {/* Lista de faturas */}
      {!loading &&
        invoices.map((inv) => {
          const key = `${inv.referenceMonth}-${inv.referenceYear}`;
          const isOpen = inv.status === "Aberta";
          const isExpanded = expanded === key;
          const now = new Date();
          const isCurrent =
            inv.referenceMonth === now.getMonth() + 1 &&
            inv.referenceYear === now.getFullYear();

          return (
            <div
              key={key}
              className="rounded-xl overflow-hidden transition-all duration-200"
              style={{
                border: `1.5px solid ${isOpen ? "rgba(34,197,94,.4)" : "var(--surface-border)"}`,
                background: "var(--surface-card)",
                boxShadow: isOpen ? "0 0 0 3px rgba(34,197,94,.06)" : "none",
              }}
            >
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                onClick={() => toggleExpand(key)}
              >
                <div className="flex-shrink-0">
                  {isOpen ? (
                    <MdLockOpen size={18} className="text-green-500" />
                  ) : (
                    <MdLockOutline
                      size={18}
                      style={{ color: "var(--text-muted)" }}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-sm font-bold"
                      style={{ color: "var(--primary-color)" }}
                    >
                      {MONTHS_FULL[inv.referenceMonth - 1]} {inv.referenceYear}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                      style={{
                        background: "var(--surface-bg)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--surface-border)",
                      }}
                    >
                      Fatura #{inv.cycleNumber}
                    </span>
                    {isCurrent && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                        style={{
                          background: "rgba(34,197,94,.15)",
                          color: "#16a34a",
                          border: "1px solid rgba(34,197,94,.3)",
                        }}
                      >
                        Mês atual
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span
                      className="text-xs flex items-center gap-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <FiUsers size={11} /> {inv.beneficiaryCount}{" "}
                      beneficiário(s)
                    </span>
                    <span
                      className="text-xs flex items-center gap-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <FiClock size={11} /> Corte: {inv.closingDate}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span
                    className="text-base font-black"
                    style={{
                      color: isOpen ? "#16a34a" : "var(--primary-color)",
                    }}
                  >
                    {convertNumberMoney(inv.totalAmount)}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                      inv.status === "Aberta"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : inv.status === "Fechada"
                          ? "bg-gray-100 text-gray-600 border-gray-200"
                          : inv.status === "Paga"
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "bg-red-100 text-red-700 border-red-200"
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>

                <span
                  className="text-sm flex-shrink-0 transition-transform duration-200"
                  style={{
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    color: "var(--text-muted)",
                  }}
                >
                  ▼
                </span>
              </div>

              {/* Detalhes expandidos */}
              {isExpanded && (
                <div style={{ borderTop: "1px solid var(--surface-border)" }}>
                  {inv.items.length === 0 ? (
                    <div
                      className="px-4 py-6 text-center text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Nenhum beneficiário cadastrado neste mês.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ background: "var(--surface-bg)" }}>
                            <th
                              className="px-4 py-2 text-left font-semibold"
                              style={{ color: "var(--text-muted)" }}
                            >
                              Beneficiário
                            </th>
                            <th
                              className="px-4 py-2 text-left font-semibold"
                              style={{ color: "var(--text-muted)" }}
                            >
                              CPF
                            </th>
                            <th
                              className="px-4 py-2 text-left font-semibold"
                              style={{ color: "var(--text-muted)" }}
                            >
                              Plano
                            </th>
                            <th
                              className="px-4 py-2 text-right font-semibold"
                              style={{ color: "var(--text-muted)" }}
                            >
                              Valor
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {inv.items.map((item, idx) => (
                            <tr
                              key={idx}
                              className="border-t"
                              style={{ borderColor: "var(--surface-border)" }}
                            >
                              <td
                                className="px-4 py-2 font-medium"
                                style={{ color: "var(--text-color)" }}
                              >
                                {item.recipientName}
                              </td>
                              <td
                                className="px-4 py-2"
                                style={{ color: "var(--text-muted)" }}
                              >
                                {item.recipientCpf}
                              </td>
                              <td
                                className="px-4 py-2"
                                style={{ color: "var(--text-muted)" }}
                              >
                                {item.planName}
                              </td>
                              <td
                                className="px-4 py-2 text-right font-bold"
                                style={{ color: "var(--primary-color)" }}
                              >
                                {item.planValue > 0
                                  ? convertNumberMoney(item.planValue)
                                  : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr
                            style={{
                              borderTop: "2px solid var(--surface-border)",
                              background: "var(--surface-bg)",
                            }}
                          >
                            <td
                              colSpan={3}
                              className="px-4 py-2 font-bold text-xs"
                              style={{ color: "var(--text-muted)" }}
                            >
                              Total — {inv.beneficiaryCount} beneficiário(s)
                            </td>
                            <td
                              className="px-4 py-2 text-right font-black text-sm"
                              style={{
                                color: isOpen
                                  ? "#16a34a"
                                  : "var(--primary-color)",
                              }}
                            >
                              {convertNumberMoney(inv.totalAmount)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}

                  <div
                    className="px-4 py-2"
                    style={{
                      borderTop: "1px solid var(--surface-border)",
                      background: "var(--surface-bg)",
                    }}
                  >
                    {isOpen ? (
                      <span className="text-xs" style={{ color: "#16a34a" }}>
                        ✓ Fatura em aberto — recebe novos beneficiários
                        automaticamente até {inv.closingDate}
                      </span>
                    ) : (
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        🔒 Fatura encerrada em {inv.closingDate} — não aceita
                        mais alterações
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
