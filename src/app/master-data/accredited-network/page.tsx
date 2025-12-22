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
import { ModalCustomer } from "@/components/MasterData/Customer/Modal";
import { modalAtom } from "@/jotai/global/modal.jotai";
import { IconEdit } from "@/components/Global/IconEdit";
import { IconDelete } from "@/components/Global/IconDelete";
import { ModalAccreditedNetwork } from "@/components/MasterData/AccreditedNetwork/Modal";
import { ResetAccreditedNetwork, TAccreditedNetwork } from "@/types/masterData/accreditedNetwork/accreditedNetwork.type";

const columns: {key: string; title: string}[] = [
  { key: "corporateName", title: "Contratante" },
  { key: "type", title: "Tipo de Rede Credenciada" },
  { key: "document", title: "Documento" },
  { key: "createdAt", title: "Data de Cadastro" },
];

export default function AccreditedNetwork() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [modal, setModal] = useAtom(modalAtom);
  const [modalDelete, setModalDelete] = useState<boolean>(false);
  const [typeModal, setTypeModal] = useState<"create" | "edit">("create");
  const [id, setId] = useState<string>("");
  const [currentBody, setCurrentBody] = useState<any>({
    id: "",
    name: "",
    description: "",
    start: "",
    end: "",
    deliveryDate: "",
    billingDate: ""
  });


  const [userLogger] = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
 
  const getAll = async () => {
    try {
      setLoading(true);
      const {data} = await api.get(`/accredited-networks?deleted=false&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=${pagination.currentPage}`, configApi());
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

  const openModal = (action: "create" | "edit" = "create", body?: any) => {
    if(body) {
      const newBody = {...body}
      setCurrentBody(newBody);
      setId(body.id);
    };
    
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

  const handleReturnModal = async (isSuccess: boolean, id: string) => {
    setId(id);
    if(isSuccess) {
      setTypeModal("edit");
      await getAll();
    }
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

  const resetModal = () => {
    setCurrentBody(ResetAccreditedNetwork);

    setModal(false);
    setId("");
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
              <SlimContainer breadcrump="Rede Credenciada" breadcrumpIcon="MdHub"
                buttons={
                  <>
                    <button onClick={() => openModal()} className="slim-bg-primary slim-bg-primary-hover">Adicionar</button>
                  </>
                }>

                {
                  pagination.data.length > 0 &&
                  <div className="slim-container-table w-full">
                    <table className="min-w-full divide-y slim-table">
                      <thead className="slim-table-thead">
                        <tr>
                          <th scope="col" className={`px-4 py-3 text-left tracking-wider rounded-tl-xl`}>Razão Social</th>
                          <th scope="col" className={`px-4 py-3 text-left tracking-wider`}>Nome Fantasia</th>
                          <th scope="col" className={`px-4 py-3 text-left tracking-wider`}>CNPJ</th>
                          <th scope="col" className={`px-4 py-3 text-left tracking-wider`}>Vigência</th>
                          <th scope="col" className={`px-4 py-3 text-left tracking-wider`}>Limite de Consumo</th>
                          <th scope="col" className={`px-4 py-3 text-left tracking-wider rounded-tr-xl`}>Ações</th>
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-gray-100">
                        {
                          pagination.data.map((x: TAccreditedNetwork) => {
                              return (
                                <tr key={x.id}>
                                  <td className="px-4 py-2">{x.corporateName}</td>
                                  <td className="px-4 py-2">{x.tradeName}</td>
                                  <td className="px-4 py-2">{x.cnpj}</td>
                                  <td className="px-4 py-2">{maskDate(x.effectiveDate)}</td>
                                  <td className="px-4 py-2">R$ {convertNumberMoney(x.consumptionLimit)}</td>
                                  
                                  <td className="p-2">
                                    <div className="flex gap-3">
                                      <IconEdit action="edit" obj={x} getObj={openModal}/>
                                      <IconDelete obj={x} getObj={openModal}/>                                                
                                    </div>
                                  </td>
                                </tr>
                              )
                          })
                        }
                      </tbody>
                    </table>
                  </div>
                }

                <NotData />
              </SlimContainer>
            </div>

            <ModalAccreditedNetwork
              title={typeModal == 'create' ? 'Inserir Rede Credenciada' : 'Editar Rede Credenciada'} 
              isOpen={modal} setIsOpen={() => setModal(modal)} 
              onClose={resetModal}
              onSelectValue={handleReturnModal}
              id={id}
            />      

            <ModalDelete 
              title='Excluír Rede Credenciada'
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
