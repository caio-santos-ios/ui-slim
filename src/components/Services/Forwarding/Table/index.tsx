"use client";

import { ModalDelete } from "@/components/Global/ModalDelete";
import { TAccountsPayable } from "@/types/accountsPayable/accountsPayable.type";
import { useState } from "react";
import { maskDate } from "@/utils/mask.util";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { IconEdit } from "@/components/Global/IconEdit";
import { IconDelete } from "@/components/Global/IconDelete";
import { permissionDelete, permissionUpdate } from "@/utils/permission.util";
import { ModalForwarding } from "../Modal";
import { IconCancel } from "@/components/Global/IconCancel";

type TProp = {
    list: TAccountsPayable[],
    handleReturnModal: () => void;
}

export const TableForwarding = ({list, handleReturnModal}: TProp) => {
    const [modalCancel, setModalCancel] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [id, setId] = useState<string>("")
    const [currentBody, setCurrentBody] = useState<TAccountsPayable>();
    
    const getCancel = (body: TAccountsPayable) => {
        setCurrentBody(body);
        setModalCancel(true);
    };

    const cancel = async () => {
        try {
            const { status } = await api.delete(`/forwardings/cancel/${currentBody!.id}`, configApi());
            resolveResponse({status, message: "Cancelado com sucesso"});
            onClose();
        } catch (error) {
            resolveResponse(error);
        }
    };

    const normalizeStatus = (status: string) => {
        switch(status) {
            case "SCHEDULED": return "bg-blue-300 text-blue-700";
            case "CANCELED": return "bg-red-300 text-red-700";
            default: return "";
        }
    };
   
    const normalizeNameStatus = (status: string) => {
        switch(status) {
            case "SCHEDULED": return "Agendada";
            case "CANCELED": return "Cancelada";
            default: return "";
        }
    };

    const onClose = () => {
        setId("");
        setModal(false);
        setModalCancel(false);
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
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Data Atendimento</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Horário Atendimento</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Especialidade</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Profissional</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Status</th>
                                <th scope="col" className={`px-4 py-3 text-center text-sm font-bold text-gray-500 tracking-wider rounded-tr-xl`}>Ações</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-100">
                            {
                                list.map((x: any) => {
                                    return (
                                        <tr key={x.id}>                                            
                                            <td className="px-4 py-2">{x.recipientDescription}</td>
                                            <td className="px-4 py-2">{x.date}</td>
                                            <td className="px-4 py-2">{x.startTime} até {x.endTime}</td>
                                            <td className="px-4 py-2">{x.specialty}</td>
                                            <td className="px-4 py-2">{x.professional}</td>
                                            <td className="px-4 py-2">
                                                <span className={`${normalizeStatus(x.status)} py-1 px-2 rounded-lg font-bold`}>
                                                    {normalizeNameStatus(x.status)}
                                                </span>
                                            </td>
                                            <td className="p-2">
                                                <div className="flex justify-center gap-3">                                      
                                                    {
                                                        permissionDelete("2", "B25") &&
                                                        <IconCancel obj={x} getObj={getCancel}/>                                                   
                                                    }         
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                    
                    <div className="font-bold mt-2">Total de Encaminhamentos: <strong>{list.length}</strong></div>

                    <ModalForwarding
                        title='Editar Encaminhamento' 
                        isOpen={modal} setIsOpen={() => setModal(modal)} 
                        onClose={onClose}
                        handleReturnModal={handleReturn}
                        id={id}
                    />     
        
                    <ModalDelete
                        title='Cancelar Encaminhamento'
                        description="Deseja cancelar esse registro?"
                        isOpen={modalCancel} setIsOpen={() => setModalCancel(!modalCancel)} 
                        onClose={() => setModalCancel(false)}
                        onSelectValue={cancel}
                    />  
                </div>
            }
        </>
    )
}