"use client";

import { ModalDelete } from "@/components/Global/ModalDelete";
import { TAccountsPayable } from "@/types/accountsPayable/accountsPayable.type";
import { useEffect, useState } from "react";
import { formattedMoney, maskDate } from "@/utils/mask.util";
import { api } from "@/service/api.service";
import { configApi, resolveParamsRequest, resolveResponse } from "@/service/config.service";
import { IconEdit } from "@/components/Global/IconEdit";
import { IconDelete } from "@/components/Global/IconDelete";
import { ModalInPerson } from "../Modal";
import { permissionDelete, permissionUpdate } from "@/utils/permission.util";
import { IconDownload } from "../IconDownload";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ProcedureSinglePDF } from "../PDF";
import { IconStatus } from "../IconStatus";
import { ModalInPersonStatus } from "../ModalStatus";
import { TRecipient } from "@/types/masterData/customers/customerRecipient.type";
import { TAccreditedNetwork } from "@/types/masterData/accreditedNetwork/accreditedNetwork.type";
import { TServiceModule } from "@/types/masterData/serviceModules/serviceModules.type";
import { TProcedure } from "@/types/masterData/procedure/procedure.type";
import { SubmitHandler, useForm } from "react-hook-form";
import { ResetInPerson, ResetInPersonSearch, TInPersonSearch } from "@/types/service/inPerson/inPerson.type";
import MultiSelect from "@/components/Global/MultiSelect";
import { Button } from "@/components/Global/Button";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";

type TProp = {
    list: TAccountsPayable[],
    handleReturnModal: () => void;
}

