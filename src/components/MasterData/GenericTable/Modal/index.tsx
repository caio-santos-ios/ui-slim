"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect } from "react";
import { InputForm } from "@/components/Global/InputForm";
import { TGenericTable } from "@/types/masterData/genericTable/genericTable.type";
import { Button } from "@/components/Global/Button";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean) => void;
    body?: TGenericTable
}

export const ModalGenericTable = ({title, isOpen, setIsOpen, onClose, onSelectValue, body}: TProp) => {
    const { register, handleSubmit, reset, formState: { errors }} = useForm<TGenericTable>();

    const onSubmit: SubmitHandler<TGenericTable> = async (body: TGenericTable) => {
        if(!body.id) {
          await create(body);
        } else {
          await update(body);
        }
    };

    const create = async (body: TGenericTable) => {
        try {
            const { status, data} = await api.post(`/generic-tables`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            onSelectValue(true);
        } catch (error) {
            resolveResponse(error);
        }
    };
      
    const update = async (body: TGenericTable) => {
        try {
            const { status, data} = await api.put(`/generic-tables`, body, configApi());
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
            code: "",
            description: "",
            table: ""
        });

        onClose();
    };

    useEffect(() => {
        if(body) {
            reset(body);
        };
    }, [body]);

    return (
        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto container-modal">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className="w-full max-w-2xl rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="bg-red mb-4 border-b-3 header-modal">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">{title}</DialogTitle>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
                                <InputForm {...register("table")} styleClass="flex flex-1" placeholder="Digite" name="table" title="Tabela" type="text" />
                                <InputForm {...register("code")} styleClass="flex flex-1" placeholder="Digite" name="code" title="Código" type="text" />
                            </div>                          
                            <div className="grid grid-cols-1 gap-2 mb-2">
                                <InputForm {...register("description")} styleClass="flex flex-1" placeholder="Digite" name="description" title="Descrição" type="text" />
                            </div>                          
                            <div className="flex justify-end gap-2 w-12/12 mt-3">
                                <button type="button" onClick={cancel} className="slim-btn slim-btn-primary-light">Cancelar</button>
                                <Button text="Salvar" theme="primary" styleClassBtn=""/>
                            </div>  
                        </form>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>    
    )
}