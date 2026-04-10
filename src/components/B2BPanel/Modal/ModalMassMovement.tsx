"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { FiUpload, FiUserPlus, FiDownload } from "react-icons/fi";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import {
  ModalImportValidation,
  parseSheetByIndex,
  validateImportRows,
  downloadTemplate,
  TImportRowValidated,
} from "@/components/MasterData/Customer/ModalImportValidation";

type TProps = {
  isOpen:    boolean;
  typeModal: "create" | "edit";
  body:      any;
  customers: any[];
  onClose:   () => void;
  onSuccess: () => void;
};

type TForm = {
  name:          string;
  cpf:           string;
  dateOfBirth:   string;
  gender:        string;
  email:         string;
  phone:         string;
  whatsapp:      string;
  department:    string;
  role:          string;
  planId:        string;
  effectiveDate: string;
  bond:          string;
  file:          any;
};

export const ModalB2BMassMovement = ({ isOpen, typeModal, body, customers, onClose, onSuccess }: TProps) => {
  const { register, watch, handleSubmit, reset, formState: { errors } } = useForm<TForm>();
  const [loading, setLoading] = useAtom(loadingAtom);
  const [tab, setTab] = useState<"import" | "manual">("import");
  const [plans, setPlans] = useState<any[]>([]);
  const [modalValidation, setModalValidation] = useState(false);
  const [validationRows, setValidationRows] = useState<TImportRowValidated[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleFileSelect = () => {
    const attachment: any = document.querySelector("#attachment-import");
    const file: File | undefined = attachment?.files?.[0];

    if (!file) {
      toast.warn("Selecione um arquivo antes de continuar.", { theme: "colored" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const normalized = parseSheetByIndex(workbook);

        if (normalized.length === 0) {
          toast.warn("A planilha está vazia ou fora do modelo esperado. Baixe e use a planilha modelo.", { theme: "colored" });
          return;
        }

        const validated = validateImportRows(normalized);
        setValidationRows(validated);
        setPendingFile(file);
        setModalValidation(true);
      } catch {
        toast.error("Erro ao ler o arquivo. Use a planilha modelo para garantir o formato correto.", { theme: "colored" });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmImport = async () => {
    if (!pendingFile) return;
    try {
      setUploading(true);
      const formBody = new FormData();
      formBody.append("file", pendingFile);
      const { status } = await api.put("/customer-recipients/import-manager-painel", formBody, configApi(false));
      resolveResponse({ status, message: "Importação realizada com sucesso" });
      setModalValidation(false);
      setPendingFile(null);
      setValidationRows([]);
      const attachment: any = document.querySelector("#attachment-import");
      if (attachment) attachment.value = "";
      onSuccess();
    } catch (error) {
      resolveResponse(error);
    } finally {
      setUploading(false);
    }
  };

  const handleCloseValidation = () => {
    setModalValidation(false);
    setPendingFile(null);
    setValidationRows([]);
    const attachment: any = document.querySelector("#attachment-import");
    if (attachment) attachment.value = "";
  };

  const onSubmitManual = async (values: TForm) => {
    try {
      setLoading(true);
      const contractorId = localStorage.getItem("contractorId") ?? "";
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
    <>
      <div
        className="fixed inset-0 z-999 flex items-start justify-center pt-14 px-4 pb-6 overflow-y-auto"
        style={{ background: "rgba(0,15,35,.65)", backdropFilter: "blur(5px)" }}
      >
        <div
          className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)", animation: "modal-slide-in .25s cubic-bezier(.34,1.56,.64,1)" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 h-14"
            style={{ background: "linear-gradient(135deg, var(--primary-color-light) 0%, var(--primary-color) 100%)", borderBottom: "2px solid var(--accent-color)" }}
          >
            <span className="text-white font-bold text-sm">Adicionar Beneficiário</span>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors"><IoClose size={20} /></button>
          </div>

          {tab === "import" && (
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="label slim-label-primary">Arquivo Excel *</label>
                <input id="attachment-import" type="file" accept=".xlsx,.xls" className="input slim-input-primary" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="slim-btn slim-btn-secondary">Cancelar</button>
                <button type="button" onClick={handleFileSelect} className="slim-btn slim-btn-primary">Importar</button>
              </div>
            </div>
          )}

          {tab === "manual" && (
            <form onSubmit={handleSubmit(onSubmitManual)} className="p-6 grid grid-cols-12 gap-4">
              <div className="flex flex-col col-span-12 sm:col-span-6">
                <label className="label slim-label-primary">Nome completo *</label>
                <input {...register("name", { required: true })} type="text" className="input slim-input-primary" placeholder="Nome completo" />
                {errors.name && <span className="text-xs text-red-500 mt-1">Nome é obrigatório</span>}
              </div>
              <div className="flex flex-col col-span-12 sm:col-span-6">
                <label className="label slim-label-primary">CPF *</label>
                <input {...register("cpf", { required: true })} type="text" className="input slim-input-primary" placeholder="000.000.000-00" />
                {errors.cpf && <span className="text-xs text-red-500 mt-1">CPF é obrigatório</span>}
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
              {watch("bond") === "Titular" && (
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
              )}
              <div className="flex flex-col col-span-12 sm:col-span-4">
                <label className="label slim-label-primary">Data de Vigência *</label>
                <input {...register("effectiveDate", { required: true })} type="date" className="input slim-input-primary" />
                {errors.effectiveDate && <span className="text-xs text-red-500 mt-1">Data de vigência é obrigatória</span>}
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

      <ModalImportValidation
        isOpen={modalValidation}
        onClose={handleCloseValidation}
        onConfirm={handleConfirmImport}
        rows={validationRows}
        isLoading={uploading}
      />
    </>
  );
};
