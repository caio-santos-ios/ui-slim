"use client";

import { api } from "@/service/api.service";
import { resolveResponse } from "@/service/config.service";
import { TLogin } from "@/types/auth/auth.type";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form"
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Button } from "../Global/Button";

export default function SignInForm() {
  const [passwordEnabled, setPasswordEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();
  const { register, handleSubmit, formState: { errors }} = useForm<TLogin>();
  
  const login: SubmitHandler<TLogin> = async (body: TLogin) => {
    try {
      setIsLoading(true);
      const {data} = await api.post(`/auth/login`, body);
      const result = data.result.data;

      localStorage.setItem("token", result.token);
      localStorage.setItem("name", result.name);
      localStorage.setItem("admin", result.admin);
      localStorage.setItem("photo", result.photo);
      localStorage.setItem("modules", JSON.stringify(result.modules));
      router.push("/");
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Login
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Digite seu e-mail e senha para entrar!
            </p>
          </div>
          <div>            
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>              
            </div>
            <form onSubmit={handleSubmit(login)}>
              <div className="space-y-6">
                <input className="custom-input" type="text" />
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
                  <Button type="submit" isLoading={isLoading} text="Entrar" theme="primary" styleClassBtn="w-full p-3 mb-8"/>
    
                  <div className="text-center font-normal">Esqueceu a senha? <a className="font-bold text-blue-600" href="reset-password">Recuperar senha</a></div>
                {/* <div>
                  <LabelForm label="E-mail" />
                  <InputForm {...register("email")} />
                </div>
                <div>
                  <LabelForm label="Senha" />
                  <div className="relative">
                    <InputForm type={showPassword ? "text" : "password"} {...register("password")} />
                    <span onClick={() => setShowPassword(!showPassword)} className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2" >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">                  
                  <Link
                    href="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
                <div>
                  <Button className="w-full" size="sm">
                    Entrar
                  </Button>
                </div> */}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
