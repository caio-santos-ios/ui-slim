"use client";

import { userLoggerAtom }   from "@/jotai/auth/auth.jotai";
import { paginationAtom }   from "@/jotai/global/pagination.jotai";
import { api }              from "@/service/api.service";
import { configApi, resolveParamsRequest, resolveResponse } from "@/service/config.service";
import { useAtom }          from "jotai";
import { useEffect, useMemo, useState } from "react";
import { Autorization }     from "@/components/Global/Autorization";
import { Header }           from "@/components/Global/Header";
import { SideMenu }         from "@/components/Global/SideMenu";
import { SlimContainer }    from "@/components/Global/SlimContainer";
import { NotData }          from "@/components/Global/NotData";
import { loadingAtom }      from "@/jotai/global/loading.jotai";
import { modalAtom }        from "@/jotai/global/modal.jotai";
import { permissionCreate, permissionRead } from "@/utils/permission.util";
import { ModalAppointment } from "@/components/Services/Appointment/Modal";
import { TableAppointment } from "@/components/Services/Appointment/Table";
import { TRecipient }       from "@/types/masterData/customers/customerRecipient.type";
import { TServiceModule }   from "@/types/masterData/serviceModules/serviceModules.type";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/Global/Accordion/AccordionContent";
import { MdFilterAlt, MdFilterAltOff } from "react-icons/md";
import { IoSearch, IoClose } from "react-icons/io5";

/* ─────────────────────────────────────────────
  MultiSelect reutilizável (inline — client-side)
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
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="label slim-label-primary">{label}</label>
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

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          {selected.map(id => {
            const item = items.find(i => getId(i) === id);
            if (!item) return null;
            return (
              <span
                key={id}
                className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full cursor-pointer select-none"
                style={{
                  background: "var(--accent-color-light)",
                  color:      "var(--accent-color)",
                  border:     "1px solid rgba(102,204,153,.3)",
                }}
                onClick={() => toggle(id)}
                title="Clique para remover"
              >
                {getLabel(item)}
                <IoClose size={10} className="opacity-60" />
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Status disponíveis ─────────────────────── */
const STATUS_OPTIONS = [
  { id: "SCHEDULED", label: "Agendada"  },
  { id: "CANCELED",  label: "Cancelada" },
];

/* ─── Tipo dos filtros locais ─────────────────── */
type TLocalFilter = {
  recipientIds:    string[];   // multi
  statusIds:       string[];   // multi
  serviceModuleIds:string[];   // multi
  programIds:      string[];   // multi  ← campo "program" do item (quando a API fornecer)
  specialtyIds:    string[];   // multi  ← campo "specialty" do item
  dateRequestFrom: string;     // data de cadastro (createdAt) — início
  dateRequestTo:   string;     // data de cadastro (createdAt) — fim
  dateScheduleFrom:string;     // data do agendamento (date) — início
  dateScheduleTo:  string;     // data do agendamento (date) — fim
};

const ResetLocalFilter: TLocalFilter = {
  recipientIds:     [],
  statusIds:        [],
  serviceModuleIds: [],
  programIds:       [],
  specialtyIds:     [],
  dateRequestFrom:  "",
  dateRequestTo:    "",
  dateScheduleFrom: "",
  dateScheduleTo:   "",
};

