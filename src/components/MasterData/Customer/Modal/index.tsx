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
import { IoClose } from "react-icons/io5";

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
                        className="w-full max-w-8xl rounded-2xl overflow-hidden shadow-2xl"
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
                        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100dvh - 20rem)" }}>
                            <div
                            className="flex border-b overflow-x-auto"
                            style={{ background: "var(--surface-bg)", borderColor: "var(--surface-border)" }}
                        >
                            {tabs.map((t: any) => {
                                const active = tabCurrent === t.key;
                                return (
                                    <button
                                        key={t.key}
                                        type="button"
                                        onClick={() => alterTab(t.key)}
                                        className="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-all relative"
                                        style={{
                                            background: "transparent",
                                            border: "none",
                                            boxShadow: "none",
                                            height: "auto",
                                            borderRadius: 0,
                                            color: active ? "var(--accent-color)" : "var(--text-muted)",
                                            borderBottom: active ? "2.5px solid var(--accent-color)" : "2.5px solid transparent",
                                            marginBottom: "-1px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {t.title}
                                    </button>
                                );
                            })}
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
                        </div>

            {/* ── Footer ── */}
            <div
                className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t"
                style={{ background: "var(--surface-bg)", borderColor: "var(--surface-border)" }}
            >
                    <Button click={cancel} text="Fechar" theme="primary-light" styleClassBtn=""/>
            </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    )
}