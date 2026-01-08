"use client";

import "./style.css";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { Button } from "@/components/Global/Button";
import { maskDate } from "@/utils/mask.util";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
type TProp = {
    onClose: () => void;
    parentId: string;
}

export const ModalLog = ({parentId, onClose}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [logs, setLog] = useState<any[]>([]);
        
    const getLogs = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/logs?deleted=false&parentId=${parentId}&parent=accredited-network&orderBy=createdAt&sort=desc&pageSize=100&pageNumber=1`, configApi());
            const result = data.result.data;
            setLog(result ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const normalizeTab = (tab: string) => {
        switch(tab) {
            case "accredited-network": return "Rede Credenciada";
            case "contact": return "Contatos";
            case "attachment": return "Anexos";
        }
    };
    
    useEffect(() => {
        getLogs();
    }, []);

    return (
        <>
            <div className="grid grid-cols-1 gap-2 mb-2">
                <div className="w-full overflow-x-auto hidden lg:block">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tl-xl`}>Aba</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Ação</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Descrição</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Usuário Responsável</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tr-xl`}>Data da Criação</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-100">
                            {
                                logs.map((x: any) => {
                                    return (
                                        <tr key={x.id}>
                                           
                                            <td className="px-4 py-2">{normalizeTab(x.collection)}</td>
                                            <td className="px-4 py-2">{x.action}</td>
                                            <td className="px-4 py-2">{x.description}</td>                                      
                                            <td className="px-4 py-2">{x.userCreate}</td>                                      
                                            <td className="px-4 py-2">{maskDate(x.createdAt)}</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>
           
            <div className="flex justify-end gap-2 w-12/12 mt-3 mb-4">
                <Button type="button" click={onClose} text="Fechar" theme="primary-light" styleClassBtn=""/>
            </div>
        </>
    )
}