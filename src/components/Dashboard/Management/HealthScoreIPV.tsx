"use client";

import { useEffect, useState } from "react";
import { api } from "@/service/api.service";
import { configApi } from "@/service/config.service";
import { useAtom } from "jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";

// ─── Textos de sugestão por índice/score baixo (originados da planilha) ───────
const SUGESTOES: Record<string, { threshold: number; sugestoes: { titulo: string; descricao: string; emoji: string }[] }> = {
  igs: {
    threshold: 60,
    sugestoes: [
      { emoji: "🌙", titulo: "Dose de Saúde — Sono",      descricao: "Tente criar uma rotina: desligue telas 30 min antes de dormir e mantenha um horário fixo de acordar, mesmo nos fins de semana." },
      { emoji: "🛁", titulo: "Ritual Noturno",             descricao: "Um banho morno antes de dormir reduz a temperatura corporal e sinaliza ao cérebro que é hora de descansar." },
      { emoji: "😴", titulo: "Qualidade > Quantidade",     descricao: "8h de sono ruim valem menos que 6h profundas. Evite cafeína após as 14h e álcool à noite — eles fragmentam o sono." },
    ],
  },
  ign: {
    threshold: 60,
    sugestoes: [
      { emoji: "💧", titulo: "Dose de Saúde — Hidratação", descricao: "Sua meta de água não foi atingida hoje. Tente manter uma garrafinha de 500ml na mesa e beba uma a cada 2 horas." },
      { emoji: "🥗", titulo: "Sugestão de Ceia",           descricao: "Para melhorar a glicemia e o sono, prefira ceias leves: iogurte natural, banana com aveia ou pão integral com ovo." },
      { emoji: "⏰", titulo: "Ritmo Alimentar",            descricao: "Intervalos longos entre refeições elevam o cortisol e aumentam o risco de fadiga. Tente não ficar mais de 3h sem comer algo leve." },
    ],
  },
  ies: {
    threshold: 50,
    sugestoes: [
      { emoji: "🧘", titulo: "Dose de Saúde — Mental",     descricao: "Tente 5 minutos de respiração 4-7-8: inspire por 4s, segure 7s, expire por 8s. Reduz a ansiedade rapidamente." },
      { emoji: "📓", titulo: "Registro Emocional",         descricao: "Escrever 3 coisas boas do seu dia (mesmo pequenas) ativa o circuito de recompensa do cérebro e melhora o humor." },
      { emoji: "🤝", titulo: "Conexão Social",             descricao: "Sentir-se desvalorizado ou sem apoio aumenta o risco de burnout. Conversar com alguém de confiança hoje pode ajudar." },
    ],
  },
  ipv: {
    threshold: 50,
    sugestoes: [
      { emoji: "⚖️", titulo: "Equilíbrio Geral",          descricao: "Seu IPV indica desequilíbrio entre as três dimensões da saúde. Escolha UMA área para focar esta semana: sono, nutrição ou equilíbrio emocional." },
      { emoji: "📈", titulo: "Progresso Gradual",          descricao: "Pequenas melhorias consistentes valem mais que grandes esforços pontuais. +1 hora de sono já impacta o IGS amanhã." },
    ],
  },
};

