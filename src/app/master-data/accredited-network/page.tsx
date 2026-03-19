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
import { NotData } from "@/components/Global/NotData";
import { ModalDelete } from "@/components/Global/ModalDelete";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { convertNumberMoney } from "@/utils/convert.util";
import { modalAtom } from "@/jotai/global/modal.jotai";
import { IconEdit } from "@/components/Global/IconEdit";
import { IconDelete } from "@/components/Global/IconDelete";
import { ModalAccreditedNetwork } from "@/components/MasterData/AccreditedNetwork/Modal";
import { ResetAccreditedNetwork, TAccreditedNetwork } from "@/types/masterData/accreditedNetwork/accreditedNetwork.type";
import { permissionCreate, permissionDelete, permissionRead, permissionUpdate } from "@/utils/permission.util";
import { ModalUpdateStatus } from "@/components/MasterData/AccreditedNetwork/ModalUpdateStatus";
import { useForm } from "react-hook-form";
import { IoSearch } from "react-icons/io5";
import { MdFilterAlt, MdFilterAltOff } from "react-icons/md";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/Global/Accordion/AccordionContent";
import { TProcedure } from "@/types/masterData/procedure/procedure.type";

/* ─── Tipo do formulário de filtro ──────────── */
type TAccreditedNetworkFilter = {
  search: string;

  // datas
  "gte$createdAt":     string;
  "lte$createdAt":     string;
  "gte$effectiveDate": string;
  "lte$effectiveDate": string;

  // região
  state:        string;
  city:         string;
  neighborhood: string;

  // faixas de valor
  "gte$consumptionLimit": string;
  "lte$consumptionLimit": string;
  "gte$tradingTotal":     string;
  "lte$tradingTotal":     string;
};

const ResetFilter: TAccreditedNetworkFilter = {
  search:               "",
  "gte$createdAt":      "",
  "lte$createdAt":      "",
  "gte$effectiveDate":  "",
  "lte$effectiveDate":  "",
  state:                "",
  city:                 "",
  neighborhood:         "",
  "gte$consumptionLimit": "",
  "lte$consumptionLimit": "",
  "gte$tradingTotal":     "",
  "lte$tradingTotal":     "",
};

/* ─────────────────────────────────────────────
   Componente auxiliar: multi-select com badges
───────────────────────────────────────────── */
type TMultiSelectProps<T> = {
  label:       string;
  items:       T[];
  selected:    string[];
  onChange:    (ids: string[]) => void;
  getId:       (item: T) => string;
  getLabel:    (item: T) => string;
  placeholder: string;
};

