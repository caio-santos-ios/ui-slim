import React, { ReactNode } from "react";

interface TableProps {
  children: ReactNode; 
  className?: string; // Optional className for styling
}

interface TableHeaderProps {
  children: ReactNode; // Header row(s)
  className?: string; // Optional className for styling
}

interface TableBodyProps {
  children: ReactNode; // Body row(s)
  className?: string; // Optional className for styling
}

interface TableRowProps {
  children: ReactNode; // Cells (th or td)
  className?: string; // Optional className for styling
}

interface TableCellProps {
  children: ReactNode; 
  isHeader?: boolean; 
  className?: string; 
}

const Table: React.FC<TableProps> = ({ children, className }) => {
  return <table className={`min-w-full tele-table ${className}`}>{children}</table>;
};

const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return <thead className={`slim-table-thead ${className}`}>{children}</thead>;
};

const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={`slim-body-table divide-y ${className}`}>{children}</tbody>;
};

const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
  return <tr className={className}>{children}</tr>;
};

const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className,
}) => {
  const CellTag = isHeader ? "th" : "td";
  return <CellTag className={` ${className}`}>{children}</CellTag>;
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
