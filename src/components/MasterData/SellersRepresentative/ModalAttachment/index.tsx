"use client";

import "./style.css";
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { Button } from "@/components/Global/Button";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { ResetAttachment, TAttachment } from "@/types/masterData/attachment/attachment.type";

type TProp = {
    // title: string;
    // isOpen: boolean;
    // setIsOpen: (isOpen: boolean) => void;
    // onClose: () => void;
    onResult: () => void;
    body?: TAttachment;
    parentId: string;
}

export const ModalAttchment = ({body, parentId, onResult}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const { register, handleSubmit, reset, getValues, watch, formState: { errors }} = useForm<TAttachment>();

    const onSubmit: SubmitHandler<TAttachment> = async (body: TAttachment) => {
        if(body.id) {
            update(body);
        } else {
            create(body);
        };
    };

    const create = async (body: TAttachment, isClose: boolean = true, isMessage = true) => {
        try {
            const formBody = new FormData();
            formBody.append("type", body.type);
            formBody.append("parent", "seller-representative");
            formBody.append("parentId", parentId);

            const attachment: any = document.querySelector('#attachment');
            if (attachment.files[0]) formBody.append('file', attachment.files[0]);

            const { status, data} = await api.post('/attachments', formBody, configApi(false));
            cancel();

            if(isMessage) {
                resolveResponse({status, ...data});
            };

            onResult();
        } catch (error) {
            resolveResponse(error);
        }
    };

    const update = async (body: TAttachment, path: string = '', isClose: boolean = true, isMessage = false) => {
        try {
            const { status, data} = await api.put(`/seller-representatives${path}`, body, configApi());

            if(isMessage) {
                resolveResponse({status, ...data});
            };

            onResult();
        } catch (error) {
            resolveResponse(error);
        }
    };

    const cancel = () => {
        reset(body);

        const attachment: any = document.querySelector('#attachment');
        if(attachment) {
            attachment.value = "";
        };
    };

    useEffect(() => {
        reset(ResetAttachment);
        
        if(body) {
            reset(body);
        };
    }, [body]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 mb-2">
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Aba</label>
                    <select className="select slim-select-primary" {...register("type")}>
                        <option value="">Selecione</option>
                        <option value="Dados Gerais">Dados Gerais</option>
                        <option value="Dados do Responsável">Dados do Responsável</option>
                        <option value="Contatos">Contatos</option>
                        <option value="Dados Bancários">Dados Bancários</option>
                    </select>
                </div>
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>Arquivo</label>
                    <input id="attachment" {...register("file")} type="file" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>

                <div className={`flex flex-col justify-end mb-2`}>
                    <Button type="button" click={cancel} text="Cancelar" theme="primary-light" styleClassBtn="h-20"/>
                </div>
                <div className={`flex flex-col justify-end mb-2`}>
                    <Button type="submit" text={watch("id") ? 'Salvar' : 'Adicionar'} theme="primary" styleClassBtn=""/>
                </div>                    
            </div>
        </form>
    )
}