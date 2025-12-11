"use client";

import "./style.css";
import { ReactNode } from "react";
import { SlOptionsVertical } from "react-icons/sl";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

type TProp = {
    children: ReactNode;
    buttons: ReactNode;
}

export const Card = ({children, buttons}: TProp) => {
    return (
        <li className="flex relative justify-between px-3 py-2 shadow-md rounded-md">
            <div>{children}</div>
            <Menu>
                <MenuButton className="inline-flex items-center gap-2 rounded-md slim-bg-primary px-2 py-0 text-sm/6 font-semibold text-white shadow-inner">
                    <SlOptionsVertical />
                </MenuButton>

                <MenuItems
                    transition
                    anchor="bottom end"
                    className="w-52 origin-top-right rounded-xl border border-white slim-bg-primary p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0">
                    {buttons}                      
                </MenuItems>
            </Menu>
        </li>
    )
}