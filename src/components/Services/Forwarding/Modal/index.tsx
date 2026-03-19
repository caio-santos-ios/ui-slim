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
import { TAccreditedNetwork } from "@/types/masterData/accreditedNetwork/accreditedNetwork.type";
import { TServiceModule } from "@/types/masterData/serviceModules/serviceModules.type";
import { TProcedure } from "@/types/masterData/procedure/procedure.type";
import { ResetForwarding, TForwarding } from "@/types/service/forwarding/forwarding.type";
import { IoClose } from "react-icons/io5";

type TProp = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    handleReturnModal: () => void;
    obj: any;
}

export const ModalForwarding = ({isOpen, setIsOpen, onClose, handleReturnModal, obj}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [recipient, setRecipient] = useState<TRecipient[]>([]);
    const [beneficiaryMedicalReferrals, setBeneficiaryMedicalReferral] = useState<TRecipient[]>([]);
    const [specialties, setSpecialty] = useState<any[]>([]);
    const [specialtyAvailabilities, setSpecialtyAvailabilities] = useState<any[]>([]);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors }} = useForm<TForwarding>({});

    const onSubmit: SubmitHandler<TForwarding> = async (body: TForwarding) => {      
        if(!body.id) {
            await create(body);
        } else {
            await update(body);
        }
    };

    const create = async (body: TForwarding) => {
        try {
            const { status, data} = await api.post(`/forwardings`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            handleReturnModal();
        } catch (error) {
            resolveResponse(error);
        }
    };
    
    const update = async (body: TForwarding) => {
        try {
            const { status, data} = await api.put(`/forwardings`, body, configApi());
            resolveResponse({status, ...data});
            cancel();
            handleReturnModal();
        } catch (error) {
            resolveResponse(error);
        }
    };

    const cancel = () => {
        reset(ResetForwarding);
        onClose();
    };

    const getSelectRecipient = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/customer-recipients/select?deleted=false&orderBy=createdAt&sort=desc`, configApi());
            const result = data.result;
            console.log(result)
            setRecipient(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const getSelectBeneficiaryMedicalReferral = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/forwardings/beneficiary-medical-referrals`, configApi());
            const result = data.result;
            console.log(result.data)
            setBeneficiaryMedicalReferral(result.data ?? []);
        } catch (error) {
            console.log(error)
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };
    
    const getSelectSpecialty = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/forwardings/specialties`, configApi());
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
            const {data} = await api.get(`/forwardings/specialty-availability/${specialtyUuid}/${beneficiaryUuid}`, configApi());
            const result = data.result;
            setSpecialtyAvailabilities(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     if(watch("beneficiaryMedicalReferralUuid") && watch("specialtyUuid")) {
    //         if(watch("beneficiaryMedicalReferralUuid")) {
    //             const beneficiary: any = beneficiaryMedicalReferrals.find(x => x.id == watch("beneficiaryMedicalReferralUuid"))
    //             if(beneficiary) {
    //                 getSelectSpecialtyAvailability(watch("specialtyUuid"), beneficiary.beneficiaryId);
    //                 setValue("beneficiaryUuid", beneficiary.beneficiaryId);
    //             };
    //         };
    //     };
    // }, [watch("beneficiaryMedicalReferralUuid"), watch("specialtyUuid")]);

    useEffect(() => {
        console.log(obj)
        // reset({
        //     beneficiaryMedicalReferralUuid: id,
        //     beneficiaryUuid: recipienId,
        //     specialtyUuid: specialtyId
        // });
        // console.log("teste")
        // getSelectRecipient();
        // getSelectBeneficiaryMedicalReferral();
        // getSelectSpecialty();
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
                                Fazer Encaminhamento
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
                            <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 mb-2">
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Beneficiário</label>
                                    <select className="select slim-select-primary" {...register("beneficiaryMedicalReferralUuid")}>
                                        <option value="">Selecione</option>
                                        {
                                            beneficiaryMedicalReferrals.map((x: any) => {
                                                return <option key={x.id} value={x.id}>{x.name}</option>
                                            })
                                        }
                                    </select>
                                </div>                                
                                <div className={`flex flex-col col-span-2 mb-2`}>
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
                                <div className={`flex flex-col col-span-2 mb-2`}>
                                    <label className={`label slim-label-primary`}>Disponibilidade</label>
                                    <select className="select slim-select-primary" {...register("availabilityUuid")}>
                                        <option value="">Selecione</option>
                                        {
                                            specialtyAvailabilities.map((x: any) => {
                                                return <option key={x.id} value={x.id}>{x.name}</option>
                                            })
                                        }
                                    </select>
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