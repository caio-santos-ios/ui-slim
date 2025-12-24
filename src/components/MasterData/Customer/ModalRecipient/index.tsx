"use client";

import "./style.css";
import { SubmitHandler, useForm } from "react-hook-form";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { Button } from "@/components/Global/Button";
import { maskCNPJ, maskCPF, maskDate, maskPhone } from "@/utils/mask.util";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import axios from "axios";
import { TGenericTable } from "@/types/masterData/genericTable/genericTable.type";
import { TSeller } from "@/types/masterData/seller/seller.type";
import { ResetCustomerRecipient, TRecipient } from "@/types/masterData/customers/customerRecipient.type";
import { ModalDelete } from "@/components/Global/ModalDelete";
import { TPlan } from "@/types/masterData/plans/plans.type";
import { toast } from "react-toastify";
import { modalGenericTableAtom, tableGenericTableAtom } from "@/jotai/global/modal.jotai";
import { FaCirclePlus } from "react-icons/fa6";
import { ModalGenericTable } from "@/components/Global/ModalGenericTable";

type TProp = {
    isOpen: boolean;
    onClose: () => void;
    contractorId: string;
    contractorType: string;
}

export const ModalRecipient = ({contractorId, contractorType, onClose, isOpen}: TProp) => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [__, setModalGenericTable] = useAtom(modalGenericTableAtom);
    const [___, setTableGenericTable] = useAtom(tableGenericTableAtom);
    const [modalDelete, setModalDelete] = useState<boolean>(false);
    const [origins, setOrigin] = useState<TGenericTable[]>([]);
    const [genders, setGender] = useState<TGenericTable[]>([]);
    const [plans, setPlan] = useState<TPlan[]>([]);
    const [customerRecipients, setCustomerRecipient] = useState<any[]>([]);
    const [currentId, setCureentId] = useState<string>("");
    const [tabCurrent, setTabCurrent] = useState<"data" | "dataResponsible" | "contact" | "seller" | "attachment" | "dataBank">("data")
    const { register, handleSubmit, reset, getValues, watch, formState: { errors }} = useForm<TRecipient>();
    

    const onSubmit: SubmitHandler<TRecipient> = async (body: TRecipient) => {
        if(!contractorId) return toast.warn("Contratante é obrigatório", { theme: 'colored'});

        body.contractorId = contractorId;
        if(body.dateOfBirth) body.dateOfBirth = new Date(body.dateOfBirth);
        if(!body.dateOfBirth) body.dateOfBirth = null;
        
        if(!body.id) {
            await create(body);
        } else {
            await update(body);
        }

        await getRecipient();
        cancel();
    };

    const create = async (body: TRecipient) => {
        try {
            body.address.parent = "contract";
            const { status, data} = await api.post('/customer-recipients', body, configApi());
            resolveResponse({status, ...data});
        } catch (error) {
            resolveResponse(error);
        }
    };

    const update = async (body: TRecipient) => {
        try {
            const { status, data} = await api.put(`/customer-recipients`, body, configApi());
            resolveResponse({status, ...data});
        } catch (error) {
            resolveResponse(error);
        }
    };

    const destroy = async () => {
        try {
        const { status } = await api.delete(`/customer-recipients/${currentId}`, configApi());
            resolveResponse({status, message: "Excluído com sucesso"});
            setModalDelete(false);
            await getRecipient();
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
                parent: "customer-recipient",
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
                const body: TRecipient = {...getValues()};
                reset(ResetCustomerRecipient)
            } catch (error) {
                resolveResponse(error);
            }   finally {
                setLoading(false);
            }
        }
    };

    const cancel = () => {
        reset(ResetCustomerRecipient);
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

    const getSelectPlan = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/plans?deleted=false&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=1&type=${contractorType}`, configApi());
            // const result = data.result;
            // setPlan(result.data ?? []);;
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };
    
    const getRecipient = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/customer-recipients?deleted=false&contractorId=${contractorId}&orderBy=createdAt&sort=desc&pageSize=100&pageNumber=1`, configApi());
            const result = data.result;
            setCustomerRecipient(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentBody = (recipient: TRecipient) => {
        if(recipient.dateOfBirth) {
            recipient.dateOfBirth = recipient.dateOfBirth.split("T")[0];
        };

        reset(recipient);
    };
    
    const getDestroy = (id: string) => {
        setCureentId(id);
        setModalDelete(true);
    };
    
    const genericTable = (table: string) => {
        setModalGenericTable(true);
        setTableGenericTable(table);
    };

    const onReturnGeneric = () => {
        getSelectOrigin();
        getSelectGender();
    };
    
    useEffect(() => {
        reset();
        setTabCurrent("data");
        getSelectPlan();
        getRecipient();
        onReturnGeneric();
    }, []);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="card-modal">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 mb-2">
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>CPF</label>
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskCPF(e)} {...register("cpf")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                        <label className={`label slim-label-primary`}>RG</label>
                    <input maxLength={18} {...register("rg" )} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>Nome</label>
                    <input {...register("name")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>E-mail</label>
                    <input {...register("email", { pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "E-mail inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Telefone</label>
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("phone")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>WhatsApp</label>
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("whatsapp")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>        
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Data de Nascimento</label>
                    <input {...register("dateOfBirth")} type="date" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary flex gap-1 items-center`}>Gênero <span onClick={() => genericTable("genero")} className="pr-2 cursor-pointer"><FaCirclePlus /></span> </label>
                    <select className="select slim-select-primary" {...register("gender")}>
                        <option value="">Selecione</option>
                        {
                            genders.map((x: any) => {
                                return <option key={x.code} value={x.code}>{x.description}</option>
                            })
                        }
                    </select>
                </div>                
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Plano</label>
                    <select className="select slim-select-primary" {...register("planId")}>
                        <option value="">Selecione</option>
                        {
                            plans.map((x: any) => {
                                return <option key={x.id} value={x.id}>{x.name}</option>
                            })
                        }
                    </select>
                </div>               
                {
                    contractorType == "B2B" &&
                    <div className={`flex flex-col mb-2`}>
                        <label className={`label slim-label-primary`}>Vínculo</label>
                        <select className="select slim-select-primary" {...register("bond")}>
                            <option value="Titular">Titular</option>                       
                            <option value="Dependente">Dependente</option>                       
                        </select>
                    </div>               
                }
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>CEP</label>
                    <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => getAddressByZipCode(e, '')} {...register("address.zipCode", {minLength: {value: 8, message: "CEP inválido"}})} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col mb-2`}>
                    <label className={`label slim-label-primary`}>Número</label>
                    <input {...register("address.number")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-2 mb-2`}>
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
                <div className={`flex flex-col col-span-1 mb-2`}>
                    <label className={`label slim-label-primary`}>Estado</label>
                    <input {...register("address.state")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-2 mb-2`}>
                    <label className={`label slim-label-primary`}>Complemento</label>
                    <input {...register("address.complement")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col ${contractorType == "B2B" ? 'col-span-2' : 'col-span-3'} mb-2`}>
                    <label className={`label slim-label-primary`}>Observações</label>
                    <input {...register("notes")} type="text" className={`input slim-input-primary`} placeholder="Digite"/>
                </div>               
            </div>
            
            <div className="flex justify-end gap-2 w-12/12 mt-3 mb-4">
                <Button type="button" click={cancel} text="Cancelar" theme="primary-light" styleClassBtn=""/>
                <Button type="submit" text={`${watch("id") ? 'Salvar' : 'Adicionar'}`} theme="primary" styleClassBtn=""/>
            </div>

            <div className="grid grid-cols-1 gap-2 mb-2">
                <div className="w-full overflow-x-auto hidden lg:block">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tl-xl`}>Nome</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>CPF</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Data de Nascimento</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Gênero</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>Telefone</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>E-mail</th>
                                <th scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider rounded-tr-xl`}>Ações</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-100">
                            {
                                customerRecipients.map((x: any) => {
                                    return (
                                        <tr key={x.id}>
                                           
                                            <td className="px-4 py-2">{x.name}</td>
                                            <td className="px-4 py-2">{x.cpf}</td>
                                            <td className="px-4 py-2">{maskDate(x.dateOfBirth)}</td>
                                            <td className="px-4 py-2">{x.genderDescription}</td>
                                            <td className="px-4 py-2">{x.phone}</td>
                                            <td className="px-4 py-2">{x.email}</td>
                                            <td className="p-2">
                                                <div className="flex gap-3">
                                                    <div onClick={() => getCurrentBody(x)} className="cursor-pointer text-yellow-400 hover:text-yellow-500">
                                                        <MdEdit />
                                                    </div>
                                                    <div onClick={() => getDestroy(x.id)} className="cursor-pointer text-red-400 hover:text-red-500">
                                                        <FaTrash />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="flex justify-end gap-2 w-12/12 mt-3 mb-4">
                <Button type="button" click={onClose} text="Fechar" theme="primary-light" styleClassBtn=""/>
            </div>

            <ModalDelete
                title='Excluír Beneficiário'
                isOpen={modalDelete} setIsOpen={() => setModalDelete(!modalDelete)} 
                onClose={() => setModalDelete(false)}
                onSelectValue={destroy}
            />  

            <ModalGenericTable onReturn={onReturnGeneric} /> 
        </form>
    )
}