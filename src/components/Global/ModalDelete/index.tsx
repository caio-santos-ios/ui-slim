"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Button } from "../Button";

type TProp = {
    title: string;
    description?: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean) => void;
    body?: any;
}

export const ModalDelete = ({ title, isOpen, setIsOpen, onClose, onSelectValue, description = "Deseja excluir esse registro?" }: TProp) => {
    return (
        <Dialog open={isOpen} as="div" className="relative z-999 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgba(0,15,35,.6)", backdropFilter: "blur(5px)" }}>
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-sm bg-[var(--surface-card)] rounded-2xl border border-[var(--surface-border)] shadow-xl overflow-hidden transition-all duration-300 data-closed:scale-95 data-closed:opacity-0">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-[var(--surface-border)] flex items-center gap-3"
                            style={{ background: "linear-gradient(135deg, var(--primary-color-light), var(--primary-color))" }}>
                            <div className="w-8 h-8 rounded-lg bg-[rgba(239,68,68,.2)] flex items-center justify-center flex-shrink-0">
                                <svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" className="w-4 h-4">
                                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                            </div>
                            <DialogTitle as="h2" className="text-sm font-bold text-white">{title}</DialogTitle>
                        </div>

                        <div className="p-5">
                            <p className="text-sm text-[var(--text-secondary)] mb-6">{description}</p>

                            <div className="flex justify-end gap-2.5">
                                <Button theme="secondary-light" text="Cancelar" click={onClose} />
                                <Button theme="primary" text="Confirmar" click={() => onSelectValue(true)} />
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};
