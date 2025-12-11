"use client";

import "@/styles/slim-input.css";
import "@/styles/globals.css";
import { Button } from "@/components/Global/Button"
import { Logo } from "@/components/Global/logo"
import { api } from "@/service/api.service";
import { resolveResponse } from "@/service/config.service";
import { TLogin } from "@/types/auth/auth.type";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { InputForm } from "@/components/Global/InputForm";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export const FormResetPassword = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [passwordEnabled, setPasswordEnabled] = useState<boolean>(true);
    const [requestCode, setRequestCode] = useState<boolean>(false);
    const router = useRouter();

    const { register, handleSubmit, reset, formState: { errors }} = useForm<TLogin>();

    const submit: SubmitHandler<TLogin> = async (body: TLogin) => {
        if(body.codeAccess) {
            await resetPassword(body)
        } else {
            await requestForgotPassword(body)
        }
    };

    const requestForgotPassword = async (body: TLogin) => {
        try {
            setIsLoading(true);
            const {data} = await api.put(`/auth/request-forgot-password`, body);
            toast.success(data.message, {
                theme: 'colored'
            });
            setRequestCode(true);
            reset({email: "", password: "", codeAccess: ""});
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (body: TLogin) => {
        try {
            setIsLoading(true);
            const {data} = await api.put(`/auth/forgot-password`, {codeAccess: body.codeAccess, newPassword: body.password});

            toast.success(data.message, {
                theme: 'colored'
            });
            reset({email: "", password: ""});
            setTimeout(() => {
                router.push("/");
            }, 2000)
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="px-3 py-6 slim-form-login shadow-gray-400 shadow-xl">
            <Logo width={400} height={400} />
            {
                requestCode ?
                <>
                    <div className={`flex flex-col mb-2`}>
                        <label className={`label slim-label-primary`} htmlFor='codeAccess'>Código de Acesso</label>
                        <input {...register("codeAccess")} name="codeAccess" type="text" className={`input slim-input-primary`} placeholder="Digite o código"/>
                    </div>
                    <div className="text-red-500 min-h-6">{errors.codeAccess && errors.codeAccess.message}</div>
                    
                    <div className="mb-2">
                        <label className="slim-label-primary" htmlFor="password">Senha</label>

                        <div className={`container-password rounded-md flex items-center pr-2 ${errors.password ? 'border border-red-500 text-red-500' : 'slim-input-primary'}`}>
                            <input {...register("password", { required: "Senha é obrigatória",
                                pattern: {
                                    value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                    message: "A senha deve ter mínimo 8 caracteres, 1 letra, 1 número e 1 caractere especial."
                                }
                                })} id="password" placeholder="Digite sua senha" className="py-[.4rem] px-2 w-full" type={`${passwordEnabled ? 'text' : 'password'}`} />
                            {
                                passwordEnabled ? <FaEye onClick={() => setPasswordEnabled(!passwordEnabled)} size={25}/> : <FaEyeSlash onClick={() => setPasswordEnabled(!passwordEnabled)} size={25}/>
                            }
                        </div>
                        <div className="text-red-500 min-h-6">{errors.password && errors.password.message}</div>
                    </div>
                </>
                :
                <>
                    <InputForm {...register("email", { required: "E-mail é obrigatório",  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "E-mail inválido"} })} name="email" placeholder="Digite seu e-mail" title="E-mail" themeInputStyle={`${errors.email ? 'border border-red-500' : 'primary'}`} styleClass="mb-0" />
                    <div className="text-red-500 min-h-6 mb-1">{errors.email && errors.email.message}</div>
                </>
            }
            <Button isLoading={isLoading} text={requestCode ? 'Salvar senha' : 'Enviar Código'} theme="primary" styleClassBtn="w-full p-3 mb-8"/>
            <div className="text-center font-normal">Recuperou a senha {isLoading}? <a className="font-bold text-blue-600" href="/">Fazer login</a></div>
        </form>
    )
}