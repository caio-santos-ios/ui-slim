"use client";

import "./style.css";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { set, SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { Button } from "@/components/Global/Button";
import { maskAccount, maskAgency, maskCNPJ, maskCPF, maskPhone } from "@/utils/mask.util";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { validatorCPF } from "@/utils/validator.utils";
import { TContact } from "@/types/masterData/contact/contact.type";
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import axios from "axios";
import { ResetAttachment, TAttachment } from "@/types/masterData/attachment/attachment.type";
import { TGenericTable } from "@/types/masterData/genericTable/genericTable.type";
import { TAddress } from "@/types/masterData/address/address.type";
import { TCustomerContractor } from "@/types/masterData/customers/customer.type";
import { TSeller } from "@/types/masterData/seller/seller.type";

type TProp = {
    // title: string;
    // isOpen: boolean;
    // setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    onSelectValue: (isSuccess: boolean) => void;
    // tab: "data" | "dataResponsible" | "contact" | "seller" | "attachment" | "dataBank",
    body?: TCustomerContractor
}

export const ModalContractor = ({body, onSelectValue, onClose}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [origins, setOrigin] = useState<TGenericTable[]>([]);
    const [genders, setGender] = useState<TGenericTable[]>([]);
    const [sellers, setSeller] = useState<TSeller[]>([]);

    const [tabCurrent, setTabCurrent] = useState<"data" | "dataResponsible" | "contact" | "seller" | "attachment" | "dataBank">("data")
    const { register, handleSubmit, reset, getValues, watch, formState: { errors }} = useForm<TCustomerContractor>();
    const type = watch("type");

    const onSubmit: SubmitHandler<TCustomerContractor> = async (body: TCustomerContractor) => {
        if(!body.id) {
            await create(body);
        } else {
            await update(body);
        }
    };

    const create = async (body: TCustomerContractor) => {
        try {
            body.address.parent = "contract";
            if(body.effectiveDate) {
                body.effectiveDate = new Date(body.effectiveDate);
            };
            const { status, data} = await api.post('/customers', body, configApi());

            resolveResponse({status, ...data});
            onSelectValue(true)
        } catch (error) {
            resolveResponse(error);
        }
    };

    const update = async (body: TCustomerContractor) => {
        try {
            if(body.effectiveDate) {
                body.effectiveDate = new Date(body.effectiveDate);
            };

            const { status, data} = await api.put(`/customers`, body, configApi());

            onSelectValue(true)
            resolveResponse({status, ...data});
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
            bodyCurrent.address = address;

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
                const body: TCustomerContractor = {...getValues()};
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

    const getSelectOrigin = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/generic-tables/table/origem-cliente-contratante`, configApi());
            const result = data.result;
            setOrigin(result.data);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };
    
    const getSelectSeller = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/sellers?deleted=false&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=1`, configApi());
            const result = data.result;
            setSeller(result.data);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
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
    
    useEffect(() => {
        reset();
        setTabCurrent("data");

        getSelectGender();
        getSelectOrigin();
        getSelectSeller();
    }, []);

    useEffect(() => {
        if (body && genders.length > 0) {
            const data = { ...body };

            if (data.effectiveDate) {
                data.effectiveDate = data.effectiveDate.toString().split('T')[0];
            }

            if (data.dateOfBirth) {
                data.dateOfBirth = data.dateOfBirth.toString().split('T')[0];
            }

            reset(data);
        }
    }, [body, genders]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="card-modal">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 mb-2">
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Tipo</label>
                    <select {...register("type")} className="select slim-select-primary">
                        <option value="B2C">B2C</option>
                        <option value="B2B">B2B</option>
                    </select>
                </div>              

                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>{type == 'B2C' ? 'CPF' : 'CNPJ'}</label>
                    {
                        type == "B2C" ?
                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskCPF(e)} {...register("document")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                        :
                        <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => getCNPJ(e)} {...register("document")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                    }
                </div>
                <div className={`flex flex-col mb-2`}>
                        <label className={`label slim-label-primary`}>RG</label>
                    <input maxLength={18} {...register("rg" )} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>{type == 'B2C' ? 'Nome' : 'Razão Social'}</label>
                    <input {...register("corporateName")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                {
                    type == "B2B" &&
                    <div className={`flex flex-col col-span-3 mb-2`}>
                        <label className={`label slim-label-primary`}>Nome Fantasia</label>
                        <input {...register("tradeName")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                    </div>
                }
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Telefone</label>
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("phone")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>WhatsApp</label>
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("whatsapp")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col ${type == "B2B" ? 'col-span-3' : 'col-span-3'} mb-2`}>
                    <label className={`label slim-label-primary`}>E-mail</label>
                    <input {...register("email", { pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "E-mail inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                {
                    type == "B2B" &&
                    <div className={`flex flex-col mb-2`}>
                        <label className={`label slim-label-primary`}>Vigência</label>
                        <input {...register("effectiveDate")} type="date" className={`input slim-input-primary`} placeholder="Digite"/>
                    </div>
                }
                {
                    type == "B2C" &&
                    <>
                        <div className={`flex flex-col mb-2`}>
                            <label className={`label slim-label-primary`}>Data de Nascimento</label>
                            <input {...register("dateOfBirth")} type="date" className={`input slim-input-primary`} placeholder="Digite"/>
                        </div>
                        <div className={`flex flex-col mb-2`}>
                            <label className={`label slim-label-primary`}>Gênero</label>
                            <select className="select slim-select-primary" {...register("gender")}>
                                <option value="">Selecione</option>
                                {
                                    genders.map((x: any) => {
                                        return <option key={x.code} value={x.code}>{x.description}</option>
                                    })
                                }
                            </select>
                        </div>
                    </>
                }
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Origem</label>
                    <select {...register("origin")} className="select slim-select-primary">
                        <option value="">Selecione</option>
                        {
                            origins.map((x: TGenericTable) => <option key={x.id} value={x.code}>{x.description}</option>)
                        }
                    </select>
                </div>   
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Vendedor</label>
                    <select {...register("sellerId")} className="select slim-select-primary">
                        <option value="">Selecione</option>
                        {
                            sellers.map((x: TSeller) => <option key={x.id} value={x.id}>{x.name}</option>)
                        }                        
                    </select>
                </div>   
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Tipo de Plano</label>
                    <select {...register("typePlan")} className="select slim-select-primary">
                        <option value="">Selecione</option>
                        <option value="Individual">Individual</option>
                        <option value="Familiar">Familiar</option>
                        <option value="Concessão">Concessão</option>
                        <option value="Concessão - Familia">Concessão - Familia</option>
                    </select>
                </div>   
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>CEP</label>
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => getAddressByZipCode(e, '')} {...register("address.zipCode", {minLength: {value: 8, message: "CEP inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Número</label>
                    <input {...register("address.number")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-4 mb-2`}>
                    <label className={`label slim-label-primary`}>Rua</label>
                    <input {...register("address.street")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>Bairro</label>
                    <input {...register("address.neighborhood")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>Cidade</label>
                    <input {...register("address.city")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2 ${type == "B2B" ? 'col-span-5' : 'col-span-1'}`}>
                    <label className={`label slim-label-primary`}>Estado</label>
                    <input {...register("address.state")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col ${type == "B2B" ? 'col-span-5' : 'col-span-2'} mb-2`}>
                    <label className={`label slim-label-primary`}>Complemento</label>
                    <input {...register("address.complement")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-7 mb-2`}>
                    <label className={`label slim-label-primary`}>Observações</label>
                    <textarea {...register("notes")} className={`slim-textarea slim-textarea-primary`} placeholder="Digite" rows={4}></textarea>
                </div>
            </div>

            <div className="flex justify-end gap-2 w-12/12 mt-3">
                <Button type="button" click={cancel} text="Cancelar" theme="primary-light" styleClassBtn=""/>
                <Button type="submit" text="Salvar" theme="primary" styleClassBtn=""/>
            </div>
        </form>
    )
}