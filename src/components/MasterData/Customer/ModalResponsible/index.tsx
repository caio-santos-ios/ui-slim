"use client";

import "./style.css";
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { Button } from "@/components/Global/Button";
import { maskCPF, maskPhone } from "@/utils/mask.util";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { validatorCPF } from "@/utils/validator.utils";
import axios from "axios";
import { ResetCustomerContractor, TCustomerContractor } from "@/types/masterData/customers/customer.type";
import { toast } from "react-toastify";

type TProp = {
    onClose: () => void;
    body?: TCustomerContractor;
    parentId: string;
    onSuccess: (isSuccess: boolean, body: TCustomerContractor) => void;
}

export const ModalResponsible = ({body, parentId, onSuccess, onClose}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [genders, setGender] = useState<any[]>([]);
    const { register, handleSubmit, reset, getValues, watch, formState: { errors }} = useForm<TCustomerContractor>({
        defaultValues: ResetCustomerContractor
    });

    const onSubmit: SubmitHandler<TCustomerContractor> = async (body: TCustomerContractor) => {
        if(!parentId) return toast.warn("Contratante é obrigatório", { theme: 'colored'});

        if(body.responsible.dateOfBirth) body.responsible.dateOfBirth = new Date(body.responsible.dateOfBirth);
        body.responsible.address.parent = "customer-contractor-responsible";
        body.responsible.address.parentId = parentId;

        await update(body);
    };

    const update = async (body: TCustomerContractor) => {
        try {
            body.responsible.dateOfBirth = new Date(body.responsible.dateOfBirth);

            const { status, data} = await api.put(`/customers`, body, configApi());
            resolveResponse({status, ...data});
            onSuccess(true, data.result.data);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getAddressByZipCode = async (zipCode: React.ChangeEvent<HTMLInputElement>, parent: string) => {
        let value = zipCode.target.value.replace(/\D/g, "");

        if(value.length == 8) {
            setLoading(true);
            const {data} = await axios.get(`https://viacep.com.br/ws/${value}/json/`);

            const address = {
                city: data.localidade,
                complement: data.complemento,
                neighborhood: data.bairro,
                number: getValues("address.number"),
                parent: "",
                parentId: "",
                state: data.estado,
                street: data.logradouro,
                zipCode: data.cep
            };
            const bodyCurrent = {...getValues()};
            if(parent == "responsible") {
                bodyCurrent.responsible.address = address;
            } else {
                bodyCurrent.address = address;
            }

            reset(bodyCurrent);
            setLoading(false);
        };
    };

    const cancel = () => {
        reset(ResetCustomerContractor);
        onClose();
    };

    const getSelectGender = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/generic-tables/table/genero`, configApi());
            const result = data.result;
            setGender(result.data);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };    
       
    const getAddressResponsible = async () => {
        try {
            const {data} = await api.get(`/addresses/${watch("id")}/seller-representative-responsible`, configApi());
            const result = data.result;

            // const newBody = {...getValues()};
            // newBody.address.id = result.data.id;
            // reset(newBody);
        } catch (error) {
            resolveResponse(error);
        }
    };
    
    useEffect(() => {
        getSelectGender();

        if(body) {      
            if(body.responsible.dateOfBirth) body.responsible.dateOfBirth = body.responsible.dateOfBirth.toString().split('T')[0];

            reset(body);
        };
    }, [body]);

    useEffect(() => {
        if(errors.responsible?.email) {
            toast.warn(errors.responsible?.email.message, { theme: 'colored'});
            return;
        };
        
        if(errors.responsible?.cpf) {
            toast.warn(errors.responsible?.cpf.message, { theme: 'colored'});
            return;
        };
       
        if(errors.responsible?.address?.zipCode) {
            toast.warn(errors.responsible?.address?.zipCode.message, { theme: 'colored'});
            return;
        };
    }, [errors.responsible?.email, errors.responsible?.cpf, errors.responsible?.address?.zipCode])

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 mb-2">
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>Nome</label>
                    <input {...register("responsible.name")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-3 mb-2`}>
                    <label className={`label slim-label-primary`}>E-mail</label>
                    <input {...register("responsible.email", {pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "E-mail inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>RG</label>
                    <input {...register("responsible.rg" )} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>CPF</label>
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskCPF(e)} {...register("responsible.cpf", {validate: value => validatorCPF(value) || "CPF inválido"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Telefone</label>
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("responsible.phone")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>WhatsApp</label>
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("responsible.whatsapp")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>Gênero</label>
                    <select className="select slim-select-primary" {...register("responsible.gender")}>
                        <option value="">Selecione</option>
                        {
                            genders.map((x: any) => {
                                return <option key={x.code} value={x.code}>{x.description}</option>
                            })
                        }
                    </select>
                </div>
                    <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Data de Nascimento</label>
                    <input {...register("responsible.dateOfBirth")} type="date" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>CEP</label>
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => getAddressByZipCode(e, 'responsible')} {...register("responsible.address.zipCode", {required: "CEP é obrigatório", minLength: {value: 8, message: "CEP inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Número</label>
                    <input {...register("responsible.address.number")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>Rua</label>
                    <input {...register("responsible.address.street")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Bairro</label>
                    <input {...register("responsible.address.neighborhood")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Cidade</label>
                    <input {...register("responsible.address.city")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Estado</label>
                    <input {...register("responsible.address.state")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>Complemento</label>
                    <input {...register("responsible.address.complement")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-7 mb-2`}>
                    <label className={`label slim-label-primary`}>Observações</label>
                    <textarea {...register("responsible.notes")} className={`slim-textarea slim-textarea-primary`} placeholder="Digite" rows={4}></textarea>
                </div>
            </div>
            
            <div className="flex justify-end gap-2 w-12/12 mt-3">
                <button type="button" onClick={cancel} className="slim-btn slim-btn-primary-light">Cancelar</button>
                <Button type="submit" text="Salvar" theme="primary" styleClassBtn=""/>
            </div>
        </form>
    )
}