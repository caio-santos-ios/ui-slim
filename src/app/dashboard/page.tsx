"use client";

import { Autorization } from "@/components/Autorization";
import { Header } from "@/components/Header";
import { SideMenu } from "@/components/SideMenu";
import { SlimContainer } from "@/components/SlimContainer";
import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { useAtom } from "jotai";
import { Pagination } from "@/components/Pagination";
import { NotData } from "@/components/NotData";

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
                <Pagination />
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
