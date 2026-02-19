"use client";

import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
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
import { ResetRecipientSearch, TRecipientSearch } from "@/types/masterData/customers/customerRecipient.type";
import { ModalEditRecipient } from "@/components/MasterData/Customer/ModalEditRecipient";
import { FiEdit2 } from "react-icons/fi";

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

/* ─────────────────────────────────────────────
   Página
───────────────────────────────────────────── */
export default function Customer() {
  const [_, setLoading]           = useAtom(loadingAtom);
  const [modal, setModal]         = useAtom(modalAtom);
  const [userLogger]              = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom);

  /* Estado geral */
  const [modalDelete, setModalDelete]           = useState<boolean>(false);
  const [modalUpdateStatus, setModalUpdateStatus] = useState<boolean>(false);
  const [typeModal, setTypeModal]               = useState<"create" | "edit">("create");
  const [id, setId]                             = useState<string>("");
  const [id2, setId2]                           = useState<string>("");
  const [currentBody, setCurrentBody]           = useState<any>({});
  const [vision, setVision]                     = useState<string>("contractor");
  const [columns, setCollumns]                  = useState<any[]>(columns1);
  const [queryStr, setQueryStr]                 = useState<string>("");
  const [queryDateStr, setQueryDateStr]         = useState<string>("");

  /* ── Modal isolado de edição de beneficiário ── */
  const [modalEditRecipient, setModalEditRecipient] = useState<boolean>(false);
  const [editRecipientId, setEditRecipientId]       = useState<string>("");
  const [editContractorType, setEditContractorType] = useState<string>("");

  const { register, watch } = useForm<TRecipientSearch>({
    defaultValues: ResetRecipientSearch,
  });

  /* ── Listagem ── */
  const getAll = async (
    uri: string = "customers",
    queryString: string = "",
    queryStringDate: string = ""
  ) => {
    try {
      const orderBy = uri === "customers" ? "corporateName" : "name";
      const { data } = await api.get(
        `/${uri}?deleted=false&orderBy=${orderBy}&sort=asc&pageSize=10&pageNumber=${pagination.currentPage}${queryString}${queryStringDate}`,
        configApi()
      );
      const result = data.result;
      setPagination({
        currentPage:  result.currentPage,
        data:         result.data,
        sizePage:     result.pageSize,
        totalPages:   result.totalCount,
      });
    } catch (error) {
      resolveResponse(error);
    }
  };

  /* ── Abrir modal de contratante (criar/editar) ── */
  const openModal = (action: "create" | "edit" = "create", body?: any) => {
    if (body) {
      setCurrentBody({ ...body });
      setId(vision === "contractor" ? body.id : body.contractorId);
    }
    setTypeModal(action);
    setModal(true);
  };

  /* ── Abrir modal isolado de beneficiário ── */
  const openEditRecipient = (body: any) => {
    setEditRecipientId(body.id);
    setEditContractorType(body.typePlan ?? "");
    setModalEditRecipient(true);
  };

  /* ── Após salvar beneficiário ── */
  const handleRecipientSuccess = async () => {
    await getAll("customer-recipients", queryStr, queryDateStr);
  };

  /* ── Status ── */
  const updateStatus = async (id: string) => {
    try {
      await api.put(`/customer-recipients/alter-status`, { id, justification: "" }, configApi());
      if (permissionRead("1", "A12")) {
        setLoading(true);
        await getAll("customer-recipients");
        setLoading(false);
      }
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
    await getAll(newVision === "recipient" ? "customer-recipients" : "customers");
  };

  /* ── Busca ── */
  const search = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const uri = vision === "contractor" ? "customers" : "customer-recipients";
    const firstSearch = value
      ? vision === "contractor"
        ? `&regex$or$corporateName=${value}&regex$or$document=${value}&regex$or$type=${value}`
        : `&regex$or$code=${value}&regex$or$name=${value}&regex$or$cpf=${value}&regex$or$_customer.typePlan=${value}&regex$or$_customer.type=${value}&regex$or$bond=${value}`
      : "";
    setQueryStr(firstSearch);
    await getAll(uri, firstSearch, queryDateStr);
  };

  /* ── Callback modal contratante ── */
  const handleReturnModal = async (isSuccess: boolean, id: string) => {
    setId(id);
    if (isSuccess) {
      setTypeModal("edit");
      const uri = vision === "contractor" ? "customers" : "customer-recipients";
      await getAll(uri);
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

  /* ── Filtro por datas ── */
  useEffect(() => {
    const startDate = watch("gte$effectiveDate");
    const endDate   = watch("lte$effectiveDate");
    let firstSearch = "";
    if (startDate) firstSearch += `&gte$effectiveDate=${startDate}`;
    if (endDate)   firstSearch += `&lte$effectiveDate=${endDate}`;
    setQueryDateStr(firstSearch);
    const uri = vision === "contractor" ? "customers" : "customer-recipients";
    getAll(uri, queryStr, firstSearch);
  }, [watch("gte$effectiveDate"), watch("lte$effectiveDate")]);

  useEffect(() => {
    if (permissionRead("1", "A12")) {
      setLoading(true);
      getAll();
      setLoading(false);
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

            <div className="slim-container-customer h-[calc(100dvh-22rem)] w-full">
              <SlimContainer
                breadcrump="Clientes"
                breadcrumpIcon="MdPerson"
                buttons={
                  <>
                    {permissionUpdate("1", "A12") && (
                      <div className="flex items-center gap-2">
                        {/* Badge de visão atual */}
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
                      <button
                        onClick={() => openModal()}
                        className="slim-btn slim-btn-primary"
                      >
                        Adicionar
                      </button>
                    )}
                  </>
                }
                inputSearch={
                  <>
                    {permissionRead("1", "A16") && (
                      <div className="grid grid-cols-4 gap-2">
                        <div className="flex flex-col col-span-2 mb-2">
                          <label className="label slim-label-primary">Busca rápida</label>
                          <input
                            onInput={(e: React.ChangeEvent<HTMLInputElement>) => search(e)}
                            className="input slim-input-primary"
                            type="text"
                            placeholder="Buscar..."
                          />
                        </div>
                        <div className="flex flex-col col-span-1 mb-2">
                          <label className="label slim-label-primary">Início Vigência</label>
                          <input {...register("gte$effectiveDate")} type="date" className="input slim-input-primary" />
                        </div>
                        <div className="flex flex-col col-span-1 mb-2">
                          <label className="label slim-label-primary">Fim Vigência</label>
                          <input {...register("lte$effectiveDate")} type="date" className="input slim-input-primary" />
                        </div>
                      </div>
                    )}
                  </>
                }
              >
                <DataTable columns={columns}>
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
                                /* Visão beneficiário → modal isolado */
                                <button
                                    onClick={() => openEditRecipient(x)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] bg-[var(--surface-bg)] hover:bg-[var(--primary-color)] hover:text-white border border-[var(--surface-border)] hover:border-[var(--primary-color)] transition-all"
                                    style={{ padding: 0, minWidth: "2rem" }}
                                    title="Editar"
                                >
                                    <FiEdit2 size={13} />
                                </button>
                              ) : (
                                /* Visão contratante → modal completo */
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

            {/* Modal de contratante (criar/editar completo) */}
            <ModalCustomer
              title={typeModal === "create" ? "Inserir Cliente" : "Editar Cliente"}
              isOpen={modal}
              setIsOpen={() => setModal(modal)}
              onClose={resetModal}
              onSelectValue={handleReturnModal}
              id={id}
            />

            {/* ── Modal isolado de edição de beneficiário ── */}
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