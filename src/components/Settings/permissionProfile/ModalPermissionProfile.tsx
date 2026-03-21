"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { MdAdd, MdDelete, MdExpandMore, MdExpandLess } from "react-icons/md";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { menuRoutinesAtom } from "@/jotai/global/menu.jotai";
import { useAtom } from "jotai";
import { TMenuRoutine } from "@/types/global/menu.type";
import { TProfileModule } from "@/types/settings/permissionProfile.type";

type TProps = {
  isOpen:    boolean;
  typeModal: "create" | "edit";
  body:      any;
  onClose:   () => void;
  onSuccess: () => void;
};

type TForm = {
  name:        string;
  description: string;
  // seleção para adicionar rotina
  module:    string;
  subModule: string;
  permission: { read: boolean; create: boolean; update: boolean; delete: boolean };
};

export const ModalPermissionProfile = ({ isOpen, typeModal, body, onClose, onSuccess }: TProps) => {
  const [menuRoutines] = useAtom<TMenuRoutine[]>(menuRoutinesAtom);
  const [modules, setModules] = useState<TProfileModule[]>([]);
  const [subModules, setSubModules] = useState<TMenuRoutine[]>([]);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const { register, handleSubmit, reset, watch, setValue } = useForm<TForm>({
    defaultValues: { permission: { read: false, create: false, update: false, delete: false } },
  });

  const selectedModule = watch("module");

  // ── Carrega dados ao abrir ────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (typeModal === "edit" && body?.id) {
      reset({ name: body.name ?? "", description: body.description ?? "", module: "", subModule: "", permission: { read: false, create: false, update: false, delete: false } });
      setModules(body.modules ? JSON.parse(JSON.stringify(body.modules)) : []);
    } else {
      reset({ name: "", description: "", module: "", subModule: "", permission: { read: false, create: false, update: false, delete: false } });
      setModules([]);
    }
    setExpandedModules([]);
  }, [isOpen, typeModal, body?.id]);

  // ── Atualiza sub-módulos ao trocar módulo ─────────────────────────────────
  useEffect(() => {
    if (!selectedModule) { setSubModules([]); return; }
    const m = menuRoutines.find((r) => r.code === selectedModule);
    setSubModules(m?.subMenu ?? []);
    setValue("subModule", "");
  }, [selectedModule]);

  // ── Adiciona rotina ao perfil ─────────────────────────────────────────────
  const addRoutine = () => {
    const mod        = watch("module");
    const sub        = watch("subModule");
    const permission = watch("permission");
    if (!mod || !sub) return;

    const menuMod = menuRoutines.find((r) => r.code === mod);
    const menuSub = menuMod?.subMenu.find((r) => r.code === sub);
    if (!menuSub) return;

    setModules((prev) => {
      const next = [...prev];
      const modIdx = next.findIndex((m) => m.code === mod);

      const routine = {
        code:        menuSub.code,
        description: menuSub.description,
        permissions: { ...permission },
      };

      if (modIdx >= 0) {
        const routineIdx = next[modIdx].routines.findIndex((r: any) => r.code === sub);
        if (routineIdx >= 0) {
          next[modIdx].routines[routineIdx].permissions = { ...permission };
        } else {
          next[modIdx].routines.push(routine);
        }
      } else {
        next.push({ code: mod, description: menuMod?.description ?? mod, routines: [routine] });
      }
      return next;
    });

    setValue("subModule", "");
    setValue("permission", { read: false, create: false, update: false, delete: false });
  };

  // ── Remove rotina ─────────────────────────────────────────────────────────
  const removeRoutine = (modCode: string, routineCode: string) => {
    setModules((prev) => {
      const next = prev
        .map((m) => m.code === modCode
          ? { ...m, routines: m.routines.filter((r: any) => r.code !== routineCode) }
          : m
        )
        .filter((m) => m.routines.length > 0);
      return next;
    });
  };

  // ── Salva ─────────────────────────────────────────────────────────────────
  const onSubmit = async (values: TForm) => {
    try {
      const payload = { name: values.name, description: values.description, modules };
      if (typeModal === "create") {
        const { status } = await api.post("/permission-profiles", payload, configApi());
        resolveResponse({ status, message: "Perfil criado com sucesso" });
      } else {
        const { status } = await api.put("/permission-profiles", { ...payload, id: body.id }, configApi());
        resolveResponse({ status, message: "Perfil atualizado com sucesso" });
      }
      onSuccess();
    } catch (error) {
      resolveResponse(error);
    }
  };

  const toggleExpand = (code: string) =>
    setExpandedModules((prev) => prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]);

  const PERMISSIONS: { key: keyof TForm["permission"]; label: string }[] = [
    { key: "read",   label: "Visualizar" },
    { key: "create", label: "Criar" },
    { key: "update", label: "Editar" },
    { key: "delete", label: "Excluir" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 flex items-start justify-center pt-10 px-4 pb-6 overflow-y-auto"
      style={{ background: "rgba(0,15,35,.65)", backdropFilter: "blur(5px)" }}>
      <div className="w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)", animation: "modal-slide-in .25s cubic-bezier(.34,1.56,.64,1)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 h-14"
          style={{ background: "linear-gradient(135deg, var(--primary-color-light) 0%, var(--primary-color) 100%)", borderBottom: "2px solid var(--accent-color)" }}>
          <span className="text-white font-bold text-sm">
            {typeModal === "create" ? "Novo Perfil de Permissão" : "Editar Perfil de Permissão"}
          </span>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors"><IoClose size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-5">

          {/* Dados básicos */}
          <div className="grid grid-cols-12 gap-4">
            <div className="flex flex-col col-span-12 sm:col-span-5">
              <label className="label slim-label-primary">Nome do Perfil *</label>
              <input {...register("name", { required: true })} type="text" className="input slim-input-primary" placeholder="Ex: Gerente Financeiro" />
            </div>
            <div className="flex flex-col col-span-12 sm:col-span-7">
              <label className="label slim-label-primary">Descrição</label>
              <input {...register("description")} type="text" className="input slim-input-primary" placeholder="Breve descrição do perfil..." />
            </div>
          </div>

          {/* Separador */}
          <div className="h-px" style={{ background: "var(--surface-border)" }} />

          {/* Adicionar rotina */}
          <div>
            <p className="text-xs font-bold text-[var(--primary-color)] mb-3">Adicionar Rotinas ao Perfil</p>
            <div className="grid grid-cols-12 gap-3 items-end">

              <div className="flex flex-col col-span-12 sm:col-span-4">
                <label className="label slim-label-primary">Módulo</label>
                <select {...register("module")} className="select slim-select-primary">
                  <option value="">Selecione</option>
                  {menuRoutines.filter((m) => m.subMenu.length > 0 && m.code !== "0").map((m) => (
                    <option key={m.code} value={m.code}>{m.description}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col col-span-12 sm:col-span-4">
                <label className="label slim-label-primary">Rotina</label>
                <select {...register("subModule")} className="select slim-select-primary" disabled={!selectedModule}>
                  <option value="">Selecione</option>
                  {subModules.filter((s) => !s.subMenu?.length).map((s) => (
                    <option key={s.code} value={s.code}>{s.description}</option>
                  ))}
                </select>
              </div>

              {/* Permissões */}
              <div className="flex flex-col col-span-12 sm:col-span-3">
                <label className="label slim-label-primary">Permissões</label>
                <div className="flex gap-2 flex-wrap">
                  {PERMISSIONS.map((p) => (
                    <label key={p.key} className="flex items-center gap-1 text-xs cursor-pointer select-none">
                      <input {...register(`permission.${p.key}`)} type="checkbox" className="accent-[var(--primary-color)]" />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="col-span-12 sm:col-span-1 flex items-end pb-0.5">
                <button type="button" onClick={addRoutine}
                  className="slim-btn slim-btn-primary w-10 h-9 flex items-center justify-center p-0">
                  <MdAdd size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Árvore de módulos adicionados */}
          {modules.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-[var(--primary-color)]">Módulos configurados</p>
              {modules.map((m) => (
                <div key={m.code} className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid var(--surface-border)" }}>

                  {/* Cabeçalho do módulo */}
                  <button type="button" onClick={() => toggleExpand(m.code)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-left transition-colors"
                    style={{ background: "var(--surface-bg)", color: "var(--primary-color)" }}>
                    <span className="flex items-center gap-2">
                      {m.description}
                      <span className="text-xs font-normal text-[var(--text-muted)]">
                        {m.routines.length} rotina{m.routines.length !== 1 ? "s" : ""}
                      </span>
                    </span>
                    {expandedModules.includes(m.code) ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
                  </button>

                  {/* Rotinas */}
                  {expandedModules.includes(m.code) && (
                    <div className="divide-y divide-(--surface-border)" style={{ borderTop: "1px solid var(--surface-border)" }}>
                      {m.routines.map((r) => (
                        <div key={r.code} className="flex items-center gap-3 px-4 py-2.5"
                          style={{ background: "var(--surface-card)" }}>
                          <span className="text-xs font-medium text-(--text-primary) flex-1">{r.description}</span>
                          <div className="flex gap-3">
                            {PERMISSIONS.map((p) => (
                              <span key={p.key} className={`text-xs ${r.permissions[p.key] ? "text-green-600 font-semibold" : "text-gray-300"}`}>
                                {p.label}
                              </span>
                            ))}
                          </div>
                          <button type="button" onClick={() => removeRoutine(m.code, r.code)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors">
                            <MdDelete size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {modules.length === 0 && (
            <div className="flex items-center justify-center py-6 rounded-xl text-sm text-[var(--text-muted)]"
              style={{ background: "var(--surface-bg)", border: "1px dashed var(--surface-border)" }}>
              Nenhuma rotina adicionada. Use o seletor acima para configurar o perfil.
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="slim-btn slim-btn-secondary">Cancelar</button>
            <button type="submit" className="slim-btn slim-btn-primary">
              {typeModal === "create" ? "Criar Perfil" : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
