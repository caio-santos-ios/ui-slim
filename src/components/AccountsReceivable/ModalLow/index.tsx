"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { TAccountsReceivable } from "@/types/accountsReceivable/accountsReceivable.type";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { maskMoney } from "@/utils/mask.util";
import { Button } from "@/components/Global/Button";
import { convertInputStringMoney, convertMoneyToNumber } from "@/utils/convert.util";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean) => void;
    body: TAccountsReceivable
}

export const ModalLowAccountsReceivable = ({title, isOpen, setIsOpen, onClose, onSelectValue, body}: TProp) => {
    const { register, handleSubmit, reset, watch, formState: { errors }} = useForm<TAccountsReceivable>();
    const [valueTotal, setValueTotal] = useState<string>("");

    const onSubmit: SubmitHandler<TAccountsReceivable> = async (body: TAccountsReceivable) => {    
        const currentBody: TAccountsReceivable = {
            id: body.id, 
            fees: !body.fees ? 0 : convertMoneyToNumber(body.fees),
            fines: !body.fines ? 0 : convertMoneyToNumber(body.fines),
            value: !body.value ? 0 : convertMoneyToNumber(body.value),
            lowValue: !body.value ? 0 : convertMoneyToNumber(body.value),
            contractId: body.contractId,
            customerId: body.customerId,
            balance: 0
        };

        await updateLow(currentBody);
    };
      
    const updateLow = async (currentBody: TAccountsReceivable) => {
        try {
            const { status, data} = await api.put(`/accounts-receivable/low`, currentBody, configApi());
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
            reset({
                id: body.id,
                value: convertInputStringMoney(body.balance)
            });
        };
    }, [body]);

    useEffect(() => {
        const value = !watch("value") ? 0 : convertMoneyToNumber(watch("value"));
        const fines = !watch("fines") ? 0 : convertMoneyToNumber(watch("fines"));
        const fees = !watch("fees") ? 0 : convertMoneyToNumber(watch("fees"));

        const calcule = value + fines + fees;
        setValueTotal(convertInputStringMoney(calcule.toString())); 
    }, [watch("value"), watch("fines"), watch("fees")])

    return (
        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto container-modal">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className="slim-modal w-full max-w-lg rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="slim-modal-title mb-4 border-b-3">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">{title}</DialogTitle>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-2">
                                <div className={`flex flex-col col-span-1 mb-2`}>
                                    <label className={`label slim-label-primary`}>Valor</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskMoney(e)} {...register("value")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>  
                                <div className={`flex flex-col col-span-1 mb-2`}>
                                    <label className={`label slim-label-primary`}>Multa</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskMoney(e)} {...register("fines")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>  
                                <div className={`flex flex-col col-span-1 mb-2`}>
                                    <label className={`label slim-label-primary`}>Juros</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskMoney(e)} {...register("fees")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>  
                                <div className={`flex flex-col col-span-3 mb-2`}>
                                    <label className={`label slim-label-primary`}>Valor Total</label>
                                    <input disabled value={valueTotal} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
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