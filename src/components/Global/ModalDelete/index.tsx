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
        <Dialog open={isOpen} as="div" className="relative z-50 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)" }}>
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-sm bg-[var(--surface-card)] rounded-2xl border border-[var(--surface-border)] shadow-xl p-6 transition-all duration-300 data-closed:scale-95 data-closed:opacity-0">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[var(--surface-border)]">
                            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                                <svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" className="w-5 h-5">
                                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                            </div>
                            <DialogTitle as="h2" className="text-base font-bold text-[var(--text-primary)]">{title}</DialogTitle>
                        </div>

                        <p className="text-sm text-[var(--text-secondary)] mb-6">{description}</p>

                        <div className="flex justify-end gap-2.5">
                            <Button theme="secondary-light" text="Cancelar" click={onClose} />
                            <Button theme="primary" text="Confirmar" click={() => onSelectValue(true)} />
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};
