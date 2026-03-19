"use client";

import { useState, createContext, useContext } from "react";

/* ─── Accordion Root Context ────────────────── */
type TAccordionCtx = {
    openIds: Set<string>;
    toggle:  (id: string) => void;
};

const AccordionCtx = createContext<TAccordionCtx>({ openIds: new Set(), toggle: () => {} });

/* ─── AccordionItem Context ─────────────────── */
type TItemCtx = { id: string; isOpen: boolean };

const ItemCtx = createContext<TItemCtx>({ id: "", isOpen: false });

/* ══════════════════════════════════════════════
   Accordion — Root
   Props:
     multiple     — abre vários ao mesmo tempo (default: false)
     defaultOpenId — id do item que inicia aberto
══════════════════════════════════════════════ */
type TAccordionProps = {
    children:      React.ReactNode;
    multiple?:     boolean;
    defaultOpenId?: string;
    className?:    string;
};

export const Accordion = ({ children, multiple = false, defaultOpenId, className }: TAccordionProps) => {
    const [openIds, setOpenIds] = useState<Set<string>>(
        defaultOpenId ? new Set([defaultOpenId]) : new Set()
    );

    const toggle = (id: string) => {
        setOpenIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                if (!multiple) next.clear();
                next.add(id);
            }
            return next;
        });
    };

    return (
        <AccordionCtx.Provider value={{ openIds, toggle }}>
            <div
                className={className}
                style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
            >
                {children}
            </div>
        </AccordionCtx.Provider>
    );
};

/* ══════════════════════════════════════════════
   AccordionItem — wrapper de cada item
   Props:
     id — identificador único (obrigatório)
══════════════════════════════════════════════ */
type TItemProps = {
    id:        string;
    children:  React.ReactNode;
    className?: string;
};

export const AccordionItem = ({ id, children, className }: TItemProps) => {
    const { openIds } = useContext(AccordionCtx);
    const isOpen = openIds.has(id);

    return (
        <ItemCtx.Provider value={{ id, isOpen }}>
            <div
                className={className}
                data-open={isOpen}
                style={{
                    borderRadius:  "0.875rem",
                    border:        "1px solid",
                    borderColor:   isOpen ? "var(--accent-color)" : "var(--surface-border)",
                    background:    "var(--surface-card)",
                    overflow:      "hidden",
                    transition:    "box-shadow .2s ease, border-color .2s ease",
                    boxShadow:     isOpen ? "0 4px 20px rgba(0,0,0,.08)" : "none",
                }}
            >
                {children}
            </div>
        </ItemCtx.Provider>
    );
};

/* ══════════════════════════════════════════════
   AccordionTrigger — botão de abertura
   Props:
     icon     — ícone à esquerda (opcional)
     subtitle — texto auxiliar abaixo do título (opcional)
     children — título principal
══════════════════════════════════════════════ */
type TTriggerProps = {
    children:   React.ReactNode;
    icon?:      React.ReactNode;
    subtitle?:  string;
    className?: string;
    clickHeader?: () => void;
};

export const AccordionTrigger = ({ children, icon, subtitle, className, clickHeader }: TTriggerProps) => {
    const { id, isOpen } = useContext(ItemCtx);
    const { toggle }     = useContext(AccordionCtx);

    return (
        <button
            type="button"
            onClick={() => {
                toggle(id);
                if(clickHeader) {
                    clickHeader();
                }
            }}
            aria-expanded={isOpen}
            className={className}
            style={{
                width:      "100%",
                display:    "flex",
                alignItems: "center",
                gap:        "0.875rem",
                padding:    "1.125rem 1.375rem",
                background: "transparent",
                border:     "none",
                cursor:     "pointer",
                textAlign:  "left",
                outline:    "none",
                paddingTop: "1.5rem",
                paddingBottom: "1.5rem"
            }}
        >
            {/* Ícone opcional */}
            {icon && (
                <div
                    style={{
                        width:           "2.25rem",
                        height:          "2.25rem",
                        borderRadius:    "0.625rem",
                        display:         "flex",
                        alignItems:      "center",
                        justifyContent:  "center",
                        flexShrink:      0,
                        background:      isOpen ? "var(--accent-color)" : "rgba(0,0,0,.04)",
                        color:           isOpen ? "#fff" : "var(--text-muted)",
                        transition:      "background .25s ease, color .25s ease",
                    }}
                >
                    {icon}
                </div>
            )}

            {/* Título + subtítulo */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p
                    style={{
                        fontSize:   "0.9375rem",
                        fontWeight: 600,
                        color:      isOpen ? "var(--text-primary)" : "var(--text-secondary)",
                        transition: "color .2s ease",
                        margin:     0,
                        lineHeight: 1.3,
                    }}
                >
                    {children}
                </p>
                {subtitle && (
                    <p
                        style={{
                            fontSize:   "0.78125rem",
                            color:      "var(--text-muted)",
                            margin:     "0.125rem 0 0",
                            lineHeight: 1.4,
                        }}
                    >
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Chevron animado */}
            <div
                style={{
                    flexShrink:      0,
                    width:           "1.5rem",
                    height:          "1.5rem",
                    display:         "flex",
                    alignItems:      "center",
                    justifyContent:  "center",
                    borderRadius:    "50%",
                    background:      isOpen ? "var(--accent-color-light)" : "var(--surface-bg)",
                    transition:      "background .25s ease",
                }}
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isOpen ? "var(--accent-color)" : "var(--text-muted)"}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        width:      "0.875rem",
                        height:     "0.875rem",
                        transition: "transform .3s cubic-bezier(.34,1.56,.64,1), stroke .25s ease",
                        transform:  isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>
        </button>
    );
};

type TContentProps = {
    children:   React.ReactNode;
    className?: string;
};

export const AccordionContent = ({ children, className }: TContentProps) => {
    const { isOpen } = useContext(ItemCtx);

    return (
        <div
            style={{
                display:            "grid",
                gridTemplateRows:   isOpen ? "1fr" : "0fr",
                transition:         "grid-template-rows .3s cubic-bezier(.4,0,.2,1)",
            }}
        >
            <div style={{ overflow: "hidden" }}>
                <div
                    className={className}
                    style={{
                        padding:    "0 1.375rem 1.25rem",
                        borderTop:  "1px solid var(--surface-border)",
                        paddingTop: "1.125rem",
                        opacity:    isOpen ? 1 : 0,
                        transition: "opacity .25s ease .05s",
                        fontSize:   "0.875rem",
                        color:      "var(--text-secondary)",
                        lineHeight: 1.65,
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};