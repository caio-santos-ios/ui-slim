"use client";

import { convertNumberMoney } from "@/utils/convert.util";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";

type TProps = {
    recentPatients: any[]
}

export const RecentPatient = ({recentPatients}: TProps) => {
    return (
        <ul className="grid grid-cols-4 gap-6">
            {
                recentPatients.map((x: any, i: number) => {
                    return (
                        <li key={i} className="p-4 bg-gray-100 shadow-lg shadow-gray-500/50 rounded-md">
                            <p className="font-semibold text-lg text-gray-500">Total de Clientes</p>
                        </li>
                    )
                })
            }
        </ul>       
    )
}