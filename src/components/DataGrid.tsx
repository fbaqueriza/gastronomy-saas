'use client'

import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Copy, 
  Clipboard,
  Search
} from 'lucide-react'

interface Column {
  key: string
  name: string
  width?: number
  editable?: boolean
  render?: (value: any, rowData: any) => React.ReactNode
}

interface DataGridProps {
  columns: Column[]
  data: any[]
  onDataChange: (newData: any[]) => void
  onExport?: () => void
  onImport?: (file: File) => void
  onAddRow?: () => void
  onDeleteRows?: (selectedRows: any[]) => void
  searchable?: boolean
  selectable?: boolean
  loading?: boolean
}

export default function SpreadsheetGrid({
  columns,
  data,
  onDataChange,
  onExport,
  onImport,
  onAddRow,
  onDeleteRows,
  searchable = true,
  selectable = true,
  loading = false
}: DataGridProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRows, setSelectedRows] = useState<Set<string>>( new Set())
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnKey: string } | null>(null)
  const [editingValue, setEditingValue] = useState('')

  const columnHelper = createColumnHelper<any>()

  // Create table columns
  const tableColumns = useMemo(() => {
    const cols = columns.map(col => 
      columnHelper.accessor(col.key as any, {
        header: col.name,
        cell: ({ row, column }) => {
          const rowData = row.original;
          const isEditing = editingCell?.rowId === row.id && editingCell?.columnKey === column.id;
          const value = rowData[column.id];

          if (isEditing) {
            return (
              <input
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={() => {
                  const newData = [...data];
                  const rowIndex = newData.findIndex(r => r.id === rowData.id);
                  if (rowIndex !== -1) {
                    newData[rowIndex] = { ...newData[rowIndex], [column.id]: editingValue };
                    onDataChange(newData);
                  }
                  setEditingCell(null);
                  setEditingValue('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const newData = [...data];
                    const rowIndex = newData.findIndex(r => r.id === rowData.id);
                    if (rowIndex !== -1) {
                      newData[rowIndex] = { ...newData[rowIndex], [column.id]: editingValue };
                      onDataChange(newData);
                    }
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
              className={`px-2 py-1 ${col.editable !== false ? 'cursor-pointer hover:bg-gray-100' : ''}`}
              onClick={() => {
                if (col.editable !== false) {
                  setEditingCell({ rowId: row.id, columnKey: column.id });
                  setEditingValue(String(value || ''));
                }
              }}
            >
              {col.render ? col.render(value, rowData) : String(value || '')}
            </div>
          );
        },
        size: col.width || 150,
      })
    )

    if (selectable) {
      cols.unshift(
        columnHelper.accessor('id', {
          id: 'select',
          header: () => (
            <input
              type="checkbox"
              checked={selectedRows.size === data.length && data.length > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedRows(new Set(data.map(row => row.id || row.toString())))
                } else {
                  setSelectedRows(new Set())
                }
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          ),
          cell: ({ row }) => (
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
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          ),
          size: 50,
        })
      )
    }

    return cols
  }, [columns, data, selectedRows, editingCell, editingValue, selectable, onDataChange])

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data
    
    return data.filter(row => 
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [data, searchTerm])

  // Handle copy/paste
  const handleCopy = useCallback(() => {
    const selectedData = filteredData.filter((row) => 
      selectedRows.has(row.id || row.toString())
    )
    
    if (selectedData.length === 0) return
    
    const csvContent = [
      columns.map(col => col.name).join('\t'),
      ...selectedData.map(row => 
        columns.map(col => row[col.key] || '').join('\t')
      )
    ].join('\n')
    
    navigator.clipboard.writeText(csvContent)
  }, [selectedRows, filteredData, columns])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      const rows = text.split('\n').map(row => 
        row.split('\t').reduce((obj, value, idx) => {
          obj[columns[idx]?.key || `col${idx}`] = value
          return obj
        }, {} as any)
      )
      
      // Add pasted rows to data
      const newData = [...data, ...rows]
      onDataChange(newData)
    } catch (error) {
      console.error('Failed to paste data:', error)
    }
  }, [data, columns, onDataChange])

  // Handle file import
  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onImport) {
      onImport(file)
    }
  }, [onImport])

  // Handle delete selected rows
  const handleDeleteSelected = useCallback(() => {
    if (selectedRows.size === 0 || !onDeleteRows) return
    
    const rowsToDelete = filteredData.filter((row) => selectedRows.has(row.id));
    
    onDeleteRows(rowsToDelete)
    setSelectedRows(new Set())
  }, [selectedRows, filteredData, onDeleteRows])

  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
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
                {t('common.add')}
              </button>
            )}
            
            {onDeleteRows && selectedRows.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t('common.delete')} ({selectedRows.size})
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('common.search')}
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
              {t('common.copy')}
            </button>

            <button
              onClick={handlePaste}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Clipboard className="h-4 w-4 mr-1" />
              {t('common.paste')}
            </button>

            {onImport && (
              <label className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                <Upload className="h-4 w-4 mr-1" />
                {t('common.import')}
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
                {t('common.export')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
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
  )
} 