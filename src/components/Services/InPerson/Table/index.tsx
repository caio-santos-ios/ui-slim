"use client";

import { ModalDelete } from "@/components/Global/ModalDelete";
import { TAccountsPayable } from "@/types/accountsPayable/accountsPayable.type";
import { useState } from "react";
import { maskDate } from "@/utils/mask.util";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { IconEdit } from "@/components/Global/IconEdit";
import { IconDelete } from "@/components/Global/IconDelete";
import { ModalInPerson } from "../Modal";

type TProp = {
    list: TAccountsPayable[],
    handleReturnModal: () => void;
}

export const TableInPerson = ({list, handleReturnModal}: TProp) => {
    const [modalDelete, setModalDelete] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [id, setId] = useState<string>("")
    const [currentBody, setCurrentBody] = useState<TAccountsPayable>();

    const getCurrentBody = (action: string, body: TAccountsPayable, ) => {
        const currentContract = {...body}        
        setCurrentBody(currentContract);
        if(action == "edit") {
            setId(body.id!)
            setModal(true)
        };
    };
    
    const getDestroy = (body: TAccountsPayable) => {
        setCurrentBody(body);
        setModalDelete(true);
    };

    const destroy = async () => {
        try {
            const { status } = await api.delete(`/in-persons/${currentBody!.id}`, configApi());
            resolveResponse({status, message: "Excluído com sucesso"});
            onClose();
        } catch (error) {
            resolveResponse(error);
        }
    };
    
    const onClose = () => {
        setId("");
        setModal(false);
        setModalDelete(false);
        handleReturnModal();
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
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tl-xl`}>Beneficiário</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Unidade Credenciada</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Módulo de Serviço</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Procedimento</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Data</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Responsável pelo Pagamento</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tr-xl`}>Ações</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-100">
                            {
                                list.map((x: any) => {
                                    return (
                                        <tr key={x.id}>                                            
                                            <td className="px-4 py-2">{x.recipientDescription}</td>
                                            <td className="px-4 py-2">{x.accreditedNetworkDescription}</td>
                                            <td className="px-4 py-2">{x.serviceModuleDescription}</td>
                                            <td className="px-4 py-2">{x.procedureDescription}</td>
                                            <td className="px-4 py-2">{maskDate(x.date)}</td>
                                            <td className="px-4 py-2">{x.responsiblePayment}</td>
                                            <td className="p-2">
                                                <div className="flex justify-center gap-3">                                                    
                                                    <IconEdit action="edit" obj={x} getObj={getCurrentBody}/>
                                                    <IconDelete obj={x} getObj={getDestroy}/>                                                   
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>

                    <ModalInPerson
                        title='Editar Atendimento Presencial' 
                        isOpen={modal} setIsOpen={() => setModal(modal)} 
                        onClose={onClose}
                        handleReturnModal={handleReturn}
                        id={id}
                    />     
        
                    <ModalDelete
                        title='Excluír Atendimento Presencial'
                        isOpen={modalDelete} setIsOpen={() => setModalDelete(!modalDelete)} 
                        onClose={() => setModalDelete(false)}
                        onSelectValue={destroy}
                    />  
                </div>
            }
        </>
    )
}