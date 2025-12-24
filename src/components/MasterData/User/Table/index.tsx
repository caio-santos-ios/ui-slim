"use client";

import { ModalDelete } from "@/components/Global/ModalDelete";
import { useState } from "react";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { IconEdit } from "@/components/Global/IconEdit";
import { IconDelete } from "@/components/Global/IconDelete";
import { ModalUser } from "../Modal";
import { TUser } from "@/types/masterData/user/user.type";
import { permissionDelete, permissionUpdate } from "@/utils/permission.util";
import { IconEditPhoto } from "../IconEditPhoto";
import { ModalPhoto } from "../ModalPhoto";

type TProp = {
    list: TUser[],
    handleReturnModal: (isSuccess: boolean) => void;
}

export const TableUser = ({list, handleReturnModal}: TProp) => {
    const [modalDelete, setModalDelete] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [modalUpdatePhoto, setModalUpdatePhoto] = useState<boolean>(false);
    const [id, setId] = useState<string>("")

    const getCurrentBody = (action: string, body: TUser, ) => {
        setId(body.id!);

        if(action == "edit") {
            setModal(true)
        };

        if(action == "editPhoto") {
            setModalUpdatePhoto(true);
        };
    };
    
    const getDestroy = (body: TUser) => {
        setModalDelete(true);
    };

    const destroy = async () => {
        try {
            const { status } = await api.delete(`/accounts-payable/${id}`, configApi());
            resolveResponse({status, message: "Excluído com sucesso"});
            setModalDelete(false);
            handleReturnModal(true);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const onClose = () => {
        setId("");
        setModal(false);
        setModalUpdatePhoto(false);
        handleReturnModal(true);
    };

    const handleReturn = () => {
        onClose();
    };

    return (
        <>
            {
                list.length > 0 &&
                <div className="slim-container-table w-full bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 slim-table-thead">
                            <tr>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tl-xl`}>Nome</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tl-xl`}>E-mail</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tl-xl`}>Admin</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tl-xl`}>Bloqueado</th>
                                <th scope="col" className={`px-4 py-3 text-center text-sm font-bold text-gray-500 tracking-wider rounded-tr-xl`}>Ações</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-100">
                            {
                                list.map((x: any) => {
                                    return (
                                        <tr key={x.id}>                                            
                                            <td className="px-4 py-2">{x.name}</td>
                                            <td className="px-4 py-2">{x.email}</td>
                                            <td className="px-4 py-2">{x.admin ? "Sim" : "Não"}</td>
                                            <td className="px-4 py-2">{x.blocked ? "Sim" : "Não"}</td>
                                            <td className="p-2">
                                                <div className="flex justify-center gap-3">
                                                    {
                                                        permissionUpdate("1", "11") &&
                                                        <IconEdit action="edit" obj={x} getObj={getCurrentBody}/>
                                                    }                                                    
                                                    {
                                                        permissionUpdate("1", "11") &&
                                                        <IconEditPhoto action="editPhoto" obj={x} getObj={getCurrentBody}/>
                                                    }                                                    
                                                    {
                                                        permissionDelete("1", "11") &&
                                                        <IconDelete obj={x} getObj={getDestroy}/>                                                   
                                                    }
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
            }

            <ModalUser
                title='Editar Usuário' 
                isOpen={modal} setIsOpen={() => setModal(modal)} 
                onClose={onClose}
                handleReturnModal={handleReturn}
                id={id}
            />     
            
            <ModalPhoto
                isOpen={modalUpdatePhoto} setIsOpen={() => setModalUpdatePhoto(modalUpdatePhoto)} 
                onClose={onClose}
                handleReturnModal={handleReturn}
                id={id}
            />     

            <ModalDelete
                title='Excluír Usuário'
                isOpen={modalDelete} setIsOpen={() => setModalDelete(!modalDelete)} 
                onClose={() => setModalDelete(false)}
                onSelectValue={destroy}
            />  
        </>
    )
}