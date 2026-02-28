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
import { TProfessional } from "@/types/masterData/professional/professional.type";
import { IoClose } from "react-icons/io5";

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
    const [professionals, setProfessional] = useState<TProfessional[]>([]);

    const [serviceModulesDefault, setServiceModuleDefault] = useState<TServiceModule[]>([]);

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
            const {data} = await api.get(`/accredited-networks/select?deleted=false&active=true&orderBy=createdAt&sort=desc`, configApi());
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
            setServiceModuleDefault(result.data ?? []);
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
    
    const getSelectProfessional = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/professionals/select?deleted=false&orderBy=createdAt&sort=desc`, configApi());
            const result = data.result;
            setProfessional(result.data ?? []);
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
            console.log(result.data)
            if(result.data) {
                setCurrentAccreditedNetwork(result.data.items ?? []);
            } else {
                setCurrentAccreditedNetwork([]);
            }
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
        const handler = async () => {
            const networkId = watch("accreditedNetworkId");
            const moduleId = watch("serviceModuleId");

            if (!networkId) return;

            try {
                setLoading(true);
                const {data} = await api.get(`/trading-tables/accredited-network/${networkId}`, configApi());
                const result = data.result;
                if(result.data) {
                    const newListServiceModule: TServiceModule[] = [];

                    result.data.items.map((x: any) => {
                        const module = serviceModulesDefault.find(m => m.id == x.serviceModuleId);

                        if(module) {
                            const existed = newListServiceModule.find(nm => nm.id == x.serviceModuleId);
                            if(!existed) {
                                newListServiceModule.push(module);
                            };
                        };
                    });

                    setServiceModule(newListServiceModule);
                    
                    if(moduleId) {
                        const procedureByServiceModuleId: any[] = result.data.items.filter((x: any) => x.serviceModuleId == moduleId);
                        const newProcedures = procedureByServiceModuleId.map((x: any) => ({
                            ...x,
                            id: x.procedureId,
                            name: produceres.find(p => p.id == x.procedureId) ? produceres.find(p => p.id == x.procedureId)?.name : ""
                        }));                    
                        setListProcedure(newProcedures);
                    }
                } else {
                    setServiceModule([]);
                    setListProcedure([]);
                    setMyProcedure([]);
                }
            } catch (error) {
                resolveResponse(error);
            } finally {
                setLoading(false);
            }
        }

        handler();        
    }, [watch("serviceModuleId"), watch("accreditedNetworkId")]);

    useEffect(() => {
        reset(ResetInPerson);
        getSelectRecipient();
        getSelectAccreditedNetwork();
        getSelectServiceModule();
        getSelectProcedure();
        getSelectProfessional();
    }, []);

    useEffect(() => {
        if(id) {
            getById(id);
            setMyProcedure([]);
            setListProcedure([]);
        };
    }, [id]);

    return (
        <>
            <Dialog
                open={isOpen}
                as="div"
                className="relative z-[999] focus:outline-none"
                onClose={cancel}
            >
                {/* Backdrop */}
                <div
                    className="fixed inset-0 z-[999]"
                    style={{ background: "rgba(0,15,35,.65)", backdropFilter: "blur(5px)" }}
                />

                <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-14 px-4 pb-6 overflow-y-auto">
                    <DialogPanel
                        className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
                        style={{
                            background: "var(--surface-card)",
                            border: "1px solid var(--surface-border)",
                            animation: "modal-slide-in .25s cubic-bezier(.34,1.56,.64,1)",
                        }}
                    >
                        {/* ── Header ── */}
                        <div
                            className="flex items-center justify-between px-6 py-0 h-14"
                            style={{
                                background: "linear-gradient(135deg, var(--primary-color-light) 0%, var(--primary-color) 100%)",
                            }}
                        >
                            <DialogTitle as="h2" className="text-sm font-bold text-white">
                                {title}
                            </DialogTitle>
                            <span
                                onClick={cancel}
                                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer"
                                style={{ background: "rgba(255,255,255,.1)", border: "none", boxShadow: "none", color: "rgba(255,255,255,.7)" }}
                            >
                                <IoClose size={18} />
                            </span>
                        </div>

                        {/* ── Body ── */}
                        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100dvh - 16rem)" }}>
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
                                <div className={`flex flex-col col-span-3 mb-2`}>
                                    <label className={`label slim-label-primary`}>Programa</label>
                                    <select className="select slim-select-primary" {...register("serviceModuleId")}>
                                        <option value="">Selecione</option>
                                        {
                                            serviceModules.map((x: any, i: number) => {
                                                return <option key={i} value={x.id}>{x.name}</option>
                                            })
                                        }
                                    </select>
                                </div>
                                <div className={`flex flex-col col-span-3 mb-2`}>
                                    <label className={`label slim-label-primary`}>Profissional</label>
                                    <select className="select slim-select-primary" {...register("professionalId")}>
                                        <option value="">Selecione</option>
                                        {
                                            professionals.map((x: any, i: number) => {
                                                return <option key={i} value={x.id}>{x.name}</option>
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
                                <Button type="button" click={cancel} text="Cancelar" theme="primary-light" styleClassBtn=""/>
                                <Button type="submit" text="Salvar" theme="primary" styleClassBtn=""/>
                            </div>  
                        </form>
                        </div>

                    </DialogPanel>
                </div>
            </Dialog>
        </>    
    )
}