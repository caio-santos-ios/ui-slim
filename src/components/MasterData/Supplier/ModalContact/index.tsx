"use client";

import "./style.css";
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { Button } from "@/components/Global/Button";
import { maskPhone } from "@/utils/mask.util";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { ResetContact, TContact } from "@/types/masterData/contact/contact.type";
import { TGenericTable } from "@/types/masterData/genericTable/genericTable.type";
import { ModalDelete } from "@/components/Global/ModalDelete";
import { toast } from "react-toastify";
import { IconEdit } from "@/components/Global/IconEdit";
import { IconDelete } from "@/components/Global/IconDelete";
import { FaCirclePlus } from "react-icons/fa6";
import { ModalGenericTable } from "@/components/Global/ModalGenericTable";
import { modalGenericTableAtom, tableGenericTableAtom } from "@/jotai/global/modal.jotai";

type TProp = {
    parentId: string;
}

export const ModalContact = ({parentId}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [__, setModalGenericTable] = useAtom(modalGenericTableAtom);
    const [___, setTableGenericTable] = useAtom(tableGenericTableAtom);
    const [modalDelete, setModalDelete] = useState<boolean>(false);
    const [departaments, setDepartament] = useState<TGenericTable[]>([]);
    const [positions, setPosition] = useState<TGenericTable[]>([]);
    const [contacts, setContact] = useState<TContact[]>([]);
    
    const { register, handleSubmit, reset, watch, setValue, formState: { errors }} = useForm<TContact>();

    const onSubmit: SubmitHandler<TContact> = async (body: TContact) => {
        if(!parentId) return toast.warn("Dados Gerais é obrigatório", { theme: 'colored'});

        body.parent = "accredited-network";
        body.parentId = parentId;

        if(watch("id")) {
            await update(body);
        } else {
            await create(body);
        };

        await getAll();
    };

    const create = async (body: TContact) => {
        try {
            const { status, data} = await api.post('/contacts', body, configApi());
            cancel()            
            resolveResponse({status, ...data});
        } catch (error) {
            resolveResponse(error);
        }
    };
    
    const update = async (body: TContact) => {
        try {
            const { status, data} = await api.put(`/contacts`, body, configApi());
            cancel()
            resolveResponse({status, ...data});
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getAll = async () => {
        try {
            const {data} = await api.get(`/contacts?deleted=false&pageSize=100&pageNumber=1&sort=createdAt&orderBy=createdAt&parentId=${parentId}&parent=accredited-network`, configApi());
            const result = data.result;
            setContact(result.data);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const cancel = () => {
        reset(ResetContact);
    };

    const getContact = async (action: "edit" | "create", contact: TContact) => {
        reset({...contact});
    };
    
    const getContactDelete = (contact: TContact) => {
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

    const getSelectDepartament = async () => {
        try {
            const {data} = await api.get(`/generic-tables/table/departamento-contato`, configApi());
            const result = data.result;
            setDepartament(result.data);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getSelectPosition = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/generic-tables/table/funcao-contato`, configApi());
            const result = data.result;
            setPosition(result.data);
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
        getSelectDepartament();
        getSelectPosition();
    };

    useEffect(() => {
        getAll();
        onReturnGeneric();
    }, []);

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 mb-2">
                    <div className={`flex flex-col col-span-2 mb-2`}>
                        <label className={`label slim-label-primary`}>Nome</label>
                        <input {...register("name")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                    </div>
                    <div className={`flex flex-col col-span-2 mb-2`}>
                        <label className={`label slim-label-primary`}>E-mail</label>
                        <input {...register("email", {pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "E-mail inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                    </div>
                    <div className={`flex flex-col mb-2`}>
                        <label className={`label slim-label-primary`}>Telefone</label>
                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("phone")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                    </div>
                    <div className={`flex flex-col mb-2`}>
                        <label className={`label slim-label-primary`}>WhatsApp</label>
                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("whatsapp")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                    </div>
                    <div className={`flex flex-col col-span-2 mb-2`}>
                        <label className={`label slim-label-primary flex gap-1 items-center`}>Departamento <span onClick={() => genericTable("departamento-contato")} className="pr-2 cursor-pointer"><FaCirclePlus /></span></label>
                        <select className="select slim-select-primary" {...register("department")}>
                            <option value="">Selecione</option>
                            {
                                departaments.map((x: any) => {
                                    return <option key={x.code} value={x.code}>{x.description}</option>
                                })
                            }
                        </select>
                    </div>
                    <div className={`flex flex-col col-span-2 mb-2`}>
                        <label className={`label slim-label-primary flex gap-1 items-center`}>Função <span onClick={() => genericTable("funcao-contato")} className="pr-2 cursor-pointer"><FaCirclePlus /></span></label>
                        <select className="select slim-select-primary" {...register("position")}>
                            <option value="">Selecione</option>
                            {
                                positions.map((x: any) => {
                                    return <option key={x.code} value={x.code}>{x.description}</option>
                                })
                            }
                        </select>
                    </div>
                    <div className={`flex flex-col justify-end mb-2`}>
                        <Button type="button" click={cancel} text="Cancelar" theme="primary-light" styleClassBtn="h-20"/>
                    </div>
                    <div className={`flex flex-col justify-end mb-2`}>
                        <Button type="submit" text={watch("id") ? 'Salvar' : 'Adicionar'} theme="primary" styleClassBtn=""/>
                    </div> 
                    <div className={`flex flex-col col-span-7 mb-2 mt-4`}>
                        <ul className="grid grid-cols-1 lg:grid-cols-6 lg:gap-10 list-contact">
                            {
                                contacts.map((x: any) => {
                                    return (
                                        <div className="bg-gray-400 shadow-lg shadow-gray-500/50 text-white col-span-3 rounded-4xl p-5 text-lg" key={x.id}>
                                            <div className="flex justify-between">
                                                <p><strong>Nome:</strong> {x.name}</p>

                                                <div className="flex gap-2">
                                                    <IconEdit action="edit" obj={x} getObj={getContact} />
                                                    <IconDelete obj={x} getObj={getContactDelete} />
                                                </div>
                                            </div>
                                            <p><strong>E-mail:</strong> {x.email}</p>
                                            <p><strong>Telefone:</strong> {x.phone}</p>
                                            <p><strong>WhatsApp:</strong> {x.whatsapp}</p>
                                            <div className="flex justify-between">
                                                <p><strong>Departamento:</strong> {x.departmentDescription}</p>
                                                <p><strong>Função:</strong> {x.positionDescription}</p>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </ul>
                    </div>                   
                </div>
            </form>
        
                        
            <ModalDelete
                title='Excluír Contato'
                isOpen={modalDelete} setIsOpen={() => setModalDelete(modalDelete)}
                onClose={() => setModalDelete(false)}
                onSelectValue={destroyContact}
            />

            <ModalGenericTable onReturn={onReturnGeneric} /> 
        </>
    )
}