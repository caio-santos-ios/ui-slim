"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useState } from "react";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { Button } from "@/components/Global/Button";
import { SubmitHandler, useForm } from "react-hook-form";
import { ResetTradingTable, TTradingTable, TTradingTableItem } from "@/types/masterData/tradingTable/tradingTable.type";
import { TServiceModule } from "@/types/masterData/serviceModules/serviceModules.type";
import { TProcedure } from "@/types/masterData/procedure/procedure.type";
import { maskMoney } from "@/utils/mask.util";
import { convertMoneyToNumber, convertNumberMoney, convertStringMoney } from "@/utils/convert.util";
import { toast } from "react-toastify";
import { permissionDelete, permissionUpdate } from "@/utils/permission.util";
import { IconEdit } from "@/components/Global/IconEdit";
import { IconDelete } from "@/components/Global/IconDelete";
import { ModalDelete } from "@/components/Global/ModalDelete";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    handleReturnModal: (isSuccess: boolean) => void;
    id: string;
}

export const ModalTradingTable = ({title, isOpen, setIsOpen, onClose, handleReturnModal, id}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [serviceModules, setServiceModule] = useState<TServiceModule[]>([]);
    const [procedures, setProcedure] = useState<TProcedure[]>([]);
    const [modalDelete, setModalDelete] = useState<boolean>(false);
    
    const { register, handleSubmit, reset, watch, getValues, setValue, formState: { errors }} = useForm<TTradingTable>({
        defaultValues: ResetTradingTable
    });

    const items = watch("items");

    const onSubmit: SubmitHandler<TTradingTable> = async (body: TTradingTable) => {
        if(!body.serviceModuleId) return toast.warning("Módulo de Serviço é obrigatório", {theme: 'colored'});
        if(!body.procedureId) return toast.warning("Procedimento é obrigatório", {theme: 'colored'});

        const form: any = {
            name: body.name,
            items: body.items
        };

        if(!body.item) {
            form.items.push({
                item: (form.items.length + 1).toString(),
                serviceModuleId: body.serviceModuleId,
                procedureId: body.procedureId,
                subTotal: convertMoneyToNumber(body.subTotal),
                discount: convertMoneyToNumber(body.discount),
                total: convertMoneyToNumber(body.total)
            });
        } else {
            const index = items.findIndex(x => x.item == body.item);
            form.items[index] = {
                item: body.item,
                serviceModuleId: body.serviceModuleId,
                procedureId: body.procedureId,
                subTotal: convertMoneyToNumber(body.subTotal),
                discount: convertMoneyToNumber(body.discount),
                total: convertMoneyToNumber(body.total)
            };
        };

        if(!body.id) {
            await create(form);
        } else {
            form.id = body.id;
            await update(form);
        }
    };

    const create = async (body: TTradingTable) => {
        try {
            const { status, data} = await api.post(`/trading-tables`, body, configApi());
            const result = data.result;

            getById(result.data.id);
            setValue("id", result.data.id);
            resolveResponse({status, ...data});
            handleReturnModal(true);
        } catch (error) {
            resolveResponse(error);
        }
    };
        
    const update = async (body: TTradingTable) => {
        try {
            const { status, data} = await api.put(`/trading-tables`, body, configApi());
            const result = data.result;

            resolveResponse({status, ...data});
            getById(result.data.id);
            handleReturnModal(true);
            setValue("serviceModuleId", "");
            setValue("procedureId", "");
            setValue("subTotal", 0);
            setValue("discount", 0);
            setValue("total", 0);
        } catch (error) {
            resolveResponse(error);
        }
    };

    
    const getById = async (id: string) => {
        try {
            setLoading(true);
            const {data} = await api.get(`/trading-tables/${id}`, configApi());
            const result = data.result;
            reset(result.data);
            setValue("subTotal", convertStringMoney(result.data.subTotal));
            setValue("discount", convertStringMoney(result.data.discount));
            setValue("total", convertStringMoney(result.data.total));
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const getItem = (action: string, item: TTradingTableItem) => {
        setValue("item", item.item);
        setValue("serviceModuleId", item.serviceModuleId);
        setValue("procedureId", item.procedureId);
        setValue("subTotal", convertNumberMoney(item.subTotal));
        setValue("discount", convertNumberMoney(item.discount));
        setValue("total", convertNumberMoney(item.total));
    };
    
    const getItemDelete = (item: TTradingTableItem) => {
        setValue("item", item.item);
        setModalDelete(true);       
    };

    const destroy = async () => {
        const newItems = items.filter(x => x.item != watch("item"));

        const form: any = {
            id: watch("id"),
            name: watch("name"),
            items: newItems
        };

        await update(form);
        setModalDelete(false);
    };

    const cancel = () => {
        reset(ResetTradingTable);
        onClose();
    };

    const getSelectServiceModule = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/service-modules/select`, configApi());
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
            const {data} = await api.get(`/procedures/select`, configApi());
            const result = data.result;
            setProcedure(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const normalizeServiceModuleDescription = (id: string) => {
        const serviceModule = serviceModules.find(x => x.id == id);
        return serviceModule ? serviceModule.name : "";
    };

    const normalizeProcedureDescription = (id: string) => {
        const procedure = procedures.find(x => x.id == id);
        return procedure ? procedure.name : "";
    };

    useEffect(() => {
        if(watch("subTotal")) {
            const subTotal = convertMoneyToNumber(watch("subTotal"));
            const discount = convertMoneyToNumber(watch("discount"));
            const total = subTotal - discount;

            setValue("total", total >= 0 ? convertNumberMoney(total) : 0);
        };
    }, [watch("subTotal"), watch("discount")]);

    useEffect(() => {
        getSelectServiceModule();
        getSelectProcedure();
        
        if (!id) return;
        getById(id);
    }, [id]);

    return (
        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto container-modal">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className="w-full max-w-3xl rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="bg-red mb-4 border-b-3 header-modal">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">{title}</DialogTitle>
                        </div>

                       <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 mb-2">
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Nome</label>
                                    <input {...register("name")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>   
                                {/* <div className={`flex flex-col col-span-3 mb-2`}>
                                    <label className={`label slim-label-primary`}>Nome</label>
                                    <input {...register("name")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>    */}
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary flex gap-1 items-center`}>Módulo de Serviço</label>
                                    <select className="select slim-select-primary" {...register("serviceModuleId")}>
                                        <option value="">Selecione</option>
                                        {
                                            serviceModules.map((x: any) => {
                                                return <option key={x.id} value={x.id}>{x.name}</option>
                                            })
                                        }
                                    </select>
                                </div>
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary flex gap-1 items-center`}>Procedimento</label>
                                    <select className="select slim-select-primary" {...register("procedureId")}>
                                        <option value="">Selecione</option>
                                        {
                                            procedures.map((x: any) => {
                                                return <option key={x.id} value={x.id}>{x.name}</option>
                                            })
                                        }
                                    </select>
                                </div>
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>SubTotal</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskMoney(e)} {...register("subTotal")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>  
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Desconto</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskMoney(e)} {...register("discount")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>  
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Total</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskMoney(e)} {...register("total")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>  
                                <div className={`flex flex-col col-span-6 mb-2`}>
                                    {
                                        items.length > 0 &&
                                        <div className="slim-container-table w-full">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50 slim-table-thead">
                                                    <tr>
                                                        <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tl-xl`}>Módulo de Serviço</th>
                                                        <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Procedimento</th>
                                                        <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>SubTotal</th>
                                                        <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Desconto</th>
                                                        <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Total</th>
                                                        <th scope="col" className={`px-4 py-3 text-center text-sm font-bold text-gray-500 tracking-wider rounded-tr-xl`}>Ações</th>
                                                    </tr>
                                                </thead>
                        
                                                <tbody className="bg-white divide-y divide-gray-100">
                                                    {
                                                        items.map((x: any) => {
                                                            return (
                                                                <tr key={x.item}>                                            
                                                                    <td className="px-4 py-2">{normalizeServiceModuleDescription(x.serviceModuleId)}</td>
                                                                    <td className="px-4 py-2">{normalizeProcedureDescription(x.procedureId)}</td>
                                                                    <td className="px-4 py-2">R$ {convertNumberMoney(x.subTotal)}</td>
                                                                    <td className="px-4 py-2">R$ {convertNumberMoney(x.discount)}</td>
                                                                    <td className="px-4 py-2">R$ {convertNumberMoney(x.total)}</td>
                                                                    <td className="p-2">
                                                                        <div className="flex justify-center gap-3">       
                                                                            {
                                                                                permissionUpdate("1", "A25") &&
                                                                                <IconEdit action="edit" obj={x} getObj={getItem}/>
                                                                            }   
                                                                            {
                                                                                permissionDelete("1", "A25") &&
                                                                                <IconDelete obj={x} getObj={getItemDelete}/>                                                   
                                                                            }                                          
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    }                             
                                </div>  
                            </div>                          
                            <div className="flex justify-end gap-2 w-12/12 mt-3">
                                <Button type="button" click={cancel} text="Fechar" theme="primary-light" styleClassBtn=""/>
                                <Button type="submit" text="Salvar" theme="primary" styleClassBtn=""/>
                            </div>  
                        </form>    

                        <ModalDelete
                            title='Excluír Item'
                            isOpen={modalDelete} setIsOpen={() => setModalDelete(!modalDelete)} 
                            onClose={() => setModalDelete(false)}
                            onSelectValue={destroy}
                        />                                          
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}