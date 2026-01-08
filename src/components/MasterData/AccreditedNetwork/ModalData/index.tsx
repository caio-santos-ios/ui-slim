"use client";

import "./style.css";
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { Button } from "@/components/Global/Button";
import { maskCNPJ, maskCPF, maskMoney, maskPhone } from "@/utils/mask.util";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import axios from "axios";
import { TGenericTable } from "@/types/masterData/genericTable/genericTable.type";
import { TSeller } from "@/types/masterData/seller/seller.type";
import { TPlan } from "@/types/masterData/plans/plans.type";
import { convertMoneyToNumber, convertNumberMoney, convertStringMoney } from "@/utils/convert.util";
import { toast } from "react-toastify";
import { ResetAccreditedNetwork, TAccreditedNetwork } from "@/types/masterData/accreditedNetwork/accreditedNetwork.type";
import { TTradingTable } from "@/types/masterData/tradingTable/tradingTable.type";
import { TBilling } from "@/types/masterData/billing/billing.type";

type TProp = {
    onClose: () => void;
    onSelectValue: (isSuccess: boolean, id: string) => void;
    onSelectType: (type: string) => void;
    onSuccess: (isSuccess: boolean, body: TAccreditedNetwork) => void;
    id: string;
}

export const ModalData = ({id, onSelectValue, onSuccess, onClose}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [tradingTables, setTradingTable] = useState<TTradingTable[]>([]);
    const [billings, setBilling] = useState<TBilling[]>([]);
    const { register, handleSubmit, reset, getValues, formState: { errors }} = useForm<TAccreditedNetwork>({
        defaultValues: ResetAccreditedNetwork
    });

    const onSubmit: SubmitHandler<TAccreditedNetwork> = async (body: TAccreditedNetwork) => {
        if(body.effectiveDate)  body.effectiveDate = new Date(body.effectiveDate);
        else body.effectiveDate = null;
      
        if(body.consumptionLimit) body.consumptionLimit = convertStringMoney(body.consumptionLimit);
        if(!body.consumptionLimit) body.consumptionLimit = 0;
        if(body.consumptionLimit < 1) return toast.warn("Limite de Consumo não pode ser menor que R$ 1,00", {theme: 'colored'});
        
        if(body.address.id == null) body.address.id = "";
        if(body.responsible.address.id == null) body.responsible.address.id = "";

        if(!body.id) {
            await create(body);
        } else {
            await update(body);
        }
    };

    const create = async (body: TAccreditedNetwork) => {
        try {
            body.address.parent = "accredited-network";           
            const { status, data} = await api.post('/accredited-networks', body, configApi());
            const result = data.result;
            onSelectValue(true, result.data.id);
            resolveResponse({status, ...data});
            onSelectValue(true, data.result.data.id);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const update = async (body: TAccreditedNetwork) => {
        try {
            const { status, data} = await api.put(`/accredited-networks`, body, configApi());
            const result = data.result;
            onSelectValue(true, result.data.id);
            onSuccess(true, result.data);
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
                const body: TAccreditedNetwork = {...getValues()};
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
                        parent: 'accredited-network',
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

    const getSelectTradingTable = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/trading-tables/select?deleted=false&orderBy=createdAt&sort=desc`, configApi());
            const result = data.result;
            setTradingTable(result.data);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };
    
    const getSelectBilling = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/billings/select?deleted=false&orderBy=createdAt&sort=desc`, configApi());
            const result = data.result;
            setBilling(result.data);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const getById = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/accredited-networks/${id}`, configApi());
            const result = data.result;

            reset({
                ...result.data,
                consumptionLimit: convertNumberMoney(result.data.consumptionLimit),
                effectiveDate: result.data.effectiveDate.toString().split('T')[0]
            });
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };
        
    useEffect(() => {
        getSelectTradingTable();
        getSelectBilling();
    }, []);

    useEffect(() => {
        if(id) {
            getById();
        };
    }, [id]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="card-modal">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 mb-2">
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>CNPJ</label>
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => getCNPJ(e)} {...register("cnpj")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-3 mb-2`}>
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
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>WhatsApp</label>
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("whatsapp")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-3 mb-2`}>
                    <label className={`label slim-label-primary`}>E-mail</label>
                    <input {...register("email", { pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "E-mail inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-1 mb-2`}>
                    <label className={`label slim-label-primary`}>Vigência</label>
                    <input {...register("effectiveDate")} type="date" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-1 mb-2`}>
                    <label className={`label slim-label-primary`}>Limite de Consumo</label>
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskMoney(e)} {...register("consumptionLimit")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div> 
                {/* <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>Tabela de Negociação</label>
                    <select {...register("tradingTable")} className="select slim-select-primary">
                        <option value="">Selecione</option>
                        {
                            tradingTables.map((x: TTradingTable) => {
                                return <option key={x.id} value={x.id}>{x.name}</option>
                            })
                        }
                        
                    </select>
                </div>    */}
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>Faturamento</label>
                    <select {...register("billingId")} className="select slim-select-primary">
                        <option value="">Selecione</option>
                        {
                            billings.map((x: TBilling) => {
                                return <option key={x.id} value={x.id}>{x.name}</option>
                            })
                        }
                        
                    </select>
                </div>   
                <div className={`flex flex-col col-span-1 mb-2`}>
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
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>Bairro</label>
                    <input {...register("address.neighborhood")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-1 mb-2`}>
                    <label className={`label slim-label-primary`}>Cidade</label>
                    <input {...register("address.city")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2 col-span-1`}>
                    <label className={`label slim-label-primary`}>Estado</label>
                    <input {...register("address.state")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-3 mb-2`}>
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