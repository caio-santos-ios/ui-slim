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
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { permissionCreate, permissionRead } from "@/utils/permission.util";
import { ModalAppointment } from "@/components/Services/Appointment/Modal";
import { TableHistoric } from "@/components/Services/Historic/Table";

export default function Historic() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [userLogger] = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
 
  const getAll = async () => {
    try {
      setLoading(true);
      const {data} = await api.get(`/historics`, configApi());
      const result = data.result;

      setPagination({
        currentPage: 1,
        data: result.data,
        sizePage: 100,
        totalPages: result.data.length
      });
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(permissionRead("2", "B26")) {
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
              <SlimContainer breadcrump="Histórico" breadcrumpIcon="MdHistory"
                buttons={
                  <></>
                }>

                <NotData />
                <TableHistoric list={pagination.data} />
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
