"use client";

import "./style.css";
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { Button } from "@/components/Global/Button";
import { maskPhone } from "@/utils/mask.util";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { ResetContact, TContact } from "@/types/masterData/contact/contact.type";
import { TGenericTable } from "@/types/masterData/genericTable/genericTable.type";
import { modalGenericTableAtom, tableGenericTableAtom } from "@/jotai/global/modal.jotai";
import { FaCirclePlus } from "react-icons/fa6";
import { ModalGenericTable } from "@/components/Global/ModalGenericTable";

type TProp = {
    onResult: () => void;
    body?: TContact;
    parent: string;
    parentId: string;
}

export const ModalContact = ({onResult, body, parent, parentId}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [__, setModalGenericTable] = useAtom(modalGenericTableAtom);
    const [___, setTableGenericTable] = useAtom(tableGenericTableAtom);
    const [departaments, setDepartament] = useState<TGenericTable[]>([]);
    const [positions, setPosition] = useState<TGenericTable[]>([]);
    
    const { register, handleSubmit, reset, watch, formState: { errors }} = useForm<TContact>();

    const onSubmit: SubmitHandler<TContact> = async (body: TContact) => {
        body.parent = parent;
        body.parentId = parentId;

        if(watch("id")) {
            await update(body);
        } else {
            await create(body);
        }
    };

    const create = async (body: TContact, isMessage = true) => {
        try {
            const { status, data} = await api.post('/contacts', body, configApi());
            cancel()
            onResult();
            
            if(isMessage) {
                resolveResponse({status, ...data});
            };
            
        } catch (error) {
            resolveResponse(error);
        }
    };
    
    const update = async (body: TContact, isMessage = false) => {
        try {
            const { status, data} = await api.put(`/contacts`, body, configApi());
            cancel()
            onResult();

            if(isMessage) {
                resolveResponse({status, ...data});
            };

        } catch (error) {
            resolveResponse(error);
        }
    };

    const cancel = () => {
        reset(ResetContact);
    };

    const getSelectDepartament = async () => {
        try {
            const {data} = await api.get(`/generic-tables/table/departamento-contato`, configApi());
            const result = data.result;
            setDepartament(result.data);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getSelectPosition = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/generic-tables/table/funcao-contato`, configApi());
            const result = data.result;
            setPosition(result.data);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const onReturnGeneric = () => {
        getSelectDepartament();
        getSelectPosition();
    };

    const genericTable = (table: string) => {
        setModalGenericTable(true);
        setTableGenericTable(table);
    };

    useEffect(() => {
        reset(ResetContact);
        onReturnGeneric();

        if(body) {
            reset(body);
        };
    }, [body]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 mb-2">
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>Nome</label>
                    <input {...register("name")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>E-mail</label>
                    <input {...register("email", {pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "E-mail inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Telefone</label>
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("phone")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>WhatsApp</label>
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("whatsapp")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary flex gap-1 items-center`}>Departamento <span onClick={() => genericTable("departamento-contato")} className="pr-2 cursor-pointer"><FaCirclePlus /></span></label>
                    <select className="select slim-select-primary" {...register("department")}>
                        <option value="">Selecione</option>
                        {
                            departaments.map((x: any) => {
                                return <option key={x.code} value={x.code}>{x.description}</option>
                            })
                        }
                    </select>
                </div>
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary flex gap-1 items-center`}>Função <span onClick={() => genericTable("funcao-contato")} className="pr-2 cursor-pointer"><FaCirclePlus /></span></label>
                    <select className="select slim-select-primary" {...register("position")}>
                        <option value="">Selecione</option>
                        {
                            positions.map((x: any) => {
                                return <option key={x.code} value={x.code}>{x.description}</option>
                            })
                        }
                    </select>
                </div>
                 <div className={`flex flex-col justify-end mb-2`}>
                    <Button type="button" click={cancel} text="Cancelar" theme="primary-light" styleClassBtn="h-20"/>
                </div>
                <div className={`flex flex-col justify-end mb-2`}>
                    <Button type="submit" text={watch("id") ? 'Salvar' : 'Adicionar'} theme="primary" styleClassBtn=""/>
                </div> 
            </div>

            <ModalGenericTable onReturn={onReturnGeneric} />
        </form>
    )
}