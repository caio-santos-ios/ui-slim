"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { TAccountsReceivable } from "@/types/accountsReceivable/accountsReceivable.type";
import { Button } from "@/components/Global/Button";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { modalGenericTableAtom, tableGenericTableAtom } from "@/jotai/global/modal.jotai";
import { useAtom } from "jotai";
import { TGenericTable } from "@/types/masterData/genericTable/genericTable.type";
import { FaCirclePlus } from "react-icons/fa6";
import { ModalGenericTable } from "@/components/Global/ModalGenericTable";
import { IoClose } from "react-icons/io5";

type TProp = {
    description?: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean, id: string) => void;
    id: string;
}

export const ModalUpdateConvertContractor = ({isOpen, setIsOpen, onClose, onSelectValue, id}: TProp) => {

    const updateStatus = async () => {
        try {
            const { data } = await api.put(`/customer-recipients/convert-contractor`, {id}, configApi());
            const result = data;
            resolveResponse({status: 200, ...result})
            onSelectValue(true, "");
            onClose();
        } catch (error) {
            resolveResponse(error);
        }
    };

    return (
        <>
            <Dialog
                open={isOpen}
                as="div"
                className="relative z-999 focus:outline-none"
                onClose={() => setIsOpen(false)}
            >
                <div
                    className="fixed inset-0 z-999"
                    style={{ background: "rgba(0,15,35,.65)", backdropFilter: "blur(5px)" }}
                />

                <div className="fixed inset-0 z-1000 flex items-start justify-center pt-14 px-4 pb-6 overflow-y-auto">
                    <DialogPanel
                        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
                        style={{
                            background: "var(--surface-card)",
                            border: "1px solid var(--surface-border)",
                            animation: "modal-slide-in .25s cubic-bezier(.34,1.56,.64,1)",
                        }}
                    >
                        <div
                            className="flex items-center justify-between px-6 py-0 h-14"
                            style={{
                                background: "linear-gradient(135deg, var(--primary-color-light) 0%, var(--primary-color) 100%)",
                            }}
                        >
                            <DialogTitle as="h2" className="text-sm font-bold text-white">
                                Converter Contratante
                            </DialogTitle>
                            <span
                                onClick={onClose}
                                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer"
                                style={{ background: "rgba(255,255,255,.1)", border: "none", boxShadow: "none", color: "rgba(255,255,255,.7)" }}
                            >
                                <IoClose size={18} />
                            </span>
                        </div>

                        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100dvh - 20rem)" }}>
                            <label className={`label slim-label-primary`}>Deseja alterar o beneficiário para contratante?</label>
                        </div>

            <div
                className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t"
                style={{ background: "var(--surface-bg)", borderColor: "var(--surface-border)" }}
            >
                    <Button theme="primary-light" text="Cancelar" click={onClose}/>
                    <Button theme="primary" text="Confirmar" click={updateStatus}/>
            </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </>    
    )
}