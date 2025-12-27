"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { Button } from "@/components/Global/Button";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { toast } from "react-toastify";
import { ResteBilling, ResteBillingItem, TBilling, TBillingItem } from "@/types/masterData/billing/billing.type";
import { permissionDelete, permissionUpdate } from "@/utils/permission.util";
import { IconEdit } from "@/components/Global/IconEdit";
import { IconDelete } from "@/components/Global/IconDelete";
import { useEffect, useState } from "react";
import { ModalDelete } from "@/components/Global/ModalDelete";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean) => void;
    id: string
}

export const ModalBilling = ({title, isOpen, setIsOpen, onClose, onSelectValue, id}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const { register, handleSubmit, reset, getValues, setValue, watch, formState: { errors }} = useForm<TBilling>();
    const [modalDelete, setModalDelete] = useState<boolean>(false);
    const items = watch("items") ?? [];

    const onSubmit: SubmitHandler<TBilling> = async (body: TBilling) => {
        if(!body.name) return toast.warning("Nome é obrigatório", {theme: 'colored'});
        if(!body.description) return toast.warning("Descrição é obrigatório", {theme: 'colored'});
        if(!body.item.start) return toast.warning("Inicio da Realização é obrigatório", {theme: 'colored'});
        if(!body.item.end) return toast.warning("Fim da Realização é obrigatório", {theme: 'colored'});
        if(!body.item.deliveryDate) return toast.warning("Data Entrega de Faturamento é obrigatório", {theme: 'colored'});
        if(!body.item.billingDate) return toast.warning("Data de Pagamento é obrigatório", {theme: 'colored'});

        const myItem = {...body.item};

        if(!myItem.item) {
            myItem.item = (body.items.length + 1).toString();
            body.items.push(myItem);
        } else {
            const index = body.items.findIndex(x => x.item == myItem.item);
            body.items[index] = myItem;
        };
        
        if(!body.id) {
          await create(body);
        } else {
          await update(body);
        }
    };

    const create = async (body: TBilling) => {
        try {
            const { status, data} = await api.post(`/billings`, body, configApi());
            const result = data.result;

            resolveResponse({status, ...data});
            setValue("item", ResteBillingItem)
            onSelectValue(true);

            setValue("item", ResteBillingItem)
            getById(result.data.id);
        } catch (error) {
            resolveResponse(error);
        }
    };
      
    const update = async (body: TBilling) => {
        try {
            const { status, data} = await api.put(`/billings`, body, configApi());
            const result = data.result;

            resolveResponse({status, ...data});
            onSelectValue(true);
            setValue("item", ResteBillingItem)
            getById(result.data.id);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getById = async (id: string) => {
        try {
            setLoading(true);
            const {data} = await api.get(`/billings/${id}`, configApi());
            const result = data.result;
            reset(result.data);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const cancel = () => {
        reset(ResteBilling);

        onClose();
    };

    const maskDayMonth = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value.replace(/\D/g, '');

        value = value.slice(0, 4);

        let day = value.substring(0, 2);
        let month = value.substring(2, 4);

        if (day.length === 2) {
            const dayNumber = Number(day);
            if (dayNumber > 31) {
                day = '31';
            } else if (dayNumber === 0) {
                day = '01';
            }
        }

        if (month.length === 2) {
            const monthNumber = Number(month);
            if (monthNumber > 12) {
                month = '12';
            } else if (monthNumber === 0) {
                month = '01';
            }
        }

        let formatted = day;
        if (month.length > 0) {
            formatted += '/' + month;
        }

        event.target.value = formatted;
    };

    const getCurrentBody = (action: string, item: any) => {
        setValue("item", item);
    };
    
    const getDestroy = (item: any) => {
        setValue("item.item", item.item);
        setModalDelete(true);
    };

    const destroyItem = async () => {
        const newItems = items.filter(x => x.item != watch("item.item"));

        setValue("items", newItems);
        await update({...getValues()});
        setModalDelete(false);
    };
    
    useEffect(() => {
        if(!id) return;
        getById(id);
    }, [id]);

    return (
        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto container-modal">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className="w-full max-w-5xl rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="bg-red mb-4 border-b-3 header-modal">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">{title}</DialogTitle>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 lg:grid-cols-7 gap-2 mb-2">
                                <div className={`flex flex-col col-span-3 mb-2`}>
                                    <label className={`label slim-label-primary`}>Nome</label>
                                    <input {...register("name")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                                                          
                                <div className={`flex flex-col col-span-4 mb-2`}>
                                    <label className={`label slim-label-primary`}>Descrição</label>
                                    <input {...register("description")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>              
                            </div>                          
                            
                            <div className="grid grid-cols-1 lg:grid-cols-8 gap-2 mb-2">
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Inicio da Realização</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskDayMonth(e)} {...register("item.start")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Fim da Realização</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskDayMonth(e)} {...register("item.end")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Data Entrega de Faturamento</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskDayMonth(e)} {...register("item.deliveryDate")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Data de Pagamento</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskDayMonth(e)} {...register("item.billingDate")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>           
                            </div>                          
                            {
                                items.length > 0 &&
                                <div className="slim-container-table w-full bg-white shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 slim-table-thead">
                                            <tr>
                                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tl-xl`}>Inicio da Realização</th>
                                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Fim da Realização</th>
                                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Data Entrega de Faturamento</th>
                                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Data de Pagamento</th>
                                                <th scope="col" className={`px-4 py-3 text-center text-sm font-bold text-gray-500 tracking-wider rounded-tr-xl`}>Ações</th>
                                            </tr>
                                        </thead>
                
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {
                                                items.map((x: TBillingItem) => {
                                                    return (
                                                        <tr key={x.item}>                                            
                                                            <td className="px-4 py-2">{x.start}</td>
                                                            <td className="px-4 py-2">{x.end}</td>
                                                            <td className="px-4 py-2">{x.deliveryDate}</td>
                                                            <td className="px-4 py-2">{x.billingDate}</td>
                                                            <td className="p-2">
                                                                <div className="flex justify-center gap-3">
                                                                    {
                                                                        permissionUpdate("1", "11") &&
                                                                        <IconEdit action="edit" obj={x} getObj={getCurrentBody}/>
                                                                    }                                                                                                       
                                                                    {
                                                                        permissionDelete("1", "11") &&
                                                                        <IconDelete obj={x} getObj={getDestroy}/>                                                   
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
                                                   
                            <div className="flex justify-end gap-2 w-12/12 mt-3">
                                <Button click={cancel} text="Cancelar" theme="primary-light" styleClassBtn=""/>
                                <Button type="submit" text="Salvar" theme="primary" styleClassBtn=""/>
                            </div>  
                        </form>

                        <ModalDelete 
                            title='Excluír Item'
                            isOpen={modalDelete} setIsOpen={() => setModalDelete(modalDelete)} 
                            onClose={() => setModalDelete(false)}
                            onSelectValue={destroyItem}
                        />
                    </DialogPanel>
                </div>
            </div>
        </Dialog>    
    )
}