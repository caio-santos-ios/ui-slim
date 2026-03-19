"use client";

import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Autorization } from "@/components/Global/Autorization";
import { Header } from "@/components/Global/Header";
import { SideMenu } from "@/components/Global/SideMenu";
import { SlimContainer } from "@/components/Global/SlimContainer";
import DataTable from "@/components/Global/Table";
import { NotData } from "@/components/Global/NotData";
import { maskDate } from "@/utils/mask.util";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/Global/Accordion/AccordionContent";
import { IoSearch } from "react-icons/io5";
import { MdFilterAlt, MdFilterAltOff } from "react-icons/md";
import { TbHeartbeat, TbShieldCheck } from "react-icons/tb";
import { BsBarChartLine } from "react-icons/bs";
import { FiCheckSquare, FiMoon } from "react-icons/fi";

// ─── Abas ─────────────────────────────────────────────────────────────────────
type TTab = "igs" | "ign" | "ies" | "iso";

// ─── Colunas por aba ──────────────────────────────────────────────────────────
const igsColumns = [
  { key: "beneficiaryName",    title: "Beneficiário" },
  { key: "chekinIGS",          title: "Check-in IGS" },
  { key: "chekinIGSPoint",     title: "Pontos IGS" },
  { key: "sleepHours",         title: "Horas de Sono" },
  { key: "sleepQuality",       title: "Qualidade do Sono" },
  { key: "sleepFragmentation", title: "Fragmentação" },
  { key: "createdAt",          title: "Data" },
];

const ignColumns = [
  { key: "beneficiaryName", title: "Beneficiário" },
  { key: "chekinIGN",       title: "Check-in IGN" },
  { key: "chekinIGNPoint",  title: "Pontos IGN" },
  { key: "waterAmount",     title: "Água (L)" },
  { key: "glycemicLoad",    title: "Carga Glicêmica" },
  { key: "lastMeal",        title: "Última Refeição" },
  { key: "createdAt",       title: "Data" },
];

const iesColumns = [
  { key: "beneficiaryName", title: "Beneficiário" },
  { key: "chekinIES",       title: "Check-in IES" },
  { key: "chekinIESPoint",  title: "Pontos IES" },
  { key: "dass1",           title: "Perspectiva" },
  { key: "dass2",           title: "Positividade" },
  { key: "dass3",           title: "Valor Próprio" },
  { key: "dass7",           title: "Relaxamento" },
  { key: "createdAt",       title: "Data" },
];

const isoColumns = [
  { key: "beneficiaryName",   title: "Beneficiário" },
  { key: "chekinISO",         title: "Check-in ISO" },
  { key: "chekinISOQuestion", title: "Pergunta" },
  { key: "chekinISOResponse", title: "Resposta" },
  { key: "createdAt",         title: "Data" },
];

