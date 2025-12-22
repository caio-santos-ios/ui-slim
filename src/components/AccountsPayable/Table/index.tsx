"use client";

import { ModalDelete } from "@/components/Global/ModalDelete";
import { TAccountsPayable } from "@/types/accountsPayable/accountsPayable.type";
import { convertNumberMoney } from "@/utils/convert.util";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { MdEdit, MdTaskAlt } from "react-icons/md";
import { ModalLowAccountsPayable } from "../ModalLow";
import { maskDate } from "@/utils/mask.util";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { IconEdit } from "@/components/Global/IconEdit";
import { IconDelete } from "@/components/Global/IconDelete";
import { IconLow } from "../IconLow";
import { ModalAccountsPayable } from "../Modal";

type TProp = {
    list: TAccountsPayable[],
    handleReturnModal: (isSuccess: boolean) => void;
}

export const TableAccountPayable = ({list, handleReturnModal}: TProp) => {
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

    const convertStatus = (lowValue: any, balance: any) => {
        if(parseFloat(balance) == 0) return "Pago";
        if(parseFloat(lowValue) > 0) return "Pago Parcial";
        return "Pendente";
    };

    return (
        <>
            {
                list.length > 0 &&
                <div className="slim-container-table w-full">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 slim-table-thead">
                            <tr>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tl-xl`}>Status</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Fornecedor</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Código</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Sub Total</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Multa</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Juros</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Total</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Pago</th>
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
                                            <td className="px-4 py-2">{x.supplierName}</td>
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

            <ModalAccountsPayable
                title='Editar Conta a Pagar' 
                isOpen={modal} setIsOpen={() => setModal(modal)} 
                onClose={onClose}
                handleReturnModal={handleReturn}
                body={currentBody}
                id={id}
            />     

            <ModalLowAccountsPayable
                title='Baixa Contas a Pagar'
                isOpen={modalLow} setIsOpen={() => setModalLow(!modalLow)} 
                onClose={() => setModal(false)}
                handleReturnModal={handleReturn}
                body={currentBody!}
            />  

            <ModalDelete
                title='Excluír Contas a Pagar'
                isOpen={modalDelete} setIsOpen={() => setModalDelete(!modalDelete)} 
                onClose={() => setModalDelete(false)}
                onSelectValue={destroy}
            />  
        </>
    )
}