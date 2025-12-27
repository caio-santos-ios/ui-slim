"use client";

import { convertNumberMoney } from "@/utils/convert.util";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";

type TProps = {
    cardFirst: any
}

export const FirstCard = ({cardFirst}: TProps) => {
    return (
        <ul className="grid grid-cols-4 gap-6">
            <li className="p-4 bg-gray-100 shadow-lg shadow-gray-500/50 rounded-md">
                <p className="font-semibold text-lg text-gray-500">Total de Clientes</p>
                <strong>{cardFirst.customer}</strong>
            </li>

            <li className="p-4 bg-gray-100 shadow-lg shadow-gray-500/50 rounded-md">
                <p className="font-semibold text-lg text-gray-500">Total de Beneficiários</p>
                <strong>{cardFirst.recipient}</strong>
            </li>         

            <li className="p-4 bg-gray-100 shadow-lg shadow-gray-500/50 rounded-md">
                <p className="font-semibold text-lg text-gray-500">Contas a Receber</p>
                <div className="flex justify-between">
                    <div className="flex flex-col">
                    <strong>R$ {convertNumberMoney(cardFirst.accountReceivableMonth)}</strong>
                    <span className={`text-sm flex items-center gap-1 ${cardFirst.percentageChangeMonth == 0 ? '' : cardFirst.percentageChangeMonth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {cardFirst.percentageChangeMonth}%
                        {
                        cardFirst.percentageChangeMonth > 0 ? <FaArrowTrendUp /> : <FaArrowTrendDown />
                        }
                    </span>
                    </div>
                    <strong>Mês: {new Date().getUTCMonth() + 1}/{new Date().getUTCFullYear()}</strong>
                </div>
            </li>

            <li className="p-4 bg-gray-100 shadow-lg shadow-gray-500/50 rounded-md">
                <p className="font-semibold text-lg text-gray-500">Contas a Receber</p>
                <div className="flex justify-between">
                    <div className="flex flex-col">
                    <strong>R$ {convertNumberMoney(cardFirst.accountReceivableYear)}</strong>
                    <span className={`text-sm flex items-center gap-1 ${cardFirst.percentageChangeYear == 0 ? '' : cardFirst.percentageChangeYear > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {cardFirst.percentageChangeYear}%
                        {
                        cardFirst.percentageChangeYear > 0 ? <FaArrowTrendUp /> : <FaArrowTrendDown />
                        }
                    </span>
                    </div>
                    <strong>Ano: {new Date().getUTCFullYear()}</strong>
                </div>
            </li>
        </ul>       
    )
}