"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api, uriBase } from "@/service/api.service";
import { useEffect } from "react";
import { Button } from "@/components/Global/Button";
import { maskMoney } from "@/utils/mask.util";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { toast } from "react-toastify";
import { ResetServiceModule, TServiceModule } from "@/types/masterData/serviceModules/serviceModules.type";
import { convertStringMoney } from "@/utils/convert.util";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean, onCloseModal?: boolean) => void;
    body?: TServiceModule;
}

export const ModalServiceModule = ({title, isOpen, setIsOpen, onClose, onSelectValue, body}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const { register, handleSubmit, reset, watch, setValue, formState: { errors }} = useForm<TServiceModule>();
    const currentImage = watch("uri");

    const onSubmit: SubmitHandler<TServiceModule> = async (body: TServiceModule) => {
        const formBody = new FormData();
        const cost: any = convertStringMoney(body.cost.toString());
        const price: any = convertStringMoney(body.price.toString());

        formBody.append("description", body.description);
        formBody.append("active", body.active);
        formBody.append("cost", body.cost);
        formBody.append("name", body.name);
        formBody.append("cost", cost);
        formBody.append("price", price);
        formBody.append("uri", body.uri);
        formBody.append("type", body.type);

        const attachment: any = document.querySelector('#image');
        if (attachment.files[0]) formBody.append('image', attachment.files[0]);
        
        if(!body.id) {
            await create(formBody);
        } else {
            formBody.append("uri", body.image);
            formBody.append("id", body.id);
            await update(formBody);
        }
    };

    const create = async (form: FormData) => {
        try {
            const { status, data} = await api.post(`/service-modules`, form, configApi(false));
            resolveResponse({status, ...data});
            cancel();
            onSelectValue(true);
        } catch (error) {
            resolveResponse(error);
        }
    };
      
    const update = async (form: FormData) => {
        try {
            const { status, data} = await api.put(`/service-modules`, form, configApi(false));
            resolveResponse({status, ...data});
            cancel();
            onSelectValue(true);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const updateImage = async (form: FormData) => {
        try {
            const { status, data} = await api.put(`/service-modules/save-image`, form, configApi(false));
            resolveResponse({status, ...data});

            const newImage = data.result.data.image;

            setValue("uri", newImage);
            onSelectValue(true, false);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const cancel = () => {
        reset(ResetServiceModule);

        onClose();
    };

    const validatedImage = (uri: string) =>  {
        if(!uri) return '/assets/images/notImage.png';

        return `${uriBase}/${uri}`;
    };

    useEffect(() => {
        reset(ResetServiceModule);

        if(body?.id) {
            reset(body);
        };
    }, [body]);

    useEffect(() => {
        const attachment: any = document.querySelector('#image');
        if(attachment) {
            if(attachment.files.length > 0) {
                const formBody = new FormData();
                
                if (attachment.files[0]) formBody.append('image', attachment.files[0]);
                if(body?.id) {
                    formBody.append("id", body.id);
                };
                updateImage(formBody);
            };
        };
    }, [watch("image")]);

    const validatedField = () => {
        const errorPriority = [
            "name",
            "cost",
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
                            <div className="grid grid-cols-1 lg:grid-cols-8 gap-2 mb-2">                                    
                                <div className={`flex flex-col col-span-3 justify-center items-center`}>
                                    <label htmlFor="image" className={`label slim-label-primary w-42 h-42 object-cover cursor-pointer`}>
                                        <img className="w-full h-full object-cover rounded-full" src={validatedImage(currentImage)} alt="foto do plano" />
                                        <input hidden id="image" {...register("image")} type="file" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </label>
                                </div>
    
                                <div className={`flex flex-col col-span-5`}>
                                    <div className="flex flex-col mb-2">
                                        <label className={`label slim-label-primary`}>Nome</label>
                                        <input {...register("name", {required: "Nome é obrigatório"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>Custo</label>
                                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskMoney(e)} {...register("cost", {required: "Custo é obrigatório"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>  
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>Preço</label>
                                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskMoney(e)} {...register("price", {required: "Preço é obrigatório"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
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
                                </div>
                                <div className={`flex flex-col col-span-7 mb-2`}>
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
                                <Button type="button" click={cancel} text="Cancelar" theme="primary-light" styleClassBtn=""/>
                                <Button type="submit" click={validatedField} text="Salvar" theme="primary" styleClassBtn=""/>
                            </div>  
                        </form>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>    
    )
}