import { MdSyncAlt } from "react-icons/md"

type TProp = {
    action: string;
    obj: any,
    getObj: (action: string, obj: any) => void;
}

export const IconStatus = ({action, obj, getObj}: TProp) => {

    return (
        <button
            onClick={() => getObj(action, obj)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] bg-[var(--surface-bg)] hover:bg-orange-500 hover:text-white border border-[var(--surface-border)] hover:border-orange-500 transition-all"
            style={{ padding: 0, minWidth: "2rem" }}
            title="Alterar Status">
                <MdSyncAlt />
        </button>
    )
}