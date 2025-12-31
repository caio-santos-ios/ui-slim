import { MdOutlineCancel } from "react-icons/md";

type TProp = {
    obj?: any;
    getObj: (obj?: any) => void;
}

export const IconCancel = ({ obj, getObj }: TProp) => {
    return (
        <div onClick={() => getObj(obj)} className="cursor-pointer text-red-400 hover:text-red-500">
            <MdOutlineCancel />
        </div>
    );
};