"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";

// ═══════════════════════════════════════════════════════════════════════════
// Modal Invoice
// ═══════════════════════════════════════════════════════════════════════════
type TInvoiceForm = {
  customerId:       string;
  referenceMonth:   string;
  referenceYear:    string;
  cycleStart:       string;
  cycleEnd:         string;
  totalAmount:      string;
  beneficiaryCount: string;
  dueDate:          string;
  status:           string;
};

type TInvoiceProps = {
  isOpen:    boolean;
  typeModal: "create" | "edit";
  body:      any;
  customers: any[];
  onClose:   () => void;
  onSuccess: () => void;
};

export const ModalB2BInvoice = ({ isOpen, typeModal, body, customers, onClose, onSuccess }: TInvoiceProps) => {
  const { register, handleSubmit, reset, watch } = useForm<TInvoiceForm>();

  const refMonth = watch("referenceMonth");
  const refYear  = watch("referenceYear");

  // item 5: calcula data de corte (último dia do mês) no frontend para exibição
  const closingDateLabel = useMemo(() => {
    const m = parseInt(refMonth);
    const y = parseInt(refYear);
    if (!m || !y) return "—";
    const lastDay = new Date(y, m, 0).getDate(); // dia 0 do próximo mês = último dia do mês atual
    return `${String(lastDay).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  }, [refMonth, refYear]);

  useEffect(() => {
    if (!isOpen) return;
    if (typeModal === "edit" && body?.id) {
      reset({
        customerId:       body.customerId ?? "",
        referenceMonth:   String(body.referenceMonth ?? ""),
        referenceYear:    String(body.referenceYear ?? ""),
        cycleStart:       body.cycleStart?.split("T")[0] ?? "",
        cycleEnd:         body.cycleEnd?.split("T")[0] ?? "",
        totalAmount:      String(body.totalAmount ?? ""),
        beneficiaryCount: String(body.beneficiaryCount ?? ""),
        dueDate:          body.dueDate?.split("T")[0] ?? "",
        status:           body.status ?? "",
      });
    } else if (typeModal === "create") {
      reset({});
    }
  }, [isOpen, typeModal, body?.id]);

  if (!isOpen) return null;

  const onSubmit = async (values: TInvoiceForm) => {
    try {
      const payload = {
        customerId:       values.customerId,
        referenceMonth:   Number(values.referenceMonth),
        referenceYear:    Number(values.referenceYear),
        cycleStart:       values.cycleStart,
        cycleEnd:         values.cycleEnd,
        totalAmount:      Number(values.totalAmount),
        beneficiaryCount: Number(values.beneficiaryCount),
        dueDate:          values.dueDate || null,
        status:           values.status || "Aberta",
      };

      if (typeModal === "create") {
        const { status } = await api.post("/b2b-invoices", payload, configApi());
        resolveResponse({ status, message: "Fatura criada com sucesso" });
      } else {
        const { status } = await api.put("/b2b-invoices", { ...payload, id: body.id }, configApi());
        resolveResponse({ status, message: "Fatura atualizada com sucesso" });
      }
      onSuccess();
    } catch (error) {
      resolveResponse(error);
    }
  };

  const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  return (
    <div className="fixed inset-0 z-999 flex items-start justify-center pt-14 px-4 pb-6 overflow-y-auto"
      style={{ background: "rgba(0,15,35,.65)", backdropFilter: "blur(5px)" }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)", animation: "modal-slide-in .25s cubic-bezier(.34,1.56,.64,1)" }}>

        <div className="flex items-center justify-between px-6 h-14"
          style={{ background: "linear-gradient(135deg, var(--primary-color-light) 0%, var(--primary-color) 100%)", borderBottom: "2px solid var(--accent-color)" }}>
          <span className="text-white font-bold text-sm">
            {typeModal === "create" ? "Nova Fatura" : "Editar Fatura"}
          </span>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors"><IoClose size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 grid grid-cols-12 gap-4">

          <div className="flex flex-col col-span-6 sm:col-span-3">
            <label className="label slim-label-primary">Mês *</label>
            <select {...register("referenceMonth", { required: true })} className="select slim-select-primary">
              <option value="">Mês</option>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>

          <div className="flex flex-col col-span-6 sm:col-span-3">
            <label className="label slim-label-primary">Ano *</label>
            <input {...register("referenceYear", { required: true })} type="number" className="input slim-input-primary" placeholder={String(new Date().getFullYear())} />
          </div>

          {/* item 5: Data de Corte — calculada automaticamente, somente leitura */}
          <div className="flex flex-col col-span-12 sm:col-span-6">
            <label className="label slim-label-primary">Data de Corte / Fechamento</label>
            <div className="input slim-input-primary flex items-center text-sm"
              style={{ background: "var(--surface-bg)", color: "var(--text-muted)", cursor: "default" }}>
              {closingDateLabel}
              <span className="ml-2 text-xs opacity-60">(último dia do mês)</span>
            </div>
          </div>

          <div className="flex flex-col col-span-6 sm:col-span-3">
            <label className="label slim-label-primary">Início do ciclo</label>
            <input {...register("cycleStart")} type="date" className="input slim-input-primary" />
          </div>

          <div className="flex flex-col col-span-6 sm:col-span-3">
            <label className="label slim-label-primary">Fim do ciclo</label>
            <input {...register("cycleEnd")} type="date" className="input slim-input-primary" />
          </div>

          <div className="flex flex-col col-span-6 sm:col-span-3">
            <label className="label slim-label-primary">Vencimento</label>
            <input {...register("dueDate")} type="date" className="input slim-input-primary" />
          </div>

          <div className="flex flex-col col-span-6 sm:col-span-3">
            <label className="label slim-label-primary">Status</label>
            <select {...register("status")} className="select slim-select-primary">
              <option value="Aberta">Aberta</option>
              <option value="Fechada">Fechada</option>
              <option value="Paga">Paga</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          <div className="flex flex-col col-span-6 sm:col-span-4">
            <label className="label slim-label-primary">Valor Total (R$)</label>
            <input {...register("totalAmount")} type="number" step="0.01" className="input slim-input-primary" placeholder="0.00" />
          </div>

          <div className="flex flex-col col-span-6 sm:col-span-4">
            <label className="label slim-label-primary">Qtd. Beneficiários</label>
            <input {...register("beneficiaryCount")} type="number" className="input slim-input-primary" placeholder="0" />
          </div>

          <div className="col-span-12 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="slim-btn slim-btn-secondary">Cancelar</button>
            <button type="submit" className="slim-btn slim-btn-primary">
              {typeModal === "create" ? "Criar Fatura" : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Modal Attachment
// ═══════════════════════════════════════════════════════════════════════════
type TAttachmentForm = {
  customerId: string;
  name:       string;
  fileUrl:    string;
  fileName:   string;
  fileType:   string;
  required:   boolean;
  notes:      string;
  file: any;
};

type TAttachmentProps = {
  isOpen:    boolean;
  typeModal: "create" | "edit";
  body:      any;
  customers: any[];
  onClose:   () => void;
  onSuccess: () => void;
};

export const ModalB2BAttachment = ({ isOpen, typeModal, body, customers, onClose, onSuccess }: TAttachmentProps) => {
  const { register, handleSubmit, reset } = useForm<TAttachmentForm>();

  useEffect(() => {
    if (isOpen && typeModal === "edit" && body?.id) {
      reset({ customerId: body.customerId ?? "", name: body.name ?? "", fileUrl: body.fileUrl ?? "", fileName: body.fileName ?? "", fileType: body.fileType ?? "", required: body.required ?? false, notes: body.notes ?? "" });
    } else if (isOpen && typeModal === "create") {
      reset({});
    }
  }, [isOpen, typeModal, body]);

  if (!isOpen) return null;

  const onSubmit = async (values: TAttachmentForm) => {
    try {
      const payload = { ...values };
      const formBody = new FormData();
      const id = localStorage.getItem("id");
      formBody.append("parent", "customer-manager");
      formBody.append("description", payload.name);
      if (id) formBody.append("parentId", id);

      const attachment: any = document.querySelector("#attachment");
      if (attachment.files[0]) formBody.append("file", attachment.files[0]);

      if (typeModal === "create") {
        const { status } = await api.post("/attachments", formBody, configApi(false));
        resolveResponse({ status, message: "Anexo criado com sucesso" });
      } else {
        const { status } = await api.put("/attachments", { ...payload, id: body.id }, configApi());
        resolveResponse({ status, message: "Anexo atualizado com sucesso" });
      }
      onSuccess();
    } catch (error) {
      resolveResponse(error);
    }
  };

  return (
    <div className="fixed inset-0 z-999 flex items-start justify-center pt-14 px-4 pb-6 overflow-y-auto"
      style={{ background: "rgba(0,15,35,.65)", backdropFilter: "blur(5px)" }}>
      <div className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)", animation: "modal-slide-in .25s cubic-bezier(.34,1.56,.64,1)" }}>

        <div className="flex items-center justify-between px-6 h-14"
          style={{ background: "linear-gradient(135deg, var(--primary-color-light) 0%, var(--primary-color) 100%)", borderBottom: "2px solid var(--accent-color)" }}>
          <span className="text-white font-bold text-sm">
            {typeModal === "create" ? "Novo Anexo" : "Editar Anexo"}
          </span>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors"><IoClose size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 grid grid-cols-12 gap-4">
          <div className="flex flex-col col-span-12">
            <label className="label slim-label-primary">Anexo *</label>
            <input id="attachment" {...register("file")} type="file" className="input slim-input-primary" />
          </div>
          <div className="flex flex-col col-span-12">
            <label className="label slim-label-primary">Nome do Anexo *</label>
            <input {...register("name")} type="text" className="input slim-input-primary" placeholder="Nome descritivo obrigatório" />
          </div>
          <div className="col-span-12 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="slim-btn slim-btn-secondary">Cancelar</button>
            <button type="submit" className="slim-btn slim-btn-primary">
              {typeModal === "create" ? "Criar Anexo" : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
