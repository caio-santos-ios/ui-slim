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
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { TForwarding } from "@/types/service/forwarding/forwarding.type";
import { TRecipient } from "@/types/masterData/customers/customerRecipient.type";
import Calendar from "react-calendar";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { Button } from "@/components/Global/Button";

type TProp = {
    list: TAccountsPayable[],
    handleReturnModal: () => void;
}

interface ISpecialtyAvailability {
    id: string;
    name: string;
    date: string;
    startTime: string;
    endTime: string;
}

export const TableAppointment = ({list, handleReturnModal}: TProp) => {
    const [modalCancel, setModalCancel] = useState<boolean>(false);
    const [currentBody, setCurrentBody] = useState<TAccountsPayable>();
    const [modal, setModal] = useState<boolean>(false);
    const [recipient, setRecipient] = useState<TRecipient[]>([]);
    const [specialties, setSpecialty] = useState<any[]>([]);
    const [specialtyAvailabilities, setSpecialtyAvailabilities] = useState<ISpecialtyAvailability[]>([]);
    const [date, setDate] = useState<Date | null>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const availableDates = new Set(specialtyAvailabilities.map(item => item.date));

    const { 
        register: registerForwarding, 
        handleSubmit, 
        setValue: setValueForwarding, 
        formState: { errors } 
    } = useForm<TForwarding>({});

    const onSubmit: SubmitHandler<TForwarding> = async (body: TForwarding) => {
        // try {
        //     setLoading(true);
        //     onClose();
        // } catch (error) {
        //     resolveResponse(error);
        // } finally {
        //     setLoading(false);
        // }
    };

    const getCancel = (body: TAccountsPayable) => {
        setCurrentBody(body);
        setModalCancel(true);
    };

    const cancel = async () => {
        try {
            const form: any = {...currentBody};
            form.time = `${form.startTime} até ${form.endTime}`;
            form.beneficiaryName = form.recipientDescription;
            form.specialtyName = form.specialty;

            const { status } = await api.put(`/forwardings/cancel`, form, configApi());
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

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const isTileDisabled = ({ date, view }: { date: Date; view: string }) => {
        if (view === "month") {
            return !availableDates.has(formatDate(date));
        }
        return false;
    };

    const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
        if (view === "month" && availableDates.has(formatDate(date))) {
            return "font-bold text-blue-600 bg-blue-50 rounded-lg";
        }
        return "";
    };

    return (
        <>
            {
                list.length > 0 &&
                <>
                    <div className="slim-container-table w-full max-h-[calc(100dvh-19rem)]">
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