"use client";

import { useEffect, useState } from "react";
import { api } from "@/service/api.service";
import { configApi } from "@/service/config.service";
import { useAtom } from "jotai";
import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { Autorization } from "@/components/Global/Autorization";
import { Header } from "@/components/Global/Header";
import { SideMenu } from "@/components/Global/SideMenu";
import { SlimContainer } from "@/components/Global/SlimContainer";
import { permissionRead } from "@/utils/permission.util";

// ─── Dados da planilha — P1 a P12 ────────────────────────────────────────────
const PERGUNTAS = [
  { id: "P1",  desc: "Clareza de Metas",       peso: 1, bloco: "Processos",   justificativa: "Operacional",                acaoCurta: "Alinhamento de metas e expectativas entre líder e liderado.",                    acaoCompleta: "Instituir rituais de alinhamento semanal e revisar descrições de cargos/tarefas.",                                   fundamentacao: "Reduzir estresse por ambiguidade de papel." },
  { id: "P2",  desc: "Pausas e Intervalos",     peso: 2, bloco: "Processos",   justificativa: "Risco de Fadiga (Legal)",    acaoCurta: "Implantação de pausas obrigatórias e rodízio de tarefas.",                         acaoCompleta: "Implementar sistema de pausas ativas e rodízio de posturas/tarefas durante a jornada.",                              fundamentacao: "Atender NR-17 (Ergonomia) e mitigar fadiga." },
  { id: "P3",  desc: "Fluxo de Informação",     peso: 1, bloco: "Processos",   justificativa: "Operacional",                acaoCurta: "Padronização dos canais de comunicação interna do setor.",                         acaoCompleta: "Padronizar canais de comunicação oficial e centralizar ordens de serviço.",                                          fundamentacao: "Evitar sobrecarga cognitiva e erros operacionais." },
  { id: "P4",  desc: "Ferramentas e Recursos",  peso: 1, bloco: "Suporte",     justificativa: "Operacional",                acaoCurta: "Auditoria e substituição de ferramentas/recursos deficientes.",                     acaoCompleta: "Realizar inventário de ferramentas e substituir equipamentos obsoletos ou deficitários.",                            fundamentacao: "Prevenir riscos de acidentes e subutilização." },
  { id: "P5",  desc: "Planejamento de Fluxo",   peso: 1, bloco: "Suporte",     justificativa: "Operacional",                acaoCurta: "Redesenho do fluxo de trabalho para eliminar urgências.",                          acaoCompleta: "Revisar cronogramas produtivos para eliminar picos de urgência e horas extras excessivas.",                          fundamentacao: "Controlar a pressão temporal e desgaste mental." },
  { id: "P6",  desc: "Feedback/Orientação",     peso: 1, bloco: "Suporte",     justificativa: "Gestão",                     acaoCurta: "Programa de treinamento em feedback e escuta ativa.",                              acaoCompleta: "Treinar lideranças para aplicação de feedbacks técnicos e orientações de segurança.",                                fundamentacao: "Fortalecer o suporte gerencial e a segurança." },
  { id: "P7",  desc: "Carga vs Horário",         peso: 1, bloco: "Liderança",   justificativa: "Gestão",                     acaoCurta: "Estudo de carga de trabalho vs. dimensionamento de equipe.",                       acaoCompleta: "Avaliar redimensionamento de equipe ou ajuste de metas conforme a jornada contratada.",                             fundamentacao: "Prevenir o Quiet Quitting e Burnout." },
  { id: "P8",  desc: "Colaboração/Clima",        peso: 1, bloco: "Liderança",   justificativa: "Cultural",                   acaoCurta: "Dinâmicas de grupo para fortalecer o apoio social no time.",                       acaoCompleta: "Promover dinâmicas de grupo e treinamentos de gestão de conflitos e comunicação não-violenta.",                     fundamentacao: "Melhorar o Apoio Social (Fator de Proteção)." },
  { id: "P9",  desc: "Imparcialidade",           peso: 1, bloco: "Liderança",   justificativa: "Cultural",                   acaoCurta: "Revisão dos critérios de decisão para garantir transparência.",                    acaoCompleta: "Estabelecer critérios claros e transparentes para tomadas de decisão e promoções.",                                 fundamentacao: "Aumentar a percepção de Justiça Organizacional." },
  { id: "P10", desc: "Valorização",              peso: 1, bloco: "Compliance",  justificativa: "Engajamento (Baixo risco)",  acaoCurta: "Implementação de rituais de reconhecimento de resultados.",                        acaoCompleta: "Implementar programa de reconhecimento e celebração de marcos/conquistas da equipe.",                               fundamentacao: "Elevar o engajamento e a saúde emocional." },
  { id: "P11", desc: "Rigor com Segurança",      peso: 3, bloco: "Compliance",  justificativa: "Risco de Acidente (Crítico)",acaoCurta: "Auditoria de segurança e reciclagem de normas (SST).",                             acaoCompleta: "Realizar auditoria imediata de conformidade e reciclar treinamentos de NR obrigatórios.",                           fundamentacao: "Prevenção de CAT e Blindagem Jurídica." },
  { id: "P12", desc: "Previsibilidade",          peso: 1, bloco: "Compliance",  justificativa: "Qualidade de Vida",          acaoCurta: "Organização antecipada de escalas para garantir descanso.",                        acaoCompleta: "Garantir a divulgação de escalas e alterações de turno com antecedência mínima de 72h.",                           fundamentacao: "Proteger o equilíbrio trabalho-vida pessoal." },
];

