import { FaTrash } from "react-icons/fa";

type TProp = {
    obj: any,
    getObj: (obj: any) => void;
}

export const IconDelete = ({obj, getObj}: TProp) => {

    return (
        <div onClick={() => getObj(obj)} className="cursor-pointer text-red-400 hover:text-red-500">
            <FaTrash />
        </div>
    )
}