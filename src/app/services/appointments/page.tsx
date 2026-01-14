"use client";

import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveParamsRequest, resolveResponse } from "@/service/config.service";
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
import { ModalAppointment } from "@/components/Services/Appointment/Modal";
import { TableAppointment } from "@/components/Services/Appointment/Table";
import { SubmitHandler, useForm } from "react-hook-form";
import { ResetAppointmentSearch, TAppointmentSearch } from "@/types/service/appointment/appointment.type";
import { TRecipient } from "@/types/masterData/customers/customerRecipient.type";
import { Button } from "@/components/Global/Button";

export default function Forwarding() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [modal, setModal] = useAtom(modalAtom);
  const [userLogger] = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
  const [id, setId] = useState<string>("");
  const [recipient, setRecipient] = useState<TRecipient[]>([]);

  const { register, handleSubmit, formState: { errors }} = useForm<TAppointmentSearch>({
    defaultValues: ResetAppointmentSearch
  });

  const getAll = async () => {
    try {
      setLoading(true);
      const {data} = await api.get(`/appointments?deleted=false${resolveParamsRequest(pagination.query)}`, configApi());
      const result = data.result;

      setPagination({
        currentPage: 1,
        data: result.data,
        sizePage: 10,
        totalPages: result.data.length
      });

      await getSelectRecipient();
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<TAppointmentSearch> = async (body: TAppointmentSearch) => {
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

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 mb-2">                    
                    {/* <div className={`flex flex-col col-span-3 mb-2`}>
                      <label className={`label slim-label-primary`}>Beneficiários</label>
                      <select className="select slim-select-primary" {...register("beneficiaryUuid")}>
                        <option value="">Todos</option>
                        {recipient.map((x: any) => <option key={x.id} value={x.rapidocId}>{x.name}</option>)}
                      </select>                        
                    </div>                             */}
                    <div className={`flex flex-col col-span-2 mb-2`}>
                      <label className={`label slim-label-primary`}>Status</label>
                      <select className="select slim-select-primary" {...register("status")}>
                        <option value="">Todos</option>
                        <option value="SCHEDULED">Agendada</option>
                        <option value="CANCELED">Cancelado</option>
                      </select>
                    </div>                            
                    <div className={`flex flex-col justify-end col-span-1 mb-2`}>
                      <Button type="submit" text="Buscar" theme="primary-light" styleClassBtn=""/>
                    </div>                                          
                  </div>                          
                </form>

                <NotData />
                <TableAppointment handleReturnModal={handleReturnModal} list={pagination.data} />
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
