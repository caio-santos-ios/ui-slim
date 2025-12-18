"use client";

import { Autorization } from "@/components/Global/Autorization";
import { Header } from "@/components/Global/Header";
import { NotData } from "@/components/Global/NotData";
import { Pagination } from "@/components/Global/Pagination";
import { SideMenu } from "@/components/Global/SideMenu";
import { SlimContainer } from "@/components/Global/SlimContainer";
import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { useAtom } from "jotai";

const columns: any[] = [
  { key: "category", title: "Categoria" },
  { key: "paymentMethod", title: "Metodo de pagamento" },
  { key: "contract", title: "Contrato" },
  { key: "costCenter", title: "Centro de Custo" },
  { key: "createdAt", title: "Data de criação" },
];

export default function Dashboard() {
  const [userLogger] = useAtom(userLoggerAtom);

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
                buttons={
                  <>
                    {/* <button onClick={() => openModal()} className="slim-bg-primary slim-bg-primary-hover">Adicionar</button> */}
                  </>
                }>
                <NotData />
                <Pagination passPage={() => {}} />
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
