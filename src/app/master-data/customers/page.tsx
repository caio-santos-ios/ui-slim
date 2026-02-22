"use client";

import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveParamsRequest, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { maskDate } from "@/utils/mask.util";
import { Autorization } from "@/components/Global/Autorization";
import { Header } from "@/components/Global/Header";
import { SideMenu } from "@/components/Global/SideMenu";
import { SlimContainer } from "@/components/Global/SlimContainer";
import DataTable from "@/components/Global/Table";
import { NotData } from "@/components/Global/NotData";
import { ModalDelete } from "@/components/Global/ModalDelete";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { convertNumberMoney } from "@/utils/convert.util";
import { ModalCustomer } from "@/components/MasterData/Customer/Modal";
import { modalAtom } from "@/jotai/global/modal.jotai";
import { IconEdit } from "@/components/Global/IconEdit";
import { IconDelete } from "@/components/Global/IconDelete";
import { permissionCreate, permissionDelete, permissionRead, permissionUpdate } from "@/utils/permission.util";
import { ModalUpdateStatus } from "@/components/MasterData/Customer/ModalUpdateStatus";
import { useForm } from "react-hook-form";
import { ModalEditRecipient } from "@/components/MasterData/Customer/ModalEditRecipient";
import { FiEdit2 } from "react-icons/fi";
import { IoSearch } from "react-icons/io5";
import { MdFilterAlt, MdFilterAltOff } from "react-icons/md";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/Global/Accordion/AccordionContent";
import { TPlan } from "@/types/masterData/plans/plans.type";
import { TServiceModule } from "@/types/masterData/serviceModules/serviceModules.type";

/* ─── Colunas ───────────────────────────────── */
const columns1: { key: string; title: string }[] = [
  { key: "corporateName",  title: "Contratante" },
  { key: "document",       title: "CNPJ/CPF" },
  { key: "type",           title: "Tipo de Cliente" },
  { key: "effectiveDate",  title: "Data da Vigência" },
  { key: "createdAt",      title: "Data de Cadastro" },
];

const columns2: { key: string; title: string }[] = [
  { key: "createdAt",     title: "Data de Cadastro" },
  { key: "code",          title: "ID" },
  { key: "name",          title: "Beneficiário" },
  { key: "cpf",           title: "CPF" },
  { key: "typePlan",      title: "Tipo de Plano" },
  { key: "planName",      title: "Plano" },
  { key: "active",        title: "Status" },
  { key: "effectiveDate", title: "Data da Vigência" },
  { key: "bond",          title: "Vínculo" },
];

/* ─── Tipo do formulário de filtro ──────────── */
type TCustomerFilter = {
  // busca rápida
  search: string;

  // datas
  "gte$createdAt":      string;
  "lte$createdAt":      string;
  "gte$effectiveDate":  string;
  "lte$effectiveDate":  string;

  // status / vínculo / gênero
  active:  string;
  bond:    string;
  gender:  string;

  // região
  state:        string;
  city:         string;
  neighborhood: string;

  // plano e módulo
  planId:          string;
  serviceModuleId: string;

  // idade
  ageFrom: string;
  ageTo:   string;
};

const ResetFilter: TCustomerFilter = {
  search:           "",
  "gte$createdAt":  "",
  "lte$createdAt":  "",
  "gte$effectiveDate": "",
  "lte$effectiveDate": "",
  active:           "",
  bond:             "",
  gender:           "",
  state:            "",
  city:             "",
  neighborhood:     "",
  planId:           "",
  serviceModuleId:  "",
  ageFrom:          "",
  ageTo:            "",
};

