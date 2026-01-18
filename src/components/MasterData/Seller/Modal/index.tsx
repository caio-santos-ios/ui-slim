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
import { TSeller } from "@/types/masterData/seller/seller.type";
import { TSellerRepresentative } from "@/types/masterData/sellerRepresentative/sellerRepresentative.type";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean) => void;
    body?: TSeller
}

export const ModalSeller = ({title, isOpen, setIsOpen, onClose, onSelectValue, body}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const { register, handleSubmit, reset, getValues, formState: { errors }} = useForm<TSeller>();

    const onSubmit: SubmitHandler<TSeller> = async (body: TSeller) => {
        if(!body.id) {
          await create(body);
        } else {
          await update(body);
        }
    };

    const create = async (body: TSeller) => {
        try {
            const { status, data} = await api.post(`/sellers`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            onSelectValue(true);
        } catch (error) {
            resolveResponse(error);
        }
    };
      
    const update = async (body: TSeller) => {
        try {
            const { status, data} = await api.put(`/sellers`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            onSelectValue(true);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getAddressByZipCode = async (zipCode: React.ChangeEvent<HTMLInputElement>) => {
        let value = zipCode.target.value.replace(/\D/g, "");

        if(value.length == 8) {
            setLoading(true);
            const {data} = await axios.get(`https://viacep.com.br/ws/${value}/json/`);
            reset({
                ...getValues(),
                address: {
                    city: data.localidade,
                    complement: data.complemento,
                    neighborhood: data.bairro,
                    number: getValues("address.number"),
                    parent: "",
                    parentId: "",
                    state: data.estado,
                    street: data.logradouro,
                    zipCode: data.cep
                }
            })
            setLoading(false);
        };
    };
    
    const cancel = () => {
        reset({
            id: "",
            name: "",
            email: "",
            phone: "",
            cpf: "",
            address: {
                city: "",
                complement: "",
                neighborhood: "",
                number: "",
                parent: "",
                parentId: "",
                state: "",
                street: "",
                zipCode: ""
            },
            notes: "",
            type: "internal"
        });

        onClose();
    };

    useEffect(() => {
        reset({
            id: "",
            name: "",
            email: "",
            phone: "",
            cpf: "",
            address: {
                city: "",
                complement: "",
                neighborhood: "",
                number: "",
                parent: "",
                parentId: "",
                state: "",
                street: "",
                zipCode: ""
            },
            notes: "",
            type: "internal"
        });
        
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
                          
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 mb-2">
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Tipo</label>
                                    <select className="select slim-select-primary" {...register("type", {required: "Tipo de Profissional é obrigatório"})}>
                                        <option value="internal">Interno</option>
                                        <option value="external">Externo</option>                                        
                                    </select>
                                </div>         
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Nome</label>
                                    <input {...register("name", {required: "Nome é obrigatório"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col col-span-3 mb-2`}>
                                    <label className={`label slim-label-primary`}>E-mail</label>
                                    <input {...register("email", {required: "E-mail é obrigatório", pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "E-mail inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Telefone</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("phone", {required: "Telefone é obrigatório"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>CPF</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskCPF(e)} {...register("cpf", {required: "CPF é obrigatório", validate: value => validatorCPF(value) || "CPF inválido"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>CEP</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => getAddressByZipCode(e)} {...register("address.zipCode", {required: "CEP é obrigatório", minLength: {value: 8, message: "CEP inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Número</label>
                                    <input {...register("address.number", {required: "Número é obrigatório"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col col-span-3 mb-2`}>
                                    <label className={`label slim-label-primary`}>Rua</label>
                                    <input {...register("address.street", {required: "Rua é obrigatória"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Bairro</label>
                                    <input {...register("address.neighborhood", {required: "Bairro é obrigatório"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Cidade</label>
                                    <input {...register("address.city", {required: "Cidade é obrigatória"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Estado</label>
                                    <input {...register("address.state", {required: "Estado é obrigatório"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col col-span-5 mb-2`}>
                                    <label className={`label slim-label-primary`}>Complemento</label>
                                    <input {...register("address.complement")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                               
                                <div className={`flex flex-col col-span-7 mb-2`}>
                                    <label className={`label slim-label-primary`}>Observações</label>
                                    <textarea {...register("notes")} className={`slim-textarea slim-textarea-primary`} placeholder="Digite" rows={4}></textarea>
                                </div>
                            </div>                          
                                                   
                            <div className="flex justify-end gap-2 w-12/12 mt-3">
                                <button type="button" onClick={cancel} className="slim-btn slim-btn-primary-light">Cancelar</button>
                                <Button type="submit" click={validatedField} text="Salvar" theme="primary" styleClassBtn=""/>
                            </div>  
                        </form>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>    
    )
}