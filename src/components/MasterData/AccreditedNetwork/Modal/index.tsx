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

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean, id: string) => void;
    id: string;
}

type TTabs = "data" | "responsible" | "contact" | "attachment";

export const ModalAccreditedNetwork = ({title, isOpen, setIsOpen, onClose, onSelectValue, id}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [tabCurrent, setTabCurrent] = useState<TTabs>("data")
    // const [currentBody, setCurrentBody] = useState<TAccreditedNetwork>(ResetAccreditedNetwork);
    const [tabs, setTab] = useState<{key: string, title: string}[]>([
        { key: 'data', title: 'Dados Gerais' },
        { key: 'responsible', title: 'Dados do Responsável' },
        { key: 'contact', title: 'Contatos' },
        { key: 'attachment', title: 'Anexos' },
    ]);
    
    // const getById = async (id: string) => {
    //     try {
    //         setLoading(true);
    //         const {data} = await api.get(`/accredited-networks/${id}`, configApi());
    //         const result = data.result;
    //         setCurrentBody(result.data)
    //     } catch (error) {
    //         resolveResponse(error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

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

    useEffect(() => {
        // setCurrentBody(ResetAccreditedNetwork);

        // if (!id) return;
        // getById(id);
    }, [id]);

    return (
        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto container-modal">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className="w-full max-w-7xl rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="bg-red mb-4 border-b-3 header-modal">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">{title}</DialogTitle>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 mb-2 slim-bg-primary p-2 rounded-4xl">
                            {tabs.map((x: any) => (
                                <div key={x.key} onClick={() => alterTab(x.key)} className={`col-span-2 rounded-4xl py-2 font-bold text-lg text-center cursor-pointer ${tabCurrent === x.key ? 'slim-bg-secondary' : 'slim-bg-primary'}`}>
                                    {x.title}
                                </div>
                            ))}
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
                            tabCurrent == "contact" &&
                            <ModalContact parentId={id}/> 
                        }
                        
                        {
                            tabCurrent == "attachment" &&
                            <ModalAttachment parentId={id}/> 
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