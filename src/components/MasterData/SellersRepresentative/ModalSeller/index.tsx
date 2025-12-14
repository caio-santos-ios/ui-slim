"use client";

import "./style.css";
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { maskCPF, maskPhone } from "@/utils/mask.util";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { TGenericTable } from "@/types/masterData/genericTable/genericTable.type";
import axios from "axios";
import { ResetSeller, TSeller } from "@/types/masterData/seller/seller.type";
import { Button } from "@/components/Global/Button";

type TProp = {
    body?: TSeller;
    parentId: string;
}

export const ModalSeller = ({parentId, body}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [departaments, setDepartament] = useState<TGenericTable[]>([]);
    const [positions, setPosition] = useState<TGenericTable[]>([]);
    
    const { register, handleSubmit, reset, watch, formState: { errors }} = useForm<TSeller>();

    const onSubmit: SubmitHandler<TSeller> = async (body: TSeller) => {
        if(watch("id")) {
            await update(body);
        } else {
            await create(body);
        }
    };

    const create = async (body: TSeller, isMessage = true) => {
        try {
            const { status, data} = await api.post('/', body, configApi());
            cancel()
            // onResult();
            
            if(isMessage) {
                resolveResponse({status, ...data});
            };
            
        } catch (error) {
            resolveResponse(error);
        }
    };
    
    const update = async (body: TSeller, isMessage = false) => {
        try {
            const { status, data} = await api.put(`/`, body, configApi());
            cancel()
            // onResult();

            if(isMessage) {
                resolveResponse({status, ...data});
            };

        } catch (error) {
            resolveResponse(error);
        }
    };

    const cancel = () => {
        reset(ResetSeller);
    };

    const getAddressByZipCode = async (zipCode: React.ChangeEvent<HTMLInputElement>) => {
        let value = zipCode.target.value.replace(/\D/g, "");

        if(value.length == 8) {
            setLoading(true);
            const {data} = await axios.get(`https://viacep.com.br/ws/${value}/json/`);
            reset({
                ...body,
                address: {
                    city: data.localidade,
                    complement: data.complemento,
                    neighborhood: data.bairro,
                    number: "",
                    parent: "seller-epresentative-seller",
                    parentId,
                    state: data.estado,
                    street: data.logradouro,
                    zipCode: data.cep
                }
            })
            setLoading(false);
        };
    };

    useEffect(() => {
        reset(ResetSeller);

        if(body) {
            reset(body);
        };
    }, [body]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 mb-2">
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Tipo</label>
                    <select className="select slim-select-primary" {...register("type")}>
                        <option value="internal">Interno</option>
                        <option value="external">Externo</option>
                    </select>
                </div>
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>Nome</label>
                    <input {...register("name")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-3 mb-2`}>
                    <label className={`label slim-label-primary`}>E-mail</label>
                    <input {...register("email", { pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "E-mail inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
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
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => getAddressByZipCode(e)} {...register("address.zipCode", {minLength: {value: 8, message: "CEP inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Número</label>
                    <input {...register("address.number")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-3 mb-2`}>
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
                <Button type="button" text="Cancelar" theme="primary-light" styleClassBtn=""/>
                <Button type="submit" text="Salvar" theme="primary" styleClassBtn=""/>
            </div>
        </form>
    )
}