// ─── Gráfico Radar / Teia de Aranha (SVG) ────────────────────────────────────
function RadarChart({ igs, ign, ies }: { igs: number; ign: number; ies: number }) {
  const cx = 150, cy = 150, r = 100;
  const labels = [
    { label: "Sono (IGS)",     value: igs / 100, color: "#3b82f6",  angle: -90 },
    { label: "Nutrição (IGN)", value: ign / 100, color: "#10b981",  angle: 30  },
    { label: "Mental (IES)",   value: ies / 100, color: "#8b5cf6",  angle: 150 },
  ];

  const toXY = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos((angle * Math.PI) / 180),
    y: cy + radius * Math.sin((angle * Math.PI) / 180),
  });

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const axes       = labels.map(l => toXY(l.angle, r));
  const dataPoints = labels.map((l, i) => toXY(l.angle, r * l.value));

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  const ipv = (igs + ign + ies) / 3;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 300 300" className="w-56 h-56">
        {/* Grids */}
        {gridLevels.map(level => {
          const pts = labels.map(l => toXY(l.angle, r * level));
          const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
          return <path key={level} d={path} fill="none" stroke="#e5e7eb" strokeWidth="1" />;
        })}

        {/* Eixos */}
        {axes.map((a, i) => (
          <line key={i} x1={cx} y1={cy} x2={a.x} y2={a.y} stroke="#e5e7eb" strokeWidth="1" />
        ))}

        {/* Área de dados */}
        <path d={dataPath}
          fill="url(#radarGrad)" fillOpacity="0.35"
          stroke="#003366" strokeWidth="2" strokeLinejoin="round" />

        <defs>
          <radialGradient id="radarGrad">
            <stop offset="0%" stopColor="#003366" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#66cc99" stopOpacity="0.1" />
          </radialGradient>
        </defs>

        {/* Pontos */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="5"
            fill={labels[i].color} stroke="#fff" strokeWidth="2" />
        ))}

        {/* Labels */}
        {labels.map((l, i) => {
          const pos = toXY(l.angle, r + 22);
          return (
            <g key={i}>
              <text x={pos.x} y={pos.y} textAnchor="middle" fontSize="9"
                fontWeight="700" fill={l.color}>
                {l.label}
              </text>
              <text x={pos.x} y={pos.y + 11} textAnchor="middle" fontSize="8" fill="#6b7280">
                {(l.value * 100).toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* IPV central */}
        <circle cx={cx} cy={cy} r="26" fill="#003366" fillOpacity="0.07" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="16" fontWeight="900" fill="#003366">
          {ipv.toFixed(0)}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="#6b7280">IPV</text>
      </svg>

      {/* Legenda */}
      <div className="flex gap-4">
        {labels.map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
            <span className="text-xs text-[var(--text-muted)]">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Card de sugestão ─────────────────────────────────────────────────────────
function SugestaoCard({ emoji, titulo, descricao }: { emoji: string; titulo: string; descricao: string }) {
  return (
    <div className="rounded-2xl p-4 flex gap-3"
      style={{ background: "var(--surface-card)", border: "1px solid #66cc9930" }}>
      <span className="text-2xl flex-shrink-0">{emoji}</span>
      <div>
        <p className="text-xs font-bold text-[#0D7B6B] mb-1">{titulo}</p>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{descricao}</p>
      </div>
    </div>
  );
}

// ─── Barra de índice ──────────────────────────────────────────────────────────
function IndexBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.min(100, Math.max(0, value));
  const status = pct >= 70 ? "Ótimo" : pct >= 50 ? "Regular" : "Baixo";
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-[var(--text-muted)]">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{pct.toFixed(0)} — {status}</span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--surface-bg)" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENTE — usa no Pasbem como widget de insights
// ═════════════════════════════════════════════════════════════════════════════
export function HealthScoreIPV() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [vital, setVital] = useState<any>(null);
  const [sugestoes, setSugestoes] = useState<{ titulo: string; descricao: string; emoji: string }[]>([]);

  useEffect(() => { loadVital(); }, []);

  const loadVital = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/vitals/beneficiary", configApi());
      const v = data.result;
      setVital(v);

      if (!v) return;

      const igs = v.metric?.igs ?? 0;
      const ign = v.metric?.ign ?? 0;
      const ies = v.metric?.ies ?? 0;
      const ipv = v.metric?.ipv ?? (igs + ign + ies) / 3;

      // Coleta sugestões para os índices abaixo do threshold
      const sug: { titulo: string; descricao: string; emoji: string }[] = [];

      if (igs < SUGESTOES.igs.threshold)  sug.push(...SUGESTOES.igs.sugestoes.slice(0, 2));
      if (ign < SUGESTOES.ign.threshold)  sug.push(...SUGESTOES.ign.sugestoes.slice(0, 2));
      if (ies < SUGESTOES.ies.threshold)  sug.push(...SUGESTOES.ies.sugestoes.slice(0, 2));
      if (ipv < SUGESTOES.ipv.threshold && !sug.length) sug.push(...SUGESTOES.ipv.sugestoes);

      setSugestoes(sug.slice(0, 4));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!vital) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <span className="text-4xl">🌱</span>
        <p className="text-sm text-[var(--text-muted)]">Faça seu check-in para ver seu Health Score</p>
      </div>
    );
  }

  const igs = vital.metric?.igs ?? 0;
  const ign = vital.metric?.ign ?? 0;
  const ies = vital.metric?.ies ?? 0;
  const ipv = vital.metric?.ipv ?? (igs + ign + ies) / 3;

  return (
    <div className="flex flex-col gap-5 px-4 py-5">

      {/* Header */}
      <div>
        <p className="text-base font-black" style={{ color: "#1A3557" }}>Seu Health Score</p>
        <p className="text-xs text-[var(--text-muted)]">Baseado no seu último check-in</p>
      </div>

      {/* Radar */}
      <div className="rounded-2xl p-4 flex justify-center"
        style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)" }}>
        <RadarChart igs={igs} ign={ign} ies={ies} />
      </div>

      {/* Barras de índice */}
      <div className="rounded-2xl p-4 flex flex-col gap-3"
        style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)" }}>
        <p className="text-xs font-bold" style={{ color: "#1A3557" }}>Seus Índices</p>
        <IndexBar label="IGS — Sono"          value={igs} color="#3b82f6" />
        <IndexBar label="IGN — Nutrição"      value={ign} color="#10b981" />
        <IndexBar label="IES — Mental"        value={ies} color="#8b5cf6" />
        <div className="h-px my-1" style={{ background: "var(--surface-border)" }} />
        <IndexBar label="IPV — Índice Geral"  value={ipv} color="#003366" />
      </div>

      {/* Sugestões */}
      {sugestoes.length > 0 && (
        <div>
          <p className="text-xs font-bold mb-3" style={{ color: "#0D7B6B" }}>
            💊 Doses de Saúde para Você
          </p>
          <div className="flex flex-col gap-3">
            {sugestoes.map((s, i) => (
              <SugestaoCard key={i} {...s} />
            ))}
          </div>
        </div>
      )}

      {/* IPV bom — feedback positivo */}
      {ipv >= 70 && sugestoes.length === 0 && (
        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "#0D7B6B15", border: "1px solid #3DBD9B60" }}>
          <span className="text-3xl">🏆</span>
          <div>
            <p className="text-sm font-bold" style={{ color: "#0D7B6B" }}>Você está ótimo!</p>
            <p className="text-xs text-[var(--text-muted)]">
              Seu IPV de {ipv.toFixed(0)} pts indica saúde equilibrada. Continue assim!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
