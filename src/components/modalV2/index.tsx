"use client";
import React, { useRef, useEffect, useCallback, useId } from "react";
import { createPortal } from "react-dom";

type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";
type ModalPosition = "center" | "top" | "bottom" | "drawer-right" | "drawer-left";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;

  // Layout
  size?: ModalSize;
  position?: ModalPosition;
  className?: string;

  // Behavior
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;

  // UI Controls
  showCloseButton?: boolean;

  // Accessibility
  title?: string;
  description?: string;

  // Callbacks
  onAfterOpen?: () => void;
  onAfterClose?: () => void;
}

const sizeClasses: Record<ModalSize, string> = {
  sm:    "w-full max-w-sm",
  md:    "w-full max-w-md",
  lg:    "w-full max-w-[768px]",
  xl:    "w-full max-w-[960px]",
  "2xl": "w-full max-w-[1200px]",
  full:  "w-full h-full max-w-none rounded-none",
};

const positionClasses: Record<ModalPosition, string> = {
  center: "items-center justify-center",
  top: "items-start justify-center pt-16",
  bottom: "items-end justify-center pb-8",
  "drawer-right": "items-stretch justify-end",
  "drawer-left": "items-stretch justify-start",
};

const drawerContentClasses: Record<ModalPosition, string> = {
  center: "",
  top: "",
  bottom: "",
  "drawer-right": "h-full rounded-none rounded-l-2xl max-w-sm",
  "drawer-left": "h-full rounded-none rounded-r-2xl max-w-sm",
};

const positionEnterAnimation: Record<ModalPosition, string> = {
  center: "modal-enter-center",
  top: "modal-enter-top",
  bottom: "modal-enter-bottom",
  "drawer-right": "modal-enter-right",
  "drawer-left": "modal-enter-left",
};

export const ModalV2: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = "md",
  position = "center",
  className = "",
  closeOnBackdrop = true,
  closeOnEscape = true,
  preventScroll = true,
  showCloseButton = true,
  title,
  description,
  onAfterOpen,
  onAfterClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const isDrawer = position === "drawer-right" || position === "drawer-left";
  const isFull = size === "full";

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Escape key
  useEffect(() => {
    if (!closeOnEscape) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEscape, handleClose]);

  // Scroll lock
  useEffect(() => {
    if (!preventScroll) return;
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen, preventScroll]);

  // Focus trap & callbacks
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => {
        const focusable = modalRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      });
      onAfterOpen?.();
    } else {
      previousFocusRef.current?.focus();
      onAfterClose?.();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus trap tab key
  useEffect(() => {
    if (!isOpen) return;
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !modalRef.current) return;
      const focusableEls = modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusableEls[0];
      const last = focusableEls[focusableEls.length - 1];
      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault();
        (e.shiftKey ? last : first)?.focus();
      }
    };
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  if (typeof window === "undefined") return null;
  if (!isOpen) return null;

  const isRoundedFull = isFull || isDrawer;

  const contentClasses = [
    "relative bg-white shadow-2xl",
    !isRoundedFull && "rounded-2xl",
    drawerContentClasses[position],
    !isDrawer && !isFull && sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return createPortal(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

        @keyframes modal-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modal-center-in {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes modal-top-in {
          from { opacity: 0; transform: translateY(-24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes modal-bottom-in {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes modal-right-in {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes modal-left-in {
          from { opacity: 0; transform: translateX(-100%); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .modal-backdrop {
          animation: modal-backdrop-in 0.2s ease forwards;
        }
        .modal-enter-center {
          animation: modal-center-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .modal-enter-top {
          animation: modal-top-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .modal-enter-bottom {
          animation: modal-bottom-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .modal-enter-right {
          animation: modal-right-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .modal-enter-left {
          animation: modal-left-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .pasbem-modal-content {
          font-family: 'Montserrat', sans-serif;
          border-top: 3px solid #66cc99;
          box-shadow:
            0 20px 60px rgba(26, 58, 92, 0.15),
            0 4px 16px rgba(26, 58, 92, 0.08);
        }

        .pasbem-modal-title {
          color: #1a3a5c;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .pasbem-modal-description {
          color: #5a7a9a;
          font-family: 'Montserrat', sans-serif;
          font-weight: 400;
        }

        .pasbem-close-btn {
          color: #1a3a5c;
          background-color: #f0f7ff;
          border: 1px solid rgba(26, 58, 92, 0.1);
          transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
        }
        .pasbem-close-btn:hover {
          background-color: #66cc99;
          color: #fff;
          border-color: #66cc99;
          box-shadow: 0 4px 12px rgba(102, 204, 153, 0.35);
        }
        .pasbem-close-btn:active {
          transform: scale(0.92);
        }
        .pasbem-close-btn:focus-visible {
          outline: 2px solid #66cc99;
          outline-offset: 2px;
        }

        /* Drawer específico — accent lateral */
        .pasbem-modal-drawer-right {
          border-top: none;
          border-left: 3px solid #66cc99;
        }
        .pasbem-modal-drawer-left {
          border-top: none;
          border-right: 3px solid #66cc99;
        }
      `}</style>

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={`fixed inset-0 z-50 flex overflow-y-auto ${positionClasses[position]}`}
      >
        {/* Backdrop */}
        {!isFull && (
          <div
            aria-hidden="true"
            className="modal-backdrop fixed inset-0 backdrop-blur-sm"
            style={{ backgroundColor: "rgba(26, 58, 92, 0.45)" }}
            onClick={closeOnBackdrop ? handleClose : undefined}
          />
        )}

        {/* Content */}
        <div
          ref={modalRef}
          className={[
            contentClasses,
            positionEnterAnimation[position],
            "pasbem-modal-content",
            position === "drawer-right" && "pasbem-modal-drawer-right",
            position === "drawer-left" && "pasbem-modal-drawer-left",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header — só renderiza se tiver título ou descrição */}
          {(title || description) && (
            <div className="px-6 pt-6 pb-4 pr-14">
              {title && (
                <h2
                  id={titleId}
                  className="text-lg pasbem-modal-title"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id={descriptionId}
                  className="mt-1 text-sm pasbem-modal-description"
                >
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Close button */}
          {showCloseButton && (
            <button
              type="button"
              aria-label="Fechar modal"
              onClick={handleClose}
              className="pasbem-close-btn absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full sm:right-5 sm:top-5 sm:h-10 sm:w-10"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M2 2L14 14M14 2L2 14"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}

          {children}
        </div>
      </div>
    </>,
    document.body
  );
};

export default ModalV2;