"use client";

import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useAtom } from "jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { modalGenericTableAtom, tableGenericTableAtom } from "@/jotai/global/modal.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { Button } from "@/components/Global/Button";
import { ModalDelete } from "@/components/Global/ModalDelete";
import { ModalGenericTable } from "@/components/Global/ModalGenericTable";
import {
    maskCPF, maskDate, maskMoney, maskPhone,
} from "@/utils/mask.util";
import {
    convertMoneyToNumber,
    convertNumberMoney,
} from "@/utils/convert.util";
import { ResetCustomerRecipient, TRecipient } from "@/types/masterData/customers/customerRecipient.type";
import { TGenericTable } from "@/types/masterData/genericTable/genericTable.type";
import { TPlan } from "@/types/masterData/plans/plans.type";
import { FaCirclePlus } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { LuCalendar, LuCreditCard, LuMail, LuPhone, LuUser, LuHouse } from "react-icons/lu";
import axios from "axios";
import { FaHome, FaPlus } from "react-icons/fa";
import MultiSelect from "@/components/Global/MultiSelect";
import { TServiceModule } from "@/types/masterData/serviceModules/serviceModules.type";

/* ─── Props ─────────────────────────────────── */
type TProp = {
    isOpen: boolean;
    recipientId: string;           // ID do beneficiário a editar
    contractorType?: string;       // "B2B" | "B2C"
    onClose: () => void;
    onSuccess: () => void;         // callback após salvar com sucesso
};

/* ─── Abas ──────────────────────────────────── */
type TTab = "dados" | "endereco" | "financeiro";

const TABS: { key: TTab; label: string; icon: any }[] = [
    { key: "dados",      label: "Dados Pessoais",  icon: LuUser },
    { key: "endereco",   label: "Endereço",         icon: LuHouse },
    { key: "financeiro", label: "Financeiro",       icon: LuCreditCard },
];

/* ─────────────────────────────────────────────
    Componente principal
───────────────────────────────────────────── */
export const ModalHistoricEditRecipient = ({
    isOpen,
    recipientId,
    contractorType = "",
    onClose,
    onSuccess,
}: TProp) => {
    const [_, setLoading]                   = useAtom(loadingAtom);
    const [historics, setHistorics] = useState<any[]>([]);

    const getSelectServiceModule = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/logs?key=update-status-recipient&parentId=${recipientId}`, configApi());
            const result = data.result; 
            const list = result.data.map((x: any) => ({...x, description: x.description.split("- Justificativa: ")[1], actionRece: x.description.slice(0, 1) == "I" ? "Inativou" : "Ativou"}))
            setHistorics(list); 
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    useEffect(() => {
        if (!isOpen) return;
        getSelectServiceModule();
    }, [isOpen, recipientId]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) handleClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen]);

    return (
        <>
            <Dialog
                open={isOpen}
                as="div"
                className="relative z-999 focus:outline-none"
                onClose={handleClose}>
                <div
                    className="fixed inset-0 z-999"
                    style={{ background: "rgba(0,15,35,.65)", backdropFilter: "blur(5px)" }}
                />

                <div className="fixed inset-0 z-1000 flex items-start justify-center pt-14 px-4 pb-6 overflow-y-auto">
                    <DialogPanel
                        className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
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
                            <div className="flex items-center gap-3">
                                <DialogTitle as="h2" className="text-sm font-bold text-white">
                                    Histórico da Inativação do Beneficiário
                                </DialogTitle>
                            </div>
                            <span
                                onClick={handleClose}
                                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
                                style={{ background: "rgba(255,255,255,.1)", border: "none", boxShadow: "none", color: "rgba(255,255,255,.7)", cursor: "pointer" }}>

                                <IoClose size={18} />
                            </span>
                        </div>

                        {/* ── Form body ── */}
                        <div className="grid grid-cols-1">
                            <div className="slim-container-table w-full">
                                <table className="min-w-full divide-y">
                                    <thead className="slim-table-thead">
                                        <tr>
                                            <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider rounded-tl-xl`}>Ação</th>
                                            <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider`}>Motivo</th>
                                            <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider`}>Justificativa</th>
                                            <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider`}>Usuário</th>
                                            <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider rounded-tr-xl`}>Data</th>
                                        </tr>
                                    </thead>
            
                                    <tbody className="slim-body-table divide-y">
                                        {
                                            historics.map((x: any) => {
                                                return (
                                                    <tr className="slim-tr" key={x.id}>
                                                        <td className="px-4 py-2">{x.actionRece}</td>
                                                        <td className="px-4 py-2">{x.rason}</td>
                                                        <td className="px-4 py-2">{x.description}</td>
                                                        <td className="px-4 py-2">{x.userCreate}</td>
                                                        <td className="px-4 py-2">{maskDate(x.createdAt)}</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                            <div
                                className="flex items-center justify-between px-6 py-3.5 border-t"
                                style={{ background: "var(--surface-bg)", borderColor: "var(--surface-border)" }}>

                                <div className="flex justify-end items-center gap-2.5 w-full">
                                    <Button type="button" click={handleClose} text="Cancelar" theme="secondary-light" />
                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    );
};