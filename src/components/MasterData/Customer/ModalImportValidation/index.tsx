"use client";

import "./style.css";
import { IoClose } from "react-icons/io5";
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaDownload } from "react-icons/fa";
import { Button } from "@/components/Global/Button";
import { validatorCPF } from "@/utils/validator.utils";
import * as XLSX from "xlsx";

export const IMPORT_COLUMNS = [
    { index: 0, key: "name",        label: "Nome"              },
    { index: 1, key: "cpf",         label: "CPF"               },
    { index: 2, key: "email",       label: "E-mail"            },
    { index: 3, key: "phone",       label: "Telefone"          },
    { index: 4, key: "dateOfBirth", label: "Data de Nascimento"},
    { index: 5, key: "gender",      label: "Gênero"            },
    { index: 6, key: "bond",        label: "Vínculo"           },
];

export type TImportRow = {
    name?: string;
    cpf?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    bond?: string;
    [key: string]: any;
};

export type TImportRowValidated = TImportRow & {
    _errors: string[];
    _hasError: boolean;
    _rowIndex: number;
};

export const parseSheetByIndex = (workbook: XLSX.WorkBook): TImportRow[] => {
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

    return rows.slice(1).filter(row => row.some((cell: any) => cell !== "")).map((row) => {
        const obj: TImportRow = {};
        IMPORT_COLUMNS.forEach(({ index, key }) => {
            obj[key] = row[index] !== undefined ? String(row[index]).trim() : "";
        });
        return obj;
    });
};

export const downloadTemplate = () => {
    const headers = IMPORT_COLUMNS.map(c => c.label);
    const example = [
        "João da Silva",
        "123.456.789-09",
        "joao@email.com",
        "(11) 91234-5678",
        "01/01/1990",
        "Masculino",
        "Titular",
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, example]);

    ws["!cols"] = headers.map(() => ({ wch: 22 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Beneficiários");
    XLSX.writeFile(wb, "modelo_importacao_beneficiarios.xlsx");
};

export const validateImportRows = (rows: TImportRow[]): TImportRowValidated[] => {
    return rows.map((row, index) => {
        const errors: string[] = [];

        if (!row.cpf || row.cpf.trim() === "") {
            errors.push("CPF obrigatório");
        } else {
            const cpfClean = row.cpf.replace(/\D/g, "");
            if (cpfClean.length < 11) {
                errors.push("CPF incompleto");
            } else if (!validatorCPF(cpfClean)) {
                errors.push("CPF inválido");
            }
        }

        return {
            ...row,
            _errors: errors,
            _hasError: errors.length > 0,
            _rowIndex: index + 1,
        };
    });
};

type TProp = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    rows: TImportRowValidated[];
    isLoading?: boolean;
};

export const ModalImportValidation = ({ isOpen, onClose, onConfirm, rows, isLoading }: TProp) => {
    if (!isOpen) return null;

    const totalRows = rows.length;
    const errorRows = rows.filter((r) => r._hasError).length;
    const validRows = totalRows - errorRows;

    return (
        <div className="import-validation-overlay">
            <div className="import-validation-modal">
                {/* Header */}
                <div className="import-validation-header">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-white">Validação de Importação</h2>
                        <div className="import-validation-badge">
                            {totalRows} {totalRows === 1 ? "registro" : "registros"}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={downloadTemplate}
                            className="import-template-btn"
                            title="Baixar planilha modelo"
                        >
                            <FaDownload size={12} />
                            <span>Baixar modelo</span>
                        </button>
                        <span onClick={onClose} className="import-validation-close">
                            <IoClose size={18} />
                        </span>
                    </div>
                </div>

                {/* Summary bar */}
                <div className="import-validation-summary">
                    <div className="import-summary-item import-summary-valid">
                        <FaCheckCircle size={14} />
                        <span>{validRows} válidos</span>
                    </div>
                    {errorRows > 0 && (
                        <div className="import-summary-item import-summary-error">
                            <FaTimesCircle size={14} />
                            <span>{errorRows} com erro</span>
                        </div>
                    )}
                    {errorRows > 0 && (
                        <div className="import-summary-warning">
                            <FaExclamationTriangle size={12} />
                            <span>Registros com erro serão ignorados na importação</span>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="import-validation-body">
                    <div className="import-validation-table-wrap">
                        <table className="import-validation-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Nome</th>
                                    <th>CPF</th>
                                    <th>E-mail</th>
                                    <th>Telefone</th>
                                    <th>Vínculo</th>
                                    <th>Status / Erros</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr
                                        key={row._rowIndex}
                                        className={row._hasError ? "import-row-error" : "import-row-valid"}
                                    >
                                        <td className="import-td-index">{row._rowIndex}</td>
                                        <td>{row.name || <span className="import-empty">—</span>}</td>
                                        <td>
                                            <span className={row._errors.some(e => e.toLowerCase().includes("cpf")) ? "import-value-error" : ""}>
                                                {row.cpf || <span className="import-empty">—</span>}
                                            </span>
                                        </td>
                                        <td>{row.email || <span className="import-empty">—</span>}</td>
                                        <td>{row.phone || <span className="import-empty">—</span>}</td>
                                        <td>{row.bond || <span className="import-empty">—</span>}</td>
                                        <td>
                                            {row._hasError ? (
                                                <div className="import-error-list">
                                                    {row._errors.map((err, i) => (
                                                        <span key={i} className="import-error-tag">
                                                            <FaTimesCircle size={10} />
                                                            {err}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="import-ok-tag">
                                                    <FaCheckCircle size={10} />
                                                    OK
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="import-validation-footer">
                    <Button
                        type="button"
                        click={onClose}
                        text="Cancelar"
                        theme="primary-light"
                        styleClassBtn=""
                    />
                    <Button
                        type="button"
                        click={onConfirm}
                        text={isLoading ? "Importando..." : `Adicionar${validRows > 0 ? ` (${validRows} registros)` : ""}`}
                        theme="primary"
                        styleClassBtn=""
                    />
                </div>
            </div>
        </div>
    );
};

