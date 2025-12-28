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
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { convertNumberMoney } from "@/utils/convert.util";
import { TProcedure } from "@/types/masterData/procedure/procedure.type";
import { ModalProcedure } from "@/components/MasterData/Procedure/Modal";
import { permissionCreate, permissionDelete, permissionRead, permissionUpdate } from "@/utils/permission.util";

const columns: {key: string; title: string}[] = [
  { key: "code", title: "Código" },
  { key: "name", title: "Nome" },
  { key: "description", title: "Descrição" },
  { key: "serviceModule", title: "Módulo de Serviço" },
  { key: "active", title: "Status" },
  { key: "createdAt", title: "Data de Cadastro" },
];

export default function Procedure() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [modal, setModal] = useState<boolean>(false);
  const [modalDelete, setModalDelete] = useState<boolean>(false);
  const [typeModal, setTypeModal] = useState<"create" | "edit">("create");
  const [currentBody, setCurrentBody] = useState<TProcedure>();


  const [userLogger] = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
 
  const getAll = async (queryString: string = "") => {
    try {
      const {data} = await api.get(`/procedures?deleted=false&pageSize=10&pageNumber=${pagination.currentPage}${queryString}`, configApi());
      const result = data.result;

      setPagination({
        currentPage: result.currentPage,
        data: result.data,
        sizePage: result.pageSize,
        totalPages: result.totalCount
      });
    } catch (error) {
      resolveResponse(error);
    }
  };

  const openModal = (action: "create" | "edit" = "create", body?: TProcedure) => {
    if(body) {
      setCurrentBody({...body});
    };
    
    setTypeModal(action);
    setModal(true);
  };
  
  const openModalDelete = (body: TProcedure) => {
    setCurrentBody(body);
    setModalDelete(true);
  };

  const destroy = async () => {
    try {
      const {status} = await api.delete(`/procedures/${currentBody?.id}`, configApi());

      resolveResponse({status, message: "Excluído com sucesso"});
      setModalDelete(false);
      resetModal();
      await getAll();
    } catch (error) {
      resolveResponse(error);
    }
  };
  
  useEffect(() => {
    if(permissionRead("1", "A16")) {
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
      id: "",
      name: "",
      code: "",
      description: "",
      serviceModuleId: "",
      externalCodes: "",
      notes: "",
      active: true
    });

    setModal(false);
  };
  
  const search = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let firstSearch = ``;

    if(value) {
      firstSearch = `&regex$or$code=${value}&regex$or$name=${value}&regex$or$description=${value}&regex$or$_service_module.name=${value}`;
    } else {
      firstSearch = "";
    };
    
    await getAll(firstSearch);
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
              <SlimContainer breadcrump="Procedimentos" breadcrumpIcon="MdChecklist"
                buttons={
                  <>
                    {
                      permissionCreate("1", "A16") &&
                      <button onClick={() => openModal()} className="slim-bg-primary slim-bg-primary-hover">Adicionar</button>
                    }
                  </>
                }
                inputSearch={
                  <>
                    {
                      permissionRead("1", "A16") && 
                      <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => search(e)} className="border border-gray-400 w-96 h-8" type="text" placeholder="Busca rápida" />
                    }
                  </>
                }>

                <DataTable columns={columns}>
                  <>
                    {
                      pagination.data.map((x: any, i: number) => {
                        return (
                          <tr key={i}>
                            {columns.map((col: any) => (
                              <td className={`px-4 py-3 text-left text-sm font-medium tracking-wider`} key={col.key}>
                                {col.key == 'createdAt' ? maskDate((x as any)[col.key]) : col.key == 'active' ? x.active ? 'Ativo' : 'Inativo' : col.key == "price" ? convertNumberMoney(x.price) : (x as any)[col.key]}
                              </td>        
                            ))}   
                            <td className="text-center">
                              <div className="flex justify-center gap-2">
                                {
                                  permissionUpdate("1", "A16") &&
                                  <MdEdit  onClick={() => openModal("edit", x)} /> 
                                }
                                {
                                  permissionDelete("1", "A16") &&
                                  <FaTrash onClick={() => openModalDelete(x)} />
                                }
                              </div>
                            </td>         
                          </tr>
                        )
                      })
                    }
                  </>
                </DataTable>

                <NotData />
                {/* <Pagination passPage={passPage} /> */}
              </SlimContainer>
            </div>

            <ModalProcedure
              title={typeModal == 'create' ? 'Inserir Procedimento' : 'Editar Procedimento'} 
              isOpen={modal} setIsOpen={() => setModal(modal)} 
              onClose={resetModal}
              onSelectValue={handleReturnModal}
              body={currentBody}
            />      

            <ModalDelete 
              title='Excluír Procedimento'
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
