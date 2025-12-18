"use client";

import { ModalDelete } from "@/components/Global/ModalDelete";
import { TAccountsReceivable } from "@/types/accountsReceivable/accountsReceivable.type";
import { convertNumberMoney } from "@/utils/convert.util";
import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { MdEdit, MdTaskAlt } from "react-icons/md";
import { ModalLowAccountsReceivable } from "../ModalLow";

type TProp = {
    list: TAccountsReceivable[]
}

export const TableAccountReceivable = ({list}: TProp) => {
    const [modalDelete, setModalDelete] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [currentBody, setCurrentBody] = useState<TAccountsReceivable>();

    const getCurrentBody = (body: TAccountsReceivable, action: string) => {
        const currentContract = {...body}        
        setCurrentBody(currentContract);
        
        if(action == "low") {
            setModal(true)
        };

        if(action == "edit") {

        };
    };
    
    const getDestroy = (body: TAccountsReceivable) => {
        setCurrentBody(body);
        setModalDelete(true);
    };

    const destroy = async () => {
        // try {
        //     const { status } = await api.delete(`/customer-contracts/${currentId}`, configApi());
        //     resolveResponse({status, message: "Excluído com sucesso"});
        //     setModalDelete(false);
        //     cancel();
        //     await getContract();
        // } catch (error) {
        //     resolveResponse(error);
        // }
    };

    const convertStatus = (value: any, lowValue: any) => {
        console.log(parseFloat(value))
        console.log(parseFloat(lowValue))
        if(parseFloat(lowValue) == 0) return "Pendente";
        if(parseFloat(lowValue) > 0) return "Pago Parcial";
        if(parseFloat(lowValue) == parseFloat(value)) return "Pago";
        return "";
    }

    useEffect(() => {
        if(list.length > 0) {
            console.log(list[0])
        }
    }, [list])
    
    return (
        <>
            {
                list.length > 0 &&
                <div className="w-full overflow-x-auto hidden lg:block">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tl-xl`}>Ações</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Status</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Cliente</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>N° do Contrato</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Valor</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Valor Recebido</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Categoria</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Centro de Custo</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tr-xl`}>Forma de Pagamento</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-100">
                            {
                                list.map((x: any) => {
                                    return (
                                        <tr key={x.id}>
                                            <td className="p-2">
                                                <div className="flex gap-3">
                                                    <div onClick={() => getCurrentBody(x, 'low')} className="cursor-pointer text-blue-400 hover:text-blue-500">
                                                        <MdTaskAlt />
                                                    </div>
                                                    <div onClick={() => getCurrentBody(x, 'edit')} className="cursor-pointer text-yellow-400 hover:text-yellow-500">
                                                        <MdEdit />
                                                    </div>
                                                    <div onClick={() => getDestroy(x)} className="cursor-pointer text-red-400 hover:text-red-500">
                                                        <FaTrash />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">{convertStatus(x.value, x.lowValue)}</td>
                                            <td className="px-4 py-2">{x.customerName}</td>
                                            <td className="px-4 py-2">{x.contractCode}</td>
                                            {/* <td className="px-4 py-2">{maskDate(x.saleDate)}</td>
                                            */}
                                            <td className="px-4 py-2">{convertNumberMoney(x.value)}</td>
                                            <td className="px-4 py-2">{convertNumberMoney(x.lowValeu)}</td>
                                            <td className="px-4 py-2">{x.categoryDescription}</td>
                                            <td className="px-4 py-2">{x.costCenterDescription}</td>
                                            <td className="px-4 py-2">{x.paymentMethodDescription}</td>
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
                onSelectValue={() => {}}
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