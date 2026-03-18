"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";

type TProps = {
  isOpen: boolean;
  typeModal: "create" | "edit";
  body: any;
  customers: any[];
  onClose: () => void;
  onSuccess: () => void;
};

type TForm = {
  customerId:  string;
  type:        string;
  programId:   string;
  notes:       string;
  fileName:    string;
  // beneficiary
  benName:        string;
  benCpf:         string;
  benDateOfBirth: string;
  benGender:      string;
  benEmail:       string;
  benPhone:       string;
  benWhatsapp:    string;
  benDepartment:  string;
  benRole:        string;
  benPlanId:      string;
  file: any;
};

export const ModalB2BMassMovement = ({ isOpen, typeModal, body, customers, onClose, onSuccess }: TProps) => {
  const { register, handleSubmit, reset, watch } = useForm<TForm>();
  const movType = watch("type");

  useEffect(() => {
    if (isOpen && typeModal === "edit" && body?.id) {
      reset({
        customerId: body.customerId ?? "",
        type:       body.type ?? "",
        programId:  body.programId ?? "",
        notes:      body.notes ?? "",
        fileName:   body.fileName ?? "",
        benName:        body.beneficiary?.name ?? "",
        benCpf:         body.beneficiary?.cpf ?? "",
        benDateOfBirth: body.beneficiary?.dateOfBirth?.split("T")[0] ?? "",
        benGender:      body.beneficiary?.gender ?? "",
        benEmail:       body.beneficiary?.email ?? "",
        benPhone:       body.beneficiary?.phone ?? "",
        benWhatsapp:    body.beneficiary?.whatsapp ?? "",
        benDepartment:  body.beneficiary?.department ?? "",
        benRole:        body.beneficiary?.role ?? "",
        benPlanId:      body.beneficiary?.planId ?? "",
      });
    } else if (isOpen && typeModal === "create") {
      reset({});
    }
  }, [isOpen, typeModal, body]);

  if (!isOpen) return null;

  const onSubmit = async (values: TForm) => {
    try {
      const payload: any = {
        customerId: values.customerId,
        type:       values.type,
        programId:  values.programId,
        notes:      values.notes,
        fileName:   values.fileName,
      };

      if (values.type === "Inclusao") {
        payload.beneficiary = {
          name:        values.benName,
          cpf:         values.benCpf,
          dateOfBirth: values.benDateOfBirth || null,
          gender:      values.benGender,
          email:       values.benEmail,
          phone:       values.benPhone,
          whatsapp:    values.benWhatsapp,
          department:  values.benDepartment,
          role:        values.benRole,
          planId:      values.benPlanId,
        };
      }

      const formBody = new FormData();      
      const attachment: any = document.querySelector('#attachment');
      if (attachment.files[0]) formBody.append('file', attachment.files[0]);

      const { status } = await api.put("/customer-recipients/import-manager-painel", formBody, configApi(false));
      onSuccess();
    } catch (error) {
      resolveResponse(error);
    }
  };

  return (
    <div className="fixed inset-0 z-999 flex items-start justify-center pt-14 px-4 pb-6 overflow-y-auto"
      style={{ background: "rgba(0,15,35,.65)", backdropFilter: "blur(5px)" }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)", animation: "modal-slide-in .25s cubic-bezier(.34,1.56,.64,1)" }}>

        <div className="flex items-center justify-between px-6 h-14"
          style={{ background: "linear-gradient(135deg, var(--primary-color-light) 0%, var(--primary-color) 100%)", borderBottom: "2px solid var(--accent-color)" }}>
          <span className="text-white font-bold text-sm">
            {typeModal === "create" ? "Nova Movimentação de Massa" : "Editar Movimentação"}
          </span>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <IoClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 grid grid-cols-12 gap-4">
          {/* Arquivo para importação */}
          <div className="flex flex-col col-span-12">
            <label className="label slim-label-primary">Arquivo para Importação (Excel/CSV)</label>
            <input id="attachment" {...register("file")} type="file" className={`input slim-input-primary`} placeholder="Digite"/>
          </div>

          {movType === "Inclusao" && (
            <>
              <div className="col-span-12">
                <div className="h-px mb-2" style={{ background: "var(--surface-border)" }} />
                <p className="text-xs font-bold text-(--primary-color) mb-3">Dados Cadastrais do Beneficiário</p>
              </div>

              {[
                { label: "Nome *",        field: "benName",        sm: 6, type: "text",  placeholder: "Nome completo" },
                { label: "CPF *",         field: "benCpf",         sm: 6, type: "text",  placeholder: "000.000.000-00" },
                { label: "Nascimento",    field: "benDateOfBirth", sm: 4, type: "date",  placeholder: "" },
                { label: "E-mail",        field: "benEmail",       sm: 4, type: "email", placeholder: "" },
                { label: "Telefone",      field: "benPhone",       sm: 4, type: "text",  placeholder: "" },
                { label: "WhatsApp",      field: "benWhatsapp",    sm: 4, type: "text",  placeholder: "" },
                { label: "Departamento",  field: "benDepartment",  sm: 4, type: "text",  placeholder: "" },
                { label: "Função",        field: "benRole",        sm: 4, type: "text",  placeholder: "" },
              ].map(({ label, field, sm, type, placeholder }) => (
                <div key={field} className={`flex flex-col col-span-12 sm:col-span-${sm}`}>
                  <label className="label slim-label-primary">{label}</label>
                  <input {...register(field as any)} type={type} className="input slim-input-primary" placeholder={placeholder} />
                </div>
              ))}

              {/* Gênero */}
              <div className="flex flex-col col-span-12 sm:col-span-4">
                <label className="label slim-label-primary">Gênero</label>
                <select {...register("benGender")} className="select slim-select-primary">
                  <option value="">Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="col-span-12 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="slim-btn slim-btn-secondary">Cancelar</button>
            <button type="submit" className="slim-btn slim-btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
