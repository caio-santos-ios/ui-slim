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
        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto container-modal">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className="w-full max-w-lg rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="bg-red mb-4 border-b-3 header-modal">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">Atualizar Foto</DialogTitle>
                        </div>

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
                    </DialogPanel>
                </div>
            </div>
        </Dialog>    
    )
}