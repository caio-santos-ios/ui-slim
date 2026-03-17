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
import { ModalDelete } from "@/components/Global/ModalDelete";
import { IconEdit } from "@/components/Global/IconEdit";
import { IconDelete } from "@/components/Global/IconDelete";
import { maskDate } from "@/utils/mask.util";
import { permissionCreate, permissionDelete, permissionRead, permissionUpdate } from "@/utils/permission.util";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/Global/Accordion/AccordionContent";
import { IoSearch } from "react-icons/io5";
import { MdFilterAlt, MdFilterAltOff } from "react-icons/md";
import { TbHeartbeat, TbReportAnalytics, TbShieldCheck } from "react-icons/tb";
import { BsBarChartLine } from "react-icons/bs";
import { FiCheckSquare } from "react-icons/fi";
import { ModalOccupationalBemVital, ModalOccupationalCheckin, ModalOccupationalPgr } from "@/components/OccupationalManagement/Modal/OccupationalModals";

// ─── Abas ────────────────────────────────────────────────────────────────────
type TTab = "checkins" | "reports" | "analytics" | "bemVital" | "pgr";

// ─── Colunas ─────────────────────────────────────────────────────────────────
const checkinColumns = [
  { key: "recipientName",     title: "Beneficiário" },
  { key: "department",        title: "Departamento" },
  { key: "role",              title: "Função" },
  { key: "dimension",         title: "Dimensão" },
  { key: "riskClassification",title: "Risco" },
  { key: "engagementLevel",   title: "Engajamento" },
  { key: "checkinDate",       title: "Data" },
];

const reportColumns = [
  { key: "recipientName",   title: "Beneficiário" },
  { key: "department",      title: "Departamento" },
  { key: "role",            title: "Função" },
  { key: "dimension",       title: "Dimensão" },
  { key: "period",          title: "Período" },
  { key: "checkinDate",     title: "Data" },
];

const analyticsColumns = [
  { key: "recipientName",    title: "Beneficiário" },
  { key: "engagementLevel",  title: "Engajamento" },
  { key: "riskLevel",        title: "Nível de Risco" },
  { key: "safetyPerception", title: "Percepção de Segurança" },
  { key: "absenceRisk",      title: "Risco de Afastamento" },
  { key: "econometerScore",  title: "Econômetro" },
  { key: "checkinDate",      title: "Data" },
];

const bemVitalColumns = [
  { key: "recipientName", title: "Beneficiário" },
  { key: "department",    title: "Departamento" },
  { key: "igs",           title: "IGS" },
  { key: "ign",           title: "IGN" },
  { key: "ies",           title: "IES" },
  { key: "ipv",           title: "IPV" },
  { key: "referenceDate", title: "Data" },
];

const pgrColumns = [
  { key: "customerName",   title: "Empresa" },
  { key: "referenceMonth", title: "Mês/Ano" },
  { key: "status",         title: "Status" },
  { key: "totalBeneficiaries", title: "Beneficiários" },
  { key: "avgEngagement",  title: "Eng. Médio" },
  { key: "avgRisk",        title: "Risco Médio" },
  { key: "generatedAt",    title: "Gerado em" },
];

// ─── Status / Risk badge ──────────────────────────────────────────────────────
const RiskBadge = ({ value }: { value: string }) => {
  const map: Record<string, string> = {
    Baixo:   "bg-green-100 text-green-800 border-green-200",
    Médio:   "bg-yellow-100 text-yellow-800 border-yellow-200",
    Alto:    "bg-orange-100 text-orange-800 border-orange-200",
    Crítico: "bg-red-100 text-red-800 border-red-200",
    Pendente:"bg-gray-100 text-gray-700 border-gray-200",
    Gerado:  "bg-green-100 text-green-800 border-green-200",
    Enviado: "bg-blue-100 text-blue-800 border-blue-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${map[value] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
      {value}
    </span>
  );
};

