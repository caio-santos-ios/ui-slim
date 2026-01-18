"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api, baseURL, uriBase } from "@/service/api.service";
import { useEffect, useState } from "react";
import { Button } from "@/components/Global/Button";
import { maskCNPJ, maskCPF, maskPhone } from "@/utils/mask.util";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { validatorCPF } from "@/utils/validator.utils";
import { ResetSellerRepresentative, TSellerRepresentative } from "@/types/masterData/sellerRepresentative/sellerRepresentative.type";
import { ResetContact, TContact } from "@/types/masterData/contact/contact.type";
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { ModalDelete } from "@/components/Global/ModalDelete";
import axios from "axios";
import { ModalAttchment } from "../ModalAttachment";
import { ResetAttachment, TAttachment } from "@/types/masterData/attachment/attachment.type";
import { ModalRepresente } from "../ModalRepresente";
import { ModalContact } from "../ModalContact";
import { ModalSeller } from "../ModalSeller";

type TProp = {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean) => void;
    body?: TSellerRepresentative
}

export const ModalSellerRepresentative = ({title, isOpen, setIsOpen, onClose, onSelectValue, body}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [genders, setGender] = useState<any[]>([]);
    const [departaments, setDepartament] = useState<any[]>([]);
    const [positions, setPosition] = useState<any[]>([]);
    const [modalDelete, setModalDelete] = useState<boolean>(false);
    const [currentContact, setContactCurrent] = useState<TContact>({department: "", position: "", name: "", email: "", phone: "", whatsapp: "", parent: "", parentId: ""});
    const [modalDeleteAttachment, setModalDeleteAttachment] = useState<boolean>(false);
    const [currentAttachment, setCurrentAttachment] = useState<TAttachment>(ResetAttachment);
    const [tabCurrent, setTabCurrent] = useState<"data" | "dataResponsible" | "contact" | "seller" | "attachment" | "dataBank">("data")
    const [bodyAttachment, setBodyAttatchment] = useState<TAttachment>(ResetAttachment);
    const [attachments, setAttatchment] = useState<TAttachment[]>([]);

    const [bodyContact, setBodyContact] = useState<TContact>(ResetContact);
    const [contacts, setContact] = useState<TContact[]>([]);
    
    const { register, handleSubmit, reset, getValues, watch, formState: { errors }} = useForm<TSellerRepresentative>();

    const tabs = [
        { key: 'data', title: 'Dados Gerais' },
        { key: 'dataResponsible', title: 'Dados do Responsável' },
        { key: 'contact', title: 'Contatos' },
        { key: 'seller', title: 'Vendedor' },
        { key: 'attachment', title: 'Anexos' },
        { key: 'dataBank', title: 'Dados Bancários' },
    ];

    const onSubmit: SubmitHandler<TSellerRepresentative> = async (body: TSellerRepresentative) => {
        
        switch(tabCurrent) {
            case "data":
                if(!body.id) {
                    const address = {
                        zipCode: "",
                        street: "",
                        number: "",
                        neighborhood: "",
                        city: "",
                        state: "",
                        complement: "",
                        parentId: "",
                        parent: ""
                    };
                    body.bank = {
                        bank: "",
                        agency: "",
                        account: "",
                        type: "",
                        pixKey: "",
                        pixType: ""
                    };
                    body.responsible = {
                        name: "",
                        cpf: "",
                        rg: "",
                        address,
                        dateOfBirth: null,
                        gender: "",
                        phone: "",
                        email: "",
                        notes: "",
                        whatsapp: ""
                    };

                    if(body.effectiveDate) {
                        body.effectiveDate = new Date(body.effectiveDate);
                    };
                    
                    await create(body, false);
                } else {
                    if(body.effectiveDate) {
                        body.effectiveDate = new Date(body.effectiveDate);
                    };

                    await update(body, '', false, true);
                };
                break;

            case "dataResponsible":
                // if(saveTab) {
                    // };
                await update(body, '/responsible', false, true);
                break;

            case "contact":
                // if(saveTab) {
                    if(watch("contact.id")) {
                        await updateContact(false);
                    } else {
                        console.log("teste")
                        await createContact(false);
                    }
                // };
                // await getContacts();
                // await getSelectDepartament();
                // await getSelectPosition();
                break;

            case "seller":
                // if(saveTab) {
                    if(watch("seller.id")) {
                        await updateSeller(true);
                    } else {
                        await createSeller(true);
                    };
                // };
                break;

            case "attachment":
                break;

            case "dataBank":
                break;

            default:
                break;
        };
    };

    const create = async (body: TSellerRepresentative, isClose: boolean = true, isMessage = true) => {
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

    const update = async (body: TSellerRepresentative, path: string = '', isClose: boolean = true, isMessage = false) => {
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

    const createContact = async (isMessage = true) => {
        try {
            const contact = {
                name: watch("contact.name"),
                email: watch("contact.email"),
                phone: watch("contact.phone"),
                whatsapp: watch("contact.whatsapp"),
                department: watch("contact.department"),
                position: watch("contact.position"),
                parent: "seller-representatives",
                parentId: watch("id")
            };
            const { status, data} = await api.post('/contacts', contact, configApi());

            cancelContact();

            if(isMessage) {
                resolveResponse({status, ...data});
            };
        } catch (error) {
            resolveResponse(error);
        }
    };

    const updateContact = async (isMessage = false) => {
        try {
            const contact = {
                id: watch("contact.id"),
                name: watch("contact.name"),
                email: watch("contact.email"),
                phone: watch("contact.phone"),
                whatsapp: watch("contact.whatsapp"),
                department: watch("contact.department"),
                position: watch("contact.position"),
                parent: "seller-representatives",
                parentId: watch("id")
            };
            const { status, data} = await api.put(`/contacts`, contact, configApi());

            if(isMessage) {
                resolveResponse({status, ...data});
            };

            cancelContact();
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getContact = async (contact: TContact) => {
        const body = {...contact, atributes: ""};
        setBodyContact(body);
    };

    const getContacts = async () => {
        try {
            const {data} = await api.get(`/contacts?deleted=false&pageSize=100&pageNumber=1&sort=createdAt&orderBy=createdAt&parentId=${watch("id")}&parent=seller-representative`, configApi());
            const result = data.result;
            setContact(result.data);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const openModalContact = (body: TContact) => {
        setContactCurrent(body);

        reset({
            ...getValues(),
            contact: {
                id: body.id,
                name: body.name,
                email: body.email,
                phone: body.phone,
                whatsapp: body.whatsapp,
                department: body.department,
                position: body.position,
                parent: body.parent,
                parentId: body.parentId
            }
        });
    };

    const openModalDelete = (body: TContact) => {
        setContactCurrent(body);
        setModalDelete(true);
    };

    const destroyContact = async () => {
        try {
            const { status } = await api.delete(`/contacts/${currentContact?.id}`, configApi());
            resolveResponse({status, message: "Excluído com sucesso"});
            setModalDelete(false);
            await getContacts();
        } catch (error) {
            resolveResponse(error);
        }
    };

    const cancelContact = () => {
        const body: any = {...getValues(), contact: {
            id: "",
            name: "",
            email: "",
            phone: "",
            whatsapp: "",
            department: "",
            position: "",
            parent: "seller-representatives",
            parentId: watch("id")
        }};

        reset(body);
    };

    const createSeller = async (isMessage = true) => {
        try {
            const address = {
                zipCode: watch("seller.address.zipCode"),
                number: watch("seller.address.number"),
                street: watch("seller.address.street"),
                neighborhood: watch("seller.address.neighborhood"),
                city: watch("seller.address.city"),
                state: watch("seller.address.state"),
                complement: watch("seller.address.complement")
            };

            const seller = {
                id: "",
                type: watch("seller.type"),
                phone: watch("seller.phone"),
                cpf: watch("seller.cpf"),
                email: watch("seller.email"),
                name: watch("seller.name"),
                notes: watch("seller.notes"),
                parentId: watch("id")!,
                address
            };

            const { status, data} = await api.post('/sellers', seller, configApi());

            if(isMessage) {
                resolveResponse({status, ...data});
            };
        } catch (error) {
            resolveResponse(error);
        }
    };

    const updateSeller = async (isMessage = false) => {
        try {
            const address = {
                id: watch("seller.address.id"),
                zipCode: watch("seller.address.zipCode"),
                number: watch("seller.address.number"),
                street: watch("seller.address.street"),
                neighborhood: watch("seller.address.neighborhood"),
                city: watch("seller.address.city"),
                state: watch("seller.address.state"),
                complement: watch("seller.address.complement")
            };

            const seller = {
                id: watch("seller.id"),
                type: watch("seller.type"),
                phone: watch("seller.phone"),
                cpf: watch("seller.cpf"),
                email: watch("seller.email"),
                name: watch("seller.name"),
                notes: watch("seller.notes"),
                parentId: watch("id")!,
                address
            };
            console.log(seller)
            const { status, data} = await api.put(`/sellers`, seller, configApi());

            if(isMessage) {
                resolveResponse({status, ...data});
            };
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
        reset(ResetSellerRepresentative);

        onClose();
    };

    const getSelectGender = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/generic-tables/table/genero`, configApi());
            const result = data.result;
            setGender(result.data);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const getSelectDepartament = async () => {
        try {
            const {data} = await api.get(`/generic-tables/table/departamento-contato-representante`, configApi());
            const result = data.result;
            setDepartament(result.data);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getSelectPosition = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/generic-tables/table/funcao-contato-representante`, configApi());
            const result = data.result;
            setPosition(result.data);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const getAttachments = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/attachments?deleted=false&pageSize=100&pageNumber=1&orderBy=createdAt&sort=desc&parentId=${watch("id")}&parent=seller-representative`, configApi());
            const result = data.result;
            console.log(result.data)
            setAttatchment(result.data);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const openModalAttachmentDelete = (attachment: TAttachment) => {
        setCurrentAttachment(attachment);
        setModalDeleteAttachment(true);
    };

    const destroyAttachment = async () => {
        try {
            const { status } = await api.delete(`/attachments/${currentAttachment?.id}`, configApi());
            resolveResponse({status, message: "Excluído com sucesso"});
            setModalDeleteAttachment(false);
            await getAttachments();
        } catch (error) {
            resolveResponse(error);
        }
    };

    const alterTab = async (tab: "data" | "dataResponsible" | "contact" | "seller" | "attachment" | "dataBank", isMessage: boolean = false, saveTab: boolean = false) => {
        const body: any = {...getValues()};

        switch(tabCurrent) {
            case "data":

                if(!body.id) {
                    const address = {
                        zipCode: "",
                        street: "",
                        number: "",
                        neighborhood: "",
                        city: "",
                        state: "",
                        complement: "",
                        parentId: "",
                        parent: ""
                    };
                    body.bank = {
                        bank: "",
                        agency: "",
                        account: "",
                        type: "",
                        pixKey: "",
                        pixType: ""
                    };
                    body.responsible = {
                        name: "",
                        cpf: "",
                        rg: "",
                        address,
                        dateOfBirth: null,
                        gender: "",
                        phone: "",
                        email: "",
                        notes: "",
                    };
                    body.effectiveDate = new Date(body.effectiveDate);
                    validatedField();
                    // await create(body, false);
                } else {
                    // await update(body, '', false, isMessage)
                };
                break;

            case "dataResponsible":
                // await update(body, '/responsible', false, isMessage);
                break;

            case "contact":
                break;

            case "seller":
                break;

            case "attachment":
                break;

            case "dataBank":
                break;

            default:
                break;
        }

        switch(tab) {
            case "data":
                break;

            case "dataResponsible":
                await getSelectGender();
                break;

            case "contact":
                await getContacts();
                await getSelectDepartament();
                await getSelectPosition();
                break;

            case "seller":
               break;
            case "attachment":
                await getAttachments();
                break;
            case "dataBank":
                break;
            default:
                break;
        };

        setTabCurrent(tab);
    };

    useEffect(() => {
        reset(ResetSellerRepresentative);

        setTabCurrent("data");

        if(body) {
            body.effectiveDate = body.effectiveDate.toString().split('T')[0];
            reset(body);
        };
    }, [body]);

    const validatedField = () => {
        let errorPriority: string[] = [];

        // switch(tabCurrent) {
        //     case "data":
        //         errorPriority = [
        //             "cnpj",
        //             "corporateName",
        //             "tradeName",
        //             "phone",
        //             "email",
        //             "whatsapp",
        //             "effectiveDate",
        //             "address.zipCode",
        //             "address.number",
        //             "address.street",
        //             "address.neighborhood",
        //             "address.city",
        //             "address.state"
        //         ];
        //         break;

        //     case "dataResponsible":
        //         errorPriority = [
        //             "responsible.name",
        //             "responsible.email",
        //             "responsible.rg",
        //             "responsible.cpf",
        //             "responsible.phone",
        //             "responsible.whatsapp",
        //             "responsible.gender",
        //             "responsible.address.zipCode",
        //             "responsible.address.number",
        //             "responsible.address.street",
        //             "responsible.address.neighborhood",
        //             "responsible.address.city",
        //             "responsible.address.state",
        //             "responsible.address.complement"
        //         ];
        //         break;

        //     case "contact":
        //         errorPriority = [
        //             "contact.name",
        //             "contact.email",
        //             "contact.phone",
        //             "contact.whatsapp",
        //             "contact.department",
        //             "contact.position"
        //         ];
        //         break;

        //     case "seller":
        //         errorPriority = [
        //             "seller.type",
        //             "seller.address.zipCode",
        //             "seller.address.number",
        //             "seller.address.street",
        //             "seller.address.neighborhood",
        //             "seller.address.city",
        //             "seller.address.state",
        //             "seller.address.complement",
        //             "seller.notes"
        //         ];
        //         break;
        // }

        // const getErrorByPath = (path: string) => {
        //     const parts = path.split(".");
        //     let current: any = errors;

        //     for (const part of parts) {
        //         if (!current[part]) return null;
        //         current = current[part];
        //     }

        //     return current.message || null;
        // };

        // for (const field of errorPriority) {
        //     const message = getErrorByPath(field);

        //     if (message) {
        //         toast.warn(message, { theme: "colored" });
        //         return;
        //     }
        // };
    };

    return (
        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto container-modal">
                <div className="flex min-h-full items-center justify-center p-4">
                    <<DialogPanel transition className="slim-modal w-full max-w-7xl rounded-xl bg-gray-300 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0">
                        <div className="slim-modal-title mb-4 border-b-3">
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
                            ["data", "dataResponsible", "dataBank"].includes(tabCurrent) &&
                            <ModalRepresente onClose={onClose} tab={tabCurrent} body={body} />
                        }
                        
                        {
                            tabCurrent == "contact" &&
                            <>
                                <ModalContact parentId={watch("id")!} parent="seller-representative" onResult={getContacts} body={bodyContact} />

                                <div className={`flex flex-col col-span-7 mb-2 mt-4`}>
                                    <ul className="grid grid-cols-1 lg:grid-cols-6 lg:gap-10 list-contact">
                                        {
                                            contacts.map((x: any) => {
                                                return (
                                                    <div className="bg-gray-400 shadow-lg shadow-gray-500/50 text-white col-span-3 rounded-4xl p-5 text-lg" key={x.id}>
                                                        <div className="flex justify-between">
                                                            <p><strong>Nome:</strong> {x.name}</p>

                                                            <div className="flex gap-2">
                                                                <div onClick={() => getContact(x)} className="cursor-pointer text-yellow-400 hover:text-yellow-500">
                                                                    <MdEdit className="cursor-pointer text-yellow-400 hover:text-yellow-500" />
                                                                </div>
                                                                <div onClick={() => openModalDelete(x)} className="cursor-pointer text-red-400 hover:text-red-500">
                                                                    <FaTrash className="cursor-pointer text-red-400 hover:text-red-500" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p><strong>E-mail:</strong> {x.email}</p>
                                                        <p><strong>Telefone:</strong> {x.phone}</p>
                                                        <p><strong>WhatsApp:</strong> {x.whatsapp}</p>
                                                        <div className="flex justify-between">
                                                            <p><strong>Departamento:</strong> {x.departmentDescription}</p>
                                                            <p><strong>Função:</strong> {x.positionDescription}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </ul>
                                </div>
                            </>
                        }
                        
                        {/* {
                            tabCurrent == "data" &&
                            <div className="w-full shrink-0 p-4">
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 mb-2">
                                    <div className={`flex flex-col col-span-2 mb-2`}>
                                        <label className={`label slim-label-primary`}>CNPJ</label>
                                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => getCNPJ(e)} {...register("cnpj")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col col-span-2 mb-2`}>
                                        <label className={`label slim-label-primary`}>Razão Social</label>
                                        <input {...register("corporateName")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col col-span-3 mb-2`}>
                                        <label className={`label slim-label-primary`}>Nome Fantasia</label>
                                        <input {...register("tradeName")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>Telefone</label>
                                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("phone")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col col-span-3 mb-2`}>
                                        <label className={`label slim-label-primary`}>E-mail</label>
                                        <input {...register("email", { pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "E-mail inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>WhatsApp</label>
                                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("whatsapp")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>Vigência</label>
                                        <input {...register("effectiveDate")} type="date" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>

                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>CEP</label>
                                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => getAddressByZipCode(e)} {...register("address.zipCode", {minLength: {value: 8, message: "CEP inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>Número</label>
                                        <input {...register("address.number")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col col-span-3 mb-2`}>
                                        <label className={`label slim-label-primary`}>Rua</label>
                                        <input {...register("address.street")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col col-span-3 mb-2`}>
                                        <label className={`label slim-label-primary`}>Bairro</label>
                                        <input {...register("address.neighborhood")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>Cidade</label>
                                        <input {...register("address.city")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>Estado</label>
                                        <input {...register("address.state")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col col-span-5 mb-2`}>
                                        <label className={`label slim-label-primary`}>Complemento</label>
                                        <input {...register("address.complement")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col col-span-7 mb-2`}>
                                        <label className={`label slim-label-primary`}>Observações</label>
                                        <textarea {...register("notes")} className={`slim-textarea slim-textarea-primary`} placeholder="Digite" rows={4}></textarea>
                                    </div>
                                </div>
                            </div>
                        } */}

                        {/* {
                            tabCurrent == "dataResponsible" &&
                            <div className="w-full shrink-0 p-4">
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 mb-2">
                                    <div className={`flex flex-col col-span-2 mb-2`}>
                                        <label className={`label slim-label-primary`}>Nome</label>
                                        <input {...register("responsible.name")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col col-span-3 mb-2`}>
                                        <label className={`label slim-label-primary`}>E-mail</label>
                                        <input {...register("responsible.email", {pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "E-mail inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>RG</label>
                                        <input {...register("responsible.rg" )} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>CPF</label>
                                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskCPF(e)} {...register("responsible.cpf", {validate: value => validatorCPF(value) || "CPF inválido"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>Telefone</label>
                                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("responsible.phone")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>WhatsApp</label>
                                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("responsible.whatsapp")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>Gênero</label>
                                        <select className="select slim-select-primary" {...register("responsible.gender")}>
                                            <option value="">Selecione</option>
                                            {
                                                genders.map((x: any) => {
                                                    return <option key={x.code} value={x.code}>{x.description}</option>
                                                })
                                            }
                                        </select>
                                    </div>
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>CEP</label>
                                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => getAddressByZipCode(e)} {...register("responsible.address.zipCode", {required: "CEP é obrigatório", minLength: {value: 8, message: "CEP inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>Número</label>
                                        <input {...register("responsible.address.number")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col col-span-2 mb-2`}>
                                        <label className={`label slim-label-primary`}>Rua</label>
                                        <input {...register("responsible.address.street")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>Bairro</label>
                                        <input {...register("responsible.address.neighborhood")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>Cidade</label>
                                        <input {...register("responsible.address.city")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>Estado</label>
                                        <input {...register("responsible.address.state")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col col-span-4 mb-2`}>
                                        <label className={`label slim-label-primary`}>Complemento</label>
                                        <input {...register("responsible.address.complement")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col col-span-7 mb-2`}>
                                        <label className={`label slim-label-primary`}>Observações</label>
                                        <textarea {...register("responsible.notes")} className={`slim-textarea slim-textarea-primary`} placeholder="Digite" rows={4}></textarea>
                                    </div>
                                </div>
                            </div>
                        } */}
                        
                        {/* {
                            tabCurrent == "contact" &&
                            <div className="w-full shrink-0 p-4">
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 mb-2">
                                    <div className={`flex flex-col col-span-2 mb-2`}>
                                        <label className={`label slim-label-primary`}>Nome</label>
                                        <input {...register("contact.name")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col col-span-2 mb-2`}>
                                        <label className={`label slim-label-primary`}>E-mail</label>
                                        <input {...register("contact.email", {pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "E-mail inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col col-span-2 mb-2`}>
                                        <label className={`label slim-label-primary`}>Telefone</label>
                                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("contact.phone")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>WhatsApp</label>
                                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("contact.whatsapp")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                                    </div>
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>Departamento</label>
                                        <select className="select slim-select-primary" {...register("contact.department")}>
                                            <option value="">Selecione</option>
                                            {
                                                departaments.map((x: any) => {
                                                    return <option key={x.code} value={x.code}>{x.description}</option>
                                                })
                                            }
                                        </select>
                                    </div>
                                    <div className={`flex flex-col mb-2`}>
                                        <label className={`label slim-label-primary`}>Função</label>
                                        <select className="select slim-select-primary" {...register("contact.position")}>
                                            <option value="">Selecione</option>
                                            {
                                                positions.map((x: any) => {
                                                    return <option key={x.code} value={x.code}>{x.description}</option>
                                                })
                                            }
                                        </select>
                                    </div>

                                    <div className={`flex flex-col col-span-7 mb-2 mt-4`}>
                                        <ul className="grid grid-cols-1 lg:grid-cols-6 lg:gap-10 list-contact">
                                            {
                                                contacts.map((x: any) => {
                                                    return (
                                                        <div className="bg-gray-400 shadow-lg shadow-gray-500/50 text-white col-span-3 rounded-4xl p-5 text-lg" key={x.id}>
                                                            <div className="flex justify-between">
                                                                <p><strong>Nome:</strong> {x.name}</p>

                                                                <div className="flex gap-2">
                                                                    <div onClick={() => openModalContact(x)} className="cursor-pointer">
                                                                        <MdEdit className="cursor-pointer text-yellow-400 hover:text-yellow-500" />
                                                                    </div>
                                                                    <div onClick={() => openModalDelete(x)} className="cursor-pointer">
                                                                        <FaTrash className="cursor-pointer text-red-400 hover:text-red-500" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <p><strong>E-mail:</strong> {x.email}</p>
                                                            <p><strong>Telefone:</strong> {x.phone}</p>
                                                            <p><strong>WhatsApp:</strong> {x.whatsapp}</p>
                                                            <div className="flex justify-between">
                                                                <p><strong>Departamento:</strong> {x.departmentDescription}</p>
                                                                <p><strong>Função:</strong> {x.positionDescription}</p>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        } */}

                        {
                            tabCurrent == "seller" &&
                            <ModalSeller onClose={onClose} body={watch("seller")} parentId={watch("id")!} />
                            // <div className="w-full shrink-0 p-4">
                            //     <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 mb-2">
                            //         <div className={`flex flex-col mb-2`}>
                            //             <label className={`label slim-label-primary`}>Tipo</label>
                            //             <select className="select slim-select-primary" {...register("seller.type")}>
                            //                 <option value="internal">Interno</option>
                            //                 <option value="external">Externo</option>
                            //             </select>
                            //         </div>
                            //         <div className={`flex flex-col col-span-2 mb-2`}>
                            //             <label className={`label slim-label-primary`}>Nome</label>
                            //             <input {...register("seller.name")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                            //         </div>
                            //         <div className={`flex flex-col col-span-3 mb-2`}>
                            //             <label className={`label slim-label-primary`}>E-mail</label>
                            //             <input {...register("seller.email", { pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "E-mail inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                            //         </div>
                            //         <div className={`flex flex-col mb-2`}>
                            //             <label className={`label slim-label-primary`}>Telefone</label>
                            //             <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("seller.phone")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                            //         </div>
                            //         <div className={`flex flex-col mb-2`}>
                            //             <label className={`label slim-label-primary`}>CPF</label>
                            //             <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskCPF(e)} {...register("seller.cpf", {validate: value => validatorCPF(value) || "CPF inválido"})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                            //         </div>
                            //         <div className={`flex flex-col mb-2`}>
                            //             <label className={`label slim-label-primary`}>CEP</label>
                            //             <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => getAddressByZipCode(e)} {...register("seller.address.zipCode", {minLength: {value: 8, message: "CEP inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                            //         </div>
                            //         <div className={`flex flex-col mb-2`}>
                            //             <label className={`label slim-label-primary`}>Número</label>
                            //             <input {...register("seller.address.number")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                            //         </div>
                            //         <div className={`flex flex-col col-span-3 mb-2`}>
                            //             <label className={`label slim-label-primary`}>Rua</label>
                            //             <input {...register("seller.address.street")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                            //         </div>
                            //         <div className={`flex flex-col mb-2`}>
                            //             <label className={`label slim-label-primary`}>Bairro</label>
                            //             <input {...register("seller.address.neighborhood")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                            //         </div>
                            //         <div className={`flex flex-col mb-2`}>
                            //             <label className={`label slim-label-primary`}>Cidade</label>
                            //             <input {...register("seller.address.city")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                            //         </div>
                            //         <div className={`flex flex-col mb-2`}>
                            //             <label className={`label slim-label-primary`}>Estado</label>
                            //             <input {...register("seller.address.state")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                            //         </div>
                            //         <div className={`flex flex-col col-span-5 mb-2`}>
                            //             <label className={`label slim-label-primary`}>Complemento</label>
                            //             <input {...register("seller.address.complement")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                            //         </div>
                            //         <div className={`flex flex-col col-span-7 mb-2`}>
                            //             <label className={`label slim-label-primary`}>Observações</label>
                            //             <textarea {...register("seller.notes")} className={`slim-textarea slim-textarea-primary`} placeholder="Digite" rows={4}></textarea>
                            //         </div>
                            //     </div>
                            // </div>
                        }

                        {
                            tabCurrent == "attachment" &&
                            <>
                                <ModalAttchment onResult={getAttachments} parentId={body!.id!} body={bodyAttachment} />

                                <div className={`flex flex-col col-span-7 mb-2 mt-4`}>
                                    <ul className="grid grid-cols-1 lg:grid-cols-6 lg:gap-10 list-attachment">
                                        {
                                            attachments.map((x: TAttachment) => {
                                                return (
                                                    <div className="bg-gray-400 shadow-lg shadow-gray-500/50 text-white col-span-3 rounded-4xl p-5 text-lg" key={x.id}>
                                                        <div className="flex justify-between">
                                                            <p><strong>Aba:</strong> {x.type}</p>

                                                            <div onClick={() => openModalAttachmentDelete(x)} className="cursor-pointer text-red-400 hover:text-red-500">
                                                                <FaTrash className="cursor-pointer text-red-400 hover:text-red-500" />
                                                            </div>
                                                        </div>
                                                        <strong>
                                                            <a target="_blank" className="text-blue-600" href={`${uriBase}/${x.uri}`}>Visualizar Anexo</a>
                                                        </strong>
                                                    </div>
                                                )
                                            })
                                        }
                                    </ul>
                                </div>
                            </>
                        }
                        <div className="flex justify-end mb-2">
                            {
                                ["contact", "attachment"].includes(tabCurrent) &&
                                <Button click={cancel} text="Fechar" theme="primary-light" styleClassBtn=""/>
                            }
                        </div>
                    </DialogPanel>
                </div>
            </div>

            <ModalDelete
                title='Excluír Contato'
                isOpen={modalDelete} setIsOpen={() => setModalDelete(modalDelete)}
                onClose={() => setModalDelete(false)}
                onSelectValue={destroyContact}
            />
            
            <ModalDelete
                title='Excluír Anexo'
                isOpen={modalDeleteAttachment} setIsOpen={() => setModalDeleteAttachment(modalDeleteAttachment)}
                onClose={() => setModalDeleteAttachment(false)}
                onSelectValue={destroyAttachment}
            />
        </Dialog>
    )
}