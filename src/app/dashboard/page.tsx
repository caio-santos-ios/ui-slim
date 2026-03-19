"use client";

import { CardCustomer }    from "@/components/Dashboard/CardCustomer";
import { FirstCard }       from "@/components/Dashboard/FirstCard";
import { ConsultasList }   from "@/components/Dashboard/ConsultasList";
import { RevenueChart }    from "@/components/Dashboard/RevenueChart";
import { FinancialCards }  from "@/components/Dashboard/FinancialCards";
import { Autorization }    from "@/components/Global/Autorization";
import { Header }          from "@/components/Global/Header";
import { SideMenu }        from "@/components/Global/SideMenu";
import { roleUserAtom, userLoggerAtom }  from "@/jotai/auth/auth.jotai";
import { loadingAtom }     from "@/jotai/global/loading.jotai";
import { api }             from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom }         from "jotai";
import { useEffect, useState } from "react";
import { LuHistory, LuCalendarClock } from "react-icons/lu";

export default function Dashboard() {
    const [userLogger]  = useAtom(userLoggerAtom);
    const [_, setLoading] = useAtom(loadingAtom);

    const [cardFirst,  setCardFirst]  = useState<any>({});
    const [summary,    setSummary]    = useState<any>(null);
    const [role] = useAtom(roleUserAtom);

    /* ── first-card (existente) ── */
    const getCards = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/dashboard/first-card`, configApi());
            setCardFirst(data.result.data.data);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    /* ── summary (novo) ── */
    const getSummary = async () => {
        try {
            const { data } = await api.get(`/dashboard/summary`, configApi());
            setSummary(data.result.data);
        } catch (error) {
            resolveResponse(error);
        }
    };

    useEffect(() => {
        getCards();
        getSummary();
    }, []);

    // Normaliza chaves camelCase vindas da API
    const ultimas  = (summary?.ultimasConsultas  ?? []).map((c: any) => ({
        id: c.id, beneficiario: c.beneficiario, profissional: c.profissional,
        modulo: c.modulo, data: c.data, hora: c.hora, status: c.status,
    }));

    const proximas = (summary?.proximasConsultas ?? []).map((c: any) => ({
        id: c.id, beneficiario: c.beneficiario, profissional: c.profissional,
        modulo: c.modulo, data: c.data, hora: c.hora, status: c.status,
    }));

    const financeiro = (summary?.financeiroMensal ?? []).map((m: any) => ({
        mes: m.mes, receita: m.receita, despesa: m.despesa,
    }));

    const porStatus = (summary?.consultasPorStatus ?? []).map((s: any) => ({
        status: s.status, total: s.total,
    }));

    return (
        <>
            <Autorization />
            {userLogger ? (
                <>
                    <Header />
                    <main className="slim-bg-main">
                        <SideMenu />

                        <div className="h-[calc(100dvh-5rem)] overflow-y-auto w-full p-6 grid grid-cols-12 gap-4">
                            {
                                role == "Client" &&
                                <>
                                    <div className="lg:col-span-8">
                                        <FirstCard cardFirst={cardFirst} />
                                    </div>

                                    <div className="lg:col-span-4">
                                        <CardCustomer />
                                    </div>

                                    <div className="col-span-12">
                                        <div className="grid grid-cols-12 gap-4">
                                            <ConsultasList
                                                title="Últimas Consultas"
                                                icon={<LuHistory size={16} />}
                                                consultas={ultimas}
                                                accentColor="var(--primary-color)"
                                                emptyMsg="Nenhuma consulta realizada recentemente."
                                            />
                                            <ConsultasList
                                                title="Próximas Consultas"
                                                icon={<LuCalendarClock size={16} />}
                                                consultas={proximas}
                                                accentColor="var(--accent-color)"
                                                emptyMsg="Nenhuma consulta agendada."
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-12">
                                        {summary && (
                                            <FinancialCards
                                                contasPagarMes={summary.contasPagarMes ?? 0}
                                                contasReceberAberto={summary.contasReceberAberto ?? 0}
                                                ticketMedio={summary.ticketMedio ?? 0}
                                                consultasMes={summary.consultasMes ?? 0}
                                                beneficiariosAtivos={summary.beneficiariosAtivos ?? 0}
                                                porStatus={porStatus}
                                            />
                                        )}
                                    </div>
                                </>
                            }
                        </div>
                    </main>
                </>
            ) : <></>}
        </>
    );
}
