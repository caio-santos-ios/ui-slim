import { parentIdAtom } from "@/jotai/notification/notification.jotai";
import { whatsAppModalAtom, whatsAppSearchAtom } from "@/jotai/notification/whats-app.jotai";
import { useAtom } from "jotai";
import { FaWhatsapp } from "react-icons/fa"

export const WhatsAppButtonModal = ({id, parent, type, fieldSearch}: {id: string; parent: string; type: string; fieldSearch: string;}) => {
    const [_, setParentId] = useAtom(parentIdAtom);
    const [__, setModal] = useAtom(whatsAppModalAtom);
    const [___, setSearch] = useAtom(whatsAppSearchAtom);

    return (
        <button onClick={() => {
            setParentId(id);
            setModal(true);
            setSearch({parent, type, fieldSearch});
        }} className="w-8 h-8 rounded-lg flex items-center justify-center text-(--text-muted) bg-(--surface-bg) hover:bg-green-500 hover:text-white border border-(--surface-border) hover:border-green-500 transition-all"
            style={{ padding: 0, minWidth: "2rem" }} title="Mensagens WhatsApp">
            <FaWhatsapp size={13} />
        </button>
    )
}