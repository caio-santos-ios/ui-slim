"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useCallback, useEffect, useState } from "react";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { ModalRecipient } from "../ModalRecipient";
import { ModalContract } from "../ModalContract";
import { ModalContractor } from "../ModalContractor";
import { ModalResponsible } from "../ModalResponsible";
import { ResetCustomerContractor, TCustomerContractor } from "@/types/masterData/customers/customer.type";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { ModalContact } from "../ModalContact";
import { Button } from "@/components/Global/Button";
import { ModalAttachment } from "../ModalAttachment";
import { ModalLog } from "../ModalLog";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean, id: string) => void;
    id: string;
}

const useEsc = (callback: () => void) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                callback();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [callback]);
};

export const ModalCustomer = ({title, isOpen, setIsOpen, onClose, onSelectValue, id}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [tabCurrent, setTabCurrent] = useState<"contractor" | "responsible" | "recipient" | "contract" | "contact" | "attachment" | "log">("contractor")
    const [currentBody, setCurrentBody] = useState<TCustomerContractor>(ResetCustomerContractor);
    const [tabs, setTab] = useState<{key: string, title: string}[]>([
        { key: 'contractor', title: 'Contratante' },
        { key: 'recipient', title: 'Beneficiários' },
        { key: 'contract', title: 'Contratos' },
    ]);
    
    const getById = async (id: string) => {
        try {
            setLoading(true);
            const {data} = await api.get(`/customers/${id}`, configApi());
            const result = data.result;
            setCurrentBody(result.data)
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const cancel = () => {
        setTabCurrent("contractor");
        onClose();
    };

    const alterTab = async (tab: "contractor" | "responsible" | "recipient" | "contract" | "contact" | "attachment" | "log", isMessage: boolean = false, saveTab: boolean = false) => {
        setTabCurrent(tab);
    };

    const onSelectType = useCallback((type: string) => {
        if (!type) return;

        let newTabs = [
            { key: 'contractor', title: 'Contratante' },
            { key: 'recipient', title: 'Beneficiários' },
            { key: 'contract', title: 'Contratos' },
            { key: 'contact', title: 'Contatos' },
            { key: 'attachment', title: 'Anexos' },
            { key: 'log', title: 'Histórico' },
        ];

        if (type === "B2B") {
            newTabs.splice(1, 0, { key: 'responsible', title: 'Dados do Responsável' });
        };

        setTab(prev => {
            if (JSON.stringify(prev) === JSON.stringify(newTabs)) return prev;
            return newTabs;
        });
    }, []);

    const onSuccess = (isSuccess: boolean, newBody: TCustomerContractor) => {
        if(isSuccess) {
            setCurrentBody(newBody);
            if (!id) return;
            getById(id);

            let newTabs = [
                { key: 'contractor', title: 'Contratante' },
                { key: 'recipient', title: 'Beneficiários' },
                { key: 'contract', title: 'Contratos' },
                { key: 'contact', title: 'Contatos' },
                { key: 'attachment', title: 'Anexos' },
            ];

            if (currentBody.type === "B2B") {
                newTabs.splice(1, 0, { key: 'responsible', title: 'Dados do Responsável' });
            };
            
            const index = newTabs.findIndex((x: any) => x.key == tabCurrent);
            if(index >= 0 && index < newTabs.length) {
                const newTab: any = newTabs[index + 1];
                setTabCurrent(newTab.key)
            };
        };
    };

    useEsc(() => {
        if (isOpen) cancel(); 
    });

    useEffect(() => {
        setCurrentBody(ResetCustomerContractor);

        if (!id) return;
        getById(id);
    }, [id]);

    return (
        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto container-modal">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className="w-full max-w-8xl rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="bg-red mb-4 border-b-3 header-modal">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">{title}</DialogTitle>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-14 gap-1 mb-2 slim-bg-primary p-2 rounded-4xl">
                            {tabs.map((x: any) => (
                                <div key={x.key} onClick={() => alterTab(x.key)} className={`col-span-2 rounded-4xl py-2 font-bold text-lg text-center cursor-pointer ${tabCurrent === x.key ? 'slim-bg-secondary' : 'slim-bg-primary'}`}>
                                    {x.title}
                                </div>
                            ))}
                        </div>                        

                        {
                            tabCurrent == "contractor" &&
                            <ModalContractor onSuccess={onSuccess} onSelectType={onSelectType} onSelectValue={onSelectValue} body={currentBody} onClose={cancel}/> 
                        }
                        
                        {
                            tabCurrent == "responsible" &&
                            <ModalResponsible onSuccess={onSuccess} parentId={id} body={currentBody} onClose={cancel}/> 
                        }

                        {
                            tabCurrent == "recipient" &&
                            <ModalRecipient isOpen={isOpen} contractorType={currentBody.type} contractorId={currentBody.id!} onClose={cancel} />
                        }

                        
                        {
                            tabCurrent == "contract" &&
                            <ModalContract contractorType={currentBody.type} contractorId={currentBody.id!} onClose={cancel}/> 
                        }

                        {
                            tabCurrent == "contact" &&
                            <ModalContact parentId={id}/> 
                        }
                        
                        {
                            tabCurrent == "attachment" &&
                            <ModalAttachment parentId={id}/> 
                        }

                        {
                            tabCurrent == "log" &&
                            <ModalLog onClose={cancel} parentId={id}/> 
                        }

                        <div className="flex justify-end mb-2">
                            {
                                ["contact", "attachment"].includes(tabCurrent) &&
                                <Button click={cancel} text="Fechar" theme="primary-light" styleClassBtn=""/>
                            }
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}