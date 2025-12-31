"use client";

import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { maskDate } from "@/utils/mask.util";
import { Autorization } from "@/components/Global/Autorization";
import { Header } from "@/components/Global/Header";
import { SideMenu } from "@/components/Global/SideMenu";
import { SlimContainer } from "@/components/Global/SlimContainer";
import DataTable from "@/components/Global/Table";
import { NotData } from "@/components/Global/NotData";
import { ModalDelete } from "@/components/Global/ModalDelete";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { convertNumberMoney } from "@/utils/convert.util";
import { ModalCustomer } from "@/components/MasterData/Customer/Modal";
import { modalAtom } from "@/jotai/global/modal.jotai";
import { IconEdit } from "@/components/Global/IconEdit";
import { IconDelete } from "@/components/Global/IconDelete";
import { permissionCreate, permissionDelete, permissionRead, permissionUpdate } from "@/utils/permission.util";

const columns1: {key: string; title: string}[] = [
  { key: "corporateName", title: "Contratante" },
  { key: "document", title: "CNPJ/CPF" },
  { key: "type", title: "Tipo de Cliente" },
  { key: "effectiveDate", title: "Data da Vigência" },
  { key: "createdAt", title: "Data de Cadastro" },
];

const columns2: {key: string; title: string}[] = [
  { key: "code", title: "ID" },
  { key: "name", title: "Beneficiário" },
  { key: "cpf", title: "CPF" },
  { key: "type", title: "Tipo de Cliente" },
  { key: "typePlan", title: "Tipo de Plano" },
  { key: "bond", title: "Vínculo" },
  { key: "effectiveDate", title: "Data da Vigência" },
  { key: "createdAt", title: "Data de Cadastro" },
];

