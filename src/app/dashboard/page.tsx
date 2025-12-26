"use client";

import { Autorization } from "@/components/Global/Autorization";
import { Header } from "@/components/Global/Header";
import { NotData } from "@/components/Global/NotData";
import { SideMenu } from "@/components/Global/SideMenu";
import { SlimContainer } from "@/components/Global/SlimContainer";
import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [userLogger] = useAtom(userLoggerAtom);
  const [name, setName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("name");
    if(name) setName(name);
  }, [])

  return (
    <>
      <Autorization />
      {
        userLogger ?
        <>
          <Header />
          <main className="slim-bg-main">
            <SideMenu />

            <div className="slim-container w-full">
              <SlimContainer breadcrump="Dashboard" breadcrumpIcon="FaMoneyBillTrendUp"
                buttons={<></>}>

                  <ul className="grid grid-cols-4 gap-6">
                    <li className="p-4 bg-gray-100 shadow-lg shadow-gray-500/50 rounded-md">
                      <p className="font-semibold text-lg text-gray-500">Total de Clientes</p>
                      <strong>100.000</strong>
                    </li>
                    <li className="p-4 bg-gray-100 shadow-lg shadow-gray-500/50 rounded-md">
                      <p className="font-semibold text-lg text-gray-500">Total de Beneficiários</p>
                      <strong>100.000</strong>
                    </li>                    
                    {/* <li className="p-4 bg-gray-100 shadow-lg shadow-gray-500/50 rounded-md">
                      <p className="font-semibold text-lg text-gray-500">Total de Clientes</p>
                      <strong>100.000</strong>
                    </li>
                    <li className="p-4 bg-gray-100 shadow-lg shadow-gray-500/50 rounded-md">
                      <p className="font-semibold text-lg text-gray-500">Total de Clientes</p>
                      <strong>100.000</strong>
                    </li>                     */}
                  </ul>
                  
                  {/* <NotData /> */}
              </SlimContainer>
            </div>
          </main>
        </>
        :
        <></>
      }
    </>
  );
}
