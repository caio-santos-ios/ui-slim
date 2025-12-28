"use client";

import { ModalAccountsPayable } from "@/components/AccountsPayable/Modal";
import { Autorization } from "@/components/Global/Autorization";
import { Header } from "@/components/Global/Header";
import { NotData } from "@/components/Global/NotData";
import { SideMenu } from "@/components/Global/SideMenu";
import { SlimContainer } from "@/components/Global/SlimContainer";
import { ModalSupplier } from "@/components/MasterData/Supplier/Modal";
import { TableSupplier } from "@/components/MasterData/Supplier/Table";
import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { modalAtom } from "@/jotai/global/modal.jotai";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { permissionCreate, permissionRead } from "@/utils/permission.util";
import { useAtom } from "jotai";
import { useEffect } from "react";

export default function Supplier() {
  const [userLogger] = useAtom(userLoggerAtom);
  const [modal, setModal] = useAtom(modalAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
  const [_, setLoading] = useAtom(loadingAtom);  

  const getAll = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/suppliers?deleted=false&orderBy=createdAt&sort=desc&pageSize=15&pageNumber=${pagination.currentPage}`, configApi());
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

  const handleReturnModal = async (isSuccess: boolean) => {
    await getAll();
  };

  useEffect(() => {
    if(permissionRead("1", "A24")) {
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
              <SlimContainer breadcrump="Fornecedores" breadcrumpIcon="MdLocalShipping"
                buttons={
                  <>
                  {
                      permissionCreate("1", "A24") &&
                      <button onClick={() => setModal(true)} className="slim-bg-primary slim-bg-primary-hover">Adicionar</button>
                    }
                  </>
                }>

                <TableSupplier list={pagination.data} handleReturnModal={handleReturnModal} />
                <NotData />
              </SlimContainer>
            </div>
          </main>

          <ModalSupplier
            title='Inserir Fornecedor' 
            isOpen={modal} setIsOpen={() => setModal(modal)} 
            onClose={() => setModal(false)}
            handleReturnModal={handleReturnModal}
            id=""
          />      
        </>
        :
        <></>
      }
    </>
  );
}
