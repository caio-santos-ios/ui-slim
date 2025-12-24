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
import { modalAtom } from "@/jotai/global/modal.jotai";
import { TableInPerson } from "@/components/Services/InPerson/Table";
import { ModalInPerson } from "@/components/Services/InPerson/Modal";
import { ModalUser } from "@/components/MasterData/User/Modal";
import { TableUser } from "@/components/MasterData/User/Table";
import { permissionCreate, permissionRead } from "@/utils/permission.util";

export default function User() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [modal, setModal] = useAtom(modalAtom);
  const [id, setId] = useState<string>("");

  const [userLogger] = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
 
  const getAll = async () => {
    try {
      setLoading(true);
      const {data} = await api.get(`/users?deleted=false&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=${pagination.currentPage}`, configApi());
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
      setId(body.id);
    };
    
    setModal(true);
  };

  const handleReturnModal = async () => {
    await getAll();
  };
  
  useEffect(() => {
    if(permissionRead("1", "11")) {
      getAll();
    };
  }, []);

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
              <SlimContainer breadcrump="Usuários" breadcrumpIcon="FaUsers"
                buttons={
                  <>
                    {
                      permissionCreate("1", "11") &&
                      <button onClick={() => openModal()} className="slim-bg-primary slim-bg-primary-hover">Adicionar</button>
                    }
                  </>
                }>

                <NotData />
                <TableUser handleReturnModal={handleReturnModal} list={pagination.data} />
              </SlimContainer>
            </div>

            <ModalUser
              title='Inserir Usuário' 
              isOpen={modal} setIsOpen={() => setModal(modal)} 
              onClose={() => setModal(false)}
              handleReturnModal={handleReturnModal}
              id={id}
            />  
          </main>
        </>
        :
        <></>
      }
    </>
  );
}
