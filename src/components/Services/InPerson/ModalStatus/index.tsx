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
import { IoClose } from "react-icons/io5";

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
        <>
            <Dialog
                open={isOpen}
                as="div"
                className="relative z-[999] focus:outline-none"
                onClose={cancel}
            >
                {/* Backdrop */}
                <div
                    className="fixed inset-0 z-[999]"
                    style={{ background: "rgba(0,15,35,.65)", backdropFilter: "blur(5px)" }}
                />

                <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-14 px-4 pb-6 overflow-y-auto">
                    <DialogPanel
                        className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
                        style={{
                            background: "var(--surface-card)",
                            border: "1px solid var(--surface-border)",
                            animation: "modal-slide-in .25s cubic-bezier(.34,1.56,.64,1)",
                        }}
                    >
                        {/* ── Header ── */}
                        <div
                            className="flex items-center justify-between px-6 py-0 h-14"
                            style={{
                                background: "linear-gradient(135deg, var(--primary-color-light) 0%, var(--primary-color) 100%)",
                            }}
                        >
                            <DialogTitle as="h2" className="text-sm font-bold text-white">
                                {title}
                            </DialogTitle>
                            <span
                                onClick={cancel}
                                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer"
                                style={{ background: "rgba(255,255,255,.1)", border: "none", boxShadow: "none", color: "rgba(255,255,255,.7)" }}
                            >
                                <IoClose size={18} />
                            </span>
                        </div>

                        {/* ── Body ── */}
                        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100dvh - 16rem)" }}>
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
                        </div>

                    </DialogPanel>
                </div>
            </Dialog>
        </>    
    )
}