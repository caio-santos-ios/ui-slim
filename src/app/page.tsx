"use client";

import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { api } from "@/service/api.service";
import { resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { SubmitHandler, useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { TLogin } from "@/types/auth/auth.type";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Autorization } from "@/components/Global/Autorization";
import { Logo } from "@/components/Global/logo";
import { InputForm } from "@/components/Global/InputForm";
import { Button } from "@/components/Global/Button";

export default function Home() {
    const [userLogger] = useAtom(userLoggerAtom);
    const [passwordEnabled, setPasswordEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<TLogin>();

    const login: SubmitHandler<TLogin> = async (body) => {
        try {
            setIsLoading(true);
            const { data } = await api.post(`/auth/login`, body);
            const result = data.result.data;
            localStorage.setItem("role", result.role);
            localStorage.setItem("token", result.token);
            localStorage.setItem("name", result.name);
            localStorage.setItem("admin", result.admin);
            localStorage.setItem("photo", result.photo);
            localStorage.setItem("modules", JSON.stringify(result.modules));
            router.push("/dashboard");
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Autorization path="login" />
            {!userLogger && (
                <main className="min-h-dvh slim-container-new flex">
                    <div
                        className="hidden lg:flex lg:w-[44%] flex-col justify-between p-12 relative overflow-hidden"
                        style={{ background: "linear-gradient(155deg, #003366 0%, #002952 50%, #001f40 100%)" }}>
                        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-[0.07]"
                            style={{ background: "radial-gradient(circle, #66CC99, transparent)", transform: "translate(30%, -30%)" }} />
                        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-[0.06]"
                            style={{ background: "radial-gradient(circle, #66CC99, transparent)", transform: "translate(-30%, 30%)" }} />
                        <div className="absolute top-1/2 right-0 w-px h-3/4 opacity-20"
                            style={{ background: "linear-gradient(to bottom, transparent, #66CC99, transparent)", transform: "translateY(-50%)" }} />

                        <div className="absolute top-24 right-16 w-2 h-2 rounded-full bg-[#66CC99] opacity-60" />
                        <div className="absolute top-36 right-10 w-1 h-1 rounded-full bg-[#66CC99] opacity-40" />
                        <div className="absolute bottom-32 left-16 w-1.5 h-1.5 rounded-full bg-[#66CC99] opacity-50" />

                        <div className="relative z-10 flex justify-center">
                            <img
                                className="w-28 h-28 max-w-full max-h-full object-contain"
                                src="/erp/assets/images/logo-light.png"
                                alt="Logo"
                            />
                        </div>

                        <div className="relative z-10 flex justify-center items-center flex-col">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#66CC99]/30 bg-[#66CC99]/10 mb-6">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#66CC99] animate-pulse" />
                                <span className="text-[#66CC99] text-xs font-semibold tracking-wide">Sistema ERP de Saúde</span>
                            </div>
                            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight">
                                Bem-vindo ao<br />
                                <span style={{ color: "#66CC99" }}>Pasbem</span>
                            </h1>
                            <p className="text-[#7A9BBF] text-base leading-relaxed max-w-sm">
                                Sistema completo de gestão de saúde. Gerencie clientes, beneficiários, agendamentos e financeiro em um só lugar.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-2">
                                {["Cadastros", "Atendimentos", "Financeiro"].map(f => (
                                    <span key={f} className="px-3 py-1 rounded-full text-xs font-semibold border border-[#66CC99]/25 text-[#66CC99]/80 bg-[#66CC99]/10">
                                        {f}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="relative z-10">
                            <p className="text-[#4E6B8A] text-xs text-center">
                                © {new Date().getFullYear()} Pasbem. Todos os direitos reservados.
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[var(--surface-bg)]">
                        <div className="w-full max-w-md">
                            <div className="flex justify-center mb-8 lg:hidden">
                                <Logo className="h-12" />
                            </div>

                            <div className="slim-form-login">
                                <div className="mb-7">
                                    <div className="mt-3 flex gap-1">
                                        <div className="h-0.5 w-8 rounded-full bg-[var(--primary-color)]" />
                                        <div className="h-0.5 w-4 rounded-full bg-[var(--accent-color)]" />
                                        <div className="h-0.5 w-2 rounded-full bg-[var(--accent-color)]/40" />
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit(login)} className="space-y-5" noValidate>
                                    <div>
                                        <InputForm
                                            {...register("email", {
                                                required: "E-mail é obrigatório",
                                                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "E-mail inválido" },
                                            })}
                                            name="email"
                                            placeholder="seu@email.com"
                                            title="E-mail"
                                            themeInputStyle={errors.email ? "border border-red-500" : "primary"}
                                        />
                                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                                    </div>

                                    <div>
                                        <label className="slim-label-primary" htmlFor="password">Senha</label>
                                        <div className={`relative flex items-center rounded-[var(--radius-sm)] border-[1.5px] transition-all ${errors.password ? "border-red-500" : "border-[var(--surface-border)] focus-within:border-[var(--accent-color)] focus-within:shadow-[0_0_0_3px_rgba(102,204,153,.18)]"} bg-[var(--surface-card)]`}>
                                            <input
                                                {...register("password", { required: "Senha é obrigatória" })}
                                                id="password"
                                                placeholder="••••••••"
                                                className="flex-1 py-[.5rem] px-3 text-sm bg-transparent outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                                                style={{ border: "none", boxShadow: "none", width: "100%", height: "auto" }}
                                                type={passwordEnabled ? "text" : "password"}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setPasswordEnabled(!passwordEnabled)}
                                                className="px-3 text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors"
                                                style={{ background: "transparent", border: "none", boxShadow: "none", height: "auto", padding: "0 .75rem" }}
                                            >
                                                {passwordEnabled ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                                    </div>

                                    <div className="flex items-center justify-end">
                                        <a href="/erp/reset-password" className="text-xs font-semibold text-[var(--accent-color)] hover:underline transition-all">
                                            Esqueceu a senha?
                                        </a>
                                    </div>

                                    <Button
                                        type="submit"
                                        isLoading={isLoading}
                                        text="Entrar"
                                        theme="primary"
                                        styleClassBtn="w-full h-11 text-base justify-center"
                                    />
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            )}
        </>
    );
}
