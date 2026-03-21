"use client";

import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { modalAtom } from "@/jotai/global/modal.jotai";
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
import { maskDate } from "@/utils/mask.util";
import { convertNumberMoney } from "@/utils/convert.util";
import { permissionDelete, permissionRead, permissionUpdate } from "@/utils/permission.util";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/Global/Accordion/AccordionContent";
import { IoSearch } from "react-icons/io5";
import { MdFilterAlt, MdFilterAltOff, MdOutlineAttachFile, MdOutlineReceipt } from "react-icons/md";
import { FiDownload, FiUsers } from "react-icons/fi";
import { TB2BMassMovement, TB2BInvoice, TB2BAttachment } from "@/types/b2bPanel/b2bPanel.type";
import { ModalB2BMassMovement } from "@/components/B2BPanel/Modal/ModalMassMovement";
import { ModalB2BAttachment, ModalB2BInvoice } from "@/components/B2BPanel/Modal/ModalInvoiceAndAttachment";
import { IconView } from "@/components/Global/IconView";
import { IconEdit } from "@/components/Global/IconEdit";
import { IconDelete } from "@/components/Global/IconDelete";
import { TPlan } from "@/types/masterData/plans/plans.type";
import { TServiceModule } from "@/types/masterData/serviceModules/serviceModules.type";

// ─── Abas ────────────────────────────────────────────────────────────────────
type TTab = "movements" | "invoices" | "attachments";

// ─── Colunas ─────────────────────────────────────────────────────────────────
// item 3: beneficiário, cpf, programa, status, função, departamento, data de vigência
const movementColumns = [
  { key: "name",          title: "Beneficiário" },
  { key: "cpf",           title: "CPF" },
  { key: "planName",      title: "Programa" },
  { key: "active",        title: "Status" },
  { key: "function",      title: "Função" },
  { key: "department",    title: "Departamento" },
  { key: "effectiveDate", title: "Data de Vigência" },
];

// item 4: colunas da fatura
const invoiceColumns = [
  { key: "referenceMonth",   title: "Mês/Ano" },
  { key: "beneficiaryCount", title: "Beneficiários" },
  { key: "totalAmount",      title: "Valor Total" },
  { key: "status",           title: "Status" },
  { key: "dueDate",          title: "Vencimento" },
  { key: "closingDate",      title: "Data de Corte" }
];

const attachmentColumns = [
  { key: "description", title: "Nome" },
  { key: "createdAt",   title: "Data" },
];

// ─── Filtros ──────────────────────────────────────────────────────────────────
// item 1: beneficiário, cpf, idade, sexo, módulo de serviço, programa, status, datas
// item 4: filtros de fatura (referenceMonth, referenceYear, status, totalAmount)
type TFilter = {
  search:              string;
  cpf:                 string;
  ageFrom:             string;
  ageTo:               string;
  gender:              string;
  serviceModuleId:     string;
  planId:              string;
  active:              string;
  "gte$createdAt":     string;
  "lte$createdAt":     string;
  "gte$effectiveDate": string;
  "lte$effectiveDate": string;
  // fatura
  referenceMonth:      string;
  referenceYear:       string;
  status:              string;
  // anexos
  type:                string;
  department:          string;
  period:              string;
};

const ResetFilter: TFilter = {
  search:              "",
  cpf:                 "",
  ageFrom:             "",
  ageTo:               "",
  gender:              "",
  serviceModuleId:     "",
  planId:              "",
  active:              "",
  "gte$createdAt":     "",
  "lte$createdAt":     "",
  "gte$effectiveDate": "",
  "lte$effectiveDate": "",
  referenceMonth:      "",
  referenceYear:       "",
  status:              "",
  type:                "",
  department:          "",
  period:              "",
};

