"use client";

import { TAccountsPayable } from "@/types/accountsPayable/accountsPayable.type";
import { useState } from "react";
import { permissionDelete, permissionUpdate } from "@/utils/permission.util";
import { FaDownload } from "react-icons/fa6";
import { IoIosVideocam } from "react-icons/io";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { formattedCPF } from "@/utils/mask.util";
import { TForwarding } from "@/types/service/forwarding/forwarding.type";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/components/Global/Button";
import { TRecipient } from "@/types/masterData/customers/customerRecipient.type";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./style.css"

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

export const TableForwarding = ({ list, handleReturnModal }: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [modalCancel, setModalCancel] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);

    const [recipient, setRecipient] = useState<TRecipient[]>([]);
    const [specialties, setSpecialty] = useState<any[]>([]);
    const [specialtyAvailabilities, setSpecialtyAvailabilities] = useState<ISpecialtyAvailability[]>([]);

    const [date, setDate] = useState<Date | null>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const { 
        register: registerForwarding, 
        handleSubmit, 
        setValue: setValueForwarding, 
        formState: { errors } 
    } = useForm<TForwarding>({});

    const availableDates = new Set(specialtyAvailabilities.map(item => item.date));

    const getModal = async (body: any) => {
        console.log(body)
        await getSelectRecipient(body.cpf);
        // await getSelectSpecialty(body.specialtyId);
        // await getSelectSpecialtyAvailability(body.specialtyId, body.recipienId);
        // setModal(true);
    };

    const onSubmit: SubmitHandler<TForwarding> = async (body: TForwarding) => {
        try {
            setLoading(true);
            onClose();
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const onClose = () => {
        setModal(false);
        setModalCancel(false);
        setSelectedTime(null);
        setDate(new Date());
        handleReturnModal();
    };

    const getSelectRecipient = async (cpf: string) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/customer-recipients/cpf/${formattedCPF(cpf)}`, configApi());
            const result = data.result;
            setValueForwarding("beneficiaryUuid", result.rapidocId);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const getSelectSpecialty = async (specialtyId: string) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/forwardings/specialties`, configApi());
            const result = data.result;
            setSpecialty(result.data ?? []);
            setValueForwarding("specialtyUuid", specialtyId);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const getSelectSpecialtyAvailability = async (specialtyUuid: string, beneficiaryUuid: string) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/forwardings/specialty-availability/${specialtyUuid}/${beneficiaryUuid}`, configApi());
            const result = data.result;
            setSpecialtyAvailabilities(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
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

    const normalizeStatus = (status: string) => {
        switch (status) {
            case "FINISHED": return "bg-green-300 text-green-700";
            case "SCHEDULED": return "bg-blue-300 text-blue-700";
            case "CANCELED": 
            case "UNFINISHED": return "bg-red-300 text-red-700";
            case "NON_SCHEDULABLE": return "bg-orange-300 text-orange-700";
            case "PENDING": return "bg-yellow-300 text-yellow-700";
            default: return "";
        }
    };

    const normalizeNameStatus = (status: string) => {
        switch (status) {
            case "FINISHED": return "Finalizado";
            case "SCHEDULED": return "Agendado";
            case "CANCELED": return "Cancelado";
            case "PENDING": return "Pendente";
            case "NON_SCHEDULABLE": return "Não Programado";
            case "UNFINISHED": return "Inacabado";
            default: return status;
        }
    };

    const normalizeUrl = (x: any): boolean => {
        if(x["urlPath"]) {
            return !x.urlPath;
        };

        return false;
    }

    return (
        <>
            {list.length > 0 && (
                <>
                    <div className="slim-container-table max-h-[calc(100dvh-19rem)] w-full">
                        <table className="min-w-full divide-y">
                            <thead className="slim-table-thead">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-bold tracking-wider rounded-tl-xl">Beneficiário</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold tracking-wider">CPF</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold tracking-wider rounded-tr-xl">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y slim-body-table">
                                {list.map((x: any) => (
                                    <tr className="slim-tr" key={x.id}>
                                        <td className="px-4 py-2">{x.recipientDescription}</td>
                                        <td className="px-4 py-2">{formattedCPF(x.cpf)}</td>
                                        <td className="px-4 py-2">
                                            <span className={`${normalizeStatus(x.status)} py-1 px-2 rounded-lg font-bold text-xs`}>
                                                {normalizeNameStatus(x.status)}
                                            </span>
                                        </td>
                                        <td className="p-2">
                                            <div className="flex gap-3">
                                                {permissionDelete("2", "B25") && x.status === "SCHEDULED" && (
                                                    <a className="text-blue-400 hover:text-blue-500" target="_blank" href={x.urlPath}><IoIosVideocam /></a>
                                                )}
                                                {permissionUpdate("2", "B25") && normalizeUrl(x) && (
                                                    <a className="text-green-400 hover:text-green-500" target="_blank" href={x.urlPath}><FaDownload /></a>
                                                )}
                                                {permissionUpdate("2", "B25") && x.status === "PENDING" && (
                                                    <div className="text-stone-400 hover:text-stone-500">
                                                        <RiCalendarScheduleFill onClick={() => getModal(x)} className="cursor-pointer text-lg" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Dialog open={modal} as="div" className="relative z-50" onClose={onClose}>
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
                        <div className="fixed inset-0 flex items-center justify-center p-4">
                            <DialogPanel className="slim-modal w-full max-w-4xl rounded-xl p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                                <div className="slim-modal-title mb-4 border-b-3">
                                    <DialogTitle as="h1" className="text-xl font-bold primary-color">Fazer Encaminhamento</DialogTitle>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        
                                        <div className="space-y-4">
                                            <div className="flex flex-col">
                                                <label className={`label slim-label-primary`}>Especialidade</label>
                                                <select disabled className="select slim-select-primary" {...registerForwarding("specialtyUuid")}>
                                                    {specialties.map((x: any) => <option key={x.id} value={x.id}>{x.name}</option>)}
                                                </select>
                                            </div>

                                            <div className="flex flex-col">
                                                <label className={`label slim-label-primary`}>Escolha uma Data</label>
                                                <div className="calendar rounded-xl p-2 flex justify-center">
                                                    <Calendar
                                                        onChange={(val) => { setDate(val as Date); setSelectedTime(null); setValueForwarding("availabilityUuid", ""); }}
                                                        value={date}
                                                        tileDisabled={isTileDisabled}
                                                        tileClassName={getTileClassName}
                                                        minDate={new Date()}
                                                        locale="pt-BR"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col">
                                            <label className={`label slim-label-primary`}>Horários Disponíveis</label>
                                            <div className="grid grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                                                {date && specialtyAvailabilities
                                                    .filter((h) => h.date === formatDate(date))
                                                    .map((slot) => (
                                                        <button
                                                            key={slot.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedTime(slot.id);
                                                                setValueForwarding("availabilityUuid", slot.id, { shouldValidate: true });
                                                            }}
                                                            className={`py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
                                                                selectedTime === slot.id
                                                                    ? "bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]"
                                                                    : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                                            }`}
                                                        >
                                                            {slot.startTime} - {slot.endTime}
                                                        </button>
                                                    ))}
                                                
                                                {date && specialtyAvailabilities.filter((h) => h.date === formatDate(date)).length === 0 && (
                                                    <div className="col-span-2 flex flex-col items-center justify-center py-20 text-gray-400">
                                                        <RiCalendarScheduleFill className="text-4xl mb-2 opacity-20" />
                                                        <p className="italic text-sm">Nenhum horário disponível para esta data.</p>
                                                    </div>
                                                )}
                                            </div>
                                            <input type="hidden" {...registerForwarding("availabilityUuid", { required: "Selecione um horário" })} />
                                            {errors.availabilityUuid && <span className="text-red-500 text-xs mt-2 font-medium">{errors.availabilityUuid.message}</span>}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-8 pt-6">
                                        <Button type="button" click={onClose} text="Cancelar" theme="primary-light" />
                                        <Button type="submit" text="Confirmar" theme="primary" />
                                    </div>
                                </form>
                            </DialogPanel>
                        </div>
                    </Dialog>
                </>
            )}
        </>
    );
};