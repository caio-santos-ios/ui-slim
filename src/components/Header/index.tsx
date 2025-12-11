"use client";

import "./style.css";
import { menuOpenAtom } from "@/jotai/global/menu.jotai";
import { useAtom } from "jotai";
import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";
import { HiMenuAlt2 } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";

export const Header = () => {
    const [isOpenMenu, setIsOpenMenu] = useAtom(menuOpenAtom)

    return (
        <header className="flex items-center justify-between px-8 lg:px-28">
            <div className="lg:hidden" onClick={() => setIsOpenMenu(!isOpenMenu)}>
                {
                    isOpenMenu ? <IoMdClose size={25} /> : <HiMenuAlt2 size={25} />
                }
                
                
            </div>

            <Image
                src="/assets/images/logo.png"
                alt="Logo"
                width={150}
                height={150}
            />

            <div className="flex items-center gap-3">
                <FaUserCircle size={50} />
                <div>
                    <h4 className="text-lg font-semibold hidden lg:block">Thiago Admin</h4>
                    <span className="text-md text-gray-500 hidden lg:block">Administrador</span>
                </div>                
            </div>
        </header>
    )
}