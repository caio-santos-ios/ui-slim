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
import { TProcedure } from "@/types/masterData/procedure/procedure.type";
import { IoClose } from "react-icons/io5";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean) => void;
    body?: TProcedure
}

export const ModalProcedure = ({title, isOpen, setIsOpen, onClose, onSelectValue, body}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [type, setType] = useState([]);
    const [codes, setCodes] = useState([]);
    
    const { register, handleSubmit, reset, formState: { errors }} = useForm<TProcedure>();


    const onSubmit: SubmitHandler<TProcedure> = async (body: TProcedure) => {
        if(!body.id) {
          await create(body);
        } else {
          await update(body);
        }
    };

    const create = async (body: TProcedure) => {
        try {
            const { status, data} = await api.post(`/procedures`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            onSelectValue(true);
        } catch (error) {
            resolveResponse(error);
        }
    };
      
    const update = async (body: TProcedure) => {
        try {
            const { status, data} = await api.put(`/procedures`, body, configApi());
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
            code: "",
            description: "",
            serviceModuleId: "",
            externalCodes: "",
            notes: "",
            active: true
        });

        onClose();
    };

    const getSelectService = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/service-modules?deleted=false&pageSize=10&pageNumber=1`, configApi());
            const result = data.result;    
            setType(result.data);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };
    
    const getSelectTableReference = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/generic-tables/table/codigos-externos-procedimento`, configApi());
            const result = data.result;    
            setCodes(result.data);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        reset({
            id: "",
            name: "",
            code: "",
            description: "",
            serviceModuleId: "",
            externalCodes: "",
            notes: "",
            active: true
        });

        if(body) {
            reset(body);
        };
    }, [body]);
    
    useEffect(() => {
        getSelectService();
        getSelectTableReference();
    }, []);

    const validatedField = () => {
        const errorPriority = [
            "name",
            "price",
            "description",
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
                        className="w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl"
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
                                    <input {...register("name", {required: "Nome é obrigatório"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                                  
                                <div className={`flex flex-col col-span-4 mb-2`}>
                                    <label className={`label slim-label-primary`}>Descrição</label>
                                    <input {...register("description", {required: "Descrição é obrigatório"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                                  
                                <div className={`flex flex-col col-span-3 mb-2`}>
                                    <label className={`label slim-label-primary`}>Tabela Referência</label>
                                    <select className="select slim-select-primary" {...register("externalCodes")}>
                                        <option value="">Selecione</option>                                       
                                        {
                                            codes.map((x: any, i: number) => (
                                                <option key={i} value={x.id}>{x.description}</option>
                                            ))
                                        }
                                    </select>
                                </div>                            
                                <div className={`flex flex-col col-span-3 mb-2`}>
                                    <label className={`label slim-label-primary`}>Programa</label>
                                    <select className="select slim-select-primary" {...register("serviceModuleId", {required: "Programa é obrigatório"})}>
                                        <option value="">Selecione</option>
                                        {
                                            type.map((x: any, i: number) => (
                                                <option key={i} value={x.id}>{x.name}</option>
                                            ))
                                        }
                                    </select>
                                </div>                            
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Status</label>
                                    <label className="slim-switch">
                                        <input {...register("active")} type="checkbox"/>
                                        <span className="slider"></span>
                                    </label>
                                </div>                              
                                <div className={`flex flex-col col-span-7 mb-2`}>
                                    <label className={`label slim-label-primary`}>Observações</label>
                                    <textarea {...register("notes")} className={`slim-textarea slim-textarea-primary`} placeholder="Digite" rows={4}></textarea>
                                </div>   
                            </div>                          
                                                   
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