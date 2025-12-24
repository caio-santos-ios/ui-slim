"use client";

import { TAccountsPayable } from "@/types/accountsPayable/accountsPayable.type";
import { useState } from "react";
import { formattedCPF } from "@/utils/mask.util";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { permissionUpdate } from "@/utils/permission.util";

type TProp = {
    list: TAccountsPayable[],
}

export const TableTelemedicine = ({list}: TProp) => {
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
        } catch (error) {
            resolveResponse(error);
        }
    };

    const onClose = () => {
        setId("");
        setModal(false);
        setModalLow(false);
    };

    const handleReturn = () => {
        onClose();
    };

    const updateInactive = async (id: string) => {
        try {
            console.log(id)
            const { status } = await api.put(`/telemedicine`, {id}, configApi());
            resolveResponse({status, message: "Atualizado com sucesso"});
        } catch (error) {
            resolveResponse(error);
        }
    };

    return (
        <>
            {
                list.length > 0 &&
                <div className="slim-container-table w-full">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 slim-table-thead">
                            <tr>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tl-xl`}>Data de Nascimento</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>CPF</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Nome</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tr-xl`}>Status</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-100">
                            {
                                list.map((x: any) => {
                                    return (
                                        <tr key={x.id}>                                            
                                            <td className="px-4 py-2">{x.dateOfBirth}</td>
                                            <td className="px-4 py-2">{formattedCPF(x.cpf)}</td>
                                            <td className="px-4 py-2">{x.name}</td>
                                            <td className="px-4 py-2">
                                                {
                                                    permissionUpdate("2", "B23") &&
                                                    <label className="slim-switch">
                                                        <input checked={x.status} onChange={() => updateInactive(x.id)} type="checkbox"/>
                                                        <span className="slider"></span>
                                                    </label>
                                                }
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
            }
        </>
    )
}