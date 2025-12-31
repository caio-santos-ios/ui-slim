"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { Button } from "@/components/Global/Button";
import { modalGenericTableAtom, tableGenericTableAtom } from "@/jotai/global/modal.jotai";
import { ResetInPerson, TInPerson } from "@/types/service/inPerson/inPerson.type";
import { TRecipient } from "@/types/masterData/customers/customerRecipient.type";
import { TAccreditedNetwork } from "@/types/masterData/accreditedNetwork/accreditedNetwork.type";
import { TServiceModule } from "@/types/masterData/serviceModules/serviceModules.type";
import { TProcedure } from "@/types/masterData/procedure/procedure.type";
import { maskMoney } from "@/utils/mask.util";
import { convertInputStringMoney, convertMoneyToNumber, convertNumberMoney, convertStringMoney } from "@/utils/convert.util";
import MultiSelect from "@/components/Global/MultiSelect";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    handleReturnModal: () => void;
    id: string;
}

export const ModalInPerson = ({title, isOpen, setIsOpen, onClose, handleReturnModal, id}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [recipient, setRecipient] = useState<TRecipient[]>([]);
    const [accreditedNetworks, setAccreditedNetwork] = useState<TAccreditedNetwork[]>([]);
    const [serviceModules, setServiceModule] = useState<TServiceModule[]>([]);
    const [produceres, setProcedure] = useState<TProcedure[]>([]);
    const [listProduceres, setListProcedure] = useState<TProcedure[]>([]);
    const [myProcedures, setMyProcedure] = useState<TProcedure[]>([]);
    const [currentAccreditedNetwork, setCurrentAccreditedNetwork] = useState<any[]>([]);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors }} = useForm<TInPerson>({
        defaultValues: ResetInPerson
    });

    const onSubmit: SubmitHandler<TInPerson> = async (body: TInPerson) => {
        if(!body.date) body.date = null;   

        const list: any = myProcedures.map(x => x.id);
        body.procedureIds = list;

        if(!body.value) body.value = 0;
        if(body.value) body.value = convertStringMoney(body.value);
        
        if(!body.id) {
          await create(body);
        } else {
          await update(body);
        }
    };

    const create = async (body: TInPerson) => {
        try {
            const { status, data} = await api.post(`/in-persons`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            handleReturnModal();
        } catch (error) {
            resolveResponse(error);
        }
    };
      
    const update = async (body: TInPerson) => {
        try {
            const { status, data} = await api.put(`/in-persons`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            handleReturnModal();
        } catch (error) {
            resolveResponse(error);
        }
    };

    const cancel = () => {
        reset(ResetInPerson);
        onClose();
    };

    const getById = async (id: string) => {
        try {
            setLoading(true);
            const {data} = await api.get(`/in-persons/${id}`, configApi());
            const result = data.result;
            console.log(result.data)
            reset({
                ...result.data,
                date: result.data.date ? result.data.date.split("T")[0] : null,
                value: convertNumberMoney(result.data.value)
            });

            setMyProcedure(result.data.procedureIds);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const getSelectRecipient = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/customer-recipients/select?deleted=false&orderBy=createdAt&sort=desc`, configApi());
            const result = data.result;
            setRecipient(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const getSelectAccreditedNetwork = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/accredited-networks/select?deleted=false&orderBy=createdAt&sort=desc`, configApi());
            const result = data.result;
            setAccreditedNetwork(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const getSelectServiceModule = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/service-modules/select?deleted=false&orderBy=createdAt&sort=desc`, configApi());
            const result = data.result;
            setServiceModule(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };    
    
    const getSelectProcedure = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/procedures/select?deleted=false&orderBy=createdAt&sort=desc`, configApi());
            const result = data.result;
            setProcedure(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };
    
    const getByAccreditedNetworkId = async (accreditedNetworkId: string) => {
        try {
            setLoading(true);
            const {data} = await api.get(`/trading-tables/accredited-network/${accreditedNetworkId}`, configApi());
            const result = data.result;
            setCurrentAccreditedNetwork(result.data.items ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const selectModule = (module: TProcedure[]) => {
        setMyProcedure(module)
        const total = module.reduce((value: number, x: any) => value + convertMoneyToNumber(x.total), 0);
        setValue("value", convertNumberMoney(total));
    };
    
    useEffect(() => {
        if(watch("accreditedNetworkId")) {
            const accreditedNetworkId = watch("accreditedNetworkId");
            getByAccreditedNetworkId(accreditedNetworkId);

            const procedureByServiceModuleId: any[] = currentAccreditedNetwork.filter((x: any) => x.serviceModuleId == watch("serviceModuleId"));
            const newProcedures = procedureByServiceModuleId.map((x: any) => ({
                ...x,
                id: x.procedureId,
                name: produceres.find(p => p.id == x.procedureId) ? produceres.find(p => p.id == x.procedureId)?.name : ""
            }));                    
            setListProcedure(newProcedures);
        };
    }, [watch("serviceModuleId"), watch("accreditedNetworkId")]);

    useEffect(() => {
        reset(ResetInPerson);
        getSelectRecipient();
        getSelectAccreditedNetwork();
        getSelectServiceModule();
        getSelectProcedure();
    }, []);

    useEffect(() => {
        if(id) {
            getById(id);
        };
    }, [id]);

    return (
        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto container-modal">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className="w-full max-w-4xl rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="bg-red mb-4 border-b-3 header-modal">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">{title}</DialogTitle>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 mb-2">
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Beneficiário</label>
                                    <select className="select slim-select-primary" {...register("recipientId")}>
                                        <option value="">Selecione</option>
                                        {
                                            recipient.map((x: any) => {
                                                return <option key={x.id} value={x.id}>{x.name}</option>
                                            })
                                        }
                                    </select>
                                </div>
                                <div className={`flex flex-col col-span-4 mb-2`}>
                                    <label className={`label slim-label-primary`}>Unidade Credenciada</label>
                                    <select className="select slim-select-primary" {...register("accreditedNetworkId")}>
                                        <option value="">Selecione</option>
                                        {
                                            accreditedNetworks.map((x: any) => {
                                                return <option key={x.id} value={x.id}>{x.corporateName}</option>
                                            })
                                        }
                                    </select>
                                </div>
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Módulo de Serviço</label>
                                    <select className="select slim-select-primary" {...register("serviceModuleId")}>
                                        <option value="">Selecione</option>
                                        {
                                            serviceModules.map((x: any) => {
                                                return <option key={x.id} value={x.id}>{x.name}</option>
                                            })
                                        }
                                    </select>
                                </div>
                                <div className={`flex flex-col col-span-4 mb-2`}>
                                    <label className={`label slim-label-primary`}>Procedimento</label>                                    
                                    <MultiSelect maxSelected={3} descriptionSelectedMax="Procedimentos Selecionados" value={myProcedures ?? []} onChange={(items) => selectModule(items)} options={listProduceres} labelKey="name" valueKey="id" />
                                </div>
                                <div className={`flex flex-col col-span-1 mb-2`}>
                                    <label className={`label slim-label-primary`}>Data</label>
                                    <input {...register("date")} type="date" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div> 
                                <div className={`flex flex-col col-span-1 mb-2`}>
                                    <label className={`label slim-label-primary`}>Horário</label>
                                    <input {...register("hour")} type="time" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div> 
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Responsável pelo Pagamento</label>
                                    <select className="select slim-select-primary" {...register("responsiblePayment")}>
                                        <option value="Pasbem">Pasbem</option>
                                        <option value="Contratante">Contratante</option>
                                    </select>
                                </div>
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Valor</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskMoney(e)} {...register("value")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div> 
                            </div>                          
                            <div className="flex justify-end gap-2 w-12/12 mt-3">
                                <Button type="button" click={cancel} text="Fechar" theme="primary-light" styleClassBtn=""/>
                                <Button type="submit" text="Salvar" theme="primary" styleClassBtn=""/>
                            </div>  
                        </form>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>    
    )
}