"use client";

import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { Autorization } from "@/components/Global/Autorization";
import { Header } from "@/components/Global/Header";
import { SideMenu } from "@/components/Global/SideMenu";
import { SlimContainer } from "@/components/Global/SlimContainer";
import { NotData } from "@/components/Global/NotData";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { modalAtom } from "@/jotai/global/modal.jotai";
import { permissionCreate, permissionRead } from "@/utils/permission.util";
import { TableTradingTable } from "@/components/MasterData/TradingTable/Table";
import { ModalTradingTable } from "@/components/MasterData/TradingTable/Modal";

export default function TradingTable() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [modal, setModal] = useAtom(modalAtom);
  const [userLogger] = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
 
  const getAll = async () => {
    try {
      setLoading(true);
      const {data} = await api.get(`/trading-tables?deleted=false&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=${pagination.currentPage}`, configApi());
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
    if(permissionRead("1", "A25")) {
      getAll();
    };
  }, [])

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
              <SlimContainer breadcrump="Tabela de Negociação" breadcrumpIcon="MdTableChart"
                buttons={
                  <>
                    {
                      permissionCreate("1", "A25") &&
                      <button onClick={() => setModal(true)} className="slim-bg-primary slim-bg-primary-hover">Adicionar</button>
                    }           
                  </>
                }>
                
                <TableTradingTable list={pagination.data} handleReturnModal={handleReturnModal} />
                <NotData />
              </SlimContainer>
            </div>
          </main>

          <ModalTradingTable
            title='Inserir Tabela de Negociação' 
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
