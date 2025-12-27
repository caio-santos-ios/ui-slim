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
import { IconDelete } from "@/components/Global/IconDelete";
import { ModalDelete } from "@/components/Global/ModalDelete";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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
    const [modalDelete, setModalDelete] = useState(false);
    const [modules] = useAtom<TMenuRoutine[]>(menuRoutinesAtom);
    const [subModules, setSubModule] = useState<any[]>([]);
    const [userAdmin, setUserAdmin] = useState(false);

    const [passwordEnabled, setPasswordEnabled] = useState<boolean>(false);
    
    const { register, handleSubmit, reset, watch, setValue, formState: { errors }} = useForm<TUser>({
        defaultValues: ResetUser
    });

    const myModules = watch("modules");
    
    const onSubmit: SubmitHandler<TUser> = async (body: TUser) => {
        const moduleSaved: any[] = watch("modules");
        
        if(watch("module")) {
            const currentModule = modules.find(x => x.code == watch("module"));
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
       
            
        }; 

        const form: any = {
            id: body.id,
            modules: body.modules,
            name: body.name,
            email: body.email,
            admin: body.admin,
            blocked: body.blocked
        };
        
        if(!body.id) {
            form.password = watch("password");
            await create(form);
        } else {
            await update(form);
        };
    };
      
    const create = async (body: any) => {
        try {
            const { status, data} = await api.post(`/users`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
        } catch (error) {
            resolveResponse(error);
        }
    };

    const update = async (body: any) => {
        try {
            const { status, data} = await api.put(`/users/modules`, body, configApi());
            resolveResponse({status, ...data});
            reset(ResetUser);
            getById(id)
        } catch (error) {
            resolveResponse(error);
        }
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

    const removeSubModule = async (x: any) => {
        if(x) {
            const currentModule = myModules.findIndex((x: any) => x.code == x.code.slice(0, 1));
            const newRoutines = myModules[currentModule].routines.filter((r: any) => r.code != x.code);
            myModules[currentModule].routines = newRoutines;

            const form = {
                id: watch("id"),
                modules: myModules,
                admin: watch("admin"),
                email: watch("email"),
                name: watch("name")
            };

            await update(form);
        };
    };

    const cancel = () => {
        reset(ResetUser);
        onClose();
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
    
    useEffect(() => {
        const admin = localStorage.getItem("admin");
        if(admin) setUserAdmin(admin == "true");
    }, [])

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
                                {/* {
                                    !watch("id") &&
                                    <div className={`flex flex-col col-span-2`}>
                                        <label className="slim-label-primary" htmlFor="password">Senha</label>
                        
                                        <div className={`container-password rounded-md flex items-center pr-2 ${errors.password ? 'border border-red-500 text-red-500' : 'slim-input-primary'}`}>
                                            <input {...register("password")} id="password" placeholder="Digite sua senha" className="py-[.4rem] px-2 w-full" type={`${passwordEnabled ? 'text' : 'password'}`} />
                                            {
                                                passwordEnabled ? <FaEye onClick={() => setPasswordEnabled(!passwordEnabled)} size={25}/> : <FaEyeSlash onClick={() => setPasswordEnabled(!passwordEnabled)} size={25}/>
                                            }
                                        </div>
                                    </div>
                                } */}
                                {
                                    userAdmin &&
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>Admin</label>
                                        <label className="slim-switch">
                                            <input {...register("admin")} type="checkbox"/>
                                            <span className="slider"></span>
                                        </label>
                                    </div>  
                                }
                                <div className={`flex flex-col mb-2`}>
                                {/* <div className={`flex flex-col ${watch("id") ? `col-span-6` : `col-span-4`} mb-2`}> */}
                                    <label className={`label slim-label-primary`}>Bloqueado</label>
                                    <label className="slim-switch">
                                        <input {...register("blocked")} type="checkbox"/>
                                        <span className="slider"></span>
                                    </label>
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
                                <div className={`flex flex-col col-span-2 mb-2`}>
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
                            <hr className="mt-3 slim-text-primary" />
                            <h3 className="mt-5 font-bold text-lg">Módulos do Usuário</h3>
                            <ul className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-2">
                                {
                                    myModules.map((x: any) => {
                                        return (
                                            x.routines.length > 0 &&
                                            <li key={x.code} className="bg-gray-100 shadow-lg shadow-gray-100/50 p-3 rounded-lg mb-3">
                                                <div className="flex gap-1">
                                                    <span className="font-bold">{x.description}</span>
                                                </div>

                                                <ul key={x.code}>
                                                    {
                                                        x.routines.map((r: any) => {
                                                            return (
                                                                <li key={r.code} className="flex justify-between">
                                                                    <span className="text-gray-500">{r.description}</span>
                                                                    <IconDelete obj={r} getObj={removeSubModule} />
                                                                </li>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                            </li>
                                        )
                                    })
                                }
                            </ul>                          
                            <div className="flex justify-end gap-2 w-12/12 mt-3">
                                <Button type="button" click={cancel} text="Fechar" theme="primary-light" styleClassBtn=""/>
                                <Button type="submit" text="Salvar" theme="primary" styleClassBtn=""/>
                            </div>  

                            <ModalDelete
                                title='Excluír Sub Módulo'
                                isOpen={modalDelete} setIsOpen={() => setModalDelete(!modalDelete)} 
                                onClose={() => setModalDelete(false)}
                                onSelectValue={removeSubModule}
                            />  
                        </form>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>    
    )
}