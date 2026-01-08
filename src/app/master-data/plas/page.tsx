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
import { ResetPlan, TPlan } from "@/types/masterData/plans/plans.type";
import { ModalPlan } from "@/components/MasterData/Plan/Modal";
import { IconEdit } from "@/components/Global/IconEdit";
import { IconDelete } from "@/components/Global/IconDelete";
import { CardImage } from "@/components/MasterData/Plan/CardImage";
import { permissionCreate, permissionDelete, permissionRead, permissionUpdate } from "@/utils/permission.util";

export default function Plan() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [modal, setModal] = useState<boolean>(false);
  const [modalDelete, setModalDelete] = useState<boolean>(false);
  const [typeModal, setTypeModal] = useState<"create" | "edit">("create");
  const [currentBody, setCurrentBody] = useState<TPlan>();

  const [userLogger] = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
 
  const getAll = async () => {
    try {
      setLoading(true);
      const {data} = await api.get(`/plans?deleted=false&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=${pagination.currentPage}`, configApi());
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

  const openModal = (action: "create" | "edit" = "create", body?: TPlan) => {
    if(body) {
      setCurrentBody({...body});
    };
    
    setTypeModal(action);
    setModal(true);
  };
  
  const openModalDelete = (body: TPlan) => {
    setCurrentBody(body);
    setModalDelete(true);
  };

  const destroy = async () => {
    try {
      const { status } = await api.delete(`/plans/${currentBody?.id}`, configApi());
      resolveResponse({status, message: "Excluído com sucesso"});
      setModalDelete(false);
      resetModal();
      await getAll();
    } catch (error) {
      resolveResponse(error);
    }
  };
  
  useEffect(() => {
    if(permissionRead("1", "A15")) {
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

  const resetModal = () => {
    setCurrentBody({...ResetPlan, serviceModuleIds: []});

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
              <SlimContainer breadcrump="Planos" breadcrumpIcon="MdPriceChange"
                buttons={
                  <>
                    {
                      permissionCreate("1", "A15") &&
                      <button onClick={() => openModal()} className="slim-bg-primary slim-bg-primary-hover">Adicionar</button>
                    }
                  </>
                }>

                {
                  pagination.data.length > 0 &&
                  <ul className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-2 slim-list-card">
                    {
                      pagination.data.map((x: TPlan, i: number) => {
                        return (
                          <CardImage key={x.id} uriImage={x.image} alt="foto do plano" title={x.name} cost={x.cost} price={x.price} description={x.description}>
                            <div className="place-self-end-safe">
                              <div className="flex gap-3">
                                {
                                  permissionUpdate("1", "A15") &&
                                  <IconEdit action="edit" obj={x} getObj={openModal} />
                                }
                                {
                                  permissionDelete("1", "A15") &&
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

            <ModalPlan
              title={typeModal == 'create' ? 'Inserir Planos' : 'Editar Planos'} 
              isOpen={modal} setIsOpen={() => setModal(modal)} 
              onClose={resetModal}
              onSelectValue={handleReturnModal}
              body={currentBody}
            />      

            <ModalDelete 
              title='Excluír Planos'
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
