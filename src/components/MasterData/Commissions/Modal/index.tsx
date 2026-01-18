"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect } from "react";
import { Button } from "@/components/Global/Button";
import { maskCPF, maskPhone } from "@/utils/mask.util";
import axios from "axios";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { toast } from "react-toastify";
import { validatorCPF } from "@/utils/validator.utils";
import { ResetCommissions, TCommissions } from "@/types/masterData/commissions/commissions.type";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean) => void;
    body?: TCommissions
}

export const ModalCommissions = ({title, isOpen, setIsOpen, onClose, onSelectValue, body}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const { register, handleSubmit, reset, getValues, watch, formState: { errors }} = useForm<TCommissions>();

    const onSubmit: SubmitHandler<TCommissions> = async (body: TCommissions) => {
        if(!body.id) {
          await create(body);
        } else {
          await update(body);
        }
    };

    const create = async (body: TCommissions) => {
        try {
            const { status, data} = await api.post(`/sellers`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            onSelectValue(true);
        } catch (error) {
            resolveResponse(error);
        }
    };
      
    const update = async (body: TCommissions) => {
        try {
            const { status, data} = await api.put(`/sellers`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            onSelectValue(true);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const cancel = () => {
        reset(ResetCommissions);

        onClose();
    };

    useEffect(() => {
        reset(ResetCommissions);
        
        if(body) {
            reset(body);
        };
    }, [body]);

    const validatedField = () => {
        const errorPriority = [
            "type",
            "name",
            "email",
            "phone",
            "cpf",
            "address.zipCode",
            "address.number",
            "address.street",
            "address.neighborhood",
            "address.city",
            "address.state"
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
                    <DialogPanel transition className="slim-modal w-full max-w-6xl rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="slim-modal-title mb-4 border-b-3">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">{title}</DialogTitle>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)}>
                          
                            <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 mb-2">
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Nome da Regra</label>
                                    <input {...register("ruleName", {required: "Nome da Regra é obrigatório"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col col-span-3 mb-2`}>
                                    <label className={`label slim-label-primary`}>Descrição</label>
                                    <input {...register("description", {required: "Descrição é obrigatório"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                                                                            
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Tipo</label>
                                    <select className="select slim-select-primary" {...register("type", {required: "Tipo é obrigatório"})}>
                                        <option value="internal">Interno</option>
                                        <option value="external">Externo</option>                                        
                                    </select>
                                </div>  
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Mobilidade</label>
                                    <select className="select slim-select-primary" {...register("typeModality", {required: "Mobilidade é obrigatório"})}>
                                        <option value="Volume de Vendas">Volume de Vendas</option>
                                        <option value="Valor Monetário">Valor Monetário</option>                                        
                                    </select>
                                </div>  
                                <div className={`flex flex-col col-span-1 mb-2`}>
                                    <label className={`label slim-label-primary`}>{watch("typeModality") == 'Volume de Vendas' ? 'De n° de vidas' : 'De Valor em Reais'}</label>
                                    <input {...register("startNumberModality", {required: watch("typeModality") == 'Volume de Vendas' ? 'De n° de vidas é obrigatório' : 'De Valor em Reais é obrigatório'})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div> 

                                <div className={`flex flex-col col-span-1 mb-2`}>
                                    <label className={`label slim-label-primary`}>{watch("typeModality") == 'Volume de Vendas' ? 'Até n° de vidas' : 'Até Valor em Reais'}</label>
                                    <input {...register("endNumberModality", {required: watch("typeModality") == 'Volume de Vendas' ? 'Até n° de vidas é obrigatório' : 'Até Valor em Reais é obrigatório'})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div> 
                                <div className={`flex flex-col col-span-7 mb-2`}>
                                    <label className={`label slim-label-primary`}>Observações</label>
                                    <textarea {...register("notes")} className={`slim-textarea slim-textarea-primary`} placeholder="Digite" rows={4}></textarea>
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