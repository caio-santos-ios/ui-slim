"use client";

import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/Global/Accordion/AccordionContent";
import { IoSearch } from "react-icons/io5";
import { MdFilterAlt, MdFilterAltOff } from "react-icons/md";
import { ModalPermissionProfile } from "@/components/Settings/permissionProfile/ModalPermissionProfile";

// ─── Colunas ─────────────────────────────────────────────────────────────────
const columns = [
  { key: "name",        title: "Nome do Perfil" },
  { key: "description", title: "Descrição" },
  { key: "modules",     title: "Módulos" },
  { key: "createdAt",   title: "Data de Cadastro" },
];

// ─── Filtro ───────────────────────────────────────────────────────────────────
type TFilter = { search: string };
const ResetFilter: TFilter = { search: "" };

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function PermissionProfiles() {
  const [_, setLoading]             = useAtom(loadingAtom);
  const [userLogger]                = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom);

  const [typeModal, setTypeModal]       = useState<"create" | "edit">("create");
  const [currentBody, setCurrentBody]   = useState<any>({});
  const [modalOpen, setModalOpen]       = useState(false);
  const [modalDelete, setModalDelete]   = useState(false);
  const [queryStr, setQueryStr]         = useState("");

  const { register, reset, getValues } = useForm<TFilter>({ defaultValues: ResetFilter });

  // ── Listagem ───────────────────────────────────────────────────────────────
  const getAll = async (query: string = "") => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/permission-profiles?deleted=false&orderBy=name&sort=asc&pageSize=10&pageNumber=1${query}`,
        configApi()
      );
      const result = data.result;
      setPagination({ currentPage: result.currentPage, data: result.data, sizePage: result.pageSize, totalPages: result.totalCount });
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    const values = getValues();
    const q = values.search ? `&regex$or$name=${values.search}&regex$or$description=${values.search}` : "";
    setQueryStr(q);
    await getAll(q);
  };

  // ── Modais ─────────────────────────────────────────────────────────────────
  const openModal = (action: "create" | "edit" = "create", body?: any) => {
    if (body) setCurrentBody(body);
    setTypeModal(action);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setCurrentBody({}); };

  const handleSuccess = async () => { closeModal(); await getAll(queryStr); };

  const openModalDelete = (body: any) => { setCurrentBody(body); setModalDelete(true); };

  const destroy = async () => {
    try {
      const { status } = await api.delete(`/permission-profiles/${currentBody?.id}`, configApi());
      resolveResponse({ status, message: "Perfil excluído com sucesso" });
      setModalDelete(false);
      setCurrentBody({});
      await getAll(queryStr);
    } catch (error) {
      resolveResponse(error);
    }
  };

  // ── Cell renderer ──────────────────────────────────────────────────────────
  const renderCell = (x: any, col: { key: string }) => {
    if (col.key === "createdAt") return maskDate(x.createdAt);
    if (col.key === "modules") {
      const count = x.modules?.length ?? 0;
      const total = x.modules?.reduce((acc: number, m: any) => acc + (m.routines?.length ?? 0), 0) ?? 0;
      return (
        <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--primary-color)]">{count}</span> módulo{count !== 1 ? "s" : ""},
          <span className="font-semibold text-[var(--primary-color)]">{total}</span> rotina{total !== 1 ? "s" : ""}
        </span>
      );
    }
    return x[col.key] ?? "—";
  };

  useEffect(() => { getAll(); }, []);

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
                menu="Configurações"
                breadcrump="Perfis de Permissão"
                breadcrumpIcon="MdShieldOutlined"
                buttons={
                  <button onClick={() => openModal()} className="slim-btn slim-btn-primary">
                    Novo Perfil
                  </button>
                }
              >
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
                          <div className="flex flex-col col-span-12 sm:col-span-5 mb-2">
                            <label className="label slim-label-primary">Busca rápida</label>
                            <input {...register("search")} type="text" className="input slim-input-primary" placeholder="Nome ou descrição do perfil..." />
                          </div>
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
                <DataTable
                  isAction
                  classContainer="max-h-[calc(100dvh-(var(--height-header)+13rem))]"
                  columns={columns}
                >
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
                            <IconEdit action="edit" obj={x} getObj={openModal} />
                            <IconDelete obj={x} getObj={openModalDelete} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                </DataTable>
                <NotData />
              </SlimContainer>
            </div>

            <ModalPermissionProfile
              isOpen={modalOpen}
              typeModal={typeModal}
              body={currentBody}
              onClose={closeModal}
              onSuccess={handleSuccess}
            />

            <ModalDelete
              title="Excluir Perfil de Permissão"
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
