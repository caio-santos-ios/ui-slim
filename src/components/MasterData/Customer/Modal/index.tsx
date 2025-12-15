"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api, baseURL } from "@/service/api.service";
import { useEffect, useState } from "react";
import { Button } from "@/components/Global/Button";
import { maskCNPJ, maskCPF, maskPhone } from "@/utils/mask.util";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { validatorCPF } from "@/utils/validator.utils";
import { ResetContact, TContact } from "@/types/masterData/contact/contact.type";
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { ModalDelete } from "@/components/Global/ModalDelete";
import axios from "axios";
import { ResetAttachment, TAttachment } from "@/types/masterData/attachment/attachment.type";
import { ModalRecipient } from "../ModalRecipient";
import { ModalContractor } from "../ModalContract";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean) => void;
    body?: any
}

export const ModalCustomer = ({title, isOpen, setIsOpen, onClose, onSelectValue, body}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [genders, setGender] = useState<any[]>([]);
    const [departaments, setDepartament] = useState<any[]>([]);
    const [positions, setPosition] = useState<any[]>([]);
    const [modalDelete, setModalDelete] = useState<boolean>(false);
    const [currentContact, setContactCurrent] = useState<TContact>({department: "", position: "", name: "", email: "", phone: "", whatsapp: "", parent: "", parentId: ""});
    const [modalDeleteAttachment, setModalDeleteAttachment] = useState<boolean>(false);
    const [currentAttachment, setCurrentAttachment] = useState<TAttachment>(ResetAttachment);
    const [tabCurrent, setTabCurrent] = useState<"contractor" | "recipient" | "contract">("contractor")
    const [bodyAttachment, setBodyAttatchment] = useState<TAttachment>(ResetAttachment);
    const [attachments, setAttatchment] = useState<TAttachment[]>([]);

    const [bodyContact, setBodyContact] = useState<TContact>(ResetContact);
    const [contacts, setContact] = useState<TContact[]>([]);
    
    const { register, handleSubmit, reset, getValues, watch, formState: { errors }} = useForm<any>();

    const tabs = [
        { key: 'contractor', title: 'Contratante' },
        { key: 'recipient', title: 'Beneficiários' },
        { key: 'contract', title: 'Contratos' },
    ];

    const onSubmit: SubmitHandler<any> = async (body: any) => {
        
    };

    const create = async (body: any, isClose: boolean = true, isMessage = true) => {
        try {
            const { status, data} = await api.post('/seller-representatives', body, configApi());
            console.log(data)
            body = {...getValues()}
            body.id = data.data.id;
            body.address.id = body.address.id!;
            body.address.parentId = body.id!;
            body.address.parent = "seller-representative";
            console.log(body.address)
            reset(body);

            if(isMessage) {
                resolveResponse({status, ...data});
            };

            if(isClose) {
                cancel();
            };
            onSelectValue(true);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const update = async (body: any, path: string = '', isClose: boolean = true, isMessage = false) => {
        try {
            body.effectiveDate = new Date(body.effectiveDate);
            const { status, data} = await api.put(`/seller-representatives${path}`, body, configApi());

            if(isMessage) {
                resolveResponse({status, ...data});
            };

            if(isClose) {
                cancel();
            };
            onSelectValue(true);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getAddressByZipCode = async (zipCode: React.ChangeEvent<HTMLInputElement>) => {
        let value = zipCode.target.value.replace(/\D/g, "");

        if(value.length == 8) {
            setLoading(true);
            const {data} = await axios.get(`https://viacep.com.br/ws/${value}/json/`);
            reset({
                ...getValues(),
                address: {
                    city: data.localidade,
                    complement: data.complemento,
                    neighborhood: data.bairro,
                    number: getValues("address.number"),
                    parent: "",
                    parentId: "",
                    state: data.estado,
                    street: data.logradouro,
                    zipCode: data.cep
                }
            })
            setLoading(false);
        };
    };

    const getCNPJ = async (event: React.ChangeEvent<HTMLInputElement>) => {
        maskCNPJ(event);
        let cnpj = event.target.value.replace(/\D/g, "");
        if(cnpj.length == 14) {
            try {
                setLoading(true);
                const {data} = await api.get(`/receita-ws/${cnpj}`, configApi());
                const body: any = {...getValues()};
                reset({
                    ...body,
                    tradeName: data.fantasia,
                    corporateName: data.nome,
                    address: {
                        zipCode: data.cep,
                        number: "",
                        street: data.logradouro,
                        city: data.municipio,
                        complement: "",
                        neighborhood: data.bairro,
                        parent: 'seller-representatives',
                        parentId: '',
                        state: data.uf
                    },
                    email: data.email
                })
            } catch (error) {
                resolveResponse(error);
            }   finally {
                setLoading(false);
            }
        }
    };

    const cancel = () => {
        reset();

        onClose();
    };

    const alterTab = async (tab: "contractor" | "recipient" | "contract", isMessage: boolean = false, saveTab: boolean = false) => {
        setTabCurrent(tab);
    };

    useEffect(() => {
        reset();

        setTabCurrent("contractor");

        if(body) {
            if(body.effectiveDate) {
                body.effectiveDate = body.effectiveDate.toString().split('T')[0];
            };

            reset(body);
        };
    }, [body]);

    return (
        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto container-modal">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className="w-full max-w-7xl rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="bg-red mb-4 border-b-3 header-modal">
                            <DialogTitle as="h1" className="text-xl font-bold primary-color">{title}</DialogTitle>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 mb-2 slim-bg-primary p-2 rounded-4xl">
                            {tabs.map((x: any) => (
                                <div key={x.key} onClick={() => alterTab(x.key)} className={`col-span-2 rounded-4xl py-2 font-bold text-lg text-center cursor-pointer ${tabCurrent === x.key ? 'slim-bg-secondary' : 'slim-bg-primary'}`}>
                                    {x.title}
                                </div>
                            ))}
                        </div>                        

                        {
                            tabCurrent == "contractor" &&
                            <ModalContractor onSelectValue={onSelectValue} body={body} onClose={cancel}/> 
                        }

                        {
                            tabCurrent == "recipient" &&
                            <ModalRecipient isOpen={isOpen} contractorType={body.type} contractorId={body.id} onClose={cancel} />
                        }

                        
                        {
                            tabCurrent == "contract" &&
                            <ModalContractor onSelectValue={onSelectValue} body={body} onClose={cancel}/> 
                        }
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}