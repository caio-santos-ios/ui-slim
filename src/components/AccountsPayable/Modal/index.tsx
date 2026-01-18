"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { InputForm } from "@/components/Global/InputForm";
import { SelectForm } from "@/components/Global/SelectForm";
import { ResetAccountsPayable, TAccountsPayable } from "@/types/accountsPayable/accountsPayable.type";
import { TGenericTable } from "@/types/masterData/genericTable/genericTable.type";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { TSupplier } from "@/types/masterData/supplier/supplier.type";
import { maskMoney } from "@/utils/mask.util";
import { Button } from "@/components/Global/Button";
import { convertStringMoney } from "@/utils/convert.util";
import { FaCirclePlus } from "react-icons/fa6";
import { ModalGenericTable } from "@/components/Global/ModalGenericTable";
import { modalGenericTableAtom, tableGenericTableAtom } from "@/jotai/global/modal.jotai";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    handleReturnModal: (isSuccess: boolean) => void;
    body?: TAccountsPayable;
    id: string;
}

export const ModalAccountsPayable = ({title, isOpen, setIsOpen, onClose, handleReturnModal, body, id}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [__, setModalGenericTable] = useAtom(modalGenericTableAtom);
    const [___, setTableGenericTable] = useAtom(tableGenericTableAtom);
    const [categories, setCategory] = useState<TGenericTable[]>([]);
    const [costCenters, setCostCenter] = useState<TGenericTable[]>([]);
    const [paymentMethods, setPaymentMethod] = useState<TGenericTable[]>([]);
    const [suppliers, setSupplier] = useState<TSupplier[]>([]);

    const { register, handleSubmit, reset, watch, formState: { errors }} = useForm<TAccountsPayable>({
        defaultValues: ResetAccountsPayable
    });

    const onSubmit: SubmitHandler<TAccountsPayable> = async (body: TAccountsPayable) => {
        if(!body.dueDate) body.dueDate = null;   
        if(!body.lowDate) body.lowDate = null;   
        if(body.value) body.value = convertStringMoney(body.value.toString());   
        if(!body.value) body.value = 0;   
        if(!body.lowValue) body.lowValue = 0;   
        if(!body.fines) body.fines = 0;   
        if(!body.fees) body.fees = 0;   

        if(!body.id) {
          await create(body);
        } else {
          await update(body);
        }
    };

    const create = async (body: TAccountsPayable) => {
        try {
            const { status, data} = await api.post(`/accounts-payable`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            handleReturnModal(true);
        } catch (error) {
            resolveResponse(error);
        }
    };
      
    const update = async (body: TAccountsPayable) => {
        try {
            const { status, data} = await api.put(`/accounts-payable`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            handleReturnModal(true);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const cancel = () => {
        reset(ResetAccountsPayable);
        onClose();
    };

    const getSelectSupplier = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/suppliers/select`, configApi());
            const result = data.result;
            setSupplier(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };
   
    const getSelectCategory = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/generic-tables/table/categoria-despesas`, configApi());
            const result = data.result;
            setCategory(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };
    
    const getSelectCostCenter = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/generic-tables/table/centro-custo`, configApi());
            const result = data.result;
            setCostCenter(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };
    
    const getSelectPaymentMethod = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/generic-tables/table/forma-pagamento`, configApi());
            const result = data.result;
            setPaymentMethod(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const getById = async (id: string) => {
        try {
            setLoading(true);
            const {data} = await api.get(`/accounts-payable/${id}`, configApi());
            const result = data.result;

            reset({
                ...result.data,
                dueDate: result.data.dueDate ? result.data.dueDate.split("T")[0] : null,
                value: convertStringMoney(result.data.value)
            });

        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const genericTable = (table: string) => {
        setModalGenericTable(true);
        setTableGenericTable(table);
    };

    const onReturnGeneric = () => {
        getSelectSupplier();
        getSelectCategory();
        getSelectCostCenter();
        getSelectPaymentMethod();
    };

    useEffect(() => {
        onReturnGeneric();
    }, []);

    useEffect(() => {
        if(id) {
            getById(id);
        };
    }, [id]);

    return (
        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto container-modal">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className="slim-modal w-full max-w-4xl rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="slim-modal-title mb-4 border-b-3">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">{title}</DialogTitle>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 mb-2">
                                <div className={`flex flex-col col-span-6 mb-2`}>
                                    <label className={`label slim-label-primary`}>Fornecedor</label>
                                    <select className="select slim-select-primary" {...register("supplierId")}>
                                        <option value="">Selecione</option>
                                        {
                                            suppliers.map((x: any) => {
                                                return <option key={x.id} value={x.id}>{x.corporateName}</option>
                                            })
                                        }
                                    </select>
                                </div>
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary flex gap-1 items-center`}>Categoria <span onClick={() => genericTable("categoria-despesas")} className="pr-2 cursor-pointer"><FaCirclePlus /></span></label>
                                    <select className="select slim-select-primary" {...register("category")}>
                                        <option value="">Selecione</option>
                                        {
                                            categories.map((x: any) => {
                                                return <option key={x.code} value={x.code}>{x.description}</option>
                                            })
                                        }
                                    </select>
                                </div>
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary flex gap-1 items-center`}>Centro de Custo <span onClick={() => genericTable("centro-custo")} className="pr-2 cursor-pointer"><FaCirclePlus /></span></label>
                                    <select className="select slim-select-primary" {...register("costCenter")}>
                                        <option value="">Selecione</option>
                                        {
                                            costCenters.map((x: any) => {
                                                return <option key={x.code} value={x.code}>{x.description}</option>
                                            })
                                        }
                                    </select>
                                </div>
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary flex gap-1 items-center`}>Forma de Pagameto <span onClick={() => genericTable("forma-pagamento")} className="pr-2 cursor-pointer"><FaCirclePlus /></span></label>
                                    <select className="select slim-select-primary" {...register("paymentMethod")}>
                                        <option value="">Selecione</option>
                                        {
                                            paymentMethods.map((x: any) => {
                                                return <option key={x.code} value={x.code}>{x.description}</option>
                                            })
                                        }
                                    </select>
                                </div>   
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Valor</label>
                                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskMoney(e)} {...register("value")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div> 
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Tipo de Periocidade</label>
                                    <select className="select slim-select-primary" {...register("typeOfPeriodicity")}>
                                        <option value="">Selecione</option>
                                        <option value="Diário">Diário</option>
                                        <option value="Semanal">Semanal</option>
                                        <option value="Mensal">Mensal</option>
                                        <option value="Trimestral">Trimestral</option>
                                        <option value="Semestral">Semestral</option>
                                        <option value="Anual">Anual</option>
                                    </select>
                                </div>   
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Quantidade</label>
                                    <input {...register("quantityOfPeriodicity")} type="number" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>1° Vencimento</label>
                                    <input {...register("dueDate")} type="date" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div> 
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Periodo de Cobrança</label>
                                    <select className="select slim-select-primary" {...register("billingPeriod")}>
                                        <option value="Mensal">Mensal</option>
                                        <option value="Semanal">Semanal</option>
                                        <option value="Anual">Anual</option>
                                    </select>
                                </div>
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Dia da Cobrança</label>
                                    {
                                        watch("billingPeriod") == "Anual" ?
                                        <input {...register("billing")} type="date" className={`input slim-input-primary`} placeholder="Digite"/>
                                        :                        
                                        <select className="select slim-select-primary" {...register("billing")}>
                                            {
                                                watch("billingPeriod") == "Mensal" &&
                                                <>
                                                    <option value="01">01</option>
                                                    <option value="02">02</option>
                                                    <option value="03">03</option>
                                                    <option value="04">04</option>
                                                    <option value="05">05</option>
                                                    <option value="06">06</option>
                                                    <option value="07">07</option>
                                                    <option value="08">08</option>
                                                    <option value="09">09</option>
                                                    <option value="10">10</option>
                                                    <option value="11">11</option>
                                                    <option value="12">12</option>
                                                    <option value="13">13</option>
                                                    <option value="14">14</option>
                                                    <option value="15">15</option>
                                                    <option value="16">16</option>
                                                    <option value="17">17</option>
                                                    <option value="18">18</option>
                                                    <option value="19">19</option>
                                                    <option value="20">20</option>
                                                    <option value="21">21</option>
                                                    <option value="22">22</option>
                                                    <option value="23">23</option>
                                                    <option value="24">24</option>
                                                    <option value="25">25</option>
                                                    <option value="26">26</option>
                                                    <option value="27">27</option>
                                                    <option value="28">28</option>
                                                    <option value="29">29</option>
                                                    <option value="30">30</option>
                                                    <option value="31">31</option>
                                                </>
                                            }
                                            {
                                                watch("billingPeriod") == "Semanal" &&
                                                <>
                                                    <option value="01">Segunda-feira</option>
                                                    <option value="02">Terça-feira</option>
                                                    <option value="03">Quarta-feira</option>
                                                    <option value="04">Quinta-feira</option>
                                                    <option value="05">Sexta-feira</option>
                                                    <option value="06">Sábado</option>
                                                    <option value="07">Domingo</option>                             
                                                </>
                                            }               

                                        </select>     
                                    }
                                </div>
                                <div className={`flex flex-col col-span-8 mb-2`}>
                                    <label className={`label slim-label-primary`}>Observações</label>
                                    <textarea {...register("notes")} className={`slim-textarea slim-textarea-primary`} placeholder="Digite" rows={3}></textarea>
                                </div>
                            </div>                          
                            <div className="flex justify-end gap-2 w-12/12 mt-3">
                                <Button type="button" click={onClose} text="Fechar" theme="primary-light" styleClassBtn=""/>
                                <Button type="submit" text="Salvar" theme="primary" styleClassBtn=""/>
                            </div>  
                        </form>

                        <ModalGenericTable onReturn={onReturnGeneric} />
                    </DialogPanel>
                </div>
            </div>
        </Dialog>    
    )
}