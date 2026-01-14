"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { Button } from "@/components/Global/Button";
import { TRecipient } from "@/types/masterData/customers/customerRecipient.type";
import { ResetAppointment, TAppointment } from "@/types/service/appointment/appointment.type";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { RiCalendarScheduleFill } from "react-icons/ri";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    handleReturnModal: () => void;
    id: string;
}

export const ModalAppointment = ({title, isOpen, setIsOpen, onClose, handleReturnModal}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [recipient, setRecipient] = useState<TRecipient[]>([]);
    const [specialties, setSpecialty] = useState<any[]>([]);
    const [specialtyAvailabilities, setSpecialtyAvailabilities] = useState<any[]>([]);
    const [date, setDate] = useState<Date | null>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const availableDates = new Set(specialtyAvailabilities.map(item => item.date));

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<TAppointment>({
        defaultValues: ResetAppointment
    });

    const onSubmit: SubmitHandler<TAppointment> = async (body: TAppointment) => {      
        if(!body.id) {
            await create(body);
        } else {
            await update(body);
        }
    };

    const create = async (body: TAppointment) => {
        try {
            const { status, data} = await api.post(`/appointments`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            handleReturnModal();
        } catch (error) {
            resolveResponse(error);
        }
    };
      
    const update = async (body: TAppointment) => {
        try {
            const { status, data} = await api.put(`/appointments`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            handleReturnModal();
        } catch (error) {
            resolveResponse(error);
        }
    };

    const cancel = () => {
        reset(ResetAppointment);
        onClose();
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
    
    const getSelectSpecialty = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/appointments/specialties`, configApi());
            const result = data.result;
            setSpecialty(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };
    
    const getSelectSpecialtyAvailability = async (specialtyUuid: string, beneficiaryUuid: string) => {
        try {
            setLoading(true);
            const {data} = await api.get(`/appointments/specialty-availability/${specialtyUuid}/${beneficiaryUuid}`, configApi());
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

    useEffect(() => {
        if(watch("beneficiaryUuid") && watch("specialtyUuid")) {
            getSelectSpecialtyAvailability(watch("specialtyUuid"), watch("beneficiaryUuid"))
        };
    }, [watch("beneficiaryUuid"), watch("specialtyUuid")]);

    useEffect(() => {
        reset(ResetAppointment);
        getSelectRecipient();
        getSelectSpecialty();
    }, []);

    return (
        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto container-modal">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className="w-full max-w-4xl rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="bg-red mb-4 border-b-3 header-modal">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">{title}</DialogTitle>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
                                <div className={`flex flex-col col-span-2 lg:col-span-1 mb-2`}>
                                    <label className={`label slim-label-primary`}>Beneficiário</label>
                                    <select className="select slim-select-primary" {...register("beneficiaryUuid")}>
                                        <option value="">Selecione</option>
                                        {
                                            recipient.map((x: any) => {
                                                return <option key={x.id} value={x.rapidocId}>{x.name}</option>
                                            })
                                        }
                                    </select>
                                </div>                                
                                <div className={`flex flex-col col-span-2 lg:col-span-1 mb-2`}>
                                    <label className={`label slim-label-primary`}>Especialidade</label>
                                    <select className="select slim-select-primary" {...register("specialtyUuid")}>
                                        <option value="">Selecione</option>
                                        {
                                            specialties.map((x: any) => {
                                                return <option key={x.id} value={x.id}>{x.name}</option>
                                            })
                                        }
                                    </select>
                                </div>          
                                <div className="flex flex-col">
                                    <label className={`label slim-label-primary`}>Escolha uma Data</label>
                                    <div className="rounded-xl p-2 bg-gray-50 flex justify-center shadow-inner">
                                        <Calendar
                                            onChange={(val) => { setDate(val as Date); setSelectedTime(null); setValue("availabilityUuid", ""); }}
                                            value={date}
                                            tileDisabled={isTileDisabled}
                                            tileClassName={getTileClassName}
                                            minDate={new Date()}
                                            locale="pt-BR"
                                        />
                                    </div>
                                </div>                      
                                <div className="flex flex-col">
                                    <label className="text-sm font-semibold text-gray-600 mb-2">Horários Disponíveis</label>
                                    <div className="grid grid-cols-2 gap-3 max-h-[265px] overflow-y-auto pr-2 custom-scrollbar">
                                        {date && specialtyAvailabilities
                                            .filter((h) => h.date === formatDate(date))
                                            .map((slot) => (
                                                <button
                                                    key={slot.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedTime(slot.id);
                                                        setValue("availabilityUuid", slot.id, { shouldValidate: true });
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
                                    <input type="hidden" {...register("availabilityUuid", { required: "Selecione um horário" })} />
                                    {errors.availabilityUuid && <span className="text-red-500 text-xs mt-2 font-medium">{errors.availabilityUuid.message}</span>}
                                </div>
                            </div>                          
                            <div className="flex justify-end gap-2 w-12/12 mt-3">
                                <Button type="button" click={cancel} text="Fechar" theme="primary-light" styleClassBtn=""/>
                                <Button type="submit" text="Salvar" theme="primary" styleClassBtn=""/>
                            </div>  
                        </form>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>    
    )
}