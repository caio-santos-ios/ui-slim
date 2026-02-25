"use client";

import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useAtom } from "jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { modalGenericTableAtom, tableGenericTableAtom } from "@/jotai/global/modal.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { Button } from "@/components/Global/Button";
import { ModalDelete } from "@/components/Global/ModalDelete";
import { ModalGenericTable } from "@/components/Global/ModalGenericTable";
import {
    maskCPF, maskDate, maskMoney, maskPhone,
} from "@/utils/mask.util";
import {
    convertMoneyToNumber,
    convertNumberMoney,
} from "@/utils/convert.util";
import { ResetCustomerRecipient, TRecipient } from "@/types/masterData/customers/customerRecipient.type";
import { TGenericTable } from "@/types/masterData/genericTable/genericTable.type";
import { TPlan } from "@/types/masterData/plans/plans.type";
import { FaCirclePlus } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { LuCalendar, LuCreditCard, LuMail, LuPhone, LuUser, LuHouse } from "react-icons/lu";
import axios from "axios";
import { FaHome, FaPlus } from "react-icons/fa";

/* ─── Props ─────────────────────────────────── */
type TProp = {
    isOpen: boolean;
    recipientId: string;           // ID do beneficiário a editar
    contractorType?: string;       // "B2B" | "B2C"
    onClose: () => void;
    onSuccess: () => void;         // callback após salvar com sucesso
};

/* ─── Abas ──────────────────────────────────── */
type TTab = "dados" | "endereco" | "financeiro";

const TABS: { key: TTab; label: string; icon: any }[] = [
    { key: "dados",      label: "Dados Pessoais",  icon: LuUser },
    { key: "endereco",   label: "Endereço",         icon: LuHouse },
    { key: "financeiro", label: "Financeiro",       icon: LuCreditCard },
];

