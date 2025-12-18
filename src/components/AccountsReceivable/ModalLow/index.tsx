"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { TAccountsReceivable, TAccountsReceivableLow } from "@/types/accountsReceivable/accountsReceivable.type";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect } from "react";
import { InputForm } from "@/components/Global/InputForm";
import { SelectForm } from "@/components/Global/SelectForm";
import { maskMoney } from "@/utils/mask.util";
import { Button } from "@/components/Global/Button";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean) => void;
    body?: TAccountsReceivableLow
}

export const ModalLowAccountsReceivable = ({title, isOpen, setIsOpen, onClose, onSelectValue, body}: TProp) => {
    const { register, handleSubmit, reset, formState: { errors }} = useForm<TAccountsReceivableLow>();

    const onSubmit: SubmitHandler<TAccountsReceivableLow> = async (body: TAccountsReceivableLow) => {
        // if(!body.id) {
        //   await create(body);
        // } else {
        //   await update(body);
        // }
    };

    const create = async (body: TAccountsReceivableLow) => {
        try {
            const { status, data} = await api.post(`/accounts-receivable`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            onSelectValue(true);
        } catch (error) {
            resolveResponse(error);
        }
    };
      
    const update = async (body: TAccountsReceivableLow) => {
        try {
            const { status, data} = await api.put(`/accounts-receivable`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            onSelectValue(true);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const cancel = () => {
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
                    <DialogPanel transition className="w-full max-w-lg rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="bg-red mb-4 border-b-3 header-modal">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">{title}</DialogTitle>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 gap-2 mb-2">
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Valor</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskMoney(e)} {...register("value")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>  
                            </div>

                            <div className="flex justify-end gap-2 w-12/12 mt-3">
                                <Button type="button" click={cancel} text="Cancelar" theme="primary-light" styleClassBtn="h-20"/>
                                <Button type="submit" text={'Baixa'} theme="primary" styleClassBtn=""/>
                            </div>  
                        </form>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>    
    )
}