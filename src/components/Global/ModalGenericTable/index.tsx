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
import { IoClose } from "react-icons/io5";
import { maskDate } from "@/utils/mask.util";
import { permissionDelete, permissionUpdate } from "@/utils/permission.util";
import { IconEdit } from "../IconEdit";
import { IconDelete } from "../IconDelete";

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
    const [qtdItems, setQtdItems] = useState<number>(0);

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
        if(!isEditItem) {
            await create({
                table:  getValues("table"),
                code: (qtdItems + 1).toString().padStart(5, '0'),
                description: getValues("description"),
                active: getValues("active") || false,
                items: [],
                createdAt: getValues("createdAt"),
            });
        } else {
            await update({
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
            const { data } = await api.get(`/generic-tables/table/all/${table}`, configApi());
            const result: any[] = data.result?.data || []; 
            console.log(result)
            setQtdItems(result.length);
            setItems(result.filter(x => !x.deleted));  
            setValue("table", table);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
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
        <>
            <Dialog
                open={modal}
                as="div"
                className="relative z-999 focus:outline-none"
                onClose={cancel}>
                <div className="fixed inset-0 z-999" style={{ background: "rgba(0,15,35,.65)", backdropFilter: "blur(5px)" }}/>

                <div className="fixed inset-0 z-1000 flex items-start justify-center pt-14 px-4 pb-6 overflow-y-auto">
                    <DialogPanel
                        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
                        style={{
                            background: "var(--surface-card)",
                            border: "1px solid var(--surface-border)",
                            animation: "modal-slide-in .25s cubic-bezier(.34,1.56,.64,1)",
                        }}
                    >
                        <div
                            className="flex items-center justify-between px-6 py-0 h-14"
                            style={{
                                background: "linear-gradient(135deg, var(--primary-color-light) 0%, var(--primary-color) 100%)",
                            }}
                        >
                            <DialogTitle as="h2" className="text-sm font-bold text-white">
                                Tabela Genérica
                            </DialogTitle>
                            <span
                                onClick={cancel}
                                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer"
                                style={{ background: "rgba(255,255,255,.1)", border: "none", boxShadow: "none", color: "rgba(255,255,255,.7)" }}
                            >
                                <IoClose size={18} />
                            </span>
                        </div>

                        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100dvh - 16rem)" }}>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 mb-2">
                                    <div className={`flex flex-col col-span-${isEditItem ? '4' : '5'} mb-2`}>
                                        <label className={`label slim-label-primary`}>Descrição</label>
                                        <input {...register("description")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div> 
                                    <div className={`flex flex-col col-span-${isEditItem ? '2' : '1'} justify-end mb-2`}>
                                        <div className="flex justify-end gap-2 w-12/12 mt-3">
                                            {
                                                isEditItem &&
                                                <Button click={cancelItem} text="Cancelar" theme="primary-light" styleClassBtn=""/>
                                            }
                                            <Button click={saveItem} text={isEditItem ? 'Salvar' : 'Adicionar'} theme="primary" styleClassBtn=""/>
                                        </div> 
                                    </div> 
                                </div>

                                <div className="slim-container-table max-h-[calc(100dvh-18rem)] w-full">                    
                                    <table className="min-w-full divide-y">
                                        <thead className="slim-table-thead">
                                            <tr>
                                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider rounded-tl-xl`}>#</th>
                                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider`}>Descrição</th>
                                                <th scope="col" className={`px-4 py-3 text-center text-sm font-bold tracking-wider rounded-tr-xl`}>Ações</th>
                                            </tr>
                                        </thead>
            
                                        <tbody className="slim-body-table divide-y">
                                            {
                                                items.map((x: any) => {
                                                    return (
                                                        <tr className="slim-tr" key={x.id}>                                            
                                                            <td className="px-4 py-2">{x.code}</td>
                                                            <td className="px-4 py-2">{x.description}</td>
                                                            <td className="text-center">
                                                                <div className="flex justify-center gap-2">
                                                                    <MdEdit className="cursor-pointer text-yellow-400" onClick={() => getItem(x)} /> 
                                                                    <FaTrash className="cursor-pointer text-red-400" onClick={() => openModalDelete(x)} />                                 
                                                                </div>
                                                            </td>    
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>
                                </div>

                                <DataTable isActive={items.length > 0} columns={columns}>
                                    {items.map((x, i) => (
                                        <tr key={x.id || i} className="border-b"> 
                                            {columns.map((col) => (
                                                <td className="px-4 py-3 text-sm" key={col.key}>
                                                    {col.key === "active" 
                                                        ? (x.active ? 'Ativo' : 'Inativo') 
                                                        : x[col.key as keyof TGenericTable]}
                                                </td>        
                                            ))}   
                                            <td className="text-center">
                                                <div className="flex justify-center gap-2">
                                                    <IconEdit action="edit" obj={x} getObj={() => {
                                                        getItem(x);
                                                    }}/>
                                                    <IconDelete obj={x} getObj={() => {
                                                        openModalDelete(x);
                                                    }}/>                                                   
                                                </div>
                                            </td>         
                                        </tr>
                                    ))}
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
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </>    
    )
}