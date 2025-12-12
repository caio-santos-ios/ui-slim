import { TMenuRoutine } from "@/types/global/menu.type";
import { atom } from "jotai";

export const menuOpenAtom = atom<boolean>(false);
export const menuRoutinesAtom = atom<TMenuRoutine[]>([
    {
        code: '1',
        isOpen: true,
        authorized: true,
        description: 'Cadastro',
        icon: 'FiGrid',
        link: '',
        padding: 'px-2',
        subMenu: [
            {
                code: '11',
                isOpen: true,
                subMenu: [],
                description: 'Usuários',
                icon: '',
                link: '',
                padding: 'px-4',
                authorized: true,
            },     
            {
                code: '12',
                isOpen: true,
                subMenu: [],
                description: 'Clientes',
                icon: '',
                link: '',
                padding: 'px-4',
                authorized: true,
            },
            {
                code: '13',
                isOpen: true,
                subMenu: [],
                description: 'Profissionais',
                icon: '',
                link: 'master-data/professionals',
                padding: 'px-4',
                authorized: true,
            },
            {
                code: '14',
                isOpen: true,
                subMenu: [],
                description: 'Módulo de Serviços',
                icon: '',
                link: 'master-data/service-modules',
                padding: 'px-4',
                authorized: true,
            },
            {
                code: '15',
                isOpen: true,
                subMenu: [],
                description: 'Planos',
                icon: '',
                link: 'master-data/plas',
                padding: 'px-4',
                authorized: true,
            },
            {
                code: '16',
                isOpen: true,
                subMenu: [],
                description: 'Procedimentos',
                icon: '',
                link: '',
                padding: 'px-4',
                authorized: true,
            },
            {
                code: '17',
                isOpen: true,
                subMenu: [],
                description: 'Faturamento',
                icon: '',
                link: '',
                padding: 'px-4',
                authorized: true,
            },
            {
                code: '18',
                isOpen: true,
                subMenu: [],
                description: 'Vendedores',
                icon: '',
                link: '',
                padding: 'px-4',
                authorized: true,
            },
            {
                code: '19',
                isOpen: true,
                subMenu: [],
                description: 'Comissões',
                icon: '',
                link: '',
                padding: 'px-4',
                authorized: true,
            },       
            {
                code: '20',
                isOpen: true,
                subMenu: [],
                description: 'Rede Creadenciada',
                icon: '',
                link: '',
                padding: 'px-4',
                authorized: true,
            },            
            {
                code: '21',
                isOpen: true,
                subMenu: [],
                description: 'Tabelas de Importação',
                icon: '',
                link: '',
                padding: 'px-4',
                authorized: true,
            },            
            {
                code: '22',
                isOpen: true,
                subMenu: [],
                description: 'Tabelas Genérica',
                icon: '',
                link: 'master-data/generic-tables',
                padding: 'px-4',
                authorized: true,
            },            
        ],
    },
    // {
    //     code: '2',
    //     isOpen: true,
    //     authorized: true,
    //     subMenu: [
    //         {
    //             code: '21',
    //             isOpen: true,
    //             authorized: true,
    //             subMenu: [
    //                 {
    //                     code: '1110',
    //                     isOpen: false,
    //                     subMenu: [],
    //                     description: 'Contratos',
    //                     icon: 'FaFileContract',
    //                     link: '',
    //                     padding: 'px-8'
    //                 },
    //                 {
    //                     code: '1120',
    //                     isOpen: false,
    //                     subMenu: [],
    //                     description: 'Contas a Receber',
    //                     icon: 'FaMoneyBillTrendUp',
    //                     link: '',
    //                     padding: 'px-8'
    //                 },
    //                 {
    //                     code: '1130',
    //                     isOpen: false,
    //                     subMenu: [],
    //                     description: 'Contas a Pagar',
    //                     icon: 'PiMoneyFill',
    //                     link: '',
    //                     padding: 'px-8'
    //                 }
    //             ],
    //             description: 'Cadastros',
    //             icon: 'FiGrid',
    //             link: '',
    //             padding: 'px-4',
    //         },
    //         {
    //             code: '22',
    //             isOpen: true,
    //             authorized: true,
    //             subMenu: [
    //                 {
    //                     code: '1210',
    //                     subMenu: [],
    //                     description: 'Inadimplentes',
    //                     icon: 'PiNotepadFill',
    //                     link: '',
    //                     padding: 'px-8'
    //                 },
    //                 {
    //                     code: '1220',
    //                     subMenu: [],
    //                     description: 'Fluxo de Caixa',
    //                     icon: 'FaCashRegister',
    //                     link: '',
    //                     padding: 'px-8'
    //                 },
    //                 {
    //                     code: '1230',
    //                     subMenu: [],
    //                     description: 'DRE',
    //                     icon: 'IoStatsChart',
    //                     link: '',
    //                     padding: 'px-8'
    //                 },
    //                 {
    //                     code: '1240',
    //                     subMenu: [],
    //                     description: 'Faturamento',
    //                     icon: 'FaFileInvoiceDollar',
    //                     link: '',
    //                     padding: 'px-8'
    //                 }
    //             ],
    //             description: 'Relatórios',
    //             icon: 'BsFileEarmarkBarGraphFill',
    //             link: '',
    //             padding: 'px-4'
    //         },
    //         {
    //             code: '23',
    //             isOpen: true,
    //             authorized: true,
    //             subMenu: [],
    //             description: 'Importações',
    //             icon: 'FaFileImport',
    //             link: '',
    //             padding: 'px-4'
    //         },
    //         {
    //             code: '24',
    //             isOpen: true,
    //             authorized: true,
    //             subMenu: [],
    //             description: 'Baixas',
    //             icon: 'BsCalendarCheckFill',
    //             link: '',
    //             padding: 'px-4'
    //         }
    //     ],
    //     description: 'Financeiro',
    //     icon: 'BsCashCoin',
    //     link: '',
    //     padding: 'px-2'
    // },
    {
        code: '0',
        isOpen: true,
        authorized: true,
        description: 'Sair',
        icon: '',
        link: '/',
        padding: 'px-2',
        subMenu: []
    }
]);