/* ─────────────────────────────────────────────
   Página
───────────────────────────────────────────── */
export default function Appointments() {
  const [_, setLoading]             = useAtom(loadingAtom);
  const [modal, setModal]           = useAtom(modalAtom);
  const [userLogger]                = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom);

  const [id, setId]             = useState<string>("");
  const [rawList, setRawList]   = useState<any[]>([]);   // lista completa da API

  /* Listas para os selects */
  const [recipients,     setRecipients]     = useState<TRecipient[]>([]);
  const [serviceModules, setServiceModules] = useState<TServiceModule[]>([]);

  /* Filtros client-side */
  const [filter, setFilter] = useState<TLocalFilter>(ResetLocalFilter);

  /* Indica se algum filtro está ativo */
  const isFiltered = useMemo(
    () =>
      filter.recipientIds.length     > 0 ||
      filter.statusIds.length         > 0 ||
      filter.serviceModuleIds.length  > 0 ||
      filter.programIds.length        > 0 ||
      filter.specialtyIds.length      > 0 ||
      !!filter.dateRequestFrom  ||
      !!filter.dateRequestTo    ||
      !!filter.dateScheduleFrom ||
      !!filter.dateScheduleTo,
    [filter]
  );

  /* ── Coletar valores únicos do rawList para specialty e program ── */
  const specialtiesOptions = useMemo(
    () => [...new Set(rawList.map(x => x.specialty).filter(Boolean))].map(s => ({ id: s, label: s })),
    [rawList]
  );

  const programsOptions = useMemo(
    () => [...new Set(rawList.map(x => x.program).filter(Boolean))].map(s => ({ id: s, label: s })),
    // ↑ "program" é o campo que a API deverá retornar; enquanto não existir a lista ficará vazia
    [rawList]
  );

  /* ── Filtro client-side aplicado ── */
  const filteredList = useMemo(() => {
    return rawList.filter(x => {
      // Beneficiário
      if (filter.recipientIds.length > 0 && !filter.recipientIds.includes(x.recipientId ?? x.beneficiaryUuid))
        return false;

      // Status
      if (filter.statusIds.length > 0 && !filter.statusIds.includes(x.status))
        return false;

      // Programa
      if (filter.serviceModuleIds.length > 0 && !filter.serviceModuleIds.includes(x.serviceModuleId))
        return false;

      // Programa (quando a API retornar x.programId ou x.program)
      if (filter.programIds.length > 0 && !filter.programIds.includes(x.program ?? x.programId))
        return false;

      // Especialidade
      if (filter.specialtyIds.length > 0 && !filter.specialtyIds.includes(x.specialty))
        return false;

      // Data de solicitação (createdAt ou requestDate)
      const requestDate = x.createdAt ? x.createdAt.split("T")[0] : x.requestDate ?? "";
      if (filter.dateRequestFrom && requestDate && requestDate < filter.dateRequestFrom) return false;
      if (filter.dateRequestTo   && requestDate && requestDate > filter.dateRequestTo)   return false;

      // Data do agendamento
      const scheduleDate = (x.date ?? "").split("T")[0];
      if (filter.dateScheduleFrom && scheduleDate && scheduleDate < filter.dateScheduleFrom) return false;
      if (filter.dateScheduleTo   && scheduleDate && scheduleDate > filter.dateScheduleTo)   return false;

      return true;
    });
  }, [rawList, filter]);

  /* ── Sincroniza lista filtrada no pagination ── */
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      data:       filteredList,
      totalPages: filteredList.length,
    }));
  }, [filteredList]);

  /* ── Helpers de set de filtro ── */
  const setF = <K extends keyof TLocalFilter>(key: K, value: TLocalFilter[K]) =>
    setFilter(prev => ({ ...prev, [key]: value }));

  const clearFilters = () => setFilter(ResetLocalFilter);

  /* ── Busca na API (apenas uma vez / ao abrir) ── */
  const getAll = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/appointments?deleted=false${resolveParamsRequest(pagination.query)}`,
        configApi()
      );
      const list = data.result.data ?? [];
      setRawList(list);

      setPagination(prev => ({
        ...prev,
        currentPage: 1,
        data:        list,
        sizePage:    10,
        totalPages:  list.length,
      }));
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecipients = async () => {
    try {
      const { data } = await api.get(`/customer-recipients/select`, configApi());
      setRecipients(data.result.data ?? []);
    } catch {}
  };

  const loadServiceModules = async () => {
    try {
      const { data } = await api.get(`/service-modules/select?deleted=false&orderBy=name&sort=asc`, configApi());
      setServiceModules(data.result.data ?? []);
    } catch {}
  };

  const openModal = () => { setId(""); setModal(true); };
  const resetModal = () => { setId(""); setModal(false); };
  const handleReturnModal = async () => { await getAll(); };

  useEffect(() => {
    if (permissionRead("2", "B25")) {
      getAll();
      loadRecipients();
      loadServiceModules();
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

            <div className="w-full">
              <SlimContainer
                menu="Atendimentos"
                breadcrump="Agendamentos"
                breadcrumpIcon="MdEventAvailable"
                buttons={
                  <>
                    {permissionCreate("2", "B25") && (
                      <button onClick={openModal} className="slim-bg-primary slim-bg-primary-hover">
                        Adicionar
                      </button>
                    )}
                  </>
                }
              >

                {/* ══════════════════════════════════════════════
                    ACCORDION DE FILTROS — client-side
                ══════════════════════════════════════════════ */}
                <div className="grid grid-cols-12 mb-2">
                  <Accordion className="col-span-12" defaultOpenId="filter">
                    <AccordionItem id="filter">
                      <AccordionTrigger
                        icon={isFiltered ? <MdFilterAlt size={15} /> : <MdFilterAltOff size={15} />}
                        subtitle={isFiltered ? `${filteredList.length} resultado(s)` : ""}
                      >
                        Filtros
                      </AccordionTrigger>

                      <AccordionContent>
                        <div className="grid grid-cols-12 gap-3">

                          {/* ── Beneficiário (multi) ─────────────── */}
                          <div className="col-span-12 sm:col-span-6 mb-2">
                            <MultiSelect
                              label="Beneficiário"
                              items={recipients}
                              selected={filter.recipientIds}
                              onChange={v => setF("recipientIds", v)}
                              getId={r => r.id ?? ""}
                              getLabel={r => r.name}
                              placeholder="Selecione beneficiários..."
                            />
                          </div>

                          {/* ── Status (multi) ───────────────────── */}
                          <div className="col-span-12 sm:col-span-3 mb-2">
                            <MultiSelect
                              label="Status"
                              items={STATUS_OPTIONS}
                              selected={filter.statusIds}
                              onChange={v => setF("statusIds", v)}
                              getId={s => s.id}
                              getLabel={s => s.label}
                              placeholder="Selecione status..."
                            />
                          </div>

                          {/* ── Especialidade (multi — derivado da lista) ── */}
                          <div className="col-span-12 sm:col-span-3 mb-2">
                            <MultiSelect
                              label="Especialidade"
                              items={specialtiesOptions}
                              selected={filter.specialtyIds}
                              onChange={v => setF("specialtyIds", v)}
                              getId={s => s.id}
                              getLabel={s => s.label}
                              placeholder="Selecione especialidades..."
                            />
                          </div>

                          {/* ── Programa (multi) ─────────── */}
                          <div className="col-span-12 sm:col-span-4 mb-2">
                            <MultiSelect
                              label="Programa"
                              items={serviceModules}
                              selected={filter.serviceModuleIds}
                              onChange={v => setF("serviceModuleIds", v)}
                              getId={m => m.id ?? ""}
                              getLabel={m => m.name}
                              placeholder="Selecione módulos..."
                            />
                          </div>

                          {/* ── Módulos de Serviços (multi — derivado da lista quando API fornecer x.program) ── */}
                          <div className="col-span-12 sm:col-span-4 mb-2">
                            <MultiSelect
                              label="Módulos de Serviços"
                              items={programsOptions}
                              selected={filter.programIds}
                              onChange={v => setF("programIds", v)}
                              getId={p => p.id}
                              getLabel={p => p.label}
                              placeholder={programsOptions.length === 0 ? "Nenhum programa disponível" : "Selecione programas..."}
                            />
                          </div>

                          {/* ── Data da solicitação ──────────────── */}
                          <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                            <label className="label slim-label-primary">Solicitação — início</label>
                            <input
                              type="date"
                              className="input slim-input-primary"
                              value={filter.dateRequestFrom}
                              onChange={e => setF("dateRequestFrom", e.target.value)}
                            />
                          </div>
                          <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                            <label className="label slim-label-primary">Solicitação — fim</label>
                            <input
                              type="date"
                              className="input slim-input-primary"
                              value={filter.dateRequestTo}
                              onChange={e => setF("dateRequestTo", e.target.value)}
                            />
                          </div>

                          {/* ── Data do agendamento ──────────────── */}
                          <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                            <label className="label slim-label-primary">Agendamento — início</label>
                            <input
                              type="date"
                              className="input slim-input-primary"
                              value={filter.dateScheduleFrom}
                              onChange={e => setF("dateScheduleFrom", e.target.value)}
                            />
                          </div>
                          <div className="flex flex-col col-span-6 sm:col-span-2 mb-2">
                            <label className="label slim-label-primary">Agendamento — fim</label>
                            <input
                              type="date"
                              className="input slim-input-primary"
                              value={filter.dateScheduleTo}
                              onChange={e => setF("dateScheduleTo", e.target.value)}
                            />
                          </div>

                          {/* ── Limpar filtros ───────────────────── */}
                          <div className="flex flex-col justify-end col-span-12 sm:col-span-2 mb-2">
                            {isFiltered && (
                              <>
                                <button
                                  type="button"
                                  onClick={clearFilters}
                                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                                  style={{
                                    background:   "rgba(239,68,68,.08)",
                                    color:        "#dc2626",
                                    border:       "1px solid rgba(239,68,68,.2)",
                                    cursor:       "pointer",
                                    height:       "2.25rem",
                                  }}
                                >
                                  <IoClose size={13} />
                                  Limpar filtros
                                </button>
                                <button
                                  type="button"
                                  onClick={getAll}
                                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                                  style={{
                                    background:   "rgba(239,68,68,.08)",
                                    color:        "#dc2626",
                                    border:       "1px solid rgba(239,68,68,.2)",
                                    cursor:       "pointer",
                                    height:       "2.25rem",
                                  }}
                                >
                                  <IoClose size={13} />
                                  Pesquisa
                                </button>
                              </>
                            )}
                          </div>

                        </div>

                        {/* Contador de resultados */}
                        {isFiltered && (
                          <p className="text-xs text-[var(--text-muted)] mt-2">
                            Exibindo <strong className="text-[var(--text-primary)]">{filteredList.length}</strong> de{" "}
                            <strong className="text-[var(--text-primary)]">{rawList.length}</strong> registro(s)
                          </p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                {/* ════════════════════════════════════════════ */}

                <NotData />
                <TableAppointment handleReturnModal={handleReturnModal} list={pagination.data} />

              </SlimContainer>
            </div>

            <ModalAppointment
              title="Inserir Agendamento"
              isOpen={modal}
              setIsOpen={() => setModal(modal)}
              onClose={resetModal}
              handleReturnModal={handleReturnModal}
              id={id}
            />
          </main>
        </>
      ) : (
        <></>
      )}
    </>
  );
}