"use client";

import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { useAtom } from "jotai";
import { Autorization } from "@/components/Global/Autorization";
import { Header } from "@/components/Global/Header";
import { SideMenu } from "@/components/Global/SideMenu";
import { MetricsPage } from "@/components/Settings/Metrics/MetricsPage";

export default function Metrics() {
  const [userLogger] = useAtom(userLoggerAtom);

  return (
    <>
      <Autorization />
      {userLogger ? (
        <>
          <Header />
          <main className="slim-bg-main">
            <SideMenu />
            <div className="slim-container-customer h-[calc(100dvh-5rem)] w-full">
              <MetricsPage />
            </div>
          </main>
        </>
      ) : <></>}
    </>
  );
}
