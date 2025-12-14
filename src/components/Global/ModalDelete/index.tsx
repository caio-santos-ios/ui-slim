"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { TAccountsReceivable } from "@/types/accountsReceivable/accountsReceivable.type";
import { Button } from "../Button";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean) => void;
    body?: TAccountsReceivable
}

export const ModalDelete = ({title, isOpen, setIsOpen, onClose, onSelectValue}: TProp) => {
    const destroy = () =>{
        onSelectValue(true);
    };

    return (
        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto container-modal">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className="w-full max-w-sm rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="bg-red mb-4 border-b-3 header-modal">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">{title}</DialogTitle>
                        </div>
                        <h1 className="text-lg font-bold">Deseja excluír esse registro?</h1>
                        <div className="flex justify-end gap-2 w-12/12 mt-3">
                            <Button theme="primary-light" text="Cancelar" click={onClose}/>
                            <Button theme="primary" text="Confirmar" click={destroy}/>
                        </div>  
                    </DialogPanel>
                </div>
            </div>
        </Dialog>    
    )
}