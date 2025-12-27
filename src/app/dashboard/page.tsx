"use client";

import { FirstCard } from "@/components/Dashboard/FirstCard";
import { RecentPatient } from "@/components/Dashboard/RecentPatient";
import { Autorization } from "@/components/Global/Autorization";
import { Header } from "@/components/Global/Header";
import { Loading } from "@/components/Global/Loading";
import { SideMenu } from "@/components/Global/SideMenu";
import { SlimContainer } from "@/components/Global/SlimContainer";
import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [userLogger] = useAtom(userLoggerAtom);
  const [_, setLoading] = useAtom(loadingAtom);  
  const [cardFirst, setCardFirst] = useState<any>({});
  const [recentPatient, setRecentPatient] = useState<any[]>([]);

  const getCards = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/dashboard/first-card`, configApi());
      const result = data.result.data;
      setCardFirst(result.data)
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };
  
  const getRecentPatient = async () => {
    try {
      const { data } = await api.get(`/dashboard/recent-patients`, configApi());
      const result = data.result.data;
      setRecentPatient(result)
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    getCards();
    // getRecentPatient();
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

                <FirstCard cardFirst={cardFirst} />  
                <RecentPatient recentPatients={recentPatient} />  
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
