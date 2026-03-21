"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { FiUpload, FiUserPlus } from "react-icons/fi";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";

type TProps = {
  isOpen:    boolean;
  typeModal: "create" | "edit";
  body:      any;
  customers: any[];
  onClose:   () => void;
  onSuccess: () => void;
};

type TForm = {
  // manual
  name:        string;
  cpf:         string;
  dateOfBirth: string;
  gender:      string;
  email:       string;
  phone:       string;
  whatsapp:    string;
  department:  string;
  role:        string;
  planId:      string;
  effectiveDate: string;
  bond:        string;
  // arquivo
  file: any;
};

export const ModalB2BMassMovement = ({ isOpen, typeModal, body, customers, onClose, onSuccess }: TProps) => {
  const { register, watch, handleSubmit, reset } = useForm<TForm>();
  const [loading, setLoading] = useAtom(loadingAtom);
  const [tab, setTab] = useState<"import" | "manual">("import");
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTab("import");
      reset({});
      loadPlans();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    try {
      const { data } = await api.get(`/plans?deleted=false&orderBy=name&sort=asc&pageSize=200&pageNumber=1`, configApi());
      setPlans(data.result.data ?? []);
    } catch {}
  };

  if (!isOpen) return null;

  // ── Importar via Excel ────────────────────────────────────────────────────
  const onSubmitImport = async () => {
    try {
      setLoading(true);
      const formBody = new FormData();
      const attachment: any = document.querySelector("#attachment-import");
      if (!attachment?.files?.[0]) {
        resolveResponse({ status: 400, response: { data: { result: { message: "Selecione um arquivo." } } } });
        return;
      }
      formBody.append("file", attachment.files[0]);
      const { status } = await api.put("/customer-recipients/import-manager-painel", formBody, configApi(false));
      resolveResponse({ status, message: "Importação realizada com sucesso" });
      onSuccess();
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };

  // ── Cadastro Manual ───────────────────────────────────────────────────────
  const onSubmitManual = async (values: TForm) => {
    try {
      setLoading(true);
      const contractorId = localStorage.getItem("id") ?? "";
      const payload = {
        contractorId,
        name:          values.name,
        cpf:           values.cpf,
        dateOfBirth:   values.dateOfBirth || null,
        gender:        values.gender,
        email:         values.email,
        phone:         values.phone,
        whatsapp:      values.whatsapp,
        department:    values.department,
        role:          values.role,  
        planId:        values.planId,
        effectiveDate: values.effectiveDate || null,
        bond:          values.bond,
      };
      const { status } = await api.post("/customer-recipients", payload, configApi());
      resolveResponse({ status, message: "Beneficiário adicionado com sucesso" });
      onSuccess();
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-999 flex items-start justify-center pt-14 px-4 pb-6 overflow-y-auto"
      style={{ background: "rgba(0,15,35,.65)", backdropFilter: "blur(5px)" }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)", animation: "modal-slide-in .25s cubic-bezier(.34,1.56,.64,1)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 h-14"
          style={{ background: "linear-gradient(135deg, var(--primary-color-light) 0%, var(--primary-color) 100%)", borderBottom: "2px solid var(--accent-color)" }}>
          <span className="text-white font-bold text-sm">Adicionar Beneficiário</span>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors"><IoClose size={20} /></button>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 p-3 pb-0" style={{ background: "var(--surface-bg)", borderBottom: "1px solid var(--surface-border)" }}>
          {([
            { key: "import", label: "Importar Excel", icon: <FiUpload size={13} /> },
            { key: "manual", label: "Cadastro Manual", icon: <FiUserPlus size={13} /> },
          ] as const).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-t-lg transition-all"
              style={tab === t.key
                ? { background: "var(--surface-card)", color: "var(--primary-color)", borderBottom: "2px solid var(--primary-color)" }
                : { color: "var(--text-muted)" }}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {tab === "import" && (
          <div className="p-6 flex flex-col gap-4">
            <p className="text-xs text-[var(--text-muted)]">
              Faça o upload de uma planilha Excel no formato exportado pelo sistema. O arquivo deve conter a aba <strong>Beneficiários</strong>.
            </p>
            <div className="flex flex-col gap-1">
              <label className="label slim-label-primary">Arquivo Excel *</label>
              <input id="attachment-import" type="file" accept=".xlsx,.xls,.csv"
                className="input slim-input-primary" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="slim-btn slim-btn-secondary">Cancelar</button>
              <button type="button" onClick={onSubmitImport} className="slim-btn slim-btn-primary">
                Importar
              </button>
            </div>
          </div>
        )}

        {tab === "manual" && (
          <form onSubmit={handleSubmit(onSubmitManual)} className="p-6 grid grid-cols-12 gap-4">

            <div className="flex flex-col col-span-12 sm:col-span-6">
              <label className="label slim-label-primary">Nome completo *</label>
              <input {...register("name", { required: true })} type="text" className="input slim-input-primary" placeholder="Nome completo" />
            </div>
            <div className="flex flex-col col-span-12 sm:col-span-6">
              <label className="label slim-label-primary">CPF *</label>
              <input {...register("cpf", { required: true })} type="text" className="input slim-input-primary" placeholder="000.000.000-00" />
            </div>
            <div className="flex flex-col col-span-6 sm:col-span-4">
              <label className="label slim-label-primary">Data de Nascimento</label>
              <input {...register("dateOfBirth")} type="date" className="input slim-input-primary" />
            </div>
            <div className="flex flex-col col-span-6 sm:col-span-4">
              <label className="label slim-label-primary">Sexo</label>
              <select {...register("gender")} className="select slim-select-primary">
                <option value="">Selecione</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div className="flex flex-col col-span-6 sm:col-span-4">
              <label className="label slim-label-primary">Vínculo</label>
              <select {...register("bond")} className="select slim-select-primary">
                <option value="">Selecione</option>
                <option value="Titular">Titular</option>
                <option value="Dependente">Dependente</option>
              </select>
            </div>
            <div className="flex flex-col col-span-12 sm:col-span-6">
              <label className="label slim-label-primary">E-mail</label>
              <input {...register("email")} type="email" className="input slim-input-primary" />
            </div>
            <div className="flex flex-col col-span-6 sm:col-span-3">
              <label className="label slim-label-primary">Telefone</label>
              <input {...register("phone")} type="text" className="input slim-input-primary" />
            </div>
            <div className="flex flex-col col-span-6 sm:col-span-3">
              <label className="label slim-label-primary">WhatsApp</label>
              <input {...register("whatsapp")} type="text" className="input slim-input-primary" />
            </div>
            {
              watch("bond") == "Titular" && (
                <>
                  <div className="flex flex-col col-span-12 sm:col-span-4">
                    <label className="label slim-label-primary">Departamento</label>
                    <input {...register("department")} type="text" className="input slim-input-primary" />
                  </div>
                  <div className="flex flex-col col-span-12 sm:col-span-4">
                    <label className="label slim-label-primary">Função</label>
                    <input {...register("role")} type="text" className="input slim-input-primary" />
                  </div>
                </>
              )
            }
            <div className="flex flex-col col-span-12 sm:col-span-4">
              <label className="label slim-label-primary">Data de Vigência</label>
              <input {...register("effectiveDate")} type="date" className="input slim-input-primary" />
            </div>
            <div className="flex flex-col col-span-12">
              <label className="label slim-label-primary">Programa (Plano)</label>
              <select {...register("planId")} className="select slim-select-primary">
                <option value="">Selecione</option>
                {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="col-span-12 flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="slim-btn slim-btn-secondary">Cancelar</button>
              <button type="submit" className="slim-btn slim-btn-primary">Adicionar Beneficiário</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
