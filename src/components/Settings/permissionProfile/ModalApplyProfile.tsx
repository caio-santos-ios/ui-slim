"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { MdShield } from "react-icons/md";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { TPermissionProfile } from "@/types/settings/permissionProfile.type";

type TProps = {
  isOpen:    boolean;
  userId:    string;
  userName:  string;
  onClose:   () => void;
  onSuccess: () => void;
};

type TForm = { profileId: string };

export const ModalApplyProfile = ({ isOpen, userId, userName, onClose, onSuccess }: TProps) => {
  const [profiles, setProfiles] = useState<TPermissionProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<TPermissionProfile | null>(null);

  const { register, handleSubmit, reset, watch } = useForm<TForm>();
  const profileId = watch("profileId");

  useEffect(() => {
    if (isOpen) {
      reset({});
      setSelectedProfile(null);
      loadProfiles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!profileId) { setSelectedProfile(null); return; }
    const p = profiles.find((x) => x.id === profileId) ?? null;
    setSelectedProfile(p);
  }, [profileId]);

  const loadProfiles = async () => {
    try {
      const { data } = await api.get(`/permission-profiles?deleted=false&orderBy=name&sort=asc&pageSize=200&pageNumber=1`, configApi());
      setProfiles(data.result.data ?? []);
    } catch {}
  };

  const onSubmit = async (values: TForm) => {
    try {
      const { status } = await api.put("/permission-profiles/apply", { userId, profileId: values.profileId }, configApi());
      resolveResponse({ status, message: "Perfil aplicado com sucesso" });
      onSuccess();
    } catch (error) {
      resolveResponse(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 flex items-start justify-center pt-14 px-4 pb-6 overflow-y-auto"
      style={{ background: "rgba(0,15,35,.65)", backdropFilter: "blur(5px)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)", animation: "modal-slide-in .25s cubic-bezier(.34,1.56,.64,1)" }}>

        <div className="flex items-center justify-between px-6 h-14"
          style={{ background: "linear-gradient(135deg, var(--primary-color-light) 0%, var(--primary-color) 100%)", borderBottom: "2px solid var(--accent-color)" }}>
          <span className="text-white font-bold text-sm">Aplicar Perfil de Permissão</span>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors"><IoClose size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-5">

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: "var(--accent-color-light)", border: "1px solid var(--accent-color)" }}>
            <MdShield size={18} style={{ color: "var(--primary-color)" }} />
            <div>
              <p className="text-xs font-semibold text-[var(--primary-color)]">Usuário: {userName}</p>
              <p className="text-xs text-[var(--text-muted)]">
                As permissões do perfil serão copiadas como base. Você pode ajustá-las individualmente depois.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="label slim-label-primary">Selecione o Perfil *</label>
            <select {...register("profileId", { required: true })} className="select slim-select-primary">
              <option value="">Selecione um perfil...</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Preview do perfil selecionado */}
          {selectedProfile && (
            <div className="flex flex-col gap-2 rounded-xl p-4"
              style={{ background: "var(--surface-bg)", border: "1px solid var(--surface-border)" }}>
              <p className="text-xs font-bold text-[var(--primary-color)]">
                Módulos que serão aplicados
              </p>
              {selectedProfile.modules.map((m) => (
                <div key={m.code} className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">{m.description}</span>
                  <div className="flex flex-wrap gap-1 pl-2">
                    {m.routines.map((r) => (
                      <span key={r.code}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)", color: "var(--text-muted)" }}>
                        {r.description}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {selectedProfile.modules.length === 0 && (
                <p className="text-xs text-[var(--text-muted)]">Este perfil não possui módulos configurados.</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="slim-btn slim-btn-secondary">Cancelar</button>
            <button type="submit" className="slim-btn slim-btn-primary">Aplicar Perfil</button>
          </div>
        </form>
      </div>
    </div>
  );
};
