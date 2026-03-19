import ModalV2 from "@/components/modalV2"
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { messageModalAtom } from "@/jotai/notification/message.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect } from "react";

export const MessageModal = () => {
    const [modal, setModal] = useAtom(messageModalAtom);
    const [_, setLoading]   = useAtom(loadingAtom);

    const getAll = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/notifications?type=Notification&orderBy=createdAt&sort=desc`, configApi());
            const result = data?.result?.data;
            console.log(result)
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() =>  {
        if(modal) {
            const initial = async () => {
                await getAll();
            };
            initial();
        };
    }, [modal]);
    return (
        <ModalV2 isOpen={modal} onClose={() => setModal(false)} title="Mensagem do APP">
            <div className="grid grid-cols-1">
                LISTA DE MENSAGENS DO APP
            </div>
        </ModalV2>
    )
}