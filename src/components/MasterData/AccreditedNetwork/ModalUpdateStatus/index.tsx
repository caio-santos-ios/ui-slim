"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { TAccountsReceivable } from "@/types/accountsReceivable/accountsReceivable.type";
import { Button } from "@/components/Global/Button";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useState } from "react";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";

type TProp = {
    description?: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean, id: string) => void;
    id: string;
}

export const ModalUpdateStatus = ({isOpen, setIsOpen, onClose, onSelectValue, id}: TProp) => {
    const [justification, setJustification] = useState<string>("");

    const updateStatus = async () => {
        try {
            if(!justification) return toast.warn("Justificativa é obrigatória", { theme: 'colored'});

            await api.put(`/accredited-networks/alter-status`, {id, justification}, configApi());
            onSelectValue(true, "");
        } catch (error) {
            resolveResponse(error);
        }
    };

    return (
        <>
            <Dialog
                open={isOpen}
                as="div"
                className="relative z-[999] focus:outline-none"
                onClose={() => setIsOpen(false)}
            >
                {/* Backdrop */}
                <div
                    className="fixed inset-0 z-[999]"
                    style={{ background: "rgba(0,15,35,.65)", backdropFilter: "blur(5px)" }}
                />

                <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-14 px-4 pb-6 overflow-y-auto">
                    <DialogPanel
                        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
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
                                Atualizar Status
                            </DialogTitle>
                            <span
                                onClick={onClose}
                                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer"
                                style={{ background: "rgba(255,255,255,.1)", border: "none", boxShadow: "none", color: "rgba(255,255,255,.7)" }}
                            >
                                <IoClose size={18} />
                            </span>
                        </div>

                        {/* ── Body ── */}
                        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100dvh - 16rem)" }}>
                            <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 mb-2">
                            <div className={`flex flex-col col-span-6 mb-2`}>
                                <label className={`label slim-label-primary`}>Justificativa</label>
                                <textarea onInput={(e: any) => setJustification(e.target.value)} className={`slim-textarea slim-textarea-primary`} placeholder="Digite" rows={4}></textarea>
                            </div>               
                        </div>
                            
                        <div className="flex justify-end gap-2 w-12/12 mt-3">
                            <Button theme="primary-light" text="Cancelar" click={onClose}/>
                            <Button theme="primary" text="Confirmar" click={updateStatus}/>
                        </div>
                        </div>

                    </DialogPanel>
                </div>
            </Dialog>
        </>    
    )
}