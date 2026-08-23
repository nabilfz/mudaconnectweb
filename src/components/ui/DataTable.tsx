import React from 'react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  accessor?: (row: T) => React.ReactNode;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
  tableLabel?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'Tidak ada data ditemukan.',
  isLoading = false,
  tableLabel = 'Tabel data',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div
        className="w-full bg-white rounded-[18px] border border-[#E2E8F0] p-6 space-y-3 animate-pulse"
        role="status"
        aria-label="Memuat data"
      >
        <div className="h-8 bg-slate-200 rounded-md w-full" />
        <div className="h-8 bg-slate-200 rounded-md w-full" />
        <div className="h-8 bg-slate-200 rounded-md w-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-white rounded-[18px] border border-[#E2E8F0] p-8 text-center text-slate-500 text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-[18px] border border-[#E2E8F0] overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table
          className="w-full text-left text-sm border-collapse min-w-[640px]"
          aria-label={tableLabel}
        >
          <thead>
            <tr className="bg-slate-50 border-b border-[#E2E8F0] text-xs font-bold text-[#172033] uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className={`px-4 py-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {data.map((row) => (
              <tr key={keyExtractor(row)} className="hover:bg-slate-50/80 transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className={`px-4 py-3.5 align-middle text-[#172033] ${col.className || ''}`}>
                    {col.cell
                      ? col.cell(row)
                      : col.accessor
                      ? col.accessor(row)
                      : col.accessorKey
                      ? String(row[col.accessorKey] ?? '')
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
