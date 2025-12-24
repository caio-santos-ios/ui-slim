import { MdEdit, MdPhotoCamera } from "react-icons/md"

type TAction = "editPhoto";

type TProp = {
    action: TAction; 
    obj?: any;
    getObj: (action: TAction, obj?: any) => void;
}

export const IconEditPhoto = ({ obj, getObj, action }: TProp) => {
    return (
        <div 
            onClick={() => getObj(action, obj)} className="cursor-pointer text-blue-400 hover:text-blue-500">
            <MdPhotoCamera />
        </div>
    );
};