import { MdEdit, MdPhotoCamera } from "react-icons/md"

type TAction = "editPhoto";

type TProp = {
    action: TAction; 
    obj?: any;
    getObj: (action: TAction, obj?: any) => void;
}

export const IconEditPhoto = ({ obj, getObj, action }: TProp) => {
    return (
        <button 
            onClick={() => getObj(action, obj)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] bg-[var(--surface-bg)] hover:bg-[var(--primary-color)] hover:text-white border border-[var(--surface-border)] hover:border-[var(--primary-color)] transition-all"
            style={{ padding: 0, minWidth: "2rem" }}
            title="Editar">
            <MdPhotoCamera />
        </button>
    );
};