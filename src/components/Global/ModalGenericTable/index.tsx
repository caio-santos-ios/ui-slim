"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { ResetGenericTable, TGenericTable } from "@/types/masterData/genericTable/genericTable.type";
import { Button } from "@/components/Global/Button";
import DataTable from "@/components/Global/Table";
import { MdEdit } from "react-icons/md";
import { ModalDelete } from "@/components/Global/ModalDelete";
import { FaTrash } from "react-icons/fa";
import { useAtom } from "jotai";
import { modalGenericTableAtom, tableGenericTableAtom } from "@/jotai/global/modal.jotai";

const columns: any[] = [
  { key: "code", title: "Código" },
  { key: "description", title: "Descrição" },
  { key: "active", title: "Ativo" },
];


type TProp = {
    onReturn: () => void;
}

export const ModalGenericTable = ({onReturn}: TProp) => {
    const [modal, setModal] = useAtom(modalGenericTableAtom);
    const [table, setTable] = useAtom(tableGenericTableAtom);

    const [items, setItems] =  useState<TGenericTable[]>([]);
    const [isEditItem, setIsEditItem] = useState<boolean>(false);
    const [modalDelete, setModalDelete] = useState<boolean>(false);
    const [currentBody, setCurrentBody] = useState<TGenericTable>();

    const { register, handleSubmit, reset, getValues, setValue, formState: { errors }} = useForm<TGenericTable>();

    const onSubmit: SubmitHandler<TGenericTable> = async (body: TGenericTable) => {
        if(!body.id) {
          await create(body);
        } else {
          await update(body);
        }
    };

    const create = async (body: TGenericTable) => {
        try {
            const { status, data} = await api.post(`/generic-tables`, body, configApi());
            resolveResponse({status, ...data});
            await getByTable();
        } catch (error) {
            resolveResponse(error);
            return false;
        }
    };
      
    const update = async (body: TGenericTable) => {
        try {
            const { status, data} = await api.put(`/generic-tables`, body, configApi());
            resolveResponse({status, ...data});
            onReturn();
        } catch (error) {
            resolveResponse(error);
            return false;
        }
    };

    const cancel = () => {
        reset({
            id: "",
            code: "",
            description: "",
            table: "",
            active: true
        });

        setTable("");
        setModal(false);
    };

    const getItem = (item: TGenericTable) => {
        setCurrentBody({...item});
        reset({
            id: item.id,
            table: item.table,
            createdAt: item.createdAt,
            code: item.code,
            description: item.description,
            active: item.active,
        });
        setIsEditItem(true);
    };
    
    const saveItem = async () => {
        let success = false;
        if(!isEditItem) {
            const res = await create({
                table:  getValues("table"),
                code: getValues("code"),
                description: getValues("description"),
                active: getValues("active") || false,
                items: [],
                createdAt: getValues("createdAt"),
            });
        } else {
            const res = await update({
                id:  getValues("id")!,
                table:  getValues("table"),
                code: getValues("code"),
                description: getValues("description"),
                active: getValues("active") || false,
                items: [],
                createdAt: getValues("createdAt"),
            });
        };

        await getByTable();
        cancelItem();
        onReturn()
    };
    
    const cancelItem = () => {
        reset({
            code: "",
            description: "",
            active: true,
        });
        
        setIsEditItem(false);
    };

    const openModalDelete = (body: TGenericTable) => {
        setCurrentBody(body);
        setModalDelete(true);
    };

    const destroy = async () => {
        try {
            const { status, data} = await api.delete(`/generic-tables/${currentBody?.id}`, configApi());
            resolveResponse({status, ...data});
            const newItems = items.filter(x => x.id !== currentBody?.id);
            setItems(newItems);
            setModalDelete(false);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getByTable = async () => {
        try {
            const {data} = await api.get(`/generic-tables/table/${table}`, configApi());
            const result = data.result;
            setItems(result.data);  
            setValue("table", table);
        } catch (error) {
            resolveResponse(error);
        }
    };

    useEffect(() => {
        if(table) {
            reset(ResetGenericTable)
            getByTable();
        };
    }, [table])

    return (
        <Dialog open={modal} as="div" className="relative z-10 focus:outline-none" onClose={() => setModal(false)}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto container-modal">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className="w-full max-w-2xl rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="bg-red mb-4 border-b-3 header-modal">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">Tabela Genérica</DialogTitle>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-2">
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Tabela</label>
                                    <input disabled={items.length > 0} {...register("table")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div> 
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Código</label>
                                    <input {...register("code")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div> 
                            </div>                          
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 mb-2">
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Descrição</label>
                                    <input {...register("description")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div> 
                                <div className={`flex flex-col mb-2`}>
                                    <label className={`label slim-label-primary`}>Status</label>
                                    <label className="slim-switch">
                                        <input {...register("active")} type="checkbox"/>
                                        <span className="slider"></span>
                                    </label>
                                </div> 
                                <div className={`flex flex-col justify-end mb-2`}>
                                   <div className="flex justify-end gap-2 w-12/12 mt-3">
                                        {
                                            isEditItem &&
                                            <Button click={cancelItem} text="Cancelar" theme="primary-light" styleClassBtn=""/>
                                        }
                                        <Button click={saveItem} text={isEditItem ? 'Salvar' : 'Adicionar'} theme="primary" styleClassBtn=""/>
                                    </div> 
                                </div> 
                            </div>

                            <DataTable isActive={items.length > 0} columns={columns}>
                                <>
                                {
                                    items.map((x: any, i: number) => {
                                    return (
                                        <tr key={i}>
                                            {columns.map((col: any) => (
                                                <td className={`px-4 py-3 text-left text-sm font-medium tracking-wider`} key={col.key}>
                                                    {col.key == "active" ? x.active ? 'Ativo' : 'Inativo' : (x as any)[col.key]}
                                                </td>        
                                            ))}   
                                            <td className="text-center">
                                                <div className="flex justify-center gap-2">
                                                    <MdEdit  onClick={() => getItem(x)} /> 
                                                    <FaTrash onClick={() => openModalDelete(x)} />                                                 
                                                </div>
                                            </td>         
                                        </tr>
                                    )
                                    })
                                }
                                </>
                            </DataTable>

                            <ModalDelete 
                                title='Excluír Item'
                                isOpen={modalDelete} setIsOpen={() => setModalDelete(modal)} 
                                onClose={() => setModalDelete(false)}
                                onSelectValue={destroy}
                            />   

                            <div className="flex justify-end gap-2 w-12/12 mt-3">
                                <Button click={cancel} text="Cancelar" theme="primary-light" styleClassBtn=""/>
                            </div>  
                        </form>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>    
    )
}