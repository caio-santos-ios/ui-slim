"use client";

import "./style.css";
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { Button } from "@/components/Global/Button";
import { maskMoney, maskPhone } from "@/utils/mask.util";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { TGenericTable } from "@/types/masterData/genericTable/genericTable.type";
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { ModalDelete } from "@/components/Global/ModalDelete";
import { toast } from "react-toastify";
import { IconEdit } from "@/components/Global/IconEdit";
import { IconDelete } from "@/components/Global/IconDelete";
import { FaCirclePlus } from "react-icons/fa6";
import { modalGenericTableAtom, tableGenericTableAtom } from "@/jotai/global/modal.jotai";
import { ModalGenericTable } from "@/components/Global/ModalGenericTable";
import { ResetTradingTable, TTradingTable, TTradingTableItem } from "@/types/masterData/tradingTable/tradingTable.type";
import { convertMoneyToNumber, convertNumberMoney } from "@/utils/convert.util";
import { TServiceModule } from "@/types/masterData/serviceModules/serviceModules.type";
import { TProcedure } from "@/types/masterData/procedure/procedure.type";
import { permissionDelete, permissionUpdate } from "@/utils/permission.util";

type TProp = {
    parentId: string;
}

export const ModalTradingTable = ({parentId}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [__, setModalGenericTable] = useAtom(modalGenericTableAtom);
    const [___, setTableGenericTable] = useAtom(tableGenericTableAtom);
    const [modalDelete, setModalDelete] = useState<boolean>(false);
    const [departaments, setDepartament] = useState<TGenericTable[]>([]);
    const [positions, setPosition] = useState<TGenericTable[]>([]);
    const [contacts, setContact] = useState<TTradingTable[]>([]);
    const [serviceModules, setServiceModule] = useState<TServiceModule[]>([]);
    const [procedures, setProcedure] = useState<TProcedure[]>([]);
    
    const { register, handleSubmit, reset, watch, setValue, formState: { errors }} = useForm<TTradingTable>({
        defaultValues: ResetTradingTable
    });

    const items = watch("items");

    const onSubmit: SubmitHandler<TTradingTable> = async (body: TTradingTable) => {
        if(!body.serviceModuleId) return toast.warning("Módulo de Serviço é obrigatório", {theme: 'colored'});
        if(!body.procedureId) return toast.warning("Procedimento é obrigatório", {theme: 'colored'});

        const form: any = {
            accreditedNetworkId: parentId,
            items: body.items,
            id: body.id
        };

        if(!body.item) {
            form.items.push({
                item: (form.items.length + 1).toString(),
                serviceModuleId: body.serviceModuleId,
                procedureId: body.procedureId,
                subTotal: convertMoneyToNumber(body.subTotal),
                discount: convertMoneyToNumber(body.discount),
                discountPercentage: convertMoneyToNumber(body.discountPercentage),
                total: convertMoneyToNumber(body.total)
            });
        } else {
            const index = items.findIndex(x => x.item == body.item);
            form.items[index] = {
                item: body.item,
                serviceModuleId: body.serviceModuleId,
                procedureId: body.procedureId,
                subTotal: convertMoneyToNumber(body.subTotal),
                discount: convertMoneyToNumber(body.discount),
                discountPercentage: convertMoneyToNumber(body.discountPercentage),
                total: convertMoneyToNumber(body.total)
            };
        };

        if(!body.id) {
            await create(form);
        } else {
            form.id = body.id;
            await update(form);
        }

        await getAll();
    };

    const create = async (body: TTradingTable) => {
        try {
            const { status, data} = await api.post('/trading-tables', body, configApi());
            cancel()            
            resolveResponse({status, ...data});
        } catch (error) {
            resolveResponse(error);
        }
    };
    
    const update = async (body: TTradingTable) => {
        try {
            const { status, data} = await api.put(`/trading-tables`, body, configApi());
            cancel()
            resolveResponse({status, ...data});
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getAll = async () => {
        try {
            const {data} = await api.get(`/trading-tables?deleted=false&pageSize=100&pageNumber=1&sort=createdAt&orderBy=createdAt&accreditedNetworkId=${parentId}`, configApi());
            const result = data.result;
            if(result.data.length > 0) {
                setValue("id", result.data[0].id);
                setValue("name", result.data[0].name);
                setValue("items", result.data[0].items);
            }
        } catch (error) {
            resolveResponse(error);
        }
    };

    const cancel = () => {
        reset({
            procedureId: "",
            serviceModuleId: "",
            subTotal: 0,
            discount: 0,
            discountPercentage: 0,
            total: 0,
            items
        });
    };

    const getItem = (action: string, item: TTradingTableItem) => {
        setValue("item", item.item);
        setValue("serviceModuleId", item.serviceModuleId);
        setValue("procedureId", item.procedureId);
        setValue("subTotal", convertNumberMoney(item.subTotal));
        setValue("discount", convertNumberMoney(item.discount));
        setValue("discountPercentage", convertNumberMoney(item.discountPercentage));
        setValue("total", convertNumberMoney(item.total));
    };

    const getItemDelete = (item: TTradingTableItem) => {
        setValue("item", item.item);
        setModalDelete(true);       
    };

    const destroy = async () => {
        const newItems = items.filter(x => x.item != watch("item"));

        const form: any = {
            id: watch("id"),
            name: watch("name"),
            accreditedNetworkId: parentId,
            items: newItems
        };

        await update(form);
        await getAll();
        setModalDelete(false);
    };

    const getContact = async (action: "edit" | "create", contact: TTradingTable) => {
        reset({...contact});
    };
    
    const getContactDelete = (contact: TTradingTable) => {
        setValue("id", contact.id);
        setModalDelete(true);
    };
    
    const destroyContact = async () => {
        try {
            const { status } = await api.delete(`/contacts/${watch("id")}`, configApi());
            resolveResponse({status, message: "Excluído com sucesso"});
            setModalDelete(false);
            await getAll();
        } catch (error) {
            resolveResponse(error);
        }
    };
    
    const getSelectServiceModule = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/service-modules/select`, configApi());
            const result = data.result;
            setServiceModule(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };
    
    const getSelectProcedure = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/procedures/select`, configApi());
            const result = data.result;
            setProcedure(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const normalizeServiceModuleDescription = (id: string) => {
        const serviceModule = serviceModules.find(x => x.id == id);
        return serviceModule ? serviceModule.name : "";
    };

    const normalizeProcedureDescription = (id: string) => {
        const procedure = procedures.find(x => x.id == id);
        return procedure ? procedure.name : "";
    };

    const calculatedPercentage = (e: React.ChangeEvent<HTMLInputElement>) => {
        maskMoney(e);
        const value = e.target.value;
        if(value) {
            const discount = convertMoneyToNumber(value);
            const subTotal = convertMoneyToNumber(watch("subTotal"));
            const percentage = (discount / subTotal) * 100;

            const total = subTotal - discount;
            setValue("total", total >= 0 ? convertNumberMoney(total) : 0);
            setValue("discountPercentage", percentage > 100 ? 100 : Math.trunc(percentage * 100) / 100);
        };
    };

    const calculatedValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if(value) {
            const discount = convertMoneyToNumber(value);
            const subTotal = convertMoneyToNumber(watch("subTotal"));
            const partialValue = (subTotal * discount) / 100;
            const total = subTotal - partialValue;
            
            setValue("total", total >= 0 ? convertNumberMoney(total) : "0,00");
            setValue("discount", partialValue > total ? subTotal : convertNumberMoney(partialValue));
        }
    };
    
    useEffect(() => {
        if(watch("subTotal")) {
            const subTotal = convertMoneyToNumber(watch("subTotal"));
            const discount = convertMoneyToNumber(watch("discount"));
            const total = subTotal - discount;

            setValue("total", total >= 0 ? convertNumberMoney(total) : 0);
        };
    }, [watch("subTotal")]);

    useEffect(() => {
        getAll();
        getSelectServiceModule();
        getSelectProcedure();
    }, []);

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 mb-2">
                    <div className={`flex flex-col col-span-2 mb-2`}>
                        <label className={`label slim-label-primary flex gap-1 items-center`}>Módulo de Serviço</label>
                        <select className="select slim-select-primary" {...register("serviceModuleId")}>
                            <option value="">Selecione</option>
                            {
                                serviceModules.map((x: any) => {
                                    return <option key={x.id} value={x.id}>{x.name}</option>
                                })
                            }
                        </select>
                    </div>
                    <div className={`flex flex-col col-span-2 mb-2`}>
                        <label className={`label slim-label-primary flex gap-1 items-center`}>Procedimento</label>
                        <select className="select slim-select-primary" {...register("procedureId")}>
                            <option value="">Selecione</option>
                            {
                                procedures.map((x: any) => {
                                    return <option key={x.id} value={x.id}>{x.name}</option>
                                })
                            }
                        </select>
                    </div>
                    <div className={`flex flex-col col-span-2 mb-2`}>
                        <label className={`label slim-label-primary`}>SubTotal</label>
                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskMoney(e)} {...register("subTotal")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                    </div>  
                    <div className={`flex flex-col col-span-1 mb-2`}>
                        <label className={`label slim-label-primary`}>Desconto R$</label>
                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => calculatedPercentage(e)} {...register("discount")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                    </div>  
                    <div className={`flex flex-col col-span-1 mb-2`}>
                        <label className={`label slim-label-primary`}>Desconto %</label>
                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => calculatedValue(e)} {...register("discountPercentage")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                    </div>  
                    <div className={`flex flex-col col-span-2 mb-2`}>
                        <label className={`label slim-label-primary`}>Total</label>
                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskMoney(e)} {...register("total")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                    </div>  
                     <div className={`flex flex-col justify-end mb-2`}>
                        <Button type="button" click={cancel} text="Cancelar" theme="primary-light" styleClassBtn="h-20"/>
                    </div>
                    <div className={`flex flex-col justify-end mb-2`}>
                        <Button type="submit" text={watch("item") ? 'Salvar' : 'Adicionar'} theme="primary" styleClassBtn=""/>
                    </div> 
                    
                    <div className={`flex flex-col col-span-6 mb-2`}>
                        {
                            items.length > 0 &&
                            <div className="slim-container-table w-full">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 slim-table-thead">
                                        <tr>
                                            <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tl-xl`}>Módulo de Serviço</th>
                                            <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Procedimento</th>
                                            <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>SubTotal</th>
                                            <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Desconto R$</th>
                                            <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Desconto %</th>
                                            <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Total</th>
                                            <th scope="col" className={`px-4 py-3 text-center text-sm font-bold text-gray-500 tracking-wider rounded-tr-xl`}>Ações</th>
                                        </tr>
                                    </thead>
            
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {
                                            items.map((x: any) => {
                                                return (
                                                    <tr key={x.item}>                                            
                                                        <td className="px-4 py-2">{normalizeServiceModuleDescription(x.serviceModuleId)}</td>
                                                        <td className="px-4 py-2">{normalizeProcedureDescription(x.procedureId)}</td>
                                                        <td className="px-4 py-2">R$ {convertNumberMoney(x.subTotal)}</td>
                                                        <td className="px-4 py-2">R$ {convertNumberMoney(x.discount)}</td>
                                                        <td className="px-4 py-2">{x.discountPercentage}%</td>
                                                        <td className="px-4 py-2">R$ {convertNumberMoney(x.total)}</td>
                                                        <td className="p-2">
                                                            <div className="flex justify-center gap-3">       
                                                                {
                                                                    permissionUpdate("1", "A25") &&
                                                                    <IconEdit action="edit" obj={x} getObj={getItem}/>
                                                                }   
                                                                {
                                                                    permissionDelete("1", "A25") &&
                                                                    <IconDelete obj={x} getObj={getItemDelete}/>                                                   
                                                                }                                          
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                        }                             
                    </div>             
                </div>
            </form>
        
                        
            <ModalDelete
                title='Excluír Item'
                isOpen={modalDelete} setIsOpen={() => setModalDelete(modalDelete)}
                onClose={() => setModalDelete(false)}
                onSelectValue={destroy}
            />
        </>
    )
}