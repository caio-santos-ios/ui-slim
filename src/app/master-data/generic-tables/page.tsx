"use client";

import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { MenuItem } from '@headlessui/react';
import { maskDate } from "@/utils/mask.util";
import { Autorization } from "@/components/Global/Autorization";
import { Header } from "@/components/Global/Header";
import { SideMenu } from "@/components/Global/SideMenu";
import { SlimContainer } from "@/components/Global/SlimContainer";
import { Card } from "@/components/Global/Card";
import DataTable from "@/components/Global/Table";
import { NotData } from "@/components/Global/NotData";
import { Pagination } from "@/components/Global/Pagination";
import { ModalDelete } from "@/components/Global/ModalDelete";
import { ModalGenericTable } from "@/components/MasterData/GenericTable/Modal";
import { TGenericTable } from "@/types/masterData/genericTable/genericTable.type";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { IconEdit } from "@/components/Global/IconEdit";
import { IconDelete } from "@/components/Global/IconDelete";
import { permissionCreate, permissionDelete, permissionRead, permissionUpdate } from "@/utils/permission.util";

const columns: any[] = [
  { key: "table", title: "Tabela" },
  // { key: "createdAt", title: "Data de criação" },
];

export default function Dashboard() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [modal, setModal] = useState<boolean>(false);
  const [modalDelete, setModalDelete] = useState<boolean>(false);
  const [typeModal, setTypeModal] = useState<"create" | "edit" | "delete">("create");
  const [currentBody, setCurrentBody] = useState<TGenericTable>();


  const [userLogger] = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
 
  const getAll = async () => {
    try {
      setLoading(true);
      const {data} = await api.get(`/generic-tables?deleted=false&pageSize=15&pageNumber=1&orderBy=table&sort=desc`, configApi());
      const result = data.result;

      setPagination({
        currentPage: result.currentPage,
        data: result.data,
        sizePage: result.pageSize,
        totalPages: result.totalCount
      });
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (action: "create" | "edit" | "delete" = "create", body?: TGenericTable) => {
    if(body) {
      setCurrentBody({...body});
    };

    
    setTypeModal(action);
    if(action == "delete") {
      setModalDelete(true)
    } else {
      setModal(true);
    }
  };
  
  const openModalDelete = (body: TGenericTable) => {
    setCurrentBody(body);
    setModalDelete(true);
  };

  const destroy = async () => {
    try {
      const { status } = await api.delete(`/generic-tables/table/${currentBody?.table}`, configApi());
      resolveResponse({status, message: "Excluído com sucesso"});
      setModalDelete(false);
      resetModal();
      await getAll();
    } catch (error) {
      resolveResponse(error);
    }
  };
  
  useEffect(() => {
    if(permissionRead("1", "A23")) {
      getAll();
    };
  }, []);

  const handleReturnModal = async (isSuccess: boolean) => {
    if(isSuccess) {
      setModal(false); 
      await getAll();
    }
  };

  const resetModal = () => {
    setCurrentBody({
      active: true,
      code: "",
      description: "",
      id: "",
      table: "",
      items: [],
      createdAt: ""
    });

    setModal(false);
  };

  return (
    <>
      <Autorization />
      {
        userLogger ?
        <>
          <Header />
          <main className="slim-bg-main">
            <SideMenu />

            <div className="slim-container w-full">
              <SlimContainer breadcrump="Tabelas Genérica" breadcrumpIcon="LiaTableSolid"
                buttons={
                  <>
                  {
                    permissionCreate("1", "A23") &&
                      <button onClick={() => openModal()} className="slim-bg-primary slim-bg-primary-hover">Adicionar</button>
                    }
                  </>
                }>

                <ul className="grid gap-2 slim-list-card lg:hidden">
                  {
                    pagination.data.map((x: TGenericTable, i: number) => {
                      return (
                        <Card key={i}
                          buttons={
                            <>
                              <MenuItem>
                                <button onClick={() => openModal("edit", x)} className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">Editar</button>
                              </MenuItem>
                              <MenuItem>
                                <button onClick={() => openModalDelete(x)} className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">Excluír</button>
                              </MenuItem>
                            </>
                          }
                        >
                          <p>Tabela: <span className="font-bold">{x.table}</span></p>
                          <p>Data de criação: <span className="font-bold">{maskDate(x.createdAt)}</span></p>
                        </Card>                       
                      )
                    })
                  }
                </ul>

                <div className="slim-container-table w-full bg-white shadow-sm">
                  <table className="min-w-full divide-y slim-table divide-gray-200">
                    <thead className="slim-table-thead bg-gray-50">
                      <tr>
                        <th scope="col" className={`px-4 py-3 text-left tracking-wider rounded-tl-xl`}>Tabela</th>
                        <th scope="col" className={`px-4 py-3 text-center tracking-wider rounded-tr-xl`}>Ações</th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-100">
                      {
                        pagination.data.map((x: any, i: number) => {
                            return (
                              <tr key={i}>
                                <td className="px-4 py-2">{x.table}</td>
                                
                                <td className="p-2">
                                  <div className="flex justify-center gap-3">
                                    {
                                      permissionUpdate("1", "A23") &&
                                      <IconEdit action="edit" obj={x} getObj={openModal}/>
                                    }
                                    {
                                      permissionDelete("1", "A23") &&
                                      <IconDelete obj={x} getObj={openModal}/>                                                
                                    }
                                  </div>
                                </td>
                              </tr>
                            )
                        })
                      }
                    </tbody>
                  </table>
                </div>

                <NotData />
              </SlimContainer>
            </div>

            <ModalGenericTable 
              title={typeModal == 'create' ? 'Inserir Tabela Genérica' : 'Editar Tabela Genérica'} 
              isOpen={modal} setIsOpen={() => setModal(modal)} 
              onClose={resetModal}
              onSelectValue={handleReturnModal}
              body={currentBody}
              action={typeModal}
            />      

            <ModalDelete 
              title='Excluír Tabela Genérica'
              isOpen={modalDelete} setIsOpen={() => setModalDelete(modal)} 
              onClose={() => setModalDelete(false)}
              onSelectValue={destroy}
            />          
          </main>
        </>
        :
        <></>
      }
    </>
  );
}
