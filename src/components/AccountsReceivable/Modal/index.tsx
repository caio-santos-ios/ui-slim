"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { TAccountsReceivable } from "@/types/accountsReceivable/accountsReceivable.type";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect } from "react";
import { IoClose } from "react-icons/io5";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean) => void;
    body?: TAccountsReceivable
}

export const ModalAccountsReceivable = ({title, isOpen, setIsOpen, onClose, onSelectValue, body}: TProp) => {
    const { register, handleSubmit, reset, formState: { errors }} = useForm<TAccountsReceivable>();

    const onSubmit: SubmitHandler<TAccountsReceivable> = async (body: TAccountsReceivable) => {
        if(!body.id) {
          await create(body);
        } else {
          await update(body);
        }
    };

    const create = async (body: TAccountsReceivable) => {
        try {
            const { status, data} = await api.post(`/accounts-receivable`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            onSelectValue(true);
        } catch (error) {
            resolveResponse(error);
        }
    };
      
    const update = async (body: TAccountsReceivable) => {
        try {
            const { status, data} = await api.put(`/accounts-receivable`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            onSelectValue(true);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const cancel = () => {
        // reset({
        //     id: "",
        //     paymentMethod: "",
        //     category: "",
        //     contract: "",
        //     costCenter: "",
        //     createdAt: ""
        // });

        onClose();
    };

    useEffect(() => {
        if(body) {
            reset(body);
        };
    }, [body]);

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
                        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
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
                        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100dvh - 16rem)" }}>
                            <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-2">
                                {/* <InputForm {...register("contract")} styleClass="flex flex-1" placeholder="Digite" name="contract" title="Contrato" type="text" />
                                
                                <SelectForm {...register("category")} styleClass="flex flex-1" name="category" title="Categoria">
                                    <option value="">SELECIONE...</option>
                                    <option value="001">Receita de Vendas e Seriços</option>
                                    <option value="002">Receitas Financeiras</option>
                                    <option value="003">Outras Receitas e Entradas</option>
                                </SelectForm>
                                
                                <SelectForm {...register("costCenter")} styleClass="flex flex-1" name="costCenter" title="Centro de Custo">
                                    <option value="">SELECIONE...</option>
                                    <option value="001">0001 - Administrativo</option>
                                </SelectForm>
                                
                                <SelectForm {...register("paymentMethod")} styleClass="flex flex-1" name="paymentMethod" title="Forma de Pagamento">
                                    <option value="">SELECIONE...</option>
                                    <option value="001">Cartão de crédito</option>
                                    <option value="002">Boleto</option>
                                    <option value="003">Pix</option>
                                    <option value="004">Dinheiro</option>
                                    <option value="005">Transferência</option>
                                    <option value="006">Outras Forma de Pagamento</option>
                                </SelectForm>                  */}
                            </div>                          
                            <div className="flex justify-end gap-2 w-12/12 mt-3">
                                <button type="button" onClick={cancel} className="slim-btn slim-btn-primary-light">Cancelar</button>
                                <button type="submit" className="slim-btn slim-btn-primary">Salvar</button>
                            </div>  
                        </form>
                        </div>

                    </DialogPanel>
                </div>
            </Dialog>
        </>    
    )
}