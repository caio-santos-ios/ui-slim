"use client";

import { ModalDelete } from "@/components/Global/ModalDelete";
import { TAccountsReceivable } from "@/types/accountsReceivable/accountsReceivable.type";
import { convertNumberMoney } from "@/utils/convert.util";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { MdEdit, MdTaskAlt } from "react-icons/md";
import { ModalLowAccountsReceivable } from "../ModalLow";
import { maskDate } from "@/utils/mask.util";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { IconEdit } from "@/components/Global/IconEdit";
import { IconDelete } from "@/components/Global/IconDelete";
import { IconLow } from "../IconLow";

type TProp = {
    list: TAccountsReceivable[],
    onSelectValue: (isSuccess: boolean) => void;
}

export const TableAccountReceivable = ({list, onSelectValue}: TProp) => {
    const [modalDelete, setModalDelete] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [currentBody, setCurrentBody] = useState<TAccountsReceivable>();

    const getCurrentBody = (action: string, body: TAccountsReceivable, ) => {
        const currentContract = {...body}        
        setCurrentBody(currentContract);
        
        if(action == "low") {
            setModal(true)
        };
    };
    
    const getDestroy = (body: TAccountsReceivable) => {
        setCurrentBody(body);
        setModalDelete(true);
    };

    const destroy = async () => {
        try {
            const { status } = await api.delete(`/accounts-receivable/${currentBody!.id}`, configApi());
            resolveResponse({status, message: "Excluído com sucesso"});
            setModalDelete(false);
            onSelectValue(true);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const convertStatus = (lowValue: any, balance: any) => {
        if(parseFloat(balance) == 0) return "Pago";
        if(parseFloat(lowValue) > 0) return "Pago Parcial";
        return "Pendente";
    };

    return (
        <>
            {
                list.length > 0 &&
                <div className="w-full overflow-x-auto hidden lg:block">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tl-xl`}>Status</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Cliente</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>N° do Contrato</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>N° da Venda</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Sub Total</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Multa</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Juros</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Total</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Recebido</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Saldo</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Categoria</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Centro de Custo</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Vencimento</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tr-xl`}>Ações</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-100">
                            {
                                list.map((x: any) => {
                                    return (
                                        <tr key={x.id}>                                            
                                            <td className="px-4 py-2">{convertStatus(x.lowValue, x.balance)}</td>
                                            <td className="px-4 py-2">{x.customerName}</td>
                                            <td className="px-4 py-2">{x.contractCode}</td>
                                            <td className="px-4 py-2">{x.code}</td>
                                            <td className="px-4 py-2">{convertNumberMoney(x.value)}</td>
                                            <td className="px-4 py-2">{convertNumberMoney(x.fines)}</td>
                                            <td className="px-4 py-2">{convertNumberMoney(x.fees)}</td>
                                            <td className="px-4 py-2">{convertNumberMoney(x.total)}</td>
                                            <td className="px-4 py-2">{convertNumberMoney(x.lowValue)}</td>
                                            <td className="px-4 py-2">{convertNumberMoney(x.balance)}</td>
                                            <td className="px-4 py-2">{x.categoryDescription}</td>
                                            <td className="px-4 py-2">{x.costCenterDescription}</td>
                                            <td className="px-4 py-2">{maskDate(x.dueDate)}</td>
                                            <td className="p-2">
                                                <div className="flex justify-center gap-3">
                                                    {
                                                        convertStatus(x.lowValue, x.balance) != "Pago" &&
                                                        <IconLow action="low" obj={x} getObj={getCurrentBody}/>
                                                    }
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
                </div>
            }

            <ModalLowAccountsReceivable
                title='Baixa Contas a Receber'
                isOpen={modal} setIsOpen={() => setModalDelete(!modal)} 
                onClose={() => setModal(false)}
                onSelectValue={onSelectValue}
                body={currentBody!}
            />  

            <ModalDelete
                title='Excluír Contas a Receber'
                isOpen={modalDelete} setIsOpen={() => setModalDelete(!modalDelete)} 
                onClose={() => setModalDelete(false)}
                onSelectValue={destroy}
            />  
        </>
    )
}