import ModalV2 from "@/components/modalV2"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/table";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { parentIdAtom } from "@/jotai/notification/notification.jotai";
import { whatsAppModalAtom, whatsAppSearchAtom } from "@/jotai/notification/whats-app.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { maskDate } from "@/utils/mask.util";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

export const WhatsAppModal = () => {
    const [modal, setModal] = useAtom(whatsAppModalAtom);
    const [parentId] = useAtom(parentIdAtom);
    const [search] = useAtom(whatsAppSearchAtom);
    const [__, setLoading]   = useAtom(loadingAtom);
    const [list, setList] = useState<any[]>([]);
    const [currentWhatsApp, setCurrentWhatsApp] = useState("");
    const [time, setTime] = useState(5);
    const [uri, setUri] = useState<string>("");

    const getAll = async (search: string) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/notifications?orderBy=createdAt&sort=desc&${search}`, configApi());
            const result = data?.result?.data;
            setList(result);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const send = async () => {
        try {
            setLoading(true);
            await api.put(`/notifications/${currentWhatsApp}`, {}, configApi());
            resolveResponse({status: 200, message: "Reenviado com sucesso!"});
            setCurrentWhatsApp("");
            await getAll(uri);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!currentWhatsApp) return;

        if (time === 0) {
            send();
            return;
        }

        const timer = setTimeout(() => {
            setTime(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [currentWhatsApp, time]);

    useEffect(() =>  {
        if(modal) {
            const initial = async () => {
                setTime(5);
                setCurrentWhatsApp("");

                if(search.fieldSearch == "parentId") {
                    await getAll(`parentId=${parentId}`);
                    setUri(`parentId=${parentId}`);
                }
                
                if(search.fieldSearch == "beneficiaryId") {
                    await getAll(`beneficiaryId=${parentId}`);
                    setUri(`beneficiaryId=${parentId}`);
                }
            };
            initial();
        };
    }, [modal]);

    return (
        <ModalV2 isOpen={modal} onClose={() => setModal(false)} title="Mensagem do WhatsApp" size="xl">


            <div className="px-5 pb-4">
                <div className="erp-container-table rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 mb-3">
                    <div className="max-w-full overflow-x-auto tele-container-table">
                        <div className="slim-container-table w-full">
                            <Table className="divide-y">
                                <TableHeader className="border-b border-gray-100 dark:border-white/5 tele-table-thead">
                                    <TableRow>
                                        <TableCell isHeader className="px-4 py-3 text-left tracking-wider rounded-tl-xl">Titulo</TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-left tracking-wider">Celular</TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-left tracking-wider">Foi Enviado?</TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-left tracking-wider">Data do Envio</TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-left tracking-wider rounded-tr-xl">Ações</TableCell>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {list.map((x: any) => (
                                        <TableRow key={x.id}>
                                            <TableCell className="px-4 py-2">{x.title}</TableCell>
                                            <TableCell className="px-4 py-2">{x.phone}</TableCell>
                                            <TableCell className="px-4 py-2">{x.sent ? 'Sim' : 'Não'}</TableCell>
                                            <TableCell className="px-4 py-2">{maskDate(x.sendDate, "seconds")}</TableCell>
                                            <TableCell className="px-4 py-2">
                                                <div>
                                                    {
                                                        !currentWhatsApp && (
                                                            <button
                                                                onClick={() => {
                                                                    setCurrentWhatsApp(x.id);
                                                                }}
                                                                className="w-20 h-8 rounded-lg flex items-center justify-center text-(--text-muted) bg-(--surface-bg) hover:bg-(--primary-color) hover:text-white border border-(--surface-border) hover:border-(--primary-color) transition-all"
                                                                style={{ padding: 0, minWidth: "2rem" }}
                                                                title="Reenviar">
                                                                Reenviar
                                                            </button>
                                                        )
                                                    }
                                                    {
                                                        currentWhatsApp == x.id && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setCurrentWhatsApp(x.id);
                                                                    }}
                                                                    className="w-20 h-8 rounded-lg flex items-center justify-center text-(--text-muted) bg-(--surface-bg) hover:bg-(--primary-color) hover:text-white border border-(--surface-border) hover:border-(--primary-color) transition-all"
                                                                    style={{ padding: 0, minWidth: "2rem" }}
                                                                    title="Tempo pra reenvio">
                                                                    {time}
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setCurrentWhatsApp("");
                                                                        setTime(5);
                                                                    }}
                                                                    className="ms-4 w-20 h-8 rounded-lg flex items-center justify-center text-(--text-muted) bg-(--surface-bg) hover:bg-(--primary-color) hover:text-white border border-(--surface-border) hover:border-(--primary-color) transition-all"
                                                                    style={{ padding: 0, minWidth: "2rem" }}
                                                                    title="Cancelar">
                                                                    Cancelar
                                                                </button>
                                                            </>
                                                        )
                                                    }
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </ModalV2>
    )
}