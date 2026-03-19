"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";

// ═══════════════════════════════════════════════════════════════════════════
// Modal Micro Checkin
// ═══════════════════════════════════════════════════════════════════════════
type TCheckinForm = {
  customerId:         string;
  recipientId:        string;
  department:         string;
  role:               string;
  dimension:          string;
  engagementLevel:    string;
  riskClassification: string;
  riskLevel:          string;
  safetyPerception:   string;
  absenceRisk:        string;
  econometerScore:    string;
  checkinDate:        string;
  period:             string;
  notes:              string;
};

type TCheckinProps = {
  isOpen:    boolean;
  typeModal: "create" | "edit";
  body:      any;
  customers: any[];
  onClose:   () => void;
  onSuccess: () => void;
};

export const ModalOccupationalCheckin = ({ isOpen, typeModal, body, customers, onClose, onSuccess }: TCheckinProps) => {
  const { register, handleSubmit, reset } = useForm<TCheckinForm>();

  useEffect(() => {
    if (isOpen && typeModal === "edit" && body?.id) {
      reset({
        customerId:         body.customerId ?? "",
        recipientId:        body.recipientId ?? "",
        department:         body.department ?? "",
        role:               body.role ?? "",
        dimension:          body.dimension ?? "",
        engagementLevel:    String(body.engagementLevel ?? ""),
        riskClassification: body.riskClassification ?? "",
        riskLevel:          String(body.riskLevel ?? ""),
        safetyPerception:   String(body.safetyPerception ?? ""),
        absenceRisk:        String(body.absenceRisk ?? ""),
        econometerScore:    String(body.econometerScore ?? ""),
        checkinDate:        body.checkinDate?.split("T")[0] ?? "",
        period:             body.period ?? "",
        notes:              body.notes ?? "",
      });
    } else if (isOpen && typeModal === "create") {
      reset({ checkinDate: new Date().toISOString().split("T")[0] });
    }
  }, [isOpen, typeModal, body]);

  if (!isOpen) return null;

  const onSubmit = async (values: TCheckinForm) => {
    try {
      const payload = {
        ...values,
        engagementLevel:  Number(values.engagementLevel),
        riskLevel:        Number(values.riskLevel),
        safetyPerception: Number(values.safetyPerception),
        absenceRisk:      Number(values.absenceRisk),
        econometerScore:  Number(values.econometerScore),
      };
      if (typeModal === "create") {
        const { status } = await api.post("/occupational-micro-checkins", payload, configApi());
        resolveResponse({ status, message: "Checkin registrado com sucesso" });
      } else {
        const { status } = await api.put("/occupational-micro-checkins", { ...payload, id: body.id }, configApi());
        resolveResponse({ status, message: "Checkin atualizado com sucesso" });
      }
      onSuccess();
    } catch (error) { resolveResponse(error); }
  };

  // helper para campos numéricos com slider visual
  const ScoreField = ({ label, field, register }: { label: string; field: keyof TCheckinForm; register: any }) => (
    <div className="flex flex-col col-span-12 sm:col-span-4">
      <label className="label slim-label-primary">{label}</label>
      <input {...register(field)} type="number" step="0.1" min="0" max="10" className="input slim-input-primary" placeholder="0.0 – 10.0" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-999 flex items-start justify-center pt-14 px-4 pb-6 overflow-y-auto"
      style={{ background: "rgba(0,15,35,.65)", backdropFilter: "blur(5px)" }}>
      <div className="w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)", animation: "modal-slide-in .25s cubic-bezier(.34,1.56,.64,1)" }}>

        <div className="flex items-center justify-between px-6 h-14"
          style={{ background: "linear-gradient(135deg, var(--primary-color-light) 0%, var(--primary-color) 100%)", borderBottom: "2px solid var(--accent-color)" }}>
          <span className="text-white font-bold text-sm">
            {typeModal === "create" ? "Novo Micro Checkin ISO" : "Editar Micro Checkin"}
          </span>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors"><IoClose size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 grid grid-cols-12 gap-4">

          {/* Empresa */}
          <div className="flex flex-col col-span-12 sm:col-span-6">
            <label className="label slim-label-primary">Empresa *</label>
            <select {...register("customerId", { required: true })} className="select slim-select-primary">
              <option value="">Selecione</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.corporateName}</option>)}
            </select>
          </div>

          {/* Data */}
          <div className="flex flex-col col-span-6 sm:col-span-3">
            <label className="label slim-label-primary">Data do Checkin</label>
            <input {...register("checkinDate")} type="date" className="input slim-input-primary" />
          </div>

          {/* Período */}
          <div className="flex flex-col col-span-6 sm:col-span-3">
            <label className="label slim-label-primary">Período</label>
            <select {...register("period")} className="select slim-select-primary">
              <option value="">Selecione</option>
              <option value="Manha">Manhã</option>
              <option value="Tarde">Tarde</option>
              <option value="Noite">Noite</option>
            </select>
          </div>

          {/* Departamento */}
          <div className="flex flex-col col-span-12 sm:col-span-4">
            <label className="label slim-label-primary">Departamento</label>
            <input {...register("department")} type="text" className="input slim-input-primary" placeholder="Ex: Operações" />
          </div>

          {/* Função */}
          <div className="flex flex-col col-span-12 sm:col-span-4">
            <label className="label slim-label-primary">Função</label>
            <input {...register("role")} type="text" className="input slim-input-primary" placeholder="Ex: Operador" />
          </div>

          {/* Dimensão */}
          <div className="flex flex-col col-span-12 sm:col-span-4">
            <label className="label slim-label-primary">Dimensão</label>
            <input {...register("dimension")} type="text" className="input slim-input-primary" placeholder="Ex: Psicossocial" />
          </div>

          {/* Separador Scores */}
          <div className="col-span-12">
            <div className="h-px mb-2" style={{ background: "var(--surface-border)" }} />
            <p className="text-xs font-bold text-[var(--primary-color)] mb-1">
              Scores — Simulador de Diagnóstico Ocupacional
            </p>
          </div>

          {/* Classificação de Risco */}
          <div className="flex flex-col col-span-12 sm:col-span-4">
            <label className="label slim-label-primary">Classificação de Risco</label>
            <select {...register("riskClassification")} className="select slim-select-primary">
              <option value="">Selecione</option>
              <option value="Baixo">Baixo</option>
              <option value="Médio">Médio</option>
              <option value="Alto">Alto</option>
              <option value="Crítico">Crítico</option>
            </select>
          </div>

          <ScoreField label="Nível de Engajamento"       field="engagementLevel"  register={register} />
          <ScoreField label="Nível de Risco"             field="riskLevel"        register={register} />
          <ScoreField label="Percepção de Segurança"     field="safetyPerception" register={register} />
          <ScoreField label="Risco de Afastamento"       field="absenceRisk"      register={register} />
          <ScoreField label="Econômetro"                 field="econometerScore"  register={register} />

          {/* Notas */}
          <div className="flex flex-col col-span-12">
            <label className="label slim-label-primary">Observações</label>
            <textarea {...register("notes")} rows={2} className="input slim-input-primary resize-none" />
          </div>

          <div className="col-span-12 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="slim-btn slim-btn-secondary">Cancelar</button>
            <button type="submit" className="slim-btn slim-btn-primary">
              {typeModal === "create" ? "Registrar Checkin" : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Modal Bem Vital
// ═══════════════════════════════════════════════════════════════════════════
type TBemVitalForm = {
  customerId:    string;
  recipientId:   string;
  department:    string;
  role:          string;
  referenceDate: string;
  igs: string; ign: string; ies: string; ipv: string;
  notes: string;
};

type TBemVitalProps = {
  isOpen:    boolean;
  typeModal: "create" | "edit";
  body:      any;
  customers: any[];
  onClose:   () => void;
  onSuccess: () => void;
};

export const ModalOccupationalBemVital = ({ isOpen, typeModal, body, customers, onClose, onSuccess }: TBemVitalProps) => {
  const { register, handleSubmit, reset } = useForm<TBemVitalForm>();

  useEffect(() => {
    if (isOpen && typeModal === "edit" && body?.id) {
      reset({
        customerId:    body.customerId ?? "",
        recipientId:   body.recipientId ?? "",
        department:    body.department ?? "",
        role:          body.role ?? "",
        referenceDate: body.referenceDate?.split("T")[0] ?? "",
        igs: String(body.igs ?? ""), ign: String(body.ign ?? ""),
        ies: String(body.ies ?? ""), ipv: String(body.ipv ?? ""),
        notes: body.notes ?? "",
      });
    } else if (isOpen && typeModal === "create") {
      reset({ referenceDate: new Date().toISOString().split("T")[0] });
    }
  }, [isOpen, typeModal, body]);

  if (!isOpen) return null;

  const onSubmit = async (values: TBemVitalForm) => {
    try {
      const payload = { ...values, igs: Number(values.igs), ign: Number(values.ign), ies: Number(values.ies), ipv: Number(values.ipv) };
      if (typeModal === "create") {
        const { status } = await api.post("/occupational-bem-vitals", payload, configApi());
        resolveResponse({ status, message: "Bem Vital registrado com sucesso" });
      } else {
        const { status } = await api.put("/occupational-bem-vitals", { ...payload, id: body.id }, configApi());
        resolveResponse({ status, message: "Bem Vital atualizado com sucesso" });
      }
      onSuccess();
    } catch (error) { resolveResponse(error); }
  };

  const indices = [
    { label: "IGS — Índice Geral de Saúde",    field: "igs" },
    { label: "IGN — Índice Geral de Nutrição",  field: "ign" },
    { label: "IES — Índice Engajamento Social", field: "ies" },
    { label: "IPV — Índice Performance de Vida",field: "ipv" },
  ] as const;

  return (
    <div className="fixed inset-0 z-999 flex items-start justify-center pt-14 px-4 pb-6 overflow-y-auto"
      style={{ background: "rgba(0,15,35,.65)", backdropFilter: "blur(5px)" }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)", animation: "modal-slide-in .25s cubic-bezier(.34,1.56,.64,1)" }}>

        <div className="flex items-center justify-between px-6 h-14"
          style={{ background: "linear-gradient(135deg, var(--primary-color-light) 0%, var(--primary-color) 100%)", borderBottom: "2px solid var(--accent-color)" }}>
          <span className="text-white font-bold text-sm">
            {typeModal === "create" ? "Novo Registro Bem Vital" : "Editar Bem Vital"}
          </span>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors"><IoClose size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 grid grid-cols-12 gap-4">

          <div className="flex flex-col col-span-12 sm:col-span-6">
            <label className="label slim-label-primary">Empresa *</label>
            <select {...register("customerId", { required: true })} className="select slim-select-primary">
              <option value="">Selecione</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.corporateName}</option>)}
            </select>
          </div>

          <div className="flex flex-col col-span-12 sm:col-span-3">
            <label className="label slim-label-primary">Data de Referência</label>
            <input {...register("referenceDate")} type="date" className="input slim-input-primary" />
          </div>

          <div className="flex flex-col col-span-12 sm:col-span-3">
            <label className="label slim-label-primary">Departamento</label>
            <input {...register("department")} type="text" className="input slim-input-primary" />
          </div>

          <div className="flex flex-col col-span-12 sm:col-span-4">
            <label className="label slim-label-primary">Função</label>
            <input {...register("role")} type="text" className="input slim-input-primary" />
          </div>

          <div className="col-span-12">
            <div className="h-px mb-3" style={{ background: "var(--surface-border)" }} />
            <p className="text-xs font-bold text-[var(--primary-color)] mb-3">Índices Bem Vital (0 – 10)</p>
          </div>

          {indices.map(({ label, field }) => (
            <div key={field} className="flex flex-col col-span-12 sm:col-span-6">
              <label className="label slim-label-primary">{label}</label>
              <input {...register(field)} type="number" step="0.1" min="0" max="10"
                className="input slim-input-primary" placeholder="0.0 – 10.0" />
            </div>
          ))}

          <div className="flex flex-col col-span-12">
            <label className="label slim-label-primary">Observações</label>
            <textarea {...register("notes")} rows={2} className="input slim-input-primary resize-none" />
          </div>

          <div className="col-span-12 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="slim-btn slim-btn-secondary">Cancelar</button>
            <button type="submit" className="slim-btn slim-btn-primary">
              {typeModal === "create" ? "Registrar" : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Modal PGR
// ═══════════════════════════════════════════════════════════════════════════
type TPgrForm = { customerId: string; referenceMonth: string; referenceYear: string; };

type TPgrProps = {
  isOpen:    boolean;
  customers: any[];
  onClose:   () => void;
  onSuccess: () => void;
};

export const ModalOccupationalPgr = ({ isOpen, customers, onClose, onSuccess }: TPgrProps) => {
  const { register, handleSubmit, reset } = useForm<TPgrForm>({
    defaultValues: {
      referenceMonth: String(new Date().getMonth() + 1),
      referenceYear:  String(new Date().getFullYear()),
    },
  });

  useEffect(() => { if (isOpen) reset({ referenceMonth: String(new Date().getMonth() + 1), referenceYear: String(new Date().getFullYear()) }); }, [isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (values: TPgrForm) => {
    try {
      const payload = { customerId: values.customerId, referenceMonth: Number(values.referenceMonth), referenceYear: Number(values.referenceYear) };
      const { status } = await api.post("/occupational-pgr/generate", payload, configApi());
      resolveResponse({ status, message: "PGR gerado com sucesso" });
      onSuccess();
    } catch (error) { resolveResponse(error); }
  };

  const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  return (
    <div className="fixed inset-0 z-999 flex items-start justify-center pt-14 px-4 pb-6 overflow-y-auto"
      style={{ background: "rgba(0,15,35,.65)", backdropFilter: "blur(5px)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)", animation: "modal-slide-in .25s cubic-bezier(.34,1.56,.64,1)" }}>

        <div className="flex items-center justify-between px-6 h-14"
          style={{ background: "linear-gradient(135deg, var(--primary-color-light) 0%, var(--primary-color) 100%)", borderBottom: "2px solid var(--accent-color)" }}>
          <span className="text-white font-bold text-sm">Gerar PGR — Programa de Gerenciamento de Riscos</span>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors"><IoClose size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 grid grid-cols-12 gap-4">

          <div className="flex flex-col col-span-12">
            <label className="label slim-label-primary">Empresa *</label>
            <select {...register("customerId", { required: true })} className="select slim-select-primary">
              <option value="">Selecione a empresa</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.corporateName}</option>)}
            </select>
          </div>

          <div className="flex flex-col col-span-6">
            <label className="label slim-label-primary">Mês de Referência *</label>
            <select {...register("referenceMonth", { required: true })} className="select slim-select-primary">
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>

          <div className="flex flex-col col-span-6">
            <label className="label slim-label-primary">Ano *</label>
            <input {...register("referenceYear", { required: true })} type="number" className="input slim-input-primary" />
          </div>

          <div className="col-span-12 px-4 py-3 rounded-xl text-xs text-[var(--text-muted)]"
            style={{ background: "var(--surface-bg)", border: "1px solid var(--surface-border)" }}>
            O sistema consolidará automaticamente todos os registros de Micro Checkins do período selecionado,
            calculando médias de engajamento, risco, percepção de segurança, risco de afastamento e econômetro.
            O PDF será gerado conforme a aba PGR Consolidado da planilha Simulador de Diagnóstico Ocupacional.
          </div>

          <div className="col-span-12 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="slim-btn slim-btn-secondary">Cancelar</button>
            <button type="submit" className="slim-btn slim-btn-primary">Gerar PGR</button>
          </div>
        </form>
      </div>
    </div>
  );
};
