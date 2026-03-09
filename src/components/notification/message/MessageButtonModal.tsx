import { messageModalAtom } from "@/jotai/notification/message.jotai";
import { parentIdAtom } from "@/jotai/notification/notification.jotai"
import { useAtom } from "jotai"
import { MdSend } from "react-icons/md"

export const MessageButtonModal = ({id}: {id: string}) => {
    const [_, setParentId] = useAtom(parentIdAtom);
    const [__, setModal] = useAtom(messageModalAtom);

    return (
        <button onClick={() => {
            setParentId(id);
            setModal(true);
        }} className="w-8 h-8 rounded-lg flex items-center justify-center text-(--text-muted) bg-(--surface-bg) hover:bg-yellow-500 hover:text-white border border-(--surface-border) hover:border-yellow-500 transition-all"
            style={{ padding: 0, minWidth: "2rem" }} title="Mensagens App">
            <MdSend size={13} />
        </button>
    )
}