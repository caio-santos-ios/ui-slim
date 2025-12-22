"use client";

import { TableAccountReceivable } from "@/components/AccountsReceivable/Table";
import { Autorization } from "@/components/Global/Autorization";
import { Header } from "@/components/Global/Header";
import { NotData } from "@/components/Global/NotData";
import { Pagination } from "@/components/Global/Pagination";
import { SideMenu } from "@/components/Global/SideMenu";
import { SlimContainer } from "@/components/Global/SlimContainer";
import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect } from "react";

export default function AccountsReceivable() {
  const [userLogger] = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
  const [_, setLoading] = useAtom(loadingAtom);  

  const getAll = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/accounts-receivable?deleted=false&orderBy=createdAt&sort=desc&pageSize=15&pageNumber=${pagination.currentPage}`, configApi());
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

  const onSelectValue = async (isSuccess: boolean) => {
    await getAll();
  }

  useEffect(() => {
    getAll();
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
              <SlimContainer breadcrump="Contas a Receber" breadcrumpIcon="FaMoneyBillTrendUp"
                buttons={
                  <>
                    {/* <button onClick={() => openModal()} className="slim-bg-primary slim-bg-primary-hover">Adicionar</button> */}
                  </>
                }>


                <TableAccountReceivable list={pagination.data} onSelectValue={onSelectValue} />
                <NotData />
                {/* <Pagination passPage={getAll} /> */}
              </SlimContainer>
            </div>
          </main>
        </>
        :
        <></>
      }
    </>
  );
}
