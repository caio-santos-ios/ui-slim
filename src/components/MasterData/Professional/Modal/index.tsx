"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { Button } from "@/components/Global/Button";
import { TProfessional } from "@/types/masterData/professional/professional.type";
import { withMask } from "use-mask-input";
import { maskCPF, maskPhone, maskZipCode } from "@/utils/mask.util";
import axios from "axios";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean) => void;
    body?: TProfessional
}

export const Modalprofessional = ({title, isOpen, setIsOpen, onClose, onSelectValue, body}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const { register, handleSubmit, reset, getValues, formState: { errors }} = useForm<TProfessional>();
    const [type, setType] = useState([]);
    const [specialty, setSpecialty] = useState([]);
    const [registration, setRegistration] = useState([]);

    const onSubmit: SubmitHandler<TProfessional> = async (body: TProfessional) => {
        if(!body.id) {
          await create(body);
        } else {
          await update(body);
        }
    };

    const create = async (body: TProfessional) => {
        try {
            const { status, data} = await api.post(`/professionals`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            onSelectValue(true);
        } catch (error) {
            resolveResponse(error);
        }
    };
      
    const update = async (body: TProfessional) => {
        try {
            const { status, data} = await api.put(`/professionals`, body, configApi());
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
        };
    };

    const getSelectType = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/generic-tables?deleted=false&table=tipo-profissional&pageSize=10&pageNumber=1`, configApi());
            const result = data.result;    
            setType(result.data);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };
    
    const getSelectSpecialty = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/generic-tables?deleted=false&table=especialidade-profissional&pageSize=10&pageNumber=1`, configApi());
            const result = data.result;    
            setSpecialty(result.data);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };
    
    const getSelectRegistration = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/generic-tables?deleted=false&table=registro-profissional&pageSize=10&pageNumber=1`, configApi());
            const result = data.result;    
            setRegistration(result.data);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const cancel = () => {
        reset({
            id: "",
            name: "",
            email: "",
            phone: "",
            cpf: "",
            address: {},
            type: "",        
            specialty: "",       
            registration: "",     
            number: "",
        });

        onClose();
    };

    useEffect(() => {
        if(body) {
            reset(body);
        };
    }, [body]);
    
    useEffect(() => {
        getSelectType();
        getSelectSpecialty();
        getSelectRegistration();
    }, []);

    return (
        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto container-modal">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className="w-full max-w-6xl rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="bg-red mb-4 border-b-3 header-modal">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">{title}</DialogTitle>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 mb-2">
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Nome</label>
                                    <input {...register("name")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>E-mail</label>
                                    <input {...register("email")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Telefone</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("phone")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>CPF</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskCPF(e)} {...register("cpf")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>CEP</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => getAddressByZipCode(e)} {...register("address.zipCode")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Número</label>
                                    <input {...register("address.number")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Rua</label>
                                    <input {...register("address.street")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Bairro</label>
                                    <input {...register("address.neighborhood")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Cidade</label>
                                    <input {...register("address.city")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Estado</label>
                                    <input {...register("address.state")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col col-span-3 mb-2`}>
                                    <label className={`label slim-label-primary`}>Complemento</label>
                                    <input {...register("address.complement")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>                                
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Tipo de Profissional</label>
                                    <select className="select slim-select-primary" {...register("type")}>
                                        <option value="">Selecione</option>
                                        {
                                            type.map((x: any) => (
                                                <option key={x.id} value={x.id}>{x.description}</option>
                                            ))
                                        }
                                    </select>
                                </div>                                
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Especialidade</label>
                                    <select className="select slim-select-primary" {...register("specialty")}>
                                        <option value="">Selecione</option>
                                        {
                                            specialty.map((x: any) => (
                                                <option key={x.id} value={x.id}>{x.description}</option>
                                            ))
                                        }
                                    </select>
                                </div>                                
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Registro</label>
                                    <select className="select slim-select-primary" {...register("registration")}>
                                        <option value="">Selecione</option>
                                        {
                                            registration.map((x: any) => (
                                                <option key={x.id} value={x.id}>{x.description}</option>
                                            ))
                                        }
                                    </select>
                                </div>                    
                                 <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Código</label>
                                    <input {...register("number")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>             
                            </div>                          
                                                   
                            <div className="flex justify-end gap-2 w-12/12 mt-3">
                                <button type="button" onClick={cancel} className="slim-btn slim-btn-primary-light">Cancelar</button>
                                {/* <button type="submit" className="slim-btn slim-btn-primary">Salvar</button> */}
                                <Button text="Salvar" theme="primary" styleClassBtn=""/>
                            </div>  
                        </form>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>    
    )
}