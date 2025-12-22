import { MdTaskAlt } from "react-icons/md"

type TProp = {
    action: string;
    obj: any,
    getObj: (action: string, obj: any) => void;
}

export const IconLow = ({action, obj, getObj}: TProp) => {

    return (
        <div onClick={() => getObj(action, obj)} className="cursor-pointer text-blue-400 hover:text-blue-500">
            <MdTaskAlt />
        </div>
    )
}