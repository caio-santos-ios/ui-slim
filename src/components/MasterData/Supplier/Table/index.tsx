"use client";

import { ModalDelete } from "@/components/Global/ModalDelete";
import { TAccountsPayable } from "@/types/accountsPayable/accountsPayable.type";
import { useState } from "react";
import { maskDate } from "@/utils/mask.util";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { IconEdit } from "@/components/Global/IconEdit";
import { IconDelete } from "@/components/Global/IconDelete";
import { ModalSupplier } from "../Modal";
import { permissionDelete, permissionUpdate } from "@/utils/permission.util";

type TProp = {
    list: TAccountsPayable[],
    handleReturnModal: (isSuccess: boolean) => void;
}

export const TableSupplier = ({list, handleReturnModal}: TProp) => {
    const [modalDelete, setModalDelete] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [modalLow, setModalLow] = useState<boolean>(false);
    const [id, setId] = useState<string>("")
    const [currentBody, setCurrentBody] = useState<TAccountsPayable>();

    const getCurrentBody = (action: string, body: TAccountsPayable, ) => {
        const currentContract = {...body}        
        setCurrentBody(currentContract);
        if(action == "edit") {
            setId(body.id!)
            setModal(true)
        };
        
        if(action == "low") {
            setModalLow(true)
        };
    };
    
    const getDestroy = (body: TAccountsPayable) => {
        setCurrentBody(body);
        setModalDelete(true);
    };

    const destroy = async () => {
        try {
            const { status } = await api.delete(`/accounts-payable/${currentBody!.id}`, configApi());
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
        setModalLow(false);
        handleReturnModal(true);
    };

    const handleReturn = () => {
        onClose();
    };

    return (
        <>
            {
                list.length > 0 &&
                <div className="slim-container-table w-full">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 slim-table-thead">
                            <tr>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tl-xl`}>Tipo</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Nome</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Data da Vigência</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Data de Criação</th>
                                <th scope="col" className={`px-4 py-3 text-center text-sm font-bold text-gray-500 tracking-wider rounded-tr-xl`}>Ações</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-100">
                            {
                                list.map((x: any) => {
                                    return (
                                        <tr key={x.id}>                                            
                                            <td className="px-4 py-2">{x.type == "F" ? "Pessoa Fisica" : "Pessoa Juridica"}</td>
                                            <td className="px-4 py-2">{x.corporateName}</td>
                                            <td className="px-4 py-2">{maskDate(x.effectiveDate)}</td>
                                            <td className="px-4 py-2">{maskDate(x.createdAt)}</td>
                                            <td className="p-2">
                                                <div className="flex justify-center gap-3">       
                                                    {
                                                        permissionUpdate("1", "A24") &&
                                                        <IconEdit action="edit" obj={x} getObj={getCurrentBody}/>
                                                    }   
                                                    {
                                                        permissionDelete("1", "A24") &&
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

            <ModalSupplier
                title='Editar Fornecedor' 
                isOpen={modal} setIsOpen={() => setModal(modal)} 
                onClose={onClose}
                handleReturnModal={handleReturn}
                id={id}
            />     

            <ModalDelete
                title='Excluír Fornecedor'
                isOpen={modalDelete} setIsOpen={() => setModalDelete(!modalDelete)} 
                onClose={() => setModalDelete(false)}
                onSelectValue={destroy}
            />  
        </>
    )
}