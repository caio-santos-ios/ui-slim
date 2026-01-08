"use cliente";

import { uriBase } from "@/service/api.service";
import { convertInputStringMoney } from "@/utils/convert.util";
import { ReactNode } from "react";
import {Card, CardHeader, CardBody, Image} from "@heroui/react";

type TProp = {
    id: string;
    title: string;
    subTitle?: string;
    cost: string;
    price: string;
    description: string;
    uriImage: string;
    alt: string;
    children: ReactNode;
}

export const CardImage = ({children, id, title, cost, price, description, uriImage, alt}: TProp) => {
    const validatedImage = (uri: string) =>  {
        if(!uri) return '/assets/images/notImage.png';

        return `${uriBase}/${uri}`;
    };

    return (
        // <li className="bg-gray-100 p-4 rounded-xl shadow-amber-100 max-h-120">
        //     <div className="w-full h-64">
        //         <img className="w-full h-full object-cover rounded-t-lg" src={validatedImage(uriImage)} alt={alt} />
        //     </div>            
        //     <div className="grid p-4 h-48">
        //         <div className="flex justify-between">
        //             <h2 className="text-xl font-bold">{id}</h2>
        //         </div>
        //         <div className="flex justify-between">
        //             <h2 className="text-xl font-bold">{title}</h2>
        //         </div>
        //         <div>
        //             <p>Custo: <strong>{convertInputStringMoney(cost)}</strong></p>
        //             <p>Preço: <strong>{convertInputStringMoney(price)}</strong></p>
        //         </div>
        //         <p className="text-sm text-gray-500">{description}</p>
        //         {children}
        //     </div>
        // </li>
        <Card className="py-4 slim-bg-primary rounded-lg min-h-[350px]">
            <CardHeader className="p-2 flex items-center justify-center w-full h-40 overflow-hidden">
                <img 
                    className="max-w-full max-h-full w-auto h-auto rounded-xl object-contain" 
                    src={validatedImage(uriImage)} 
                    alt={alt} 
                />
            </CardHeader>

            <CardBody className="py-2 grow">
                <p className="text-tiny uppercase font-bold opacity-70">{id}</p>
                <h4 className="font-bold text-large leading-tight">{title}</h4>
                <small className="text-default-500 line-clamp-2">{description}</small>
            </CardBody>

            <div className="px-4 pb-2 flex justify-start items-center gap-2">
                {children}
            </div>
        </Card>
    )
}