/* ─────────────────────────────────────────────
  Página
───────────────────────────────────────────── */
export default function Customer() {
  const [_, setLoading]             = useAtom(loadingAtom);
  const [modal, setModal]           = useAtom(modalAtom);
  const [userLogger]                = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom);

  /* Estado geral */
  const [modalDelete, setModalDelete]               = useState<boolean>(false);
  const [modalUpdateStatus, setModalUpdateStatus]   = useState<boolean>(false);
  const [typeModal, setTypeModal]                   = useState<"create" | "edit">("create");
  const [id, setId]                                 = useState<string>("");
  const [id2, setId2]                               = useState<string>("");
  const [currentBody, setCurrentBody]               = useState<any>({});
  const [vision, setVision]                         = useState<string>("contractor");
  const [columns, setCollumns]                      = useState<any[]>(columns1);
  const [queryStr, setQueryStr]                     = useState<string>("");

  /* Selects dos filtros */
  const [plans, setPlans]               = useState<TPlan[]>([]);
  const [serviceModules, setServiceModules] = useState<TServiceModule[]>([]);

  /* Modal isolado de edição de beneficiário */
  const [modalEditRecipient, setModalEditRecipient] = useState<boolean>(false);
  const [editRecipientId, setEditRecipientId]       = useState<string>("");
  const [editContractorType, setEditContractorType] = useState<string>("");

  const { register, handleSubmit, reset, getValues } = useForm<TCustomerFilter>({
    defaultValues: ResetFilter,
  });

  /* ── Listagem ── */
  const getAll = async (uri: string = "customers", query: string = "") => {
    try {
      setLoading(true);
      const orderBy = uri === "customers" ? "corporateName" : "name";
      const { data } = await api.get(
        `/${uri}?deleted=false&orderBy=${orderBy}&sort=asc&pageSize=10&pageNumber=${pagination.currentPage}${query}`,
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

  /* ── Montar query a partir do formulário ── */
  const buildQuery = (values: TCustomerFilter): string => {
    let q = "";

    if (values.search) {
      if (vision === "contractor") {
        q += `&regex$or$corporateName=${values.search}&regex$or$document=${values.search}&regex$or$type=${values.search}`;
      } else {
        q += `&regex$or$code=${values.search}&regex$or$name=${values.search}&regex$or$cpf=${values.search}`;
      }
    }

    // datas de cadastro
    if (values["gte$createdAt"])     q += `&gte$createdAt=${values["gte$createdAt"]}`;
    if (values["lte$createdAt"])     q += `&lte$createdAt=${values["lte$createdAt"]}`;

    // datas de vigência
    if (values["gte$effectiveDate"]) q += `&gte$effectiveDate=${values["gte$effectiveDate"]}`;
    if (values["lte$effectiveDate"]) q += `&lte$effectiveDate=${values["lte$effectiveDate"]}`;

    // só beneficiários
    if (vision === "recipient") {
      if (values.active !== "")      q += `&active=${values.active}`;
      if (values.bond)               q += `&bond=${values.bond}`;
      if (values.gender)             q += `&gender=${values.gender}`;
      if (values.planId)             q += `&planId=${values.planId}`;
      if (values.serviceModuleId)    q += `&serviceModuleId=${values.serviceModuleId}`;
      if (values.state)              q += `&regex$address.state=${values.state}`;
      if (values.city)               q += `&regex$address.city=${values.city}`;
      if (values.neighborhood)       q += `&regex$address.neighborhood=${values.neighborhood}`;

      // idade → convertida para dateOfBirth
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

    return q;
  };

  /* ── Submit do filtro ── */
  const onSubmit = async () => {
    const q = buildQuery(getValues());
    setQueryStr(q);
    await getAll(vision === "recipient" ? "customer-recipients" : "customers", q);
  };

  /* ── Selects auxiliares ── */
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

  /* ── Abrir modal de contratante ── */
  const openModal = (action: "create" | "edit" = "create", body?: any) => {
    if (body) {
      setCurrentBody({ ...body });
      setId(vision === "contractor" ? body.id : body.contractorId);
    }
    setTypeModal(action);
    setModal(true);
  };

  /* ── Modal isolado de beneficiário ── */
  const openEditRecipient = (body: any) => {
    setEditRecipientId(body.id);
    setEditContractorType(body.typePlan ?? "");
    setModalEditRecipient(true);
  };

  const handleRecipientSuccess = async () => {
    await getAll("customer-recipients", queryStr);
  };

  /* ── Status ── */
  const updateStatus = async (id: string) => {
    try {
      await api.put(`/customer-recipients/alter-status`, { id, justification: "" }, configApi());
      await getAll("customer-recipients");
    } catch (error) {
      resolveResponse(error);
    }
  };

  const openModalUpdateStatus = async (body: any) => {
    if (body.active) {
      setId2(body.id);
      setModalUpdateStatus(true);
    } else {
      await updateStatus(body.id);
    }
  };

  /* ── Excluir ── */
  const openModalDelete = (body: any) => {
    setCurrentBody(body);
    setModalDelete(true);
  };

  const destroy = async () => {
    try {
      const uri = vision === "contractor" ? "customers" : "customer-recipients";
      const { status } = await api.delete(`/${uri}/${currentBody?.id}`, configApi());
      resolveResponse({ status, message: "Excluído com sucesso" });
      setModalDelete(false);
      resetModal();
      await getAll(uri);
    } catch (error) {
      resolveResponse(error);
    }
  };

  /* ── Alternar visão ── */
  const checked = async () => {
    const newVision = vision === "contractor" ? "recipient" : "contractor";
    setVision(newVision);
    setCollumns(newVision === "recipient" ? columns2 : columns1);
    reset(ResetFilter);
    setQueryStr("");
    await getAll(newVision === "recipient" ? "customer-recipients" : "customers");
  };

  /* ── Callback modal contratante ── */
  const handleReturnModal = async (isSuccess: boolean, id: string) => {
    setId(id);
    if (isSuccess) {
      setTypeModal("edit");
      await getAll(vision === "contractor" ? "customers" : "customer-recipients");
      setModalUpdateStatus(false);
    }
  };

  const resetModal = () => {
    setCurrentBody({});
    setModal(false);
    setModalUpdateStatus(false);
    setId("");
  };

  const nomalizeTypePlan = (typePlan: string) => typePlan || "Empresarial";

  useEffect(() => {
    if (permissionRead("1", "A12")) {
      loadPlans();
      loadServiceModules();
      getAll();
    }
  }, []);

  /* ─────────────────────────────────────────────
    RENDER
  ───────────────────────────────────────────── */
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
                menu="Cadastros"
                breadcrump="Clientes"
                breadcrumpIcon="MdPerson"
                buttons={
                  <>
                    {permissionUpdate("1", "A12") && (
                      <div className="flex items-center gap-2">
                        <span
                          className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{
                            background: vision === "contractor"
                              ? "rgba(0,51,102,.08)"
                              : "rgba(102,204,153,.12)",
                            color: vision === "contractor"
                              ? "var(--primary-color)"
                              : "#3a9e72",
                            border: vision === "contractor"
                              ? "1px solid rgba(0,51,102,.15)"
                              : "1px solid rgba(102,204,153,.3)",
                          }}
                        >
                          {vision === "contractor" ? "Contratante" : "Beneficiário"}
                        </span>
                        <label className="slim-switch" title="Alternar visão">
                          <input onChange={async () => checked()} type="checkbox" />
                          <span className="slider-default"></span>
                        </label>
                      </div>
                    )}
                    {permissionCreate("1", "A12") && vision === "contractor" && (
                      <button onClick={() => openModal()} className="slim-btn slim-btn-primary">
                        Adicionar
                      </button>
                    )}
                  </>
                }
              >

                {/* ══════════════════════════════════════════════
                    ACCORDION DE FILTROS
                ══════════════════════════════════════════════ */}
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

                          {/* ── Busca rápida ─────────────────────── */}
                          <div className="flex flex-col col-span-12 sm:col-span-4 mb-2">
                            <label className="label slim-label-primary">Busca rápida</label>
                            <input
                              {...register("search")}
                              type="text"
                              className="input slim-input-primary"
                              placeholder={vision === "contractor" ? "Nome, CNPJ/CPF, tipo..." : "Nome, CPF, código..."}
                            />
                          </div>

                          {/* ── Data de cadastro ─────────────────── */}
                          <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                            <label className="label slim-label-primary">Cadastro — início</label>
                            <input {...register("gte$createdAt")} type="date" className="input slim-input-primary" />
                          </div>
                          <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                            <label className="label slim-label-primary">Cadastro — fim</label>
                            <input {...register("lte$createdAt")} type="date" className="input slim-input-primary" />
                          </div>

                          {/* ── Data de vigência ─────────────────── */}
                          <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                            <label className="label slim-label-primary">Vigência — início</label>
                            <input {...register("gte$effectiveDate")} type="date" className="input slim-input-primary" />
                          </div>
                          <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                            <label className="label slim-label-primary">Vigência — fim</label>
                            <input {...register("lte$effectiveDate")} type="date" className="input slim-input-primary" />
                          </div>

                          {/* ── Filtros exclusivos de beneficiário ─ */}
                          {vision === "recipient" && (
                            <>
                              {/* Status */}
                              <div className="flex flex-col col-span-6 sm:col-span-3 mb-2">
                                <label className="label slim-label-primary">Status</label>
                                <select className="select slim-select-primary" {...register("active")}>
                                  <option value="">Todos</option>
                                  <option value="true">Ativo</option>
                                  <option value="false">Inativo</option>
                                </select>
                              </div>

                              {/* Vínculo */}
                              <div className="flex flex-col col-span-6 sm:col-span-3 mb-2">
                                <label className="label slim-label-primary">Vínculo</label>
                                <select className="select slim-select-primary" {...register("bond")}>
                                  <option value="">Todos</option>
                                  <option value="Titular">Titular</option>
                                  <option value="Dependente">Dependente</option>
                                </select>
                              </div>

                              {/* Gênero */}
                              <div className="flex flex-col col-span-6 sm:col-span-3 mb-2">
                                <label className="label slim-label-primary">Gênero</label>
                                <select className="select slim-select-primary" {...register("gender")}>
                                  <option value="">Todos</option>
                                  <option value="Feminino">Feminino</option>
                                  <option value="Masculino">Masculino</option>
                                  <option value="Outros">Outros</option>
                                </select>
                              </div>

                              {/* Plano */}
                              <div className="flex flex-col col-span-6 sm:col-span-3 mb-2">
                                <label className="label slim-label-primary">Plano</label>
                                <select className="select slim-select-primary" {...register("planId")}>
                                  <option value="">Todos</option>
                                  {plans.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Módulo de serviço */}
                              <div className="flex flex-col col-span-6 sm:col-span-3 mb-2">
                                <label className="label slim-label-primary">Módulo de Serviço</label>
                                <select className="select slim-select-primary" {...register("serviceModuleId")}>
                                  <option value="">Todos</option>
                                  {serviceModules.map((m: any) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Região — Estado */}
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Estado(s)</label>
                                <input
                                  {...register("state")}
                                  type="text"
                                  className="input slim-input-primary"
                                  placeholder="Ex: SP, RJ"
                                />
                              </div>

                              {/* Região — Cidade */}
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Cidade(s)</label>
                                <input
                                  {...register("city")}
                                  type="text"
                                  className="input slim-input-primary"
                                  placeholder="Ex: São Paulo"
                                />
                              </div>

                              {/* Região — Bairro */}
                              <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                                <label className="label slim-label-primary">Bairro(s)</label>
                                <input
                                  {...register("neighborhood")}
                                  type="text"
                                  className="input slim-input-primary"
                                  placeholder="Ex: Centro"
                                />
                              </div>

                              {/* Idade de */}
                              <div className="flex flex-col col-span-6 sm:col-span-1 mb-2">
                                <label className="label slim-label-primary">Idade de</label>
                                <input
                                  {...register("ageFrom")}
                                  type="number"
                                  min="0"
                                  max="120"
                                  className="input slim-input-primary"
                                  placeholder="0"
                                />
                              </div>

                              {/* Idade até */}
                              <div className="flex flex-col col-span-6 sm:col-span-1 mb-2">
                                <label className="label slim-label-primary">Idade até</label>
                                <input
                                  {...register("ageTo")}
                                  type="number"
                                  min="0"
                                  max="120"
                                  className="input slim-input-primary"
                                  placeholder="120"
                                />
                              </div>
                            </>
                          )}

                          {/* ── Botão buscar ─────────────────────── */}
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
                {/* ════════════════════════════════════════════ */}

                <DataTable classContainer="max-h-[calc(100dvh-(var(--height-header)+13rem))]" columns={columns}>
                  <>
                    {pagination.data.map((x: any, i: number) => (
                      <tr
                        className={`slim-tr ${x.active ? "" : "bg-red-100 text-black"}`}
                        key={i}
                      >
                        {columns.map((col: any) => (
                          <td
                            className="px-4 py-3 text-left text-sm font-medium tracking-wider"
                            key={col.key}
                          >
                            {col.key === "createdAt" || col.key === "effectiveDate"
                              ? maskDate((x as any)[col.key])
                              : col.key === "typePlan"
                              ? nomalizeTypePlan(x.typePlan)
                              : col.key === "cost"
                              ? convertNumberMoney(x.cost)
                              : col.key === "active"
                              ? (
                                <div className="flex flex-col mb-2">
                                  <label
                                    className="slim-status-switch"
                                    title={!x.status ? `Inativado por: ${x?.userName ?? ""}` : undefined}
                                  >
                                    <input
                                      checked={x.active}
                                      onChange={() => openModalUpdateStatus(x)}
                                      type="checkbox"
                                    />
                                    <span className="slider"></span>
                                  </label>
                                </div>
                              )
                              : (x as any)[col.key]}
                          </td>
                        ))}

                        {/* ── Ações ── */}
                        <td className="text-center">
                          <div className="flex justify-center gap-2">
                            {permissionUpdate("1", "A12") && (
                              vision === "recipient" ? (
                                <button
                                  onClick={() => openEditRecipient(x)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] bg-[var(--surface-bg)] hover:bg-[var(--primary-color)] hover:text-white border border-[var(--surface-border)] hover:border-[var(--primary-color)] transition-all"
                                  style={{ padding: 0, minWidth: "2rem" }}
                                  title="Editar"
                                >
                                  <FiEdit2 size={13} />
                                </button>
                              ) : (
                                <IconEdit action="edit" obj={x} getObj={openModal} />
                              )
                            )}
                            {permissionDelete("1", "A12") && (
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

            {/* Modal de contratante */}
            <ModalCustomer
              title={typeModal === "create" ? "Inserir Cliente" : "Editar Cliente"}
              isOpen={modal}
              setIsOpen={() => setModal(modal)}
              onClose={resetModal}
              onSelectValue={handleReturnModal}
              id={id}
            />

            {/* Modal isolado de edição de beneficiário */}
            <ModalEditRecipient
              isOpen={modalEditRecipient}
              recipientId={editRecipientId}
              contractorType={editContractorType}
              onClose={() => {
                setModalEditRecipient(false);
                setEditRecipientId("");
              }}
              onSuccess={handleRecipientSuccess}
            />

            {/* Modal de atualização de status */}
            <ModalUpdateStatus
              isOpen={modalUpdateStatus}
              setIsOpen={() => setModalUpdateStatus(modalUpdateStatus)}
              onClose={resetModal}
              onSelectValue={handleReturnModal}
              id={id2}
            />

            {/* Modal de exclusão */}
            <ModalDelete
              title="Excluir Cliente"
              isOpen={modalDelete}
              setIsOpen={() => setModalDelete(modal)}
              onClose={() => setModalDelete(false)}
              onSelectValue={destroy}
            />
          </main>
        </>
      ) : (
        <></>
      )}
    </>
  );
}