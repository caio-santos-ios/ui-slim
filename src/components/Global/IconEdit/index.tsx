import { MdEdit } from "react-icons/md"

type TAction = "create" | "edit";

type TProp = {
    action: TAction; 
    obj?: any;
    getObj: (action: TAction, obj?: any) => void;
}

export const IconEdit = ({ obj, getObj, action }: TProp) => {
    return (
        <div 
            onClick={() => getObj(action, obj)} 
            className="cursor-pointer text-yellow-400 hover:text-yellow-500"
        >
            <MdEdit />
        </div>
    );
};