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
import { ResetAccreditedNetwork, ResetAccreditedNetworkSearch, TAccreditedNetwork, TAccreditedNetworkSearch } from "@/types/masterData/accreditedNetwork/accreditedNetwork.type";
import { permissionCreate, permissionDelete, permissionRead, permissionUpdate } from "@/utils/permission.util";
import { ModalUpdateStatus } from "@/components/MasterData/AccreditedNetwork/ModalUpdateStatus";
import { useForm } from "react-hook-form";

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
  const [id2, setId2] = useState<string>("");
  const [currentBody, setCurrentBody] = useState<any>({
    id: "",
    name: "",
    description: "",
    start: "",
    end: "",
    deliveryDate: "",
    billingDate: ""
  });
  const [modalUpdateStatus, setModalUpdateStatus] = useState<boolean>(false);

  const [userLogger] = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
  const [queryStr, setQueryStr] = useState<string>("");
  const [queryDateStr, setQueryDateStr] = useState<string>("");

  const { register, watch } = useForm<TAccreditedNetworkSearch>({
    defaultValues: ResetAccreditedNetworkSearch
  });

  const getAll = async (queryString: string = "", queryStringDate: string = "") => {
    try {
      const {data} = await api.get(`/accredited-networks?deleted=false&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=${pagination.currentPage}${queryString}${queryStringDate}`, configApi());
      const result = data.result;

      setPagination({
        currentPage: result.currentPage,
        data: result.data,
        sizePage: result.pageSize,
        totalPages: result.totalCount
      });
    } catch (error) {
      resolveResponse(error);
    };
  };

  const openModalUpdateStatus = async (body: any) => {
    if(body.active) {
      setId2(body.id);
      setModalUpdateStatus(true);
    } else {
      await updateStatus(body.id);
    }
  };

  const updateStatus = async (id: string) => {
      try {
        await api.put(`/accredited-networks/alter-status`, {id, justification: ""}, configApi());
        if(permissionRead("1", "A21")) {
          setLoading(true);
          getAll();
          setLoading(false);
        };
      } catch (error) {
        resolveResponse(error);
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
    if(permissionRead("1", "A21")) {
      getAll();
    };
  }, []);

  const search = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let firstSearch = ``;

    if(value) {
      firstSearch = `&regex$or$corporateName=${value}&regex$or$tradeName=${value}&regex$or$cnpj=${value}&regex$or$code=${value}`;
    } else {
      firstSearch = "";
    };
    setQueryStr(firstSearch);
    await getAll(firstSearch, queryDateStr);
  };

  const handleReturnModal = async (isSuccess: boolean, id: string) => {
    setId(id);
    if(isSuccess) {
      setTypeModal("edit");
      setModalUpdateStatus(false);
      await getAll();
    }
  };
  
  const resetModal = () => {
    setCurrentBody(ResetAccreditedNetwork);

    setModal(false);
    setModalUpdateStatus(false);
    setId("");
  };

  useEffect(() => {
    const startDate = watch("gte$effectiveDate");
    const endDate = watch("lte$effectiveDate");

    let firstSearch = ``;
    if(startDate) {
      firstSearch += `&gte$effectiveDate=${startDate}`;
    };
    
    if(endDate) {
      firstSearch += `&lte$effectiveDate=${endDate}`;
    };

    setQueryDateStr(firstSearch);
    getAll(queryStr, firstSearch);
  }, [watch("gte$effectiveDate"), watch("lte$effectiveDate")]);

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
                    {
                      permissionCreate("1", "A21") &&
                      <button onClick={() => openModal()} className="slim-bg-primary slim-bg-primary-hover">Adicionar</button>
                    }                  
                  </>
                }

                inputSearch={
                  <>
                    {
                      permissionRead("1", "A16") && 
                      <div className="grid grid-cols-4 gap-2">
                        <div className={`flex flex-col col-span-2 mb-2`}>
                          <label className={`label slim-label-primary`}>Busca rápida</label>
                          <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => search(e)} className="input slim-input-primary" type="text" placeholder="Buscar..." />
                        </div>
                        
                        <div className={`flex flex-col col-span-1 mb-2`}>  
                          <label className={`label slim-label-primary`}>Inicio Vigência</label>
                          <input {...register("gte$effectiveDate")} type="date" className={`input slim-input-primary`} placeholder="Digite"/>
                        </div>                     
                        
                        <div className={`flex flex-col col-span-1 mb-2`}>
                          <label className={`label slim-label-primary`}>Fim Vigência</label>
                          <input {...register("lte$effectiveDate")} type="date" className={`input slim-input-primary`} placeholder="Digite"/>
                        </div>    
                      </div>
                    
                    }
                  </>
                }>

                {
                  pagination.data.length > 0 &&
                  <div className="slim-container-table w-full max-h-[calc(100dvh-(var(--height-header)+7rem))]">
                    <table className="min-w-full divide-y">
                      <thead className="slim-table-thead">
                        <tr>
                          <th scope="col" className={`px-4 py-3 text-left tracking-wider rounded-tl-xl`}>ID</th>
                          <th scope="col" className={`px-4 py-3 text-left tracking-wider`}>Razão Social</th>
                          <th scope="col" className={`px-4 py-3 text-left tracking-wider`}>Nome Fantasia</th>
                          <th scope="col" className={`px-4 py-3 text-left tracking-wider`}>CNPJ</th>
                          <th scope="col" className={`px-4 py-3 text-left tracking-wider`}>Vigência</th>
                          <th scope="col" className={`px-4 py-3 text-left tracking-wider`}>Limite de Consumo</th>
                          <th scope="col" className={`px-4 py-3 text-left tracking-wider`}>Status</th>
                          <th scope="col" className={`px-4 py-3 text-left tracking-wider rounded-tr-xl`}>Ações</th>
                        </tr>
                      </thead>

                      <tbody className="slim-body-table divide-y">
                        {
                          pagination.data.map((x: TAccreditedNetwork) => {
                              return (
                                <tr className="slim-tr" key={x.id}>
                                  <td className="px-4 py-2">{x.code}</td>
                                  <td className="px-4 py-2">{x.corporateName}</td>
                                  <td className="px-4 py-2">{x.tradeName}</td>
                                  <td className="px-4 py-2">{x.cnpj}</td>
                                  <td className="px-4 py-2">{maskDate(x.effectiveDate)}</td>
                                  <td className="px-4 py-2">R$ {convertNumberMoney(x.consumptionLimit)}</td>
                                  <td className="px-4 py-2">
                                    <div className={`flex flex-col`}>
                                      <label className="slim-switch">
                                        <input checked={x.active} onChange={() => openModalUpdateStatus(x)} type="checkbox"/>
                                        
                                        <span className="slider"></span>
                                      </label>
                                    </div>  
                                  </td>
                                  
                                  <td className="p-2">
                                    <div className="flex gap-3">
                                      {
                                        permissionUpdate("1", "A21") &&
                                        <IconEdit action="edit" obj={x} getObj={openModal}/>
                                      }
                                      {
                                        permissionDelete("1", "A21") &&
                                        <IconDelete obj={x} getObj={openModalDelete}/>                                                
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

            <ModalUpdateStatus
              isOpen={modalUpdateStatus} setIsOpen={() => setModalUpdateStatus(modalUpdateStatus)} 
              onClose={resetModal}
              onSelectValue={handleReturnModal}
              id={id2}
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
