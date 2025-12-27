"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect } from "react";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { Button } from "@/components/Global/Button";
import { ResetInPerson, TInPerson } from "@/types/service/inPerson/inPerson.type";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    handleReturnModal: () => void;
    id: string;
}

export const ModalInPersonStatus = ({title, isOpen, setIsOpen, onClose, handleReturnModal, id}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const { register, handleSubmit, reset, watch, setValue, formState: { errors }} = useForm<TInPerson>({
        defaultValues: ResetInPerson
    });

    const onSubmit: SubmitHandler<TInPerson> = async (body: TInPerson) => {
        await update(body);
    };

    const update = async (body: TInPerson) => {
        try {
            const { status, data} = await api.put(`/in-persons/alter-status`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            handleReturnModal();
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getById = async (id: string) => {
        try {
            setLoading(true);
            const {data} = await api.get(`/in-persons/${id}`, configApi());
            const result = data.result.data;
            console.log(result.status)
            setValue("id", result.id);
            setValue("status", result.status);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const cancel = () => {
        reset(ResetInPerson);
        onClose();
    };

    useEffect(() => {
        if(id) {
            getById(id);
        };
    }, [id]);

    return (
        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto container-modal">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className="w-full max-w-xl rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="bg-red mb-4 border-b-3 header-modal">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">{title}</DialogTitle>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 mb-2">
                                <div className={`flex flex-col col-span-6 mb-2`}>
                                    <label className={`label slim-label-primary`}>Status</label>
                                    <select className="select slim-select-primary" {...register("status")}>
                                        <option value="Solicitada">Solicitada</option>
                                        <option value="Agendada">Agendada</option>
                                        <option value="Cancelada - Cliente">Cancelada - Cliente</option>
                                        <option value="Cancelada - Pasbem">Cancelada - Pasbem</option>
                                        <option value="Cancelada - Credenciada">Cancelada - Credenciada</option>
                                        <option value="Realizada">Realizada</option>
                                    </select>
                                </div>
                            </div>                          
                            <div className="flex justify-end gap-2 w-12/12 mt-3">
                                <Button type="button" click={cancel} text="Fechar" theme="primary-light" styleClassBtn=""/>
                                <Button type="submit" text="Salvar" theme="primary" styleClassBtn=""/>
                            </div>  
                        </form>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>    
    )
}