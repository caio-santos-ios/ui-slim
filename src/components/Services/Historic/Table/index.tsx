"use client";

import { ModalDelete } from "@/components/Global/ModalDelete";
import { TAccountsPayable } from "@/types/accountsPayable/accountsPayable.type";
import { useState } from "react";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { permissionDelete } from "@/utils/permission.util";
import { IconCancel } from "@/components/Global/IconCancel";
import { maskDate } from "@/utils/mask.util";

type TProp = {
    list: TAccountsPayable[],
}

export const TableHistoric = ({list}: TProp) => {
    const [modalCancel, setModalCancel] = useState<boolean>(false);
    const [currentBody, setCurrentBody] = useState<TAccountsPayable>();
    
    const getCancel = (body: TAccountsPayable) => {
        setCurrentBody(body);
        setModalCancel(true);
    };

    const normalizeStatus = (status: string) => {
        switch(status) {
            case "SCHEDULED": return "bg-blue-300 text-blue-700";
            case "CANCELED": return "bg-red-300 text-red-700";
            default: return "";
        }
    };
   
    const normalizeNameCollection = (status: string) => {
        switch(status) {
            case "appointment": return "Agendamentos";
            case "forwarding": return "Encaminhamentos";
            default: return "";
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
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tl-xl`}>Tabela</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Ação</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tr-xl`}>Data de criação</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-100">
                            {
                                list.map((x: any) => {
                                    return (
                                        <tr key={x.id}>                                            
                                            <td className="px-4 py-2">{normalizeNameCollection(x.collection)}</td>
                                            <td className="px-4 py-2">{x.description}</td>
                                            <td className="px-4 py-2">{maskDate(x.createdAt, true)}</td>
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