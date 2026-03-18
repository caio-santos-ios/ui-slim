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
import { HiOutlineDocumentReport } from "react-icons/hi";
import { TB2BMassMovement, TB2BInvoice, TB2BAttachment } from "@/types/b2bPanel/b2bPanel.type";
import { ModalB2BMassMovement } from "@/components/B2BPanel/Modal/ModalMassMovement";
import { ModalB2BAttachment, ModalB2BInvoice } from "@/components/B2BPanel/Modal/ModalInvoiceAndAttachment";

// ─── Abas principais ─────────────────────────────────────────────────────────
type TTab = "movements" | "invoices" | "attachments";

// ─── Colunas ──────────────────────────────────────────────────────────────────
const movementColumns = [
  { key: "name",        title: "Beneficiário" },
  { key: "cpf",         title: "CPF" },
  { key: "active",      title: "Status" },
  { key: "planName",    title: "Programa" },
  { key: "dateOfBirth", title: "Data de nascimento" },
];

const invoiceColumns = [
  { key: "customerName",     title: "Contratante" },
  { key: "referenceMonth",   title: "Mês/Ano" },
  { key: "beneficiaryCount", title: "Beneficiários" },
  { key: "totalAmount",      title: "Valor Total" },
  { key: "status",           title: "Status" },
  { key: "dueDate",          title: "Vencimento" },
];

const attachmentColumns = [
  { key: "customerName", title: "Contratante" },
  { key: "name",         title: "Nome" },
  { key: "fileType",     title: "Tipo" },
  { key: "required",     title: "Obrigatório" },
  { key: "createdAt",    title: "Data" },
];

const reportColumns = [
  { key: "customerName", title: "Contratante" },
  { key: "department",   title: "Departamento" },
  { key: "role",         title: "Função" },
  { key: "period",       title: "Período" },
  { key: "status",       title: "Status" },
];

// ─── Filtro ───────────────────────────────────────────────────────────────────
type TFilter = {
  search:          string;
  "gte$createdAt": string;
  "lte$createdAt": string;
  status:          string;
  type:            string;
  customerId:      string;
  department:      string;
  period:          string;
};

