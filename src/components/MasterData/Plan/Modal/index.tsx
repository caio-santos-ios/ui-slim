"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { Button } from "@/components/Global/Button";
import { maskMoney } from "@/utils/mask.util";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { toast } from "react-toastify";
import { convertNumberMoney, convertStringMoney } from "@/utils/convert.util";
import { TPlan } from "@/types/masterData/plans/plans.type";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean) => void;
    body?: TPlan
}

export const ModalPlan = ({title, isOpen, setIsOpen, onClose, onSelectValue, body}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [type, setType] = useState([]);
    
    const { register, handleSubmit, reset, formState: { errors }} = useForm<TPlan>();


    const onSubmit: SubmitHandler<TPlan> = async (body: TPlan) => {
        if(!body.id) {
          await create(body);
        } else {
          await update(body);
        }
    };

    const create = async (body: TPlan) => {
        try {
            const { status, data} = await api.post(`/plans`, {...body, price: convertStringMoney(body.price.toString())}, configApi());
            resolveResponse({status, ...data});
            cancel();
            onSelectValue(true);
        } catch (error) {
            resolveResponse(error);
        }
    };
      
    const update = async (body: TPlan) => {
        try {
            const { status, data} = await api.put(`/plans`, {...body, price: convertStringMoney(body.price.toString())}, configApi());
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
            name:"",
            description: "",
            price: 0,
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

    useEffect(() => {
        reset({
            id: "",
            name:"",
            description: "",
            price: 0,
            active: true
        });

        if(body) {
            body.price = convertNumberMoney(body.price);
            reset(body);
        };
    }, [body]);
    
    useEffect(() => {
        getSelectService();
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
                    <DialogPanel transition className="w-full max-w-xl rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="bg-red mb-4 border-b-3 header-modal">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">{title}</DialogTitle>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 mb-2">
                                <div className={`flex flex-col col-span-4 mb-2`}>
                                    <label className={`label slim-label-primary`}>Nome</label>
                                    <input {...register("name", {required: "Nome é obrigatório"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                              
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Valor</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskMoney(e)} {...register("price", {required: "Valor é obrigatório"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>      
                                <div className={`flex flex-col col-span-3 mb-2`}>
                                    <label className={`label slim-label-primary`}>Tipo</label>
                                    <select className="select slim-select-primary" {...register("type", {required: "Tipo é obrigatório"})}>
                                        <option value="">Selecione</option>                                       
                                        <option value="B2B">B2B</option>                                       
                                        <option value="B2C">B2C</option>                                       
                                        <option value="B2B e B2C">B2B e B2C</option>                                       
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
                                <div className={`flex flex-col col-span-5 mb-2`}>
                                    <label className={`label slim-label-primary`}>Descrição</label>
                                    <input {...register("description", {required: "Descrição é obrigatório"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>   
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Status</label>
                                    <label className="slim-switch">
                                        <input {...register("active")} type="checkbox"/>
                                        <span className="slider"></span>
                                    </label>
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