// ─── Badges ───────────────────────────────────────────────────────────────────
const StatusBadge = ({ value }: { value: any }) => {
  const map: Record<string, string> = {
    Ativo:      "bg-green-100 text-green-800 border-green-200",
    Inativo:    "bg-red-100 text-red-800 border-red-200",
    Pendente:   "bg-yellow-100 text-yellow-800 border-yellow-200",
    Processado: "bg-green-100 text-green-800 border-green-200",
    Erro:       "bg-red-100 text-red-800 border-red-200",
    Aberta:     "bg-blue-100 text-blue-800 border-blue-200",
    Fechada:    "bg-gray-100 text-gray-700 border-gray-200",
    Paga:       "bg-green-100 text-green-800 border-green-200",
    Cancelada:  "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${map[value] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
      {value}
    </span>
  );
};

type TSummary = { movements: number; invoices: number; attachments: number; pendingMovements: number };

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function B2BPanel() {
  const [_, setLoading]             = useAtom(loadingAtom);
  const [modal, setModal]           = useAtom(modalAtom);
  const [userLogger]                = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom);

  const [activeTab, setActiveTab]       = useState<TTab>("movements");
  const [typeModal, setTypeModal]       = useState<"create" | "edit">("create");
  const [currentBody, setCurrentBody]   = useState<any>({});
  const [id, setId]                     = useState<string>("");
  const [modalDelete, setModalDelete]   = useState<boolean>(false);
  const [queryStr, setQueryStr]         = useState<string>("");
  const [customers, setCustomers]       = useState<any[]>([]);
  const [plans, setPlans]               = useState<TPlan[]>([]);
  const [serviceModules, setServiceModules] = useState<TServiceModule[]>([]);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [summary, setSummary]           = useState<TSummary>({ movements: 0, invoices: 0, attachments: 0, pendingMovements: 0 });
  const [filterOpened, setFilterOpened] = useState(true);

  const [modalMovement,   setModalMovement]   = useState(false);
  const [modalInvoice,    setModalInvoice]    = useState(false);
  const [modalAttachment, setModalAttachment] = useState(false);

  const { register, reset, getValues } = useForm<TFilter>({ defaultValues: ResetFilter });

  const uriMap: Record<TTab, string> = {
    movements:   "b2b-mass-movements",
    invoices:    "b2b-invoices",
    attachments: "attachments",
  };

  const getAll = async (query: string = "") => {
    try {
      setLoading(true);
      const uri = uriMap[activeTab];
      
      if (uri === "attachments") {
        const contractorId = localStorage.getItem("contractorId");
        if (contractorId) query += `&parentId=${contractorId}&parent=customer-manager`;
      };

      const { data } = await api.get(`/${uri}?deleted=false&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=1${query}`, configApi());
      const result = data.result;
      setPagination({ currentPage: result.currentPage, data: result.data, sizePage: result.pageSize, totalPages: result.totalCount });
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };

  const getRecipient = async (query: string = "") => {
    try {
      const contractorId = localStorage.getItem("contractorId");

      setLoading(true);
      const { data } = await api.get(`/customer-recipients/manager-panel?deleted=false&contractorId=${contractorId ?? ""}&orderBy=name&sort=asc&pageSize=10&pageNumber=1${query}`, configApi());
      const result = data.result;
      setPagination({ currentPage: result.currentPage, data: result.data, sizePage: result.pageSize, totalPages: result.totalCount });
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    try {
      setExportingExcel(true);
      const { data } = await api.get(`/customer-recipients/manager-panel?deleted=false&orderBy=name&sort=asc&pageSize=99999&pageNumber=1${queryStr}`, configApi());
      const rows: any[] = data.result.data ?? [];
      const sheetData = rows.map((r) => ({
        "Beneficiário":       r.name ?? "",
        "CPF":                r.cpf ?? "",
        "Status":             r.active ? "Ativo" : "Inativo",
        "Programa":           r.planName ?? "",
        "Função":             r.role ?? "",
        "Departamento":       r.department ?? "",
        "Sexo":               r.gender ?? "",
        "Data de Nascimento": r.dateOfBirth ? maskDate(r.dateOfBirth) : "",
        "Data de Vigência":   r.effectiveDate ? maskDate(r.effectiveDate) : "",
        "E-mail":             r.email ?? "",
        "Telefone":           r.phone ?? "",
        "WhatsApp":           r.whatsapp ?? "",
        "Vínculo":            r.bond ?? "",
        "CEP":                r?.address?.zipCode ?? "",
        "Número":             r?.address?.number ?? "",
        "Rua":                r?.address?.street ?? "",
        "Complemento":        r?.address?.complement ?? "",
        "Bairro":             r?.address?.neighborhood ?? "",
        "Cidade":             r?.address?.city ?? "",
        "Estado":             r?.address?.state ?? "",
      }));
      const XLSX = await import("xlsx");
      const ws   = XLSX.utils.json_to_sheet(sheetData);
      const wb   = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Beneficiários");
      ws["!cols"] = Object.keys(sheetData[0] ?? {}).map(() => ({ wch: 24 }));
      XLSX.writeFile(wb, `beneficiarios_${new Date().toISOString().split("T")[0]}.xlsx`);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setExportingExcel(false);
    }
  };

  const loadSummary = async () => {
    try {
      const idLocal = localStorage.getItem("id");
      const id = idLocal ?? "";
      const [mov, inv, att] = await Promise.all([
        api.get(`/b2b-mass-movements?deleted=false&pageSize=1&pageNumber=1`, configApi()),
        api.get(`/b2b-invoices?deleted=false&pageSize=1&pageNumber=1`, configApi()),
        api.get(`/attachments?deleted=false&pageSize=1&pageNumber=1&parentId=${id}&parent=customer-manager`, configApi()),
      ]);
      const pending = await api.get(`/b2b-mass-movements?deleted=false&status=Pendente&pageSize=1&pageNumber=1`, configApi());
      setSummary({ movements: mov.data.result.totalCount, invoices: inv.data.result.totalCount, attachments: att.data.result.totalCount, pendingMovements: pending.data.result.totalCount });
    } catch {}
  };

  const loadPlans = async () => {
    try {
      const { data } = await api.get(`/plans?deleted=false&orderBy=name&sort=asc&pageSize=200&pageNumber=1`, configApi());
      setPlans(data.result.data ?? []);
    } catch {}
  };

  const loadServiceModules = async () => {
    try {
      const { data } = await api.get(`/service-modules/select?deleted=false&orderBy=name&sort=asc`, configApi());
      setServiceModules(data.result.data ?? []);
    } catch {}
  };

  const buildQuery = (values: TFilter): string => {
    let q = "";

    if (activeTab === "movements") {
      if (values.search)          q += `&regex$or$name=${values.search}`;
      if (values.cpf)             q += `&regex$cpf=${values.cpf}`;
      if (values.gender)          q += `&gender=${values.gender}`;
      if (values.planId)          q += `&planId=${values.planId}`;
      if (values.serviceModuleId) q += `&serviceModuleId=${values.serviceModuleId}`;
      if (values.active !== "")   q += `&active=${values.active}`;
      if (values["gte$createdAt"])     q += `&gte$createdAt=${values["gte$createdAt"]}`;
      if (values["lte$createdAt"])     q += `&lte$createdAt=${values["lte$createdAt"]}`;
      if (values["gte$effectiveDate"]) q += `&gte$effectiveDate=${values["gte$effectiveDate"]}`;
      if (values["lte$effectiveDate"]) q += `&lte$effectiveDate=${values["lte$effectiveDate"]}`;
      if (values.ageFrom) {
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() - parseInt(values.ageFrom));
        q += `&lte$dateOfBirth=${maxDate.toISOString().split("T")[0]}`;
      }
      if (values.ageTo) {
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - parseInt(values.ageTo));
        q += `&gte$dateOfBirth=${minDate.toISOString().split("T")[0]}`;
      }
    }

    if (activeTab === "invoices") {
      if (values.referenceMonth) q += `&referenceMonth=${values.referenceMonth}`;
      if (values.referenceYear)  q += `&referenceYear=${values.referenceYear}`;
      if (values.status)         q += `&status=${values.status}`;
      if (values["gte$createdAt"]) q += `&gte$createdAt=${values["gte$createdAt"]}`;
      if (values["lte$createdAt"]) q += `&lte$createdAt=${values["lte$createdAt"]}`;
    }

    if (activeTab === "attachments") {
      if (values.search) q += `&regex$or$description=${values.search}`;
      if (values["gte$createdAt"]) q += `&gte$createdAt=${values["gte$createdAt"]}`;
      if (values["lte$createdAt"]) q += `&lte$createdAt=${values["lte$createdAt"]}`;
    }

    return q;
  };

  const onSubmit = async () => {
    const q = buildQuery(getValues());
    setQueryStr(q);
    activeTab === "movements" ? await getRecipient(q) : await getAll(q);
  };

  const openModal = (action: "create" | "edit" = "create", body?: any) => {
    if (body) { setCurrentBody(body); setId(body.id); }
    setTypeModal(action);
    if (activeTab === "movements")   setModalMovement(true);
    if (activeTab === "invoices")    setModalInvoice(true);
    if (activeTab === "attachments") setModalAttachment(true);
  };

  const closeModal = () => {
    setModalMovement(false);
    setModalInvoice(false);
    setModalAttachment(false);
    setCurrentBody({});
    setId("");
  };

  const handleSuccess = async () => {
    closeModal();
    activeTab === "movements" ? await getRecipient(queryStr) : await getAll(queryStr);
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
      activeTab === "movements" ? await getRecipient(queryStr) : await getAll(queryStr);
      await loadSummary();
    } catch (error) {
      resolveResponse(error);
    }
  };

  const columns = useMemo(() => {
    if (activeTab === "movements")   return movementColumns;
    if (activeTab === "invoices")    return invoiceColumns;
    return attachmentColumns;
  }, [activeTab]);

  const renderCell = (x: any, col: { key: string; title: string }) => {
    const v = x[col.key];
    if (["createdAt", "dueDate", "paidAt", "effectiveDate", "closingDate"].includes(col.key)) return maskDate(v);
    if (col.key === "totalAmount")    return convertNumberMoney(v);
    if (col.key === "active")         return <StatusBadge value={v ? "Ativo" : "Inativo"} />;
    if (col.key === "status")         return <StatusBadge value={v} />;
    if (col.key === "Visualizar")     return <IconView link={x.uri} />;
    if (col.key === "referenceMonth") return `${String(x.referenceMonth).padStart(2, "0")}/${x.referenceYear}`;
    return v ?? "—";
  };

  useEffect(() => {
    loadSummary();
    loadPlans();
    loadServiceModules();
  }, []);

  useEffect(() => {
    reset(ResetFilter);
    setQueryStr("");
    activeTab === "movements" ? getRecipient() : getAll();
  }, [activeTab]);

  const tabs: { key: TTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "movements",   label: "Movimentação de Massa", icon: <FiUsers size={15} />,             count: summary.movements },
    { key: "invoices",    label: "Painel de Faturas",     icon: <MdOutlineReceipt size={15} />,    count: summary.invoices },
    { key: "attachments", label: "Anexos",                icon: <MdOutlineAttachFile size={15} />, count: summary.attachments },
  ];

  const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

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
                breadcrump="Painel do Gestor"
                breadcrumpIcon="MdBusiness"
                buttons={
                  <div className="flex items-center gap-2">
                    {activeTab === "movements" && (
                      <button onClick={exportExcel} disabled={exportingExcel} className="slim-btn slim-btn-primary-light flex items-center gap-1.5">
                        <FiDownload size={14} />
                        {exportingExcel ? "Exportando..." : "Exportar Excel"}
                      </button>
                    )}
                    {activeTab !== "invoices" && (
                      <button onClick={() => openModal()} className="slim-btn slim-btn-primary">
                        Adicionar
                      </button>
                    )}
                  </div>
                }
              >
                <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: "var(--surface-bg)", border: "1px solid var(--surface-border)" }}>
                  {tabs.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                      style={activeTab === t.key
                        ? { background: "var(--primary-color)", color: "#fff", boxShadow: "0 2px 8px rgba(0,51,102,.25)" }
                        : { color: "var(--text-muted)" }}
                    >
                      {t.icon}
                      <span className="hidden sm:inline">{t.label}</span>
                      {t.key !== "movements" && t.count !== undefined && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
                          style={activeTab === t.key
                            ? { background: "rgba(255,255,255,.25)", color: "#fff" }
                            : { background: "var(--surface-border)", color: "var(--text-muted)" }}>
                          {t.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-12 mb-2">
                  <Accordion className="col-span-12" defaultOpenId="filter">
                    <AccordionItem id="filter">
                      <AccordionTrigger
                        clickHeader={() => setFilterOpened(!filterOpened)}
                        icon={queryStr ? <MdFilterAlt size={15} /> : <MdFilterAltOff size={15} />}
                        subtitle=""
                      >
                        Filtros
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-12 gap-3">

                          {activeTab === "movements" && (
                            <>
                              <div className="flex flex-col col-span-12 sm:col-span-3 mb-2">
                                <label className="label slim-label-primary">Beneficiário</label>
                                <input {...register("search")} type="text" className="input slim-input-primary" placeholder="Nome..." />
                              </div>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">CPF</label>
                                <input {...register("cpf")} type="text" className="input slim-input-primary" placeholder="000.000.000-00" />
                              </div>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Sexo</label>
                                <select {...register("gender")} className="select slim-select-primary">
                                  <option value="">Todos</option>
                                  <option value="Masculino">Masculino</option>
                                  <option value="Feminino">Feminino</option>
                                  <option value="Outros">Outros</option>
                                </select>
                              </div>
                              <div className="flex flex-col col-span-6 sm:col-span-1 mb-2">
                                <label className="label slim-label-primary">Idade de</label>
                                <input {...register("ageFrom")} type="number" min="0" max="120" className="input slim-input-primary" placeholder="0" />
                              </div>
                              <div className="flex flex-col col-span-6 sm:col-span-1 mb-2">
                                <label className="label slim-label-primary">Até</label>
                                <input {...register("ageTo")} type="number" min="0" max="120" className="input slim-input-primary" placeholder="120" />
                              </div>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Status</label>
                                <select {...register("active")} className="select slim-select-primary">
                                  <option value="">Todos</option>
                                  <option value="true">Ativo</option>
                                  <option value="false">Inativo</option>
                                </select>
                              </div>
                              <div className="flex flex-col col-span-12 sm:col-span-3 mb-2">
                                <label className="label slim-label-primary">Programa (Plano)</label>
                                <select {...register("planId")} className="select slim-select-primary">
                                  <option value="">Todos</option>
                                  {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                              </div>
                              <div className="flex flex-col col-span-12 sm:col-span-3 mb-2">
                                <label className="label slim-label-primary">Módulo de Serviço</label>
                                <select {...register("serviceModuleId")} className="select slim-select-primary">
                                  <option value="">Todos</option>
                                  {serviceModules.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                              </div>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Cadastro — início</label>
                                <input {...register("gte$createdAt")} type="date" className="input slim-input-primary" />
                              </div>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Cadastro — fim</label>
                                <input {...register("lte$createdAt")} type="date" className="input slim-input-primary" />
                              </div>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Vigência — início</label>
                                <input {...register("gte$effectiveDate")} type="date" className="input slim-input-primary" />
                              </div>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Vigência — fim</label>
                                <input {...register("lte$effectiveDate")} type="date" className="input slim-input-primary" />
                              </div>
                            </>
                          )}

                          {activeTab === "invoices" && (
                            <>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Mês</label>
                                <select {...register("referenceMonth")} className="select slim-select-primary">
                                  <option value="">Todos</option>
                                  {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                </select>
                              </div>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Ano</label>
                                <input {...register("referenceYear")} type="number" className="input slim-input-primary" placeholder={String(new Date().getFullYear())} />
                              </div>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Status</label>
                                <select {...register("status")} className="select slim-select-primary">
                                  <option value="">Todos</option>
                                  <option value="Aberta">Aberta</option>
                                  <option value="Fechada">Fechada</option>
                                  <option value="Paga">Paga</option>
                                  <option value="Cancelada">Cancelada</option>
                                </select>
                              </div>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Data — início</label>
                                <input {...register("gte$createdAt")} type="date" className="input slim-input-primary" />
                              </div>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Data — fim</label>
                                <input {...register("lte$createdAt")} type="date" className="input slim-input-primary" />
                              </div>
                            </>
                          )}

                          {activeTab === "attachments" && (
                            <>
                              <div className="flex flex-col col-span-12 sm:col-span-4 mb-2">
                                <label className="label slim-label-primary">Busca rápida</label>
                                <input {...register("search")} type="text" className="input slim-input-primary" placeholder="Nome do anexo..." />
                              </div>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Data — início</label>
                                <input {...register("gte$createdAt")} type="date" className="input slim-input-primary" />
                              </div>
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Data — fim</label>
                                <input {...register("lte$createdAt")} type="date" className="input slim-input-primary" />
                              </div>
                            </>
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

                <DataTable
                  isAction={activeTab === "attachments"}
                  classContainer={`${filterOpened ? "max-h-[calc(100dvh-(var(--height-header)+23rem))]" : "max-h-[calc(100dvh-(var(--height-header)+16rem))]"}`}
                  columns={columns}
                >
                  <>
                    {pagination.data.map((x: any, i: number) => (
                      <tr className="slim-tr" key={i}>
                        {columns.map((col) => (
                          col.key.toLowerCase() !== "ações" && (
                            <td className="px-4 py-3 text-left text-sm font-medium tracking-wider" key={col.key}>
                              {renderCell(x, col)}
                            </td>
                          )
                        ))}
                        {activeTab === "attachments" && (
                          <td className="text-center">
                            <div className="flex justify-center gap-2">
                              <IconDelete obj={x} getObj={openModalDelete} />
                              <IconView link={x.uri} />
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </>
                </DataTable>
                <NotData />
              </SlimContainer>
            </div>

            {/* ── Modais ────────────────────────────────────────────────── */}
            {/* item 2: ModalB2BMassMovement agora tem aba de importação + cadastro manual */}
            <ModalB2BMassMovement
              isOpen={modalMovement}
              typeModal={typeModal}
              body={currentBody}
              customers={customers}
              onClose={closeModal}
              onSuccess={handleSuccess}
            />
            <ModalB2BInvoice
              isOpen={modalInvoice}
              typeModal={typeModal}
              body={currentBody}
              customers={customers}
              onClose={closeModal}
              onSuccess={handleSuccess}
            />
            <ModalB2BAttachment
              isOpen={modalAttachment}
              typeModal={typeModal}
              body={currentBody}
              customers={customers}
              onClose={closeModal}
              onSuccess={handleSuccess}
            />
            <ModalDelete
              title="Excluir registro"
              isOpen={modalDelete}
              setIsOpen={() => setModalDelete(modal)}
              onClose={() => setModalDelete(false)}
              onSelectValue={destroy}
            />
          </main>
        </>
      ) : <></>}
    </>
  );
}