// ─── Badges ───────────────────────────────────────────────────────────────────
const CheckBadge = ({ value }: { value: boolean }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
    value
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-gray-100 text-gray-500 border-gray-200"
  }`}>
    {value ? "Realizado" : "Pendente"}
  </span>
);

const PointBadge = ({ value }: { value: number }) => {
  const color = value >= 4 ? "bg-green-100 text-green-800 border-green-200"
    : value >= 2            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
    :                         "bg-red-100 text-red-800 border-red-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {value} pt{value !== 1 ? "s" : ""}
    </span>
  );
};

// ─── Filtro ───────────────────────────────────────────────────────────────────
type TFilter = {
  search:          string;
  "gte$createdAt": string;
  "lte$createdAt": string;
  chekinIGS:       string;
  chekinIGN:       string;
  chekinIES:       string;
  chekinISO:       string;
  program:         string;
  status:          string;
  role:            string;
  effectiveDate:   string;
};

const ResetFilter: TFilter = {
  search:          "",
  "gte$createdAt": "",
  "lte$createdAt": "",
  chekinIGS:       "",
  chekinIGN:       "",
  chekinIES:       "",
  chekinISO:       "",
  program:         "",
  status:          "",
  role:            "",
  effectiveDate:   "",
};

// ─── Summary ──────────────────────────────────────────────────────────────────
type TSummary = {
  totalIGS: number;
  totalIGN: number;
  totalIES: number;
  totalISO: number;
};

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function OccupationalManagement() {
  const [_, setLoading]             = useAtom(loadingAtom);
  const [userLogger]                = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom);

  const [activeTab, setActiveTab] = useState<TTab>("igs");
  const [queryStr, setQueryStr]   = useState<string>("");
  const [summary, setSummary]     = useState<TSummary>({ totalIGS: 0, totalIGN: 0, totalIES: 0, totalISO: 0 });

  const { register, reset, getValues } = useForm<TFilter>({ defaultValues: ResetFilter });

  // ── Listagem ───────────────────────────────────────────────────────────────
  const getAll = async (query: string = "") => {
    try {
      setLoading(true);
      const idLocal = localStorage.getItem("id");
      const id = idLocal ? idLocal : "";
      const tabFilter: Record<TTab, string> = {
        igs: "&chekinIGS=true",
        ign: "&chekinIGN=true",
        ies: "&chekinIES=true",
        iso: "&chekinISO=true",
      };

      const { data } = await api.get(
        `/vitals?deleted=false&contractorId=${id}&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=1${tabFilter[activeTab]}${query}`,
        configApi()
      );
      const result = data.result;
      setPagination({
        currentPage: result.currentPage,
        data:        result.data ?? [],
        sizePage:    result.pageSize,
        totalPages:  result.totalCount,
      });
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };

  // ── Summary ────────────────────────────────────────────────────────────────
  const loadSummary = async () => {
    try {
      const idLocal = localStorage.getItem("id");
      const id = idLocal ? idLocal : "";

      const [igs, ign, ies, iso] = await Promise.all([
        api.get(`/vitals?deleted=false&contractorId=${id}&chekinIGS=true&pageSize=1&pageNumber=1`, configApi()),
        api.get(`/vitals?deleted=false&contractorId=${id}&chekinIGN=true&pageSize=1&pageNumber=1`, configApi()),
        api.get(`/vitals?deleted=false&contractorId=${id}&chekinIES=true&pageSize=1&pageNumber=1`, configApi()),
        api.get(`/vitals?deleted=false&contractorId=${id}&chekinISO=true&pageSize=1&pageNumber=1`, configApi()),
      ]);
      setSummary({
        totalIGS: igs.data.result.totalCount,
        totalIGN: ign.data.result.totalCount,
        totalIES: ies.data.result.totalCount,
        totalISO: iso.data.result.totalCount,
      });
      console.log(iso.data.result);
    } catch {}
  };

  // ── Build query ────────────────────────────────────────────────────────────
  const buildQuery = (values: TFilter): string => {
    let q = "";
    if (values.search)           q += `&regex$or$beneficiaryName=${values.search}`;
    if (values["gte$createdAt"]) q += `&gte$createdAt=${values["gte$createdAt"]}`;
    if (values["lte$createdAt"]) q += `&lte$createdAt=${values["lte$createdAt"]}`;
    if (values.program)          q += `&program=${values.program}`;
    if (values.status)           q += `&status=${values.status}`;
    if (values.role)             q += `&role=${values.role}`;
    if (values.effectiveDate)    q += `&effectiveDate=${values.effectiveDate}`;
    return q;
  };

  const onSubmit = async () => {
    const q = buildQuery(getValues());
    setQueryStr(q);
    await getAll(q);
  };

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = useMemo(() => {
    if (activeTab === "igs") return igsColumns;
    if (activeTab === "ign") return ignColumns;
    if (activeTab === "ies") return iesColumns;
    return isoColumns;
  }, [activeTab]);

  // ── Cell renderer ──────────────────────────────────────────────────────────
  const renderCell = (x: any, col: { key: string }) => {
    const v = x[col.key];
    if (col.key === "createdAt") return maskDate(v);
    if (["chekinIGS", "chekinIGN", "chekinIES", "chekinISO"].includes(col.key))
      return <CheckBadge value={Boolean(v)} />;
    if (["chekinIGSPoint", "chekinIGNPoint", "chekinIESPoint", "chekinISOPoint"].includes(col.key))
      return <PointBadge value={Number(v ?? 0)} />;
    if (col.key === "sleepQuality")
      return v ? `${v}/10` : "—";
    if (col.key === "waterAmount")
      return v ? `${v}L` : "—";
    if (col.key === "isoQuestion")
      return v
        ? <span className="text-xs text-(--text-muted) italic max-w-xs truncate block" title={v}>{v}</span>
        : "—";
    if (["dass1","dass2","dass3","dass7"].includes(col.key))
      return v !== undefined && v !== null ? `${v}/3` : "—";
    return v ?? "—";
  };

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    reset(ResetFilter);
    setQueryStr("");
    getAll();
  }, [activeTab]);

  // ── Tabs ───────────────────────────────────────────────────────────────────
  const tabs: { key: TTab; label: string; icon: React.ReactNode; count: number; color: string }[] = [
    { key: "iso", label: "ISO — Ocupacional", icon: <FiCheckSquare size={14} />, count: summary.totalISO, color: "#f59e0b" },
    { key: "igs", label: "IGS — Saúde",       icon: <FiMoon size={14} />,        count: summary.totalIGS, color: "var(--primary-color)" },
    { key: "ign", label: "IGN — Nutrição",    icon: <BsBarChartLine size={14} />, count: summary.totalIGN, color: "#10b981" },
    { key: "ies", label: "IES — Mental",      icon: <TbHeartbeat size={14} />,   count: summary.totalIES, color: "#8b5cf6" },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Autorization />
      {userLogger ? (
        <>
          <Header />
          <main className="slim-bg-main">
            <SideMenu />
            <div className="slim-container-customer h-[calc(100dvh-5rem)] w-full">
              <SlimContainer
                menu="Gestão"
                breadcrump="Saúde Ocupacional"
                breadcrumpIcon="MdWorkOutline"
              >
                {/* ── Summary Cards ─────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {tabs.map((t) => (
                    <div
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className="rounded-xl p-4 flex flex-col gap-1 cursor-pointer transition-all"
                      style={{
                        background: "var(--surface-card)",
                        border: activeTab === t.key
                          ? `1.5px solid ${t.color}`
                          : "1px solid var(--surface-border)",
                      }}
                    >
                      <span className="text-xs text-(--text-muted) font-medium">{t.label}</span>
                      <span className="text-2xl font-bold" style={{ color: t.color }}>{t.count}</span>
                      <span className="text-xs text-(--text-muted)">check-ins</span>
                    </div>
                  ))}
                </div>

                {/* ── Tabs ──────────────────────────────────────────────── */}
                <div className="flex gap-1 mb-4 p-1 rounded-xl overflow-x-auto"
                  style={{ background: "var(--surface-bg)", border: "1px solid var(--surface-border)" }}>
                  {tabs.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className="shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                      style={
                        activeTab === t.key
                          ? { background: "var(--primary-color)", color: "#fff", boxShadow: "0 2px 8px rgba(0,51,102,.25)" }
                          : { color: "var(--text-muted)" }
                      }
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* ── Filtros ───────────────────────────────────────────── */}
                <div className="grid grid-cols-12 mb-2">
                  <Accordion className="col-span-12" defaultOpenId="filter">
                    <AccordionItem id="filter">
                      <AccordionTrigger
                        icon={queryStr ? <MdFilterAlt size={15} /> : <MdFilterAltOff size={15} />}
                        subtitle=""
                      >
                        Filtros
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-12 gap-3">

                          {/* Busca rápida */}
                          <div className="flex flex-col col-span-12 sm:col-span-4 mb-2">
                            <label className="label slim-label-primary">Busca rápida</label>
                            <input
                              {...register("search")}
                              type="text"
                              className="input slim-input-primary"
                              placeholder="Nome do beneficiário..."
                            />
                          </div>

                          {/* Data início */}
                          <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                            <label className="label slim-label-primary">Data — início</label>
                            <input {...register("gte$createdAt")} type="date" className="input slim-input-primary" />
                          </div>

                          {/* Data fim */}
                          <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                            <label className="label slim-label-primary">Data — fim</label>
                            <input {...register("lte$createdAt")} type="date" className="input slim-input-primary" />
                          </div>

                          {/* Programa */}
                          <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                            <label className="label slim-label-primary">Programa</label>
                            <select {...register("program")} className="input slim-input-primary">
                              <option value="">Todos</option>
                              <option value="programa_1">Programa 1</option>
                              <option value="programa_2">Programa 2</option>
                            </select>
                          </div>

                          {/* Status */}
                          <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                            <label className="label slim-label-primary">Status</label>
                            <select {...register("status")} className="input slim-input-primary">
                              <option value="">Todos</option>
                              <option value="ativo">Ativo</option>
                              <option value="inativo">Inativo</option>
                            </select>
                          </div>

                          {/* Função */}
                          <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                          <label className="label slim-label-primary">Função</label>
                          <input
                            {...register("role")}
                            type="text"
                            className="input slim-input-primary"
                            placeholder="Ex: Gerente"/>
                          </div>

                          {/* Data de vigência */}
                          <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                            <label className="label slim-label-primary">Data de vigência</label>
                            <input {...register("effectiveDate")} type="date" className="input slim-input-primary" />
                          </div>

                          {/* Botão buscar */}
                          <div className="flex flex-col justify-end col-span-12 sm:col-span-1 mb-2">
                            <div
                              onClick={onSubmit}
                              className="slim-bg-primary p-2 w-10 flex justify-center items-center rounded-lg cursor-pointer"
                            >
                              <IoSearch />
                            </div>
                          </div>

                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {/* ── Tabela ────────────────────────────────────────────── */}
                <DataTable
                  isAction={false}
                  classContainer="max-h-[calc(100dvh-(var(--height-header)+18rem))]"
                  columns={columns}
                >
                  <>
                    {pagination.data.map((x: any, i: number) => (
                      <tr className="slim-tr" key={i}>
                        {columns.map((col) => (
                          <td
                            className="px-4 py-3 text-left text-sm font-medium tracking-wider"
                            key={col.key}
                          >
                            {renderCell(x, col)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                </DataTable>
                <NotData />
              </SlimContainer>
            </div>
          </main>
        </>
      ) : <></>}
    </>
  );
}