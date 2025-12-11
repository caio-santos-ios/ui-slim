"use client";

import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { modalAtom } from "@/jotai/global/modal.jotai";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { TAccountsReceivable, TCreateAccountsReceivable } from "@/types/accountsReceivable/accountsReceivable.type";
import { TPagination } from "@/types/global/pagination.type";
import { useAtom } from "jotai";
import { useEffect, useState, Fragment } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { FaTrash } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { MenuItem } from '@headlessui/react';
import { ModalAccountsReceivable } from "@/components/AccountsReceivable/Modal";
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

const columns: any[] = [
  { key: "category", title: "Categoria" },
  { key: "paymentMethod", title: "Metodo de pagamento" },
  { key: "contract", title: "Contrato" },
  { key: "costCenter", title: "Centro de Custo" },
  { key: "createdAt", title: "Data de criação" },
];

export default function Dashboard() {
  const [modal, setModal] = useState<boolean>(false);
  const [modalDelete, setModalDelete] = useState<boolean>(false);
  const [typeModal, setTypeModal] = useState<"create" | "edit">("create");
  const [accountsReceivable, setAccountsReceivable] = useState<TAccountsReceivable>();


  const [_m, setOpenModal] = useAtom(modalAtom);
  const [accountId, setAccountId] = useState("");
  const [userLogger] = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
 
  const getAll = async () => {
    try {
      const {data} = await api.get(`/generic-tables?deleted=false&pageSize=10&pageNumber=1`, configApi());

      setPagination({
        currentPage: data.currentPage,
        data: data.data,
        sizePage: data.pageSize,
        totalPages: data.totalCount
      });
    } catch (error) {
      resolveResponse(error);
    }
  };

  const openModal = (action: "create" | "edit" = "create", body?: TAccountsReceivable) => {
    if(body) {
      setAccountsReceivable(body);
    };
    
    setTypeModal(action);
    setModal(true);
  };
  
  const openModalDelete = (body: TAccountsReceivable) => {
    setAccountsReceivable(body);
    setModalDelete(true);
  };

  const destroy = async () => {
    try {
      const { status, data} = await api.delete(`/accounts-receivable/${accountsReceivable?.id}`, configApi());
      resolveResponse({status, ...data});
      setModalDelete(false);
      await getAll();
    } catch (error) {
      resolveResponse(error);
    }
  };
  
  useEffect(() => {
    // getAll();
  }, []);

  const handleReturnModal = async (isSuccess: boolean) => {
    if(isSuccess) {
      setModal(false); 
      await getAll();
    }
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
                    <button onClick={() => openModal()} className="slim-bg-primary slim-bg-primary-hover">Adicionar</button>
                  </>
                }>

                <ul className="grid gap-2 slim-list-card lg:hidden">
                  {
                    pagination.data.map((x: TAccountsReceivable) => {
                      return (
                        <Card key={x.id}
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
                          <p>Contrato: <span className="font-bold">{x.category}</span></p>
                          <p>Metodo Pagemento: <span className="font-bold">{x.category}</span></p>
                          <p>Categoria: <span className="font-bold">{x.category}</span></p>
                          <p>Centro de Custo: <span className="font-bold">{x.category}</span></p>
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
                <Pagination />
              </SlimContainer>
            </div>

            <ModalAccountsReceivable 
              title={typeModal == 'create' ? 'Inserir Tabela Genérica' : 'Editar Tabela Genérica'} 
              isOpen={modal} setIsOpen={() => setModal(modal)} 
              onClose={() => setModal(false)}
              onSelectValue={handleReturnModal}
              body={accountsReceivable}
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