export const TableInPerson = ({list, handleReturnModal}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [modalDelete, setModalDelete] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [modalStatus, setModalStatus] = useState<boolean>(false);
    const [id, setId] = useState<string>("")
    const [currentBody, setCurrentBody] = useState<TAccountsPayable>();

    const [recipient, setRecipient] = useState<TRecipient[]>([]);
    const [accreditedNetworks, setAccreditedNetwork] = useState<TAccreditedNetwork[]>([]);
    const [serviceModules, setServiceModule] = useState<TServiceModule[]>([]);
    const [myProcedures, setMyProcedure] = useState<TProcedure[]>([]);
    const [currentAccreditedNetwork, setCurrentAccreditedNetwork] = useState<any[]>([]);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors }} = useForm<TInPersonSearch>({
        defaultValues: ResetInPersonSearch
    });

    const getCurrentBody = (action: string, body: TAccountsPayable, ) => {
        const currentContract = {...body}        
        setCurrentBody(currentContract);
        setId(body.id!)
        
        if(action == "edit") {
            setModal(true)
        };

        if(action == "alterStatus") {
            setModalStatus(true);
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

    const normalizeStatus = (status: string) => {
        switch(status) {
            case "Solicitada": return "bg-gray-300 text-gray-700";
            case "Agendada": return "bg-blue-300 text-blue-700";
            case "Em Andamento": return "bg-yellow-300 text-yellow-700";
            case "Realizada": return "bg-green-300 text-green-700";
            case "Cancelada - Cliente": return "bg-red-300 text-red-700";
            case "Cancelada - Pasbem": return "bg-red-300 text-red-700";
            case "Cancelada - Credenciada": return "bg-red-300 text-red-700";
        }
    };

    const onClose = () => {
        setId("");
        setModal(false);
        setModalDelete(false);
        setModalStatus(false);
        handleReturnModal();
    };

    const getSelectRecipient = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/customer-recipients/select?deleted=false&orderBy=createdAt&sort=desc`, configApi());
            const result = data.result;
            setRecipient(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const getSelectAccreditedNetwork = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/accredited-networks/select?deleted=false&orderBy=createdAt&sort=desc`, configApi());
            const result = data.result;
            setAccreditedNetwork(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const getSelectServiceModule = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/service-modules/select?deleted=false&orderBy=createdAt&sort=desc`, configApi());
            const result = data.result;
            setServiceModule(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };    
    
    const getByAccreditedNetworkId = async (accreditedNetworkId: string) => {
        try {
            setLoading(true);
            const {data} = await api.get(`/trading-tables/accredited-network/${accreditedNetworkId}`, configApi());
            const result = data.result;
            setCurrentAccreditedNetwork(result.data.items ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const selectModule = (module: TProcedure[]) => {
        setMyProcedure(module)

        return [];
    };

    const normalizeProcedures = (x: any): any[] => {
        const procedures: any[] = [];
        
        if(x["procedures"]) {            
            x.procedures.forEach((item: any) => {
                if(x["tradingTables"]) {
                    if(x.tradingTables != undefined) {
                        const procedure = x.tradingTables.find((t: any) => t.procedureId == item.id);
                        if(procedure) {
                            procedures.push({value: procedure.total, name: item.name})
                        };
                    };
                };
            });
        };

        return procedures; 
    };

    const normalizeTotal = (x: any): number => {
        if(x["tradingTables"]) {
            return x.tradingTables.reduce((value: number, t: any) => value + parseFloat(t.total), 0); 
        };

        return 0;
    };
    
    useEffect(() => {
        reset(ResetInPersonSearch);
        getSelectRecipient();
        getSelectAccreditedNetwork();
        getSelectServiceModule();
    }, []);

    const handleReturn = () => {        
        onClose();
    };

    return (
        <>
            {
                list.length > 0 &&
                <div className="slim-container-table h-[calc(100dvh-22rem)] w-full">                    
                    <table className="min-w-full divide-y">
                        <thead className="slim-table-thead">
                            <tr>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider rounded-tl-xl`}>Beneficiário</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider`}>Unidade</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider`}>Profissional</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider`}>Módulo</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider`}>Data</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider`}>Responsável p/ Pg.</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider`}>Status</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider`}>Valor</th>
                                <th scope="col" className={`px-4 py-3 text-center text-sm font-bold tracking-wider rounded-tr-xl`}>Ações</th>
                            </tr>
                        </thead>

                        <tbody className="slim-body-table divide-y">
                            {
                                list.map((x: any) => {
                                    return (
                                        <tr className="slim-tr" key={x.id}>                                            
                                            <td className="px-4 py-2">{x.recipientDescription}</td>
                                            <td className="px-4 py-2">{x.accreditedNetworkDescription}</td>
                                            <td className="px-4 py-2">{x.professionalName}</td>
                                            <td className="px-4 py-2">{x.serviceModuleDescription}</td>
                                            <td className="px-4 py-2">{maskDate(x.date)}</td>
                                            <td className="px-4 py-2">{x.responsiblePayment}</td>
                                            <td className="px-4 py-2">
                                                <span className={`${normalizeStatus(x.status)} py-1 px-2 rounded-lg font-bold`}>
                                                    {x.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">{formattedMoney(x.value)}</td>
                                            <td className="p-2">
                                                <div className="flex justify-center gap-3">              
                                                    {
                                                        permissionUpdate("2", "B22") &&
                                                        <PDFDownloadLink 
                                                        document={
                                                            <ProcedureSinglePDF 
                                                                recipient={x.recipientDescription} 
                                                                cpf={x.recipientCpf}
                                                                procedures={normalizeProcedures(x)}
                                                                total={normalizeTotal(x)}
                                                                time={x.hour}
                                                                date={maskDate(x.date)}
                                                                professional={x.professionalName}
                                                                responsiblePayment={x.responsiblePayment}
                                                                accreditedNetwork={x.accreditedNetworkDescription}/>
                                                        } 
                                                        fileName={`comprovante-${Date.now()}.pdf`}>
                                                            <IconDownload />
                                                        </PDFDownloadLink>
                                                    }                             
                                                    {
                                                        permissionUpdate("2", "B22") &&
                                                        <IconStatus action="alterStatus" obj={x} getObj={getCurrentBody}/>
                                                    }                             
                                                    {
                                                        permissionUpdate("2", "B22") &&
                                                        <IconEdit action="edit" obj={x} getObj={getCurrentBody}/>
                                                    }                             
                                                    {
                                                        permissionDelete("2", "B22") &&
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

                    <ModalInPerson
                        title='Editar Atendimento Presencial' 
                        isOpen={modal} setIsOpen={() => setModal(modal)} 
                        onClose={onClose}
                        handleReturnModal={handleReturn}
                        id={id}
                    />     
                    
                    <ModalInPersonStatus
                        title='Editar Status' 
                        isOpen={modalStatus} setIsOpen={() => setModalStatus(modalStatus)} 
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