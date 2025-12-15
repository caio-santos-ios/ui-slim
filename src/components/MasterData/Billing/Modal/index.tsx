"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { Button } from "@/components/Global/Button";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { toast } from "react-toastify";
import { TBilling } from "@/types/masterData/billing/billing.type";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean) => void;
    body?: TBilling
}

export const ModalBilling = ({title, isOpen, setIsOpen, onClose, onSelectValue, body}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const { register, handleSubmit, reset, getValues, formState: { errors }} = useForm<TBilling>();
    const [type, setType] = useState([]);
    const [specialty, setSpecialty] = useState([]);
    const [registration, setRegistration] = useState([]);

    const onSubmit: SubmitHandler<TBilling> = async (body: TBilling) => {
        if(!body.id) {
          await create(body);
        } else {
          await update(body);
        }
    };

    const create = async (body: TBilling) => {
        try {
            const { status, data} = await api.post(`/billings`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            onSelectValue(true);
        } catch (error) {
            resolveResponse(error);
        }
    };
      
    const update = async (body: TBilling) => {
        try {
            const { status, data} = await api.put(`/billings`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            onSelectValue(true);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const cancel = () => {
        reset({
            id: "",
            name: "",
            description: "",
            start: "",
            end: "",
            deliveryDate: "",
            billingDate: ""
        });

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

    useEffect(() => {
        reset({
            name: "",
            description: "",
            start: "",
            end: "",
            deliveryDate: "",
            billingDate: ""
        });

        if(body?.id) {
            reset(body);
        };
    }, [body]);

    const validatedField = () => {
        const errorPriority = [
            "name",
            "description",
            "start",
            "end",
            "deliveryDate",
            "billingDate",
        ];

        const getErrorByPath = (path: string) => {
            const parts = path.split(".");
            let current: any = errors;

            for (const part of parts) {
                if (!current[part]) return null;
                current = current[part];
            }

            return current.message || null;
        };

        for (const field of errorPriority) {
            const message = getErrorByPath(field);

            if (message) {
                toast.warn(message, { theme: "colored" });
                return; 
            }
        }
    };

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
                                    <input {...register("name", {required: "Nome é obrigatório"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                                                          
                                <div className={`flex flex-col col-span-4 mb-2`}>
                                    <label className={`label slim-label-primary`}>Descrição</label>
                                    <input {...register("description", {required: "Descrição é obrigatório"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>              
                            </div>                          
                            
                            <div className="grid grid-cols-1 lg:grid-cols-8 gap-2 mb-2">
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Inicio da Realização</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskDayMonth(e)} {...register("start", {required: "Inicio da Realização é obrigatório"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Fim da Realização</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskDayMonth(e)} {...register("end", {required: "Fim da Realização é obrigatório"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Data Entrega de Faturamento</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskDayMonth(e)} {...register("deliveryDate", {required: "Data de Entrega de Faturamento é obrigatório"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Data de Faturamento</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskDayMonth(e)} {...register("billingDate", {required: "Data de Faturamento é obrigatório"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                
                            </div>                          
                                                   
                            <div className="flex justify-end gap-2 w-12/12 mt-3">
                                <button type="button" onClick={cancel} className="slim-btn slim-btn-primary-light">Cancelar</button>
                                <Button click={validatedField} text="Salvar" theme="primary" styleClassBtn=""/>
                            </div>  
                        </form>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>    
    )
}