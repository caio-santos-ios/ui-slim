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
import { permissionCreate, permissionRead } from "@/utils/permission.util";
import { ModalForwarding } from "@/components/Services/Forwarding/Modal";
import { TableForwarding } from "@/components/Services/Forwarding/Table";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { Button } from "@/components/Global/Button";
import { SubmitHandler, useForm } from "react-hook-form";
import { ResetForwardingSearch, TForwardingSearch } from "@/types/service/forwarding/forwarding.type";
import { TRecipient } from "@/types/masterData/customers/customerRecipient.type";

export default function Forwarding() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [modal, setModal] = useAtom(modalAtom);
  const [userLogger] = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
  const [id, setId] = useState<string>("");
  const [recipient, setRecipient] = useState<TRecipient[]>([]);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors }} = useForm<TForwardingSearch>({
    defaultValues: ResetForwardingSearch
  });

  const getAll = async () => {
    try {
      setLoading(true);
      const {data} = await api.get(`/forwardings?deleted=false${resolveParamsRequest(pagination.query)}`, configApi());
      const result = data.result;

      setPagination({
        currentPage: 1,
        data: result.data,
        sizePage: 10,
        totalPages: 100
      });
      await getSelectRecipient();
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

  const onSubmit: SubmitHandler<TForwardingSearch> = async (body: TForwardingSearch) => {
    setPagination({
      currentPage: pagination.currentPage,
      data: pagination.data,
      sizePage: pagination.sizePage,
      totalPages: pagination.totalPages,
      query: body
    })

    await getAll();
  };

  const getSelectRecipient = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/customer-recipients/select`, configApi());
      const result = data.result;
      setRecipient(result.data);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
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
                  <></>
                }>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 mb-2">                    
                    <div className={`flex flex-col col-span-3 mb-2`}>
                      <label className={`label slim-label-primary`}>Beneficiários</label>
                      <select className="select slim-select-primary" {...register("beneficiaryUuid")}>
                        <option value="">Todos</option>
                        {recipient.map((x: any) => <option key={x.id} value={x.rapidocId}>{x.name}</option>)}
                      </select>                        
                    </div>                            
                    <div className={`flex flex-col col-span-2 mb-2`}>
                      <label className={`label slim-label-primary`}>Status</label>
                      <select className="select slim-select-primary" {...register("status")}>
                        <option value="">Todos</option>
                        <option value="PENDING">Pendente</option>
                        <option value="FINISHED">Finalizado</option>
                        <option value="NON_SCHEDULABLE">Não Programado</option>
                        <option value="UNFINISHED">Incabado</option>
                        <option value="CANCELED">Cancelado</option>
                      </select>
                    </div>                            
                    <div className={`flex flex-col justify-end col-span-1 mb-2`}>
                      <Button type="submit" text="Buscar" theme="primary-light" styleClassBtn=""/>
                    </div>                                          
                  </div>                          
                </form>
                <NotData />
                <TableForwarding handleReturnModal={handleReturnModal} list={pagination.data} />
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
