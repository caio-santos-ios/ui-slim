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
import { IoClose } from "react-icons/io5";

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
    const [ beneficiaryUUid, setBeneficiaryUUid] = useState<string>("");
    const availableDates = new Set(specialtyAvailabilities.map(item => item.date));

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<TAppointment>({
        defaultValues: ResetAppointment
    });

    const onSubmit: SubmitHandler<TAppointment> = async (body: TAppointment) => {      
        body.beneficiaryUuid = beneficiaryUUid;
        if(!body.id) {
            await create(body);
        } else {
            await update(body);
        }
    };

    const create = async (body: TAppointment) => {
        try {
            const form: any = {...body};

            const specialist = specialties.find(s => s.id == form.specialtyUuid);
            if(specialist) {
                form.specialtyName = specialist.name;
            };

            const recipientObj = recipient.find((r: any) => r.rapidocId == body.beneficiaryUuid);
            if(recipientObj) {
                form.beneficiaryName = recipientObj.name;
            };

            const dateItem = specialtyAvailabilities.find(s => s.id == selectedTime);
            if(dateItem) {
                form.date = dateItem.date;
                form.time = `${dateItem.startTime} até ${dateItem.endTime}`;
            };


            const { status, data} = await api.post(`/appointments`, form, configApi());

            const result = data.result;
            resolveResponse({status, ...result});
            cancel();
            handleReturnModal();
            setSpecialtyAvailabilities([]);
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
            const {data} = await api.get(`/customer-recipients/select?deleted=false&active=true&orderBy=createdAt&sort=desc`, configApi());
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
        const req = async () => {
            const beneficiaryId = watch("beneficiaryUuid").split("ESPACO");

            if(beneficiaryId.length > 1) {
                setLoading(true);
                if(!beneficiaryId[0]) {
                    const { data } = await api.get(`/customer-recipients/cpf/${beneficiaryId[1]}`, configApi());
                    const result = data.result;
                    if(watch("specialtyUuid")) {
                        setBeneficiaryUUid(result.data.rapidocId);
                        await getSelectSpecialtyAvailability(watch("specialtyUuid"), result.data.rapidocId)
                    };
                } else {
                    if(watch("specialtyUuid")) {
                        setBeneficiaryUUid(beneficiaryId[0]);
                        await getSelectSpecialtyAvailability(watch("specialtyUuid"), beneficiaryId[0])
                    }
                }
                setLoading(false);
            };
        };

        req();
    }, [watch("beneficiaryUuid"), watch("specialtyUuid")]);

    useEffect(() => {
        reset(ResetAppointment);
        setBeneficiaryUUid("");
        getSelectRecipient();
        getSelectSpecialty();
    }, []);

    return (
        <>
            <Dialog
                open={isOpen}
                as="div"
                className="relative z-[999] focus:outline-none"
                onClose={cancel}
            >
                {/* Backdrop */}
                <div
                    className="fixed inset-0 z-[999]"
                    style={{ background: "rgba(0,15,35,.65)", backdropFilter: "blur(5px)" }}
                />

                <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-14 px-4 pb-6 overflow-y-auto">
                    <DialogPanel
                        className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
                        style={{
                            background: "var(--surface-card)",
                            border: "1px solid var(--surface-border)",
                            animation: "modal-slide-in .25s cubic-bezier(.34,1.56,.64,1)",
                        }}
                    >
                        {/* ── Header ── */}
                        <div
                            className="flex items-center justify-between px-6 py-0 h-14"
                            style={{
                                background: "linear-gradient(135deg, var(--primary-color-light) 0%, var(--primary-color) 100%)",
                            }}
                        >
                            <DialogTitle as="h2" className="text-sm font-bold text-white">
                                {title}
                            </DialogTitle>
                            <span
                                onClick={cancel}
                                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer"
                                style={{ background: "rgba(255,255,255,.1)", border: "none", boxShadow: "none", color: "rgba(255,255,255,.7)" }}
                            >
                                <IoClose size={18} />
                            </span>
                        </div>

                        {/* ── Body ── */}
                        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100dvh - 16rem)" }}>
                            <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
                                <div className={`flex flex-col col-span-2 lg:col-span-1 mb-2`}>
                                    <label className={`label slim-label-primary`}>Beneficiário</label>
                                    <select className="select slim-select-primary" {...register("beneficiaryUuid")}>
                                        <option value="">Selecione</option>
                                        {
                                            recipient.map((x: any) => {
                                                return <option key={x.id} value={`${x.rapidocId}ESPACO${x.cpf}`}>{x.name}</option>
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
                                    <div className="calendar rounded-xl p-2 flex justify-center">
                                        <Calendar
                                            onChange={(val) => { setDate(val as Date); setSelectedTime(null); }}
                                            value={date}
                                            tileDisabled={isTileDisabled}
                                            tileClassName={getTileClassName}
                                            minDate={new Date()}
                                            locale="pt-BR"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm font-semibold slim-label-primary mb-2">Horários Disponíveis</label>
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
                                                <RiCalendarScheduleFill className="text-4xl mb-2 opacity-20 slim-label-primary" />
                                                <p className="italic text-sm slim-label-primary">Nenhum horário disponível para esta data.</p>
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
                        </div>

                    </DialogPanel>
                </div>
            </Dialog>
        </>    
    )
}