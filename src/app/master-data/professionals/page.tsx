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
import { ModalDelete } from "@/components/Global/ModalDelete";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { ModalProfessional } from "@/components/MasterData/Professional/Modal";
import { ResetProfessional, TProfessional } from "@/types/masterData/professional/professional.type";
import { permissionCreate, permissionDelete, permissionRead, permissionUpdate } from "@/utils/permission.util";

const columns: {key: string; title: string}[] = [
  { key: "name", title: "Nome" },
  { key: "email", title: "E-mail" },
  { key: "phone", title: "Telefone" },
  { key: "typeName", title: "Tipo de Profissional" },
  { key: "specialtyName", title: "Especialidade" },
  { key: "registrationName", title: "Registro" },
  { key: "number", title: "Código" },
  { key: "createdAt", title: "Data de Cadastro" },
];

export default function Professional() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [modal, setModal] = useState<boolean>(false);
  const [modalDelete, setModalDelete] = useState<boolean>(false);
  const [typeModal, setTypeModal] = useState<"create" | "edit">("create");
  const [currentBody, setCurrentBody] = useState<TProfessional>();


  const [userLogger] = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
 
  const getAll = async () => {
    try {
      setLoading(true);
      const {data} = await api.get(`/professionals?deleted=false&pageSize=10&pageNumber=${pagination.currentPage}`, configApi());
      const result = data.result;

      setPagination({
        currentPage: result.currentPage,
        data: result.data ?? [],
        sizePage: result.pageSize,
        totalPages: result.totalCount
      });
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (action: "create" | "edit" = "create", body?: TProfessional) => {
    if(body) {
      setCurrentBody({...body});
    };
    
    setTypeModal(action);
    setModal(true);
  };
  
  const openModalDelete = (body: TProfessional) => {
    setCurrentBody(body);
    setModalDelete(true);
  };

  const destroy = async () => {
    try {
      const { status } = await api.delete(`/professionals/${currentBody?.id}`, configApi());
      resolveResponse({status, message: "Excluído com sucesso"});
      setModalDelete(false);
      resetModal();
      await getAll();
    } catch (error) {
      resolveResponse(error);
    }
  };
  
  useEffect(() => {
    if(permissionRead("1", "A13")) {
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
    setCurrentBody(ResetProfessional);

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
              <SlimContainer breadcrump="Profissionais" breadcrumpIcon="FaUserTie"
                buttons={
                  <>
                  {
                    permissionCreate("1", "A13") &&
                    <button onClick={() => openModal()} className="slim-bg-primary slim-bg-primary-hover">Adicionar</button>
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
                                {col.key == 'createdAt' ? maskDate((x as any)[col.key]) : (x as any)[col.key]}
                              </td>        
                            ))}   
                            <td className="text-center">
                              <div className="flex justify-center gap-2">
                                {
                                  permissionUpdate("1", "A13") &&
                                  <MdEdit  onClick={() => openModal("edit", x)} /> 
                                }
                                {
                                  permissionDelete("1", "A13") &&
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

            <ModalProfessional
              title={typeModal == 'create' ? 'Inserir Profissional' : 'Editar Profissional'} 
              isOpen={modal} setIsOpen={() => setModal(modal)} 
              onClose={resetModal}
              onSelectValue={handleReturnModal}
              body={currentBody}
            />      

            <ModalDelete 
              title='Excluír Profissional'
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
