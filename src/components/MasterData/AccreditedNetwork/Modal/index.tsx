"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useCallback, useEffect, useState } from "react";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { ModalResponsible } from "../ModalResponsible";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { ModalContact } from "../ModalContact";
import { Button } from "@/components/Global/Button";
import { ModalAttachment } from "../ModalAttachment";
import { ModalData } from "../ModalData";
import { ResetAccreditedNetwork, TAccreditedNetwork } from "@/types/masterData/accreditedNetwork/accreditedNetwork.type";
import { ModalTradingTable } from "../ModalTradingTable";
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

type TTabs = "data" | "responsible" | "tradingTable" | "contact" | "attachment" | "log";

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

export const ModalAccreditedNetwork = ({title, isOpen, setIsOpen, onClose, onSelectValue, id}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [tabCurrent, setTabCurrent] = useState<TTabs>("data")
    // const [currentBody, setCurrentBody] = useState<TAccreditedNetwork>(ResetAccreditedNetwork);
    const [tabs, setTab] = useState<{key: string, title: string}[]>([
        { key: 'data', title: 'Dados Gerais' },
        { key: 'responsible', title: 'Dados do Responsável' },
        { key: 'tradingTable', title: 'Tabela de Negociação' },
        { key: 'contact', title: 'Contatos' },
        { key: 'attachment', title: 'Anexos' },
        { key: 'log', title: 'Histórico' }
    ]);
    
    const cancel = () => {
        setTabCurrent("data");
        onClose();
    };

    const alterTab = async (tab: TTabs, isMessage: boolean = false, saveTab: boolean = false) => {
        setTabCurrent(tab);
    };

    const onSelectType = useCallback((type: string) => {
        if (!type) return;

        let newTabs = [
            { key: 'data', title: 'Dados Gerais' },
            { key: 'responsible', title: 'Dados do Responsável' },
            { key: 'contact', title: 'Contatos' },
            { key: 'attachment', title: 'Anexos' },
            { key: 'log', title: 'Histórico' },
        ];

        setTab(prev => {
            if (JSON.stringify(prev) === JSON.stringify(newTabs)) return prev;
            return newTabs;
        });
    }, []);

    const onSuccess = (isSuccess: boolean, newBody: TAccreditedNetwork) => {
        if(isSuccess) {
            // setCurrentBody(newBody);
            if (!id) return;
            // getById(id);

            let newTabs: {key: string, title: string}[] = [
                { key: 'data', title: 'Dados Gerais' },
                { key: 'responsible', title: 'Dados do Responsável' },
                { key: 'contact', title: 'Contatos' },
                { key: 'attachment', title: 'Anexos' },
            ];

            const index = newTabs.findIndex((x: any) => x.key == tabCurrent);
            if(index >= 0 && index < newTabs.length) {
                const newTab: any = newTabs[index + 1];
                setTabCurrent(newTab.key)
            };

            onSelectValue(true, "");
        };
    };

    useEsc(() => {
        if (isOpen) cancel(); 
    });

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
                        className="w-full max-w-7xl rounded-2xl overflow-hidden shadow-2xl"
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
                            tabCurrent == "data" &&
                            <ModalData id={id} onSuccess={onSuccess} onSelectType={onSelectType} onSelectValue={onSelectValue} onClose={cancel}/> 
                        }
                        
                        {
                            tabCurrent == "responsible" &&
                            <ModalResponsible id={id} onSuccess={onSuccess} onClose={cancel}/> 
                        }
   
                        {
                            tabCurrent == "tradingTable" &&
                            <ModalTradingTable parentId={id}/> 
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