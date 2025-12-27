import { TMenuRoutine } from "@/types/global/menu.type";
import { atom } from "jotai";

export const menuOpenAtom = atom<boolean>(false);
export const menuRoutinesAtom = atom<TMenuRoutine[]>([
    {
        code: '1',
        isOpen: true,
        authorized: false,
        description: 'Cadastro',
        icon: 'FiGrid',
        link: '',
        padding: 'px-2',
        subMenu: [
            {
                code: 'A11',
                isOpen: true,
                subMenu: [],
                description: 'Usuários',
                icon: '',
                link: 'master-data/users',
                padding: 'px-4',
                authorized: false,
                permissions: {
                    create: false,
                    update: false,
                    read: false,
                    delete: false
                }
            },     
            {
                code: 'A12',
                isOpen: true,
                subMenu: [],
                description: 'Clientes',
                icon: '',
                link: 'master-data/customers',
                padding: 'px-4',
                authorized: false,
                permissions: {
                    create: false,
                    update: false,
                    read: false,
                    delete: false
                }
            },
            {
                code: 'A13',
                isOpen: true,
                subMenu: [],
                description: 'Profissionais',
                icon: '',
                link: 'master-data/professionals',
                padding: 'px-4',
                authorized: false,
                permissions: {
                    create: false,
                    update: false,
                    read: false,
                    delete: false
                }
            },
            {
                code: 'A14',
                isOpen: true,
                subMenu: [],
                description: 'Módulo de Serviços',
                icon: '',
                link: 'master-data/service-modules',
                padding: 'px-4',
                authorized: false,
                permissions: {
                    create: false,
                    update: false,
                    read: false,
                    delete: false
                }
            },
            {
                code: 'A15',
                isOpen: true,
                subMenu: [],
                description: 'Planos',
                icon: '',
                link: 'master-data/plas',
                padding: 'px-4',
                authorized: false,
                permissions: {
                    create: false,
                    update: false,
                    read: false,
                    delete: false
                }
            },
            {
                code: 'A16',
                isOpen: true,
                subMenu: [],
                description: 'Procedimentos',
                icon: '',
                link: 'master-data/procedures',
                padding: 'px-4',
                authorized: false,
                permissions: {
                    create: false,
                    update: false,
                    read: false,
                    delete: false
                }
            },
            {
                code: 'A17',
                isOpen: true,
                subMenu: [],
                description: 'Faturamento',
                icon: '',
                link: 'master-data/billings',
                padding: 'px-4',
                authorized: false,
                permissions: {
                    create: false,
                    update: false,
                    read: false,
                    delete: false
                }
            },
            {
                code: 'A18',
                isOpen: true,
                subMenu: [],
                description: 'Vendedores',
                icon: '',
                link: 'master-data/sellers',
                padding: 'px-4',
                authorized: false,
                permissions: {
                    create: false,
                    update: false,
                    read: false,
                    delete: false
                }
            },
            {
                code: 'A19',
                isOpen: true,
                subMenu: [],
                description: 'Representantes',
                icon: '',
                link: 'master-data/sellers-representative',
                padding: 'px-4',
                authorized: false,
                permissions: {
                    create: false,
                    update: false,
                    read: false,
                    delete: false
                }
            },
            {
                code: 'A20',
                isOpen: true,
                subMenu: [],
                description: 'Comissões',
                icon: '',
                link: 'master-data/commissions',
                padding: 'px-4',
                authorized: false,
                permissions: {
                    create: false,
                    update: false,
                    read: false,
                    delete: false
                }
            },       
            {
                code: 'A21',
                isOpen: true,
                subMenu: [],
                description: 'Rede Credenciada',
                icon: '',
                link: 'master-data/accredited-network',
                padding: 'px-4',
                authorized: false,
                permissions: {
                    create: false,
                    update: false,
                    read: false,
                    delete: false
                }
            },            
            // {
            //     code: 'A22',
            //     isOpen: true,
            //     subMenu: [],
            //     description: 'Tabelas de Importação',
            //     icon: '',
            //     link: 'master-data/imports',
            //     padding: 'px-4',
            //     authorized: false,
            //     permissions: {
            //         create: false,
            //         update: false,
            //         read: false,
            //         delete: false
            //     }
            // },            
            {
                code: 'A23',
                isOpen: true,
                subMenu: [],
                description: 'Tabelas Genérica',
                icon: '',
                link: 'master-data/generic-tables',
                padding: 'px-4',
                authorized: false,
                permissions: {
                    create: false,
                    update: false,
                    read: false,
                    delete: false
                }
            },            
            {
                code: 'A24',
                isOpen: true,
                subMenu: [],
                description: 'Fornecedores',
                icon: '',
                link: 'master-data/suppliers',
                padding: 'px-4',
                authorized: false,
                permissions: {
                    create: false,
                    update: false,
                    read: false,
                    delete: false
                }
            },            
            {
                code: 'A25',
                isOpen: true,
                subMenu: [],
                description: 'Tabela de Negociação',
                icon: '',
                link: 'master-data/trading-tables',
                padding: 'px-4',
                authorized: false,
                permissions: {
                    create: false,
                    update: false,
                    read: false,
                    delete: false
                }
            },            
        ],
    },
    {
        code: '2',
        isOpen: true,
        authorized: false,
        subMenu: [
            {
                code: 'B22',
                isOpen: false,
                authorized: false,
                subMenu: [],
                description: 'Presencial',
                // icon: 'FaMoneyBillTrendUp',
                icon: '',
                link: 'services/in-person',
                padding: 'px-4',
                permissions: {
                    create: false,
                    update: false,
                    read: false,
                    delete: false
                }
            },
            {
                code: 'B23',
                isOpen: false,
                authorized: false,
                subMenu: [],
                description: 'Telemedicina',
                // icon: 'PiMoneyFill',
                icon: '',
                link: 'services/telemedicine',
                padding: 'px-4',
                permissions: {
                    create: false,
                    update: false,
                    read: false,
                    delete: false
                }
            }
        ],
        description: 'Atendimentos',
        icon: 'MdChat',
        link: '',
        padding: 'px-2'
    },
    {
        code: '3',
        isOpen: true,
        authorized: false,
        subMenu: [
            {
                code: 'C32',
                isOpen: false,
                authorized: false,
                subMenu: [],
                description: 'Contas a Receber',
                // icon: 'FaMoneyBillTrendUp',
                icon: '',
                link: 'financial/accounts-receivable',
                padding: 'px-4',
                permissions: {
                    create: false,
                    update: false,
                    read: false,
                    delete: false
                }
            },
            {
                code: 'C33',
                isOpen: false,
                authorized: false,
                subMenu: [],
                description: 'Contas a Pagar',
                // icon: 'PiMoneyFill',
                icon: '',
                link: 'financial/accounts-payable',
                padding: 'px-4',
                permissions: {
                    create: false,
                    update: false,
                    read: false,
                    delete: false
                }
            }
        ],
        description: 'Financeiro',
        icon: 'BsCashCoin',
        link: '',
        padding: 'px-2'
    },
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