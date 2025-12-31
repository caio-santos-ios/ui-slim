
import * as Fi from "react-icons/fi";
import * as Fa from "react-icons/fa";
import * as Md from "react-icons/md";
import * as Pi from "react-icons/pi";
import * as Fa6 from "react-icons/fa6";
import * as Tb from "react-icons/tb";
import * as Bs from "react-icons/bs";
import * as Io5 from "react-icons/io5";
import * as Lia from "react-icons/lia";
import * as Ri from "react-icons/ri";

import { atom } from "jotai";

const iconsMap: any = {
    ...Fi,
    ...Fa,
    ...Md,
    ...Pi,
    ...Fa6,
    ...Tb,
    ...Bs,
    ...Io5,
    ...Lia,
    ...Ri
};

export const iconAtom = atom<any>(iconsMap);