// Pontos de risco por nota: Sempre=0, MuitasVezes=1, ÀsVezes=2, Nunca=3
// nota média × peso = probabilidade × severidade
function getProbabilidade(notaMedia: number): number {
  // normaliza de 0-3 para 0-5
  return Math.round((notaMedia / 3) * 5);
}
function getSeveridade(peso: number): number {
  return Math.min(5, peso * 2); // peso 1=2, peso 2=4, peso 3=5 (max)
}
function getRiskColor(prob: number, sev: number): string {
  const score = prob * sev;
  if (score >= 15) return "#ef4444"; // crítico
  if (score >= 8)  return "#f59e0b"; // alto
  if (score >= 4)  return "#84cc16"; // médio
  return "#22c55e";                   // baixo
}

// ─── Matriz de Risco (scatter SVG) ────────────────────────────────────────────
function MatrizRisco({ pontos, onSelect }: {
  pontos: { id: string; desc: string; prob: number; sev: number; notaMedia: number; acaoCompleta: string }[];
  onSelect: (p: typeof pontos[0] | null) => void;
}) {
  const W = 500, H = 400, PAD = 50;
  const scaleX = (v: number) => PAD + ((v - 1) / 4) * (W - PAD * 2);
  const scaleY = (v: number) => H - PAD - ((v - 1) / 4) * (H - PAD * 2);

  const quadrants = [
    { label: "BAIXO",    x: PAD,       y: H / 2,  w: (W - PAD * 2) / 2, h: (H - PAD * 2) / 2, fill: "#22c55e10" },
    { label: "MÉDIO",    x: W / 2,     y: H / 2,  w: (W - PAD * 2) / 2, h: (H - PAD * 2) / 2, fill: "#84cc1610" },
    { label: "ALTO",     x: PAD,       y: PAD,    w: (W - PAD * 2) / 2, h: (H - PAD * 2) / 2, fill: "#f59e0b10" },
    { label: "CRÍTICO",  x: W / 2,     y: PAD,    w: (W - PAD * 2) / 2, h: (H - PAD * 2) / 2, fill: "#ef444410" },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: "visible" }}>
      {quadrants.map(q => (
        <g key={q.label}>
          <rect x={q.x} y={q.y} width={q.w} height={q.h} fill={q.fill} />
          <text x={q.x + q.w - 4} y={q.y + q.h - 4}
            textAnchor="end" fontSize="9" fill="#9ca3af" opacity="0.7">{q.label}</text>
        </g>
      ))}

      <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#e5e7eb" strokeWidth="1" />
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#e5e7eb" strokeWidth="1" />
      <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="#6b7280">Probabilidade →</text>
      <text x={12} y={H / 2} textAnchor="middle" fontSize="11" fill="#6b7280"
        transform={`rotate(-90, 12, ${H / 2})`}>Severidade →</text>

      {[1, 2, 3, 4, 5].map(v => (
        <g key={v}>
          <line x1={scaleX(v)} y1={PAD} x2={scaleX(v)} y2={H - PAD} stroke="#f3f4f6" strokeWidth="1" />
          <line x1={PAD} y1={scaleY(v)} x2={W - PAD} y2={scaleY(v)} stroke="#f3f4f6" strokeWidth="1" />
          <text x={scaleX(v)} y={H - PAD + 14} textAnchor="middle" fontSize="9" fill="#9ca3af">{v}</text>
          <text x={PAD - 6} y={scaleY(v) + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{v}</text>
        </g>
      ))}

      {pontos.map(p => {
        const cx = scaleX(p.prob);
        const cy = scaleY(p.sev);
        const color = getRiskColor(p.prob, p.sev);
        return (
          <g key={p.id} style={{ cursor: "pointer" }} onClick={() => onSelect(p)}>
            <circle cx={cx} cy={cy} r="16" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" />
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fontWeight="800" fill={color}>{p.id}</text>
          </g>
        );
      })}
    </svg>
  );
}

