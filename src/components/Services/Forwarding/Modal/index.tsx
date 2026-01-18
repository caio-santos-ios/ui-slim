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
        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto container-modal">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className="slim-modal w-full max-w-4xl rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="slim-modal-title mb-4 border-b-3">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">Fazer Encaminhamento</DialogTitle>
                        </div>

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
                    </DialogPanel>
                </div>
            </div>
        </Dialog>    
    )
}