/* ─────────────────────────────────────────────
    Componente principal
───────────────────────────────────────────── */
export const ModalEditRecipient = ({
    isOpen,
    recipientId,
    contractorType = "",
    onClose,
    onSuccess,
}: TProp) => {
    const [_, setLoading]                   = useAtom(loadingAtom);
    const [__, setModalGenericTable]         = useAtom(modalGenericTableAtom);
    const [___, setTableGenericTable]        = useAtom(tableGenericTableAtom);

    const [tab, setTab]         = useState<TTab>("dados");
    const [genders, setGenders] = useState<TGenericTable[]>([]);
    const [plans, setPlans]     = useState<TPlan[]>([]);
    const [modalDel, setModalDel] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<TRecipient>({ defaultValues: ResetCustomerRecipient });

    /* ── Busca dados do beneficiário ── */
    const getById = async (id: string) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/customer-recipients/${id}`, configApi());
            const r: TRecipient = data.result.data;

            // Normaliza datas e valores monetários
            if (r.dateOfBirth)    r.dateOfBirth    = r.dateOfBirth.split("T")[0];
            if (r.effectiveDate)  r.effectiveDate  = r.effectiveDate.split("T")[0];
            r.subTotal  = convertNumberMoney(r.subTotal);
            r.total     = convertNumberMoney(r.total);
            r.discount  = convertNumberMoney(r.discount);

            reset(r);
        } catch (e) {
            resolveResponse(e);
        } finally {
            setLoading(false);
        }
    };

    /* ── Salvar ── */
    const onSubmit: SubmitHandler<TRecipient> = async (body) => {
        try {
            if (body.dateOfBirth)   body.dateOfBirth   = new Date(body.dateOfBirth);
            if (!body.dateOfBirth)  body.dateOfBirth   = null;
            if (body.effectiveDate) body.effectiveDate = new Date(body.effectiveDate);
            if (!body.effectiveDate) body.effectiveDate = null;

            body.subTotal            = convertMoneyToNumber(body.subTotal);
            body.discount            = convertMoneyToNumber(body.discount);
            body.discountPercentage  = body.discountPercentage || 0;
            body.total               = convertMoneyToNumber(body.total);

            const { status, data } = await api.put(`/customer-recipients`, body, configApi());
            resolveResponse({ status, ...data });
            onSuccess();
            handleClose();
        } catch (e) {
            resolveResponse(e);
        }
    };

    /* ── Excluir ── */
    const destroy = async () => {
        try {
            const { status } = await api.delete(`/customer-recipients/${recipientId}`, configApi());
            resolveResponse({ status, message: "Excluído com sucesso" });
            setModalDel(false);
            onSuccess();
            handleClose();
        } catch (e) {
            resolveResponse(e);
        }
    };

    /* ── CEP ── */
    const getAddressByZipCode = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length === 8) {
            setLoading(true);
            try {
                const { data } = await axios.get(`https://viacep.com.br/ws/${value}/json/`);
                const current = { ...getValues() };
                current.address = {
                    ...current.address,
                    city: data.localidade,
                    complement: data.complemento,
                    neighborhood: data.bairro,
                    state: data.estado,
                    street: data.logradouro,
                    zipCode: data.cep,
                };
                reset(current);
            } finally {
                setLoading(false);
            }
        }
    };

    /* ── Cálculos financeiros ── */
    const calcByDiscount = (e: React.ChangeEvent<HTMLInputElement>) => {
        maskMoney(e);
        const discount  = convertMoneyToNumber(e.target.value);
        const subTotal  = convertMoneyToNumber(watch("subTotal"));
        const total     = subTotal - discount;
        const pct       = subTotal > 0 ? (discount / subTotal) * 100 : 0;
        setValue("total",               total >= 0 ? convertNumberMoney(total) : "0,00");
        setValue("discountPercentage",  Math.trunc(pct * 100) / 100);
    };

    const calcByPct = (e: React.ChangeEvent<HTMLInputElement>) => {
        const pct       = parseFloat(e.target.value) || 0;
        const subTotal  = convertMoneyToNumber(watch("subTotal"));
        const discount  = (subTotal * pct) / 100;
        const total     = subTotal - discount;
        setValue("total",    total >= 0 ? convertNumberMoney(total) : "0,00");
        setValue("discount", convertNumberMoney(discount));
    };

    /* ── Selects auxiliares ── */
    const loadGenders = async () => {
        try {
            const { data } = await api.get(`/generic-tables/table/genero`, configApi());
            setGenders(data.result.data);
        } catch {}
    };

    const loadPlans = async () => {
        try {
            const filter = contractorType === "B2B" ? "B2C" : "B2B";
            const { data } = await api.get(
                `/plans?deleted=false&orderBy=createdAt&sort=desc&pageSize=200&pageNumber=1&ne$type=${filter}`,
                configApi()
            );
            setPlans(data.result.data ?? []);
        } catch {}
    };

    const handleClose = () => {
        reset(ResetCustomerRecipient);
        setTab("dados");
        onClose();
    };

    const calculatedAge = (birthDateString: string) => {
        const today = new Date();
        const birthDate = new Date(birthDateString);
        birthDate.setMinutes(birthDate.getMinutes() + birthDate.getTimezoneOffset());

        let age = today.getFullYear() - birthDate.getFullYear();
        const month = today.getMonth() - birthDate.getMonth();

        if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    useEffect(() => {
        const dateOfBirth = watch("dateOfBirth");
        if(dateOfBirth) {
            const year = parseInt(dateOfBirth.split("-")[0]);
            if(year.toString().length >= 4) {
                const age = calculatedAge(dateOfBirth);
                setValue("age", age);
            }
        }
    }, [watch("dateOfBirth")]);

    useEffect(() => {
        if (!isOpen) return;
        loadGenders();
        loadPlans();
        if (recipientId) getById(recipientId);
    }, [isOpen, recipientId]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) handleClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen]);

    return (
        <>
            <Dialog
                open={isOpen}
                as="div"
                className="relative z-999 focus:outline-none"
                onClose={handleClose}>
                <div
                    className="fixed inset-0 z-999"
                    style={{ background: "rgba(0,15,35,.65)", backdropFilter: "blur(5px)" }}
                />

                <div className="fixed inset-0 z-1000 flex items-start justify-center pt-14 px-4 pb-6 overflow-y-auto">
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
                            <div className="flex items-center gap-3">
                                <DialogTitle as="h2" className="text-sm font-bold text-white">
                                    Editar Beneficiário
                                </DialogTitle>
                            </div>
                            <span
                                onClick={handleClose}
                                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
                                style={{ background: "rgba(255,255,255,.1)", border: "none", boxShadow: "none", color: "rgba(255,255,255,.7)", cursor: "pointer" }}>

                                <IoClose size={18} />
                            </span>
                        </div>

                        {/* ── Tabs ── */}
                        <div
                            className="flex border-b overflow-x-auto"
                            style={{ background: "var(--surface-bg)", borderColor: "var(--surface-border)" }}
                        >
                            {TABS.map((t) => {
                                const Icon = t.icon;
                                const active = tab === t.key;
                                return (
                                    <button
                                        key={t.key}
                                        type="button"
                                        onClick={() => setTab(t.key)}
                                        className="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-all relative"
                                        style={{
                                            background: "transparent",
                                            border: "none",
                                            boxShadow: "none",
                                            height: "auto",
                                            borderRadius: 0,
                                            color: active ? "var(--accent-color)" : "var(--text-muted)",
                                            borderBottom: active ? "2.5px solid var(--accent-color)" : "2.5px solid transparent",
                                            marginBottom: "-1px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <Icon size={14} />
                                        {t.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* ── Form body ── */}
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100dvh - 22rem)" }}>

                                {/* ════ ABA: DADOS PESSOAIS ════ */}
                                {tab === "dados" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <Field label="Nome Completo" icon={<LuUser size={13} />} span={2}>
                                            <input {...register("name")} type="text" className="input slim-input-primary" placeholder="Nome do beneficiário" />
                                        </Field>

                                        <Field label="CPF">
                                            <input
                                                onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskCPF(e)}
                                                {...register("cpf")}
                                                type="text"
                                                className="input slim-input-primary"
                                                placeholder="000.000.000-00"
                                            />
                                        </Field>

                                        <Field label="RG">
                                            <input {...register("rg")} maxLength={18} type="text" className="input slim-input-primary" placeholder="Digite" />
                                        </Field>

                                        <Field label="Data de Nascimento" icon={<LuCalendar size={13} />}>
                                            <input {...register("dateOfBirth")} type="date" className="input slim-input-primary" />
                                        </Field>
                                        
                                        <Field label="Idade" icon={<LuCalendar size={13} />}>
                                            <input disabled {...register("age")} type="number" className="input slim-input-primary" />
                                        </Field>

                                        <Field label="Gênero">
                                            <div className="flex gap-1">
                                                <select className="select slim-select-primary flex-1" {...register("gender")}>
                                                    <option value="">Selecione</option>
                                                    {genders.map((g) => (
                                                        <option key={g.code} value={g.code}>{g.description}</option>
                                                    ))}
                                                </select>
                                                <div
                                                    onClick={() => { setModalGenericTable(true); setTableGenericTable("genero"); }}
                                                    className="shrink-0 w-9 h-9 rounded-md flex items-center justify-center transition-all"
                                                    style={{ background: "var(--accent-color-light)", border: "1px solid rgba(102,204,153,.3)", boxShadow: "none", color: "var(--accent-color)", cursor: "pointer" }}
                                                    title="Cadastrar gênero">
                                                    <FaPlus />
                                                </div>
                                            </div>
                                        </Field>

                                        <Field label="Telefone" icon={<LuPhone size={13} />}>
                                            <input
                                                onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)}
                                                {...register("phone")}
                                                type="text"
                                                className="input slim-input-primary"
                                                placeholder="(00) 00000-0000"
                                            />
                                        </Field>

                                        <Field label="WhatsApp">
                                            <input
                                                onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)}
                                                {...register("whatsapp")}
                                                type="text"
                                                className="input slim-input-primary"
                                                placeholder="(00) 00000-0000"
                                            />
                                        </Field>

                                        <Field label="E-mail" icon={<LuMail size={13} />} span={2}>
                                            <input
                                                {...register("email", {
                                                    pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "E-mail inválido" },
                                                })}
                                                type="text"
                                                className="input slim-input-primary"
                                                placeholder="email@exemplo.com"
                                            />
                                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                                        </Field>

                                        <Field label="Vínculo">
                                            <select className="select slim-select-primary" {...register("bond")}>
                                                <option value="Titular">Titular</option>
                                                <option value="Dependente">Dependente</option>
                                            </select>
                                        </Field>

                                        <Field label="Plano">
                                            <select className="select slim-select-primary" {...register("planId")}>
                                                <option value="">Selecione</option>
                                                {plans.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </Field>

                                        <Field label="Vigência" icon={<LuCalendar size={13} />}>
                                            <input {...register("effectiveDate")} type="date" className="input slim-input-primary" />
                                        </Field>

                                        <Field label="Observações" span={3}>
                                            <input {...register("notes")} type="text" className="input slim-input-primary" placeholder="Observações opcionais" />
                                        </Field>
                                    </div>
                                )}

                                {/* ════ ABA: ENDEREÇO ════ */}
                                {tab === "endereco" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                                        <Field label="CEP" span={1}>
                                            <input
                                                onInput={getAddressByZipCode}
                                                {...register("address.zipCode", { minLength: { value: 8, message: "CEP inválido" } })}
                                                type="text"
                                                className="input slim-input-primary"
                                                placeholder="00000-000"
                                            />
                                        </Field>

                                        <Field label="Número" span={1}>
                                            <input {...register("address.number")} type="text" className="input slim-input-primary" placeholder="Nº" />
                                        </Field>

                                        <Field label="Rua" span={4}>
                                            <input {...register("address.street")} type="text" className="input slim-input-primary" placeholder="Logradouro" />
                                        </Field>

                                        <Field label="Bairro" span={3}>
                                            <input {...register("address.neighborhood")} type="text" className="input slim-input-primary" placeholder="Bairro" />
                                        </Field>

                                        <Field label="Cidade" span={2}>
                                            <input {...register("address.city")} type="text" className="input slim-input-primary" placeholder="Cidade" />
                                        </Field>

                                        <Field label="Estado" span={1}>
                                            <input {...register("address.state")} type="text" className="input slim-input-primary" placeholder="UF" />
                                        </Field>

                                        <Field label="Complemento" span={6}>
                                            <input {...register("address.complement")} type="text" className="input slim-input-primary" placeholder="Apto, bloco, etc." />
                                        </Field>
                                    </div>
                                )}

                                {/* ════ ABA: FINANCEIRO ════ */}
                                {tab === "financeiro" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Info card */}
                                        <div className="col-span-full rounded-xl p-4 flex items-center gap-3"
                                            style={{ background: "var(--accent-color-light)", border: "1px solid rgba(102,204,153,.25)" }}>
                                            <LuCreditCard size={18} color="var(--accent-color)" className="shrink-0" />
                                            <p className="text-sm font-medium" style={{ color: "var(--accent-color)" }}>
                                                Ajuste os valores financeiros do beneficiário. O campo <strong>Total</strong> é calculado automaticamente.
                                            </p>
                                        </div>

                                        <Field label="SubTotal">
                                            <input
                                                onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskMoney(e)}
                                                {...register("subTotal")}
                                                type="text"
                                                className="input slim-input-primary"
                                                placeholder="0,00"
                                            />
                                        </Field>

                                        <Field label="Desconto R$">
                                            <input
                                                onInput={calcByDiscount}
                                                {...register("discount")}
                                                type="text"
                                                className="input slim-input-primary"
                                                placeholder="0,00"
                                            />
                                        </Field>

                                        <Field label="Desconto %">
                                            <input
                                                onInput={calcByPct}
                                                {...register("discountPercentage")}
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                className="input slim-input-primary"
                                                placeholder="0"
                                            />
                                        </Field>

                                        <Field label="Total">
                                            <input
                                                onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskMoney(e)}
                                                {...register("total")}
                                                type="text"
                                                className="input slim-input-primary font-bold"
                                                placeholder="0,00"
                                                style={{ fontWeight: 700, color: "var(--accent-color)" }}
                                            />
                                        </Field>
                                    </div>
                                )}
                            </div>

                            {/* ── Footer ── */}
                            <div
                                className="flex items-center justify-between px-6 py-3.5 border-t"
                                style={{ background: "var(--surface-bg)", borderColor: "var(--surface-border)" }}
                            >

                                {/* Ações à direita */}
                                <div className="flex justify-end items-center gap-2.5 w-full">
                                    {/* Navegação entre abas */}
                                    <div className="hidden sm:flex items-center gap-1 mr-3">
                                        {TABS.map((t, i) => (
                                            <button
                                                key={t.key}
                                                type="button"
                                                onClick={() => setTab(t.key)}
                                                className="w-2 h-2 rounded-full transition-all"
                                                style={{
                                                    background: tab === t.key ? "var(--accent-color)" : "var(--surface-border)",
                                                    border: "none",
                                                    boxShadow: "none",
                                                    padding: 0,
                                                    height: "0.5rem",
                                                    minWidth: "0.5rem",
                                                    cursor: "pointer",
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <Button type="button" click={handleClose} text="Cancelar" theme="secondary-light" />
                                    <Button type="submit" text="Salvar" theme="primary" isLoading={isSubmitting} />
                                </div>
                            </div>
                        </form>
                    </DialogPanel>
                </div>
            </Dialog>

            {/* Modal de confirmação de exclusão */}
            <ModalDelete
                title="Excluir Beneficiário"
                description={`Deseja excluir o beneficiário "${watch("name")}"? Esta ação não pode ser desfeita.`}
                isOpen={modalDel}
                setIsOpen={setModalDel}
                onClose={() => setModalDel(false)}
                onSelectValue={destroy}
            />

            {/* Modal de tabelas genéricas */}
            <ModalGenericTable onReturn={loadGenders} />
        </>
    );
};

/* ─── Helper: Field wrapper ─────────────────── */
function Field({
    label,
    children,
    span = 1,
}: {
    label: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    span?: number;
}) {
    return (
        <div className={`flex flex-col gap-1 ${span > 1 ? `col-span-${span}` : ""}`}>
            <label className="slim-label-primary flex items-center gap-1.5">
                <div>{label}</div>
            </label>
            {children}
        </div>
    );
}