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
import { IoClose } from "react-icons/io5";

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
                        className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl"
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
                                <div className="slim-container-table h-[calc(100dvh-24rem)] w-full">
                                    <table className="min-w-full divide-y">
                                        <thead className="slim-table-thead">
                                            <tr>
                                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider rounded-tl-xl`}>Inicio da Realização</th>
                                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider`}>Fim da Realização</th>
                                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider`}>Data Entrega de Faturamento</th>
                                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider`}>Data de Pagamento</th>
                                                <th scope="col" className={`px-4 py-3 text-center text-sm font-bold tracking-wider rounded-tr-xl`}>Ações</th>
                                            </tr>
                                        </thead>
                
                                        <tbody className="slim-body-table divide-y">
                                            {
                                                items.map((x: TBillingItem) => {
                                                    return (
                                                        <tr className="slim-tr" key={x.item}>                                            
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
                        </div>

                    </DialogPanel>
                </div>
            </Dialog>
        </>    
    )
}