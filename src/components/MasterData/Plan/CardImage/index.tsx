"use cliente";

import { uriBase } from "@/service/api.service";
import { convertInputStringMoney } from "@/utils/convert.util";
import { ReactNode } from "react";

type TProp = {
    title: string;
    subTitle?: string;
    cost: string;
    price: string;
    description: string;
    uriImage: string;
    alt: string;
    children: ReactNode;
}

export const CardImage = ({children, title, cost, price, description, uriImage, alt}: TProp) => {
    const validatedImage = (uri: string) =>  {
        if(!uri) return '/assets/images/notImage.png';

        return `${uriBase}/${uri}`;
    };

    return (
        <li className="bg-gray-100 p-4 rounded-xl shadow-amber-100 max-h-120">
            <div className="w-full h-64">
                <img className="w-full h-full object-cover rounded-t-lg" src={validatedImage(uriImage)} alt={alt} />
            </div>            
            <div className="grid p-4 h-48">
                <div className="flex justify-between">
                    <h2 className="text-xl font-bold">{title}</h2>
                </div>
                <div>
                    <p>Custo: <strong>{convertInputStringMoney(cost)}</strong></p>
                    <p>Preço: <strong>{convertInputStringMoney(price)}</strong></p>
                </div>
                <p className="text-sm text-gray-500">{description}</p>
                {children}
            </div>
        </li>
    )
}