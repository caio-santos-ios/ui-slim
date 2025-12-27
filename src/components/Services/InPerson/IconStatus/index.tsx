import { MdSyncAlt } from "react-icons/md"

type TProp = {
    action: string;
    obj: any,
    getObj: (action: string, obj: any) => void;
}

export const IconStatus = ({action, obj, getObj}: TProp) => {

    return (
        <div onClick={() => getObj(action, obj)} className="cursor-pointer text-orange-400 hover:text-orange-500">
            <MdSyncAlt />
        </div>
    )
}