const ResetFilter: TFilter = {
  search:          "",
  "gte$createdAt": "",
  "lte$createdAt": "",
  status:          "",
  type:            "",
  customerId:      "",
  department:      "",
  period:          "",
};

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ value }: { value: any }) => {
  const map: Record<string, any> = {
    Ativo:      "bg-green-100 text-green-800 border-green-200",
    Inativo:    "bg-red-100 text-red-800 border-red-200",
    Pendente:   "bg-yellow-100 text-yellow-800 border-yellow-200",
    Processado: "bg-green-100 text-green-800 border-green-200",
    Erro:       "bg-red-100 text-red-800 border-red-200",
    Aberta:     "bg-blue-100 text-blue-800 border-blue-200",
    Fechada:    "bg-gray-100 text-gray-700 border-gray-200",
    Paga:       "bg-green-100 text-green-800 border-green-200",
    Cancelada:  "bg-red-100 text-red-800 border-red-200",
    Gerado:     "bg-green-100 text-green-800 border-green-200",
    Enviado:    "bg-blue-100 text-blue-800 border-blue-200",
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
  const [exportingExcel, setExportingExcel] = useState(false);
  const [summary, setSummary]           = useState<TSummary>({ movements: 0, invoices: 0, attachments: 0, pendingMovements: 0 });

  const [modalMovement,   setModalMovement]   = useState(false);
  const [modalInvoice,    setModalInvoice]    = useState(false);
  const [modalAttachment, setModalAttachment] = useState(false);

  const { register, reset, getValues } = useForm<TFilter>({ defaultValues: ResetFilter });

  const uriMap: Record<TTab, string> = {
    movements:   "b2b-mass-movements",
    invoices:    "b2b-invoices",
    attachments: "b2b-attachments",
    // reports:     "b2b-mass-movements",
  };

  // ── Listagem ───────────────────────────────────────────────────────────────
  const getAll = async (query: string = "") => {
    try {
      setLoading(true);
      const uri = uriMap[activeTab];
      const { data } = await api.get(`/${uri}?deleted=false&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=1${query}`, configApi());
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

  const getRecipient = async (query: string = "") => {
    try {
      setLoading(true);
      const { data } = await api.get(`/customer-recipients/manager-panel?deleted=false&orderBy=name&sort=asc&pageSize=10&pageNumber=1${query}`, configApi());
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

  const exportExcel = async () => {
    try {
      setExportingExcel(true);

      const { data } = await api.get(
        `/customer-recipients/manager-panel?deleted=false&orderBy=name&sort=asc&pageSize=99999&pageNumber=1${queryStr}`,
        configApi()
      );
      const rows: any[] = data.result.data ?? [];

      const sheetData = rows.map((r) => ({
        "Beneficiário":       r.name ?? "",
        "CPF":                r.cpf ?? "",
        "Status":             r.active ? "Ativo" : "Inativo",
        "Programa":           r.planName ?? "",
        "Data de Nascimento": r.dateOfBirth ? maskDate(r.dateOfBirth) : "",
        "E-mail":             r.email ?? "",
        "Telefone":           r.phone ?? "",
        "WhatsApp":           r.whatsapp ?? "",
        "Departamento":       r.department ?? "",
        "Função":             r.role ?? "",
        "Vínculo":            r.bond ?? "",
        "CEP":                r?.address?.zipCode ?? "",
        "Número":             r?.address?.number ?? "",
        "Rua":                r?.address?.street ?? "",
        "Complemento":        r?.address?.complement ?? "",
        "Bairro":             r?.address?.neighborhood ?? "",
        "Cidade":             r?.address?.city ?? "",
        "Estado":             r?.address?.state ?? ""
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
      const [mov, inv, att] = await Promise.all([
        api.get(`/b2b-mass-movements?deleted=false&pageSize=1&pageNumber=1`, configApi()),
        api.get(`/b2b-invoices?deleted=false&pageSize=1&pageNumber=1`, configApi()),
        api.get(`/b2b-attachments?deleted=false&pageSize=1&pageNumber=1`, configApi()),
      ]);
      const pending = await api.get(`/b2b-mass-movements?deleted=false&status=Pendente&pageSize=1&pageNumber=1`, configApi());
      setSummary({
        movements:        mov.data.result.totalCount,
        invoices:         inv.data.result.totalCount,
        attachments:      att.data.result.totalCount,
        pendingMovements: pending.data.result.totalCount,
      });
    } catch {}
  };

  const loadCustomers = async () => {
    try {
      const { data } = await api.get(`/customers?deleted=false&type=B2B&orderBy=corporateName&sort=asc&pageSize=200&pageNumber=1`, configApi());
      setCustomers(data.result.data ?? []);
    } catch {}
  };

  const buildQuery = (values: TFilter): string => {
    let q = "";
    if (values.search)           q += `&regex$or$customerName=${values.search}`;
    if (values["gte$createdAt"]) q += `&gte$createdAt=${values["gte$createdAt"]}`;
    if (values["lte$createdAt"]) q += `&lte$createdAt=${values["lte$createdAt"]}`;
    if (values.status)           q += `&status=${values.status}`;
    if (values.type)             q += `&type=${values.type}`;
    if (values.customerId)       q += `&customerId=${values.customerId}`;
    if (values.department)       q += `&regex$department=${values.department}`;
    if (values.period)           q += `&period=${values.period}`;
    return q;
  };

  const onSubmit = async () => {
    const q = buildQuery(getValues());
    setQueryStr(q);
    if (activeTab === "movements") {
      await getRecipient(q);
    } else {
      await getAll(q);
    }
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
    if (activeTab === "attachments") return attachmentColumns;
    return reportColumns;
  }, [activeTab]);

  const renderCell = (x: any, col: { key: string; title: string }) => {
    const v = x[col.key];
    if (["createdAt", "dueDate", "paidAt", "dateOfBirth"].includes(col.key)) return maskDate(v);
    if (col.key === "totalAmount")    return convertNumberMoney(v);
    if (col.key === "active")         return <StatusBadge value={v ? "Ativo" : "Inativo"} />;
    if (col.key === "required")       return v ? <span className="text-green-600 font-semibold">Sim</span> : <span className="text-gray-400">Não</span>;
    if (col.key === "referenceMonth") return `${String(x.referenceMonth).padStart(2, "0")}/${x.referenceYear}`;
    if (col.key === "type") {
      const map: Record<string, string> = {
        Inclusao:         "Inclusão",
        Exclusao:         "Exclusão",
        UpgradePrograma:  "Upgrade",
        DowngradePrograma:"Downgrade",
      };
      return map[v] ?? v;
    }
    return v;
  };

  useEffect(() => {
    loadCustomers();
    loadSummary();
  }, []);

  useEffect(() => {
    reset(ResetFilter);
    setQueryStr("");
    if (activeTab === "movements") {
      getRecipient();
    } else {
      getAll();
    }
  }, [activeTab]);

  const tabs: { key: TTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "movements",   label: "Movimentação de Massa", icon: <FiUsers size={15} />,             count: summary.movements },
    { key: "invoices",    label: "Painel de Faturas",     icon: <MdOutlineReceipt size={15} />,    count: summary.invoices },
    { key: "attachments", label: "Anexos",                icon: <MdOutlineAttachFile size={15} />, count: summary.attachments },
    // { key: "reports",     label: "Relatórios",            icon: <HiOutlineDocumentReport size={15} /> },
  ];

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
                      <button
                        onClick={exportExcel}
                        disabled={exportingExcel}
                        className="slim-btn slim-btn-primary-light flex items-center gap-1.5"
                      >
                        <FiDownload size={14} />
                        {exportingExcel ? "Exportando..." : "Exportar Excel"}
                      </button>
                    )}
                    <button onClick={() => openModal()} className="slim-btn slim-btn-primary">
                      Adicionar
                    </button>
                  </div>
                }
              >
                {/* ── Summary Cards ─────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Movimentações", value: summary.movements,       color: "var(--primary-color)" },
                    { label: "Faturas",        value: summary.invoices,         color: "#3b82f6" },
                    { label: "Anexos",         value: summary.attachments,      color: "#8b5cf6" },
                    { label: "Mov. Pendentes", value: summary.pendingMovements, color: "#f59e0b" },
                  ].map((c) => (
                    <div
                      key={c.label}
                      className="rounded-xl p-4 flex flex-col gap-1"
                      style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)" }}
                    >
                      <span className="text-xs text-[var(--text-muted)] font-medium">{c.label}</span>
                      <span className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</span>
                    </div>
                  ))}
                </div>

                {/* ── Tabs ──────────────────────────────────────────────── */}
                <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: "var(--surface-bg)", border: "1px solid var(--surface-border)" }}>
                  {tabs.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                      style={
                        activeTab === t.key
                          ? { background: "var(--primary-color)", color: "#fff", boxShadow: "0 2px 8px rgba(0,51,102,.25)" }
                          : { color: "var(--text-muted)" }
                      }
                    >
                      {t.icon}
                      <span className="hidden sm:inline">{t.label}</span>
                      {t.count !== undefined && (
                        <span
                          className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
                          style={
                            activeTab === t.key
                              ? { background: "rgba(255,255,255,.25)", color: "#fff" }
                              : { background: "var(--surface-border)", color: "var(--text-muted)" }
                          }
                        >
                          {t.count}
                        </span>
                      )}
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

                          <div className="flex flex-col col-span-12 sm:col-span-4 mb-2">
                            <label className="label slim-label-primary">Busca rápida</label>
                            <input {...register("search")} type="text" className="input slim-input-primary" placeholder="Busca rápida..." />
                          </div>

                          <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                            <label className="label slim-label-primary">Data — início</label>
                            <input {...register("gte$createdAt")} type="date" className="input slim-input-primary" />
                          </div>

                          <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                            <label className="label slim-label-primary">Data — fim</label>
                            <input {...register("lte$createdAt")} type="date" className="input slim-input-primary" />
                          </div>

                          {(activeTab === "movements" || activeTab === "invoices") && (
                            <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                              <label className="label slim-label-primary">Status</label>
                              <select className="select slim-select-primary" {...register("status")}>
                                <option value="">Todos</option>
                                {activeTab === "movements" && <>
                                  <option value="Pendente">Pendente</option>
                                  <option value="Processado">Processado</option>
                                  <option value="Erro">Erro</option>
                                </>}
                                {activeTab === "invoices" && <>
                                  <option value="Aberta">Aberta</option>
                                  <option value="Fechada">Fechada</option>
                                  <option value="Paga">Paga</option>
                                  <option value="Cancelada">Cancelada</option>
                                </>}
                              </select>
                            </div>
                          )}

                          {/* {activeTab === "movements" && (
                            <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                              <label className="label slim-label-primary">Tipo</label>
                              <select className="select slim-select-primary" {...register("type")}>
                                <option value="">Todos</option>
                                <option value="Inclusao">Inclusão</option>
                                <option value="Exclusao">Exclusão</option>
                                <option value="UpgradePrograma">Upgrade de Programa</option>
                                <option value="DowngradePrograma">Downgrade de Programa</option>
                              </select>
                            </div>
                          )} */}

                          <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                            <label className="label slim-label-primary">Departamento</label>
                            <input {...register("department")} type="text" className="input slim-input-primary" placeholder="Ex: RH" />
                          </div>
                          {/* <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                            <label className="label slim-label-primary">Período</label>
                            <select className="select slim-select-primary" {...register("period")}>
                              <option value="">Todos</option>
                              <option value="Manha">Manhã</option>
                              <option value="Tarde">Tarde</option>
                              <option value="Noite">Noite</option>
                            </select>
                          </div> */}

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
                <DataTable isAction={false} classContainer="max-h-[calc(100dvh-(var(--height-header)+18rem))]" columns={columns}>
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
                      </tr>
                    ))}
                  </>
                </DataTable>
                <NotData />
              </SlimContainer>
            </div>

            {/* ── Modais ────────────────────────────────────────────────── */}
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