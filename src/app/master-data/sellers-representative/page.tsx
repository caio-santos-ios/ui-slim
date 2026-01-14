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
import { ModalSellerRepresentative } from "@/components/MasterData/SellersRepresentative/Modal";
import { ResetSellerRepresentative, TSellerRepresentative } from "@/types/masterData/sellerRepresentative/sellerRepresentative.type";
import { permissionCreate, permissionDelete, permissionRead, permissionUpdate } from "@/utils/permission.util";

const columns: {key: string; title: string}[] = [
  { key: "corporateName", title: "Razão Social" },
  { key: "tradeName", title: "Nome Fantasia" },
  { key: "email", title: "E-mail" },
  { key: "phone", title: "Telefone" },
  { key: "effectiveDate", title: "Vigência" },
  { key: "createdAt", title: "Data de Cadastro" },
];

export default function Seller() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [modal, setModal] = useState<boolean>(false);
  const [modalDelete, setModalDelete] = useState<boolean>(false);
  const [typeModal, setTypeModal] = useState<"create" | "edit">("create");
  const [currentBody, setCurrentBody] = useState<TSellerRepresentative>(ResetSellerRepresentative);
  const [userLogger] = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
 
  const getAll = async () => {
    try {
      setLoading(true);
      const {data} = await api.get(`/seller-representatives?deleted=false&pageSize=10&pageNumber=${pagination.currentPage}`, configApi());
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

  const openModal = (action: "create" | "edit" = "create", body?: TSellerRepresentative) => {
    if(body) {
      const newBody = {...body}
      setCurrentBody(newBody);
    };
    
    setTypeModal(action);
    setModal(true);
  };
  
  const openModalDelete = (body: TSellerRepresentative) => {
    setCurrentBody(body);
    setModalDelete(true);
  };

  const destroy = async () => {
    try {
      const { status } = await api.delete(`/seller-representatives/${currentBody?.id}`, configApi());
      resolveResponse({status, message: "Excluído com sucesso"});
      setModalDelete(false);
      resetModal();
      await getAll();
    } catch (error) {
      resolveResponse(error);
    }
  };
  
  useEffect(() => {
    if(permissionRead("1", "A19")) {
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
    setCurrentBody(ResetSellerRepresentative);

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
              <SlimContainer breadcrump="Representantes" breadcrumpIcon="MdGroups"
                buttons={
                  <>
                    {
                      permissionCreate("1", "A19") &&
                      <button onClick={() => openModal()} className="slim-bg-primary slim-bg-primary-hover">Adicionar</button>
                    }
                  </>
                }>

                <ul className="grid gap-2 slim-list-card lg:hidden">
                  {
                    pagination.data.map((x: TSellerRepresentative, i: number) => {
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
                          <p>Razão Social: <span className="font-bold">{x.corporateName}</span></p>
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
                          <tr className="slim-tr" key={i}>
                            {columns.map((col: any) => (
                              <td className={`px-4 py-3 text-left text-sm font-medium tracking-wider`} key={col.key}>
                                {col.key == 'createdAt' || col.key == 'effectiveDate' ? maskDate((x as any)[col.key]) : (x as any)[col.key]}
                              </td>        
                            ))}   
                            <td className="text-center">
                              <div className="flex justify-center gap-2">
                                {
                                  permissionUpdate("1", "A19") &&
                                  <MdEdit className="cursor-pointer text-yellow-400 hover:text-yellow-500"  onClick={() => openModal("edit", x)} /> 
                                }
                                {
                                  permissionDelete("1", "A19") &&
                                  <FaTrash className="cursor-pointer text-red-400 hover:text-red-500" onClick={() => openModalDelete(x)} />
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

            <ModalSellerRepresentative
              title={typeModal == 'create' ? 'Inserir Representante' : 'Editar Representante'} 
              isOpen={modal} setIsOpen={() => setModal(modal)} 
              onClose={resetModal}
              onSelectValue={handleReturnModal}
              body={currentBody}
            />      

            <ModalDelete 
              title='Excluír Representante'
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