function MultiSelect<T>({ label, items, selected, onChange, getId, getLabel, placeholder }: TMultiSelectProps<T>) {
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="label slim-label-primary">{label}</label>

      {/* Dropdown de seleção */}
      <select
        className="select slim-select-primary"
        value=""
        onChange={e => { if (e.target.value) toggle(e.target.value); }}
      >
        <option value="">{placeholder}</option>
        {items.map(item => {
          const id = getId(item);
          return (
            <option key={id} value={id} disabled={selected.includes(id)}>
              {getLabel(item)}
            </option>
          );
        })}
      </select>

      {/* Badges dos selecionados */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          {selected.map(id => {
            const item = items.find(i => getId(i) === id);
            if (!item) return null;
            return (
              <span
                key={id}
                className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full cursor-pointer"
                style={{
                  background: "var(--accent-color-light)",
                  color:      "var(--accent-color)",
                  border:     "1px solid rgba(102,204,153,.3)",
                }}
                onClick={() => toggle(id)}
                title="Clique para remover"
              >
                {getLabel(item)}
                <span className="text-[10px] opacity-70">✕</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Página principal
───────────────────────────────────────────── */
export default function AccreditedNetwork() {
  const [_, setLoading]             = useAtom(loadingAtom);
  const [modal, setModal]           = useAtom(modalAtom);
  const [userLogger]                = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom);

  const [modalDelete, setModalDelete]             = useState<boolean>(false);
  const [modalUpdateStatus, setModalUpdateStatus] = useState<boolean>(false);
  const [typeModal, setTypeModal]                 = useState<"create" | "edit">("create");
  const [id, setId]                               = useState<string>("");
  const [id2, setId2]                             = useState<string>("");
  const [currentBody, setCurrentBody]             = useState<any>({});
  const [queryStr, setQueryStr]                   = useState<string>("");

  /* Dados para os multi-selects */
  const [allNetworks, setAllNetworks]   = useState<TAccreditedNetwork[]>([]);
  const [procedures, setProcedures]     = useState<TProcedure[]>([]);
  const [statusList]                    = useState<string[]>(["Ativo", "Inativo"]);

  /* Seleções múltiplas (estado local, fora do react-hook-form) */
  const [selectedNetworks,    setSelectedNetworks]    = useState<string[]>([]);
  const [selectedStatuses,    setSelectedStatuses]    = useState<string[]>([]);
  const [selectedProcedures,  setSelectedProcedures]  = useState<string[]>([]);

  const [searchActive, setSearchActive] = useState<boolean>(true);

  const { register, getValues, reset } = useForm<TAccreditedNetworkFilter>({
    defaultValues: ResetFilter,
  });

  /* ── Listagem ── */
  const getAll = async (query: string = "") => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/accredited-networks?deleted=false&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=${pagination.currentPage}${query}`,
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

  /* ── Selects auxiliares ── */
  const loadNetworks = async () => {
    try {
      const { data } = await api.get(`/accredited-networks/select?deleted=false&orderBy=corporateName&sort=asc`, configApi());
      setAllNetworks(data.result.data ?? []);
    } catch {}
  };

  const loadProcedures = async () => {
    try {
      const { data } = await api.get(`/procedures/select?deleted=false&orderBy=name&sort=asc`, configApi());
      setProcedures(data.result.data ?? []);
    } catch {}
  };

  /* ── Montar query ── */
  const buildQuery = (): string => {
    const v = getValues();
    let q = "";

    // busca rápida
    if (v.search) {
      q += `&regex$or$corporateName=${v.search}&regex$or$tradeName=${v.search}&regex$or$cnpj=${v.search}&regex$or$code=${v.search}`;
    }

    // datas de cadastro
    if (v["gte$createdAt"])     q += `&gte$createdAt=${v["gte$createdAt"]}`;
    if (v["lte$createdAt"])     q += `&lte$createdAt=${v["lte$createdAt"]}`;

    // datas de vigência
    if (v["gte$effectiveDate"]) q += `&gte$effectiveDate=${v["gte$effectiveDate"]}`;
    if (v["lte$effectiveDate"]) q += `&lte$effectiveDate=${v["lte$effectiveDate"]}`;

    // região
    if (v.state)        q += `&regex$address.state=${v.state}`;
    if (v.city)         q += `&regex$address.city=${v.city}`;
    if (v.neighborhood) q += `&regex$address.neighborhood=${v.neighborhood}`;

    // faixa de consumo
    if (v["gte$consumptionLimit"]) q += `&gte$consumptionLimit=${v["gte$consumptionLimit"]}`;
    if (v["lte$consumptionLimit"]) q += `&lte$consumptionLimit=${v["lte$consumptionLimit"]}`;

    // faixa de negociação (tradingTable total)
    if (v["gte$tradingTotal"]) q += `&gte$tradingTotal=${v["gte$tradingTotal"]}`;
    if (v["lte$tradingTotal"]) q += `&lte$tradingTotal=${v["lte$tradingTotal"]}`;

    // multi-selects
    if (selectedNetworks.length > 0) {
      selectedNetworks.forEach(id => { q += `&or$_id=${id}`; });
    }

    if (selectedStatuses.length > 0 && selectedStatuses.length < 2) {
      q += `&active=${selectedStatuses[0] === "Ativo"}`;
    }

    if (selectedProcedures.length > 0) {
      selectedProcedures.forEach(id => { q += `&or$procedureIds=${id}`; });
    }

    return q;
  };

  const onSubmit = async () => {
    const q = buildQuery();
    setQueryStr(q);
    await getAll(q);
  };

  /* ── Status ── */
  const updateStatus = async (id: string) => {
    try {
      await api.put(`/accredited-networks/alter-status`, { id, justification: "" }, configApi());
      await getAll(queryStr);
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

  /* ── CRUD ── */
  const openModal = (action: "create" | "edit" = "create", body?: any) => {
    if (body) {
      setCurrentBody({ ...body });
      setId(body.id);
    }
    setTypeModal(action);
    setModal(true);
  };

  const openModalDelete = (body: any) => {
    setCurrentBody(body);
    setModalDelete(true);
  };

  const destroy = async () => {
    try {
      const { status } = await api.delete(`/accredited-networks/${currentBody?.id}`, configApi());
      resolveResponse({ status, message: "Excluído com sucesso" });
      setModalDelete(false);
      resetModal();
      await getAll();
    } catch (error) {
      resolveResponse(error);
    }
  };

  const handleReturnModal = async (isSuccess: boolean, id: string) => {
    setId(id);
    if (isSuccess) {
      setTypeModal("edit");
      setModalUpdateStatus(false);
      await getAll(queryStr);
    }
  };

  const resetModal = () => {
    setCurrentBody(ResetAccreditedNetwork);
    setModal(false);
    setModalUpdateStatus(false);
    setId("");
  };

  useEffect(() => {
    if (permissionRead("1", "A21")) {
      loadNetworks();
      loadProcedures();
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

            <div className="w-full max-h-[calc(100dvh-(var(--height-header)))]">
              <SlimContainer
                menu="Cadastros"
                breadcrump="Rede Credenciada"
                breadcrumpIcon="MdHub"
                buttons={
                  <>
                    {permissionCreate("1", "A21") && (
                      <button onClick={() => openModal()} className="slim-bg-primary slim-bg-primary-hover">
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
                        subtitle="">
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
                              placeholder="Razão social, fantasia, CNPJ, código..."
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

                          {/* ── Unidades credenciadas (multi) ─────── */}
                          <div className="col-span-12 sm:col-span-6 mb-2">
                            <MultiSelect
                              label="Unidade Credenciada"
                              items={allNetworks}
                              selected={selectedNetworks}
                              onChange={setSelectedNetworks}
                              getId={n => n.id ?? ""}
                              getLabel={n => n.corporateName}
                              placeholder="Selecione unidades..."
                            />
                          </div>

                          {/* ── Status (multi) ───────────────────── */}
                          <div className="col-span-12 sm:col-span-3 mb-2">
                            <MultiSelect
                              label="Status"
                              items={statusList.map(s => ({ id: s, name: s }))}
                              selected={selectedStatuses}
                              onChange={setSelectedStatuses}
                              getId={s => s.id}
                              getLabel={s => s.name}
                              placeholder="Selecione status..."
                            />
                          </div>

                          {/* ── Procedimentos (multi) ────────────── */}
                          <div className="col-span-12 sm:col-span-3 mb-2">
                            <MultiSelect
                              label="Procedimentos"
                              items={procedures}
                              selected={selectedProcedures}
                              onChange={setSelectedProcedures}
                              getId={p => p.id ?? ""}
                              getLabel={p => p.name}
                              placeholder="Selecione procedimentos..."
                            />
                          </div>

                          {/* ── Região ───────────────────────────── */}
                          <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                            <label className="label slim-label-primary">Estado(s)</label>
                            <input
                              {...register("state")}
                              type="text"
                              className="input slim-input-primary"
                              placeholder="Ex: SP, RJ"
                            />
                          </div>
                          <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                            <label className="label slim-label-primary">Cidade(s)</label>
                            <input
                              {...register("city")}
                              type="text"
                              className="input slim-input-primary"
                              placeholder="Ex: São Paulo"
                            />
                          </div>
                          <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                            <label className="label slim-label-primary">Bairro(s)</label>
                            <input
                              {...register("neighborhood")}
                              type="text"
                              className="input slim-input-primary"
                              placeholder="Ex: Centro"
                            />
                          </div>

                          {/* ── Negociação (faixa de valor) ──────── */}
                          <div className="flex flex-col col-span-6 sm:col-span-1 mb-2">
                            <label className="label slim-label-primary">Negociação de</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] pointer-events-none">R$</span>
                              <input
                                {...register("gte$tradingTotal")}
                                type="number"
                                min="0"
                                step="0.01"
                                className="input slim-input-primary pl-8 text-end"
                                placeholder=""
                              />
                            </div>
                          </div>
                          <div className="flex flex-col col-span-6 sm:col-span-1 mb-2">
                            <label className="label slim-label-primary">Negociação até</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] pointer-events-none">R$</span>
                              <input
                                {...register("lte$tradingTotal")}
                                type="number"
                                min="0"
                                step="0.01"
                                className="input slim-input-primary pl-8 text-end"
                                placeholder=""
                              />
                            </div>
                          </div>

                          {/* ── Limite de consumo (faixa de valor) ─ */}
                          <div className="flex flex-col col-span-6 sm:col-span-1 mb-2">
                            <label className="label slim-label-primary">Limite de</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] pointer-events-none">R$</span>
                              <input
                                {...register("gte$consumptionLimit")}
                                type="number"
                                min="0"
                                step="0.01"
                                className="input slim-input-primary pl-8 text-end"
                                placeholder=""
                              />
                            </div>
                          </div>
                          <div className="flex flex-col col-span-6 sm:col-span-1 mb-2">
                            <label className="label slim-label-primary">Limite até</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] pointer-events-none">R$</span>
                              <input
                                {...register("lte$consumptionLimit")}
                                type="number"
                                min="0"
                                step="0.01"
                                className="input slim-input-primary pl-8 text-end"
                                placeholder=""
                              />
                            </div>
                          </div>

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

                {pagination.data.length > 0 && (
                  <div className="slim-container-table w-full max-h-[calc(100dvh-(var(--height-header)+12rem))]">
                    <table className="min-w-full divide-y">
                      <thead className="slim-table-thead">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left tracking-wider rounded-tl-xl">ID</th>
                          <th scope="col" className="px-4 py-3 text-left tracking-wider">Razão Social</th>
                          <th scope="col" className="px-4 py-3 text-left tracking-wider">Nome Fantasia</th>
                          <th scope="col" className="px-4 py-3 text-left tracking-wider">CNPJ</th>
                          <th scope="col" className="px-4 py-3 text-left tracking-wider">Vigência</th>
                          <th scope="col" className="px-4 py-3 text-left tracking-wider">Limite de Consumo</th>
                          <th scope="col" className="px-4 py-3 text-left tracking-wider">Status</th>
                          <th scope="col" className="px-4 py-3 text-left tracking-wider rounded-tr-xl">Ações</th>
                        </tr>
                      </thead>

                      <tbody className="slim-body-table divide-y">
                        {pagination.data.map((x: TAccreditedNetwork) => (
                          <tr className="slim-tr" key={x.id}>
                            <td className="px-4 py-2">{x.code}</td>
                            <td className="px-4 py-2">{x.corporateName}</td>
                            <td className="px-4 py-2">{x.tradeName}</td>
                            <td className="px-4 py-2">{x.cnpj}</td>
                            <td className="px-4 py-2">{maskDate(x.effectiveDate)}</td>
                            <td className="px-4 py-2">R$ {convertNumberMoney(x.consumptionLimit)}</td>
                            <td className="px-4 py-2">
                              <div className="flex flex-col">
                                <label className="slim-switch">
                                  <input checked={x.active} onChange={() => openModalUpdateStatus(x)} type="checkbox" />
                                  <span className="slider"></span>
                                </label>
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex gap-3">
                                {permissionUpdate("1", "A21") && (
                                  <IconEdit action="edit" obj={x} getObj={openModal} />
                                )}
                                {permissionDelete("1", "A21") && (
                                  <IconDelete obj={x} getObj={openModalDelete} />
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <NotData />
              </SlimContainer>
            </div>

            <ModalAccreditedNetwork
              title={typeModal === "create" ? "Inserir Rede Credenciada" : "Editar Rede Credenciada"}
              isOpen={modal}
              setIsOpen={() => setModal(modal)}
              onClose={resetModal}
              onSelectValue={handleReturnModal}
              id={id}
            />

            <ModalUpdateStatus
              isOpen={modalUpdateStatus}
              setIsOpen={() => setModalUpdateStatus(modalUpdateStatus)}
              onClose={resetModal}
              onSelectValue={handleReturnModal}
              id={id2}
            />

            <ModalDelete
              title="Excluír Rede Credenciada"
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