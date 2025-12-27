"use client";

import "./style.css";
import { menuOpenAtom } from "@/jotai/global/menu.jotai";
import { useAtom } from "jotai";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { HiMenuAlt2 } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import { Button } from "../Button";
import { api, uriBase } from "@/service/api.service";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { configApi, resolveResponse } from "@/service/config.service";

export const Header = () => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [isOpenMenu, setIsOpenMenu] = useAtom(menuOpenAtom)
    const [name, setName] = useState<string>("");
    const [photo, setPhoto] = useState<string>("");
    const [__, setUserAdmin] = useState(false);
    const [sincron, setSincron] = useState<boolean>(false)

    const sincLogged = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/users/logged`, configApi());
            const result = data.result;
            localStorage.setItem("photo", result.data.photo);
            localStorage.setItem("admin", result.data.admin);
            localStorage.setItem("modules", JSON.stringify(result.data.modules));
            setSincron(false);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const name = localStorage.getItem("name");
        const admin = localStorage.getItem("admin");
        const photo = localStorage.getItem("photo");

        if(admin) setUserAdmin(admin == "true");
        if(name) setName(name);
        if(photo) setPhoto(photo);
    }, [])

    return (
        <header className="flex items-center justify-between px-8 lg:px-28">
            <div className="lg:hidden" onClick={() => setIsOpenMenu(!isOpenMenu)}>
                {
                    isOpenMenu ? <IoMdClose size={25} /> : <HiMenuAlt2 size={25} />
                }               
            </div>

            <a href="dashboard">
                <Image
                    src="/assets/images/logo.png"
                    alt="Logo"
                    width={150}
                    height={150}
                />
            </a>

            <div className="flex items-center gap-3 container-profile-header">
                <div className="relative">
                    {
                        photo ? 
                        <img onClick={() => setSincron(!sincron)} className="rounded-full object-cover h-18" src={`${uriBase}/${photo}`} alt="" />
                        :
                        <FaUserCircle onClick={() => setSincron(!sincron)} size={50} />
                    }
                    {
                        sincron &&
                        <div className="absolute -right-8">
                            <Button click={sincLogged} text="Sincronizar" />
                        </div>
                    }
                </div>

                <div>
                    <h4 className="text-lg font-semibold hidden lg:block">{name}</h4>
                </div>                
            </div>
        </header>
    )
}