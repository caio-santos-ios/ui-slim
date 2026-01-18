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
        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto container-modal">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className="slim-modal w-full max-w-3xl rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="slim-modal-title mb-4 border-b-3">
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
                                    <label className={`label slim-label-primary`}>Módulo de Serviço</label>
                                    <select className="select slim-select-primary" {...register("serviceModuleId", {required: "Módulo de Serviço é obrigatório"})}>
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
                    </DialogPanel>
                </div>
            </div>
        </Dialog>    
    )
}