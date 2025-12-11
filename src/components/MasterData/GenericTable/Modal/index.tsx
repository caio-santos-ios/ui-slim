"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { TAccountsReceivable } from "@/types/accountsReceivable/accountsReceivable.type";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect } from "react";
import { InputForm } from "@/components/Global/InputForm";
import { SelectForm } from "@/components/Global/SelectForm";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean) => void;
    body?: TAccountsReceivable
}

export const ModalGenericTable = ({title, isOpen, setIsOpen, onClose, onSelectValue, body}: TProp) => {
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
        reset({
            id: "",
            paymentMethod: "",
            category: "",
            contract: "",
            costCenter: "",
            createdAt: ""
        });

        onClose();
    };

    useEffect(() => {
        if(body) {
            reset(body);
        };
    }, [body]);

    return (
        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto container-modal">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className="w-full max-w-2xl rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="bg-red mb-4 border-b-3 header-modal">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">{title}</DialogTitle>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-2">
                                <InputForm {...register("contract")} styleClass="flex flex-1" placeholder="Digite" name="contract" title="Contrato" type="text" />
                                
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
                                </SelectForm>                 
                            </div>                          
                            <div className="flex justify-end gap-2 w-12/12 mt-3">
                                <button type="button" onClick={cancel} className="slim-btn slim-btn-primary-light">Cancelar</button>
                                <button type="submit" className="slim-btn slim-btn-primary">Salvar</button>
                            </div>  
                        </form>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>    
    )
}