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
import { ModalProfessional } from "@/components/MasterData/Professional/Modal";
import { TProfessional } from "@/types/masterData/professional/professional.type";

const columns: {key: string; title: string}[] = [
  { key: "name", title: "Nome" },
  { key: "email", title: "E-mail" },
  { key: "phone", title: "Telefone" },
  { key: "typeName", title: "Tipo de Profissão" },
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
    getAll();
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
      email: "",
      phone: "",
      cpf: "",
      address: {
          city: "",
          complement: "",
          neighborhood: "",
          number: "",
          parent: "",
          parentId: "",
          state: "",
          street: "",
          zipCode: ""
      },
      type: "",        
      specialty: "",       
      registration: "",     
      number: "",
    });

    setModal(false);
  };
  
  const passPage = async (action: "previous" | "next") => {
    if(pagination.totalPages == 1) return;
    
    if(action === 'previous' && pagination.currentPage > 1) {
      pagination.currentPage -= 1;
      await getAll();
    };

    if(action === 'next' && pagination.currentPage > pagination.totalPages) {
      pagination.currentPage -= 1;
      await getAll();
    };
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
                    <button onClick={() => openModal()} className="slim-bg-primary slim-bg-primary-hover">Adicionar</button>
                  </>
                }>

                <ul className="grid gap-2 slim-list-card lg:hidden">
                  {
                    pagination.data.map((x: TProfessional, i: number) => {
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
                          <p>Nome: <span className="font-bold">{x.name}</span></p>
                          <p>Tipo de Profissional: <span className="font-bold">{maskDate(x.type)}</span></p>
                        </Card>                       
                      )
                    })
                  }
                </ul>

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
                                <MdEdit  onClick={() => openModal("edit", x)} /> 
                                <FaTrash onClick={() => openModalDelete(x)} />
                              </div>
                            </td>         
                          </tr>
                        )
                      })
                    }
                  </>
                </DataTable>

                <NotData />
                <Pagination passPage={passPage} />
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
