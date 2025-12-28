"use client";

import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Autorization } from "@/components/Global/Autorization";
import { Header } from "@/components/Global/Header";
import { SideMenu } from "@/components/Global/SideMenu";
import { SlimContainer } from "@/components/Global/SlimContainer";
import { NotData } from "@/components/Global/NotData";
import { ModalDelete } from "@/components/Global/ModalDelete";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { ResetServiceModule, TServiceModule } from "@/types/masterData/serviceModules/serviceModules.type";
import { ModalServiceModule } from "@/components/MasterData/ServiceModule/Modal";
import { convertNumberMoney } from "@/utils/convert.util";
import { CardImage } from "@/components/MasterData/Plan/CardImage";
import { IconEdit } from "@/components/Global/IconEdit";
import { IconDelete } from "@/components/Global/IconDelete";
import { permissionCreate, permissionDelete, permissionRead, permissionUpdate } from "@/utils/permission.util";

export default function ServiceModules() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [modal, setModal] = useState<boolean>(false);
  const [modalDelete, setModalDelete] = useState<boolean>(false);
  const [typeModal, setTypeModal] = useState<"create" | "edit">("create");
  const [currentBody, setCurrentBody] = useState<TServiceModule>(ResetServiceModule);

  const [userLogger] = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
 
  const getAll = async () => {
    try {
      setLoading(true);
      const {data} = await api.get(`/service-modules?deleted=false&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=${pagination.currentPage}`, configApi());
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

  const openModal = (action: "create" | "edit" = "create", body?: TServiceModule) => {
    if(body) {
      const newBody = {...body}

      newBody.cost = convertNumberMoney(newBody.cost);
      setCurrentBody(newBody);
    };
    
    setTypeModal(action);
    setModal(true);
  };
  
  const openModalDelete = (body: TServiceModule) => {
    setCurrentBody(body);
    setModalDelete(true);
  };

  const destroy = async () => {
    try {
      const { status } = await api.delete(`/service-modules/${currentBody?.id}`, configApi());
      resolveResponse({status, message: "Excluído com sucesso"});
      setModalDelete(false);
      resetModal();
      await getAll();
    } catch (error) {
      resolveResponse(error);
    }
  };
  
  useEffect(() => {
    if(permissionRead("1", "A14")) {
      getAll();
    };
  }, []);

  const handleReturnModal = async (isSuccess: boolean, onCloseModal: boolean = true) => {
    if(isSuccess) {
      if(onCloseModal) {
        setModal(false); 
      }; 
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
    setCurrentBody(ResetServiceModule);

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
              <SlimContainer breadcrump="Módulos de Serviços" breadcrumpIcon="MdApps"
                buttons={
                  <>
                  {
                    permissionCreate("1", "A14") &&
                    <button onClick={() => openModal()} className="slim-bg-primary slim-bg-primary-hover">Adicionar</button>
                  }
                  </>
                }>

                {
                  pagination.data.length > 0 &&
                  <ul className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-2 slim-list-card">
                    {
                      pagination.data.map((x: TServiceModule, i: number) => {
                        return (
                          <CardImage key={x.id} uriImage={x.image} alt="foto do módulo" title={x.name} cost={x.cost} price={x.price} description={x.description}>
                            <div className="place-self-end-safe">
                              <div className="flex gap-3">
                                {
                                  permissionUpdate("1", "A14") &&
                                  <IconEdit action="edit" obj={x} getObj={openModal} />
                                }
                                {
                                  permissionDelete("1", "A14") &&
                                  <IconDelete obj={x} getObj={openModalDelete} />
                                }
                              </div>
                            </div>
                          </CardImage>
                        )                  
                      })
                    }
                  </ul>
                }
                <NotData />
              </SlimContainer>
            </div>

            <ModalServiceModule
              title={typeModal == 'create' ? 'Inserir Módulo de Serviço' : 'Editar Módulo de Serviço'} 
              isOpen={modal} setIsOpen={() => setModal(modal)} 
              onClose={resetModal}
              onSelectValue={handleReturnModal}
              body={currentBody}
            />      

            <ModalDelete 
              title='Excluír Módulo de Serviço'
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
