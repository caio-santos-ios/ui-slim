"use client";

import "./style.css";
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api, uriBase } from "@/service/api.service";
import { useEffect, useState } from "react";
import { Button } from "@/components/Global/Button";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { ModalDelete } from "@/components/Global/ModalDelete";
import { ResetAttachment, TAttachment } from "@/types/masterData/attachment/attachment.type";
import { toast } from "react-toastify";

type TProp = {
    parentId: string;
}

export const ModalAttachment = ({parentId}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [modalDelete, setModalDelete] = useState<boolean>(false);
    const [attachments, setAttachment] = useState<TAttachment[]>([]);
    const [currentAttachment, setCurrentAttachment] = useState<TAttachment>(ResetAttachment);
    
    const { register, handleSubmit, reset, watch } = useForm<TAttachment>();

    const onSubmit: SubmitHandler<TAttachment> = async (body: TAttachment) => {
        if(!parentId) return toast.warn("Contratante é obrigatório", { theme: 'colored'});

        const formBody = new FormData();
        formBody.append("type", body.type);
        formBody.append("parent", "customer");
        formBody.append("parentId", parentId);
        formBody.append("description", body.description);
        formBody.append("uri", body.uri);
        
        const attachment: any = document.querySelector('#attachment');
        if (attachment.files[0]) formBody.append('file', attachment.files[0]);
        
        if(!body.id) {
            await create(formBody);
        } else {
            formBody.append("id", body.id);
            await update(formBody);
        };
        await getAll();
    };

    const create = async (form: FormData) => {
        try {
            const { status, data} = await api.post('/attachments', form, configApi(false));
            cancel();          
            resolveResponse({status, ...data});
        } catch (error) {
            resolveResponse(error);
        }
    };
    
    const update = async (form: FormData) => {
        try {
            const { status, data} = await api.put(`/attachments`, form, configApi(false));
            cancel();
            resolveResponse({status, ...data});
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getAll = async () => {
        try {
            const {data} = await api.get(`/attachments?deleted=false&pageSize=100&pageNumber=1&sort=createdAt&orderBy=createdAt&parentId=${parentId}&parent=customer`, configApi());
            const result = data.result;
            setAttachment(result.data);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const cancel = () => {
        reset(ResetAttachment);
    };

    const getAttachment = async (attachment: TAttachment) => {
        reset({...attachment});
    };
    
    const openModalDelete = (attachment: TAttachment) => {
        setCurrentAttachment({...attachment});
        setModalDelete(true);
    };

    const destroyAttachment = async () => {
        try {
            const { status } = await api.delete(`/attachments/${currentAttachment?.id}`, configApi(true));
            resolveResponse({status, message: "Excluído com sucesso"});
            setModalDelete(false);
            await getAll();
        } catch (error) {
            resolveResponse(error);
        }
    };

    useEffect(() => {
        getAll();
    }, []);

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 mb-2">
                    <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Aba</label>
                        <select className="select slim-select-primary" {...register("type")}>
                            <option value="">Selecione</option>
                            <option value="Dados Gerais">Dados Gerais</option>
                            <option value="Dados do Responsável">Dados do Responsável</option>
                            <option value="Contatos">Contatos</option>
                        </select>
                    </div>
                    <div className={`flex flex-col col-span-2 mb-2`}>
                        <label className={`label slim-label-primary`}>Arquivo</label>
                        <input id="attachment" {...register("file")} type="file" className={`input slim-input-primary`} placeholder="Digite"/>
                    </div>
                    <div className={`flex flex-col col-span-4 mb-2`}>
                        <label className={`label slim-label-primary`}>Descrição</label>
                        <input {...register("description")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                    </div>
                    <div className={`flex gap-2 justify-end col-span-7 mb-2`}>
                        <Button type="button" click={cancel} text="Cancelar" theme="primary-light" styleClassBtn="h-20"/>
                        <Button type="submit" text={watch("id") ? 'Salvar' : 'Adicionar'} theme="primary" styleClassBtn=""/>
                    </div>
                    <div className={`flex flex-col col-span-7 mb-2 mt-4`}>
                        <ul className="grid grid-cols-1 lg:grid-cols-6 lg:gap-10 list-attachment">
                            {
                                attachments.map((x: TAttachment) => {
                                    return (
                                        <div className="bg-gray-400 shadow-lg shadow-gray-500/50 text-white col-span-3 rounded-4xl p-5 text-lg" key={x.id}>
                                            <div className="flex justify-between">
                                                <p><strong>Aba:</strong> {x.type}</p>

                                                <div className="flex gap-2">
                                                    <div onClick={() => getAttachment(x)} className="cursor-pointer text-yellow-400 hover:text-yellow-500">
                                                        <MdEdit />
                                                    </div>
                                                    <div onClick={() => openModalDelete(x)} className="cursor-pointer text-red-400 hover:text-red-500">
                                                        <FaTrash />
                                                    </div>
                                                </div>
                                            </div>
                                            <p><strong>Desc:</strong> {x.description}</p>
                                            <strong>
                                                <a target="_blank" className="text-blue-600" href={`${uriBase}/${x.uri}`}>Visualizar Anexo</a>
                                            </strong>
                                        </div>
                                    )
                                })
                            }
                        </ul>
                    </div>                   
                </div>
            </form>
        
                        
            <ModalDelete
                title='Excluír Anexo'
                isOpen={modalDelete} setIsOpen={() => setModalDelete(modalDelete)}
                onClose={() => setModalDelete(false)}
                onSelectValue={destroyAttachment}
            />
        </>
    )
}