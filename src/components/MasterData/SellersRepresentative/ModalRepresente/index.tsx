"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { Button } from "@/components/Global/Button";
import { maskAccount, maskAgency, maskCNPJ, maskCPF, maskPhone } from "@/utils/mask.util";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { validatorCPF } from "@/utils/validator.utils";
import { ResetSellerRepresentative, TSellerRepresentative } from "@/types/masterData/sellerRepresentative/sellerRepresentative.type";
import { TContact } from "@/types/masterData/contact/contact.type";
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import axios from "axios";
import { ResetAttachment, TAttachment } from "@/types/masterData/attachment/attachment.type";
import { TGenericTable } from "@/types/masterData/genericTable/genericTable.type";

type TProp = {
    // title: string;
    // isOpen: boolean;
    // setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    // onSelectValue: (isSuccess: boolean) => void;
    tab: "data" | "dataResponsible" | "contact" | "seller" | "attachment" | "dataBank",
    body?: TSellerRepresentative
}

export const ModalRepresente = ({body, tab, onClose}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [genders, setGender] = useState<any[]>([]);
    const [typePix, setTypePix] = useState<any[]>([]);
    const [tabCurrent, setTabCurrent] = useState<"data" | "dataResponsible" | "contact" | "seller" | "attachment" | "dataBank">("data")
    const { register, handleSubmit, reset, getValues, watch, formState: { errors }} = useForm<TSellerRepresentative>();

    const onSubmit: SubmitHandler<TSellerRepresentative> = async (body: TSellerRepresentative) => {
        console.log(body)
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
            
            const path = tab == "dataResponsible" ? '/responsible' : '';
            if(tab == "dataResponsible") {
                body.responsible.address.parentId = body.id;
                body.responsible.address.parent = "seller-representative-responsible";
            };

            await update(body, path, false, true);
            if(tab == "dataResponsible" && !body.responsible.address.id) {
                await getAddressResponsible();
            };
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

            reset(body);

            if(isMessage) {
                resolveResponse({status, ...data});
            };

            if(isClose) {
                cancel();
                // onSelectValue(true);
            };
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
                // onSelectValue(true);
            };
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getAddressByZipCode = async (zipCode: React.ChangeEvent<HTMLInputElement>, parent: string) => {
        let value = zipCode.target.value.replace(/\D/g, "");

        if(value.length == 8) {
            setLoading(true);
            const {data} = await axios.get(`https://viacep.com.br/ws/${value}/json/`);

            const address = {
                city: data.localidade,
                complement: data.complemento,
                neighborhood: data.bairro,
                number: getValues("address.number"),
                parent: "",
                parentId: "",
                state: data.estado,
                street: data.logradouro,
                zipCode: data.cep
            };
            const bodyCurrent = {...getValues()};
            if(parent == "responsible") {
                bodyCurrent.responsible.address = address;
            } else {
                bodyCurrent.address = address;
            }

            reset(bodyCurrent);
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
            const {data} = await api.get(`/generic-tables/table/genero-representante`, configApi());
            const result = data.result;
            setGender(result.data);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };
    
    const getSelectTypePix = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/generic-tables/table/tipo-pix-representante`, configApi());
            const result = data.result;
            setTypePix(result.data);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };
    
    const getAddressResponsible = async () => {
        try {
            const {data} = await api.get(`/addresses/${watch("id")}/seller-representative-responsible`, configApi());
            const result = data.result;

            const newBody = {...getValues()};
            newBody.responsible.address.id = result.data.id;
            reset(newBody);
        } catch (error) {
            resolveResponse(error);
        }
    };

    useEffect(() => {
        reset(ResetSellerRepresentative);

        setTabCurrent("data");
        getSelectGender();
        getSelectTypePix();

        if(body) {
            body.effectiveDate = body.effectiveDate.toString().split('T')[0];
            reset(body);
        };
    }, [body]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {
                tab == "data" &&
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
                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => getAddressByZipCode(e, '')} {...register("address.zipCode", {minLength: {value: 8, message: "CEP inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
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
            }

            {
                tab == "dataResponsible" &&
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
                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => getAddressByZipCode(e, 'responsible')} {...register("responsible.address.zipCode", {required: "CEP é obrigatório", minLength: {value: 8, message: "CEP inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
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
            }
        
            {
                tab == "dataBank" &&
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 mb-2">
                    <div className={`flex flex-col col-span-2 mb-2`}>
                        <label className={`label slim-label-primary`}>Banco</label>
                        <input {...register("bank.bank")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                    </div>
                    <div className={`flex flex-col col-span-2 mb-2`}>
                        <label className={`label slim-label-primary`}>Agência</label>
                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskAgency(e)} {...register("bank.agency")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                    </div>
                    <div className={`flex flex-col col-span-2 mb-2`}>
                        <label className={`label slim-label-primary`}>Conta</label>
                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskAccount(e)}  {...register("bank.account")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                    </div>
                    <div className={`flex flex-col mb-2`}>
                        <label className={`label slim-label-primary`}>Tipo de Conta</label>
                        <select className="select slim-select-primary" {...register("bank.type")}>
                            <option value="">Selecione</option>
                            <option value="Conta Corrente">Conta Corrente</option>
                            <option value="Conta Poupanca">Conta Poupança</option>
                        </select>
                    </div>
                    <div className={`flex flex-col mb-2`}>
                        <label className={`label slim-label-primary`}>Tipo Chave Pix</label>
                        <select className="select slim-select-primary" {...register("bank.pixType")}>
                            <option value="">Selecione</option>
                            {
                                typePix.map((x: TGenericTable) => <option key={x.id} value={x.code}>{x.description}</option>)
                            }
                        </select>
                    </div>
                    <div className={`flex flex-col col-span-4 mb-2`}>
                        <label className={`label slim-label-primary`}>Chave Pix</label>
                        <input {...register("bank.pixKey")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                    </div>
                </div>
            }
            <div className="flex justify-end gap-2 w-12/12 mt-3">
                <button type="button" onClick={cancel} className="slim-btn slim-btn-primary-light">Cancelar</button>
                <Button type="submit" text="Salvar" theme="primary" styleClassBtn=""/>
            </div>
        </form>
    )
}