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
import { IoClose } from "react-icons/io5";

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
    const [customers, setCustomers] = useState<any[]>([]);

    const [profiles, setProfiles] = useState<any[]>([]);
    
    const { register, handleSubmit, reset, watch, setValue, formState: { errors }} = useForm<TUser>({
        defaultValues: ResetUser
    });

    const myModules = watch("modules");

    const loadProfiles = async () => {
        try {
            const { data } = await api.get(`/permission-profiles?deleted=false&orderBy=name&sort=asc&pageSize=200&pageNumber=1`, configApi());
            setProfiles(data.result.data ?? []);
        } catch {}
    };
    
    const loadCustomers = async () => {
        try {
            const { data } = await api.get(`/customers/select?deleted=false&orderBy=name&sort=asc&pageSize=200&pageNumber=1`, configApi());
            console.log(data.result)
            setCustomers(data.result.data ?? []);
        } catch {}
    };

    const applyProfile = (profileId: string) => {
        if (!profileId) return;
        const profile = profiles.find((p) => p.id === profileId);
        if (!profile?.modules) return;

        const copiedModules = profile.modules.map((m: any) => ({
            code:        m.code,
            description: m.description,
            routines:    m.routines.map((r: any) => ({
                code:        r.code,
                description: r.description,
                permissions: { ...r.permissions },
            })),
        }));

        setValue("modules", copiedModules);
    };
    
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
                });
            };
        }; 

        const form: any = {
            id: body.id,
            modules: body.modules,
            name: body.name,
            email: body.email,
            admin: body.admin,
            blocked: body.blocked,
            permissionProfile: body.permissionProfile,
            type: body.type,
            contractorId: body.contractorId
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
            setLoading(true);
            const { status, data} = await api.post(`/users`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            handleReturnModal(true);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const update = async (body: any) => {
        try {
            setLoading(true);
            const { status, data} = await api.put(`/users/modules`, body, configApi());
            resolveResponse({status, ...data});
            reset(ResetUser);
            getById(id);
            handleReturnModal(true);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
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
        if(subModule) setSubModule(subModule.subMenu);
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
        if(id) getById(id);
    }, [id]);
    
    useEffect(() => {
        const admin = localStorage.getItem("admin");
        if(admin) setUserAdmin(admin == "true");
        loadProfiles();
        loadCustomers();
    }, []);

    return (
        <>
            <Dialog
                open={isOpen}
                as="div"
                className="relative z-999 focus:outline-none"
                onClose={cancel}
            >
                {/* Backdrop */}
                <div
                    className="fixed inset-0 z-999"
                    style={{ background: "rgba(0,15,35,.65)", backdropFilter: "blur(5px)" }}
                />

                <div className="fixed inset-0 z-1000 flex items-start justify-center pt-14 px-4 pb-6 overflow-y-auto">
                    <DialogPanel
                        className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
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
                            <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 mb-2">
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Nome</label>
                                    <input {...register("name")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>
                                <div className={`flex flex-col col-span-4 mb-2`}>
                                    <label className={`label slim-label-primary`}>E-mail</label>
                                    <input {...register("email", { pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "E-mail inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>
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
                                    <label className={`label slim-label-primary`}>Bloqueado</label>
                                    <label className="slim-switch">
                                        <input {...register("blocked")} type="checkbox"/>
                                        <span className="slider"></span>
                                    </label>
                                </div>

                                <div className={`flex flex-col col-span-1 mb-2`}>
                                    <label className={`label slim-label-primary`}>Tipo</label>
                                    <select className="select slim-select-primary" {...register("type")}>
                                        <option value="Interno">Interno</option>
                                        <option value="Externo">Externo</option>
                                    </select>
                                </div>  
                                {
                                    watch("type") == "Externo" && (
                                        <div className={`flex flex-col col-span-3 mb-2`}>
                                            <label className={`label slim-label-primary`}>Contratante</label>
                                            <select className="select slim-select-primary" {...register("contractorId")}>
                                                <option value="">Selecione</option>
                                                {
                                                    customers.map((c: any) => {
                                                        return <option key={c.id} value={c.id}>{c.corporateName}</option>
                                                    })
                                                }
                                            </select>
                                        </div>
                                    )
                                }

                                <div className={`flex flex-col col-span-6 mb-2`}>
                                    <label className={`label slim-label-primary`}>
                                        Perfil de Permissão
                                        <span className="ml-1 text-xs text-(--text-muted) font-normal">
                                            — aplica os módulos do perfil como base (editável individualmente)
                                        </span>
                                    </label>
                                    <select
                                        className="select slim-select-primary"
                                        {...register("permissionProfile")}
                                        onChange={(e) => {
                                            applyProfile(e.target.value);
                                            setValue("permissionProfile", e.target.value);
                                        }}>
                                        <option value="">Selecione um perfil para aplicar...</option>
                                        {profiles.map((p: any) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
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
                        </div>

                    </DialogPanel>
                </div>
            </Dialog>
        </>    
    );
};