"use client";

import { ModalDelete } from "@/components/Global/ModalDelete";
import { TAccountsPayable } from "@/types/accountsPayable/accountsPayable.type";
import { useState } from "react";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { permissionDelete, permissionUpdate } from "@/utils/permission.util";
import { IconCancel } from "@/components/Global/IconCancel";
import { IoIosVideocam } from "react-icons/io";
import { toast } from "react-toastify";

type TProp = {
    list: TAccountsPayable[],
    handleReturnModal: () => void;
}

export const TableAppointment = ({list, handleReturnModal}: TProp) => {
    const [modalCancel, setModalCancel] = useState<boolean>(false);
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

    const copyToClipboard = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copiado para a área de transferência!", {theme: 'colored'});
        } catch (err) {
            console.error("Erro ao copiar: ", err);
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
        setModalCancel(false);
        handleReturnModal();
    };

    return (
        <>
            {
                list.length > 0 &&
                <>
                    <div className="slim-container-table w-full">
                        <table className="min-w-full divide-y">
                            <thead className="slim-table-thead">
                                <tr>
                                    <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider rounded-tl-xl`}>Beneficiário</th>
                                    <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider`}>Data Atendimento</th>
                                    <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider`}>Horário Atendimento</th>
                                    <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider`}>Especialidade</th>
                                    <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider`}>Profissional</th>
                                    <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider`}>Status</th>
                                    <th scope="col" className={`px-4 py-3 text-center text-sm font-bold tracking-wider rounded-tr-xl`}>Ações</th>
                                </tr>
                            </thead>

                            <tbody className="slim-body-table divide-y">
                                {
                                    list.map((x: any) => {
                                        return (
                                            <tr className="slim-tr" key={x.id}>                                            
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
                                                            permissionDelete("2", "B24") && x.status == "SCHEDULED" &&
                                                            <IconCancel obj={x} getObj={getCancel}/>                                                   
                                                        }  
                                                        {
                                                            permissionUpdate("2", "B24") && x.status == "SCHEDULED" &&
                                                            <IoIosVideocam className="cursor-pointer text-blue-400 hover:text-blue-500" onClick={() => copyToClipboard(x.beneficiaryUrl)} />
                                                        }           
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                        
            
                        <ModalDelete
                            title='Cancelar Agendamento'
                            description="Deseja cancelar esse registro?"
                            isOpen={modalCancel} setIsOpen={() => setModalCancel(!modalCancel)} 
                            onClose={() => setModalCancel(false)}
                            onSelectValue={cancel}
                            />  
                    </div>
                    <div className="font-bold mt-2">Total de Agendamentos: <strong>{list.length}</strong></div>
                </>
            }
        </>
    )
}