type TAlerta = { tipo: "SST" | "Psicossocial" | "Biopsicossocial"; mensagem: string; acao: string };

export default function DashboardSST() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [userLogger]    = useAtom(userLoggerAtom);

  const [pontos, setPontos]             = useState<any[]>([]);
  const [selected, setSelected]         = useState<any | null>(null);
  const [alertas, setAlertas]           = useState<TAlerta[]>([]);
  const [geratingPGR, setGeratingPGR]   = useState(false);
  const [iesMedia, setIesMedia]         = useState(0);
  const [riscosDetectados, setRiscos]   = useState<any[]>([]);
  const [admin, setAdmin] = useState(false);

  useEffect(() => { 
    const r = localStorage.getItem("role");
    const a = localStorage.getItem("admin");

    if(r) {
      if(r == "Manager") setAdmin(true);
    };

    if(a) {
      if(a == "true") setAdmin(true);
    };

    loadDashboard(); 
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const idLocal = localStorage.getItem("id") ?? "";

      const { data } = await api.get(
        `/vitals?deleted=false&contractorId=${idLocal}&chekinISO=true&pageSize=999&pageNumber=1`,
        configApi()
      );
      const vitals: any[] = data.result?.data ?? [];

      if (!vitals.length) { setLoading(false); return; }

      const notasPorItem = PERGUNTAS.map(p => {
        const notaMedia = vitals.reduce((sum, v) => {
          const pontoISO = v.chekinISOPoint ?? 0;
          return sum + ((pontoISO / 31) * p.peso * 3);
        }, 0) / vitals.length;

        return {
          ...p,
          notaMedia,
          prob: getProbabilidade(notaMedia),
          sev:  getSeveridade(p.peso),
          acaoCompleta: p.acaoCompleta,
        };
      });

      setPontos(notasPorItem);

      // Riscos detectados (nota >= 2)
      const riscos = notasPorItem.filter(p => p.notaMedia >= 2);
      setRiscos(riscos);

      // IES média
      const { data: iesData } = await api.get(
        `/vitals?deleted=false&contractorId=${idLocal}&chekinIES=true&pageSize=999&pageNumber=1`,
        configApi()
      );
      const iesVitals: any[] = iesData.result?.data ?? [];
      const iesMediaCalc = iesVitals.reduce((sum, v) => sum + (v.metric?.ies ?? 0), 0) / (iesVitals.length || 1);
      setIesMedia(iesMediaCalc);

      // Gera alertas conforme Matriz de Alerta da planilha
      const novosAlertas: TAlerta[] = [];

      // Crítico SST: P11 nota = 3 (Nunca)
      const p11 = notasPorItem.find(p => p.id === "P11");
      if (p11 && p11.notaMedia >= 2.5) {
        novosAlertas.push({
          tipo: "SST",
          mensagem: "Item P11 (Rigor com Segurança): O colaborador assinalou que as normas de segurança Nunca/Raramente são seguidas.",
          acao: "Realizar auditoria técnica imediata de conformidade e reciclar treinamentos de NR obrigatórios.",
        });
      }

      // Psicossocial: IES < 50
      if (iesMediaCalc < 50) {
        novosAlertas.push({
          tipo: "Psicossocial",
          mensagem: `IES (Índice de Equilíbrio Social) em ${iesMediaCalc.toFixed(0)} — abaixo do limite de segurança (50).`,
          acao: "Iniciar protocolo de escuta ativa ou suporte psicossocial conforme diretrizes da empresa.",
        });
      }

      setAlertas(novosAlertas);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const gerarPGR = async () => {
    setGeratingPGR(true);
    // Simula geração — em produção chama POST /occupational-pgr/generate
    await new Promise(r => setTimeout(r, 2500));
    setGeratingPGR(false);
    // TODO: abrir PDF gerado
    alert("PGR gerado! Integre com o endpoint POST /occupational-pgr/generate para download do PDF.");
  };

  const alertColors: Record<string, string> = {
    SST:             "#ef4444",
    Psicossocial:    "#8b5cf6",
    Biopsicossocial: "#f59e0b",
  };

  return (
    <>
      <Autorization />
      {userLogger ? (
        <>
          <Header />
          <main className="slim-bg-main">
            <SideMenu />
            <div className="slim-container-customer h-[calc(100dvh-5rem)] w-full overflow-y-auto">
              {
                permissionRead("4", "D05") || admin && (
                  <SlimContainer
                    menu="Dashboards"
                    breadcrump="Painel SST/RH — Visão de Gestão"
                    breadcrumpIcon="MdShieldOutlined"
                    buttons={
                      <button
                        onClick={gerarPGR}
                        disabled={geratingPGR}
                        className="slim-btn slim-btn-primary flex items-center gap-2"
                      >
                        {geratingPGR ? (
                          <>
                            <span className="animate-spin">⚙️</span>
                            Cruzando dados de campo com Medidas de Controle...
                          </>
                        ) : (
                          <>📋 Gerar PGR Automatizado</>
                        )}
                      </button>
                    }
                  >

                    {/* ── Banners de alerta ──────────────────────────────────── */}
                    {alertas.map((a, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl mb-3"
                        style={{ background: `${alertColors[a.tipo]}15`, border: `1px solid ${alertColors[a.tipo]}60` }}>
                        <span className="text-lg mt-0.5">
                          {a.tipo === "SST" ? "🚨" : a.tipo === "Psicossocial" ? "🧠" : "⚠️"}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold" style={{ color: alertColors[a.tipo] }}>
                              ALERTA {a.tipo.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs mb-1" style={{ color: alertColors[a.tipo] }}>{a.mensagem}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            <strong>Ação:</strong> {a.acao}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* ── Grid principal ────────────────────────────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

                      {/* Matriz de risco */}
                      <div className="rounded-2xl p-5"
                        style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)" }}>
                        <p className="text-sm font-bold text-[var(--primary-color)] mb-1">
                          Matriz de Risco Interativa — P1 a P12
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mb-4">
                          Clique em um ponto para ver o plano de ação.
                        </p>
                        <MatrizRisco pontos={pontos} onSelect={setSelected} />
                      </div>

                      {/* Detalhes do item selecionado */}
                      <div className="flex flex-col gap-3">

                        {selected ? (
                          <div className="rounded-2xl p-5 flex flex-col gap-3"
                            style={{ background: "var(--surface-card)", border: `1px solid ${getRiskColor(selected.prob, selected.sev)}` }}>
                            <div className="flex items-center justify-between">
                              <span className="text-base font-black" style={{ color: getRiskColor(selected.prob, selected.sev) }}>
                                {selected.id} — {selected.desc}
                              </span>
                              <button onClick={() => setSelected(null)} className="text-xs text-[var(--text-muted)]">✕</button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="rounded-lg p-3" style={{ background: "var(--surface-bg)" }}>
                                <p className="text-xs text-[var(--text-muted)]">Bloco</p>
                                <p className="text-xs font-semibold">{selected.bloco}</p>
                              </div>
                              <div className="rounded-lg p-3" style={{ background: "var(--surface-bg)" }}>
                                <p className="text-xs text-[var(--text-muted)]">Justificativa</p>
                                <p className="text-xs font-semibold">{selected.justificativa}</p>
                              </div>
                            </div>
                            <div className="rounded-lg p-3" style={{ background: `${getRiskColor(selected.prob, selected.sev)}10` }}>
                              <p className="text-xs font-bold mb-1" style={{ color: getRiskColor(selected.prob, selected.sev) }}>
                                Plano de Ação
                              </p>
                              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{selected.acaoCompleta}</p>
                            </div>
                            <div className="rounded-lg p-3" style={{ background: "var(--surface-bg)" }}>
                              <p className="text-xs text-[var(--text-muted)]">Fundamentação Técnica</p>
                              <p className="text-xs font-medium">{selected.fundamentacao}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-2xl p-5 flex items-center justify-center h-40"
                            style={{ background: "var(--surface-bg)", border: "1px dashed var(--surface-border)" }}>
                            <p className="text-sm text-[var(--text-muted)]">← Clique em um item da matriz</p>
                          </div>
                        )}

                        {/* Riscos detectados */}
                        {riscosDetectados.length > 0 && (
                          <div className="rounded-2xl p-4"
                            style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)" }}>
                            <p className="text-xs font-bold text-[var(--primary-color)] mb-3">
                              Inventário de Riscos ({riscosDetectados.length} itens)
                            </p>
                            <div className="flex flex-col gap-2">
                              {riscosDetectados.map(r => {
                                const color = getRiskColor(r.prob, r.sev);
                                return (
                                  <div key={r.id}
                                    className="flex items-center gap-3 p-2 rounded-lg cursor-pointer"
                                    style={{ background: `${color}10`, border: `1px solid ${color}30` }}
                                    onClick={() => setSelected(r)}>
                                    <span className="text-xs font-black w-8" style={{ color }}>{r.id}</span>
                                    <span className="text-xs flex-1 text-[var(--text-muted)]">{r.desc}</span>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                      style={{ background: `${color}20`, color }}>
                                      {r.justificativa}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </SlimContainer>
                )
              }
            </div>
          </main>
        </>
      ) : <></>}
    </>
  );
}