export default function Customer() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [modal, setModal] = useAtom(modalAtom);
  const [modalDelete, setModalDelete] = useState<boolean>(false);
  const [typeModal, setTypeModal] = useState<"create" | "edit">("create");
  const [id, setId] = useState<string>("");
  const [currentBody, setCurrentBody] = useState<any>({
    id: "",
    name: "",
    description: "",
    start: "",
    end: "",
    deliveryDate: "",
    billingDate: ""
  });
  const [vision, setVision] = useState<string>("contractor");
  const [columns, setCollumns] = useState<any[]>(columns1);

  const [userLogger] = useAtom(userLoggerAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
 
  const getAll = async (uri: string = "customers", queryString: string = "") => {
    try {
      const {data} = await api.get(`/${uri}?deleted=false&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=${pagination.currentPage}${queryString}`, configApi());
      const result = data.result;

      setPagination({
        currentPage: result.currentPage,
        data: result.data,
        sizePage: result.pageSize,
        totalPages: result.totalCount
      });
    } catch (error) {
      resolveResponse(error);
    }
  };

  const openModal = (action: "create" | "edit" = "create", body?: any) => {
    if(body) {
      const newBody = {...body}
      setCurrentBody(newBody);
      setId(vision == "contractor" ? body.id : body.contractorId);
    };
    
    setTypeModal(action);
    setModal(true);
  };
  
  const openModalDelete = (body: any) => {
    setCurrentBody(body);
    setModalDelete(true);
  };

  const destroy = async () => {
    try {
      const uri = vision == "contractor" ? "customers" : "customer-recipients";
      const { status } = await api.delete(`/${uri}/${currentBody?.id}`, configApi());
      resolveResponse({status, message: "Excluído com sucesso"});
      setModalDelete(false);
      resetModal();
      await getAll(uri);
    } catch (error) {
      resolveResponse(error);
    }
  };

  const checked = async () => {
    setVision(vision == "contractor" ? "recipient" : "contractor");
    setCollumns(vision == "contractor" ? columns2 : columns1);
    const uri = vision == "contractor" ? "customer-recipients" : "customers";
    await getAll(uri);
  };
  
  useEffect(() => {
    if(permissionRead("1", "A12")) {
      setLoading(true);
      getAll();
      setLoading(false);
    };
  }, []);

  const handleReturnModal = async (isSuccess: boolean, id: string) => {
    setId(id);
    if(isSuccess) {
      setTypeModal("edit");
      await getAll();
    }
  };
  
  const resetModal = () => {
    setCurrentBody({
      id: "",
      name: "",
      description: "",
      start: "",
      end: "",
      deliveryDate: "",
      billingDate: ""
    });

    setModal(false);
    setId("");
  };

  const search = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let firstSearch = ``;
    const uri = vision == "contractor" ? "customers" : "customer-recipients";

    if(value) {
      firstSearch =
      vision == "contractor" ?
      `&regex$or$corporateName=${value}&regex$or$document=${value}&regex$or$type=${value}`
      :
      `&regex$or$code=${value}&regex$or$name=${value}&regex$or$cpf=${value}&regex$or$_customer.typePlan=${value}&regex$or$_customer.type=${value}&regex$or$bond=${value}`
    } else {
      firstSearch = "";
    };
    
    await getAll(uri, firstSearch);
  };

  return (
    <>
      <Autorization />
      {
        userLogger ?
        <>
          <Header />
          <main className="slim-bg-main">
            <SideMenu />

            <div className="slim-container w-full">
              <SlimContainer breadcrump="Clientes" breadcrumpIcon="MdPerson"
                buttons={
                  <>
                    {
                      permissionUpdate("1", "A12") &&
                      <div className={`flex items-end`}>
                          <span className="mr-2 font-bold">VISÃO: {vision == "contractor" ? "Contratante" : "Beneficiário"}</span>
                          <label className="slim-switch">
                            <input onChange={async () => checked()} type="checkbox"/>
                            <span className="slider-default"></span>
                          </label>
                      </div>   
                    }
                    {
                      permissionCreate("1", "A12") &&
                      <button onClick={() => openModal()} className="slim-bg-primary slim-bg-primary-hover">Adicionar</button>
                    }
                  </>}
                  // inputSearch={
                  //   <>
                  //     {
                  //       permissionRead("1", "A16") && 
                  //       <input onInput={(e: React.ChangeEvent<HTMLInputElement>) => search(e)} className="border border-gray-400 w-96 h-8" type="text" placeholder="Busca rápida" />
                  //     }
                  //   </>
                  // }
                  >

                <DataTable columns={columns}>
                  <>
                    {
                      pagination.data.map((x: any, i: number) => {
                        return (
                          <tr key={i}>
                            {columns.map((col: any) => (
                              <td className={`px-4 py-3 text-left text-sm font-medium tracking-wider`} key={col.key}>
                                {col.key == 'createdAt' || col.key == 'effectiveDate' ? maskDate((x as any)[col.key]) : col.key == 'active' ? x.active ? 'Ativo' : 'Inativo' : col.key == "cost" ? convertNumberMoney(x.cost) : (x as any)[col.key]}
                              </td>        
                            ))}  

                            <td className="text-center">
                              <div className="flex justify-center gap-2">
                                {
                                  permissionUpdate("1", "A12") &&
                                  <IconEdit action="edit" obj={x} getObj={openModal}/>
                                }
                                {
                                  permissionDelete("1", "A12") &&
                                  <IconDelete obj={x} getObj={openModalDelete}/>
                                }
                              </div>
                            </td>         
                          </tr>
                        )
                      })
                    }
                  </>
                </DataTable>

                <NotData />
              </SlimContainer>
            </div>

            <ModalCustomer
              title={typeModal == 'create' ? 'Inserir Cliente' : 'Editar Cliente'} 
              isOpen={modal} setIsOpen={() => setModal(modal)} 
              onClose={resetModal}
              onSelectValue={handleReturnModal}
              id={id}
            />      

            <ModalDelete 
              title='Excluír Cliente'
              isOpen={modalDelete} setIsOpen={() => setModalDelete(modal)} 
              onClose={() => setModalDelete(false)}
              onSelectValue={destroy}
            />          
          </main>
        </>
        :
        <></>
      }
    </>
  );
}