// ─── Score bar ────────────────────────────────────────────────────────────────
const ScoreBar = ({ value, max = 10 }: { value: number; max?: number }) => {
  const pct = Math.min(100, (value / max) * 100);
  const color = pct < 40 ? "#ef4444" : pct < 70 ? "#f59e0b" : "#22c55e";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-gray-200">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{value?.toFixed(1)}</span>
    </div>
  );
};

// ─── Filtro ───────────────────────────────────────────────────────────────────
type TFilter = {
  search:          string;
  "gte$checkinDate":string;
  "lte$checkinDate":string;
  department:      string;
  role:            string;
  dimension:       string;
  riskClassification: string;
  period:          string;
  customerId:      string;
  referenceMonth:  string;
  referenceYear:   string;
};

const ResetFilter: TFilter = {
  search:            "",
  "gte$checkinDate": "",
  "lte$checkinDate": "",
  department:        "",
  role:              "",
  dimension:         "",
  riskClassification:"",
  period:            "",
  customerId:        "",
  referenceMonth:    "",
  referenceYear:     "",
};

// ─── Summary ──────────────────────────────────────────────────────────────────
type TSummary = {
  totalCheckins:   number;
  highRisk:        number;
  avgEngagement:   number;
  pgrCount:        number;
};

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function OccupationalManagement() {
  const [_, setLoading]             = useAtom(loadingAtom);
  const [userLogger]                = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom);

  const [activeTab, setActiveTab]   = useState<TTab>("checkins");
  const [typeModal, setTypeModal]   = useState<"create" | "edit">("create");
  const [currentBody, setCurrentBody] = useState<any>({});
  const [id, setId]                 = useState<string>("");
  const [modalDelete, setModalDelete] = useState<boolean>(false);
  const [queryStr, setQueryStr]     = useState<string>("");
  const [customers, setCustomers]   = useState<any[]>([]);
  const [summary, setSummary]       = useState<TSummary>({ totalCheckins: 0, highRisk: 0, avgEngagement: 0, pgrCount: 0 });

  // modais
  const [modalCheckin,  setModalCheckin]  = useState(false);
  const [modalBemVital, setModalBemVital] = useState(false);
  const [modalPgr,      setModalPgr]      = useState(false);

  const { register, reset, getValues } = useForm<TFilter>({ defaultValues: ResetFilter });

  // ── URI por aba ────────────────────────────────────────────────────────────
  const uriMap: Record<TTab, string> = {
    checkins:  "occupational-micro-checkins",
    reports:   "occupational-micro-checkins",
    analytics: "occupational-micro-checkins",
    bemVital:  "occupational-bem-vitals",
    pgr:       "occupational-pgr",
  };

  // ── Listagem ───────────────────────────────────────────────────────────────
  const getAll = async (query: string = "") => {
    try {
      setLoading(true);
      const uri = uriMap[activeTab];
      const { data } = await api.get(
        `/${uri}?deleted=false&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=${pagination.currentPage}${query}`,
        configApi()
      );
      const result = data.result;
      setPagination({
        currentPage: result.currentPage,
        data:        result.data,
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
      const [total, highRisk, pgrs] = await Promise.all([
        api.get(`/occupational-micro-checkins?deleted=false&pageSize=1&pageNumber=1`, configApi()),
        api.get(`/occupational-micro-checkins?deleted=false&riskClassification=Alto&pageSize=1&pageNumber=1`, configApi()),
        api.get(`/occupational-pgr?deleted=false&pageSize=1&pageNumber=1`, configApi()),
      ]);
      setSummary({
        totalCheckins: total.data.result.totalCount,
        highRisk:      highRisk.data.result.totalCount,
        avgEngagement: 0, // seria calculado via endpoint de analytics
        pgrCount:      pgrs.data.result.totalCount,
      });
    } catch {}
  };

  const loadCustomers = async () => {
    try {
      const { data } = await api.get(`/customers?deleted=false&orderBy=corporateName&sort=asc&pageSize=200&pageNumber=1`, configApi());
      setCustomers(data.result.data ?? []);
    } catch {}
  };

  // ── Build query ────────────────────────────────────────────────────────────
  const buildQuery = (values: TFilter): string => {
    let q = "";
    if (values.search)             q += `&regex$or$recipientName=${values.search}&regex$or$department=${values.search}`;
    if (values["gte$checkinDate"]) q += `&gte$checkinDate=${values["gte$checkinDate"]}`;
    if (values["lte$checkinDate"]) q += `&lte$checkinDate=${values["lte$checkinDate"]}`;
    if (values.department)         q += `&regex$department=${values.department}`;
    if (values.role)               q += `&regex$role=${values.role}`;
    if (values.dimension)          q += `&dimension=${values.dimension}`;
    if (values.riskClassification) q += `&riskClassification=${values.riskClassification}`;
    if (values.period)             q += `&period=${values.period}`;
    if (values.customerId)         q += `&customerId=${values.customerId}`;
    if (values.referenceMonth)     q += `&referenceMonth=${values.referenceMonth}`;
    if (values.referenceYear)      q += `&referenceYear=${values.referenceYear}`;
    return q;
  };

  const onSubmit = async () => {
    const q = buildQuery(getValues());
    setQueryStr(q);
    await getAll(q);
  };

  // ── Modals ─────────────────────────────────────────────────────────────────
  const openModal = (action: "create" | "edit" = "create", body?: any) => {
    if (body) { setCurrentBody(body); setId(body.id); }
    setTypeModal(action);
    if (activeTab === "checkins" || activeTab === "reports" || activeTab === "analytics") setModalCheckin(true);
    if (activeTab === "bemVital")  setModalBemVital(true);
    if (activeTab === "pgr")       setModalPgr(true);
  };

  const closeModal = () => {
    setModalCheckin(false);
    setModalBemVital(false);
    setModalPgr(false);
    setCurrentBody({});
    setId("");
  };

  const handleSuccess = async () => {
    closeModal();
    await getAll(queryStr);
    await loadSummary();
  };

  const openModalDelete = (body: any) => { setCurrentBody(body); setModalDelete(true); };

  const destroy = async () => {
    try {
      const uri = uriMap[activeTab];
      const { status } = await api.delete(`/${uri}/${currentBody?.id}`, configApi());
      resolveResponse({ status, message: "Excluído com sucesso" });
      setModalDelete(false);
      setCurrentBody({});
      await getAll(queryStr);
      await loadSummary();
    } catch (error) {
      resolveResponse(error);
    }
  };

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = useMemo(() => {
    if (activeTab === "checkins")  return checkinColumns;
    if (activeTab === "reports")   return reportColumns;
    if (activeTab === "analytics") return analyticsColumns;
    if (activeTab === "bemVital")  return bemVitalColumns;
    return pgrColumns;
  }, [activeTab]);

  // ── Cell renderer ──────────────────────────────────────────────────────────
  const renderCell = (x: any, col: { key: string }) => {
    const v = x[col.key];
    if (["checkinDate", "referenceDate", "generatedAt"].includes(col.key)) return maskDate(v);
    if (col.key === "riskClassification" || col.key === "status") return <RiskBadge value={v} />;
    if (["engagementLevel","riskLevel","safetyPerception","absenceRisk","econometerScore","avgEngagement","avgRisk"].includes(col.key))
      return <ScoreBar value={Number(v)} />;
    if (["igs","ign","ies","ipv"].includes(col.key)) return <ScoreBar value={Number(v)} />;
    if (col.key === "referenceMonth") return `${String(x.referenceMonth).padStart(2, "0")}/${x.referenceYear}`;
    return v;
  };

  // ── Efeitos ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (permissionRead("1", "OCC")) {
      loadCustomers();
      loadSummary();
    }
  }, []);

  useEffect(() => {
    reset(ResetFilter);
    setQueryStr("");
    getAll();
  }, [activeTab]);

  // ── Tabs ───────────────────────────────────────────────────────────────────
  const tabs: { key: TTab; label: string; icon: React.ReactNode }[] = [
    { key: "checkins",  label: "ISO / Micro Checkins", icon: <FiCheckSquare size={14} /> },
    { key: "reports",   label: "Relatórios",            icon: <TbReportAnalytics size={14} /> },
    { key: "analytics", label: "Analítico",             icon: <BsBarChartLine size={14} /> },
    { key: "bemVital",  label: "Bem Vital",             icon: <TbHeartbeat size={14} /> },
    { key: "pgr",       label: "PGR",                   icon: <TbShieldCheck size={14} /> },
  ];

  // ── Can create (readonly tabs) ─────────────────────────────────────────────
  const canCreate = activeTab !== "reports" && activeTab !== "analytics";

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
                breadcrump="Gestão Ocupacional"
                breadcrumpIcon="MdWorkOutline"
                buttons={
                  <button onClick={() => openModal()} className="slim-btn slim-btn-primary">
                    {activeTab === "pgr" ? "Gerar PGR" : "Adicionar"}
                  </button>
                }>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Total Checkins",  value: summary.totalCheckins, color: "var(--primary-color)" },
                    { label: "Alto Risco",       value: summary.highRisk,      color: "#ef4444" },
                    { label: "PGRs Gerados",     value: summary.pgrCount,      color: "#8b5cf6" },
                    { label: "Envio Auto",       value: "1º dia",              color: "#f59e0b", isText: true },
                  ].map((c: any) => (
                    <div
                      key={c.label}
                      className="rounded-xl p-4 flex flex-col gap-1"
                      style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)" }}
                    >
                      <span className="text-xs text-[var(--text-muted)] font-medium">{c.label}</span>
                      <span className={`${c.isText ? "text-base" : "text-2xl"} font-bold`} style={{ color: c.color }}>{c.value}</span>
                      {c.isText && <span className="text-xs text-[var(--text-muted)]">do mês → RH/SST</span>}
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
                      className="flex-shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
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

                {/* ── Nota informativa na aba PGR ───────────────────────── */}
                {activeTab === "pgr" && (
                  <div className="mb-3 px-4 py-3 rounded-xl text-xs text-[var(--text-muted)] flex items-start gap-2"
                    style={{ background: "var(--surface-bg)", border: "1px solid var(--surface-border)" }}>
                    <TbShieldCheck size={16} className="flex-shrink-0 mt-0.5" style={{ color: "var(--primary-color)" }} />
                    <p>
                      O PGR é gerado automaticamente no <strong>1º dia de cada mês</strong> e enviado ao gestor de SST e/ou RH
                      — conforme aba PGR Consolidado da planilha Simulador de Diagnóstico Ocupacional.
                    </p>
                  </div>
                )}

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

                          {/* Busca */}
                          {activeTab !== "pgr" && (
                            <div className="flex flex-col col-span-12 sm:col-span-4 mb-2">
                              <label className="label slim-label-primary">Busca rápida</label>
                              <input {...register("search")} type="text" className="input slim-input-primary"
                                placeholder="Nome do beneficiário ou departamento..." />
                            </div>
                          )}

                          {/* Empresa (PGR) */}
                          {activeTab === "pgr" && (
                            <div className="flex flex-col col-span-12 sm:col-span-4 mb-2">
                              <label className="label slim-label-primary">Empresa</label>
                              <select {...register("customerId")} className="select slim-select-primary">
                                <option value="">Todas</option>
                                {customers.map((c) => <option key={c.id} value={c.id}>{c.corporateName}</option>)}
                              </select>
                            </div>
                          )}

                          {/* Datas checkin */}
                          {activeTab !== "pgr" && (
                            <>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Data — início</label>
                                <input {...register("gte$checkinDate")} type="date" className="input slim-input-primary" />
                              </div>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Data — fim</label>
                                <input {...register("lte$checkinDate")} type="date" className="input slim-input-primary" />
                              </div>
                            </>
                          )}

                          {/* PGR: mês/ano */}
                          {activeTab === "pgr" && (
                            <>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Mês</label>
                                <select {...register("referenceMonth")} className="select slim-select-primary">
                                  <option value="">Todos</option>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, "0")}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Ano</label>
                                <input {...register("referenceYear")} type="number" className="input slim-input-primary"
                                  placeholder={String(new Date().getFullYear())} />
                              </div>
                            </>
                          )}

                          {/* Filtros checkin/report/analytics */}
                          {(activeTab === "checkins" || activeTab === "reports" || activeTab === "analytics") && (
                            <>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Departamento</label>
                                <input {...register("department")} type="text" className="input slim-input-primary" placeholder="Ex: RH" />
                              </div>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Função</label>
                                <input {...register("role")} type="text" className="input slim-input-primary" placeholder="Ex: Analista" />
                              </div>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Dimensão</label>
                                <input {...register("dimension")} type="text" className="input slim-input-primary" />
                              </div>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Período</label>
                                <select {...register("period")} className="select slim-select-primary">
                                  <option value="">Todos</option>
                                  <option value="Manha">Manhã</option>
                                  <option value="Tarde">Tarde</option>
                                  <option value="Noite">Noite</option>
                                </select>
                              </div>
                            </>
                          )}

                          {/* Risco (apenas checkins/analytics) */}
                          {(activeTab === "checkins" || activeTab === "analytics") && (
                            <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                              <label className="label slim-label-primary">Classificação de Risco</label>
                              <select {...register("riskClassification")} className="select slim-select-primary">
                                <option value="">Todos</option>
                                <option value="Baixo">Baixo</option>
                                <option value="Médio">Médio</option>
                                <option value="Alto">Alto</option>
                                <option value="Crítico">Crítico</option>
                              </select>
                            </div>
                          )}

                          {/* Botão buscar */}
                          <div className="flex flex-col justify-end col-span-12 sm:col-span-1 mb-2">
                            <div onClick={onSubmit} className="slim-bg-primary p-2 w-10 flex justify-center items-center rounded-lg cursor-pointer">
                              <IoSearch />
                            </div>
                          </div>

                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {/* ── Tabela ────────────────────────────────────────────── */}
                <DataTable classContainer="max-h-[calc(100dvh-(var(--height-header)+18rem))]" columns={columns}>
                  <>
                    {pagination.data.map((x: any, i: number) => (
                      <tr className="slim-tr" key={i}>
                        {columns.map((col) => (
                          <td className="px-4 py-3 text-left text-sm font-medium tracking-wider" key={col.key}>
                            {renderCell(x, col)}
                          </td>
                        ))}
                        <td className="text-center">
                          <div className="flex justify-center gap-2">
                            {permissionUpdate("1", "OCC") && canCreate && activeTab !== "pgr" && (
                              <IconEdit action="edit" obj={x} getObj={openModal} />
                            )}
                            {permissionDelete("1", "OCC") && canCreate && (
                              <IconDelete obj={x} getObj={openModalDelete} />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                </DataTable>
                <NotData />
              </SlimContainer>
            </div>

            <ModalOccupationalCheckin
              isOpen={modalCheckin}
              typeModal={typeModal}
              body={currentBody}
              customers={customers}
              onClose={closeModal}
              onSuccess={handleSuccess}
            />

            <ModalOccupationalBemVital
              isOpen={modalBemVital}
              typeModal={typeModal}
              body={currentBody}
              customers={customers}
              onClose={closeModal}
              onSuccess={handleSuccess}
            />

            <ModalOccupationalPgr
              isOpen={modalPgr}
              customers={customers}
              onClose={closeModal}
              onSuccess={handleSuccess}
            />

            <ModalDelete
              title="Excluir registro"
              isOpen={modalDelete}
              setIsOpen={() => setModalDelete(false)}
              onClose={() => setModalDelete(false)}
              onSelectValue={destroy}
            />
          </main>
        </>
      ) : <></>}
    </>
  );
}
