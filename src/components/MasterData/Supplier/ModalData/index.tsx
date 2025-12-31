"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { TGenericTable } from "@/types/masterData/genericTable/genericTable.type";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { Button } from "@/components/Global/Button";
import { convertStringMoney } from "@/utils/convert.util";
import { ResetSupplier, TSupplier } from "@/types/masterData/supplier/supplier.type";
import { maskCNPJ, maskCPF, maskPhone } from "@/utils/mask.util";
import axios from "axios";

type TProp = {
    onClose: () => void;
    handleReturnModal: (isSuccess: boolean) => void;
    id: string;
}

export const ModalData = ({onClose, handleReturnModal, id}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);

    const { register, handleSubmit, reset, watch, getValues, formState: { errors }} = useForm<TSupplier>({
        defaultValues: ResetSupplier
    });

    const onSubmit: SubmitHandler<TSupplier> = async (body: TSupplier) => {
        if(body.effectiveDate) {
            body.effectiveDate = new Date(body.effectiveDate);
        } else {
            body.effectiveDate = null;
        };

        if(body.address.id == null) {
            body.address.id = "";
        };

        if(!body.id) {
          await create(body);
        } else {
          await update(body);
        }
    };

    const create = async (body: TSupplier) => {
        try {
            const { status, data} = await api.post(`/suppliers`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            handleReturnModal(true);
        } catch (error) {
            resolveResponse(error);
        }
    };
      
    const update = async (body: TSupplier) => {
        try {
            const { status, data} = await api.put(`/suppliers`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            handleReturnModal(true);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const cancel = () => {
        reset(ResetSupplier);
        onClose();
    };

    const getById = async (id: string) => {
        try {
            setLoading(true);
            const {data} = await api.get(`/suppliers/${id}`, configApi());
            const result = data.result;

            reset({
                ...result.data,
                dueDate: result.data.dueDate ? result.data.dueDate.split("T")[0] : null,
                effectiveDate: result.data.effectiveDate ? result.data.effectiveDate.split("T")[0] : null,
                value: convertStringMoney(result.data.value)
            });

        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const getCNPJ = async (event: React.ChangeEvent<HTMLInputElement>) => {
        maskCNPJ(event);
        let cnpj = event.target.value.replace(/\D/g, "");
        if(cnpj.length == 14) {
            try {
                setLoading(true);
                const {data} = await api.get(`/receita-ws/${cnpj}`, configApi());
                const body: TSupplier = {...getValues()};
                reset({
                    ...body,
                    tradeName: data.fantasia,
                    corporateName: data.nome,
                    address: {
                        zipCode: data.cep,
                        number: "",
                        street: data.logradouro,
                        city: data.municipio,
                        complement: "",
                        neighborhood: data.bairro,
                        parent: 'accredited-network',
                        parentId: '',
                        state: data.uf
                    },
                    email: data.email
                })
            } catch (error) {
                resolveResponse(error);
            }   finally {
                setLoading(false);
            }
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
            bodyCurrent.address = address;

            reset(bodyCurrent);
            setLoading(false);
        };
    };

    useEffect(() => {
        if(id) {
            getById(id);
        };
    }, [id]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-8 gap-2 mb-2">
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>Tipo</label>
                    <select {...register("type")} className="select slim-select-primary">
                        <option value="">Selecione</option>
                        <option value="J">Pessoa Jurídica</option>
                        <option value="F">Pessoa Fisíca</option>                        
                    </select>
                </div>   
                <div className={`flex flex-col col-span-1 mb-2`}>
                    <label className={`label slim-label-primary`}>{watch("type") == "F" ? "CPF" : "CNPJ"}</label>
                    {
                        watch("type") == "J" ?
                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => getCNPJ(e)} {...register("document")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                        :
                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskCPF(e)} {...register("document")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                    }
                </div>
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>{watch("type") == "J" ? 'Razão Social' : 'Nome'}</label>
                    <input {...register("corporateName")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                {
                    watch("type") == "J" &&
                    <div className={`flex flex-col col-span-3 mb-2`}>
                        <label className={`label slim-label-primary`}>Nome Fantasia</label>
                        <input {...register("tradeName")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                    </div>
                }
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>E-mail</label>
                    <input {...register("email", { pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "E-mail inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Telefone</label>
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("phone")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div> 
                <div className={`flex flex-col col-span-1 mb-2`}>
                    <label className={`label slim-label-primary`}>Vigência</label>
                    <input {...register("effectiveDate")} type="date" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>CEP</label>
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => getAddressByZipCode(e, '')} {...register("address.zipCode", {minLength: {value: 8, message: "CEP inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Número</label>
                    <input {...register("address.number")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col ${watch("type") == "J" ? 'col-span-3' : 'col-span-3'} mb-2`}>
                    <label className={`label slim-label-primary`}>Rua</label>
                    <input {...register("address.street")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>Bairro</label>
                    <input {...register("address.neighborhood")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-1 mb-2`}>
                    <label className={`label slim-label-primary`}>Cidade</label>
                    <input {...register("address.city")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2 col-span-1`}>
                    <label className={`label slim-label-primary`}>Estado</label>
                    <input {...register("address.state")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-4 mb-2`}>
                    <label className={`label slim-label-primary`}>Complemento</label>
                    <input {...register("address.complement")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-8 mb-2`}>
                    <label className={`label slim-label-primary`}>Observações</label>
                    <textarea {...register("notes")} className={`slim-textarea slim-textarea-primary`} placeholder="Digite" rows={4}></textarea>
                </div>                
            </div>                          
            <div className="flex justify-end gap-2 w-12/12 mt-3">
                <Button type="button" click={onClose} text="Fechar" theme="primary-light" styleClassBtn=""/>
                <Button type="submit" text="Salvar" theme="primary" styleClassBtn=""/>
            </div>  
        </form> 
    )
}