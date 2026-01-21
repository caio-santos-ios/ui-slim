"use client";

import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";

export const CardCustomer = () => {
    const [active, setActive] = useState<number>(0);
    const [inactive, setInactive] = useState<number>(0);

    const calculatePercentage = (value: number, total: number, decimals: number = 2): number => {
        if (!total || total === 0) return 0;
        
        const percentage = (value / total) * 100;
        
        return parseFloat(percentage.toFixed(decimals));
    };

    const getAll = async () => {
        try {
            const {data} = await api.get(`/customer-recipients?deleted=false&orderBy=createdAt&sort=asc&pageSize=10&pageNumber=1`, configApi());
            const result = data.result;
            const listActive = result.data.filter((i: any) => i.active).length;
            const listInactive = result.data.filter((i: any) => !i.active).length;

            setActive(listActive)
            setInactive(listInactive)
        } catch (error) {
            resolveResponse(error);
        }
    };

    useEffect(() => {
        const req = async () => {
            await getAll();
        };
        req();
    }, []);

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
            <div className="rounded-2xl border border-(--color-brand-500) bg-(--color-brand-500) p-5 md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800 text-green-600">
                    <FaUsers size={25}/>
                </div>

                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Clientes ativos
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {active}
                        </h4>
                    </div>
                
                    <div>
                        {calculatePercentage(active, inactive + active)}%
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-(--color-brand-500) bg-(--color-brand-500) p-5 md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800 text-red-600">
                <FaUsers size={25} />
                </div>
                <div className="flex items-end justify-between mt-5">
                <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Clientes Inativos
                    </span>
                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                        {inactive}
                    </h4>
                </div>
                    
                    <div>
                        {calculatePercentage(inactive, inactive + active)}%
                    </div>
                </div>
            </div>
        </div>
    );
};
