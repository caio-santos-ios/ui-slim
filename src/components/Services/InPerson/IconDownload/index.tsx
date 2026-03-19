import { MdSave } from "react-icons/md"

export const IconDownload = () => {

    return (
        <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] bg-[var(--surface-bg)] hover:bg-blue-500 hover:text-white border border-[var(--surface-border)] hover:border-blue-500 transition-all"
            style={{ padding: 0, minWidth: "2rem" }}
            title="Guia De Atendimento">
            <MdSave />
        </button>
    )
}