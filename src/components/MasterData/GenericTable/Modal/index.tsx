"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { TGenericTable } from "@/types/masterData/genericTable/genericTable.type";
import { Button } from "@/components/Global/Button";
import DataTable from "@/components/Global/Table";
import { MdEdit } from "react-icons/md";
import { ModalDelete } from "@/components/Global/ModalDelete";
import { FaTrash } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const columns: any[] = [
  { key: "code", title: "Código" },
  { key: "description", title: "Descrição" },
  { key: "active", title: "Ativo" },
];


type TProp = {
    title: string;
    isOpen: boolean;
    action: "create" | "edit" | "delete";
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean) => void;
    body?: TGenericTable
}

export const ModalGenericTable = ({title, isOpen, action, setIsOpen, onClose, onSelectValue, body}: TProp) => {
    const [items, setItems] =  useState<TGenericTable[]>([]);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [isEditItem, setIsEditItem] = useState<boolean>(false);
    const [currentAction, setCurrentAction] = useState<"create" | "edit" | "delete">("create")
    const [modal] = useState<boolean>(false);
    const [modalDelete, setModalDelete] = useState<boolean>(false);
    const [currentBody, setCurrentBody] = useState<TGenericTable>();

    const { register, handleSubmit, reset, getValues, formState: { errors }} = useForm<TGenericTable>();

    const onSubmit: SubmitHandler<TGenericTable> = async (body: TGenericTable) => {
        if(!body.id) {
          await create(body);
        } else {
          await update(body);
        }
    };

    const create = async (body: TGenericTable, openModal: boolean = false) => {
        try {
            const { status, data} = await api.post(`/generic-tables`, body, configApi());
            resolveResponse({status, ...data});
            await getByTable(getValues("table"));
            action = "edit";
            setIsEdit(true);
            // setCurrentBody(data.result.data);

            if(openModal) {
                cancel();
                onSelectValue(true);
            };
            return true;
        } catch (error) {
            resolveResponse(error);
            return false;
        }
    };
      
    const update = async (body: TGenericTable, openModal: boolean = false) => {
        try {
            const { status, data} = await api.put(`/generic-tables`, body, configApi());
            resolveResponse({status, ...data});
            if(openModal) {
                cancel();
                onSelectValue(true);
            };
            return true;
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

        onClose();
        setIsEdit(false);
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
            success = res;
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
            success = res;
        };

        if(success) {
            await getByTable(getValues("table"));
            cancelItem();
        };
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

    const getByTable = async (table: string) => {
        try {
            const {data} = await api.get(`/generic-tables/table/${table}`, configApi());

            setItems(data.result.data);  
            setCurrentAction("edit");
        } catch (error) {
            resolveResponse(error);
        }
    };
    
    useEffect(() => {
        setCurrentAction(action);
        if(body) {
            reset({
                active: true,
                code: "",
                table: body.table,
                description: "",
                items: [],
            });
            setIsEdit(true);
            setItems(body.items);
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
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Tabela</label>
                                    <input disabled={isEdit && items.length > 0} {...register("table")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
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
                                            <button type="button" onClick={cancelItem} className="slim-btn slim-btn-primary-light">Cancelar</button>
                                        }
                                        <button type="button" onClick={saveItem} className="slim-btn slim-btn-primary-light">{isEditItem ? 'Salvar' : 'Adicionar'}</button>
                                    </div> 
                                </div> 
                            </div>

                            <DataTable isActive={currentAction == "edit" && items.length > 0} columns={columns}>
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
                                                <MdEdit className="cursor-pointer text-yellow-400 hover:text-yellow-500"  onClick={() => getItem(x)} /> 
                                                <FaTrash className="cursor-pointer text-red-400 hover:text-red-500" onClick={() => openModalDelete(x)} />                                                 
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
                                <button type="button" onClick={cancel} className="slim-btn slim-btn-primary-light">Cancelar</button>
                                <Button text="Salvar" theme="primary" styleClassBtn=""/>
                            </div>  
                        </form>
                        </div>

                    </DialogPanel>
                </div>
            </Dialog>
        </>    
    )
}