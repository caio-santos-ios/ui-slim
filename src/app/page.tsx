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

    const { register, handleSubmit, reset, formState: { errors } } = useForm<TLogin>();

    const login: SubmitHandler<TLogin> = async (body) => {
        try {
            setIsLoading(true);
            const { data } = await api.post(`/auth/login`, body);
            const result = data.result.data;
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
                    {/* Left panel — branding */}
                    <div
                        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
                        style={{ background: "linear-gradient(145deg, #339966 0%, #3C50E0 100%)" }}
                    >
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #fff, transparent)", transform: "translate(30%, -30%)" }} />
                        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #fff, transparent)", transform: "translate(-30%, 30%)" }} />
                        <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #818CF8, transparent)", transform: "translate(-50%, -50%)" }} />

                        {/* Top logo */}
                        <div className="relative z-10">
                            <Logo className="h-20" />
                        </div>

                        {/* Center text */}
                        <div className="relative z-10">
                            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                                Bem-vindo ao<br />
                                <span className="text-[#A5B4FC]">SLIM Saúde ERP</span>
                            </h1>
                            <p className="text-[#8D99A8] text-base leading-relaxed max-w-sm">
                                Sistema completo de gestão de saúde. Gerencie clientes, beneficiários, agendamentos e financeiro em um só lugar.
                            </p>
                        </div>

                        {/* Bottom tagline */}
                        <div className="relative z-10">
                            <p className="text-[#4B5967] text-sm">
                                © {new Date().getFullYear()} SLIM Saúde. Todos os direitos reservados.
                            </p>
                        </div>
                    </div>

                    {/* Right panel — form */}
                    <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[var(--surface-bg)]">
                        <div className="w-full max-w-md">
                            {/* Mobile logo */}
                            <div className="flex justify-center mb-8 lg:hidden">
                                <Logo className="h-12" />
                            </div>

                            <div className="slim-form-login">
                                {/* <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Entrar na conta</h2>
                                    <p className="text-sm text-[var(--text-muted)]">Digite suas credenciais para acessar o sistema</p>
                                </div> */}

                                <form onSubmit={handleSubmit(login)} className="space-y-5" noValidate>
                                    {/* Email */}
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

                                    {/* Password */}
                                    <div>
                                        <label className="slim-label-primary" htmlFor="password">Senha</label>
                                        <div className={`relative flex items-center rounded-[var(--radius-sm)] border-[1.5px] transition-all ${errors.password ? "border-red-500" : "border-[var(--surface-border)] focus-within:border-[var(--primary-color)] focus-within:shadow-[0_0_0_3px_rgba(60,80,224,.12)]"} bg-[var(--surface-card)]`}>
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
                                                className="px-3 text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors"
                                                style={{ background: "transparent", border: "none", boxShadow: "none", height: "auto", padding: "0 .75rem" }}
                                            >
                                                {passwordEnabled ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                                    </div>

                                    {/* Forgot + submit */}
                                    <div className="flex items-center justify-end">
                                        <a href="/reset-password" className="text-xs font-medium text-white hover:underline">
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
