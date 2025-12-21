"use client";

import "./style.css";
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { Button } from "@/components/Global/Button";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { TGenericTable } from "@/types/masterData/genericTable/genericTable.type";
import { TSeller } from "@/types/masterData/seller/seller.type";
import { ResetCustomerContract, TCustomerContract } from "@/types/masterData/customers/customerContract.type";
import { TServiceModule } from "@/types/masterData/serviceModules/serviceModules.type";
import { maskDate, maskMoney } from "@/utils/mask.util";
import { convertMoneyToNumber, convertNumberMoney, convertStringMoney } from "@/utils/convert.util";
import { TContract } from "@/types/contract/contract.type";
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { ModalDelete } from "@/components/Global/ModalDelete";
import { toast } from "react-toastify";
import { TPlan } from "@/types/masterData/plans/plans.type";
import MultiSelect from "@/components/Global/MultiSelect";
import { IconEdit } from "@/components/Global/IconEdit";
import { IconDelete } from "@/components/Global/IconDelete";

type TProp = {
    onClose: () => void;
    contractorId: string;
    contractorType: string;
    planId: string;
}

export const ModalContract = ({contractorId, contractorType, onClose}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [modalDelete, setModalDelete] = useState<boolean>(false);
    const [currentId, setCureentId] = useState<string>("");
    const [categories, setCategory] = useState<TGenericTable[]>([]);
    const [costCenters, setCostCenter] = useState<TGenericTable[]>([]);
    const [paymentMethods, setPaymentMethod] = useState<TGenericTable[]>([]);
    const [receiptAccounts, setReceiptAccount] = useState<TGenericTable[]>([]);
    const [sellers, setSeller] = useState<TSeller[]>([]);
    const [serviceModule, setServiceModule] = useState<TServiceModule[]>([]);
    const [plans, setPlan] = useState<TPlan[]>([]);
    const [modules, setModules] = useState<TServiceModule[]>([]);
    const [customerContracts, setCustomerContract] = useState<TCustomerContract[]>([]);

    const [tabCurrent, setTabCurrent] = useState<"data" | "dataResponsible" | "contact" | "seller" | "attachment" | "dataBank">("data")
    const { register, handleSubmit, reset, getValues, setValue, watch, formState: { errors }} = useForm<TCustomerContract>();
    const serviceModuleIds = watch("serviceModuleIds");

    const onSubmit: SubmitHandler<TCustomerContract> = async (body: TCustomerContract) => {  
        if(!contractorId) return toast.warn("Contratante é obrigatório", { theme: 'colored'});
        
        if(!body.dueDate) body.dueDate = null;   
        if(!body.endRecurrence) body.endRecurrence = null;   
        if(!body.saleDate) body.saleDate = null;   
        body.serviceModuleIds = modules.map(x => x.id!);

        if(!body.id) {
            await create(body);
        } else {
            await update(body);
        };
    };

    const create = async (body: TCustomerContract) => {
        try {
            const { status, data} = await api.post('/customer-contracts', {...body, contractorId, total: convertStringMoney(body.total.toString()), subTotal: convertStringMoney(body.subTotal.toString()), discount: convertStringMoney(body.discount.toString())}, configApi());

            resolveResponse({status, ...data});
            cancel();
            await getContract();
        } catch (error) {
            resolveResponse(error);
        }
    };

    const update = async (body: TCustomerContract) => {
        try {
            const { status, data} = await api.put(`/customer-contracts`, {...body, contractorId, total: convertStringMoney(body.total.toString()), subTotal: convertStringMoney(body.subTotal.toString()), discount: convertStringMoney(body.discount.toString())}, configApi());

            resolveResponse({status, ...data});
            cancel();
            await getContract();
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getContract = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/customer-contracts?deleted=false&contractorId=${contractorId}&orderBy=code&sort=desc&pageSize=100&pageNumber=1`, configApi());
            const result = data.result;

            setCustomerContract(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const destroy = async () => {
        try {
        const { status } = await api.delete(`/customer-contracts/${currentId}`, configApi());
            resolveResponse({status, message: "Excluído com sucesso"});
            setModalDelete(false);
            cancel();
            await getContract();
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getCurrentBody = (action: "create" | "edit" = "create", contract: TCustomerContract) => {
        const currentContract = {...contract}
        if(currentContract.saleDate) currentContract.saleDate = currentContract.saleDate.split("T")[0];
        if(currentContract.dueDate) currentContract.dueDate = currentContract.dueDate.split("T")[0];

        currentContract.total = convertNumberMoney(currentContract.total);
        currentContract.subTotal = convertNumberMoney(currentContract.subTotal);
        currentContract.discount = convertNumberMoney(currentContract.discount);
        reset(currentContract);

        setModules(currentContract.serviceModuleIds);
        setValue("serviceModuleIds", currentContract.serviceModuleIds);
    };
    
    const getDestroy = (id: string) => {
        setCureentId(id);
        setModalDelete(true);
    };

    const cancel = () => {
        reset(ResetCustomerContract);
    };

    const getSelectCategory = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/generic-tables/table/categoria-contrato-cliente`, configApi());
            const result = data.result;
            setCategory(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };
    
    const getSelectSeller = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/sellers?deleted=false&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=1`, configApi());
            const result = data.result;
            setSeller(result.data ?? []);
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
    
    const getSelectReceiptAccount = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/generic-tables/table/conta-recebimento-contrato-cliente`, configApi());
            const result = data.result;
            setReceiptAccount(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const getSelectPlan = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/plans?deleted=false&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=1&in$type=${contractorType},B2B e B2C`, configApi());
            const result = data.result;
            setPlan(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const getSelectServiceModule = async (planId: string) => {
        try {
            setLoading(true);
            const {data} = await api.get(`/service-modules?deleted=false&planId=${planId}&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=1`, configApi());
            const result = data.result;
            setServiceModule(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };
    
    const selectModule = (module: TServiceModule[]) => {
        const value = module.reduce((value: number, x: TServiceModule) => value + parseFloat(x.price), 0);
        setValue("subTotal", convertNumberMoney(value));
        setValue("total", convertNumberMoney(value));
        calcultedTotal();
        setModules(module)
    };
    
    useEffect(() => {
        reset(ResetCustomerContract);
        setTabCurrent("data");

        getContract();
        getSelectCategory();
        getSelectCostCenter();
        getSelectPaymentMethod();
        getSelectReceiptAccount();
        getSelectPlan();
        getSelectSeller();
    }, []);

    useEffect(() => {
        if(watch("type") == "Recorrente") {
            const newBody = {...getValues()};
            newBody.paymentCondition = "Parcelado";
            reset(newBody);
        };
    }, [watch("type")]);
    
    useEffect(() => {
        const total = !watch("total") ? 0 : convertMoneyToNumber(watch("total"));
        const valueParc = !watch("valueParc") ? 0 : convertMoneyToNumber(watch("valueParc"));
        const installments = watch("paymentInstallmentQuantity");
        
        if(total > 0  || valueParc > 0) {
            if(total > 0) {
                const parcelValueRaw = Math.trunc((total / installments) * 100) / 100;

                const parcelValueFormatted = convertNumberMoney(parcelValueRaw);

                setValue("valueParc", parcelValueFormatted);
            }
        };
    }, [watch("paymentInstallmentQuantity")]);

    useEffect(() => {
        if(watch("planId")) {
            getSelectServiceModule(watch("planId"));
        };
    }, [watch("planId")]);

    useEffect(() => {
        if(watch("paymentCondition") == "Parcelado") {
            const total = convertMoneyToNumber(watch("total"));
            const installments = Number(watch("paymentInstallmentQuantity")) || 1;

            const parcelValueRaw = Math.trunc((total / installments) * 100) / 100;

            const parcelValueFormatted = convertNumberMoney(parcelValueRaw);

            setValue("valueParc", parcelValueFormatted);
        };
    }, [watch("paymentCondition")])

    const inputValue = (e: React.ChangeEvent<HTMLInputElement>, input: "total" | "subTotal" | "discount" | "valueParc") => {
        maskMoney(e);

        const paymentCondition = watch("paymentCondition");
        
        if (paymentCondition === "Parcelado") {
            if (input === "total") {
                const total = convertMoneyToNumber(e.target.value);
                const installments = Number(watch("paymentInstallmentQuantity")) || 1;

                const parcelValueRaw = Math.trunc((total / installments) * 100) / 100;

                const parcelValueFormatted = convertNumberMoney(parcelValueRaw);

                setValue("valueParc", parcelValueFormatted);
            } else {
                const valueParc = convertMoneyToNumber(e.target.value);
                const installments = Number(watch("paymentInstallmentQuantity")) || 1;

                const parcelValueRaw = Math.trunc((valueParc * installments) * 100) / 100;

                const parcelValueFormatted = convertNumberMoney(parcelValueRaw);

                setValue("total", parcelValueFormatted);
            }
        };

        calcultedTotal(input == "discount" ? convertMoneyToNumber(e.target.value) : null);
    };

    const calcultedTotal = (valueDiscount?: number | null) => {
        const subTotal = convertMoneyToNumber(watch("subTotal"));

        if(subTotal > 0) {
            const discount = valueDiscount ? valueDiscount : convertMoneyToNumber(watch("discount"));
            const calculted = subTotal - discount!;

            setValue("total", calculted >= 0 ? convertNumberMoney(calculted) : '0,00')
        };    
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="card-modal">
            <div className="grid grid-cols-1 lg:grid-cols-8 gap-2 mb-2">  
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Tipo do Contrato</label>
                    <select className="select slim-select-primary" {...register("type")}>
                        <option value="Avulsos">Avulsos</option>
                        <option value="Recorrente">Recorrente</option>
                    </select>
                </div>    
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>{watch("type") == "Avulsos" ? 'Data da Venda' : 'Data de Inicio'}</label>
                    <input {...register("saleDate")} type="date" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                {
                    watch("type") == "Recorrente" &&
                    <>
                        <div className={`flex flex-col col-span-1 mb-2`}>
                            <label className={`label slim-label-primary`}>Data do Término</label>
                            <input {...register("endRecurrence")} type="date" className={`input slim-input-primary`} placeholder="Digite"/>
                        </div>  
                    </>
                }
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>Categoria</label>
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
                    <label className={`label slim-label-primary`}>Centro de Custo</label>
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
                    <label className={`label slim-label-primary`}>Vendedor</label>
                    <select {...register("sellerId")} className="select slim-select-primary">
                        <option value="">Selecione</option>
                        {
                            sellers.map((x: TSeller) => <option key={x.id} value={x.id}>{x.name}</option>)
                        }                        
                    </select>
                </div>   
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>Planos</label>
                    <select className="select slim-select-primary" {...register("planId")}>
                        <option value="">Selecione</option>
                        {
                            plans.map((x: any) => {
                                return <option key={x.id} value={x.id}>{x.name}</option>
                            })
                        }
                    </select>
                </div> 
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>Módulo de Serviços</label>
                    <MultiSelect maxSelected={1} descriptionSelectedMax="Módulos de Serviço Selecionados" value={serviceModuleIds ?? []} onChange={(items) => selectModule(items)} options={serviceModule} labelKey="name" valueKey="id" />
                </div> 
                <div className={`flex flex-col ${watch("paymentCondition") == "Parcelado" ? 'col-span-1' : 'col-span-1'} mb-2`}>
                    <label className={`label slim-label-primary`}>Sub Total</label>
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => inputValue(e, 'subTotal')} {...register("subTotal")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div> 
                <div className={`flex flex-col ${watch("paymentCondition") == "Parcelado" ? 'col-span-1' : 'col-span-1'} mb-2`}>
                    <label className={`label slim-label-primary`}>Desconto</label>
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => inputValue(e, 'discount')} {...register("discount")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div> 
                <div className={`flex flex-col ${watch("paymentCondition") == "Parcelado" ? 'col-span-1' : 'col-span-2'} mb-2`}>
                    <label className={`label slim-label-primary`}>Total</label>
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => inputValue(e, 'total')} {...register("total")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div> 
                {
                    watch("paymentCondition") == "Parcelado" &&
                    <div className={`flex flex-col col-span-1 mb-2`}>
                        <label className={`label slim-label-primary`}>Valor da Parcela</label>
                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => inputValue(e, 'valueParc')} {...register("valueParc")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                    </div> 
                }
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>Forma de Pagameto</label>
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
                    <label className={`label slim-label-primary`}>Conta de Recebimento</label>
                    <select className="select slim-select-primary" {...register("receiptAccount")}>
                        <option value="">Selecione</option>
                        {
                            receiptAccounts.map((x: any) => {
                                return <option key={x.code} value={x.code}>{x.description}</option>
                            })
                        }
                    </select>
                </div>
                {
                    watch("type") == "Avulsos" &&
                    <div className={`flex flex-col col-span-2 mb-2`}>
                        <label className={`label slim-label-primary`}>Condição de Pagamento</label>
                        <select className="select slim-select-primary" {...register("paymentCondition")}>
                            <option value="À Vista">À Vista</option>
                            <option value="Parcelado">Parcelado</option>
                        </select>
                    </div>
                }

                {
                    watch("paymentCondition") == "Parcelado" &&
                    <>
                        {
                            watch("type") == "Avulsos" &&
                            <div className={`flex flex-col col-span-1 mb-2`}>
                                <label className={`label slim-label-primary`}>Qtd Parcelas</label>
                                <select className="select slim-select-primary" {...register("paymentInstallmentQuantity")}>
                                    {
                                        [
                                            2, 3, 4, 5, 6, 7, 8, 9, 10, 
                                            11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
                                            21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 
                                            31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 
                                            41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 
                                            51, 52, 53, 54, 55, 56, 57, 58, 59, 60
                                        ].map(x => <option key={x} value={x}>{x}</option>)
                                    }                           
                                </select>
                            </div>
                        }

                        <div className={`flex flex-col ${watch("type") == "Avulsos" ? "col-span-1" : "col-span-2"} mb-2`}>
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
                    </>
                }    

                <div className={`flex flex-col col-span-8 mb-2`}>
                    <label className={`label slim-label-primary`}>Observações</label>
                    <textarea {...register("notes")} className={`slim-textarea slim-textarea-primary`} placeholder="Digite" rows={3}></textarea>
                </div>
            </div>

            <div className="flex justify-end gap-2 w-12/12 mt-3 mb-4">
                <Button type="button" click={cancel} text="Cancelar" theme="primary-light" styleClassBtn=""/>
                <Button type="submit" text={watch("id") ? 'Salvar' : 'Adicionar'} theme="primary" styleClassBtn=""/>
            </div>

            <div className="grid grid-cols-1 gap-2 mb-2">
                <div className="w-full overflow-x-auto hidden lg:block">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tl-xl`}>N° do Contrato</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Data da Venda</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Sub Total</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Disconto</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Total</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Categoria</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Condição de Pagamento</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tr-xl`}>Ações</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-100">
                            {
                                customerContracts.map((x: any) => {
                                    return (
                                        <tr key={x.id}>
                                            <td className="px-4 py-2">{x.code}</td>
                                            <td className="px-4 py-2">{maskDate(x.saleDate)}</td>
                                            <td className="px-4 py-2">{convertNumberMoney(x.subTotal)}</td>
                                            <td className="px-4 py-2">{convertNumberMoney(x.discount)}</td>
                                            <td className="px-4 py-2">{convertNumberMoney(x.total)}</td>
                                            <td className="px-4 py-2">{x.categoryDescription}</td>
                                            <td className="px-4 py-2">{x.paymentCondition}</td>
                                            <td className="p-2">
                                                <div className="flex gap-3">
                                                    <IconEdit action="edit" obj={x} getObj={getCurrentBody}/>
                                                    <IconDelete obj={x} getObj={getDestroy}/>                                                
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-end gap-2 w-12/12 mt-3 mb-4">
                <Button type="button" click={onClose} text="Fechar" theme="primary-light" styleClassBtn=""/>
            </div>

            <ModalDelete
                title='Excluír Beneficiário'
                isOpen={modalDelete} setIsOpen={() => setModalDelete(!modalDelete)} 
                onClose={() => setModalDelete(false)}
                onSelectValue={destroy}
            />   
        </form>
    )
}