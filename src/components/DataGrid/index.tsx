'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  Download,
  Upload,
  Plus,
  Trash2,
  Copy,
  Clipboard,
  Search,
} from 'lucide-react';
import { DataGridProps, EditingCell } from './types';
import {
  filterDataBySearchTerm,
  generateCSVContent,
  parsePastedData,
  updateRowData,
} from './utils';

export default function DataGrid({
  columns,
  data,
  onDataChange,
  onExport,
  onImport,
  onAddRow,
  onDeleteRows,
  searchable = true,
  selectable = true,
  loading = false,
}: DataGridProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const columnHelper = createColumnHelper<any>();

  // Create table columns
  const tableColumns = useMemo(() => {
    const cols = columns.map((col) =>
      columnHelper.accessor(col.key as any, {
        header: col.name,
        cell: ({ row, column }) => {
          const rowData = row.original;
          const isEditing =
            editingCell?.rowId === row.id &&
            editingCell?.columnKey === column.id;
          const value = rowData[column.id];

          // If custom render exists, use it for both view and edit mode
          const colDef = columns.find((c) => c.key === column.id);
          if (colDef && typeof colDef.render === 'function') {
            // Support both (value, rowData) and (value, rowData, extra)
            if (colDef.render.length === 3) {
              return colDef.render(
                value,
                rowData,
                {
                  editing: isEditing,
                  setEditingValue: (v: any) => setEditingValue(v),
                  providers: (typeof window !== 'undefined' && (window as any).__GLOBAL_PROVIDERS__) || [],
                  editingCell,
                  setEditingCell,
                  editingValue: isEditing ? editingValue : undefined,
                }
              );
            } else {
              return colDef.render(value, rowData);
            }
          }

          if (isEditing) {
            return (
              <input
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={() => {
                  const newData = updateRowData(
                    data,
                    rowData.id,
                    column.id,
                    editingValue,
                  );
                  onDataChange(newData);
                  setEditingCell(null);
                  setEditingValue('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const newData = updateRowData(
                      data,
                      rowData.id,
                      column.id,
                      editingValue,
                    );
                    onDataChange(newData);
                    setEditingCell(null);
                    setEditingValue('');
                  } else if (e.key === 'Escape') {
                    setEditingCell(null);
                    setEditingValue('');
                  }
                }}
                className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            );
          }

          return (
            <div
              className={`px-2 py-1 ${colDef?.editable !== false ? 'cursor-pointer hover:bg-gray-100' : ''}`}
              onClick={() => {
                console.log('DEBUG: DataGrid cell click', { colDef, value, rowId: row.id, columnId: column.id });
                if (colDef?.editable !== false) {
                  setEditingCell({ rowId: row.id, columnKey: column.id });
                  setEditingValue(String(value || ''));
                }
              }}
            >
              {String(value || '')}
            </div>
          );
        },
        size: col.width || 150,
      }),
    );

    if (selectable) {
      cols.unshift(
        columnHelper.accessor('id', {
          id: 'select',
          header: () => (
            <div className="flex items-center justify-center h-full">
              <input
                type="checkbox"
                checked={selectedRows.size === data.length && data.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRows(
                      new Set(data.map((row) => row.id || row.toString())),
                    );
                  } else {
                    setSelectedRows(new Set());
                  }
                }}
                className="h-5 w-5 text-blue-600 align-middle m-0"
              />
            </div>
          ),
          cell: ({ row }) => (
            <div className="flex items-center justify-center h-full">
              <input
                type="checkbox"
                checked={selectedRows.has(row.original.id)}
                onChange={(e) => {
                  const newSelectedRows = new Set(selectedRows);
                  if (e.target.checked) {
                    newSelectedRows.add(row.original.id);
                  } else {
                    newSelectedRows.delete(row.original.id);
                  }
                  setSelectedRows(newSelectedRows);
                }}
                className="h-5 w-5 text-blue-600 align-middle m-0"
              />
            </div>
          ),
          size: 50,
        }),
      );
    }

    return cols;
  }, [
    columns,
    data,
    selectedRows,
    editingCell,
    editingValue,
    selectable,
    onDataChange,
    columnHelper,
  ]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    return filterDataBySearchTerm(data, searchTerm);
  }, [data, searchTerm]);

  // Handle copy/paste
  const handleCopy = useCallback(() => {
    const csvContent = generateCSVContent(data, columns, selectedRows);
    if (csvContent) {
      navigator.clipboard.writeText(csvContent);
    }
  }, [selectedRows, data, columns]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const rows = parsePastedData(text, columns);

      // Add pasted rows to data
      const newData = [...data, ...rows];
      onDataChange(newData);
    } catch (error) {
      console.error('Failed to paste data:', error);
    }
  }, [data, columns, onDataChange]);

  // Handle file import
  const handleFileImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && onImport) {
        onImport(file);
      }
    },
    [onImport],
  );

  // Handle delete selected rows
  const handleDeleteSelected = useCallback(() => {
    if (selectedRows.size === 0 || !onDeleteRows) return;

    const rowsToDelete = filteredData.filter((row) => selectedRows.has(row.id));

    onDeleteRows(rowsToDelete);
    setSelectedRows(new Set());
  }, [selectedRows, filteredData, onDeleteRows]);

  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            {onAddRow && (
              <button
                onClick={onAddRow}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                {'Agregar'}
              </button>
            )}

            {onDeleteRows && selectedRows.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {'Eliminar'} ({selectedRows.size})
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={'Search'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <button
              onClick={handleCopy}
              disabled={selectedRows.size === 0}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Copy className="h-4 w-4 mr-1" />
              {'common.copy'}
            </button>

            <button
              onClick={handlePaste}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Clipboard className="h-4 w-4 mr-1" />
              {'common.paste'}
            </button>

            {onImport && (
              <label className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                <Upload className="h-4 w-4 mr-1" />
                {'Import'}
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            )}

            {onExport && (
              <button
                onClick={onExport}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-4 w-4 mr-1" />
                {'Export'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <colgroup>
          {table.getAllColumns().map((col, idx) => {
            let width = 150;
            if (col.id === 'select') width = 50;
            else if (col.id === 'acciones') width = 120;
            else if (col.id === 'notes') width = 250;
            else if ((col.columnDef as any).width) width = (col.columnDef as any).width;
            return <col key={col.id} style={{ width }} />;
          })}
        </colgroup>
        <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
                  // Calculate sticky left offset and width
                  let stickyClass = '';
                  let width = 150;
                  if (header.column.id === 'select') width = 50;
                  else if (header.column.id === 'acciones') width = 120;
                  else if (header.column.id === 'notes') width = 250;
                  else if ((header.column.columnDef as any).width) width = (header.column.columnDef as any).width;
                  // Calculate left offset for sticky columns
                  let left = 0;
                  if (index === 0) { stickyClass = 'sticky left-0 z-20 bg-white'; left = 0; }
                  else if (index === 1) { stickyClass = 'sticky z-10 bg-white'; left = 50; }
                  else if (index === 2) { stickyClass = 'sticky z-10 bg-white'; left = 170; }
                  if (index <= 2) stickyClass += ``;
                  return (
                    <th
                      key={header.id}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${stickyClass}`}
                      style={{ width, left: index <= 2 ? left : undefined }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell, index) => {
                  // Calculate sticky left offset and width
                  let stickyClass = '';
                  let width = 150;
                  if (cell.column.id === 'select') width = 50;
                  else if (cell.column.id === 'acciones') width = 120;
                  else if (cell.column.id === 'notes') width = 250;
                  else if ((cell.column.columnDef as any).width) width = (cell.column.columnDef as any).width;
                  // Calculate left offset for sticky columns
                  let left = 0;
                  if (index === 0) { stickyClass = 'sticky left-0 z-20 bg-white'; left = 0; }
                  else if (index === 1) { stickyClass = 'sticky z-10 bg-white'; left = 50; }
                  else if (index === 2) { stickyClass = 'sticky z-10 bg-white'; left = 170; }
                  if (index <= 2) stickyClass += ``;
                  return (
                    <td
                      key={cell.id}
                      className={`px-0.5 py-0 whitespace-normal text-sm text-gray-900 align-middle ${stickyClass}`}
                      style={{ width, left: index <= 2 ? left : undefined }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-sm text-gray-500">
        {filteredData.length} {filteredData.length === 1 ? 'row' : 'rows'}
        {searchTerm && filteredData.length !== data.length && (
          <span> (filtered from {data.length} total)</span>
        )}
      </div>
    </div>
  );
} 