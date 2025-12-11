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
  const [passwordEnabled, setPasswordEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  
  const { register, handleSubmit, reset, formState: { errors }} = useForm<TLogin>();

  const login: SubmitHandler<TLogin> = async (body: TLogin) => {
    try {
      setIsLoading(true);
      const {data} = await api.post(`/auth/login`, body);

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("name", data.data.name);
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
      {
        !userLogger &&
        <main className="h-dvh slim-bg-secondary">
          <div className="w-11/12 h-12/12 lg:max-w-md m-auto flex flex-col justify-center">
            <form onSubmit={handleSubmit(login)} className="px-3 py-6 slim-form-login shadow-gray-400 shadow-xl">
              <Logo width={400} height={400} />
              <InputForm {...register("email", { required: "E-mail é obrigatório",  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "E-mail inválido"} })} name="email" placeholder="Digite seu e-mail" title="E-mail" themeInputStyle={`${errors.email ? 'border border-red-500' : 'primary'}`} styleClass="mb-0" />
              <div className="text-red-500 min-h-6 mb-1">{errors.email && errors.email.message}</div>

              <div className="mb-2">
                <label className="slim-label-primary" htmlFor="password">Senha</label>

                <div className={`container-password rounded-md flex items-center pr-2 ${errors.password ? 'border border-red-500 text-red-500' : 'slim-input-primary'}`}>
                  <input {...register("password", { required: "Senha é obrigatória" })} id="password" placeholder="Digite sua senha" className="py-[.4rem] px-2 w-full" type={`${passwordEnabled ? 'text' : 'password'}`} />
                  {
                    passwordEnabled ? <FaEye onClick={() => setPasswordEnabled(!passwordEnabled)} size={25}/> : <FaEyeSlash onClick={() => setPasswordEnabled(!passwordEnabled)} size={25}/>
                  }
                </div>
                <div className="text-red-500 min-h-6">{errors.password && errors.password.message}</div>
              </div>
              <Button isLoading={isLoading} text="Entrar" theme="primary" styleClassBtn="w-full p-3 mb-8"/>

              <div className="text-center font-normal">Esqueceu a senha? <a className="font-bold text-blue-600" href="reset-password">Recuperar senha</a></div>
            </form>
          </div>
        </main>
      }
    </>
  );
}
