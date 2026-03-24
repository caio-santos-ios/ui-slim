[1mdiff --cc src/app/management/b2b-panel/page.tsx[m
[1mindex 276403b,e28fbde..0000000[m
[1m--- a/src/app/management/b2b-panel/page.tsx[m
[1m+++ b/src/app/management/b2b-panel/page.tsx[m
[36m@@@ -3,11 -3,11 +3,10 @@@[m
  import { userLoggerAtom } from "@/jotai/auth/auth.jotai";[m
  import { paginationAtom } from "@/jotai/global/pagination.jotai";[m
  import { loadingAtom } from "@/jotai/global/loading.jotai";[m
[31m--import { modalAtom } from "@/jotai/global/modal.jotai";[m
  import { api } from "@/service/api.service";[m
  import { configApi, resolveResponse } from "@/service/config.service";[m
  import { useAtom } from "jotai";[m
[31m--import { useEffect, useState, useMemo } from "react";[m
[32m++import { useEffect, useState, useMemo, useCallback } from "react";[m
  import { useForm } from "react-hook-form";[m
  import { Autorization } from "@/components/Global/Autorization";[m
  import { Header } from "@/components/Global/Header";[m
[36m@@@ -18,27 -18,30 +17,36 @@@[m [mimport { NotData } from "@/components/G[m
  import { ModalDelete } from "@/components/Global/ModalDelete";[m
  import { maskDate } from "@/utils/mask.util";[m
  import { convertNumberMoney } from "@/utils/convert.util";[m
[31m--import { permissionDelete, permissionRead, permissionUpdate } from "@/utils/permission.util";[m
  import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/Global/Accordion/AccordionContent";[m
  import { IoSearch } from "react-icons/io5";[m
  import { MdFilterAlt, MdFilterAltOff, MdOutlineAttachFile, MdOutlineReceipt } from "react-icons/md";[m
  import { FiDownload, FiUsers } from "react-icons/fi";[m
[31m- import { HiOutlineDocumentReport } from "react-icons/hi";[m
[31m--import { TB2BMassMovement, TB2BInvoice, TB2BAttachment } from "@/types/b2bPanel/b2bPanel.type";[m
  import { ModalB2BMassMovement } from "@/components/B2BPanel/Modal/ModalMassMovement";[m
[31m -import { ModalB2BAttachment, ModalB2BInvoice } from "@/components/B2BPanel/Modal/ModalInvoiceAndAttachment";[m
[32m +import { ModalB2BInvoice, ModalB2BAttachment } from "@/components/B2BPanel/Modal/ModalInvoiceAndAttachment";[m
  import { IconView } from "@/components/Global/IconView";[m
  import { IconEdit } from "@/components/Global/IconEdit";[m
  import { IconDelete } from "@/components/Global/IconDelete";[m
[31m -import { TPlan } from "@/types/masterData/plans/plans.type";[m
[31m -import { TServiceModule } from "@/types/masterData/serviceModules/serviceModules.type";[m
  [m
[32m++// ─── Constantes fora do componente ───────────────────────────────────────────[m
  type TTab = "movements" | "invoices" | "attachments";[m
  [m
[32m++const URI_MAP: Record<TTab, string> = {[m
[32m++  movements:   "b2b-mass-movements",[m
[32m++  invoices:    "b2b-invoices",[m
[32m++  attachments: "attachments",[m
[32m++};[m
[32m++[m
[32m++const MONTHS_SHORT: string[] = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];[m
[32m++const MONTHS: string[] = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];[m
[32m++[m
  const movementColumns = [[m
[31m-   { key: "name",        title: "Beneficiário" },[m
[31m-   { key: "cpf",         title: "CPF" },[m
[31m-   { key: "active",      title: "Status" },[m
[31m-   { key: "planName",    title: "Programa" },[m
[31m-   { key: "dateOfBirth", title: "Data de nascimento" },[m
[32m+   { key: "name",          title: "Beneficiário" },[m
[32m+   { key: "cpf",           title: "CPF" },[m
[32m+   { key: "planName",      title: "Programa" },[m
[32m+   { key: "active",        title: "Status" },[m
[32m+   { key: "role",          title: "Função" },[m
[32m+   { key: "department",    title: "Departamento" },[m
[32m+   { key: "effectiveDate", title: "Data de Vigência" },[m
  ];[m
  [m
  const invoiceColumns = [[m
[36m@@@ -54,58 -58,35 +63,45 @@@[m [mconst attachmentColumns = [m
    { key: "createdAt",   title: "Data" },[m
  ];[m
  [m
[31m- const reportColumns = [[m
[31m-   { key: "department", title: "Departamento" },[m
[31m-   { key: "role",       title: "Função" },[m
[31m-   { key: "period",     title: "Período" },[m
[31m-   { key: "status",     title: "Status" },[m
[31m- ];[m
[31m- [m
[32m++// ─── Filtro ───────────────────────────────────────────────────────────────────[m
  type TFilter = {[m
[31m-   search:          string;[m
[31m-   "gte$createdAt": string;[m
[31m-   "lte$createdAt": string;[m
[31m-   status:          string;[m
[31m-   type:            string;[m
[31m-   customerId:      string;[m
[31m-   department:      string;[m
[31m-   period:          string;[m
[31m-   program:         string;[m
[31m-   role:            string;[m
[31m-   effectiveDate:   string;[m
[31m-   planId:          string;  [m
[31m-   function:        string;[m
[31m -  search: string; cpf: string; ageFrom: string; ageTo: string; gender: string;[m
[31m -  serviceModuleId: string; planId: string; active: string;[m
[31m -  "gte$createdAt": string; "lte$createdAt": string;[m
[31m -  "gte$effectiveDate": string; "lte$effectiveDate": string;[m
[31m -  referenceMonth: string; referenceYear: string; status: string;[m
[31m -  type: string; department: string; period: string;[m
[32m++  search:           string;[m
[32m++  "gte$createdAt":  string;[m
[32m++  "lte$createdAt":  string;[m
[32m++  status:           string;[m
[32m++  type:             string;[m
[32m++  customerId:       string;[m
[32m++  department:       string;[m
[32m++  period:           string;[m
[32m++  referenceMonth:   string;[m
[32m++  referenceYear:    string;[m
  };[m
  [m
  const ResetFilter: TFilter = {[m
[31m-   search:          "",[m
[31m-   "gte$createdAt": "",[m
[31m-   "lte$createdAt": "",[m
[31m-   status:          "",[m
[31m-   type:            "",[m
[31m-   customerId:      "",[m
[31m-   department:      "",[m
[31m-   period:          "",[m
[31m-   program:         "",[m
[31m-   role:            "",[m
[31m-   effectiveDate:   "",[m
[31m-   planId:        "",  [m
[31m-   function:      "",  [m
[31m -  search: "", cpf: "", ageFrom: "", ageTo: "", gender: "",[m
[31m -  serviceModuleId: "", planId: "", active: "",[m
[31m -  "gte$createdAt": "", "lte$createdAt": "",[m
[31m -  "gte$effectiveDate": "", "lte$effectiveDate": "",[m
[31m -  referenceMonth: "", referenceYear: "", status: "",[m
[31m -  type: "", department: "", period: "",[m
[32m++  search:           "",[m
[32m++  "gte$createdAt":  "",[m
[32m++  "lte$createdAt":  "",[m
[32m++  status:           "",[m
[32m++  type:             "",[m
[32m++  customerId:       "",[m
[32m++  department:       "",[m
[32m++  period:           "",[m
[32m++  referenceMonth:   "",[m
[32m++  referenceYear:    "",[m
  };[m
  [m
[32m++// ─── Badge de status ──────────────────────────────────────────────────────────[m
  const StatusBadge = ({ value }: { value: any }) => {[m
[31m-   const map: Record<string, any> = {[m
[31m-     Ativo:      "bg-green-100 text-green-800 border-green-200",[m
[31m-     Inativo:    "bg-red-100 text-red-800 border-red-200",[m
[31m-     Pendente:   "bg-yellow-100 text-yellow-800 border-yellow-200",[m
[31m-     Processado: "bg-green-100 text-green-800 border-green-200",[m
[31m-     Erro:       "bg-red-100 text-red-800 border-red-200",[m
[31m-     Aberta:     "bg-blue-100 text-blue-800 border-blue-200",[m
[31m-     Fechada:    "bg-gray-100 text-gray-700 border-gray-200",[m
[31m-     Paga:       "bg-green-100 text-green-800 border-green-200",[m
[31m-     Cancelada:  "bg-red-100 text-red-800 border-red-200",[m
[31m-     Gerado:     "bg-green-100 text-green-800 border-green-200",[m
[31m-     Enviado:    "bg-blue-100 text-blue-800 border-blue-200",[m
[32m+   const map: Record<string, string> = {[m
[31m -    Ativo: "bg-green-100 text-green-800 border-green-200",[m
[31m -    Inativo: "bg-red-100 text-red-800 border-red-200",[m
[31m -    Pendente: "bg-yellow-100 text-yellow-800 border-yellow-200",[m
[31m -    Processado: "bg-green-100 text-green-800 border-green-200",[m
[31m -    Erro: "bg-red-100 text-red-800 border-red-200",[m
[31m -    Aberta: "bg-blue-100 text-blue-800 border-blue-200",[m
[31m -    Fechada: "bg-gray-100 text-gray-700 border-gray-200",[m
[31m -    Paga: "bg-green-100 text-green-800 border-green-200",[m
[31m -    Cancelada: "bg-red-100 text-red-800 border-red-200",[m
[32m++    Ativo:       "bg-green-100 text-green-800 border-green-200",[m
[32m++    Inativo:     "bg-red-100 text-red-800 border-red-200",[m
[32m++    Pendente:    "bg-yellow-100 text-yellow-800 border-yellow-200",[m
[32m++    Processado:  "bg-green-100 text-green-800 border-green-200",[m
[32m++    Erro:        "bg-red-100 text-red-800 border-red-200",[m
[32m++    Aberta:      "bg-blue-100 text-blue-800 border-blue-200",[m
[32m++    Fechada:     "bg-gray-100 text-gray-700 border-gray-200",[m
[32m++    Paga:        "bg-green-100 text-green-800 border-green-200",[m
[32m++    Cancelada:   "bg-red-100 text-red-800 border-red-200",[m
    };[m
    return ([m
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${map[value] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>[m
[36m@@@ -114,170 -95,334 +110,359 @@@[m
    );[m
  };[m
  [m
[31m- type TSummary = { movements: number; invoices: number; attachments: number; pendingMovements: number };[m
[32m+ // ═══════════════════════════════════════════════════════════════════════════[m
[32m+ // GRÁFICOS[m
[32m+ // ═══════════════════════════════════════════════════════════════════════════[m
[32m+ [m
[32m+ function ColunasAtivosInativos({ ativos, inativos }: { ativos: number; inativos: number }) {[m
[32m+   const total = ativos + inativos || 1;[m
[32m+   const maxH = 160;[m
[32m+   const hAtivo   = Math.round((ativos   / total) * maxH);[m
[32m+   const hInativo = Math.round((inativos / total) * maxH);[m
[32m+   return ([m
[32m+     <div className="rounded-2xl p-5" style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)" }}>[m
[32m+       <p className="text-sm font-bold text-[var(--primary-color)] mb-4">Beneficiários Ativos / Inativos</p>[m
[32m+       <div className="flex items-end justify-center gap-10" style={{ height: 200 }}>[m
[32m+         <div className="flex flex-col items-center gap-2">[m
[32m+           <span className="text-lg font-black text-green-700">{ativos}</span>[m
[31m -          <div className="w-20 rounded-t-xl transition-all duration-700"[m
[31m -            style={{ height: `${hAtivo || 6}px`, background: "linear-gradient(180deg, #22c55e, #16a34a)", minHeight: 6 }} />[m
[32m++          <div[m
[32m++            className="w-20 rounded-t-xl transition-all duration-700"[m
[32m++            style={{ height: `${hAtivo || 6}px`, background: "linear-gradient(180deg, #22c55e, #16a34a)", minHeight: 6 }}[m
[32m++          />[m
[32m+           <span className="text-sm font-semibold text-[var(--text-muted)]">Ativos</span>[m
[32m+         </div>[m
[32m+         <div className="flex flex-col items-center gap-2">[m
[32m+           <span className="text-lg font-black text-red-600">{inativos}</span>[m
[31m -          <div className="w-20 rounded-t-xl transition-all duration-700"[m
[31m -            style={{ height: `${hInativo || 6}px`, background: "linear-gradient(180deg, #ef4444, #dc2626)", minHeight: 6 }} />[m
[32m++          <div[m
[32m++            className="w-20 rounded-t-xl transition-all duration-700"[m
[32m++            style={{ height: `${hInativo || 6}px`, background: "linear-gradient(180deg, #ef4444, #dc2626)", minHeight: 6 }}[m
[32m++          />[m
[32m+           <span className="text-sm font-semibold text-[var(--text-muted)]">Inativos</span>[m
[32m+         </div>[m
[32m+       </div>[m
[32m+       <div className="flex justify-center gap-6 mt-3">[m
[32m+         <span className="text-sm text-[var(--text-muted)]">Total: <strong>{total}</strong></span>[m
[32m+         <span className="text-sm font-semibold text-green-600">{((ativos / total) * 100).toFixed(0)}% ativos</span>[m
[32m+       </div>[m
[32m+     </div>[m
[32m+   );[m
[32m+ }[m
[32m+ [m
[32m+ const PIZZA_COLORS = ["#003366","#0ea5e9","#22c55e","#f59e0b","#8b5cf6","#ef4444","#10b981","#f97316"];[m
[32m+ [m
[32m+ function PizzaProgramas({ data }: { data: { label: string; value: number }[] }) {[m
[32m+   const total = data.reduce((s, d) => s + d.value, 0) || 1;[m
[32m+   const cx = 100, cy = 100, r = 85;[m
[32m+   let startAngle = -Math.PI / 2;[m
[32m+   const slices = data.map((d, i) => {[m
[32m+     const angle = (d.value / total) * 2 * Math.PI;[m
[32m+     const endAngle = startAngle + angle;[m
[32m+     const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);[m
[32m+     const x2 = cx + r * Math.cos(endAngle),   y2 = cy + r * Math.sin(endAngle);[m
[32m+     const large = angle > Math.PI ? 1 : 0;[m
[32m+     const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;[m
[32m+     startAngle = endAngle;[m
[32m+     return { path, color: PIZZA_COLORS[i % PIZZA_COLORS.length], label: d.label, value: d.value };[m
[32m+   });[m
[32m+   return ([m
[32m+     <div className="rounded-2xl p-5" style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)" }}>[m
[32m+       <p className="text-sm font-bold text-[var(--primary-color)] mb-4">Programas Ativos</p>[m
[32m+       <div className="flex items-center gap-5">[m
[32m+         <svg viewBox="0 0 200 200" className="w-40 h-40 flex-shrink-0">[m
[32m+           {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth="1.5" />)}[m
[32m+           <circle cx={cx} cy={cy} r={r * 0.45} fill="var(--surface-card)" />[m
[32m+           <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--primary-color)">{data.length}</text>[m
[32m+           <text x={cx} y={cy + 18} textAnchor="middle" fontSize="9" fill="var(--text-muted)">programas</text>[m
[32m+         </svg>[m
[32m+         <div className="flex flex-col gap-2 flex-1 overflow-hidden">[m
[32m+           {slices.map((s, i) => ([m
[32m+             <div key={i} className="flex items-center gap-2">[m
[32m+               <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />[m
[32m+               <span className="text-xs text-[var(--text-muted)] truncate flex-1">{s.label}</span>[m
[32m+               <span className="text-sm font-bold flex-shrink-0" style={{ color: s.color }}>{s.value}</span>[m
[32m+             </div>[m
[32m+           ))}[m
[32m+           {data.length === 0 && <span className="text-xs text-[var(--text-muted)]">Sem dados</span>}[m
[32m+         </div>[m
[32m+       </div>[m
[32m+     </div>[m
[32m+   );[m
[32m+ }[m
[32m+ [m
[32m+ function BarrasMensalBeneficiarios({ data }: { data: { month: string; year: number; total: number }[] }) {[m
[32m+   const max = Math.max(...data.map(d => d.total), 1);[m
[32m+   const BAR_H = 160;[m
[32m+   return ([m
[32m+     <div className="rounded-2xl p-5" style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)" }}>[m
[32m+       <p className="text-sm font-bold text-[var(--primary-color)] mb-4">Evolução Mensal de Beneficiários</p>[m
[32m+       <div className="overflow-x-auto pb-1">[m
[32m+         <div className="flex items-end gap-2" style={{ minWidth: `${data.length * 56}px`, height: `${BAR_H + 48}px` }}>[m
[32m+           {data.map((d, i) => {[m
[32m+             const h = Math.max(6, Math.round((d.total / max) * BAR_H));[m
[32m+             return ([m
[32m+               <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0" style={{ width: 48 }}>[m
[32m+                 <span className="text-xs font-bold text-[var(--primary-color)]">{d.total || ""}</span>[m
[31m -                <div className="w-full rounded-t-xl transition-all duration-700"[m
[31m -                  style={{ height: `${h}px`, background: "linear-gradient(180deg, #0ea5e9, var(--primary-color))" }} />[m
[32m++                <div[m
[32m++                  className="w-full rounded-t-xl transition-all duration-700"[m
[32m++                  style={{ height: `${h}px`, background: "linear-gradient(180deg, #0ea5e9, var(--primary-color))" }}[m
[32m++                />[m
[32m+                 <span className="text-xs text-[var(--text-muted)] text-center leading-tight">[m
[32m+                   {d.month}<br /><span className="text-[10px]">{d.year}</span>[m
[31m -                  <br /><span className="text-[10px]">{d.total}</span>[m
[32m+                 </span>[m
[32m+               </div>[m
[32m+             );[m
[32m+           })}[m
[32m+         </div>[m
[32m+       </div>[m
[32m+     </div>[m
[32m+   );[m
[32m+ }[m
[32m+ [m
[31m -// ── ALTERAÇÃO 1: 1 barra por fatura individual (sem agrupamento) ──────────[m
[32m+ function BarrasMensalFaturas({ data }: { data: { month: string; year: number; count: number; total: number }[] }) {[m
[32m+   const maxTotal = Math.max(...data.map(d => d.total), 1);[m
[32m+   const BAR_H = 100;[m
[32m+   const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });[m
[32m+   return ([m
[32m+     <div className="rounded-2xl p-4" style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)" }}>[m
[32m+       <div className="flex items-center justify-between mb-3">[m
[32m+         <p className="text-xs font-bold text-[var(--primary-color)]">Evolução de Faturas</p>[m
[32m+         <div className="flex items-center gap-1.5">[m
[32m+           <div className="w-3 h-2.5 rounded-sm bg-green-500" />[m
[32m+           <span className="text-xs text-[var(--text-muted)]">Valor por fatura</span>[m
[32m+         </div>[m
[32m+       </div>[m
[32m+       <div className="overflow-x-auto pb-1">[m
[32m+         <div className="flex items-end gap-3" style={{ minWidth: `${data.length * 64}px`, height: `${BAR_H + 52}px` }}>[m
[32m+           {data.map((d, i) => {[m
[32m+             const h = Math.max(6, Math.round((d.total / maxTotal) * BAR_H));[m
[32m+             return ([m
[32m+               <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0" style={{ width: 56 }}>[m
[32m+                 <span className="text-[9px] font-bold text-green-600">{d.total > 0 ? fmt(d.total) : ""}</span>[m
[32m+                 <div className="flex items-end w-full justify-center" style={{ height: `${BAR_H}px` }}>[m
[31m -                  <div className="rounded-t-md transition-all duration-700 w-full"[m
[31m -                    style={{ height: `${h}px`, background: "linear-gradient(180deg, #22c55e, #16a34a)" }} />[m
[32m++                  <div[m
[32m++                    className="rounded-t-md transition-all duration-700 w-full"[m
[32m++                    style={{ height: `${h}px`, background: "linear-gradient(180deg, #22c55e, #16a34a)" }}[m
[32m++                  />[m
[32m+                 </div>[m
[32m+                 <span className="text-xs text-[var(--text-muted)] text-center leading-tight">[m
[32m+                   {d.month}<br /><span className="text-[10px]">{d.year}</span>[m
[32m+                 </span>[m
[32m+               </div>[m
[32m+ 