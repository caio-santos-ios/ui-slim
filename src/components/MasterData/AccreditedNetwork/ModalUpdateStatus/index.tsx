"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { TAccountsReceivable } from "@/types/accountsReceivable/accountsReceivable.type";
import { Button } from "@/components/Global/Button";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useState } from "react";
import { toast } from "react-toastify";

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
        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto container-modal">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className="slim-modal w-full max-w-lg rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="slim-modal-title mb-4 border-b-3">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">Atualizar Status</DialogTitle>
                        </div>                            
                            
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
                    </DialogPanel>
                </div>
            </div>
        </Dialog>    
    )
}