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
import { modalAtom } from "@/jotai/global/modal.jotai";
import { permissionCreate, permissionRead } from "@/utils/permission.util";
import { ModalForwarding } from "@/components/Services/Forwarding/Modal";
import { TableForwarding } from "@/components/Services/Forwarding/Table";
import { ModalAppointment } from "@/components/Services/Appointment/Modal";

export default function Forwarding() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [modal, setModal] = useAtom(modalAtom);
  const [userLogger] = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
  const [id, setId] = useState<string>("");
 
  const getAll = async () => {
    try {
      setLoading(true);
      const {data} = await api.get(`/appointments`, configApi());
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

  const openModal = () => {
    setId("");
    setModal(true);
  };

  const resetModal = () => {
    setId("")
    setModal(false);
  };

  useEffect(() => {
    if(permissionRead("2", "B25")) {
      getAll();
    };
  }, []);

  const handleReturnModal = async () => {
    await getAll();
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
              <SlimContainer breadcrump="Agendamentos" breadcrumpIcon="MdEventAvailable"
                buttons={
                  <>
                    {
                      permissionCreate("2", "B25") &&
                      <button onClick={() => openModal()} className="slim-bg-primary slim-bg-primary-hover">Adicionar</button>
                    }
                  </>
                }>

                <NotData />
                <TableForwarding handleReturnModal={handleReturnModal} list={pagination.data} />
              </SlimContainer>
            </div>

            <ModalAppointment
              title='Inserir Agendamento' 
              isOpen={modal} setIsOpen={() => setModal(modal)} 
              onClose={resetModal}
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
