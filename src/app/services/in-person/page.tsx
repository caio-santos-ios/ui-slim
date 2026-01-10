"use client";

import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveParamsRequest, resolveResponse } from "@/service/config.service";
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
import { TableInPerson } from "@/components/Services/InPerson/Table";
import { ModalInPerson } from "@/components/Services/InPerson/Modal";
import { permissionCreate, permissionRead } from "@/utils/permission.util";
import { ResetInPersonSearch, TInPersonSearch } from "@/types/service/inPerson/inPerson.type";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/components/Global/Button";
import { TServiceModule } from "@/types/masterData/serviceModules/serviceModules.type";
import { TAccreditedNetwork } from "@/types/masterData/accreditedNetwork/accreditedNetwork.type";
import { TRecipient } from "@/types/masterData/customers/customerRecipient.type";

const columns: {key: string; title: string}[] = [
  { key: "corporateName", title: "Contratante" },
  { key: "type", title: "Tipo de Atendimento Presencial" },
  { key: "document", title: "Documento" },
  { key: "createdAt", title: "Data de Cadastro" },
];

export default function Customer() {
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
  const [recipient, setRecipient] = useState<TRecipient[]>([]);
  const [accreditedNetworks, setAccreditedNetwork] = useState<TAccreditedNetwork[]>([]);
  const [serviceModules, setServiceModule] = useState<TServiceModule[]>([]);

  const [userLogger] = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 

  const { register, handleSubmit, reset, watch, setValue, formState: { errors }} = useForm<TInPersonSearch>({
    defaultValues: ResetInPersonSearch
  });

  const onSubmit: SubmitHandler<TInPersonSearch> = async (body: TInPersonSearch) => {
    setPagination({
      currentPage: pagination.currentPage,
      data: pagination.data,
      sizePage: pagination.sizePage,
      totalPages: pagination.totalPages,
      query: body
    })

    await getAll();
  };
 
  const getAll = async () => {
    try {
      setLoading(true);
      const {data} = await api.get(`/in-persons?deleted=false&orderBy=createdAt&sort=desc&pageSize=100&pageNumber=1`, configApi());
      const result = data.result;

      setPagination({
        currentPage: result.currentPage,
        data: result.data,
        sizePage: result.pageSize,
        totalPages: result.totalCount,
        // query: pagination.query
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
      const { status } = await api.delete(`/customers/${currentBody?.id}`, configApi());
      resolveResponse({status, message: "Excluído com sucesso"});
      setModalDelete(false);
      resetModal();
      await getAll();
    } catch (error) {
      resolveResponse(error);
    }
  };

  const getSelectRecipient = async () => {
    try {
        setLoading(true);
        const {data} = await api.get(`/customer-recipients/select?deleted=false&orderBy=createdAt&sort=desc`, configApi());
        const result = data.result;
        setRecipient(result.data ?? []);
    } catch (error) {
        resolveResponse(error);
    } finally {
        setLoading(false);
    }
  };

  const getSelectAccreditedNetwork = async () => {
      try {
          setLoading(true);
          const {data} = await api.get(`/accredited-networks/select?deleted=false&orderBy=createdAt&sort=desc`, configApi());
          const result = data.result;
          setAccreditedNetwork(result.data ?? []);
      } catch (error) {
          resolveResponse(error);
      } finally {
          setLoading(false);
      }
  };

  const getSelectServiceModule = async () => {
      try {
          setLoading(true);
          const {data} = await api.get(`/service-modules/select?deleted=false&orderBy=createdAt&sort=desc`, configApi());
          const result = data.result;
          setServiceModule(result.data ?? []);
      } catch (error) {
          resolveResponse(error);
      } finally {
          setLoading(false);
      }
  };    

  
  useEffect(() => {
    if(permissionRead("2", "B22")) {
      reset(ResetInPersonSearch);
      getSelectRecipient();
      getSelectAccreditedNetwork();
      getSelectServiceModule();
      getAll();
    };
  }, []);

  const handleReturnModal = async () => {
    await getAll();
  };

  const resetModal = () => {
    setCurrentBody({
      id: "",
      name: "",
      description: "",
      start: "",
      end: "",
      deliveryDate: "",
      billingDate: ""
    });

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
              <SlimContainer breadcrump="Presencial" breadcrumpIcon="MdPersonPinCircle"
                buttons={
                  <>
                  {
                      permissionCreate("2", "B22") &&
                      <button onClick={() => openModal()} className="slim-bg-primary slim-bg-primary-hover">Adicionar</button>
                    }
                  </>
                }>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 mb-2">
                    <div className={`flex flex-col col-span-2 mb-2`}>
                      <label className={`label slim-label-primary`}>Beneficiário</label>
                      <select className="select slim-select-primary" {...register("recipientId")}>
                        <option value="">Selecione</option>
                        {
                          recipient.map((x: any) => {
                            return <option key={x.id} value={x.id}>{x.name}</option>
                          })
                        }
                      </select>
                    </div>
                      <div className={`flex flex-col col-span-3 mb-2`}>
                        <label className={`label slim-label-primary`}>Unidade Credenciada</label>
                        <select className="select slim-select-primary" {...register("accreditedNetworkId")}>
                          <option value="">Selecione</option>
                          {
                            accreditedNetworks.map((x: any) => {
                              return <option key={x.id} value={x.id}>{x.corporateName}</option>
                            })
                          }
                        </select>
                      </div>
                      <div className={`flex flex-col col-span-2 mb-2`}>
                        <label className={`label slim-label-primary`}>Módulo de Serviço</label>
                        <select className="select slim-select-primary" {...register("serviceModuleId")}>
                          <option value="">Selecione</option>
                          {
                            serviceModules.map((x: any) => {
                              return <option key={x.id} value={x.id}>{x.name}</option>
                            })
                          }
                        </select>
                      </div>                            
                      <div className={`flex flex-col col-span-2 mb-2`}>
                        <label className={`label slim-label-primary`}>Status</label>
                        <select className="select slim-select-primary" {...register("status")}>
                          <option value="">Todos</option>
                          <option value="Solicitada">Solicitada</option>
                          <option value="Agendada">Agendada</option>
                          <option value="Cancelada - Cliente">Cancelada - Cliente</option>
                          <option value="Cancelada - Pasbem">Cancelada - Pasbem</option>
                          <option value="Cancelada - Credenciada">Cancelada - Credenciada</option>
                          <option value="Realizada">Realizada</option>
                      </select>
                      </div>                            
                      <div className={`flex flex-col col-span-1 mb-2`}>
                        <label className={`label slim-label-primary`}>Data Inicio</label>
                        <input {...register("gte$date")} type="date" className={`input slim-input-primary`} placeholder="Digite"/>
                      </div>                                          
                      <div className={`flex flex-col col-span-1 mb-2`}>
                        <label className={`label slim-label-primary`}>Data Fim</label>
                        <input {...register("lte$date")} type="date" className={`input slim-input-primary`} placeholder="Digite"/>
                      </div>                                          
                      <div className={`flex flex-col justify-end col-span-1 mb-2`}>
                        <Button type="submit" text="Buscar" theme="primary-light" styleClassBtn=""/>
                      </div>                                          
                    </div>                          
                </form>

                <NotData />
                <TableInPerson handleReturnModal={handleReturnModal} list={pagination.data} />
              </SlimContainer>
            </div>

            <ModalInPerson
              title={typeModal == 'create' ? 'Inserir Atendimento Presencial' : 'Editar Atendimento Presencial'} 
              isOpen={modal} setIsOpen={() => setModal(modal)} 
              onClose={resetModal}
              handleReturnModal={handleReturnModal}
              id={id}
            />      

            <ModalDelete 
              title='Excluír Atendimento Presencial'
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
