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
import { IoClose } from "react-icons/io5";

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
                        className="w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl"
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
                        </div>

                    </DialogPanel>
                </div>
            </Dialog>
        </>    
    )
}