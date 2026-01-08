"use client";

import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
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
import { permissionCreate, permissionRead } from "@/utils/permission.util";
import { ModalForwarding } from "@/components/Services/Forwarding/Modal";
import { TableForwarding } from "@/components/Services/Forwarding/Table";

export default function Forwarding() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [modal, setModal] = useAtom(modalAtom);
  const [userLogger] = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
  const [id, setId] = useState<string>("");
 
  const getAll = async () => {
    try {
      setLoading(true);
      const {data} = await api.get(`/forwardings`, configApi());
      const result = data.result;
      console.log(result)
      setPagination({
        currentPage: 1,
        data: result.data,
        sizePage: 10,
        totalPages: 100
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
    if(permissionRead("2", "B24")) {
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
              <SlimContainer breadcrump="Encaminhamentos" breadcrumpIcon="MdSwapHoriz"
                buttons={
                  <>
                    {
                      permissionCreate("2", "B24") &&
                      <button onClick={() => openModal()} className="slim-bg-primary slim-bg-primary-hover">Adicionar</button>
                    }
                  </>
                }>

                <NotData />
                <TableForwarding handleReturnModal={handleReturnModal} list={pagination.data} />
              </SlimContainer>
            </div>

            <ModalForwarding
              title='Inserir Encaminhamento' 
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
