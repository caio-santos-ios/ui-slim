"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { Button } from "@/components/Global/Button";
import { modalGenericTableAtom, tableGenericTableAtom } from "@/jotai/global/modal.jotai";
import { ResetUser, TUser } from "@/types/masterData/user/user.type";
import { menuRoutinesAtom } from "@/jotai/global/menu.jotai";
import { TMenuRoutine } from "@/types/global/menu.type";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    handleReturnModal: (isSuccess: boolean) => void;
    id: string;
}

export const ModalUser = ({title, isOpen, setIsOpen, onClose, handleReturnModal, id}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [__, setModalGenericTable] = useAtom(modalGenericTableAtom);
    const [___, setTableGenericTable] = useAtom(tableGenericTableAtom);

    const [modules, setModules] = useAtom<TMenuRoutine[]>(menuRoutinesAtom);
    const [subModules, setSubModule] = useState<any[]>([]);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors }} = useForm<TUser>({
        defaultValues: ResetUser
    });

    const onSubmit: SubmitHandler<TUser> = async (body: TUser) => {
        const currentModule = modules.find(x => x.code == watch("module"));
        const moduleSaved: any[] = watch("modules");
        const index = moduleSaved.findIndex(x => x.code == watch("module"));
        
        if(index >= 0) {
            const subModuleIndexSaved = moduleSaved[index].routines.findIndex((x: any) => x.code == watch("subModule"));
            
            if(subModuleIndexSaved >= 0) {
                body.modules[index].routines[subModuleIndexSaved].permissions = {
                    create: watch("permission.create"),
                    read: watch("permission.read"),
                    update: watch("permission.update"),
                    delete: watch("permission.delete"),
                };
            } else {
                const currentModule = modules.find((x: TMenuRoutine) => x.code == watch("module"));
                const currentSubModule = currentModule?.subMenu.find((x: TMenuRoutine) => x.code == watch("subModule"));

                body.modules[index].routines.push({     
                    code: currentSubModule?.code,
                    description: currentSubModule?.description,
                    permissions: body.permission                    
                });                
            };           
        } else {
            const currentSubModule = currentModule?.subMenu.find((x: TMenuRoutine) => x.code == watch("subModule"));
            body.modules.push({
                code: currentModule?.code,
                description: currentModule?.description,
                routines: [{
                    code: currentSubModule?.code,
                    description: currentSubModule?.description,
                    permissions: body.permission
                }]
            })
        };

        const form = {
            id: body.id,
            modules: body.modules
        };

        await update(form);
    };
      
    const update = async (body: any) => {
        try {
            const { status, data} = await api.put(`/users/modules`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            handleReturnModal(true);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const cancel = () => {
        reset(ResetUser);
        onClose();
    };

    const getById = async (id: string) => {
        try {
            setLoading(true);
            const {data} = await api.get(`/users/${id}`, configApi());
            const result = data.result;
            reset({...result.data});
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const subModule = modules.find((x: TMenuRoutine) => x.code == watch("module"));
        if(subModule) {
            setSubModule(subModule.subMenu)
        };
    }, [watch("module")]);
    
    useEffect(() => {
        const moduleSaved: any[] = watch("modules");
        const moduleIndexSaved = moduleSaved.findIndex((x: any) => x.code == watch("module"));
        
        setValue("permission", {create: false, read: false, update: false, delete: false});
        if(moduleIndexSaved >= 0) {
            const subModuleIndexSaved = moduleSaved[moduleIndexSaved].routines.findIndex((x: any) => x.code == watch("subModule"));
            
            if(subModuleIndexSaved >= 0) {
                const currenSubModule = moduleSaved[moduleIndexSaved].routines[subModuleIndexSaved];
                setValue("permission", {...currenSubModule.permissions});
            };
        };
    }, [watch("subModule")]);

    useEffect(() => {
        if(id) {
            getById(id);
        };
    }, [id]);

    return (
        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto container-modal">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className="w-full max-w-4xl rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="bg-red mb-4 border-b-3 header-modal">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">{title}</DialogTitle>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 mb-2">
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Nome</label>
                                    <input {...register("name")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>
                                <div className={`flex flex-col col-span-4 mb-2`}>
                                    <label className={`label slim-label-primary`}>E-mail</label>
                                    <input {...register("email", { pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "E-mail inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Módulos</label>
                                    <select className="select slim-select-primary" {...register("module")}>
                                        <option value="">Selecione</option>
                                        {
                                            modules.map((x: TMenuRoutine) => {
                                                return x.subMenu.length > 0 && <option key={x.code} value={x.code}>{x.description}</option>
                                            })
                                        }
                                    </select>
                                </div>     
                                <div className={`flex flex-col col-span-4 mb-2`}>
                                    <label className={`label slim-label-primary`}>Sub Módulo</label>
                                    <select className="select slim-select-primary" {...register("subModule")}>
                                        <option value="">Selecione</option>
                                        {
                                            subModules.map((x: TMenuRoutine) => {
                                                return <option key={x.code} value={x.code}>{x.description}</option>
                                            })
                                        }
                                    </select>
                                </div>                                   
                                {
                                    watch("subModule") &&
                                    <div className={`flex flex-col col-span-6 mb-2`}>
                                        <ul className="grid grid-cols-1 lg:grid-cols-4 gap-2">
                                            <li className="bg-gray-100 shadow-lg shadow-gray-100/50 p-3 rounded-lg">
                                                <div className="flex gap-1">
                                                    <input {...register("permission.read")} type="checkbox" />
                                                    <span className="font-bold">Listagem</span>
                                                </div>

                                                <p className="text-gray-500">Permite que o usuário liste registros</p>
                                            </li>
                                            <li className="bg-gray-100 shadow-lg shadow-gray-100/50 p-3 rounded-lg">
                                                <div className="flex gap-1">
                                                    <input {...register("permission.create")} type="checkbox" />
                                                    <span className="font-bold">Criação</span>
                                                </div>

                                                <p className="text-gray-500">Permite que o usuário crie registros</p>
                                            </li>
                                            <li className="bg-gray-100 shadow-lg shadow-gray-100/50 p-3 rounded-lg">
                                                <div className="flex gap-1">
                                                    <input {...register("permission.update")} type="checkbox" />
                                                    <span className="font-bold">Edição</span>
                                                </div>

                                                <p className="text-gray-500">Permite que o usuário edite registros</p>
                                            </li>
                                            <li className="bg-gray-100 shadow-lg shadow-gray-100/50 p-3 rounded-lg">
                                                <div className="flex gap-1">
                                                    <input {...register("permission.delete")} type="checkbox" />
                                                    <span className="font-bold">Exclusão</span>
                                                </div>

                                                <p className="text-gray-500">Permite que o usuário exclua registros</p>
                                            </li>
                                        </ul>
                                    </div>
                                }
                            </div>                          
                            <div className="flex justify-end gap-2 w-12/12 mt-3">
                                <Button type="button" click={onClose} text="Fechar" theme="primary-light" styleClassBtn=""/>
                                <Button type="submit" text="Salvar" theme="primary" styleClassBtn=""/>
                            </div>  
                        </form>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>    
    )
}