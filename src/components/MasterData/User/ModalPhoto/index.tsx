"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api, uriBase } from "@/service/api.service";
import { useEffect, useState } from "react";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { Button } from "@/components/Global/Button";
import { ResetUser, TUserPhoto } from "@/types/masterData/user/user.type";
import { IoClose } from "react-icons/io5";

type TProp = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    handleReturnModal: (isSuccess: boolean) => void;
    id: string;
}

export const ModalPhoto = ({isOpen, setIsOpen, onClose, handleReturnModal, id}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [uri, setUri] = useState<string>("");

    const { handleSubmit, reset } = useForm<TUserPhoto>({
        defaultValues: ResetUser
    });

    const onSubmit: SubmitHandler<TUserPhoto> = async (body: TUserPhoto) => {
        const formBody = new FormData();
        formBody.append("id", id);

        const attachment: any = document.querySelector('#image');
        if (attachment.files[0]) formBody.append('photo', attachment.files[0]);
        await update(formBody);
    };

    const update = async (form: FormData) => {
        try {
            const { status, data} = await api.put(`/users/profile-photo`, form, configApi(false));
            resolveResponse({status, ...data});
            reset(ResetUser);
            getById(id);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getById = async (id: string) => {
        try {
            setLoading(true);
            const {data} = await api.get(`/users/${id}`, configApi());
            const result = data.result;
            setUri(result.data.photo);
            reset({...result.data});
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const cancel = () => {
        reset(ResetUser);
        onClose();
    };

    const validatedImage = (uri: string) =>  {
        if(!uri) return '/assets/images/notImage.png';

        return `${uriBase}/${uri}`;
    };

    useEffect(() => {
        if(id) {
            getById(id);
        }
    }, [id]);

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
                        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
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
                                Atualizar Foto
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
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-4">
                                <div className={`flex flex-col col-span-3 justify-center items-center`}>
                                    <img className="w-full h-full max-h-56 object-cover rounded-xl" src={validatedImage(uri)} alt="foto do usuário" />
                                </div>
                                
                                <div className={`flex flex-col col-span-3`}>
                                    <label className={`label slim-label-primary`}>Foto de Perfil</label>
                                    <input id="image" type="file" className={`input slim-input-primary`} placeholder="Digite"/>
                                </div>
                            </div>                        
                            
                            <div className="flex justify-end gap-2 w-12/12 mt-3">
                                <Button type="button" click={cancel} text="Fechar" theme="primary-light" styleClassBtn=""/>
                                <Button type="submit" text="Salvar" theme="primary" styleClassBtn=""/>
                            </div>
                        </form>
                        </div>

                    </DialogPanel>
                </div>
            </Dialog>
        </>    
    )
}